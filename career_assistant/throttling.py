from rest_framework.throttling import AnonRateThrottle, UserRateThrottle


class AuthRateThrottle(AnonRateThrottle):
    """Limit anonymous authentication attempts per IP."""

    scope = "auth"


class AIRateThrottle(UserRateThrottle):
    """Limit authenticated AI endpoints per user."""

    scope = "ai"
