from django.shortcuts import render
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from django.db.models import Avg

from .models import UserStats
from users.models import UserProfile
from interview.models import InterviewSession
from jobs.models import JobApplication


@login_required
def dashboard(request):

    # ============================================================
    # USER PROFILE
    # ============================================================

    profile, _ = UserProfile.objects.get_or_create(
        user=request.user
    )

    # ============================================================
    # USER STATS
    # ============================================================

    stats, _ = UserStats.objects.get_or_create(
        user=request.user
    )

    # ============================================================
    # RESUME SCORE
    # ============================================================

    cv_score = 0

    latest_analysis = None

    try:

        from analyzer.models import ResumeAnalysis

        latest_analysis = (
            ResumeAnalysis.objects
            .filter(user=request.user)
            .order_by("-created_at")
            .first()
        )

        if latest_analysis:

            cv_score = (
                latest_analysis.score
                if latest_analysis.score is not None
                else 0
            )

    except (ImportError, AttributeError):

        latest_analysis = None

    # ============================================================
    # INTERVIEWS
    # ============================================================

    interviews = InterviewSession.objects.filter(
        user=request.user
    )

    completed_interviews = interviews.filter(
        status="completed"
    )

    completed_interview_count = (
        completed_interviews.count()
    )

    # Average completed interview score

    avg_interview_score = (
        completed_interviews
        .filter(
            overall_score__isnull=False
        )
        .aggregate(
            average=Avg("overall_score")
        )["average"]
        or 0
    )

    avg_interview_score = round(
        float(avg_interview_score),
        1
    )

    # ============================================================
    # JOB APPLICATIONS
    # ============================================================

    applications = JobApplication.objects.filter(
        user=request.user
    )

    # Only count jobs that were actually submitted.

    submitted_applications = applications.filter(
        status__in=[
            "applied",
            "interview",
            "offer",
            "rejected",
        ]
    ).count()

    # ============================================================
    # AVERAGE JOB MATCH SCORE
    # ============================================================

    avg_application_score = (
        applications
        .filter(
            status__in=[
                "applied",
                "interview",
                "offer",
                "rejected",
            ],
            match_score__gt=0,
        )
        .aggregate(
            average=Avg("match_score")
        )["average"]
        or 0
    )

    avg_application_score = round(
        float(avg_application_score),
        1
    )

    # ============================================================
    # CAREER PROGRESS
    # ============================================================
    #
    # Career Progress is the average of:
    #
    #   Resume Score
    #   Interview Score
    #   Job Application Match Score
    #
    # Missing scores are ignored.
    #
    # Example:
    #
    # Resume = 74
    # Interview = 80
    # Applications = 76
    #
    # Career Progress =
    #
    # (74 + 80 + 76) / 3
    #
    # = 76.7%
    # ============================================================

    career_scores = []

    if cv_score and float(cv_score) > 0:

        career_scores.append(
            float(cv_score)
        )

    if (
        avg_interview_score
        and avg_interview_score > 0
    ):

        career_scores.append(
            avg_interview_score
        )

    if (
        avg_application_score
        and avg_application_score > 0
    ):

        career_scores.append(
            avg_application_score
        )

    if career_scores:

        career_progress = round(
            sum(career_scores)
            / len(career_scores),
            1,
        )

    else:

        career_progress = 0

    # ============================================================
    # DASHBOARD CONTEXT
    # ============================================================

    context = {

        # User
        "profile": profile,

        # Resume
        "cv_score": round(
            float(cv_score),
            1,
        ),

        # Interviews
        "avg_interview_score": (
            avg_interview_score
        ),

        "completed_interviews": (
            completed_interview_count
        ),

        # Applications
        "submitted_applications": (
            submitted_applications
        ),

        "avg_application_score": (
            avg_application_score
        ),

        # Career
        "career_progress": (
            career_progress
        ),

        # Existing statistics
        "total_cv_analyses": (
            stats.cv_analyses
        ),

        "mock_interviews": (
            stats.mock_interviews
        ),

        "scholarships_found": (
            stats.scholarships_found
        ),

        "ai_recommendations": (
            stats.ai_recommendations
        ),
    }

    return render(
        request,
        "dashboard.html",
        context,
    )


# ============================================================
# INCREMENT CV ANALYSIS
# ============================================================

@login_required
def increment_cv(request):

    stats, _ = UserStats.objects.get_or_create(
        user=request.user
    )

    stats.cv_analyses += 1

    stats.save()

    return JsonResponse({
        "success": True,
        "cv_analyses": stats.cv_analyses,
    })