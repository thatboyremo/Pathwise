from django.contrib.auth.models import User

from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import (
    UserProfile,
    Skill,
    Experience,
    Education,
    Project,
)


# =========================================================
# PROFILE COMPLETION
# =========================================================

def calculate_profile_completion(profile):
    """
    Calculate the percentage of the user's profile
    that has been completed.
    """

    fields = [
        profile.full_name,
        profile.phone,
        profile.country,
        profile.city,
        profile.bio,
        profile.career_goal,
        profile.target_role,
        profile.linkedin,
        profile.github,
        profile.portfolio,
        profile.work_preference,
    ]

    completed = sum(
        1
        for value in fields
        if value is not None and str(value).strip()
    )

    total = len(fields)

    # Years of experience
    total += 1

    if profile.years_experience > 0:
        completed += 1

    # Skills
    total += 1

    if Skill.objects.filter(user=profile.user).exists():
        completed += 1

    # Experience
    total += 1

    if Experience.objects.filter(user=profile.user).exists():
        completed += 1

    # Education
    total += 1

    if Education.objects.filter(user=profile.user).exists():
        completed += 1

    # Projects
    total += 1

    if Project.objects.filter(user=profile.user).exists():
        completed += 1

    # Resume
    total += 1

    if profile.resume_uploaded:
        completed += 1

    # Profile picture
    total += 1

    if profile.profile_picture:
        completed += 1

    if total == 0:
        return 0

    return min(
        100,
        max(
            0,
            round((completed / total) * 100)
        )
    )


# =========================================================
# CAREER SCORE
# =========================================================

def calculate_career_score(profile):
    """
    Calculate the user's overall career readiness score.
    """

    score = profile.profile_completion

    # Target role
    if profile.target_role:
        score += 10

    # Skills
    skill_count = Skill.objects.filter(
        user=profile.user
    ).count()

    score += min(
        15,
        skill_count * 2
    )

    # Experience
    if profile.years_experience:
        score += min(
            10,
            profile.years_experience * 2
        )

    # Bio
    if profile.bio:
        score += 5

    # Education
    if Education.objects.filter(
        user=profile.user
    ).exists():
        score += 10

    # Work experience
    if Experience.objects.filter(
        user=profile.user
    ).exists():
        score += 10

    # Career goal
    if profile.career_goal:
        score += 10

    # Professional links
    if (
        profile.linkedin
        or profile.github
        or profile.portfolio
    ):
        score += 10

    # Resume
    if profile.resume_uploaded:
        score += 15

    # Resume analyzed
    if profile.resume_analyzed:
        score += 5

    return min(
        100,
        max(
            0,
            score
        )
    )


# =========================================================
# UPDATE PROFILE SCORES
# =========================================================

def update_profile_scores(profile):
    """
    Recalculate and save profile completion,
    career score and completed status.
    """

    profile.profile_completion = (
        calculate_profile_completion(profile)
    )

    profile.career_score = (
        calculate_career_score(profile)
    )

    profile.completed = (
        profile.profile_completion >= 70
    )

    profile.save(
        update_fields=[
            "profile_completion",
            "career_score",
            "completed",
        ]
    )


# =========================================================
# SERIALIZE PROFILE
# =========================================================

