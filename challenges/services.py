from datetime import timedelta

from django.contrib.auth.models import User
from django.db import transaction
from django.utils import timezone

from .ai_generator import generate_challenges_for_user
from .models import (
    Challenge,
    ChallengeCategory,
    ChallengeDifficulty,
    UserChallenge,
    UserChallengeStats,
)
from .validators import validate_challenge_submission


# ============================================================
# CONFIGURATION
# ============================================================

DEFAULT_DAILY_CHALLENGE_COUNT = 5


# ============================================================
# USER STATS
# ============================================================

def get_or_create_user_stats(user):
    """
    Get the user's challenge statistics.
    Creates the stats record if it does not exist.
    """
    stats, _ = UserChallengeStats.objects.get_or_create(
        user=user
    )

    return stats


# ============================================================
# CHALLENGE GENERATION
# ============================================================

def generate_and_save_challenges(user, count=5):
    """
    Generate AI challenges and save them to the database.

    IMPORTANT:
    AI generation happens OUTSIDE a database transaction.

    This prevents SQLite from remaining locked while waiting
    for the Groq API to respond.
    """

    # --------------------------------------------------------
    # Generate challenges using AI.
    # This can take several seconds and must not happen inside
    # transaction.atomic().
    # --------------------------------------------------------

    generated = generate_challenges_for_user(
        user=user,
        count=count,
    )

    if not generated:
        raise ValueError(
            "Unable to generate personalized challenges."
        )

    # --------------------------------------------------------
    # Save the generated challenges.
    #
    # We only use a short transaction for database writes.
    # --------------------------------------------------------

    return save_generated_challenges(generated)


def save_generated_challenges(generated_challenges):
    """
    Convert AI-generated challenge dictionaries into
    Challenge database objects.
    """

    saved_challenges = []

    # Keep the database transaction short.
    with transaction.atomic():

        for data in generated_challenges:

            # ------------------------------------------------
            # Get category
            # ------------------------------------------------

            category_name = (
                data.get("category")
                or data.get("category_name")
                or "Problem Solving"
            )

            category_name = str(category_name).strip()

            try:
                category = ChallengeCategory.objects.get(
                    name__iexact=category_name,
                    is_active=True,
                )
            except ChallengeCategory.DoesNotExist:
                raise ValueError(
                    f"Challenge category '{category_name}' "
                    f"does not exist."
                )

            # ------------------------------------------------
            # Get difficulty
            # ------------------------------------------------

            difficulty_name = (
                data.get("difficulty")
                or data.get("difficulty_name")
                or "Medium"
            )

            difficulty_name = str(difficulty_name).strip()

            try:
                difficulty = ChallengeDifficulty.objects.get(
                    name__iexact=difficulty_name,
                    is_active=True,
                )
            except ChallengeDifficulty.DoesNotExist:
                raise ValueError(
                    f"Challenge difficulty '{difficulty_name}' "
                    f"does not exist."
                )

            # ------------------------------------------------
            # Normalize fields
            # ------------------------------------------------

            title = str(
                data.get("title", "Career Challenge")
            ).strip()

            description = str(
                data.get("description", "")
            ).strip()

            challenge_type = str(
                data.get("challenge_type", "text")
            ).strip()

            evaluation_config = (
                data.get("evaluation_config")
                or {}
            )

            skills = (
                data.get("skills")
                or []
            )

            target_roles = (
                data.get("target_roles")
                or []
            )

            estimated_minutes = data.get(
                "estimated_minutes",
                15,
            )

            instructions = (
                data.get("instructions")
                or []
            )

            resources = (
                data.get("resources")
                or []
            )

            # ------------------------------------------------
            # Safety normalization
            # ------------------------------------------------

            if not isinstance(evaluation_config, dict):
                evaluation_config = {}

            if not isinstance(skills, list):
                skills = [str(skills)]

            if not isinstance(target_roles, list):
                target_roles = [str(target_roles)]

            if not isinstance(instructions, list):
                instructions = [str(instructions)]

            if not isinstance(resources, list):
                resources = [str(resources)]

            try:
                estimated_minutes = int(
                    estimated_minutes
                )
            except (TypeError, ValueError):
                estimated_minutes = 15

            # Prevent unreasonable values.
            estimated_minutes = max(
                5,
                min(estimated_minutes, 180),
            )

            # ------------------------------------------------
            # Create challenge
            # ------------------------------------------------

            challenge = Challenge.objects.create(
                title=title,
                description=description,
                category=category,
                difficulty=difficulty,
                challenge_type=challenge_type,
                evaluation_config=evaluation_config,
                skills=skills,
                target_roles=target_roles,
                estimated_minutes=estimated_minutes,
                instructions=instructions,
                resources=resources,
                is_ai_generated=True,
                is_active=True,
            )

            saved_challenges.append(challenge)

    return saved_challenges


# ============================================================
# DAILY CHALLENGES
# ============================================================

