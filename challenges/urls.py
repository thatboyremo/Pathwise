from django.urls import path

from . import views


urlpatterns = [

    # =====================================================
    # CHALLENGE CATEGORIES
    # =====================================================

    path(
        "categories/",
        views.categories_api,
        name="categories",
    ),

    # =====================================================
    # CHALLENGE DIFFICULTIES
    # =====================================================

    path(
        "difficulties/",
        views.difficulties_api,
        name="difficulties",
    ),

    # =====================================================
    # TODAY'S CHALLENGES
    # =====================================================

    path(
        "today/",
        views.today_challenges_api,
        name="today-challenges",
    ),

    # =====================================================
    # USER STATS
    # =====================================================

    path(
        "stats/",
        views.stats_api,
        name="stats",
    ),

    # =====================================================
    # GENERATE CHALLENGES
    # =====================================================

    path(
        "generate/",
        views.generate_challenges_api,
        name="generate-challenges",
    ),

    # =====================================================
    # OVERALL LEADERBOARD
    # =====================================================

    path(
        "leaderboard/",
        views.overall_leaderboard_api,
        name="overall-leaderboard",
    ),

    # =====================================================
    # START CHALLENGE
    # =====================================================

    path(
        "<int:challenge_id>/start/",
        views.start_challenge_api,
        name="start-challenge",
    ),

    # =====================================================
    # COMPLETE CHALLENGE
    # =====================================================

    path(
        "<int:challenge_id>/complete/",
        views.complete_challenge_api,
        name="complete-challenge",
    ),

    # =====================================================
    # CHALLENGE-SPECIFIC LEADERBOARD
    # =====================================================

    path(
        "<int:challenge_id>/leaderboard/",
        views.challenge_leaderboard_api,
        name="challenge-leaderboard",
    ),
]