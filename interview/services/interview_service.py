# ============================================================
# INTERVIEW SERVICE
# ============================================================

import logging
from typing import Any

from django.db import transaction
from django.utils import timezone

from ai.router import AI
from ai.exceptions import AIProviderError

from dashboard.models import UserStats

from interview.models import (
    InterviewSession,
    InterviewQuestion,
    InterviewAnswer,
    InterviewReport,
)

from interview.ai.interview_prompts import (
    FIRST_QUESTION_PROMPT,
    ANSWER_EVALUATION_PROMPT,
    NEXT_QUESTION_PROMPT,
)


logger = logging.getLogger(__name__)


class InterviewService:
    """
    Main AI Interview Engine.

    Responsible for:

    - Generating interview questions
    - Evaluating candidate answers
    - Generating follow-up questions
    - Calculating interview scores
    - Completing interviews
    - Generating final interview reports
    """

    MAX_HISTORY_LENGTH = 12000

    # ============================================================
    # INITIALIZATION
    # ============================================================

    def __init__(self, session: InterviewSession):
        self.session = session

    # ============================================================
    # ANSWER SUBMISSION
    # ============================================================

    @transaction.atomic
    def submit_answer(
        self,
        question: InterviewQuestion,
        answer_text: str,
    ):
        """
        Evaluate and save a candidate's answer.

        Handles:

        1. Answer validation
        2. Duplicate answer protection
        3. AI answer evaluation
        4. Answer saving
        5. Interview score calculation
        6. Interview completion
        7. Next question generation
        """

        # --------------------------------------------------------
        # VALIDATION
        # --------------------------------------------------------

        if not question:
            raise ValueError(
                "Interview question is required."
            )

        if question.session_id != self.session.id:
            raise ValueError(
                "This question does not belong to the current interview."
            )

        answer_text = (
            answer_text or ""
        ).strip()

        if not answer_text:
            raise ValueError(
                "Candidate answer cannot be empty."
            )

        # --------------------------------------------------------
        # PREVENT DUPLICATE ANSWERS
        # --------------------------------------------------------

        existing_answer = (
            InterviewAnswer.objects
            .filter(
                question=question
            )
            .first()
        )

        if existing_answer:

            logger.warning(
                "Answer already exists for question %s.",
                question.id,
            )

            # ----------------------------------------------------
            # CHECK WHETHER INTERVIEW IS ALREADY COMPLETE
            # ----------------------------------------------------

            answered_count = (
                InterviewAnswer.objects
                .filter(
                    question__session=self.session
                )
                .count()
            )

            total_questions = (
                self.total_questions()
            )

            logger.info(
                "Duplicate answer detected. "
                "Interview %s has %s/%s answers.",
                self.session.id,
                answered_count,
                total_questions,
            )

            # ----------------------------------------------------
            # COMPLETE IF ALL QUESTIONS ARE ANSWERED
            # ----------------------------------------------------

            if answered_count >= total_questions:

                logger.info(
                    "Interview %s has all questions answered. "
                    "Completing interview.",
                    self.session.id,
                )

                self._complete_interview()

                return {
                    "answer": existing_answer,
                    "next_question": None,
                }

            # ----------------------------------------------------
            # IF SESSION IS ALREADY COMPLETED
            # ----------------------------------------------------

            if self.session.status == "completed":

                return {
                    "answer": existing_answer,
                    "next_question": None,
                }

            # ----------------------------------------------------
            # FIND NEXT EXISTING QUESTION
            # ----------------------------------------------------

            next_question = (
                self.get_next_existing_question(
                    question.question_number
                )
            )

            # ----------------------------------------------------
            # GENERATE NEXT QUESTION IF NECESSARY
            # ----------------------------------------------------

            if not next_question:

                next_question = (
                    self.generate_next_question()
                )

            return {
                "answer": existing_answer,
                "next_question": next_question,
            }

        # --------------------------------------------------------
        # EVALUATE ANSWER
        # --------------------------------------------------------

        evaluation = (
            self._evaluate_answer(
                question.question,
                answer_text,
            )
        )

        evaluation = (
            self._normalize_evaluation(
                evaluation
            )
        )

        # --------------------------------------------------------
        # SAVE ANSWER
        # --------------------------------------------------------

        answer = InterviewAnswer.objects.create(

            question=question,

            answer=answer_text,

            overall_score=evaluation[
                "overall_score"
            ],

            technical_score=evaluation[
                "technical_score"
            ],

            communication_score=evaluation[
                "communication_score"
            ],

            confidence_score=evaluation[
                "confidence_score"
            ],

            problem_solving_score=evaluation[
                "problem_solving_score"
            ],

            strengths=evaluation[
                "strengths"
            ],

            weaknesses=evaluation[
                "weaknesses"
            ],

            feedback=evaluation[
                "feedback"
            ],

            improved_answer=evaluation[
                "improved_answer"
            ],

            professional_version=evaluation[
                "professional_version"
            ],

            faang_version=evaluation[
                "faang_version"
            ],

            concise_version=evaluation[
                "concise_version"
            ],
        )

        # --------------------------------------------------------
        # UPDATE INTERVIEW SCORE
        # --------------------------------------------------------

        self._update_session_score()

        # --------------------------------------------------------
        # COUNT ANSWERED QUESTIONS
        # --------------------------------------------------------

        answered_count = (
            InterviewAnswer.objects
            .filter(
                question__session=self.session
            )
            .count()
        )

        total_questions = (
            self.total_questions()
        )

        logger.info(
            "Interview %s: %s/%s questions answered.",
            self.session.id,
            answered_count,
            total_questions,
        )

        # --------------------------------------------------------
        # COMPLETE INTERVIEW
        # --------------------------------------------------------

        if answered_count >= total_questions:

            logger.info(
                "Interview %s completed after final answer.",
                self.session.id,
            )

            self._complete_interview()

            return {
                "answer": answer,
                "next_question": None,
            }

        # --------------------------------------------------------
        # GENERATE NEXT QUESTION
        # --------------------------------------------------------

        next_question = (
            self.generate_next_question()
        )

        return {
            "answer": answer,
            "next_question": next_question,
        }

    # ============================================================
    # AI ANSWER EVALUATION
    # ============================================================

    def _evaluate_answer(
        self,
        question: str,
        answer: str,
    ) -> dict:

        prompt = (
            ANSWER_EVALUATION_PROMPT.format(

                company=(
                    self.session.company or ""
                ),

                job_role=(
                    self.session.job_role or ""
                ),

                experience=(
                    self.session.experience_level
                    or ""
                ),

                interview_type=(
                    self.session.interview_type
                    or ""
                ),

                question=question,

                answer=answer,
            )
        )

        try:

            result = AI.generate_json(
                prompt
            )

        except AIProviderError:

            logger.exception(
                "AI provider error while evaluating answer."
            )

            raise

        except Exception as exc:

            logger.exception(
                "Unexpected AI evaluation error."
            )

            raise AIProviderError(
                f"Interview evaluation failed: {str(exc)}"
            ) from exc

        if not isinstance(
            result,
            dict
        ):

            raise AIProviderError(
                "AI evaluation returned an invalid response format."
            )

        return result

    # ============================================================
    # NORMALIZE EVALUATION
    # ============================================================

    def _normalize_evaluation(
        self,
        evaluation: dict,
    ) -> dict:

        if not isinstance(
            evaluation,
            dict
        ):

            raise AIProviderError(
                "AI evaluation must be a JSON object."
            )

        return {

            "overall_score": (
                self._safe_score(
                    evaluation.get(
                        "overall_score"
                    )
                )
            ),

            "technical_score": (
                self._safe_score(
                    evaluation.get(
                        "technical_score"
                    )
                )
            ),

            "communication_score": (
                self._safe_score(
                    evaluation.get(
                        "communication_score"
                    )
                )
            ),

            "confidence_score": (
                self._safe_score(
                    evaluation.get(
                        "confidence_score"
                    )
                )
            ),

            "problem_solving_score": (
                self._safe_score(
                    evaluation.get(
                        "problem_solving_score"
                    )
                )
            ),

            "feedback": (
                self._safe_text(
                    evaluation.get(
                        "feedback"
                    )
                )
            ),

            "strengths": (
                self._safe_list(
                    evaluation.get(
                        "strengths"
                    )
                )
            ),

            "weaknesses": (
                self._safe_list(
                    evaluation.get(
                        "weaknesses"
                    )
                )
            ),

            "improved_answer": (
                self._safe_text(
                    evaluation.get(
                        "improved_answer"
                    )
                )
            ),

            "professional_version": (
                self._safe_text(
                    evaluation.get(
                        "professional_version"
                    )
                )
            ),

            "faang_version": (
                self._safe_text(
                    evaluation.get(
                        "faang_version"
                    )
                )
            ),

            "concise_version": (
                self._safe_text(
                    evaluation.get(
                        "concise_version"
                    )
                )
            ),
        }

    # ============================================================
    # SAFE SCORE
    # ============================================================

    @staticmethod
    def _safe_score(
        value: Any
    ) -> float:

        try:

            if value is None:
                return 0

            score = float(value)

            if score != score:
                return 0

            score = max(
                0,
                min(
                    100,
                    score
                )
            )

            return round(
                score,
                1
            )

        except (
            TypeError,
            ValueError
        ):

            return 0

    # ============================================================
    # SAFE TEXT
    # ============================================================

    @staticmethod
    def _safe_text(
        value: Any
    ) -> str:

        if value is None:
            return ""

        if isinstance(
            value,
            str
        ):

            return value.strip()

        return str(
            value
        ).strip()

    # ============================================================
    # SAFE LIST
    # ============================================================

    @staticmethod
    def _safe_list(
        value: Any
    ) -> list:

        if value is None:
            return []

        if isinstance(
            value,
            list
        ):

            return [
                str(item).strip()
                for item in value
                if str(item).strip()
            ]

        if isinstance(
            value,
            tuple
        ):

            return [
                str(item).strip()
                for item in value
                if str(item).strip()
            ]

        if isinstance(
            value,
            str
        ):

            value = value.strip()

            if not value:
                return []

            return [value]

        return [
            str(value).strip()
        ]

    # ============================================================
    # UPDATE SESSION SCORE
    # ============================================================

    def _update_session_score(self):

        answers = (
            InterviewAnswer.objects
            .filter(
                question__session=self.session
            )
        )

        if not answers.exists():

            self.session.overall_score = 0

            self.session.save(
                update_fields=[
                    "overall_score"
                ]
            )

            return 0

        scores = [

            self._safe_score(
                answer.overall_score
            )

            for answer in answers
        ]

        average = (
            sum(scores)
            / len(scores)
        )

        self.session.overall_score = (
            round(
                average,
                1
            )
        )

        self.session.save(
            update_fields=[
                "overall_score"
            ]
        )

        return self.session.overall_score

    # ============================================================
    # START INTERVIEW
    # ============================================================

    def start_interview(self):

        existing = (
            self.session.questions
            .order_by(
                "question_number"
            )
            .first()
        )

        if existing:

            return existing

        return (
            self._generate_first_question()
        )

    # ============================================================
    # FIRST QUESTION
    # ============================================================

    @transaction.atomic
    def _generate_first_question(self):

        existing = (
            self.session.questions
            .filter(
                question_number=1
            )
            .first()
        )

        if existing:

            return existing

        prompt = (
            self._build_first_prompt()
        )

        try:

            data = AI.generate_json(
                prompt
            )

        except Exception:

            logger.exception(
                "Failed to generate first interview question."
            )

            raise

        data = (
            self._normalize_question_response(
                data
            )
        )

        question = (
            InterviewQuestion.objects.create(

                session=self.session,

                question_number=1,

                question=data[
                    "question"
                ],

                category=data[
                    "category"
                ],

                ai_follow_up=data[
                    "follow_up"
                ],
            )
        )

        self.session.status = (
            "active"
        )

        self.session.current_question = 1

        self.session.save(
            update_fields=[
                "status",
                "current_question",
            ]
        )

        return question

    # ============================================================
    # FIRST QUESTION PROMPT
    # ============================================================

    def _build_first_prompt(self):

        resume_text = ""

        if self.session.resume:

            resume_text = (
                "Candidate uploaded resume: "
                f"{self.session.resume.name}"
            )

        return (
            FIRST_QUESTION_PROMPT.format(

                company=(
                    self.session.company or ""
                ),

                job_role=(
                    self.session.job_role or ""
                ),

                experience=(
                    self.session.experience_level
                    or ""
                ),

                interview_type=(
                    self.session.interview_type
                    or ""
                ),

                difficulty=(
                    self.session.difficulty
                    or ""
                ),

                question_count=(
                    self.session.question_count
                    or 1
                ),

                job_description=(
                    self.session.job_description
                    or ""
                ),

                resume=resume_text,
            )
        )

    # ============================================================
    # CURRENT QUESTION
    # ============================================================

    def get_current_question(self):

        current_number = (
            self.session.current_question
            or 1
        )

        return (
            self.session.questions
            .filter(
                question_number=current_number
            )
            .first()
        )

    # ============================================================
    # TOTAL QUESTIONS
    # ============================================================

    def total_questions(self):

        try:

            return max(
                1,
                int(
                    self.session.question_count
                )
            )

        except (
            TypeError,
            ValueError
        ):

            return 1

    # ============================================================
    # INTERVIEW FINISHED
    # ============================================================

    def interview_finished(self):

        if self.session.status == "completed":
            return True

        answered_count = (
            InterviewAnswer.objects
            .filter(
                question__session=self.session
            )
            .count()
        )

        return (
            answered_count
            >= self.total_questions()
        )

    # ============================================================
    # NEXT QUESTION
    # ============================================================

    @transaction.atomic
    def generate_next_question(self):

        # --------------------------------------------------------
        # NEVER GENERATE QUESTIONS FOR COMPLETED INTERVIEWS
        # --------------------------------------------------------

        if self.session.status == "completed":

            return None

        current_number = (
            self.session.current_question
            or 1
        )

        next_number = (
            current_number + 1
        )

        total_questions = (
            self.total_questions()
        )

        # --------------------------------------------------------
        # CHECK ANSWER COUNT
        # --------------------------------------------------------

        answered_count = (
            InterviewAnswer.objects
            .filter(
                question__session=self.session
            )
            .count()
        )

        if answered_count >= total_questions:

            self._complete_interview()

            return None

        # --------------------------------------------------------
        # INTERVIEW COMPLETE
        # --------------------------------------------------------

        if next_number > total_questions:

            self._complete_interview()

            return None

        # --------------------------------------------------------
        # EXISTING QUESTION
        # --------------------------------------------------------

        existing = (
            self.session.questions
            .filter(
                question_number=next_number
            )
            .first()
        )

        if existing:

            self.session.current_question = (
                next_number
            )

            self.session.status = (
                "active"
            )

            self.session.save(
                update_fields=[
                    "current_question",
                    "status",
                ]
            )

            return existing

        # --------------------------------------------------------
        # BUILD AI PROMPT
        # --------------------------------------------------------

        prompt = (
            self._build_next_question_prompt()
        )

        try:

            data = AI.generate_json(
                prompt
            )

        except Exception:

            logger.exception(
                "Failed to generate next interview question."
            )

            raise

        data = (
            self._normalize_question_response(
                data
            )
        )

        # --------------------------------------------------------
        # CREATE QUESTION
        # --------------------------------------------------------

        question = (
            InterviewQuestion.objects.create(

                session=self.session,

                question_number=next_number,

                question=data[
                    "question"
                ],

                category=data[
                    "category"
                ],

                ai_follow_up=data[
                    "follow_up"
                ],
            )
        )

        self.session.current_question = (
            next_number
        )

        self.session.status = (
            "active"
        )

        self.session.save(
            update_fields=[
                "current_question",
                "status",
            ]
        )

        return question

    # ============================================================
    # EXISTING NEXT QUESTION
    # ============================================================

    def get_next_existing_question(
        self,
        current_number: int,
    ):

        return (
            self.session.questions
            .filter(
                question_number=(
                    current_number + 1
                )
            )
            .first()
        )

    # ============================================================
    # BUILD NEXT QUESTION PROMPT
    # ============================================================

    def _build_next_question_prompt(self):

        history = (
            self._conversation_history()
        )

        return (
            NEXT_QUESTION_PROMPT.format(

                company=(
                    self.session.company or ""
                ),

                job_role=(
                    self.session.job_role or ""
                ),

                experience=(
                    self.session.experience_level
                    or ""
                ),

                interview_type=(
                    self.session.interview_type
                    or ""
                ),

                difficulty=(
                    self.session.difficulty
                    or ""
                ),

                current_question=(
                    self.session.current_question
                    or 1
                ),

                total_questions=(
                    self.total_questions()
                ),

                job_description=(
                    self.session.job_description
                    or ""
                ),

                history=history,
            )
        )

    # ============================================================
    # CONVERSATION HISTORY
    # ============================================================

    def _conversation_history(self):

        lines = []

        questions = (
            self.session.questions
            .select_related(
                "answer"
            )
            .order_by(
                "question_number"
            )
        )

        for question in questions:

            lines.append(
                f"Question "
                f"{question.question_number}: "
                f"{question.question}"
            )

            answer = getattr(
                question,
                "answer",
                None
            )

            if answer:

                lines.append(
                    "Candidate Answer: "
                    f"{answer.answer}"
                )

                lines.append(
                    "Overall Score: "
                    f"{answer.overall_score}"
                )

        history = "\n".join(
            lines
        )

        if len(history) > (
            self.MAX_HISTORY_LENGTH
        ):

            history = (
                "[Earlier interview history "
                "truncated for context length.]\n\n"
                + history[
                    -self.MAX_HISTORY_LENGTH:
                ]
            )

        return history

    # ============================================================
    # NORMALIZE QUESTION RESPONSE
    # ============================================================

    def _normalize_question_response(
        self,
        data: Any,
    ) -> dict:

        if not isinstance(
            data,
            dict
        ):

            raise AIProviderError(
                "AI question response must be a JSON object."
            )

        question = data.get(
            "question"
        )

        if not question:

            raise AIProviderError(
                "AI question response is missing the 'question' field."
            )

        question = str(
            question
        ).strip()

        if not question:

            raise AIProviderError(
                "AI generated an empty interview question."
            )

        category = data.get(
            "category",
            "General"
        )

        if not category:

            category = "General"

        category = str(
            category
        ).strip()

        follow_up = data.get(
            "follow_up",
            False
        )

        if isinstance(
            follow_up,
            str
        ):

            follow_up = (
                follow_up.lower().strip()
                in {
                    "true",
                    "1",
                    "yes",
                }
            )

        else:

            follow_up = bool(
                follow_up
            )

        return {
            "question": question,
            "category": category,
            "follow_up": follow_up,
        }

    # ============================================================
    # COMPLETE INTERVIEW
    # ============================================================

    def _complete_interview(self):
        """
        Complete the interview safely.

        This method:

        - Calculates the final score
        - Sets status to completed
        - Sets completed_at
        - Updates UserStats once
        - Generates the final report
        """

        # --------------------------------------------------------
        # CHECK WHETHER ALREADY COMPLETED
        # --------------------------------------------------------

        already_completed = (
            self.session.status
            == "completed"
        )

        # --------------------------------------------------------
        # FINAL SCORE
        # --------------------------------------------------------

        self._update_session_score()

        # --------------------------------------------------------
        # MARK COMPLETED
        # --------------------------------------------------------

        if not already_completed:

            self.session.status = (
                "completed"
            )

            self.session.completed_at = (
                timezone.now()
            )

            self.session.save(
                update_fields=[
                    "status",
                    "completed_at",
                ]
            )

            logger.info(
                "Interview %s marked as completed.",
                self.session.id,
            )

        # --------------------------------------------------------
        # SAFETY:
        # COMPLETED INTERVIEW WITHOUT completed_at
        # --------------------------------------------------------

        elif not self.session.completed_at:

            self.session.completed_at = (
                timezone.now()
            )

            self.session.save(
                update_fields=[
                    "completed_at"
                ]
            )

        # --------------------------------------------------------
        # UPDATE USER STATISTICS
        # --------------------------------------------------------

        if not already_completed:

            try:

                stats, _ = (
                    UserStats.objects
                    .get_or_create(
                        user=self.session.user
                    )
                )

                stats.mock_interviews = (
                    stats.mock_interviews or 0
                ) + 1

                stats.save(
                    update_fields=[
                        "mock_interviews"
                    ]
                )

                logger.info(
                    "UserStats updated for user %s.",
                    self.session.user_id,
                )

            except Exception:

                logger.exception(
                    "Failed to update UserStats."
                )

        # --------------------------------------------------------
        # GENERATE FINAL REPORT
        # --------------------------------------------------------

        self.create_final_report()

    # ============================================================
    # FINAL REPORT
    # ============================================================

    def create_final_report(self):

        answers = (
            InterviewAnswer.objects
            .filter(
                question__session=self.session
            )
        )

        if not answers.exists():

            return None

        # --------------------------------------------------------
        # SCORES
        # --------------------------------------------------------

        communication_scores = [

            self._safe_score(
                answer.communication_score
            )

            for answer in answers
        ]

        technical_scores = [

            self._safe_score(
                answer.technical_score
            )

            for answer in answers
        ]

        confidence_scores = [

            self._safe_score(
                answer.confidence_score
            )

            for answer in answers
        ]

        problem_solving_scores = [

            self._safe_score(
                answer.problem_solving_score
            )

            for answer in answers
        ]

        overall_scores = [

            self._safe_score(
                answer.overall_score
            )

            for answer in answers
        ]

        # --------------------------------------------------------
        # AVERAGES
        # --------------------------------------------------------

        report = {

            "communication": round(
                sum(
                    communication_scores
                )
                / len(
                    communication_scores
                ),
                1,
            ),

            "technical": round(
                sum(
                    technical_scores
                )
                / len(
                    technical_scores
                ),
                1,
            ),

            "confidence": round(
                sum(
                    confidence_scores
                )
                / len(
                    confidence_scores
                ),
                1,
            ),

            "problem_solving": round(
                sum(
                    problem_solving_scores
                )
                / len(
                    problem_solving_scores
                ),
                1,
            ),

            "overall": round(
                sum(
                    overall_scores
                )
                / len(
                    overall_scores
                ),
                1,
            ),
        }

        # --------------------------------------------------------
        # RECOMMENDATION
        # --------------------------------------------------------

        recommendation = (
            self._get_recommendation(
                report["overall"]
            )
        )

        # --------------------------------------------------------
        # STRENGTHS / WEAKNESSES
        # --------------------------------------------------------

        strengths = []
        weaknesses = []

        for answer in answers:

            strengths.extend(
                self._safe_list(
                    answer.strengths
                )
            )

            weaknesses.extend(
                self._safe_list(
                    answer.weaknesses
                )
            )

        strengths = list(
            dict.fromkeys(
                item
                for item in strengths
                if item
            )
        )

        weaknesses = list(
            dict.fromkeys(
                item
                for item in weaknesses
                if item
            )
        )

        # --------------------------------------------------------
        # UPDATE SESSION
        # --------------------------------------------------------

        self.session.recommendation = (
            recommendation
        )

        self.session.overall_score = (
            report["overall"]
        )

        self.session.save(
            update_fields=[
                "recommendation",
                "overall_score",
            ]
        )

        # --------------------------------------------------------
        # CREATE / UPDATE REPORT
        # --------------------------------------------------------

        interview_report, _ = (
            InterviewReport.objects
            .update_or_create(

                session=self.session,

                defaults={

                    "communication": (
                        report[
                            "communication"
                        ]
                    ),

                    "technical": (
                        report[
                            "technical"
                        ]
                    ),

                    "confidence": (
                        report[
                            "confidence"
                        ]
                    ),

                    "problem_solving": (
                        report[
                            "problem_solving"
                        ]
                    ),

                    "overall": (
                        report[
                            "overall"
                        ]
                    ),

                    "culture_fit": (
                        report[
                            "overall"
                        ]
                    ),

                    "strengths": strengths,

                    "weaknesses": weaknesses,

                    "summary": (
                        "The candidate achieved an "
                        "overall interview score of "
                        f"{report['overall']}%."
                    ),

                    "hiring_recommendation": (
                        recommendation
                    ),
                },
            )
        )

        logger.info(
            "Interview report created/updated "
            "for session %s.",
            self.session.id,
        )

        return interview_report

    # ============================================================
    # RECOMMENDATION
    # ============================================================

    @staticmethod
    def _get_recommendation(
        overall_score: float,
    ) -> str:

        if overall_score >= 90:

            return "Strong Hire"

        if overall_score >= 75:

            return "Hire"

        if overall_score >= 60:

            return "Consider"

        return "Reject"