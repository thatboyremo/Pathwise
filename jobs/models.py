from django.conf import settings
from django.db import models


class Job(models.Model):

    JOB_TYPES = [
        ("full-time", "Full Time"),
        ("part-time", "Part Time"),
        ("internship", "Internship"),
        ("contract", "Contract"),
        ("remote", "Remote"),
    ]

    EXPERIENCE = [
        ("entry", "Entry"),
        ("junior", "Junior"),
        ("mid", "Mid"),
        ("senior", "Senior"),
    ]

    title = models.CharField(max_length=200)

    company = models.CharField(max_length=200)

    location = models.CharField(max_length=200)

    job_type = models.CharField(
        max_length=20,
        choices=JOB_TYPES,
        default="full-time",
    )

    experience = models.CharField(
        max_length=20,
        choices=EXPERIENCE,
        default="entry",
    )

    salary = models.CharField(
        max_length=100,
        blank=True,
    )

    description = models.TextField()

    requirements = models.TextField(
        blank=True
    )

    apply_url = models.URLField()

    logo = models.URLField(
        blank=True
    )

    source = models.CharField(
        max_length=100,
        default="Pathwise",
    )

    featured = models.BooleanField(
        default=False
    )

    
    posted_at = models.DateTimeField(
        null=True,
        blank=True,
    )

    expires_at = models.DateTimeField(
        blank=True,
        null=True,
    )

    external_id = models.CharField(
        max_length=100,
        blank=True,
        null=True,
    )


    def __str__(self):
        return f"{self.title} - {self.company}"


# ============================================================
# JOB APPLICATION
# ============================================================

class JobApplication(models.Model):

    STATUS_CHOICES = [
        ("saved", "Saved"),
        ("applied", "Applied"),
        ("interview", "Interview"),
        ("offer", "Offer"),
        ("rejected", "Rejected"),
    ]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="job_applications",
    )

    job = models.ForeignKey(
        Job,
        on_delete=models.CASCADE,
        related_name="applications",
    )

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="saved",
    )

    match_score = models.FloatField(
        default=0,
    )

    applied_at = models.DateTimeField(
        blank=True,
        null=True,
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    updated_at = models.DateTimeField(
        auto_now=True,
    )

    notes = models.TextField(
        blank=True,
    )

    def __str__(self):
        return (
            f"{self.user.username} - "
            f"{self.job.title} - "
            f"{self.status}"
        )