def get_or_create_daily_challenges(
    user,
    challenge_count=DEFAULT_DAILY_CHALLENGE_COUNT,
):
    """
    Get today's challenges.

    If today's challenges already exist, return them immediately.

    If they do not exist:
        1. Generate AI challenges.
        2. Save them.
        3. Create today's assignments.

    IMPORTANT:
    We intentionally DO NOT wrap this entire function in
    transaction.atomic().

    AI generation can take several seconds. Keeping a database
    transaction open during that time causes SQLite database
    locking problems.
    """

    today = timezone.localdate()

    # --------------------------------------------------------
    # 1. Check whether today's challenges already exist.
    # --------------------------------------------------------

    existing_assignments = (
        UserChallenge.objects
        .filter(
            user=user,
            assigned_date=today,
        )
        .select_related(
            "challenge",
            "challenge__category",
            "challenge__difficulty",
        )
        .order_by("id")
    )

    if existing_assignments.exists():
        return list(existing_assignments)

    # --------------------------------------------------------
    # 2. Find challenges the user has already completed.
    #
    # We don't want to give the user the exact same challenge
    # again.
    # --------------------------------------------------------

    completed_challenge_ids = set(
        UserChallenge.objects
        .filter(
            user=user,
            status="completed",
        )
        .values_list(
            "challenge_id",
            flat=True,
        )
    )

    # --------------------------------------------------------
    # 3. Generate new challenges.
    #
    # NO transaction is held while Groq is running.
    # --------------------------------------------------------

    generated_challenges = generate_and_save_challenges(
        user=user,
        count=challenge_count,
    )

    # --------------------------------------------------------
    # 4. Remove challenges the user has already completed.
    # --------------------------------------------------------

    fresh_challenges = [
        challenge
        for challenge in generated_challenges
        if challenge.id not in completed_challenge_ids
    ]

    # --------------------------------------------------------
    # 5. Make sure we generated enough.
    # --------------------------------------------------------

    if len(fresh_challenges) < challenge_count:
        raise ValueError(
            "Unable to generate enough personalized challenges."
        )

    fresh_challenges = fresh_challenges[
        :challenge_count
    ]

    # --------------------------------------------------------
    # 6. Create today's assignments.
    #
    # This transaction is intentionally VERY short.
    # No AI calls happen inside it.
    # --------------------------------------------------------

    assignments = []

    with transaction.atomic():

        for challenge in fresh_challenges:

            assignment = UserChallenge.objects.create(
                user=user,
                challenge=challenge,
                assigned_date=today,
                status="assigned",
            )

            assignments.append(assignment)

    # --------------------------------------------------------
    # 7. Return assignments with related data loaded.
    # --------------------------------------------------------

    assignment_ids = [
        assignment.id
        for assignment in assignments
    ]

    return list(
        UserChallenge.objects
        .filter(id__in=assignment_ids)
        .select_related(
            "challenge",
            "challenge__category",
            "challenge__difficulty",
        )
        .order_by("id")
    )


# ============================================================
# AVAILABLE CHALLENGES
# ============================================================

def get_available_challenges(user):
    """
    Return active challenges that the user has not completed
    and that are not already assigned today.
    """

    today = timezone.localdate()

    completed_ids = UserChallenge.objects.filter(
        user=user,
        status="completed",
    ).values_list(
        "challenge_id",
        flat=True,
    )

    today_ids = UserChallenge.objects.filter(
        user=user,
        assigned_date=today,
    ).values_list(
        "challenge_id",
        flat=True,
    )

    challenges = (
        Challenge.objects
        .filter(is_active=True)
        .exclude(id__in=completed_ids)
        .exclude(id__in=today_ids)
        .select_related(
            "category",
            "difficulty",
        )
        .order_by(
            "difficulty__order",
            "-created_at",
        )
    )

    return challenges


# ============================================================
# START CHALLENGE
# ============================================================

@transaction.atomic
def start_challenge(user, assignment_id):
    """
    Mark a challenge assignment as started.
    """

    assignment = (
        UserChallenge.objects
        .select_for_update()
        .select_related(
            "challenge",
            "challenge__category",
            "challenge__difficulty",
        )
        .get(
            id=assignment_id,
            user=user,
        )
    )

    # --------------------------------------------------------
    # Don't restart a completed challenge.
    # --------------------------------------------------------

    if assignment.status == "completed":
        return assignment

    # --------------------------------------------------------
    # Start only if it hasn't already started.
    # --------------------------------------------------------

    if assignment.status == "assigned":

        assignment.status = "in_progress"
        assignment.started_at = timezone.now()

        assignment.save(
            update_fields=[
                "status",
                "started_at",
            ]
        )

    return assignment


# ============================================================
# COMPLETE CHALLENGE
# ============================================================

