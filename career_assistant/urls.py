from django.contrib import admin
from django.urls import path, include
from django.contrib.auth import views as auth_views
from django.shortcuts import redirect


urlpatterns = [

    # =====================================================
    # ADMIN
    # =====================================================

    path(
        "admin/",
        admin.site.urls,
    ),


    # =====================================================
    # FRONTEND / DJANGO APPS
    # =====================================================

    path(
        "dashboard/",
        include("dashboard.urls"),
    ),

    path(
        "analyzer/",
        include("analyzer.urls"),
    ),

    path(
        "interview/",
        include("interview.urls"),
    ),


    # =====================================================
    # JOBS API
    # =====================================================

    path(
        "api/jobs/",
        include("jobs.urls"),
    ),


    # =====================================================
    # ALLAUTH
    # =====================================================

    path(
        "accounts/",
        include("allauth.urls"),
    ),


    # =====================================================
    # DJANGO AUTH
    # =====================================================

    path(
        "login/",
        auth_views.LoginView.as_view(
            template_name="login.html",
            redirect_authenticated_user=True,
        ),
        name="login",
    ),

    path(
        "logout/",
        auth_views.LogoutView.as_view(
            next_page="login",
        ),
        name="logout",
    ),


    # =====================================================
    # AI CHAT
    # =====================================================

    path(
        "nova/",
        include("ai_chat.urls"),
    ),


    # =====================================================
    # MAIN REST API
    # =====================================================

    path(
        "api/",
        include("api.urls"),
    ),


    # =====================================================
    # SCHOLARSHIPS API
    # =====================================================

    path(
        "api/scholarships/",
        include("scholarship.urls"),
    ),


    # =====================================================
    # CAREER ADVISOR API
    # =====================================================

    path(
        "api/advisor/",
        include("advisor.urls"),
    ),

    path(
    "api/challenges/",
    include("challenges.urls"),
    ),


    # =====================================================
    # HOME
    # =====================================================

    path(
        "",
        lambda request: redirect("login"),
    ),
]