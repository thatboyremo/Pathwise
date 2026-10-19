from django.contrib.auth.models import User
from rest_framework import serializers
from users.models import UserProfile


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    confirm_password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = [
            "first_name",
            "last_name",
            "email",
            "password",
            "confirm_password",
        ]

    def validate(self, attrs):
        if attrs["password"] != attrs["confirm_password"]:
            raise serializers.ValidationError({
                "confirm_password": "Passwords do not match."
            })

        return attrs
    

    def create(self, validated_data):
        validated_data.pop("confirm_password")

        user = User.objects.create_user(
            username=validated_data["email"],
            email=validated_data["email"],
            first_name=validated_data["first_name"],
            last_name=validated_data["last_name"],
            password=validated_data["password"],
        )

        return user
    
    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError(
                "An account with this email already exists."
            )

        return value

class UserProfileSerializer(serializers.ModelSerializer):

    class Meta:
        model = UserProfile

        fields = [
            "full_name",
            "phone",
            "country",
            "city",
            "bio",
            "career_goal",
            "target_role",
            "years_experience",
            "work_preference",
            "linkedin",
            "github",
            "portfolio",
            "resume_filename",
            "resume_score",
            "ats_score",
            "resume_word_count",
            "resume_uploaded",
            "resume_analyzed",
            "career_score",
            "profile_completion",
            "completed",
            "profile_picture",
        ]
    
    