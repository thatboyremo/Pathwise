from pathlib import Path
from datetime import timedelta
import os

from django.core.exceptions import ImproperlyConfigured
from dotenv import load_dotenv


# =========================================================
# BASE DIRECTORY
# =========================================================

BASE_DIR = Path(__file__).resolve().parent.parent


# =========================================================
# ENVIRONMENT VARIABLES
# =========================================================

load_dotenv(BASE_DIR / ".env")


# =========================================================
# SECURITY
# =========================================================

SECRET_KEY = os.getenv("SECRET_KEY", "").strip()

if not SECRET_KEY:
    raise ImproperlyConfigured(
        "SECRET_KEY must be set in the environment or .env file."
    )

DEBUG = os.getenv("DEBUG", "False").strip().lower() in {
    "1",
    "true",
    "yes",
    "on",
}

ALLOWED_HOSTS = [
    host.strip()
    for host in os.getenv(
        "ALLOWED_HOSTS",
        "127.0.0.1,localhost",
    ).split(",")
    if host.strip()
]


# =========================================================
# AI API KEYS
# =========================================================

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

GEMINI_MODEL = os.getenv(
    "GEMINI_MODEL",
    "gemini-2.5-flash-lite",
)

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

GROQ_API_KEY = os.getenv("GROQ_API_KEY")

GROQ_MODEL = os.getenv(
    "GROQ_MODEL",
    "openai/gpt-oss-20b",
)


# =========================================================
# APPLICATIONS
# =========================================================

INSTALLED_APPS = [

    # -----------------------------------------------------
    # Your applications
    # -----------------------------------------------------

    "users.apps.UsersConfig",
    "dashboard",
    "analyzer",
    "interview",
    "scholarship",
    "advisor",
    "ai_chat",
    "jobs",
    "api",
    "challenges",

    # -----------------------------------------------------
    # Django REST Framework
    # -----------------------------------------------------

    "rest_framework",

    # -----------------------------------------------------
    # CORS
    # -----------------------------------------------------

    "corsheaders",

    # -----------------------------------------------------
    # Django built-in applications
    # -----------------------------------------------------

    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "django.contrib.sites",

    # -----------------------------------------------------
    # django-allauth
    # -----------------------------------------------------

    "allauth",
    "allauth.account",
    "allauth.socialaccount",

    # Google provider
    "allauth.socialaccount.providers.google",

    "rest_framework_simplejwt.token_blacklist",
]

if DEBUG:
    INSTALLED_APPS.append("django_extensions")


# =========================================================
# MIDDLEWARE
# =========================================================

MIDDLEWARE = [

    # Security
    "django.middleware.security.SecurityMiddleware",

    # CORS
    "corsheaders.middleware.CorsMiddleware",

    # Sessions
    "django.contrib.sessions.middleware.SessionMiddleware",

    # Common Django middleware
    "django.middleware.common.CommonMiddleware",

    # CSRF
    "django.middleware.csrf.CsrfViewMiddleware",

    # Authentication
    "django.contrib.auth.middleware.AuthenticationMiddleware",

    # =====================================================
    # REQUIRED BY DJANGO-ALLAUTH
    # =====================================================

    "allauth.account.middleware.AccountMiddleware",

    # Messages
    "django.contrib.messages.middleware.MessageMiddleware",

    # Clickjacking protection
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]


# =========================================================
# URL CONFIGURATION
# =========================================================

ROOT_URLCONF = "career_assistant.urls"


# =========================================================
# TEMPLATES
# =========================================================

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",

        "DIRS": [
            BASE_DIR / "templates",
        ],

        "APP_DIRS": True,

        "OPTIONS": {
            "context_processors": [

                "django.template.context_processors.request",

                "django.contrib.auth.context_processors.auth",

                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]


# =========================================================
# WSGI
# =========================================================

WSGI_APPLICATION = "career_assistant.wsgi.application"


# =========================================================
# DATABASE
# =========================================================

DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.sqlite3",
        "NAME": BASE_DIR / "db.sqlite3",
    }
}


# =========================================================
# PASSWORD VALIDATION
# =========================================================

AUTH_PASSWORD_VALIDATORS = [
    {
        "NAME": (
            "django.contrib.auth.password_validation."
            "UserAttributeSimilarityValidator"
        ),
    },
    {
        "NAME": (
            "django.contrib.auth.password_validation."
            "MinimumLengthValidator"
        ),
    },
    {
        "NAME": (
            "django.contrib.auth.password_validation."
            "CommonPasswordValidator"
        ),
    },
    {
        "NAME": (
            "django.contrib.auth.password_validation."
            "NumericPasswordValidator"
        ),
    },
]


# =========================================================
# INTERNATIONALIZATION
# =========================================================

LANGUAGE_CODE = "en-us"

TIME_ZONE = "UTC"

USE_I18N = True

USE_TZ = True


# =========================================================
# STATIC FILES
# =========================================================

STATIC_URL = "/static/"

STATICFILES_DIRS = [
    BASE_DIR / "static",
]


# =========================================================
# MEDIA FILES
# =========================================================

MEDIA_URL = "/media/"

MEDIA_ROOT = BASE_DIR / "media"


