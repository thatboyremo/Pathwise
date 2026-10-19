import json

from django.conf import settings
from groq import Groq

from users.models import (
    UserProfile,
    Skill,
    Experience,
    Education,
    Project,
)

from .models import (
    ChallengeCategory,
    ChallengeDifficulty,
    UserChallenge,
)


# =========================================================
# CONFIGURATION
# =========================================================

DEFAULT_MODEL = "openai/gpt-oss-20b"

CHALLENGE_TYPES = [
    "open_ended",
    "quiz",
    "coding",
    "sql",
    "project",
    "interview",
    "learning",
]

MAX_GENERATION_ATTEMPTS = 3

# Keep AI completions reasonably small.
MAX_COMPLETION_TOKENS = 1200


# =========================================================
# AI CLIENT
# =========================================================

def get_ai_client():
    """
    Create and return the Groq client.
    """

    api_key = getattr(
        settings,
        "GROQ_API_KEY",
        None,
    )

    if not api_key:
        raise ValueError(
            "GROQ_API_KEY is not configured."
        )

    return Groq(
        api_key=api_key,
    )


# =========================================================
# USER CAREER CONTEXT
# =========================================================

def get_user_career_context(user):
    """
    Collect the user's existing career information.

    All personalization comes from the database.
    Nothing about the user's career is hardcoded.
    """

    profile = (
        UserProfile.objects
        .filter(user=user)
        .first()
    )

    skills = list(
        Skill.objects
        .filter(user=user)
        .values(
            "name",
            "level",
            "category",
        )
    )

    experiences = list(
        Experience.objects
        .filter(user=user)
        .values(
            "role",
            "company",
            "period",
            "description",
        )
    )

    education = list(
        Education.objects
        .filter(user=user)
        .values(
            "degree",
            "institution",
            "field",
            "period",
            "grade",
        )
    )

    projects = list(
        Project.objects
        .filter(user=user)
        .values(
            "name",
            "description",
            "technologies",
        )
    )

    return {
        "profile": {
            "target_role": (
                profile.target_role
                if profile
                else ""
            ),
            "career_goal": (
                profile.career_goal
                if profile
                else ""
            ),
            "years_experience": (
                profile.years_experience
                if profile
                else 0
            ),
            "work_preference": (
                profile.work_preference
                if profile
                else ""
            ),
            "bio": (
                profile.bio
                if profile
                else ""
            ),
        },

        "skills": skills,

        "experience": experiences,

        "education": education,

        "projects": projects,
    }


# =========================================================
# USER CHALLENGE HISTORY
# =========================================================

def get_user_previous_challenge_titles(
    user,
    limit=15,
):
    """
    Get recent challenges already assigned to the user.

    A smaller history keeps the AI prompt compact while
    still providing enough information to avoid repetition.
    """

    assignments = (
        UserChallenge.objects
        .filter(
            user=user,
        )
        .select_related(
            "challenge",
        )
        .order_by(
            "-assigned_date",
            "-id",
        )[:limit]
    )

    return [
        assignment.challenge.title
        for assignment in assignments
        if assignment.challenge
    ]


# =========================================================
# AVAILABLE CATEGORIES
# =========================================================

def get_available_categories():
    """
    Get active challenge categories from the database.
    """

    return list(
        ChallengeCategory.objects
        .filter(
            is_active=True,
        )
        .values_list(
            "name",
            flat=True,
        )
    )


# =========================================================
# AVAILABLE DIFFICULTIES
# =========================================================

def get_available_difficulties():
    """
    Get active challenge difficulties.

    XP / points are never controlled by the AI.
    """

    return list(
        ChallengeDifficulty.objects
        .filter(
            is_active=True,
        )
        .values(
            "name",
            "order",
        )
    )


# =========================================================
# BUILD PROMPT
# =========================================================

