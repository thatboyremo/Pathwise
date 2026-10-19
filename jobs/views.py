from django.db.models import Q
from django.utils import timezone

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from .models import Job, JobApplication
from users.models import Skill


# ============================================================
# JOBS
# ============================================================

@api_view(["GET"])
@permission_classes([AllowAny])
def jobs_api(request):

    # ==================================================
    # SEARCH
    # ==================================================

    search = request.GET.get(
        "search",
        "",
    ).strip()

    # ==================================================
    # FILTERS
    # ==================================================

    location = request.GET.get(
        "location",
        "",
    ).strip()

    job_type = request.GET.get(
        "job_type",
        "",
    ).strip().lower()

    experience = request.GET.get(
        "experience",
        "",
    ).strip().lower()

    # ==================================================
    # GET JOBS
    # ==================================================

    jobs = Job.objects.all()

    # ==================================================
    # SEARCH
    # ==================================================

    if search:

        jobs = jobs.filter(
            Q(title__icontains=search)
            | Q(company__icontains=search)
            | Q(location__icontains=search)
            | Q(description__icontains=search)
            | Q(requirements__icontains=search)
        )

    # ==================================================
    # LOCATION FILTER
    # ==================================================

    if location:

        jobs = jobs.filter(
            location__icontains=location
        )

    # ==================================================
    # JOB TYPE FILTER
    # ==================================================

    if job_type:

        jobs = jobs.filter(
            job_type=job_type
        )

    # ==================================================
    # EXPERIENCE FILTER
    # ==================================================

    if experience:

        jobs = jobs.filter(
            experience=experience
        )

    # ==================================================
    # ORDER
    # ==================================================

    jobs = jobs.order_by(
        "-featured",
        "-posted_at",
    )[:200]

    # ==================================================
    # BUILD RESPONSE
    # ==================================================

    results = []

    for job in jobs:

        results.append({

            "id": job.id,

            "title": job.title,

            "company": job.company,

            "location": job.location,

            "type": job.get_job_type_display(),

            "experience": job.get_experience_display(),

            "salary": job.salary,

            "description": job.description,

            "skills": [
                skill.strip()
                for skill in job.requirements.split(",")
                if skill.strip()
            ],

            "apply_url": job.apply_url,

            "logo": job.logo,

            "source": job.source,

            "featured": job.featured,

            "posted_at": job.posted_at,

            "expires_at": job.expires_at,

        })

    # ==================================================
    # RESPONSE
    # ==================================================

    return Response({
        "count": len(results),
        "results": results,
    })



# ============================================================
# CALCULATE JOB MATCH
# ============================================================

def calculate_job_match(user, job):
    """
    Calculate how closely the user's saved skills
    match the skills/requirements of a job.
    """

    # --------------------------------------------------------
    # USER SKILLS
    # --------------------------------------------------------

    user_skills = list(
        Skill.objects.filter(
            user=user
        ).values_list(
            "name",
            flat=True,
        )
    )

    user_skills = {
        skill.strip().lower()
        for skill in user_skills
        if skill and skill.strip()
    }

    if not user_skills:
        return 0

    # --------------------------------------------------------
    # JOB REQUIREMENTS
    # --------------------------------------------------------

    job_requirements = [
        requirement.strip().lower()
        for requirement in (job.requirements or "").split(",")
        if requirement.strip()
    ]

    if not job_requirements:
        return 0

    # --------------------------------------------------------
    # MATCH REQUIREMENTS AGAINST USER SKILLS
    # --------------------------------------------------------

    matched_requirements = 0

    for requirement in job_requirements:

        for skill in user_skills:

            # Match in either direction.
            #
            # Example:
            # requirement = "writing"
            # skill = "research & technical writing"
            #
            # "writing" in "research & technical writing"
            # = True

            if (
                requirement in skill
                or skill in requirement
            ):
                matched_requirements += 1
                break

    # --------------------------------------------------------
    # CALCULATE SCORE
    # --------------------------------------------------------

    score = (
        matched_requirements
        / len(job_requirements)
    ) * 100

    return round(
        min(score, 100),
        1,
    )

from django.shortcuts import get_object_or_404
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import Job, JobApplication


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def apply_to_job(request, job_id):
    job = get_object_or_404(Job, id=job_id)

    match_score = calculate_job_match(request.user, job)

    application, created = JobApplication.objects.get_or_create(
        user=request.user,
        job=job,
        defaults={
            "status": "applied",
            "match_score": match_score,
        },
    )

    if not created:
        application.match_score = match_score

        if application.status == "saved":
            application.status = "applied"

        application.save()

    return Response({
        "success": True,
        "created": created,
        "message": "Application recorded successfully.",
        "application": {
            "id": application.id,
            "job_id": job.id,
            "status": application.status,
            "match_score": application.match_score,
            "applied_at": application.applied_at,
        },
        "apply_url": job.apply_url,
    })



