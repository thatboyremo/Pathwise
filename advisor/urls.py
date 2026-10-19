from django.urls import path
from . import views
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)


app_name = "advisor"

urlpatterns = [
    path(
        "ai-advisor/",
        views.ai_advisor,
        name="ai_advisor",
    ),

    path(
        "settings/",
        views.settings,
        name="settings",
    ),

    path(
        "chat/",
        views.advisor_chat,
        name="advisor_chat",
    ),

        path(
        "api/login/",
        TokenObtainPairView.as_view(),
        name="token_obtain_pair"
    ),

    path(
        "api/token/refresh/",
        TokenRefreshView.as_view(),
        name="token_refresh"
    ),
]