from google import genai
from google.genai import types

from django.conf import settings

import json
import logging
import time

from .prompts import (
    SYSTEM_PROMPT,
    FIRST_QUESTION_PROMPT,
    NEXT_QUESTION_PROMPT,
    EVALUATE_PROMPT,
    REWRITE_PROMPT,
    REPORT_PROMPT,
)

logger = logging.getLogger(__name__)

client = genai.Client(
    api_key=settings.GEMINI_API_KEY
)


# --------------------------------------------------
# Generic Gemini Call
# --------------------------------------------------

def ask_ai(prompt, retries=3):
    """
    Sends any prompt to Gemini and returns text.
    """

    for attempt in range(retries):

        try:

            response = client.models.generate_content(

                model="gemini-2.5-flash",

                contents=prompt,

                config=types.GenerateContentConfig(
                    system_instruction=SYSTEM_PROMPT,
                    temperature=0.7,
                ),
            )

            return response.text.strip()

        except Exception as e:

            logger.exception(e)

            if attempt < retries - 1:
                time.sleep(2)

    raise Exception("Gemini request failed.")


# --------------------------------------------------
# JSON Parser
# --------------------------------------------------

def parse_json(text):

    text = text.strip()

    if text.startswith("```json"):
        text = text.replace("```json", "")

    if text.startswith("```"):
        text = text.replace("```", "")

    if text.endswith("```"):
        text = text.replace("```", "")

    return json.loads(text)


# --------------------------------------------------
# First Question
# --------------------------------------------------

def generate_first_question(session, resume_text=""):

    prompt = FIRST_QUESTION_PROMPT.format(

        job_title=session.job_title,

        company=session.company or "Unknown",

        experience=session.experience_level,

        difficulty=session.difficulty,

        interview_type=session.interview_type,

        job_description=session.job_description,

        resume=resume_text,

    )

    return ask_ai(prompt)


# --------------------------------------------------
# Next Question
# --------------------------------------------------

def generate_next_question(previous_question, candidate_answer):

    prompt = NEXT_QUESTION_PROMPT.format(

        current_question=previous_question,

        candidate_answer=candidate_answer,

    )

    return ask_ai(prompt)


# --------------------------------------------------
# Evaluate Answer
# --------------------------------------------------

def evaluate_answer(question, answer):

    prompt = EVALUATE_PROMPT.format(

        question=question,

        answer=answer,

    )

    result = ask_ai(prompt)

    return parse_json(result)


# --------------------------------------------------
# Rewrite Answer
# --------------------------------------------------

def rewrite_answer(question, answer):

    prompt = REWRITE_PROMPT.format(

        question=question,

        answer=answer,

    )

    result = ask_ai(prompt)

    return parse_json(result)


# --------------------------------------------------
# Interview Report
# --------------------------------------------------

def generate_report(conversation):

    prompt = REPORT_PROMPT.format(

        conversation=conversation,

    )

    result = ask_ai(prompt)

    return parse_json(result)