from django.urls import path

from . import views


app_name = "interview"


urlpatterns = [

    # ========================================================
    # NORMAL DJANGO PAGES
    # ========================================================

    path(
        "",
        views.interview_setup,
        name="interview_setup",
    ),

    path(
        "session/<int:pk>/",
        views.interview_session,
        name="interview_session",
    ),

    path(
        "<int:pk>/submit/",
        views.submit_answer,
        name="submit_answer",
    ),

    path(
        "result/<int:pk>/",
        views.interview_result,
        name="interview_result",
    ),

    path(
        "result/<int:pk>/pdf/",
        views.download_report_pdf,
        name="download_report_pdf",
    ),


    # ========================================================
    # REACT API
    # ========================================================

    path(
        "api/start/",
        views.start_interview_api,
        name="start_interview_api",
    ),

    path(
        "api/<int:pk>/submit/",
        views.submit_answer_api,
        name="submit_answer_api",
    ),

    path(
        "api/session/<int:pk>/",
        views.interview_session_api,
        name="interview_session_api",
    ),

    path(
        "api/result/<int:pk>/",
        views.interview_result_api,
        name="interview_result_api",
    ),
]