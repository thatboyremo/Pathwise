import json
import logging

from interview.ai.ai_client import (
    generate_json,
    generate_text,
)

logger = logging.getLogger(__name__)


class InterviewEngine:
    """
    Main AI Interview Engine.

    Responsible for:

    ✔ Generate interview questions
    ✔ Evaluate answers
    ✔ Generate feedback
    ✔ Generate follow-up questions
    ✔ Produce interview report
    """

    def __init__(self, session):
        self.session = session

    # ---------------------------------------------------
    # SYSTEM PROMPT
    # ---------------------------------------------------

    def system_prompt(self):

        return f"""
You are a Senior Technical Interviewer.

Company:
{self.session.company}

Role:
{self.session.job_title}

Interview Type:
{self.session.interview_type}

Difficulty:
{self.session.experience_level}

Rules:

- Ask ONE question at a time.
- Behave like a real interviewer.
- Never ask multiple questions.
- Questions must feel natural.
- Build on previous answers.
- If the candidate gives a weak answer,
ask deeper follow-up questions.
- Never reveal the score.
- Never reveal internal analysis.
"""

    # ---------------------------------------------------
    # Resume Context
    # ---------------------------------------------------

    def resume_context(self):

        if not self.session.resume:
            return ""

        return f"""

Candidate uploaded a resume.

Use the resume to create
personalized interview questions.

Resume:

{self.session.resume.name}

"""

    # ---------------------------------------------------
    # Generate First Question
    # ---------------------------------------------------

    def first_question(self):

        prompt = f"""

{self.system_prompt()}

{self.resume_context()}

Generate ONLY the first interview question.

Do not greet.

Do not explain.

Return JSON:

{{
    "question":"..."
}}

"""

        response = generate_json(prompt)

        return response["question"]

    # ---------------------------------------------------
    # Generate Next Question
    # ---------------------------------------------------

    def next_question(
        self,
        previous_question,
        candidate_answer,
    ):

        prompt = f"""

{self.system_prompt()}

Previous Question:

{previous_question}

Candidate Answer:

{candidate_answer}

Generate the next interview question.

The question should naturally follow
the previous answer.

Return JSON.

{{
   "question":"..."
}}

"""

        response = generate_json(prompt)

        return response["question"]

    # ---------------------------------------------------
    # Greeting
    # ---------------------------------------------------

    def greeting(self):

        return f"""

Welcome to your {self.session.company}
interview.

I'll ask one question at a time.

Let's begin.

"""

    # ---------------------------------------------------
    # End Interview
    # ---------------------------------------------------

    def goodbye(self):

        return """

Excellent work.

Thank you for taking part
in today's interview.

I'm now preparing
your interview report.

"""
    # ---------------------------------------------------
    # Evaluate Candidate Answer
    # ---------------------------------------------------

    def evaluate_answer(
        self,
        question,
        answer,
    ):
        """
        Analyze a candidate's answer and return structured feedback.
        """

        prompt = f"""
{self.system_prompt()}

Interview Question:

{question}

Candidate Answer:

{answer}

You are evaluating the candidate.

Score fairly.

Return ONLY valid JSON.

JSON format:

{{
    "overall_score": 0,
    "confidence_score": 0,
    "communication_score": 0,
    "technical_score": 0,

    "star_score": 0,

    "strengths": [
        "...",
        "...",
        "..."
    ],

    "weaknesses": [
        "...",
        "...",
        "..."
    ],

    "feedback": "...",

    "star_analysis": {{
        "situation": "...",
        "task": "...",
        "action": "...",
        "result": "..."
    }}
}}

Rules:

- Scores are integers from 0 to 10.
- Be constructive.
- Do not praise weak answers.
- Reward detailed examples.
- Reward measurable impact.
"""

        return generate_json(prompt)

    # ---------------------------------------------------
    # Overall Feedback
    # ---------------------------------------------------

    def feedback_summary(
        self,
        evaluation,
    ):
        """
        Convert structured evaluation into
        a friendly summary.
        """

        score = evaluation["overall_score"]

        if score >= 9:
            level = "Excellent"

        elif score >= 8:
            level = "Very Good"

        elif score >= 7:
            level = "Good"

        elif score >= 5:
            level = "Average"

        else:
            level = "Needs Improvement"

        return {
            "level": level,
            "score": score,
            "feedback": evaluation["feedback"],
        }

    # ---------------------------------------------------
    # STAR Breakdown
    # ---------------------------------------------------

    def star_breakdown(
        self,
        evaluation,
    ):

        return evaluation.get(
            "star_analysis",
            {},
        )

    # ---------------------------------------------------
    # Strengths
    # ---------------------------------------------------

    def strengths(
        self,
        evaluation,
    ):

        return evaluation.get(
            "strengths",
            [],
        )

    # ---------------------------------------------------
    # Weaknesses
    # ---------------------------------------------------

    def weaknesses(
        self,
        evaluation,
    ):

        return evaluation.get(
            "weaknesses",
            [],
        )

    # ---------------------------------------------------
    # Numeric Scores
    # ---------------------------------------------------

    def scores(
        self,
        evaluation,
    ):

        return {
            "overall": evaluation.get(
                "overall_score",
                0,
            ),

            "technical": evaluation.get(
                "technical_score",
                0,
            ),

            "communication": evaluation.get(
                "communication_score",
                0,
            ),

            "confidence": evaluation.get(
                "confidence_score",
                0,
            ),

            "star": evaluation.get(
                "star_score",
                0,
            ),
        }

    # ---------------------------------------------------
    # Did candidate answer well?
    # ---------------------------------------------------

    def answer_quality(
        self,
        evaluation,
    ):

        return (
            evaluation.get(
                "overall_score",
                0,
            ) >= 7
        )
    
        # ---------------------------------------------------
    # Generate Improved Answers
    # ---------------------------------------------------

    def improved_answers(
        self,
        question,
        answer,
    ):
        """
        Generate three improved versions
        of the candidate's answer.
        """

        prompt = f"""
{self.system_prompt()}

Interview Question:

{question}

Candidate Answer:

{answer}

Rewrite the answer in THREE different ways.

Return ONLY valid JSON.

{{
    "professional": "...",
    "faang": "...",
    "concise": "..."
}}

Rules:

Professional:
- polished
- interview ready

FAANG:
- stronger impact
- measurable results
- STAR framework
- leadership
- ownership

Concise:
- short
- powerful
- under 120 words
"""

        return generate_json(prompt)

    # ---------------------------------------------------
    # Follow-up Question
    # ---------------------------------------------------

    def follow_up_question(
        self,
        previous_question,
        answer,
    ):
        """
        Generate a realistic follow-up question
        based on the candidate's response.
        """

        prompt = f"""
{self.system_prompt()}

Previous Question:

{previous_question}

Candidate Answer:

{answer}

Generate ONE follow-up question.

Rules:

- Ask naturally.
- Dig deeper.
- Challenge weak responses.
- Ask for measurable impact.
- Sound like a real interviewer.

Return JSON.

{{
    "question":"..."
}}
"""

        response = generate_json(prompt)

        return response["question"]

    # ---------------------------------------------------
    # Hiring Recommendation
    # ---------------------------------------------------

    def hiring_recommendation(
        self,
        evaluation,
    ):

        score = evaluation["overall_score"]

        if score >= 9:

            return {
                "decision": "Strong Hire",
                "color": "green",
                "message": (
                    "Outstanding performance with strong communication, "
                    "clear structure and impressive examples."
                ),
            }

        if score >= 8:

            return {
                "decision": "Hire",
                "color": "green",
                "message": (
                    "Solid interview performance with only minor areas "
                    "for improvement."
                ),
            }

        if score >= 7:

            return {
                "decision": "Lean Hire",
                "color": "orange",
                "message": (
                    "Good overall performance, but additional depth and "
                    "better examples would strengthen the interview."
                ),
            }

        if score >= 5:

            return {
                "decision": "Lean No Hire",
                "color": "red",
                "message": (
                    "Some potential shown, but significant improvements "
                    "are needed before hiring."
                ),
            }

        return {
            "decision": "No Hire",
            "color": "red",
            "message": (
                "The interview did not demonstrate the required level "
                "of competency for this position."
            ),
        }

    # ---------------------------------------------------
    # Interview Progress
    # ---------------------------------------------------

    def progress(
        self,
        current_question,
        total_questions=10,
    ):

        percent = round(
            (current_question / total_questions) * 100
        )

        return {
            "current": current_question,
            "total": total_questions,
            "percent": percent,
            "remaining": total_questions - current_question,
        }

    # ---------------------------------------------------
    # Should Interview Continue?
    # ---------------------------------------------------

    def should_continue(
        self,
        current_question,
        total_questions=10,
    ):

        return current_question < total_questions

    # ---------------------------------------------------
    # Next AI Action
    # ---------------------------------------------------

    def next_action(
        self,
        current_question,
        evaluation,
    ):
        """
        Decide whether the AI should ask
        another question or finish.
        """

        if not self.should_continue(current_question):

            return {
                "action": "finish",
                "message": self.goodbye(),
            }

        if evaluation["overall_score"] < 5:

            return {
                "action": "follow_up",
                "reason": "weak_answer",
            }

        return {
            "action": "next_question",
        }

    # ---------------------------------------------------
    # Interview Mood
    # ---------------------------------------------------

    def interview_mood(
        self,
        evaluation,
    ):
        """
        Optional UI enhancement.
        """

        score = evaluation["overall_score"]

        if score >= 9:
            return "excellent"

        if score >= 8:
            return "good"

        if score >= 6:
            return "neutral"

        return "needs_improvement"
    
        # ---------------------------------------------------
    # Generate Final Interview Report
    # ---------------------------------------------------

    def final_report(self, answers):
        """
        Generate an overall interview report from all questions and answers.

        answers should be a list of dictionaries:

        [
            {
                "question": "...",
                "answer": "...",
            },
            ...
        ]
        """

        transcript = ""

        for i, item in enumerate(answers, start=1):
            transcript += f"""

Question {i}

{item['question']}

Answer

{item['answer']}

"""

        prompt = f"""
{self.system_prompt()}

Below is the complete interview transcript.

{transcript}

Analyze the ENTIRE interview.

Return ONLY valid JSON.

{{
    "overall_score": 0,
    "technical_score": 0,
    "communication_score": 0,
    "confidence_score": 0,
    "problem_solving_score": 0,

    "strengths":[
        "...",
        "...",
        "..."
    ],

    "weaknesses":[
        "...",
        "...",
        "..."
    ],

    "summary":"...",

    "recommendation":"Strong Hire",

    "career_advice":[
        "...",
        "...",
        "..."
    ]
}}

Rules

Scores are 0-10.

Summary should be around 150 words.

Recommendation must be one of:

Strong Hire
Hire
Lean Hire
Lean No Hire
No Hire
"""

        return generate_json(prompt)

    # ---------------------------------------------------
    # Average Score
    # ---------------------------------------------------

    def average_score(self, evaluations):
        """
        Compute average score from all answer evaluations.
        """

        if not evaluations:
            return 0

        total = sum(
            e.get("overall_score", 0)
            for e in evaluations
        )

        return round(
            total / len(evaluations),
            1,
        )

    # ---------------------------------------------------
    # Best Performing Skill
    # ---------------------------------------------------

    def strongest_skill(self, report):

        scores = {
            "Technical": report.get("technical_score", 0),
            "Communication": report.get("communication_score", 0),
            "Confidence": report.get("confidence_score", 0),
            "Problem Solving": report.get("problem_solving_score", 0),
        }

        return max(
            scores,
            key=scores.get,
        )

    # ---------------------------------------------------
    # Weakest Skill
    # ---------------------------------------------------

    def weakest_skill(self, report):

        scores = {
            "Technical": report.get("technical_score", 0),
            "Communication": report.get("communication_score", 0),
            "Confidence": report.get("confidence_score", 0),
            "Problem Solving": report.get("problem_solving_score", 0),
        }

        return min(
            scores,
            key=scores.get,
        )

    # ---------------------------------------------------
    # Overall Interview Grade
    # ---------------------------------------------------

    def interview_grade(
        self,
        score,
    ):

        if score >= 9:
            return "A+"

        if score >= 8:
            return "A"

        if score >= 7:
            return "B"

        if score >= 6:
            return "C"

        if score >= 5:
            return "D"

        return "F"

    # ---------------------------------------------------
    # Progress Percentage
    # ---------------------------------------------------

    def completion_percentage(
        self,
        current_question,
        total_questions=10,
    ):

        return round(
            (current_question / total_questions) * 100
        )

    # ---------------------------------------------------
    # Safe JSON Wrapper
    # ---------------------------------------------------

    def safe_json(
        self,
        func,
        *args,
        **kwargs,
    ):
        """
        Execute an AI function safely.
        """

        try:
            return func(
                *args,
                **kwargs,
            )

        except Exception as e:

            logger.exception(e)

            return {
                "error": str(e),
            }

    # ---------------------------------------------------
    # AI Health Check
    # ---------------------------------------------------

    def health_check(self):
        """
        Verify AI connectivity.
        """

        try:

            reply = generate_text(
                "Reply with ONLY the word OK."
            )

            return reply.strip().upper() == "OK"

        except Exception:

            return False