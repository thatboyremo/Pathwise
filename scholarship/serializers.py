from rest_framework import serializers

from .models import Scholarship


class ScholarshipSerializer(
    serializers.ModelSerializer
):

    class Meta:
        model = Scholarship

        fields = [
            "id",
            "title",
            "university",
            "country",
            "funding",
            "study_level",
            "deadline",
            "description",
            "requirements",
            "website",
            "logo",
            "featured",
            "source",
            "external_id",
            "last_verified",
        ]