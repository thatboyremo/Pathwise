from django.contrib.auth.models import User
from django.db.models import (
    Avg,
    Count,
    Q,
    Sum,
)
from django.db.models.functions import Coalesce

from rest_framework import status
from rest_framework.decorators import (
    api_view,
    permission_classes,
    throttle_classes,
)
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from career_assistant.throttling import AIRateThrottle

from .models import (
    ChallengeCategory,
    ChallengeDifficulty,
    UserChallenge,
)

from .serializers import (
    ChallengeCategorySerializer,
    ChallengeDifficultySerializer,
    ChallengeSerializer,
    UserChallengeSerializer,
    UserChallengeStatsSerializer,
)

from .services import (
    complete_challenge,
    generate_and_save_challenges,
    get_or_create_daily_challenges,
    get_or_create_user_stats,
    start_challenge,
)

from django.db.models import Avg, Count, Q, Sum, FloatField


# =========================================================
# CHALLENGE CATEGORIES
# =========================================================

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def categories_api(request):
    """
    Return all active challenge categories.
    """

    categories = (
        ChallengeCategory.objects
        .filter(is_active=True)
        .order_by("name")
    )

    serializer = ChallengeCategorySerializer(
        categories,
        many=True,
    )

    return Response(
        serializer.data,
        status=status.HTTP_200_OK,
    )


# =========================================================
# CHALLENGE DIFFICULTIES
# =========================================================

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def difficulties_api(request):
    """
    Return all active challenge difficulties.
    """

    difficulties = (
        ChallengeDifficulty.objects
        .filter(is_active=True)
        .order_by("order")
    )

    serializer = ChallengeDifficultySerializer(
        difficulties,
        many=True,
    )

    return Response(
        serializer.data,
        status=status.HTTP_200_OK,
    )


# =========================================================
# TODAY'S CHALLENGES
# =========================================================

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def today_challenges_api(request):
    """
    Return today's personalized challenges.

    Existing assignments are returned if they already
    exist. Otherwise, the service finds or generates
    challenges for the authenticated user.
    """

    try:
        assignments = get_or_create_daily_challenges(
            user=request.user,
        )

    except ValueError as exc:
        return Response(
            {
                "detail": str(exc),
            },
            status=status.HTTP_400_BAD_REQUEST,
        )

    except Exception as exc:
        import traceback

        traceback.print_exc()

        return Response(
            {
                "detail": (
                    "Unable to generate today's "
                    "challenges."
                ),
            },
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )

    serializer = UserChallengeSerializer(
        assignments,
        many=True,
    )

    return Response(
        {
            "date": (
                assignments[0].assigned_date
                if assignments
                else None
            ),
            "count": len(assignments),
            "challenges": serializer.data,
        },
        status=status.HTTP_200_OK,
    )


# =========================================================
# USER CHALLENGE STATS
# =========================================================

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def stats_api(request):
    """
    Return the authenticated user's challenge statistics.
    """

    stats = get_or_create_user_stats(
        request.user,
    )

    serializer = UserChallengeStatsSerializer(
        stats,
    )

    return Response(
        serializer.data,
        status=status.HTTP_200_OK,
    )


# =========================================================
# AI CHALLENGE GENERATION
# =========================================================

@api_view(["POST"])
@permission_classes([IsAuthenticated])
@throttle_classes([AIRateThrottle])
def generate_challenges_api(request):
    """
    Generate personalized AI challenges for the
    authenticated user.

    Primarily useful for development and testing.
    """

    count = request.data.get(
        "count",
        5,
    )

    try:
        count = int(count)

    except (TypeError, ValueError):
        return Response(
            {
                "detail": (
                    "count must be a valid integer."
                ),
            },
            status=status.HTTP_400_BAD_REQUEST,
        )

    # -----------------------------------------------------
    # Protect the AI endpoint
    # -----------------------------------------------------

    if count < 1 or count > 20:
        return Response(
            {
                "detail": (
                    "count must be between "
                    "1 and 20."
                ),
            },
            status=status.HTTP_400_BAD_REQUEST,
        )

    # -----------------------------------------------------
    # Generate challenges
    # -----------------------------------------------------

    try:
        challenges = generate_and_save_challenges(
            user=request.user,
            count=count,
        )

    except ValueError as exc:
        return Response(
            {
                "detail": str(exc),
            },
            status=status.HTTP_400_BAD_REQUEST,
        )

    except Exception:
        return Response(
            {
                "detail": (
                    "Challenge generation failed."
                ),
            },
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )

    # -----------------------------------------------------
    # Serialize generated challenges
    # -----------------------------------------------------

    serializer = ChallengeSerializer(
        challenges,
        many=True,
    )

    return Response(
        {
            "count": len(challenges),
            "challenges": serializer.data,
        },
        status=status.HTTP_201_CREATED,
    )



# ============================================================
# START CHALLENGE
# ============================================================

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def start_challenge_api(request, challenge_id):
    """
    Start a user's challenge assignment.

    The challenge_id in the URL refers to the UserChallenge
    assignment ID, not the Challenge model ID.
    """

    try:
        assignment = start_challenge(
            user=request.user,
            assignment_id=challenge_id,
        )

        return Response(
            {
                "success": True,
                "message": "Challenge started successfully.",
                "challenge": {
                    "id": assignment.id,
                    "challenge_id": assignment.challenge.id,
                    "title": assignment.challenge.title,
                    "description": assignment.challenge.description,
                    "status": assignment.status,
                    "started_at": assignment.started_at,
                    "assigned_date": assignment.assigned_date,
                    "challenge_type": assignment.challenge.challenge_type,
                    "estimated_minutes": assignment.challenge.estimated_minutes,
                    "instructions": assignment.challenge.instructions,
                    "resources": assignment.challenge.resources,
                    "skills": assignment.challenge.skills,
                    "target_roles": assignment.challenge.target_roles,
                    "category": (
                        assignment.challenge.category.name
                        if assignment.challenge.category
                        else None
                    ),
                    "difficulty": (
                        assignment.challenge.difficulty.name
                        if assignment.challenge.difficulty
                        else None
                    ),
                    "points": (
                        assignment.challenge.difficulty.points
                        if assignment.challenge.difficulty
                        else 0
                    ),
                },
            },
            status=status.HTTP_200_OK,
        )

    except UserChallenge.DoesNotExist:
        return Response(
            {
                "success": False,
                "message": "Challenge assignment not found.",
            },
            status=status.HTTP_404_NOT_FOUND,
        )

    except Exception:
        return Response(
            {
                "success": False,
                "message": "Unable to start challenge.",
            },
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


# =========================================================
# COMPLETE CHALLENGE
# =========================================================

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def complete_challenge_api(
    request,
    challenge_id,
):
    """
    Validate and complete a user's challenge assignment.

    The challenge_id in the URL refers to the UserChallenge
    assignment ID, not the Challenge model ID.

    XP is awarded only when the submission passes validation.
    """

    # -----------------------------------------------------
    # Submitted completion data
    # -----------------------------------------------------

    completion_data = request.data

    # -----------------------------------------------------
    # Complete challenge
    # -----------------------------------------------------

    try:
        result = complete_challenge(
            user=request.user,
            assignment_id=challenge_id,
            submission_data=completion_data,
        )

    except UserChallenge.DoesNotExist:
        return Response(
            {
                "success": False,
                "detail": "Challenge assignment not found.",
            },
            status=status.HTTP_404_NOT_FOUND,
        )

    except ValueError as exc:
        return Response(
            {
                "success": False,
                "detail": str(exc),
            },
            status=status.HTTP_400_BAD_REQUEST,
        )

    except Exception as exc:
        import traceback

        traceback.print_exc()

        return Response(
            {
                "success": False,
                "detail": "Unable to complete challenge.",
            },
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )

    # -----------------------------------------------------
    # Extract result
    # -----------------------------------------------------

    assignment = result["assignment"]
    stats = result["stats"]

    is_valid = result.get(
        "is_valid",
        False,
    )

    earned_points = result.get(
        "earned_points",
        0,
    )

    validation = result.get(
        "validation",
        {
            "is_valid": is_valid,
        },
    )

    daily_bonus = result.get(
        "daily_bonus",
        0,
    )

    # -----------------------------------------------------
    # Validation failed
    # -----------------------------------------------------

    if not is_valid:
        assignment_serializer = UserChallengeSerializer(
            assignment,
        )

        return Response(
            {
                "success": False,

                "challenge": (
                    assignment_serializer.data
                ),

                "validation": validation,

                "xp_earned": 0,

                "daily_bonus_awarded": False,

                "daily_bonus_xp": 0,

                "already_completed": False,
            },
            status=status.HTTP_400_BAD_REQUEST,
        )

    # -----------------------------------------------------
    # Successful completion
    # -----------------------------------------------------

    assignment_serializer = UserChallengeSerializer(
        assignment,
    )

    stats_serializer = UserChallengeStatsSerializer(
        stats,
    )

    return Response(
        {
            "success": True,

            "challenge": (
                assignment_serializer.data
            ),

            "validation": validation,

            "stats": stats_serializer.data,

            "xp_earned": earned_points,

            "daily_bonus_awarded": (
                daily_bonus > 0
            ),

            "daily_bonus_xp": daily_bonus,

            "already_completed": False,
        },
        status=status.HTTP_200_OK,
    )

# =========================================================
# CHALLENGE-SPECIFIC LEADERBOARD
# =========================================================

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def challenge_leaderboard_api(
    request,
    challenge_id,
):
    """
    Return the leaderboard for a specific challenge.

    Example:
        GET /api/challenges/5/leaderboard/
    """

    # -----------------------------------------------------
    # Get completed submissions for this challenge
    # -----------------------------------------------------

    assignments = (
        UserChallenge.objects
        .filter(
            challenge_id=challenge_id,
            status="completed",
        )
        .select_related("user")
        .order_by(
            "-earned_points",
            "completed_at",
            "id",
        )
    )

    # -----------------------------------------------------
    # Build leaderboard
    # -----------------------------------------------------

    leaderboard = []

    for index, assignment in enumerate(
        assignments,
        start=1,
    ):
        user = assignment.user

        full_name = (
            user.get_full_name().strip()
            if user.get_full_name()
            else ""
        )

        name = (
            full_name
            or user.username
        )

        leaderboard.append({
            "rank": index,

            "user_id": user.id,

            "username": user.username,

            "name": name,

            "avatar": None,

            "score": (
                assignment.earned_points
                or 0
            ),

            "xp": (
                assignment.earned_points
                or 0
            ),

            "status": assignment.status,

            "completed_at": (
                assignment.completed_at
                if assignment.completed_at
                else None
            ),

            "is_current_user": (
                user.id == request.user.id
            ),
        })

    # -----------------------------------------------------
    # Find current user's position
    # -----------------------------------------------------

    current_user = next(
        (
            item
            for item in leaderboard
            if item["is_current_user"]
        ),
        None,
    )

    # -----------------------------------------------------
    # Response
    # -----------------------------------------------------

    return Response(
        {
            "challenge_id": challenge_id,

            "leaderboard": leaderboard,

            "current_user": current_user,
        },
        status=status.HTTP_200_OK,
    )


# =========================================================
# OVERALL LEADERBOARD
# =========================================================

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def overall_leaderboard_api(request):
    """
    Return the overall leaderboard across
    all completed challenges.

    Example:
        GET /api/challenges/leaderboard/
    """

    # -----------------------------------------------------
    # Aggregate user performance
    # -----------------------------------------------------

    users = (
        User.objects
        .annotate(
            total_xp=Coalesce(
                Sum(
                    "challenge_assignments__earned_points",
                    filter=Q(
                        challenge_assignments__status=(
                            "completed"
                        )
                    ),
                ),
                0,
            ),

            challenges_completed=Count(
                "challenge_assignments",
                filter=Q(
                    challenge_assignments__status=(
                        "completed"
                    )
                ),
            ),

            average_score=Coalesce(
                Avg(
                    "challenge_assignments__earned_points",
                    filter=Q(
                        challenge_assignments__status=(
                            "completed"
                        )
                    ),
                ),
                0.0,
                output_field=FloatField(),
            ),
        )
        .order_by(
            "-total_xp",
            "-average_score",
            "username",
        )
    )

    # -----------------------------------------------------
    # Build leaderboard
    # -----------------------------------------------------

    leaderboard = []

    for index, user in enumerate(
        users,
        start=1,
    ):
        leaderboard.append({
            "rank": index,

            "user_id": user.id,

            "username": user.username,

            "name": (
                user.get_full_name().strip()
                if user.get_full_name()
                else user.username
            ),

            "avatar": None,

            "xp": (
                user.total_xp
                or 0
            ),

            "score": round(
                user.average_score
                or 0
            ),

            "challenges_completed": (
                user.challenges_completed
                or 0
            ),

            "streak": 0,

            "is_current_user": (
                user.id == request.user.id
            ),
        })

    # -----------------------------------------------------
    # Find current user
    # -----------------------------------------------------

    current_user = next(
        (
            item
            for item in leaderboard
            if item["is_current_user"]
        ),
        None,
    )

    # -----------------------------------------------------
    # Response
    # -----------------------------------------------------

    return Response(
        {
            "leaderboard": leaderboard,

            "current_user": current_user,
        },
        status=status.HTTP_200_OK,
    )