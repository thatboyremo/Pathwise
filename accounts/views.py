import email

from django.contrib.auth import authenticate
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken


@api_view(["POST"])
def login_api(request):

    print("🔥 LOGIN API CALLED 🔥")
    print("REQUEST DATA:", request.data)

    email = request.data.get("email")
    password = request.data.get("password")

    print("EMAIL:", email)
    print("PASSWORD:", password)

    user = authenticate(
        username=email,
        password=password
    )

    print("AUTH USER:", user)


    if user is None:
        return Response(
            {
                "error": "Invalid email or password"
            },
            status=status.HTTP_401_UNAUTHORIZED
        )


    refresh = RefreshToken.for_user(user)


    return Response(
        {
            "access": str(refresh.access_token),
            "refresh": str(refresh),
            "username": user.first_name or user.username
        }
    )