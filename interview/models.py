from django.db import models
from django.conf import settings


class InterviewSession(models.Model):

    STATUS_CHOICES = [
        ("pending", "Pending"),
        ("active", "Active"),
        ("completed", "Completed"),
        ("cancelled", "Cancelled"),
    ]

    EXPERIENCE_CHOICES = [
        ("intern", "Intern"),
        ("entry", "Entry Level"),
        ("mid", "Mid Level"),
        ("senior", "Senior"),
        ("lead", "Lead"),
    ]

    DIFFICULTY_CHOICES = [
        ("easy", "Easy"),
        ("medium", "Medium"),
        ("hard", "Hard"),
    ]

    INTERVIEW_TYPES = [
        ("behavioral", "Behavioral"),
        ("technical", "Technical"),
        ("mixed", "Mixed"),
        ("system_design", "System Design"),
    ]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="interview_sessions",
    )

    company = models.CharField(max_length=150)

    job_role = models.CharField(max_length=150)

    job_description = models.TextField(blank=True)

    experience_level = models.CharField(
        max_length=20,
        choices=EXPERIENCE_CHOICES,
        default="entry",
    )

    interview_type = models.CharField(
        max_length=30,
        choices=INTERVIEW_TYPES,
        default="mixed",
    )

    difficulty = models.CharField(
        max_length=20,
        choices=DIFFICULTY_CHOICES,
        default="medium",
    )

    question_count = models.PositiveIntegerField(default=10)

    resume = models.FileField(
        upload_to="resumes/",
        blank=True,
        null=True,
    )

    current_question = models.PositiveIntegerField(default=1)

    overall_score = models.FloatField(default=0)

    recommendation = models.CharField(
        max_length=100,
        blank=True,
    )

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="pending",
    )

    started_at = models.DateTimeField(auto_now_add=True)

    completed_at = models.DateTimeField(
        blank=True,
        null=True,
    )

    class Meta:
        ordering = ["-started_at"]

    def __str__(self):
        return f"{self.company} - {self.job_role}"


class InterviewQuestion(models.Model):

    session = models.ForeignKey(
        InterviewSession,
        on_delete=models.CASCADE,
        related_name="questions",
    )

    question_number = models.PositiveIntegerField()

    question = models.TextField()

    category = models.CharField(
        max_length=100,
        blank=True,
    )

    ai_follow_up = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["question_number"]
        unique_together = ("session", "question_number")

    def __str__(self):
        return f"Question {self.question_number}"


class InterviewAnswer(models.Model):

    question = models.OneToOneField(
        InterviewQuestion,
        on_delete=models.CASCADE,
        related_name="answer",
    )

    answer = models.TextField()

    overall_score = models.FloatField(default=0)

    technical_score = models.FloatField(default=0)

    communication_score = models.FloatField(default=0)

    confidence_score = models.FloatField(default=0)

    problem_solving_score = models.FloatField(default=0)

    strengths = models.JSONField(
        default=list,
        blank=True,
    )

    weaknesses = models.JSONField(
        default=list,
        blank=True,
    )

    feedback = models.TextField(blank=True)

    improved_answer = models.TextField(blank=True)

    professional_version = models.TextField(blank=True)

    faang_version = models.TextField(blank=True)

    concise_version = models.TextField(blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Answer {self.question.question_number}"


class InterviewReport(models.Model):

    session = models.OneToOneField(
        InterviewSession,
        on_delete=models.CASCADE,
        related_name="report",
    )

    communication = models.FloatField(default=0)

    technical = models.FloatField(default=0)

    confidence = models.FloatField(default=0)

    problem_solving = models.FloatField(default=0)

    culture_fit = models.FloatField(default=0)

    overall = models.FloatField(default=0)

    strengths = models.JSONField(
        default=list,
        blank=True,
    )

    weaknesses = models.JSONField(
        default=list,
        blank=True,
    )

    summary = models.TextField(blank=True)

    hiring_recommendation = models.CharField(
        max_length=50,
        blank=True,
    )

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Report - {self.session.company}"


class InterviewFeedback(models.Model):
    """
    Optional feedback left by the user after completing
    an interview session.
    """

    session = models.OneToOneField(
        InterviewSession,
        on_delete=models.CASCADE,
        related_name="user_feedback",
    )

    rating = models.PositiveSmallIntegerField(default=5)

    comment = models.TextField(blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Feedback - {self.session.company}"