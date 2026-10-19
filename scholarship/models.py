from django.db import models
from django.utils import timezone


class Scholarship(models.Model):

    FUNDING = [
        ("full", "Fully Funded"),
        ("partial", "Partially Funded"),
    ]

    LEVELS = [
        ("bachelor", "Bachelor"),
        ("masters", "Masters"),
        ("phd", "PhD"),
    ]

    title = models.CharField(
        max_length=250,
        default="Scholarship",
    )

    university = models.CharField(
        max_length=250,
        default="",
        blank=True,
    )

    country = models.CharField(
        max_length=100,
        default="",
        blank=True,
    )

    funding = models.CharField(
        max_length=20,
        choices=FUNDING,
        default="full",
    )

    study_level = models.CharField(
        max_length=20,
        choices=LEVELS,
        default="masters",
    )

    deadline = models.DateField(
        null=True,
        blank=True,
    )

    description = models.TextField(
        default="",
        blank=True,
    )

    requirements = models.TextField(
        default="",
        blank=True,
    )

    website = models.URLField(
        default="https://example.com",
    )

    logo = models.URLField(
        blank=True,
        default="",
    )

    featured = models.BooleanField(
        default=False,
    )

    source = models.CharField(
        max_length=100,
        default="Pathwise",
    )

    external_id = models.CharField(
        max_length=255,
        blank=True,
        default="",
    )

    last_verified = models.DateTimeField(
        default=timezone.now,
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    def __str__(self):
        return self.title