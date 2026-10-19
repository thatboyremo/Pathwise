from rest_framework.decorators import (
    api_view,
    permission_classes,
)

from rest_framework.permissions import AllowAny

from rest_framework.response import Response

from .models import Scholarship
from .serializers import ScholarshipSerializer


@api_view(["GET"])
@permission_classes([AllowAny])
def scholarship_api(request):

    scholarships = (
        Scholarship.objects
        .all()
        .order_by(
            "-featured",
            "deadline",
            "-created_at",
        )
    )

    serializer = ScholarshipSerializer(
        scholarships,
        many=True,
    )

    return Response(
        serializer.data
    )