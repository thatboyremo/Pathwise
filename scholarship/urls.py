from django.urls import path
from .views import scholarship_api

app_name = "scholarship"

urlpatterns = [
    path("", scholarship_api, name="scholarships"),
]