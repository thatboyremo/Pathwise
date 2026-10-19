import json
from typing import Any

from django.conf import settings
from groq import Groq


# =========================================================
# CONFIGURATION
# =========================================================

DEFAULT_MODEL = "openai/gpt-oss-20b"

MAX_EVALUATION_TOKENS = 700


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
# VALIDATION RESULT
# =========================================================

def validation_result(
    valid: bool,
    feedback: str,
    score: int = 0,
):
    """
    Return a consistent validation response.
    """

    return {
        "is_valid": bool(valid),
        "score": max(
            0,
            min(int(score), 100),
        ),
        "feedback": feedback,
    }


# =========================================================
# BASIC SUBMISSION VALIDATION
# =========================================================

def validate_basic_submission(
    answer: Any,
):
    """
    Basic validation before AI evaluation.

    This only checks whether a usable submission exists.
    It does NOT assign a performance score.
    """

    # -----------------------------------------------------
    # No submission
    # -----------------------------------------------------

    if answer is None:

        return validation_result(
            valid=False,
            score=0,
            feedback=(
                "No submission was provided. "
                "Please submit your answer before "
                "completing the challenge."
            ),
        )

    # -----------------------------------------------------
    # String submission
    # -----------------------------------------------------

    if isinstance(answer, str):

        answer = answer.strip()

        if not answer:

            return validation_result(
                valid=False,
                score=0,
                feedback=(
                    "Your submission is empty. "
                    "Please provide an answer."
                ),
            )

        if len(answer) < 10:

            return validation_result(
                valid=False,
                score=0,
                feedback=(
                    "Your submission is too short. "
                    "Provide more detail before "
                    "submitting."
                ),
            )

        return validation_result(
            valid=True,
            score=0,
            feedback="Submission is ready for evaluation.",
        )

    # -----------------------------------------------------
    # List / dictionary submission
    # -----------------------------------------------------

    if isinstance(answer, (list, dict)):

        if not answer:

            return validation_result(
                valid=False,
                score=0,
                feedback=(
                    "Your submission is empty."
                ),
            )

        return validation_result(
            valid=True,
            score=0,
            feedback="Submission is ready for evaluation.",
        )

    # -----------------------------------------------------
    # Unsupported submission type
    # -----------------------------------------------------

    return validation_result(
        valid=False,
        score=0,
        feedback=(
            "Unsupported submission format."
        ),
    )


# =========================================================
# FORMAT SUBMISSION
# =========================================================

def format_submission(submission):
    """
    Convert the user's submission into readable text
    for the AI evaluator.
    """

    if isinstance(submission, str):
        return submission.strip()

    try:
        return json.dumps(
            submission,
            ensure_ascii=False,
            indent=2,
            default=str,
        )
    except (TypeError, ValueError):
        return str(submission)


# =========================================================
# AI EVALUATION
# =========================================================

