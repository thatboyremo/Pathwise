from datetime import timedelta

from django.db.models import Avg
from django.utils import timezone
from django.utils.timesince import timesince

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from interview.models import InterviewSession
from jobs.models import JobApplication
from users.models import UserProfile
from api.serializers import UserProfileSerializer
from analyzer.models import ResumeAnalysis


# ============================================================
# DASHBOARD
# ============================================================

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def dashboard_api(request):

    user = request.user

    # ========================================================
    # PROFILE
    # ========================================================

    profile, _ = UserProfile.objects.get_or_create(
        user=user
    )

    profile_data = UserProfileSerializer(
        profile
    ).data

    # ========================================================
    # RESUME SCORE
    # ========================================================

    resume_score = 0
    latest_analysis = None

    latest_analysis = (
        ResumeAnalysis.objects
        .filter(user=user)
        .order_by("-created_at")
        .first()
    )

    if latest_analysis:
        resume_score = float(
            latest_analysis.score or 0
        )

    # ========================================================
    # INTERVIEWS
    # ========================================================

    interviews = InterviewSession.objects.filter(
        user=user
    )

    completed_interview_statuses = [
        "completed",
        "complete",
        "finished",
    ]

    completed_interviews = interviews.filter(
        status__in=completed_interview_statuses
    )

    # ========================================================
    # INTERVIEW COUNT
    # ========================================================

    interview_count = (
        completed_interviews.count()
    )

    # ========================================================
    # AVERAGE INTERVIEW SCORE
    # ========================================================

    avg_interview_score = (
        completed_interviews
        .filter(
            overall_score__isnull=False,
            overall_score__gt=0,
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

    # ========================================================
    # JOB APPLICATIONS
    # ========================================================

    applications = JobApplication.objects.filter(
        user=user
    )

    # ========================================================
    # SUBMITTED APPLICATIONS
    # ========================================================

    submitted_application_statuses = [
        "applied",
        "submitted",
        "pending",
        "interview",
        "offer",
        "rejected",
        "accepted",
        "withdrawn",
    ]

    submitted_applications = applications.filter(
        status__in=submitted_application_statuses
    )

    application_count = (
        submitted_applications.count()
    )

    # ========================================================
    # AVERAGE APPLICATION MATCH SCORE
    # ========================================================

    avg_application_score = (
        submitted_applications
        .filter(
            match_score__isnull=False,
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

    # ========================================================
    # CAREER PROGRESS
    # ========================================================

    career_scores = []

    if resume_score > 0:
        career_scores.append(
            resume_score
        )

    if avg_interview_score > 0:
        career_scores.append(
            avg_interview_score
        )

    if avg_application_score > 0:
        career_scores.append(
            avg_application_score
        )

    if career_scores:

        career_progress = round(
            sum(career_scores)
            / len(career_scores),
            1
        )

    else:

        career_progress = 0

    # Make sure score stays between 0 and 100.

    career_progress = min(
        100,
        max(
            0,
            career_progress
        )
    )

    # ========================================================
    # SCORE CHANGE
    # ========================================================

    score_change = 0

    analyses = list(
        ResumeAnalysis.objects
        .filter(user=user)
        .order_by("-created_at")[:2]
    )

    if len(analyses) >= 2:

        latest_score = float(
            analyses[0].score or 0
        )

        previous_score = float(
            analyses[1].score or 0
        )

        score_change = round(
            latest_score - previous_score,
            1
        )

    # ========================================================
    # WEEKLY PROGRESS
    # ========================================================

    now = timezone.now()

    week_start = (
        now
        - timedelta(
            days=now.weekday()
        )
    ).replace(
        hour=0,
        minute=0,
        second=0,
        microsecond=0,
    )

    # ========================================================
    # APPLICATIONS THIS WEEK
    # ========================================================

    weekly_applications = (
        submitted_applications
        .filter(
            created_at__gte=week_start
        )
        .count()
    )

    # ========================================================
    # INTERVIEWS THIS WEEK
    # ========================================================

    weekly_interviews = (
        completed_interviews
        .filter(
            completed_at__gte=week_start
        )
        .count()
    )

    # ========================================================
    # WEEKLY PROGRESS DATA
    # ========================================================

    weekly_progress = [

        {
            "label": "Applications sent",

            "value": (
                f"{weekly_applications} "
                f"this week"
            ),

            "current": (
                weekly_applications
            ),

            "target": 5,

            "pct": min(
                round(
                    (
                        weekly_applications
                        / 5
                    ) * 100
                ),
                100,
            ),
        },

        {
            "label": "Mock interviews",

            "value": (
                f"{weekly_interviews} "
                f"this week"
            ),

            "current": (
                weekly_interviews
            ),

            "target": 3,

            "pct": min(
                round(
                    (
                        weekly_interviews
                        / 3
                    ) * 100
                ),
                100,
            ),
        },
    ]

    # ========================================================
    # AI RECOMMENDATIONS
    # ========================================================

    recommendations = []

    # ========================================================
    # CV RECOMMENDATION
    # ========================================================

    if resume_score <= 0:

        recommendations.append({
            "title": "Analyze your CV",

            "meta": (
                "Upload your CV to get your "
                "first career score."
            ),

            "action": "/dashboard/resume",
        })

    elif resume_score < 70:

        recommendations.append({
            "title": "Strengthen your CV",

            "meta": (
                "Your current CV score suggests "
                "there is room for improvement."
            ),

            "action": "/dashboard/resume",
        })

    elif resume_score < 85:

        recommendations.append({
            "title": "Optimize your CV further",

            "meta": (
                "Your CV is progressing well. "
                "Focus on stronger keywords and "
                "measurable achievements."
            ),

            "action": "/dashboard/resume",
        })

    else:

        recommendations.append({
            "title": "Your CV is looking strong",

            "meta": (
                "Keep your resume updated as you "
                "gain new experience."
            ),

            "action": "/dashboard/resume",
        })

    # ========================================================
    # INTERVIEW RECOMMENDATION
    # ========================================================

    if interview_count == 0:

        recommendations.append({
            "title": (
                "Complete your first "
                "mock interview"
            ),

            "meta": (
                "Practice your answers and get "
                "your first interview score."
            ),

            "action": "/dashboard/interview",
        })

    elif avg_interview_score < 70:

        recommendations.append({
            "title": (
                "Practice your interview skills"
            ),

            "meta": (
                "Your interview score has room "
                "to improve with more practice."
            ),

            "action": "/dashboard/interview",
        })

    else:

        recommendations.append({
            "title": (
                "Keep practicing interviews"
            ),

            "meta": (
                "Regular practice can help maintain "
                "your interview performance."
            ),

            "action": "/dashboard/interview",
        })

    # ========================================================
    # APPLICATION RECOMMENDATION
    # ========================================================

    if application_count == 0:

        recommendations.append({
            "title": "Start applying",

            "meta": (
                "Explore jobs that match your "
                "career profile."
            ),

            "action": "/jobs",
        })

    else:

        recommendations.append({
            "title": (
                "Keep your application momentum"
            ),

            "meta": (
                f"You have submitted "
                f"{application_count} application"
                f"{'' if application_count == 1 else 's'}."
            ),

            "action": "/jobs",
        })

    # Only return the first 3 recommendations.

    recommendations = recommendations[:3]

    # ========================================================
    # RECENT ACTIVITIES
    # ========================================================

    activities = []

    # ========================================================
    # RESUME ACTIVITY
    # ========================================================

    if latest_analysis:

        activities.append({

            "id": (
                f"resume-"
                f"{latest_analysis.id}"
            ),

            "type": "resume",

            "title": "Resume analyzed",

            "meta": (
                f"Your CV received a score of "
                f"{round(resume_score, 1)}%."
            ),

            "time": (
                timesince(
                    latest_analysis.created_at
                )
                + " ago"
            ),

            "created_at": (
                latest_analysis.created_at
            ),
        })

    # ========================================================
    # INTERVIEW ACTIVITIES
    # ========================================================

    latest_interviews = (
        completed_interviews
        .order_by(
            "-completed_at",
            "-started_at",
        )[:10]
    )

    for interview in latest_interviews:

        interview_time = (
            interview.completed_at
            or interview.started_at
        )

        activities.append({

            "id": (
                f"interview-"
                f"{interview.id}"
            ),

            "type": "interview",

            "title": (
                "Mock interview completed"
            ),

            "meta": (
                f"{interview.job_role} at "
                f"{interview.company} • "
                f"Score: "
                f"{round(interview.overall_score or 0, 1)}%"
            ),

            "time": (
                timesince(
                    interview_time
                )
                + " ago"
            ),

            "created_at": interview_time,
        })

    # ========================================================
    # APPLICATION ACTIVITIES
    # ========================================================

    latest_applications = (
        submitted_applications
        .select_related("job")
        .order_by("-updated_at")[:10]
    )

    for application in latest_applications:

        if not application.job:
            continue

        activities.append({

            "id": (
                f"application-"
                f"{application.id}"
            ),

            "type": "application",

            "title": (
                "Job application updated"
            ),

            "meta": (
                f"{application.job.title} at "
                f"{application.job.company} • "
                f"{application.status.title()}"
            ),

            "time": (
                timesince(
                    application.updated_at
                )
                + " ago"
            ),

            "created_at": (
                application.updated_at
            ),
        })

    # ========================================================
    # SORT ACTIVITIES
    # ========================================================

    activities.sort(
        key=lambda activity: (
            activity["created_at"]
        ),
        reverse=True,
    )

    activities = activities[:10]

    # Remove internal sorting field.

    for activity in activities:

        activity.pop(
            "created_at",
            None
        )

    # ========================================================
    # TOP JOB MATCHES
    # ========================================================

    top_jobs = []

    applied_jobs = (
        submitted_applications
        .select_related("job")
        .filter(
            match_score__isnull=False,
            match_score__gt=0,
        )
        .order_by(
            "-match_score",
            "-updated_at",
        )[:5]
    )

    seen_job_ids = set()

    for application in applied_jobs:

        if not application.job:
            continue

        job = application.job

        if job.id in seen_job_ids:
            continue

        seen_job_ids.add(
            job.id
        )

        title = (
            job.title
            or "Job opportunity"
        )

        company = (
            job.company
            or "Company"
        )

        location = (
            job.location
            or "Location not specified"
        )

        job_type = (
            job.job_type
            or "Job"
        )

        meta = (
            f"{company} • "
            f"{location} • "
            f"{job_type}"
        )

        code = "".join(
            word[0]
            for word in title.split()
            if word
        )[:2].upper()

        top_jobs.append({

            "id": job.id,

            "code": code,

            "title": title,

            "meta": meta,

            "match": round(
                float(
                    application.match_score
                    or 0
                )
            ),

            "apply_url": (
                job.apply_url
                or ""
            ),
        })

    # ========================================================
    # UPCOMING
    # ========================================================

    upcoming = []

    # ========================================================
    # FINAL RESPONSE
    # ========================================================

    data = {

        "success": True,

        # ====================================================
        # USER
        # ====================================================

        "user": {

            "username": (
                user.first_name
                or user.username
            ),

            "email": user.email,
        },

        # ====================================================
        # PROFILE
        # ====================================================

        "profile": profile_data,

        # ====================================================
        # SKILLS
        # ====================================================

        "skills": [],

        # ====================================================
        # EXPERIENCES
        # ====================================================

        "experiences": [],

        # ====================================================
        # STATISTICS
        # ====================================================

        "stats": {

            "resume_score": round(
                resume_score,
                1
            ),

            "applications": (
                application_count
            ),

            "interviews": (
                interview_count
            ),

            "career_progress": (
                career_progress
            ),

            "avg_interview_score": (
                avg_interview_score
            ),

            "avg_application_score": (
                avg_application_score
            ),

            "score_change": (
                score_change
            ),
        },

        # ====================================================
        # ACTIVITIES
        # ====================================================

        "activities": activities,

        # ====================================================
        # RECOMMENDED JOBS
        # ====================================================

        "recommended_jobs": top_jobs,

        # ====================================================
        # WEEKLY PROGRESS
        # ====================================================

        "weekly_progress": weekly_progress,

        # ====================================================
        # RECOMMENDATIONS
        # ====================================================

        "recommendations": recommendations,

        # ====================================================
        # UPCOMING
        # ====================================================

        "upcoming": upcoming,
    }

    # ========================================================
    # DEBUG
    # ========================================================

    print("\n")
    print("========================================")
    print("           DASHBOARD DEBUG")
    print("========================================")

    print(
        "User:",
        user.username
    )

    print(
        "User ID:",
        user.id
    )

    print("----------------------------------------")

    print(
        "Resume score:",
        resume_score
    )

    print(
        "Total interview records:",
        interviews.count()
    )

    print(
        "Completed interviews:",
        interview_count
    )

    print(
        "Average interview score:",
        avg_interview_score
    )

    print("----------------------------------------")

    print(
        "Total application records:",
        applications.count()
    )

    print(
        "Submitted applications:",
        application_count
    )

    print(
        "Average application score:",
        avg_application_score
    )

    print("----------------------------------------")

    print(
        "Career progress:",
        career_progress
    )

    print(
        "Weekly applications:",
        weekly_applications
    )

    print(
        "Weekly interviews:",
        weekly_interviews
    )

    print("========================================")
    print("\n")

    return Response(
        data
    )