def serialize_profile(request, user, profile):
    """
    Convert profile information into JSON.
    """

    skills = [
        {
            "id": skill.id,
            "name": skill.name,
            "level": skill.level,
            "category": skill.category,
        }
        for skill in Skill.objects.filter(
            user=user
        )
    ]

    experiences = [
        {
            "id": experience.id,
            "role": experience.role,
            "company": experience.company,
            "period": experience.period,
            "description": experience.description,
        }
        for experience in Experience.objects.filter(
            user=user
        )
    ]

    educations = [
        {
            "id": education.id,
            "degree": education.degree,
            "institution": education.institution,
            "field": education.field,
            "period": education.period,
            "grade": education.grade,
        }
        for education in Education.objects.filter(
            user=user
        )
    ]

    projects = [
        {
            "id": project.id,
            "name": project.name,
            "description": project.description,
            "technologies": project.technologies,
            "url": project.url,
        }
        for project in Project.objects.filter(
            user=user
        )
    ]

    return {
        "success": True,

        # =================================================
        # USER
        # =================================================

        "user": {
            "id": user.id,
            "username": user.username,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "email": user.email,
        },

        # =================================================
        # PROFILE
        # =================================================

        "profile": {
            "full_name": profile.full_name,
            "phone": profile.phone,
            "country": profile.country,
            "city": profile.city,
            "bio": profile.bio,
            "career_goal": profile.career_goal,
            "target_role": profile.target_role,
            "years_experience": profile.years_experience,
            "work_preference": profile.work_preference,

            "linkedin": profile.linkedin,
            "github": profile.github,
            "portfolio": profile.portfolio,

            # Resume
            "resume_filename": profile.resume_filename,
            "resume_score": profile.resume_score,
            "ats_score": profile.ats_score,
            "resume_word_count": profile.resume_word_count,
            "resume_uploaded": profile.resume_uploaded,
            "resume_analyzed": profile.resume_analyzed,

            # Scores
            "career_score": profile.career_score,
            "profile_completion": profile.profile_completion,
            "completed": profile.completed,

            # Profile picture
            "profile_picture": (
                request.build_absolute_uri(
                    profile.profile_picture.url
                )
                if profile.profile_picture
                else None
            ),
        },

        # =================================================
        # RELATED DATA
        # =================================================

        "skills": skills,
        "experiences": experiences,
        "educations": educations,
        "projects": projects,
    }


# =========================================================
# PROFILE API
# =========================================================

