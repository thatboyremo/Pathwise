from django.urls import path
from . import views
from .views import cv_analyzer_api, get_notifications

app_name = "analyzer"

urlpatterns = [
    path("cv/", views.cv_analyzer, name="cv_analyzer"),
    path("mock/", views.mock_interview, name="mock_interview"),
    path("scholarships/", views.scholarships, name="scholarships"),
    path("settings/", views.settings, name="settings"),
    path("ai-advisor/", views.ai_advisor, name="ai_advisor"),
    path("api/analyze/", cv_analyzer_api, name="cv_api"),
    path("api/notifications/", get_notifications, name="notifications"),
    
]