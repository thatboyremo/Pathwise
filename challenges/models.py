from django.contrib.auth.models import User
from django.db import models
from django.utils import timezone


# =========================================================
# CHALLENGE DIFFICULTY
# =========================================================

class ChallengeDifficulty(models.Model):
    name = models.CharField(
        max_length=50,
        unique=True,
    )

    description = models.TextField(
        blank=True,
    )

    points = models.PositiveIntegerField(
        default=0,
    )

    order = models.PositiveIntegerField(
        default=0,
    )

    is_active = models.BooleanField(
        default=True,
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    class Meta:
        ordering = ["order"]

    def __str__(self):
        return f"{self.name} ({self.points} XP)"


# =========================================================
# CHALLENGE CATEGORY
# =========================================================

class ChallengeCategory(models.Model):
    name = models.CharField(
        max_length=100,
        unique=True,
    )

    description = models.TextField(
        blank=True,
    )

    is_active = models.BooleanField(
        default=True,
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    class Meta:
        ordering = ["name"]

    def __str__(self):
        return self.name


# =========================================================
# CHALLENGE
# =========================================================

class Challenge(models.Model):

    CHALLENGE_TYPE_CHOICES = [
        ("open_ended", "Open Ended"),
        ("quiz", "Quiz"),
        ("coding", "Coding"),
        ("sql", "SQL"),
        ("project", "Project"),
        ("interview", "Interview"),
        ("learning", "Learning"),
    ]

    title = models.CharField(
        max_length=255,
    )

    description = models.TextField()

    category = models.ForeignKey(
        ChallengeCategory,
        on_delete=models.PROTECT,
        related_name="challenges",
    )

    difficulty = models.ForeignKey(
        ChallengeDifficulty,
        on_delete=models.PROTECT,
        related_name="challenges",
    )

    # -----------------------------------------------------
    # Challenge Type
    # -----------------------------------------------------

    challenge_type = models.CharField(
        max_length=30,
        choices=CHALLENGE_TYPE_CHOICES,
        default="open_ended",
    )

    # -----------------------------------------------------
    # Skills
    # -----------------------------------------------------

    skills = models.JSONField(
        default=list,
        blank=True,
    )

    # -----------------------------------------------------
    # Target Roles
    # -----------------------------------------------------

    target_roles = models.JSONField(
        default=list,
        blank=True,
    )

    # -----------------------------------------------------
    # Estimated Completion Time
    # -----------------------------------------------------

    estimated_minutes = models.PositiveIntegerField(
        default=30,
    )

    # -----------------------------------------------------
    # Instructions
    # -----------------------------------------------------

    instructions = models.JSONField(
        default=list,
        blank=True,
    )

    # -----------------------------------------------------
    # Resources
    # -----------------------------------------------------

    resources = models.JSONField(
        default=list,
        blank=True,
    )

    # -----------------------------------------------------
    # AI Evaluation Configuration
    # -----------------------------------------------------

    evaluation_config = models.JSONField(
        default=dict,
        blank=True,
    )

    # -----------------------------------------------------
    # AI / Status
    # -----------------------------------------------------

    is_ai_generated = models.BooleanField(
        default=False,
    )

    is_active = models.BooleanField(
        default=True,
    )

    # -----------------------------------------------------
    # Timestamps
    # -----------------------------------------------------

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    updated_at = models.DateTimeField(
        auto_now=True,
    )

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return self.title


# =========================================================
# USER CHALLENGE
# =========================================================

class UserChallenge(models.Model):

    STATUS_CHOICES = [
        ("assigned", "Assigned"),
        ("in_progress", "In Progress"),
        ("completed", "Completed"),
        ("expired", "Expired"),
    ]

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="challenge_assignments",
    )

    challenge = models.ForeignKey(
        Challenge,
        on_delete=models.CASCADE,
        related_name="user_assignments",
    )

    assigned_date = models.DateField(
        default=timezone.localdate,
    )

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="assigned",
    )

    started_at = models.DateTimeField(
        null=True,
        blank=True,
    )

    completed_at = models.DateTimeField(
        null=True,
        blank=True,
    )

    earned_points = models.PositiveIntegerField(
        default=0,
    )

    completion_data = models.JSONField(
        default=dict,
        blank=True,
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    updated_at = models.DateTimeField(
        auto_now=True,
    )

    class Meta:
        ordering = [
            "-assigned_date",
            "id",
        ]

        constraints = [
            models.UniqueConstraint(
                fields=[
                    "user",
                    "challenge",
                    "assigned_date",
                ],
                name="unique_user_challenge_per_day",
            )
        ]

    def __str__(self):
        return (
            f"{self.user.username} - "
            f"{self.challenge.title} - "
            f"{self.assigned_date}"
        )


# =========================================================
# USER CHALLENGE STATS
# =========================================================

class UserChallengeStats(models.Model):

    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name="challenge_stats",
    )

    total_xp = models.PositiveIntegerField(
        default=0,
    )

    current_streak = models.PositiveIntegerField(
        default=0,
    )

    longest_streak = models.PositiveIntegerField(
        default=0,
    )

    challenges_completed = models.PositiveIntegerField(
        default=0,
    )

    last_completed_date = models.DateField(
        null=True,
        blank=True,
    )

    daily_bonus_xp = models.PositiveIntegerField(
        default=50,
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    updated_at = models.DateTimeField(
        auto_now=True,
    )

    def __str__(self):
        return (
            f"{self.user.username} - "
            f"{self.total_xp} XP"
        )