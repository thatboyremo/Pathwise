class AIProviderError(Exception):
    """Raised when an AI provider fails."""
    pass


class AIQuotaExceeded(Exception):
    """Raised when an API quota is exceeded."""
    pass


class AIRateLimit(Exception):
    """Raised when a provider rate limit is hit."""
    pass