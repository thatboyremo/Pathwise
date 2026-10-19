import traceback

from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse, FileResponse

from rest_framework.decorators import (
    api_view,
    permission_classes,
    authentication_classes,
)
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from rest_framework_simplejwt.authentication import JWTAuthentication

from .pdf_generator import generate_interview_pdf
from .forms import InterviewSetupForm
from .models import InterviewSession, InterviewQuestion
from .services.interview_service import InterviewService


# ============================================================
# LANDING / SETUP PAGE
# ============================================================

@login_required
def interview_setup(request):

    if request.method == "POST":

        form = InterviewSetupForm(
            request.POST,
            request.FILES
        )

        if form.is_valid():

            interview = form.save(commit=False)

            interview.user = request.user

            interview.save()

            try:

                InterviewService(interview).start_interview()

                return redirect(
                    "interview:interview_session",
                    pk=interview.pk
                )

            except Exception:

                traceback.print_exc()

                return render(
                    request,
                    "interview/interview_setup.html",
                    {
                        "form": form,
                        "error": (
                            "Unable to start the interview. "
                            "Please try again."
                        ),
                    }
                )

    else:

        form = InterviewSetupForm()

    return render(
        request,
        "interview/interview_setup.html",
        {
            "form": form,
        }
    )


# ============================================================
# INTERVIEW SESSION PAGE
# ============================================================

@login_required
def interview_session(request, pk):

    session = get_object_or_404(
        InterviewSession,
        pk=pk,
        user=request.user
    )

    questions = session.questions.order_by(
        "question_number"
    )

    current_question = questions.filter(
        question_number=session.current_question
    ).first()

    return render(
        request,
        "interview/mock_interview.html",
        {
            "session": session,
            "questions": questions,
            "current_question": current_question,
        }
    )


# ============================================================
# NORMAL DJANGO SUBMIT ANSWER
# ============================================================

@login_required
def submit_answer(request, pk):

    session = get_object_or_404(
        InterviewSession,
        pk=pk,
        user=request.user
    )

    if request.method != "POST":

        return JsonResponse(
            {
                "success": False,
                "error": "Invalid request method."
            },
            status=400
        )

    answer_text = request.POST.get(
        "answer",
        ""
    ).strip()

    if not answer_text:

        return JsonResponse(
            {
                "success": False,
                "error": "Answer cannot be empty."
            },
            status=400
        )

    question = get_object_or_404(
        InterviewQuestion,
        session=session,
        question_number=session.current_question
    )

    try:

        service = InterviewService(session)

        result = service.submit_answer(
            question,
            answer_text
        )

        answer = result["answer"]

        next_question = result["next_question"]

        return JsonResponse(
            {
                "success": True,

                "overall_score": answer.overall_score,
                "technical_score": answer.technical_score,
                "communication_score": answer.communication_score,
                "confidence_score": answer.confidence_score,
                "problem_solving_score": answer.problem_solving_score,

                "feedback": answer.feedback,

                "strengths": answer.strengths,
                "weaknesses": answer.weaknesses,

                "improved_answer": answer.improved_answer,
                "professional_version": answer.professional_version,
                "faang_version": answer.faang_version,
                "concise_version": answer.concise_version,

                "next_question": (
                    next_question.question
                    if next_question
                    else None
                ),

                "next_question_number": (
                    next_question.question_number
                    if next_question
                    else None
                ),

                "has_next": (
                    next_question is not None
                ),

                "session_status": session.status,

                "session_score": session.overall_score,
            }
        )

    except Exception as e:

        traceback.print_exc()

        return JsonResponse(
            {
                "success": False,
                "error": str(e)
            },
            status=500
        )


# ============================================================
# INTERVIEW RESULT PAGE
# ============================================================

@login_required
def interview_result(request, pk):

    session = get_object_or_404(
        InterviewSession,
        pk=pk,
        user=request.user
    )

    questions = session.questions.order_by(
        "question_number"
    )

    answers = []

    total_score = 0

    answered_questions = 0

    for question in questions:

        answer = getattr(
            question,
            "answer",
            None
        )

        if answer:

            answers.append(answer)

            total_score += answer.overall_score

            answered_questions += 1

    average_score = 0

    if answered_questions > 0:

        average_score = round(
            total_score / answered_questions,
            1
        )

    context = {

        "session": session,

        "questions": questions,

        "answers": answers,

        "answered_questions": answered_questions,

        "average_score": average_score,

        "total_questions": session.question_count,

        "completed": (
            answered_questions
            >= session.question_count
        ),
    }

    return render(
        request,
        "interview/result.html",
        context
    )


# ============================================================
# DOWNLOAD INTERVIEW REPORT
# ============================================================