@api_view(["GET", "PUT", "PATCH"])
@permission_classes([IsAuthenticated])
def profile_api(request):

    user = request.user

    profile, created = UserProfile.objects.get_or_create(
        user=user
    )

    # =====================================================
    # GET PROFILE
    # =====================================================

    if request.method == "GET":

        update_profile_scores(profile)

        return Response(
            serialize_profile(
                request,
                user,
                profile,
            )
        )

    # =====================================================
    # PUT / PATCH PROFILE
    # =====================================================

    data = request.data

    # =====================================================
    # USER INFORMATION
    # =====================================================

    if "first_name" in data:

        user.first_name = str(
            data.get("first_name") or ""
        ).strip()

    if "last_name" in data:

        user.last_name = str(
            data.get("last_name") or ""
        ).strip()

    if "email" in data:

        email = str(
            data.get("email") or ""
        ).strip()

        if email:

            existing_user = User.objects.filter(
                email__iexact=email
            ).exclude(
                id=user.id
            ).first()

            if existing_user:

                return Response(
                    {
                        "success": False,
                        "error": (
                            "This email is already being "
                            "used by another account."
                        ),
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )

        user.email = email

    user.save()

    # =====================================================
    # PROFILE INFORMATION
    # =====================================================

    profile_fields = [
        "full_name",
        "phone",
        "country",
        "city",
        "bio",
        "career_goal",
        "target_role",
        "work_preference",
        "linkedin",
        "github",
        "portfolio",
    ]

    for field in profile_fields:

        if field in data:

            setattr(
                profile,
                field,
                str(
                    data.get(field) or ""
                ).strip(),
            )

    # =====================================================
    # YEARS OF EXPERIENCE
    # =====================================================

    if "years_experience" in data:

        try:

            profile.years_experience = max(
                0,
                int(
                    data.get(
                        "years_experience"
                    ) or 0
                ),
            )

        except (
            TypeError,
            ValueError,
        ):

            return Response(
                {
                    "success": False,
                    "error": (
                        "Years of experience must "
                        "be a valid number."
                    ),
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

    # =====================================================
    # SAVE PROFILE
    # =====================================================

    profile.save()

    # =====================================================
    # UPDATE SCORES
    # =====================================================

    update_profile_scores(profile)

    return Response(
        serialize_profile(
            request,
            user,
            profile,
        ),
        status=status.HTTP_200_OK,
    )


# =========================================================
# SKILLS
# =========================================================

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def skill_create(request):

    name = str(
        request.data.get("name") or ""
    ).strip()

    if not name:

        return Response(
            {
                "success": False,
                "error": "Skill name is required.",
            },
            status=status.HTTP_400_BAD_REQUEST,
        )

    skill = Skill.objects.create(
        user=request.user,
        name=name,
        level=request.data.get(
            "level",
            "Intermediate",
        ),
        category=str(
            request.data.get("category") or ""
        ).strip(),
    )

    profile, created = UserProfile.objects.get_or_create(
        user=request.user
    )

    update_profile_scores(profile)

    return Response(
        {
            "success": True,
            "skill": {
                "id": skill.id,
                "name": skill.name,
                "level": skill.level,
                "category": skill.category,
            },
        },
        status=status.HTTP_201_CREATED,
    )


# =========================================================
# SKILL DETAIL
# =========================================================

@api_view(["PUT", "PATCH", "DELETE"])
@permission_classes([IsAuthenticated])
def skill_detail(request, skill_id):

    try:

        skill = Skill.objects.get(
            id=skill_id,
            user=request.user,
        )

    except Skill.DoesNotExist:

        return Response(
            {
                "success": False,
                "error": "Skill not found.",
            },
            status=status.HTTP_404_NOT_FOUND,
        )

    # =====================================================
    # DELETE
    # =====================================================

    if request.method == "DELETE":

        skill.delete()

        profile, created = UserProfile.objects.get_or_create(
            user=request.user
        )

        update_profile_scores(profile)

        return Response({
            "success": True,
            "message": "Skill deleted successfully.",
        })

    # =====================================================
    # UPDATE
    # =====================================================

    if "name" in request.data:

        name = str(
            request.data.get("name") or ""
        ).strip()

        if not name:

            return Response(
                {
                    "success": False,
                    "error": "Skill name cannot be empty.",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        skill.name = name

    if "level" in request.data:

        skill.level = request.data.get(
            "level"
        )

    if "category" in request.data:

        skill.category = str(
            request.data.get("category") or ""
        ).strip()

    skill.save()

    profile, created = UserProfile.objects.get_or_create(
        user=request.user
    )

    update_profile_scores(profile)

    return Response({
        "success": True,
        "skill": {
            "id": skill.id,
            "name": skill.name,
            "level": skill.level,
            "category": skill.category,
        },
    })


# =========================================================
# EXPERIENCE
# =========================================================

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def experience_create(request):

    experience = Experience.objects.create(
        user=request.user,

        role=str(
            request.data.get("role") or ""
        ).strip(),

        company=str(
            request.data.get("company") or ""
        ).strip(),

        period=str(
            request.data.get("period") or ""
        ).strip(),

        description=str(
            request.data.get("description") or ""
        ).strip(),
    )

    profile, created = UserProfile.objects.get_or_create(
        user=request.user
    )

    update_profile_scores(profile)

    return Response(
        {
            "success": True,
            "experience": {
                "id": experience.id,
                "role": experience.role,
                "company": experience.company,
                "period": experience.period,
                "description": experience.description,
            },
        },
        status=status.HTTP_201_CREATED,
    )


# =========================================================
# EXPERIENCE DETAIL
# =========================================================

@api_view(["PUT", "PATCH", "DELETE"])
@permission_classes([IsAuthenticated])
def experience_detail(
    request,
    experience_id
):

    try:

        experience = Experience.objects.get(
            id=experience_id,
            user=request.user,
        )

    except Experience.DoesNotExist:

        return Response(
            {
                "success": False,
                "error": "Experience not found.",
            },
            status=status.HTTP_404_NOT_FOUND,
        )

    # =====================================================
    # DELETE
    # =====================================================

    if request.method == "DELETE":

        experience.delete()

        profile, created = UserProfile.objects.get_or_create(
            user=request.user
        )

        update_profile_scores(profile)

        return Response({
            "success": True,
            "message": (
                "Experience deleted successfully."
            ),
        })

    # =====================================================
    # UPDATE
    # =====================================================

    for field in [
        "role",
        "company",
        "period",
        "description",
    ]:

        if field in request.data:

            setattr(
                experience,
                field,
                str(
                    request.data.get(field) or ""
                ).strip(),
            )

    experience.save()

    profile, created = UserProfile.objects.get_or_create(
        user=request.user
    )

    update_profile_scores(profile)

    return Response({
        "success": True,
        "experience": {
            "id": experience.id,
            "role": experience.role,
            "company": experience.company,
            "period": experience.period,
            "description": experience.description,
        },
    })


# =========================================================
# EDUCATION
# =========================================================

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def education_create(request):

    education = Education.objects.create(
        user=request.user,

        degree=str(
            request.data.get("degree") or ""
        ).strip(),

        institution=str(
            request.data.get("institution") or ""
        ).strip(),

        field=str(
            request.data.get("field") or ""
        ).strip(),

        period=str(
            request.data.get("period") or ""
        ).strip(),

        grade=str(
            request.data.get("grade") or ""
        ).strip(),
    )

    profile, created = UserProfile.objects.get_or_create(
        user=request.user
    )

    update_profile_scores(profile)

    return Response(
        {
            "success": True,
            "education": {
                "id": education.id,
                "degree": education.degree,
                "institution": education.institution,
                "field": education.field,
                "period": education.period,
                "grade": education.grade,
            },
        },
        status=status.HTTP_201_CREATED,
    )


# =========================================================
# EDUCATION DETAIL
# =========================================================

@api_view(["PUT", "PATCH", "DELETE"])
@permission_classes([IsAuthenticated])
def education_detail(
    request,
    education_id
):

    try:

        education = Education.objects.get(
            id=education_id,
            user=request.user,
        )

    except Education.DoesNotExist:

        return Response(
            {
                "success": False,
                "error": "Education not found.",
            },
            status=status.HTTP_404_NOT_FOUND,
        )

    # =====================================================
    # DELETE
    # =====================================================

    if request.method == "DELETE":

        education.delete()

        profile, created = UserProfile.objects.get_or_create(
            user=request.user
        )

        update_profile_scores(profile)

        return Response({
            "success": True,
            "message": (
                "Education deleted successfully."
            ),
        })

    # =====================================================
    # UPDATE
    # =====================================================

    for field in [
        "degree",
        "institution",
        "field",
        "period",
        "grade",
    ]:

        if field in request.data:

            setattr(
                education,
                field,
                str(
                    request.data.get(field) or ""
                ).strip(),
            )

    education.save()

    profile, created = UserProfile.objects.get_or_create(
        user=request.user
    )

    update_profile_scores(profile)

    return Response({
        "success": True,
        "education": {
            "id": education.id,
            "degree": education.degree,
            "institution": education.institution,
            "field": education.field,
            "period": education.period,
            "grade": education.grade,
        },
    })


# =========================================================
# PROJECTS
# =========================================================

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def project_create(request):

    technologies = request.data.get(
        "technologies",
        [],
    )

    if not isinstance(
        technologies,
        list
    ):
        technologies = []

    project = Project.objects.create(
        user=request.user,

        name=str(
            request.data.get("name") or ""
        ).strip(),

        description=str(
            request.data.get("description") or ""
        ).strip(),

        technologies=technologies,

        url=str(
            request.data.get("url") or ""
        ).strip(),
    )

    profile, created = UserProfile.objects.get_or_create(
        user=request.user
    )

    update_profile_scores(profile)

    return Response(
        {
            "success": True,
            "project": {
                "id": project.id,
                "name": project.name,
                "description": project.description,
                "technologies": project.technologies,
                "url": project.url,
            },
        },
        status=status.HTTP_201_CREATED,
    )


# =========================================================
# PROJECT DETAIL
# =========================================================

@api_view(["PUT", "PATCH", "DELETE"])
@permission_classes([IsAuthenticated])
def project_detail(
    request,
    project_id
):

    try:

        project = Project.objects.get(
            id=project_id,
            user=request.user,
        )

    except Project.DoesNotExist:

        return Response(
            {
                "success": False,
                "error": "Project not found.",
            },
            status=status.HTTP_404_NOT_FOUND,
        )

    # =====================================================
    # DELETE
    # =====================================================

    if request.method == "DELETE":

        project.delete()

        profile, created = UserProfile.objects.get_or_create(
            user=request.user
        )

        update_profile_scores(profile)

        return Response({
            "success": True,
            "message": (
                "Project deleted successfully."
            ),
        })

    # =====================================================
    # UPDATE
    # =====================================================

    if "name" in request.data:

        project.name = str(
            request.data.get("name") or ""
        ).strip()

    if "description" in request.data:

        project.description = str(
            request.data.get("description") or ""
        ).strip()

    if "technologies" in request.data:

        technologies = request.data.get(
            "technologies"
        )

        if isinstance(
            technologies,
            list
        ):

            project.technologies = technologies

    if "url" in request.data:

        project.url = str(
            request.data.get("url") or ""
        ).strip()

    project.save()

    profile, created = UserProfile.objects.get_or_create(
        user=request.user
    )

    update_profile_scores(profile)

    return Response({
        "success": True,
        "project": {
            "id": project.id,
            "name": project.name,
            "description": project.description,
            "technologies": project.technologies,
            "url": project.url,
        },
    })
