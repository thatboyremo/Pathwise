from django.urls import path
from . import views


urlpatterns = [
    path(
        "",
        views.jobs_api,
        name="jobs_api",
    ),

    path(
        "<int:job_id>/apply/",
        views.apply_to_job,
        name="apply-to-job",
    ),
]