# =========================================================
# DJANGO SITES
# =========================================================

SITE_ID = 1


# =========================================================
# AUTHENTICATION BACKENDS
# =========================================================

AUTHENTICATION_BACKENDS = [

    # Normal Django username/password authentication
    "django.contrib.auth.backends.ModelBackend",

    # django-allauth authentication
    "allauth.account.auth_backends.AuthenticationBackend",
]


# =========================================================
# LOGIN / LOGOUT
# =========================================================

LOGIN_REDIRECT_URL = "/dashboard/"

LOGOUT_REDIRECT_URL = "http://localhost:8080/login"

LOGIN_URL = "/login/"


# =========================================================
# DJANGO-ALLAUTH
# =========================================================

ACCOUNT_LOGIN_METHODS = {
    "email",
    "username",
}

ACCOUNT_SIGNUP_FIELDS = [
    "email*",
    "username*",
    "password1*",
    "password2*",
]


# =========================================================
# GOOGLE SOCIAL LOGIN
# =========================================================

SOCIALACCOUNT_LOGIN_ON_GET = True

SOCIALACCOUNT_PROVIDERS = {
    "google": {
        "APP": {
            "client_id": os.getenv(
                "GOOGLE_CLIENT_ID",
                "your-client-id",
            ),

            "secret": os.getenv(
                "GOOGLE_CLIENT_SECRET",
                "your-secret",
            ),
        }
    }
}


# =========================================================
# DJANGO REST FRAMEWORK
# =========================================================

REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": (
        "rest_framework_simplejwt.authentication.JWTAuthentication",
        "rest_framework.authentication.SessionAuthentication",
    ),

    "DEFAULT_PERMISSION_CLASSES": (
        "rest_framework.permissions.IsAuthenticated",
    ),

    "DEFAULT_THROTTLE_CLASSES": (
        "rest_framework.throttling.AnonRateThrottle",
        "rest_framework.throttling.UserRateThrottle",
    ),

    "DEFAULT_THROTTLE_RATES": {
        "anon": "60/min",
        "user": "300/min",
        "auth": "10/min",
        "ai": "30/hour",
    },
}


# =========================================================
# SIMPLE JWT
# =========================================================

SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(minutes=60),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=7),

    "ROTATE_REFRESH_TOKENS": True,
    "BLACKLIST_AFTER_ROTATION": True,

    "AUTH_HEADER_TYPES": ("Bearer",),
}


# =========================================================
# CORS
# =========================================================

_DEFAULT_CORS_ORIGINS = [
    "http://localhost:3000",
    "http://localhost:5173",
    "http://localhost:8080",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:8080",
]

CORS_ALLOWED_ORIGINS = [
    origin.strip()
    for origin in os.getenv(
        "CORS_ALLOWED_ORIGINS",
        ",".join(_DEFAULT_CORS_ORIGINS),
    ).split(",")
    if origin.strip()
]

CORS_ALLOW_CREDENTIALS = True


# =========================================================
# CSRF
# =========================================================

CSRF_TRUSTED_ORIGINS = [
    "http://localhost:3000",
    "http://localhost:5173",
    "http://localhost:8080",

    "http://127.0.0.1:5173",
    "http://127.0.0.1:8080",
]


# =========================================================
# SESSION CONFIGURATION
# =========================================================

SESSION_COOKIE_HTTPONLY = True

SESSION_COOKIE_SAMESITE = "Lax"

SESSION_COOKIE_SECURE = False


# =========================================================
# CSRF COOKIE CONFIGURATION
# =========================================================

CSRF_COOKIE_HTTPONLY = False

CSRF_COOKIE_SAMESITE = "Lax"

CSRF_COOKIE_SECURE = False


# =========================================================
# EMAIL
# =========================================================

EMAIL_BACKEND = "django.core.mail.backends.console.EmailBackend"


# =========================================================
# UPLOAD LIMITS
# =========================================================

DATA_UPLOAD_MAX_MEMORY_SIZE = 10 * 1024 * 1024
FILE_UPLOAD_MAX_MEMORY_SIZE = 10 * 1024 * 1024
DATA_UPLOAD_MAX_NUMBER_FIELDS = 1000
FILE_UPLOAD_PERMISSIONS = 0o640


# =========================================================
# PRODUCTION SECURITY
# =========================================================

SECURE_CONTENT_TYPE_NOSNIFF = True
SECURE_REFERRER_POLICY = "same-origin"
X_FRAME_OPTIONS = "DENY"

if not DEBUG:
    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True
    SECURE_SSL_REDIRECT = os.getenv(
        "SECURE_SSL_REDIRECT",
        "False",
    ).strip().lower() in {"1", "true", "yes", "on"}
    SECURE_HSTS_SECONDS = int(
        os.getenv("SECURE_HSTS_SECONDS", "31536000")
    )
    SECURE_HSTS_INCLUDE_SUBDOMAINS = True
    SECURE_HSTS_PRELOAD = True
    SECURE_PROXY_SSL_HEADER = (
        "HTTP_X_FORWARDED_PROTO",
        "https",
    )


# =========================================================
# DEFAULT PRIMARY KEY
# =========================================================

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"