@transaction.atomic
def complete_challenge(
    user,
    assignment_id,
    submission_data,
):
    """
    Validate and complete a challenge.
    """

    assignment = (
        UserChallenge.objects
        .select_for_update()
        .select_related(
            "challenge",
            "challenge__difficulty",
        )
        .get(
            id=assignment_id,
            user=user,
        )
    )

    # --------------------------------------------------------
    # Prevent duplicate completion.
    # --------------------------------------------------------

    if assignment.status == "completed":
        stats = get_or_create_user_stats(user)

        return {
            "assignment": assignment,
            "is_valid": True,
            "earned_points": assignment.earned_points,
            "stats": stats,
        }

    # --------------------------------------------------------
    # Validate submission.
    # --------------------------------------------------------

    validation_result = validate_challenge_submission(
        assignment.challenge,
        submission_data,
    )

    # --------------------------------------------------------
    # Support both boolean and dictionary validator results.
    # --------------------------------------------------------

    if isinstance(validation_result, dict):
        is_valid = validation_result.get(
            "valid",
            validation_result.get("is_valid", False),
        )

        validation_data = validation_result

    else:
        is_valid = bool(validation_result)

        validation_data = {
            "valid": is_valid,
            "score": 100 if is_valid else 0,
            "feedback": (
                "Submission received successfully."
                if is_valid
                else "Submission is invalid."
            ),
        }

    # --------------------------------------------------------
    # Failed submission
    # --------------------------------------------------------

    if not is_valid:

        return {
            "assignment": assignment,
            "is_valid": False,
            "earned_points": 0,
            "validation": validation_data,
            "stats": get_or_create_user_stats(user),
        }

    # --------------------------------------------------------
    # Calculate points.
    # --------------------------------------------------------

    points = assignment.challenge.difficulty.points

    # --------------------------------------------------------
    # Complete assignment.
    # --------------------------------------------------------

    assignment.status = "completed"
    assignment.completed_at = timezone.now()
    assignment.earned_points = points
    assignment.completion_data = submission_data or {}

    assignment.save(
        update_fields=[
            "status",
            "completed_at",
            "earned_points",
            "completion_data",
        ]
    )

    # --------------------------------------------------------
    # Update user statistics.
    # --------------------------------------------------------

    stats = update_user_stats(
        user=user,
        points=points,
        completion_date=timezone.localdate(),
    )

    # --------------------------------------------------------
    # Check daily bonus.
    # --------------------------------------------------------

    daily_bonus = award_daily_bonus(
        user=user,
        completion_date=timezone.localdate(),
    )

    return {
        "assignment": assignment,
        "is_valid": True,
        "earned_points": points,
        "validation": validation_data,
        "daily_bonus": daily_bonus,
        "stats": stats,
    }


# ============================================================
# UPDATE USER STATS
# ============================================================

def update_user_stats(
    user,
    points,
    completion_date=None,
):
    """
    Update XP, completed challenge count and streak.
    """

    if completion_date is None:
        completion_date = timezone.localdate()

    stats = get_or_create_user_stats(user)

    stats.total_xp += points
    stats.challenges_completed += 1

    # --------------------------------------------------------
    # Update streak.
    # --------------------------------------------------------

    update_streak(
        stats,
        completion_date,
    )

    stats.last_completed_date = completion_date

    stats.save()

    return stats


# ============================================================
# STREAK
# ============================================================

def update_streak(
    stats,
    completion_date,
):
    """
    Update the user's current and longest streak.
    """

    last_date = stats.last_completed_date

    # --------------------------------------------------------
    # First completed challenge.
    # --------------------------------------------------------

    if last_date is None:

        stats.current_streak = 1

    # --------------------------------------------------------
    # Already completed something today.
    # Don't increase the streak twice.
    # --------------------------------------------------------

    elif last_date == completion_date:

        return

    # --------------------------------------------------------
    # Completed yesterday -> continue streak.
    # --------------------------------------------------------

    elif last_date == (
        completion_date - timedelta(days=1)
    ):

        stats.current_streak += 1

    # --------------------------------------------------------
    # Streak broken.
    # --------------------------------------------------------

    else:

        stats.current_streak = 1

    # --------------------------------------------------------
    # Update longest streak.
    # --------------------------------------------------------

    if stats.current_streak > stats.longest_streak:

        stats.longest_streak = (
            stats.current_streak
        )


# ============================================================
# DAILY BONUS
# ============================================================

def award_daily_bonus(
    user,
    completion_date=None,
):
    """
    Award bonus XP when all of today's challenges
    have been completed.

    Returns the bonus amount awarded.
    """

    if completion_date is None:
        completion_date = timezone.localdate()

    daily_assignments = UserChallenge.objects.filter(
        user=user,
        assigned_date=completion_date,
    )

    if not daily_assignments.exists():
        return 0

    # --------------------------------------------------------
    # Make sure every daily challenge is completed.
    # --------------------------------------------------------

    incomplete_count = daily_assignments.exclude(
        status="completed"
    ).count()

    if incomplete_count > 0:
        return 0

    # --------------------------------------------------------
    # Prevent awarding the bonus multiple times.
    # --------------------------------------------------------

    stats = get_or_create_user_stats(user)

    # If the bonus was already awarded for this date,
    # don't award it again.
    if (
        stats.last_completed_date == completion_date
        and stats.daily_bonus_xp > 0
    ):
        return 0

    # --------------------------------------------------------
    # Daily bonus.
    # --------------------------------------------------------

    bonus_xp = 50

    stats.total_xp += bonus_xp
    stats.daily_bonus_xp = bonus_xp

    stats.save(
        update_fields=[
            "total_xp",
            "daily_bonus_xp",
        ]
    )

    return bonus_xp