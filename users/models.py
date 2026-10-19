from django.contrib.auth.models import User
from django.db import models


class UserProfile(models.Model):
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name="profile",
    )

    full_name = models.CharField(
        max_length=255,
        blank=True,
    )

    phone = models.CharField(
        max_length=50,
        blank=True,
    )

    country = models.CharField(
        max_length=100,
        blank=True,
    )

    city = models.CharField(
        max_length=100,
        blank=True,
    )

    bio = models.TextField(
        blank=True,
    )

    career_goal = models.TextField(
        blank=True,
    )

    target_role = models.CharField(
        max_length=255,
        blank=True,
    )

    years_experience = models.PositiveIntegerField(
        default=0,
    )

    work_preference = models.CharField(
        max_length=100,
        blank=True,
    )

    linkedin = models.URLField(
        blank=True,
    )

    github = models.URLField(
        blank=True,
    )

    portfolio = models.URLField(
        blank=True,
    )

    resume_filename = models.CharField(
        max_length=255,
        blank=True,
    )

    resume_score = models.PositiveIntegerField(
        default=0,
    )

    ats_score = models.PositiveIntegerField(
        default=0,
    )

    resume_word_count = models.PositiveIntegerField(
        default=0,
    )

    resume_uploaded = models.BooleanField(
        default=False,
    )

    resume_analyzed = models.BooleanField(
        default=False,
    )

    career_score = models.PositiveIntegerField(
        default=0,
    )

    profile_completion = models.PositiveIntegerField(
        default=0,
    )

    completed = models.BooleanField(
        default=False,
    )

    profile_picture = models.ImageField(
        upload_to="profile_pictures/",
        blank=True,
        null=True,
    )

    def __str__(self):
        return self.full_name or self.user.username


class Skill(models.Model):
    LEVEL_CHOICES = [
        ("Beginner", "Beginner"),
        ("Intermediate", "Intermediate"),
        ("Advanced", "Advanced"),
    ]

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="skills",
    )

    name = models.CharField(
        max_length=100,
    )

    level = models.CharField(
        max_length=20,
        choices=LEVEL_CHOICES,
        default="Intermediate",
    )

    category = models.CharField(
        max_length=100,
        blank=True,
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    def __str__(self):
        return f"{self.name} - {self.user.username}"


class Experience(models.Model):
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="experiences",
    )

    role = models.CharField(
        max_length=255,
    )

    company = models.CharField(
        max_length=255,
    )

    period = models.CharField(
        max_length=100,
        blank=True,
    )

    description = models.TextField(
        blank=True,
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    def __str__(self):
        return f"{self.role} - {self.company}"


class Education(models.Model):
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="educations",
    )

    degree = models.CharField(
        max_length=255,
    )

    institution = models.CharField(
        max_length=255,
    )

    field = models.CharField(
        max_length=255,
        blank=True,
    )

    period = models.CharField(
        max_length=100,
        blank=True,
    )

    grade = models.CharField(
        max_length=100,
        blank=True,
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    def __str__(self):
        return f"{self.degree} - {self.institution}"


class Project(models.Model):
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="projects",
    )

    name = models.CharField(
        max_length=255,
    )

    description = models.TextField(
        blank=True,
    )

    technologies = models.JSONField(
        default=list,
        blank=True,
    )

    url = models.URLField(
        blank=True,
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    def __str__(self):
        return f"{self.name} - {self.user.username}"