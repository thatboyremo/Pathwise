from rest_framework import serializers

from .models import (
    Challenge,
    ChallengeCategory,
    ChallengeDifficulty,
    UserChallenge,
    UserChallengeStats,
)


class ChallengeDifficultySerializer(serializers.ModelSerializer):
    class Meta:
        model = ChallengeDifficulty
        fields = [
            "id",
            "name",
            "description",
            "points",
            "order",
        ]


class ChallengeCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = ChallengeCategory
        fields = [
            "id",
            "name",
            "description",
        ]


class ChallengeSerializer(serializers.ModelSerializer):
    category = ChallengeCategorySerializer(
        read_only=True
    )

    difficulty = ChallengeDifficultySerializer(
        read_only=True
    )

    class Meta:
        model = Challenge
        fields = [
            "id",
            "title",
            "description",
            "category",
            "difficulty",
            "challenge_type",
            "evaluation_config",
            "skills",
            "target_roles",
            "estimated_minutes",
            "instructions",
            "resources",
            "is_ai_generated",
            "created_at",
        ]


class UserChallengeSerializer(serializers.ModelSerializer):
    challenge = ChallengeSerializer(
        read_only=True
    )

    points = serializers.IntegerField(
        source="challenge.difficulty.points",
        read_only=True,
    )

    class Meta:
        model = UserChallenge
        fields = [
            "id",
            "challenge",
            "assigned_date",
            "status",
            "started_at",
            "completed_at",
            "points",
            "earned_points",
            "completion_data",
        ]


class UserChallengeStatsSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserChallengeStats
        fields = [
            "total_xp",
            "current_streak",
            "longest_streak",
            "challenges_completed",
            "last_completed_date",
            "daily_bonus_xp",
        ]