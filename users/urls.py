from django.urls import path
from . import views


urlpatterns = [

    # =====================================================
    # AUTHENTICATION
    # =====================================================

    path(
        "register/",
        views.register_api,
        name="register",
    ),

    path(
        "login/",
        views.login_api,
        name="login",
    ),

    path(
        "forgot-password/",
        views.forgot_password,
        name="forgot_password",
    ),


    # =====================================================
    # DASHBOARD
    # =====================================================

    path(
        "dashboard/",
        views.dashboard_api,
        name="dashboard",
    ),


    # =====================================================
    # CV ANALYSIS
    # =====================================================

    path(
        "analyze-cv/",
        views.analyze_cv,
        name="analyze_cv",
    ),


    # =====================================================
    # PROFILE
    # =====================================================

    path(
        "profile/",
        views.profile_api,
        name="profile",
    ),


    # =====================================================
    # SKILLS
    # =====================================================

    path(
        "skills/",
        views.skill_create,
        name="skill_create",
    ),

    path(
        "skills/<int:skill_id>/",
        views.skill_detail,
        name="skill_detail",
    ),


    # =====================================================
    # EXPERIENCE
    # =====================================================

    path(
        "experiences/",
        views.experience_create,
        name="experience_create",
    ),

    path(
        "experiences/<int:experience_id>/",
        views.experience_detail,
        name="experience_detail",
    ),


    # =====================================================
    # EDUCATION
    # =====================================================

    path(
        "education/",
        views.education_create,
        name="education_create",
    ),

    path(
        "education/<int:education_id>/",
        views.education_detail,
        name="education_detail",
    ),


    # =====================================================
    # PROJECTS
    # =====================================================

    path(
        "projects/",
        views.project_create,
        name="project_create",
    ),

    path(
        "projects/<int:project_id>/",
        views.project_detail,
        name="project_detail",
    ),
]