def evaluate_submission_with_ai(
    challenge,
    submission,
):
    """
    Evaluate a challenge submission using Groq.

    The AI evaluates the actual quality of the submission
    against the challenge and its evaluation criteria.

    Returns:
        {
            "score": 0-100,
            "feedback": "...",
            "strengths": [...],
            "improvements": [...]
        }
    """

    evaluation_config = (
        challenge.evaluation_config
        if isinstance(
            challenge.evaluation_config,
            dict,
        )
        else {}
    )

    criteria = evaluation_config.get(
        "criteria",
        [],
    )

    if not isinstance(criteria, list):
        criteria = []

    criteria = [
        str(criteria_item).strip()
        for criteria_item in criteria
        if str(criteria_item).strip()
    ]

    skills = (
        challenge.skills
        if isinstance(
            challenge.skills,
            list,
        )
        else []
    )

    instructions = (
        challenge.instructions
        if isinstance(
            challenge.instructions,
            list,
        )
        else []
    )

    submission_text = format_submission(
        submission
    )

    prompt = f"""
You are an expert career-development evaluator.

Evaluate the user's submission to the challenge below.

CHALLENGE:
Title:
{challenge.title}

Description:
{challenge.description}

Challenge Type:
{challenge.challenge_type}

Skills:
{json.dumps(skills, ensure_ascii=False)}

Instructions:
{json.dumps(instructions, ensure_ascii=False)}

EVALUATION CRITERIA:
{json.dumps(criteria, ensure_ascii=False)}

USER SUBMISSION:
{submission_text}

EVALUATION RULES:

1. Evaluate the actual quality of the submission.
2. Do NOT give 100 simply because the user submitted something.
3. Give a score from 0 to 100.
4. Judge correctness, relevance, reasoning, completeness,
   clarity, and technical quality where applicable.
5. Use the provided evaluation criteria as the main
   scoring guide.
6. Consider the challenge type when evaluating.
7. For coding or SQL challenges, evaluate the actual
   solution, logic, correctness, and code quality.
8. For open-ended or career challenges, evaluate the
   quality, depth, reasoning, and practicality of the answer.
9. For interview challenges, evaluate clarity, relevance,
   structure, confidence, and quality of reasoning.
10. Be fair. Do not penalize the user for minor wording
    or grammar mistakes when the underlying answer is correct.
11. Do not invent requirements that are not present in
    the challenge.
12. If the answer is partially correct, give partial credit.
13. If the answer is excellent, it may receive 90-100.
14. If the answer is good but has noticeable gaps,
    use approximately 70-89.
15. If the answer is weak or incomplete, use approximately
    40-69.
16. If the answer demonstrates very little understanding,
    use 1-39.
17. Return ONLY valid JSON.

Return exactly this structure:

{{
    "score": 0,
    "feedback": "Clear explanation of the submission quality.",
    "strengths": [
        "Strength 1",
        "Strength 2"
    ],
    "improvements": [
        "Improvement 1",
        "Improvement 2"
    ]
}}
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
                    "You are a fair and rigorous career "
                    "challenge evaluator. "
                    "Return ONLY valid JSON."
                ),
            },
            {
                "role": "user",
                "content": prompt,
            },
        ],
        temperature=0.2,
        max_completion_tokens=MAX_EVALUATION_TOKENS,
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
            "AI evaluator returned an empty response."
        )

    try:

        result = json.loads(
            content.strip()
        )

    except json.JSONDecodeError as exc:

        raise ValueError(
            "AI evaluator returned invalid JSON."
        ) from exc

    # -----------------------------------------------------
    # Score
    # -----------------------------------------------------

    try:

        score = int(
            result.get(
                "score",
                0,
            )
        )

    except (
        TypeError,
        ValueError,
    ):

        score = 0

    score = max(
        0,
        min(score, 100),
    )

    # -----------------------------------------------------
    # Feedback
    # -----------------------------------------------------

    feedback = str(
        result.get(
            "feedback",
            "Submission evaluated.",
        )
    ).strip()

    if not feedback:

        feedback = "Submission evaluated."

    # -----------------------------------------------------
    # Strengths
    # -----------------------------------------------------

    strengths = result.get(
        "strengths",
        [],
    )

    if not isinstance(
        strengths,
        list,
    ):
        strengths = []

    strengths = [
        str(item).strip()
        for item in strengths
        if str(item).strip()
    ]

    # -----------------------------------------------------
    # Improvements
    # -----------------------------------------------------

    improvements = result.get(
        "improvements",
        [],
    )

    if not isinstance(
        improvements,
        list,
    ):
        improvements = []

    improvements = [
        str(item).strip()
        for item in improvements
        if str(item).strip()
    ]

    return {
        "score": score,
        "feedback": feedback,
        "strengths": strengths,
        "improvements": improvements,
    }


# =========================================================
# CHALLENGE VALIDATION
# =========================================================

def validate_challenge_submission(
    challenge,
    submission,
):
    """
    Validate and evaluate a challenge submission.

    Basic validation happens first.

    If the submission is valid, Groq evaluates its quality
    and produces a performance score from 0-100.
    """

    # -----------------------------------------------------
    # Basic validation
    # -----------------------------------------------------

    basic_result = validate_basic_submission(
        submission
    )

    if not basic_result["is_valid"]:

        return basic_result

    # -----------------------------------------------------
    # Get challenge category safely
    # -----------------------------------------------------

    if challenge.category:

        category = (
            challenge.category.name
            .strip()
            .lower()
        )

    else:

        category = "general"

    # -----------------------------------------------------
    # AI evaluation
    # -----------------------------------------------------

    try:

        evaluation = evaluate_submission_with_ai(
            challenge=challenge,
            submission=submission,
        )

    except Exception as exc:

        print(
            f"Challenge AI evaluation failed: {exc}"
        )

        # Do NOT automatically give 100.
        # If evaluation fails, return a safe response
        # instead of falsely claiming excellent performance.

        return {
            "is_valid": False,
            "score": 0,
            "feedback": (
                "Your submission was received, but "
                "the AI evaluator could not evaluate it "
                "right now. Please try submitting again."
            ),
            "category": category,
            "evaluation_error": True,
        }

    # -----------------------------------------------------
    # Build final result
    # -----------------------------------------------------

    return {
        "is_valid": True,
        "score": evaluation["score"],
        "feedback": evaluation["feedback"],
        "strengths": evaluation["strengths"],
        "improvements": evaluation["improvements"],
        "category": category,
        "evaluation_error": False,
    }