def build_generation_prompt(
    context,
    categories,
    difficulty_names,
    count,
    previous_titles=None,
):
    """
    Build a compact Groq prompt for personalized
    career challenge generation.

    The prompt is intentionally concise so that the
    request stays comfortably within Groq token limits.
    """

    previous_titles = previous_titles or []

    # -----------------------------------------------------
    # Keep user context compact
    # -----------------------------------------------------

    compact_context = {
        "profile": context.get(
            "profile",
            {},
        ),

        "skills": context.get(
            "skills",
            [],
        )[:12],

        "experience": context.get(
            "experience",
            [],
        )[:5],

        "education": context.get(
            "education",
            [],
        )[:3],

        "projects": context.get(
            "projects",
            [],
        )[:5],
    }

    # -----------------------------------------------------
    # Previous challenges
    # -----------------------------------------------------

    previous_section = ""

    if previous_titles:

        previous_section = f"""
PREVIOUS CHALLENGES TO AVOID:
{json.dumps(
    previous_titles[-15:],
    ensure_ascii=False,
)}
"""

    # -----------------------------------------------------
    # Prompt
    # -----------------------------------------------------

    return f"""
You are a personalized career-development AI.

Create exactly {count} practical career challenge(s)
for this user.

USER PROFILE:
{json.dumps(
    compact_context,
    ensure_ascii=False,
    default=str,
)}

AVAILABLE CATEGORIES:
{json.dumps(
    categories,
    ensure_ascii=False,
)}

AVAILABLE DIFFICULTIES:
{json.dumps(
    difficulty_names,
    ensure_ascii=False,
)}

AVAILABLE CHALLENGE TYPES:
{json.dumps(
    CHALLENGE_TYPES,
    ensure_ascii=False,
)}

{previous_section}

RULES:

1. Personalize each challenge using the user's
   target role, career goal, skills, experience,
   education and projects.

2. Make challenges practical and employment-focused.

3. Match difficulty to the user's experience.

4. Avoid repeating previous challenges.

5. Category MUST exactly match an available category.

6. Difficulty MUST exactly match an available difficulty.

7. challenge_type MUST exactly match an available type.

8. Do not generate XP or points.

9. Keep descriptions and instructions concise.

10. Return ONLY valid JSON.

11. Use exactly this structure:

{{
  "challenges": [
    {{
      "title": "Short challenge title",

      "description": "Clear practical description",

      "category": "Exact category",

      "difficulty": "Exact difficulty",

      "challenge_type": "coding",

      "evaluation_config": {{
        "evaluation_method": "ai",
        "criteria": [
          "correctness",
          "logic",
          "code_quality"
        ]
      }},

      "skills": [
        "Python",
        "SQL"
      ],

      "target_roles": [
        "Data Scientist"
      ],

      "estimated_minutes": 30,

      "instructions": [
        "Step 1",
        "Step 2",
        "Step 3"
      ],

      "resources": []
    }}
  ]
}}

Generate exactly {count} challenge(s).
"""


# =========================================================
# CALL GROQ
# =========================================================

def call_groq(prompt):
    """
    Send a generation request to Groq.
    """

    client = get_ai_client()

    model = getattr(
        settings,
        "GROQ_MODEL",
        DEFAULT_MODEL,
    )

    response = client.chat.completions.create(
        model=model,

        messages=[
            {
                "role": "system",
                "content": (
                    "Generate structured career "
                    "challenges. Return ONLY valid JSON."
                ),
            },
            {
                "role": "user",
                "content": prompt,
            },
        ],

        temperature=0.7,

        # Prevent unnecessarily large completions.
        max_completion_tokens=MAX_COMPLETION_TOKENS,

        response_format={
            "type": "json_object",
        },
    )

    content = (
        response
        .choices[0]
        .message
        .content
    )

    if not content:
        raise ValueError(
            "Groq returned an empty response."
        )

    return content.strip()


# =========================================================
# GENERATE CHALLENGES
# =========================================================