@login_required
def download_report_pdf(request, pk):

    session = get_object_or_404(
        InterviewSession,
        pk=pk,
        user=request.user
    )

    if not hasattr(session, "report"):

        return redirect(
            "interview:interview_result",
            pk=session.pk
        )

    pdf = generate_interview_pdf(session)

    filename = (
        "Interview_Report_"
        f"{session.company.replace(' ', '_')}.pdf"
    )

    return FileResponse(
        pdf,
        as_attachment=True,
        filename=filename,
        content_type="application/pdf"
    )


# ============================================================
# REACT API — START INTERVIEW
# ============================================================

@api_view(["POST"])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def start_interview_api(request):

    try:

        # ----------------------------------------------------
        # DEBUG AUTHENTICATION
        # ----------------------------------------------------

        print("=" * 70)
        print("START INTERVIEW API")
        print("USER:", request.user)
        print("USER ID:", request.user.id)
        print("AUTHENTICATED:", request.user.is_authenticated)
        print("AUTH:", request.auth)
        print("=" * 70)

        # ----------------------------------------------------
        # REQUEST DATA
        # ----------------------------------------------------

        data = request.data

        company = data.get(
            "company",
            ""
        ).strip()

        job_role = data.get(
            "job_role",
            ""
        ).strip()

        experience_level = data.get(
            "experience_level",
            ""
        ).strip()

        interview_type = data.get(
            "interview_type",
            ""
        ).strip()

        difficulty = data.get(
            "difficulty",
            ""
        ).strip()

        question_count = data.get(
            "question_count",
            5
        )

        job_description = data.get(
            "job_description",
            ""
        ).strip()

        # ----------------------------------------------------
        # VALIDATION
        # ----------------------------------------------------

        if not company:

            return Response(
                {
                    "success": False,
                    "error": "Company is required."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        if not job_role:

            return Response(
                {
                    "success": False,
                    "error": "Job role is required."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        try:

            question_count = int(
                question_count
            )

        except (TypeError, ValueError):

            return Response(
                {
                    "success": False,
                    "error": (
                        "Question count must be a number."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        if question_count <= 0:

            return Response(
                {
                    "success": False,
                    "error": (
                        "Question count must be greater than zero."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        # ----------------------------------------------------
        # CREATE INTERVIEW SESSION
        # ----------------------------------------------------

        interview = InterviewSession.objects.create(

            user=request.user,

            company=company,

            job_role=job_role,

            experience_level=experience_level,

            interview_type=interview_type,

            difficulty=difficulty,

            question_count=question_count,

            job_description=job_description,
        )

        # ----------------------------------------------------
        # GENERATE FIRST AI QUESTION
        # ----------------------------------------------------

        service = InterviewService(
            interview
        )

        first_question = service.start_interview()

        # ----------------------------------------------------
        # RESPONSE
        # ----------------------------------------------------

        return Response(
            {
                "success": True,

                "session_id": interview.pk,

                "status": interview.status,

                "current_question": (
                    first_question.question
                ),

                "current_question_number": (
                    first_question.question_number
                ),

                "total_questions": (
                    interview.question_count
                ),
            },
            status=status.HTTP_201_CREATED
        )

    except Exception as e:

        traceback.print_exc()

        return Response(
            {
                "success": False,
                "error": str(e)
            },
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


# ============================================================
# REACT API — SUBMIT ANSWER
# ============================================================

@api_view(["POST"])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def submit_answer_api(request, pk):

    try:

        # ----------------------------------------------------
        # DEBUG AUTHENTICATION
        # ----------------------------------------------------

        print("=" * 70)
        print("SUBMIT ANSWER API")
        print("USER:", request.user)
        print("USER ID:", request.user.id)
        print("AUTHENTICATED:", request.user.is_authenticated)
        print("AUTH:", request.auth)
        print("SESSION ID:", pk)
        print("=" * 70)

        # ----------------------------------------------------
        # GET SESSION
        # ----------------------------------------------------

        session = get_object_or_404(
            InterviewSession,
            pk=pk,
            user=request.user
        )

        # ----------------------------------------------------
        # GET ANSWER
        # ----------------------------------------------------

        answer_text = request.data.get(
            "answer",
            ""
        ).strip()

        if not answer_text:

            return Response(
                {
                    "success": False,
                    "error": "Answer cannot be empty."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        # ----------------------------------------------------
        # GET CURRENT QUESTION
        # ----------------------------------------------------

        question = get_object_or_404(
            InterviewQuestion,
            session=session,
            question_number=session.current_question
        )

        # ----------------------------------------------------
        # PROCESS ANSWER
        # ----------------------------------------------------

        service = InterviewService(
            session
        )

        result = service.submit_answer(
            question,
            answer_text
        )

        answer = result["answer"]

        next_question = result["next_question"]

        # ----------------------------------------------------
        # RESPONSE
        # ----------------------------------------------------

        return Response(
            {
                "success": True,

                "overall_score": (
                    answer.overall_score
                ),

                "technical_score": (
                    answer.technical_score
                ),

                "communication_score": (
                    answer.communication_score
                ),

                "confidence_score": (
                    answer.confidence_score
                ),

                "problem_solving_score": (
                    answer.problem_solving_score
                ),

                "feedback": (
                    answer.feedback
                ),

                "strengths": (
                    answer.strengths
                ),

                "weaknesses": (
                    answer.weaknesses
                ),

                "improved_answer": (
                    answer.improved_answer
                ),

                "professional_version": (
                    answer.professional_version
                ),

                "faang_version": (
                    answer.faang_version
                ),

                "concise_version": (
                    answer.concise_version
                ),

                "next_question": (
                    next_question.question
                    if next_question
                    else None
                ),

                "next_question_number": (
                    next_question.question_number
                    if next_question
                    else None
                ),

                "has_next": (
                    next_question is not None
                ),

                "session_status": (
                    session.status
                ),

                "session_score": (
                    session.overall_score
                ),
            },
            status=status.HTTP_200_OK
        )

    except Exception as e:

        traceback.print_exc()

        return Response(
            {
                "success": False,
                "error": str(e)
            },
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


# ============================================================
# REACT API — GET INTERVIEW SESSION
# ============================================================

@api_view(["GET"])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def interview_session_api(request, pk):

    try:

        print("=" * 70)
        print("GET INTERVIEW SESSION API")
        print("USER:", request.user)
        print("USER ID:", request.user.id)
        print("AUTHENTICATED:", request.user.is_authenticated)
        print("AUTH:", request.auth)
        print("SESSION ID:", pk)
        print("=" * 70)

        session = get_object_or_404(
            InterviewSession,
            pk=pk,
            user=request.user
        )

        questions = session.questions.order_by(
            "question_number"
        )

        current_question = questions.filter(
            question_number=session.current_question
        ).first()

        return Response(
            {
                "success": True,

                "session_id": session.pk,

                "status": session.status,

                "current_question": (
                    current_question.question
                    if current_question
                    else None
                ),

                "current_question_number": (
                    current_question.question_number
                    if current_question
                    else None
                ),

                "total_questions": (
                    session.question_count
                ),

                "overall_score": (
                    session.overall_score
                ),
            },
            status=status.HTTP_200_OK
        )

    except Exception as e:

        traceback.print_exc()

        return Response(
            {
                "success": False,
                "error": str(e)
            },
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


# ============================================================
# REACT API — INTERVIEW RESULT
# ============================================================

@api_view(["GET"])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def interview_result_api(request, pk):

    try:

        print("=" * 70)
        print("INTERVIEW RESULT API")
        print("USER:", request.user)
        print("USER ID:", request.user.id)
        print("AUTHENTICATED:", request.user.is_authenticated)
        print("AUTH:", request.auth)
        print("SESSION ID:", pk)
        print("=" * 70)

        session = get_object_or_404(
            InterviewSession,
            pk=pk,
            user=request.user
        )

        questions = session.questions.order_by(
            "question_number"
        )

        answers = []

        for question in questions:

            answer = getattr(
                question,
                "answer",
                None
            )

            if answer:

                answers.append(
                    {
                        "question_number": (
                            question.question_number
                        ),

                        "question": (
                            question.question
                        ),

                        "answer": (
                            answer.answer
                        ),

                        "overall_score": (
                            answer.overall_score
                        ),

                        "technical_score": (
                            answer.technical_score
                        ),

                        "communication_score": (
                            answer.communication_score
                        ),

                        "confidence_score": (
                            answer.confidence_score
                        ),

                        "problem_solving_score": (
                            answer.problem_solving_score
                        ),

                        "feedback": (
                            answer.feedback
                        ),

                        "strengths": (
                            answer.strengths
                        ),

                        "weaknesses": (
                            answer.weaknesses
                        ),

                        "improved_answer": (
                            answer.improved_answer
                        ),

                        "professional_version": (
                            answer.professional_version
                        ),

                        "faang_version": (
                            answer.faang_version
                        ),

                        "concise_version": (
                            answer.concise_version
                        ),
                    }
                )

        return Response(
            {
                "success": True,

                "session_id": session.pk,

                "status": session.status,

                "overall_score": (
                    session.overall_score
                ),

                "recommendation": (
                    session.recommendation
                ),

                "total_questions": (
                    session.question_count
                ),

                "answered_questions": (
                    len(answers)
                ),

                "answers": answers,
            },
            status=status.HTTP_200_OK
        )

    except Exception as e:

        traceback.print_exc()

        return Response(
            {
                "success": False,
                "error": str(e)
            },
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )