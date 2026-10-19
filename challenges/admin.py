from django.contrib import admin

from .models import (
    Challenge,
    ChallengeCategory,
    ChallengeDifficulty,
    UserChallenge,
    UserChallengeStats,
)


# =========================================================
# CHALLENGE DIFFICULTY
# =========================================================

@admin.register(ChallengeDifficulty)
class ChallengeDifficultyAdmin(admin.ModelAdmin):
    list_display = (
        "name",
        "points",
        "order",
        "is_active",
        "created_at",
    )

    list_filter = (
        "is_active",
    )

    search_fields = (
        "name",
        "description",
    )

    ordering = (
        "order",
        "name",
    )


# =========================================================
# CHALLENGE CATEGORY
# =========================================================

@admin.register(ChallengeCategory)
class ChallengeCategoryAdmin(admin.ModelAdmin):
    list_display = (
        "name",
        "is_active",
        "created_at",
    )

    list_filter = (
        "is_active",
    )

    search_fields = (
        "name",
        "description",
    )

    ordering = (
        "name",
    )


# =========================================================
# CHALLENGE
# =========================================================

@admin.register(Challenge)
class ChallengeAdmin(admin.ModelAdmin):
    list_display = (
        "title",
        "category",
        "difficulty",
        "is_ai_generated",
        "is_active",
        "estimated_minutes",
        "created_at",
    )

    list_filter = (
        "category",
        "difficulty",
        "is_ai_generated",
        "is_active",
    )

    search_fields = (
        "title",
        "description",
    )

    autocomplete_fields = (
        "category",
        "difficulty",
    )

    readonly_fields = (
        "created_at",
        "updated_at",
    )

    ordering = (
        "-created_at",
    )


# =========================================================
# USER CHALLENGE
# =========================================================

@admin.register(UserChallenge)
class UserChallengeAdmin(admin.ModelAdmin):
    list_display = (
        "user",
        "challenge",
        "assigned_date",
        "status",
        "earned_points",
        "started_at",
        "completed_at",
    )

    list_filter = (
        "status",
        "assigned_date",
    )

    search_fields = (
        "user__username",
        "user__email",
        "challenge__title",
    )

    autocomplete_fields = (
        "user",
        "challenge",
    )

    readonly_fields = (
        "created_at",
        "updated_at",
    )

    ordering = (
        "-assigned_date",
        "-created_at",
    )


# =========================================================
# USER CHALLENGE STATS
# =========================================================

@admin.register(UserChallengeStats)
class UserChallengeStatsAdmin(admin.ModelAdmin):
    list_display = (
        "user",
        "total_xp",
        "challenges_completed",
        "current_streak",
        "longest_streak",
        "last_completed_date",
    )

    search_fields = (
        "user__username",
        "user__email",
    )

    autocomplete_fields = (
        "user",
    )

    readonly_fields = (
        "created_at",
        "updated_at",
    )

    ordering = (
        "-total_xp",
    )