def generate_challenges_for_user(
    user,
    count=5,
):
    """
    Generate personalized career challenges using Groq.

    Challenges are generated one at a time instead of
    requesting all 5 in one large request.

    This keeps each Groq request small and avoids
    token-per-minute/request-size failures.
    """

    if count < 1:
        raise ValueError(
            "Challenge count must be at least 1."
        )

    # =====================================================
    # USER CAREER CONTEXT
    # =====================================================

    context = get_user_career_context(
        user
    )

    # =====================================================
    # DATABASE OPTIONS
    # =====================================================

    categories = get_available_categories()

    difficulties = get_available_difficulties()

    if not categories:
        raise ValueError(
            "No active challenge categories exist."
        )

    if not difficulties:
        raise ValueError(
            "No active challenge difficulties exist."
        )

    difficulty_names = [
        difficulty["name"]
        for difficulty in difficulties
    ]

    # =====================================================
    # USER CHALLENGE HISTORY
    # =====================================================

    previous_titles = (
        get_user_previous_challenge_titles(
            user=user,
            limit=15,
        )
    )

    # =====================================================
    # GENERATION STATE
    # =====================================================

    valid_challenges = []

    generated_titles = []

    # =====================================================
    # GENERATE ONE CHALLENGE AT A TIME
    # =====================================================

    for challenge_number in range(
        1,
        count + 1,
    ):

        challenge_created = False

        # -------------------------------------------------
        # Retry individual challenge when necessary
        # -------------------------------------------------

        for attempt in range(
            1,
            MAX_GENERATION_ATTEMPTS + 1,
        ):

            titles_to_avoid = list(
                dict.fromkeys(
                    previous_titles
                    + generated_titles
                )
            )

            # -------------------------------------------------
            # Build compact prompt
            # -------------------------------------------------

            prompt = build_generation_prompt(
                context=context,
                categories=categories,
                difficulty_names=difficulty_names,
                count=1,
                previous_titles=titles_to_avoid,
            )

            try:

                raw_text = call_groq(
                    prompt
                )

                generated = parse_generated_challenges(
                    raw_text=raw_text,
                    categories=categories,
                    difficulties=difficulty_names,
                    challenge_types=CHALLENGE_TYPES,
                )

            except Exception as exc:

                print(
                    f"Challenge "
                    f"{challenge_number} "
                    f"attempt "
                    f"{attempt} "
                    f"failed: "
                    f"{exc}"
                )

                if attempt == MAX_GENERATION_ATTEMPTS:

                    raise ValueError(
                        "Unable to generate challenge "
                        f"{challenge_number} after "
                        f"{MAX_GENERATION_ATTEMPTS} attempts. "
                        f"Last error: {exc}"
                    ) from exc

                continue

            # =================================================
            # PREVENT DUPLICATES
            # =================================================

            existing_titles = {
                title.strip().lower()
                for title in titles_to_avoid
            }

            selected_challenge = None

            for challenge in generated:

                normalized_title = (
                    challenge["title"]
                    .strip()
                    .lower()
                )

                if normalized_title in existing_titles:
                    continue

                selected_challenge = challenge
                break

            # -------------------------------------------------
            # No unique challenge returned
            # -------------------------------------------------

            if selected_challenge is None:

                print(
                    f"Challenge "
                    f"{challenge_number} "
                    f"attempt "
                    f"{attempt} "
                    f"returned a duplicate."
                )

                continue

            # =================================================
            # STORE VALID CHALLENGE
            # =================================================

            valid_challenges.append(
                selected_challenge
            )

            generated_titles.append(
                selected_challenge["title"]
            )

            challenge_created = True

            print(
                f"Generated challenge "
                f"{challenge_number}/{count}: "
                f"{selected_challenge['title']}"
            )

            break

        # -----------------------------------------------------
        # Challenge could not be generated
        # -----------------------------------------------------

        if not challenge_created:

            raise ValueError(
                f"Unable to generate challenge "
                f"{challenge_number}."
            )

    # =====================================================
    # FINAL VALIDATION
    # =====================================================

    if len(valid_challenges) < count:

        raise ValueError(
            f"AI generated only "
            f"{len(valid_challenges)} valid "
            f"challenges out of {count} requested."
        )

    return valid_challenges[:count]


# =========================================================
# PARSE AI RESPONSE
# =========================================================

