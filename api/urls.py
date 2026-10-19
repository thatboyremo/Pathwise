from django.urls import path
from . import views

from .views import (
    logout_api,
    register_api,
    login_api,
    forgot_password,
    dashboard_api,
    analyze_cv,
    profile_api,
    update_profile_api,
)


urlpatterns = [

    # =====================================================
    # AUTHENTICATION
    # =====================================================

    path(
        "register/",
        register_api,
        name="register",
    ),

    path(
        "login/",
        login_api,
        name="login",
    ),

    path(
        "logout/",
        logout_api,
        name="logout_api",
    ),

    path(
        "forgot-password/",
        forgot_password,
        name="forgot-password",
    ),


    # =====================================================
    # DASHBOARD
    # =====================================================

    path(
        "dashboard/",
        dashboard_api,
        name="dashboard",
    ),


    # =====================================================
    # PROFILE
    # =====================================================

    # GET profile
    path(
        "profile/",
        profile_api,
        name="profile",
    ),

    # PUT/PATCH profile
    path(
        "profile/update/",
        update_profile_api,
        name="update_profile",
    ),


    # =====================================================
    # CV ANALYSIS
    # =====================================================

    path(
        "analyze-cv/",
        analyze_cv,
        name="analyze_cv",
    ),

    path(
        "search/",
        views.global_search_api,
        name="global-search",
    ),
]