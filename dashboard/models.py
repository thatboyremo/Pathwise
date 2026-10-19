from django.db import models
from django.contrib.auth.models import User


class UserStats(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)

    cv_analyses = models.IntegerField(default=0)
    mock_interviews = models.IntegerField(default=0)
    scholarships_found = models.IntegerField(default=0)
    ai_recommendations = models.IntegerField(default=0)

    def __str__(self):
        return self.user.username
    
class Activity(models.Model):

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE
    )

    title = models.CharField(max_length=200)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]