def parse_generated_challenges(
    raw_text,
    categories,
    difficulties,
    challenge_types,
):
    """
    Parse and validate the AI response.

    Invalid challenges are rejected rather than being
    inserted into the database.
    """

    cleaned = raw_text.strip()

    # =====================================================
    # REMOVE ACCIDENTAL MARKDOWN FENCES
    # =====================================================

    if cleaned.startswith("```"):

        if cleaned.startswith(
            "```json"
        ):

            cleaned = cleaned[
                len("```json"):
            ]

        elif cleaned.startswith(
            "```"
        ):

            cleaned = cleaned[
                len("```"):
            ]

        if cleaned.endswith(
            "```"
        ):

            cleaned = cleaned[
                :-3
            ]

        cleaned = cleaned.strip()

    # =====================================================
    # PARSE JSON
    # =====================================================

    try:

        data = json.loads(
            cleaned
        )

    except json.JSONDecodeError as exc:

        raise ValueError(
            "AI returned invalid JSON."
        ) from exc

    # =====================================================
    # ROOT VALIDATION
    # =====================================================

    if not isinstance(
        data,
        dict,
    ):

        raise ValueError(
            "AI response must be a JSON object."
        )

    generated = data.get(
        "challenges"
    )

    if not isinstance(
        generated,
        list,
    ):

        raise ValueError(
            "AI response does not contain a valid "
            "'challenges' list."
        )

    if not generated:

        raise ValueError(
            "AI returned an empty challenges list."
        )

    validated = []

    rejection_reasons = []

    # =====================================================
    # VALIDATE EACH CHALLENGE
    # =====================================================

    for index, item in enumerate(
        generated,
        start=1,
    ):

        if not isinstance(
            item,
            dict,
        ):

            rejection_reasons.append(
                f"Challenge {index}: "
                "not an object."
            )

            continue

        # =================================================
        # BASIC FIELDS
        # =================================================

        title = str(
            item.get(
                "title",
                "",
            )
        ).strip()

        description = str(
            item.get(
                "description",
                "",
            )
        ).strip()

        category = str(
            item.get(
                "category",
                "",
            )
        ).strip()

        difficulty = str(
            item.get(
                "difficulty",
                "",
            )
        ).strip()

        challenge_type = str(
            item.get(
                "challenge_type",
                "",
            )
        ).strip()

        # =================================================
        # REQUIRED FIELDS
        # =================================================

        if not title:

            rejection_reasons.append(
                f"Challenge {index}: "
                "missing title."
            )

            continue

        if not description:

            rejection_reasons.append(
                f"Challenge {index}: "
                "missing description."
            )

            continue

        # =================================================
        # CATEGORY
        # =================================================

        if category not in categories:

            rejection_reasons.append(
                f"Challenge {index}: "
                f"invalid category "
                f"{category!r}."
            )

            continue

        # =================================================
        # DIFFICULTY
        # =================================================

        if difficulty not in difficulties:

            rejection_reasons.append(
                f"Challenge {index}: "
                f"invalid difficulty "
                f"{difficulty!r}."
            )

            continue

        # =================================================
        # CHALLENGE TYPE
        # =================================================

        if challenge_type not in challenge_types:

            rejection_reasons.append(
                f"Challenge {index}: "
                f"invalid challenge_type "
                f"{challenge_type!r}."
            )

            continue

        # =================================================
        # SKILLS
        # =================================================

        skills = item.get(
            "skills",
            [],
        )

        if not isinstance(
            skills,
            list,
        ):

            skills = []

        skills = [
            str(skill).strip()
            for skill in skills
            if str(skill).strip()
        ]

        # =================================================
        # TARGET ROLES
        # =================================================

        target_roles = item.get(
            "target_roles",
            [],
        )

        if not isinstance(
            target_roles,
            list,
        ):

            target_roles = []

        target_roles = [
            str(role).strip()
            for role in target_roles
            if str(role).strip()
        ]

        # =================================================
        # INSTRUCTIONS
        # =================================================

        instructions = item.get(
            "instructions",
            [],
        )

        if not isinstance(
            instructions,
            list,
        ):

            instructions = []

        instructions = [
            str(instruction).strip()
            for instruction in instructions
            if str(instruction).strip()
        ]

        # =================================================
        # RESOURCES
        # =================================================

        resources = item.get(
            "resources",
            [],
        )

        if not isinstance(
            resources,
            list,
        ):

            resources = []

        resources = [
            resource
            for resource in resources
            if isinstance(
                resource,
                (str, dict),
            )
        ]

        # =================================================
        # EVALUATION CONFIGURATION
        # =================================================

        evaluation_config = item.get(
            "evaluation_config",
            {},
        )

        if not isinstance(
            evaluation_config,
            dict,
        ):

            evaluation_config = {}

        # =================================================
        # EVALUATION METHOD
        # =================================================

        evaluation_method = (
            evaluation_config.get(
                "evaluation_method",
                "ai",
            )
        )

        evaluation_method = str(
            evaluation_method
        ).strip()

        evaluation_config[
            "evaluation_method"
        ] = evaluation_method

        # =================================================
        # ESTIMATED MINUTES
        # =================================================

        estimated_minutes = item.get(
            "estimated_minutes",
            30,
        )

        try:

            estimated_minutes = int(
                estimated_minutes
            )

        except (
            TypeError,
            ValueError,
        ):

            estimated_minutes = 30

        estimated_minutes = max(
            5,
            min(
                estimated_minutes,
                480,
            ),
        )

        # =================================================
        # BUILD VALIDATED CHALLENGE
        # =================================================

        validated.append(
            {
                "title": title,

                "description": description,

                "category": category,

                "difficulty": difficulty,

                "challenge_type": (
                    challenge_type
                ),

                "evaluation_config": (
                    evaluation_config
                ),

                "skills": skills,

                "target_roles": target_roles,

                "estimated_minutes": (
                    estimated_minutes
                ),

                "instructions": instructions,

                "resources": resources,
            }
        )

    # =====================================================
    # DEBUG INFORMATION
    # =====================================================

    if rejection_reasons:

        print(
            "\nAI CHALLENGE VALIDATION:"
        )

        for reason in rejection_reasons:

            print(
                f"  - {reason}"
            )

        print(
            f"Valid challenges: "
            f"{len(validated)}"
        )

    # =====================================================
    # FINAL VALIDATION
    # =====================================================

    if not validated:

        raise ValueError(
            "AI did not generate any valid challenges."
        )

    return validated