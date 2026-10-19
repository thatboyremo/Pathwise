from django.db import models
from django.contrib.auth.models import User




class Notification(models.Model):

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE
    )

    message = models.TextField()

    is_read = models.BooleanField(
        default=False
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    def __str__(self):
        return self.message


class ResumeAnalysis(models.Model):

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="resume_analyses"
    )

    # =====================================================
    # CV
    # =====================================================

    filename = models.CharField(
        max_length=255,
        blank=True
    )

    word_count = models.IntegerField(
        default=0
    )

    # =====================================================
    # SCORES
    # =====================================================

    score = models.IntegerField(
        default=0
    )

    ats_score = models.IntegerField(
        default=0
    )

    impact_score = models.IntegerField(
        default=0
    )

    keyword_score = models.IntegerField(
        default=0
    )

    format_score = models.IntegerField(
        default=0
    )

    # =====================================================
    # EXTRACTED CV DATA
    # =====================================================

    skills = models.TextField(
        blank=True
    )

    education = models.TextField(
        blank=True
    )

    experience = models.TextField(
        blank=True
    )

    summary = models.TextField(
        blank=True
    )

    linkedin = models.URLField(
        blank=True
    )

    github = models.URLField(
        blank=True
    )

    portfolio = models.URLField(
        blank=True
    )

    phone = models.CharField(
        max_length=30,
        blank=True
    )

    email = models.EmailField(
        blank=True
    )

    # =====================================================
    # ANALYSIS RESULTS
    # =====================================================

    technologies = models.TextField(
        blank=True
    )

    action_verbs = models.TextField(
        blank=True
    )

    metrics_found = models.IntegerField(
        default=0
    )

    strengths = models.JSONField(
        default=list,
        blank=True
    )

    weaknesses = models.JSONField(
        default=list,
        blank=True
    )

    recommendations = models.JSONField(
        default=list,
        blank=True
    )

    # =====================================================
    # TIMESTAMP
    # =====================================================

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.user.username} - {self.filename}"

