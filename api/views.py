import json
import os
import re
from datetime import timedelta

from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from django.db import transaction
from django.utils import timezone
from django.utils.timesince import timesince

from rest_framework import status
from rest_framework.decorators import (
    api_view,
    permission_classes,
    throttle_classes,
)
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken

from career_assistant.throttling import AIRateThrottle, AuthRateThrottle
from api.security import (
    MAX_CV_PAGES,
    MAX_CV_TEXT_CHARS,
    is_valid_email,
    validate_cv_upload,
)

from pypdf import PdfReader
from docx import Document
from google import genai

from users.models import (
    UserProfile,
    Skill,
    Experience,
    Education,
    Project,
)

from analyzer.models import ResumeAnalysis, Notification
from interview.models import InterviewSession
from django.db.models import Avg
from interview.models import InterviewSession
from jobs.models import JobApplication


# =========================================================
# HELPER FUNCTIONS
# =========================================================

def extract_pdf_text(file):
    """Extract text from a PDF file."""

    reader = PdfReader(file)

    text = ""
    pages = reader.pages[:MAX_CV_PAGES]

    for page in pages:
        page_text = page.extract_text()

        if page_text:
            text += page_text + "\n"

        if len(text) >= MAX_CV_TEXT_CHARS:
            break

    return text.strip()[:MAX_CV_TEXT_CHARS]


def extract_docx_text(file):
    """Extract text from a DOCX file."""

    document = Document(file)

    paragraphs = []

    for paragraph in document.paragraphs:
        if paragraph.text.strip():
            paragraphs.append(
                paragraph.text.strip()
            )

    return "\n".join(paragraphs).strip()


def extract_cv_text(uploaded_file):
    """
    Extract text from supported CV formats.
    """

    filename = uploaded_file.name.lower()

    if filename.endswith(".pdf"):
        return extract_pdf_text(uploaded_file)

    if filename.endswith(".docx"):
        return extract_docx_text(uploaded_file)

    raise ValueError(
        "Only PDF and DOCX files are supported."
    )


# =========================================================
# PROFILE SCORE HELPERS
# =========================================================

def calculate_profile_completion(profile):
    """
    Calculate profile completion.

    Skills, education, experience and projects are stored
    in separate models, not inside UserProfile.
    """

    user = profile.user

    skills_exist = Skill.objects.filter(
        user=user
    ).exists()

    experience_exist = Experience.objects.filter(
        user=user
    ).exists()

    education_exist = Education.objects.filter(
        user=user
    ).exists()

    projects_exist = Project.objects.filter(
        user=user
    ).exists()

    profile_fields = [
        profile.full_name,
        profile.phone,
        profile.country,
        profile.city,
        profile.bio,
        profile.linkedin,
        profile.github,
        profile.portfolio,
        profile.target_role,
        profile.career_goal,
    ]

    completed_profile_fields = sum(
        1
        for field in profile_fields
        if field and str(field).strip()
    )

    related_fields = [
        skills_exist,
        experience_exist,
        education_exist,
        projects_exist,
    ]

    completed_related_fields = sum(
        1
        for field in related_fields
        if field
    )

    total_completed = (
        completed_profile_fields
        + completed_related_fields
    )

    total_fields = (
        len(profile_fields)
        + len(related_fields)
    )

    if total_fields == 0:
        return 0

    return int(
        (total_completed / total_fields) * 100
    )


def calculate_career_score(profile):
    """
    Calculate career readiness score.

    Related data is stored in separate models.
    """

    user = profile.user

    score = 0

    if Skill.objects.filter(user=user).exists():
        score += 25

    if Education.objects.filter(user=user).exists():
        score += 15

    if Experience.objects.filter(user=user).exists():
        score += 25

    if profile.target_role:
        score += 10

    if profile.career_goal:
        score += 10

    if profile.linkedin:
        score += 5

    if profile.github:
        score += 5

    if profile.portfolio:
        score += 5

    return min(score, 100)


# =========================================================
# AI CV STRUCTURED DATA EXTRACTION
# =========================================================

def extract_profile_from_cv(text):
    """
    Uses Gemini to extract structured profile information
    from the user's CV.

    The AI is instructed not to invent information.
    """

    api_key = os.getenv("GEMINI_API_KEY")

    if not api_key:
        raise ValueError(
            "GEMINI_API_KEY is not configured."
        )

    client = genai.Client(
        api_key=api_key
    )

    prompt = f"""
You are a professional CV information extraction system.

Read the CV below and extract ONLY information that is
actually present in the CV.

Do not invent, guess, assume, or create information.

Return ONLY valid JSON.

Use this exact structure:

{{
    "full_name": "",
    "email": "",
    "phone": "",
    "country": "",
    "city": "",
    "bio": "",
    "skills": [],
    "education": [],
    "experience": [],
    "career_goal": "",
    "target_role": "",
    "years_experience": 0,
    "linkedin": "",
    "github": "",
    "portfolio": ""
}}

Rules:

1. full_name:
   Extract the person's full name if available.

2. email:
   Extract the email address from the CV.

3. phone:
   Extract the phone number if available.

4. country:
   Extract the country only if explicitly stated.

5. city:
   Extract the city only if explicitly available.

6. bio:
   Use the professional summary/profile/objective
   from the CV. Do not create a new biography.

7. skills:
   Return all relevant technical and professional skills
   explicitly mentioned in the CV.

8. education:
   Return education entries including institution,
   qualification and dates where available.

9. experience:
   Return work experience entries including company,
   position, responsibilities and dates where available.

10. career_goal:
    Extract a stated career objective or goal if present.

11. target_role:
    Extract the most clearly stated professional role.

12. years_experience:
    Estimate only when employment dates provide
    enough information. Otherwise return 0.

13. linkedin:
    Extract LinkedIn URL if present.

14. github:
    Extract GitHub URL if present.

15. portfolio:
    Extract portfolio/personal website URL if present.

If information is not available, return:
- empty string
- empty array
- or 0

as appropriate.

CV:

{text}
"""

    response = client.models.generate_content(
        model="gemini-2.5-flash-lite",
        contents=prompt
    )

    raw_text = response.text.strip()

    if raw_text.startswith("```"):

        raw_text = re.sub(
            r"^```(?:json)?",
            "",
            raw_text,
            flags=re.IGNORECASE
        )

        raw_text = re.sub(
            r"```$",
            "",
            raw_text
        )

        raw_text = raw_text.strip()

    return json.loads(raw_text)


# =========================================================
# CV ANALYSIS ENGINE
# =========================================================

def analyze_cv_text(cv_text):

    if not cv_text:
        cv_text = ""

    original_text = cv_text.strip()

    normalized_text = re.sub(
        r"\s+",
        " ",
        original_text
    ).strip()

    normalized_lower = normalized_text.lower()

    word_count = len(
        normalized_text.split()
    )

    # =====================================================
    # CONTACT INFORMATION
    # =====================================================

    email_found = bool(
        re.search(
            r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b",
            original_text,
            re.IGNORECASE
        )
    )

    phone_found = bool(
        re.search(
            r"(?<!\d)(?:\+?\d[\d\s().-]{7,}\d)(?!\d)",
            original_text
        )
    )

    linkedin_found = bool(
        re.search(
            r"(?:https?://)?(?:www\.)?linkedin\.com/(?:in|pub)/[A-Za-z0-9._%-]+",
            original_text,
            re.IGNORECASE
        )
        or re.search(
            r"\blinkedin\b",
            original_text,
            re.IGNORECASE
        )
    )

    github_found = bool(
        re.search(
            r"(?:https?://)?(?:www\.)?github\.com/[A-Za-z0-9._%-]+",
            original_text,
            re.IGNORECASE
        )
        or re.search(
            r"\bgithub\b",
            original_text,
            re.IGNORECASE
        )
    )

    contact = {
        "email": email_found,
        "phone": phone_found,
        "linkedin": linkedin_found,
        "github": github_found,
    }

    # =====================================================
    # SECTION DETECTION
    # =====================================================

    def has_section(*patterns):

        for pattern in patterns:

            if re.search(
                rf"(?im)^\s*(?:{pattern})\s*:?\s*$",
                original_text
            ):
                return True

        return False

    sections = {

        "summary": has_section(
            r"professional\s+summary",
            r"career\s+summary",
            r"summary",
            r"profile",
            r"professional\s+profile",
            r"career\s+profile",
            r"objective",
            r"career\s+objective",
            r"about\s+me",
        ),

        "experience": has_section(
            r"professional\s+experience",
            r"work\s+experience",
            r"work\s+history",
            r"employment\s+history",
            r"employment",
            r"experience",
        ),

        "education": has_section(
            r"education",
            r"academic\s+background",
            r"educational\s+background",
        ),

        "skills": has_section(
            r"skills",
            r"technical\s+skills",
            r"core\s+skills",
            r"key\s+skills",
            r"technical\s+competencies",
            r"competencies",
        ),

        "projects": has_section(
            r"projects",
            r"personal\s+projects",
            r"academic\s+projects",
            r"selected\s+projects",
            r"key\s+projects",
        ),

        "certifications": has_section(
            r"certifications",
            r"certificates",
            r"professional\s+certifications",
            r"licenses\s+and\s+certifications",
        ),
    }

    # =====================================================
    # TECHNICAL SKILLS
    # =====================================================

    skill_patterns = {

        "Python": r"\bpython\b",
        "Django": r"\bdjango\b",
        "Flask": r"\bflask\b",
        "Java": r"\bjava\b",
        "C++": r"\bc\+\+\b",
        "C#": r"\bc#\b",
        "JavaScript": r"\bjavascript\b",
        "TypeScript": r"\btypescript\b",
        "HTML": r"\bhtml\b",
        "CSS": r"\bcss\b",
        "SQL": r"\bsql\b",
        "React": r"\breact(?:\.js)?\b",
        "Node.js": r"\bnode(?:\.js)?\b",
        "API": r"\bapis?\b",
        "Machine Learning": r"\bmachine\s+learning\b",
        "Artificial Intelligence": r"\bartificial\s+intelligence\b",
        "AI": r"\bai\b",
        "Data Science": r"\bdata\s+science\b",
        "Data Analysis": r"\bdata\s+analysis\b",
        "Git": r"\bgit\b",
        "GitHub": r"\bgithub\b",
        "Docker": r"\bdocker\b",
        "AWS": r"\baws\b",
        "Azure": r"\bazure\b",
        "Pandas": r"\bpandas\b",
        "NumPy": r"\bnumpy\b",
        "Scikit-learn": r"\bscikit[-\s]?learn\b",
        "TensorFlow": r"\btensorflow\b",
        "PyTorch": r"\bpytorch\b",
        "Streamlit": r"\bstreamlit\b",
        "Tailwind CSS": r"\btailwind(?:\s+css)?\b",
        "MySQL": r"\bmysql\b",
        "PostgreSQL": r"\bpostgres(?:ql)?\b",
        "MongoDB": r"\bmongodb\b",
        "Firebase": r"\bfirebase\b",
        "Power BI": r"\bpower\s+bi\b",
        "Tableau": r"\btableau\b",
        "Excel": r"\bexcel\b",
    }

    found_skills = []

    for skill, pattern in skill_patterns.items():

        if re.search(
            pattern,
            normalized_lower,
            re.IGNORECASE
        ):
            found_skills.append(skill)

    technologies = found_skills.copy()

    # =====================================================
    # ACTION VERBS
    # =====================================================

    action_verbs_list = [
        "developed",
        "designed",
        "created",
        "implemented",
        "built",
        "managed",
        "analyzed",
        "optimized",
        "engineered",
        "automated",
        "integrated",
        "tested",
        "deployed",
        "maintained",
        "led",
        "improved",
        "configured",
        "collaborated",
        "delivered",
        "launched",
        "architected",
        "programmed",
        "debugged",
        "refactored",
        "trained",
        "evaluated",
        "researched",
        "documented",
    ]

    action_verbs = []

    for verb in action_verbs_list:

        if re.search(
            rf"\b{re.escape(verb)}\b",
            normalized_lower,
            re.IGNORECASE
        ):
            action_verbs.append(verb)

    action_verbs = list(
        dict.fromkeys(action_verbs)
    )

    # =====================================================
    # METRICS
    # =====================================================

    metric_patterns = [

        r"\b\d+(?:\.\d+)?\s*%",

        r"\b\d+(?:\.\d+)?\s*(?:k|m)\+?\b",

        r"\b\d+(?:,\d{3})*\+?\s+"
        r"(?:users|customers|clients|projects|records|"
        r"employees|students|applications|transactions|jobs)\b",

        r"(?:₦|\$|€|£)\s?\d[\d,]*(?:\.\d+)?",

        r"\b\d+(?:\.\d+)?\s*"
        r"(?:hours?|days?|weeks?|months?)\b",
    ]

    metrics_found = 0

    for pattern in metric_patterns:

        metrics_found += len(
            re.findall(
                pattern,
                normalized_lower,
                re.IGNORECASE
            )
        )

    # =====================================================
    # SCORES
    # =====================================================

    keyword_score = min(
        len(found_skills) * 3,
        25
    )

    impact_score = min(
        len(action_verbs) * 2
        + metrics_found * 3,
        25
    )

    format_score = 0

    if word_count >= 200:
        format_score += 5

    if word_count >= 300:
        format_score += 5

    if word_count >= 500:
        format_score += 5

    format_score += sum(
        [
            email_found,
            phone_found,
            linkedin_found,
            github_found,
        ]
    )

    format_score += sum(
        sections.values()
    )

    format_score = min(
        format_score,
        20
    )

    contact_score = sum(
        contact.values()
    )

    section_score = sum(
        sections.values()
    )

    ats_score = (
        keyword_score
        + impact_score
        + format_score
        + min(contact_score * 2, 8)
        + min(section_score, 6)
        + 10
    )

    ats_score = min(
        int(ats_score),
        100
    )

    overall_score = round(
        (
            ats_score
            + keyword_score
            + impact_score
            + format_score
        ) / 2
    )

    overall_score = min(
        overall_score,
        100
    )

    # =====================================================
    # STRENGTHS
    # =====================================================

    strengths = []

    if found_skills:

        strengths.append(
            "Relevant technical skills detected: "
            + ", ".join(found_skills[:10])
            + "."
        )

    if action_verbs:

        strengths.append(
            f"The CV uses {len(action_verbs)} strong action verbs."
        )

    if metrics_found:

        strengths.append(
            f"The CV contains {metrics_found} measurable "
            "result or metric reference(s)."
        )

    if sum(contact.values()) >= 3:

        strengths.append(
            "Most important contact information was detected."
        )

    if sum(sections.values()) >= 5:

        strengths.append(
            "The CV contains a well-structured set "
            "of major sections."
        )

    if word_count >= 300:

        strengths.append(
            "The CV contains a reasonable amount "
            "of professional content."
        )

    if not strengths:

        strengths.append(
            "The CV contains basic professional information."
        )

    # =====================================================
    # WEAKNESSES
    # =====================================================

    weaknesses = []

    missing_contact = [
        name
        for name, exists in contact.items()
        if not exists
    ]

    if missing_contact:

        weaknesses.append(
            "Some contact information could not be detected: "
            + ", ".join(missing_contact)
            + "."
        )

    missing_sections = [
        name
        for name, exists in sections.items()
        if not exists
    ]

    if missing_sections:

        weaknesses.append(
            "Some standard CV sections could not be detected: "
            + ", ".join(missing_sections)
            + "."
        )

    if len(found_skills) < 5:

        weaknesses.append(
            "The CV contains relatively few "
            "detectable technical keywords."
        )

    if len(action_verbs) < 3:

        weaknesses.append(
            "Use more strong action verbs when "
            "describing your experience."
        )

    if metrics_found == 0:

        weaknesses.append(
            "Add measurable results such as percentages, "
            "numbers, users, revenue, or performance improvements."
        )

    if word_count < 250:

        weaknesses.append(
            "The CV may contain too little detail."
        )

    # =====================================================
    # RECOMMENDATIONS
    # =====================================================

    recommendations = []

    if missing_contact:

        recommendations.append({
            "title": "Complete your contact information",
            "description": (
                "Make sure your email, phone number and "
                "professional links are clearly visible "
                "and easy for recruiters and ATS systems "
                "to detect."
            ),
        })

    if missing_sections:

        recommendations.append({
            "title": "Improve CV structure",
            "description": (
                "Consider adding clearly labeled sections "
                "such as "
                + ", ".join(missing_sections)
                + "."
            ),
        })

    if len(found_skills) < 5:

        recommendations.append({
            "title": "Strengthen your skills section",
            "description": (
                "Add relevant technical and professional "
                "keywords that match the roles you are applying for."
            ),
        })

    if metrics_found == 0:

        recommendations.append({
            "title": "Quantify your achievements",
            "description": (
                "Add measurable results to your experience "
                "and project descriptions."
            ),
        })

    if len(action_verbs) < 3:

        recommendations.append({
            "title": "Use stronger action verbs",
            "description": (
                "Start experience and project bullet points "
                "with verbs such as developed, implemented, "
                "optimized, automated, designed or deployed."
            ),
        })

    recommendations.append({
        "title": "Tailor your CV to each job",
        "description": (
            "Compare your CV against each target job description "
            "and naturally include relevant keywords and skills."
        ),
    })

    recommendations.append({
        "title": "Keep your formatting ATS-friendly",
        "description": (
            "Use clear section headings, readable text and "
            "a simple structure that can be reliably parsed "
            "by applicant tracking systems."
        ),
    })

    # =====================================================
    # FEEDBACK
    # =====================================================

    if overall_score >= 80:

        feedback = ["Excellent CV"]

    elif overall_score >= 70:

        feedback = ["Strong CV"]

    elif overall_score >= 50:

        feedback = [
            "Good CV, but improvements are recommended"
        ]

    else:

        feedback = ["Needs improvement"]

    # =====================================================
    # RETURN
    # =====================================================

    return {

        "score": overall_score,
        "overall_score": overall_score,
        "ats_score": ats_score,
        "impact_score": impact_score,
        "keyword_score": keyword_score,
        "format_score": format_score,
        "word_count": word_count,

        "contact": contact,
        "sections": sections,
        "skills": found_skills,
        "technologies": technologies,
        "action_verbs": action_verbs,
        "metrics_found": metrics_found,

        "strengths": strengths,
        "weaknesses": weaknesses,
        "recommendations": recommendations,
        "feedback": feedback,
    }


# =========================================================
# REGISTER
# =========================================================


@api_view(["POST"])
@permission_classes([AllowAny])
@throttle_classes([AuthRateThrottle])
def register_api(request):

    data = request.data

    username = str(data.get("username") or "").strip()
    first_name = str(data.get("first_name") or "").strip()
    last_name = str(data.get("last_name") or "").strip()
    email = str(data.get("email") or "").strip()
    password = data.get("password")
    confirm_password = data.get("confirm_password")

    if not username:
        return Response(
            {"error": "Username is required"},
            status=status.HTTP_400_BAD_REQUEST
        )

    if not email:
        return Response(
            {"error": "Email is required"},
            status=status.HTTP_400_BAD_REQUEST
        )

    if not is_valid_email(email):
        return Response(
            {"error": "Enter a valid email address"},
            status=status.HTTP_400_BAD_REQUEST
        )

    if not password:
        return Response(
            {"error": "Password is required"},
            status=status.HTTP_400_BAD_REQUEST
        )

    if password != confirm_password:
        return Response(
            {"error": "Passwords do not match"},
            status=status.HTTP_400_BAD_REQUEST
        )

    try:
        validate_password(password)
    except ValidationError as exc:
        return Response(
            {"error": exc.messages[0]},
            status=status.HTTP_400_BAD_REQUEST
        )

    if User.objects.filter(username=username).exists():
        return Response(
            {"error": "Username already exists"},
            status=status.HTTP_400_BAD_REQUEST
        )

    if User.objects.filter(email__iexact=email).exists():
        return Response(
            {"error": "Email already registered"},
            status=status.HTTP_400_BAD_REQUEST
        )

    # ---------------------------------------------------------
    # CREATE USER
    # ---------------------------------------------------------

    user = User.objects.create_user(
        username=username,
        email=email,
        first_name=first_name,
        last_name=last_name,
        password=password
    )

    # ---------------------------------------------------------
    # CREATE OR GET USER PROFILE
    # ---------------------------------------------------------

    profile, created = UserProfile.objects.get_or_create(
        user=user,
        defaults={
            "full_name": f"{first_name} {last_name}".strip()
        }
    )

    # If a profile already existed, make sure the name is populated
    # without overwriting an existing profile name.
    if not profile.full_name:
        profile.full_name = f"{first_name} {last_name}".strip()
        profile.save(update_fields=["full_name"])

    # ---------------------------------------------------------
    # RESPONSE
    # ---------------------------------------------------------

    return Response(
        {
            "message": "Account created successfully",

            "user": {
                "id": user.id,
                "username": user.username,
                "first_name": user.first_name,
                "last_name": user.last_name,
                "email": user.email,
            }
        },
        status=status.HTTP_201_CREATED
    )


# =========================================================
# LOGIN
# =========================================================

@api_view(["POST"])
@permission_classes([AllowAny])
@throttle_classes([AuthRateThrottle])
def login_api(request):

    username_or_email = str(
        request.data.get("username")
        or request.data.get("email")
        or ""
    ).strip()

    password = str(
        request.data.get("password")
        or ""
    )

    if not username_or_email or not password:

        return Response(
            {
                "success": False,
                "error": (
                    "Username/email and password are required."
                ),
            },
            status=status.HTTP_400_BAD_REQUEST,
        )

    user = authenticate(
        username=username_or_email,
        password=password,
    )

    if user is None:

        try:

            matching_user = User.objects.get(
                email__iexact=username_or_email
            )

            user = authenticate(
                username=matching_user.username,
                password=password,
            )

        except User.DoesNotExist:

            user = None

    if user is None:

        return Response(
            {
                "success": False,
                "error": (
                    "Invalid username/email or password."
                ),
            },
            status=status.HTTP_401_UNAUTHORIZED,
        )

    profile, created = UserProfile.objects.get_or_create(
        user=user
    )

    skills = Skill.objects.filter(
        user=user
    )

    experiences = Experience.objects.filter(
        user=user
    )

    educations = Education.objects.filter(
        user=user
    )

    projects = Project.objects.filter(
        user=user
    )

    refresh = RefreshToken.for_user(user)

    access_token = str(
        refresh.access_token
    )

    refresh_token = str(
        refresh
    )

    login(request, user)

    return Response(
        {
            "success": True,

            "message": "Login successful.",

            "access": access_token,

            "refresh": refresh_token,

            "user": {
                "id": user.id,
                "username": user.username,
                "first_name": user.first_name,
                "last_name": user.last_name,
                "email": user.email,
            },

            "profile": {
                "full_name": profile.full_name or "",
                "phone": profile.phone or "",
                "country": profile.country or "",
                "city": profile.city or "",
                "bio": profile.bio or "",

                "career_goal": profile.career_goal or "",
                "target_role": profile.target_role or "",

                "years_experience": (
                    profile.years_experience or 0
                ),

                "work_preference": (
                    profile.work_preference or ""
                ),

                "linkedin": profile.linkedin or "",
                "github": profile.github or "",
                "portfolio": profile.portfolio or "",

                "resume_filename": (
                    profile.resume_filename or ""
                ),

                "resume_score": (
                    profile.resume_score or 0
                ),

                "ats_score": (
                    profile.ats_score or 0
                ),

                "resume_word_count": (
                    profile.resume_word_count or 0
                ),

                "resume_uploaded": (
                    profile.resume_uploaded
                ),

                "resume_analyzed": (
                    profile.resume_analyzed
                ),

                "career_score": (
                    profile.career_score or 0
                ),

                "profile_completion": (
                    profile.profile_completion or 0
                ),

                "completed": (
                    profile.completed
                ),

                "profile_picture": (
                    request.build_absolute_uri(
                        profile.profile_picture.url
                    )
                    if profile.profile_picture
                    else None
                ),
            },

            "skills": [
                {
                    "id": skill.id,
                    "name": skill.name,
                    "level": skill.level,
                    "category": skill.category,
                }
                for skill in skills
            ],

            "experiences": [
                {
                    "id": experience.id,
                    "role": experience.role,
                    "company": experience.company,
                    "period": experience.period,
                    "description": experience.description,
                }
                for experience in experiences
            ],

            "educations": [
                {
                    "id": education.id,
                    "degree": education.degree,
                    "institution": education.institution,
                    "field": education.field,
                    "period": education.period,
                    "grade": education.grade,
                }
                for education in educations
            ],

            "projects": [
                {
                    "id": project.id,
                    "name": project.name,
                    "description": project.description,
                    "technologies": project.technologies,
                    "url": project.url,
                }
                for project in projects
            ],
        },

        status=status.HTTP_200_OK,
    )


# =========================================================
# LOGOUT
# =========================================================

@api_view(["POST"])
@permission_classes([AllowAny])
@throttle_classes([AuthRateThrottle])
def logout_api(request):

    logout(request)

    refresh = request.data.get("refresh") if hasattr(request, "data") else None

    if refresh:
        try:
            RefreshToken(str(refresh)).blacklist()
        except Exception:
            pass

    return Response(
        {
            "success": True,
            "message": "Logout successful.",
        },
        status=status.HTTP_200_OK
    )


# =========================================================
# FORGOT PASSWORD
# =========================================================

@api_view(["POST"])
@permission_classes([AllowAny])
@throttle_classes([AuthRateThrottle])
def forgot_password(request):

    email = str(
        request.data.get("email") or ""
    ).strip()

    if not email:

        return Response(
            {
                "success": False,
                "error": "Email address is required.",
            },
            status=status.HTTP_400_BAD_REQUEST,
        )

    # Do not reveal whether the email is registered.
    User.objects.filter(email__iexact=email).exists()

    return Response(
        {
            "success": True,
            "message": (
                "If an account exists with this email, "
                "password reset instructions will be sent."
            ),
        },
        status=status.HTTP_200_OK,
    )


# =========================================================
# DASHBOARD
# =========================================================

# =========================================================
# DASHBOARD
# =========================================================

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def dashboard_api(request):

    user = request.user

    # =====================================================
    # USER PROFILE
    # =====================================================

    profile, _ = UserProfile.objects.get_or_create(
        user=user
    )

    # =====================================================
    # RELATED USER DATA
    # =====================================================

    skills = Skill.objects.filter(
        user=user
    ).order_by("-created_at")

    experiences = Experience.objects.filter(
        user=user
    ).order_by("-created_at")

    educations = Education.objects.filter(
        user=user
    ).order_by("-created_at")

    projects = Project.objects.filter(
        user=user
    ).order_by("-created_at")

    # =====================================================
    # PROFILE PICTURE
    # =====================================================

    profile_picture = None

    if profile.profile_picture:
        profile_picture = request.build_absolute_uri(
            profile.profile_picture.url
        )

    # =====================================================
    # RESUME SCORE
    # =====================================================

    resume_score = 0
    latest_analysis = None

    latest_analysis = (
        ResumeAnalysis.objects
        .filter(user=user)
        .order_by("-created_at")
        .first()
    )

    if latest_analysis:
        resume_score = float(
            latest_analysis.score or 0
        )

    # =====================================================
    # INTERVIEW STATISTICS
    # =====================================================

    interviews = InterviewSession.objects.filter(
        user=user
    )

    completed_interviews = interviews.filter(
        status__in=[
            "completed",
            "complete",
            "finished",
        ]
    )

    interview_count = (
        completed_interviews.count()
    )

    avg_interview_score = (
        completed_interviews
        .filter(
            overall_score__isnull=False,
            overall_score__gt=0,
        )
        .aggregate(
            average=Avg("overall_score")
        )["average"]
        or 0
    )

    avg_interview_score = round(
        float(avg_interview_score),
        1
    )

    # =====================================================
    # JOB APPLICATION STATISTICS
    # =====================================================

    applications = JobApplication.objects.filter(
        user=user
    )

    # "saved" is not a submitted application.
    # Everything after "applied" represents an application
    # that has progressed through the application process.
    submitted_applications = applications.filter(
        status__in=[
            "applied",
            "interview",
            "offer",
            "rejected",
        ]
    )

    application_count = submitted_applications.count()

    avg_application_score = (
        submitted_applications
        .filter(
            match_score__gt=0,
        )
        .aggregate(
            average=Avg("match_score")
        )["average"]
        or 0
    )

    avg_application_score = round(
        float(avg_application_score),
        1
    )

    # =====================================================
    # CAREER PROGRESS
    # =====================================================

    career_scores = []

    if resume_score > 0:
        career_scores.append(
            resume_score
        )

    if avg_interview_score > 0:
        career_scores.append(
            avg_interview_score
        )

    if avg_application_score > 0:
        career_scores.append(
            avg_application_score
        )

    if career_scores:

        career_progress = round(
            sum(career_scores)
            / len(career_scores),
            1
        )

    else:

        career_progress = 0

    career_progress = min(
        100,
        max(
            0,
            career_progress
        )
    )

    # =====================================================
    # SCORE CHANGE
    # =====================================================

    score_change = 0

    analyses = list(
        ResumeAnalysis.objects
        .filter(user=user)
        .order_by("-created_at")[:2]
    )

    if len(analyses) >= 2:

        latest_score = float(
            analyses[0].score or 0
        )

        previous_score = float(
            analyses[1].score or 0
        )

        score_change = round(
            latest_score - previous_score,
            1
        )

    # =====================================================
    # WEEKLY PROGRESS
    # =====================================================

    now = timezone.now()

    week_start = (
        now - timedelta(
            days=now.weekday()
        )
    ).replace(
        hour=0,
        minute=0,
        second=0,
        microsecond=0,
    )

    weekly_applications = (
        submitted_applications
        .filter(
            created_at__gte=week_start
        )
        .count()
    )

    weekly_interviews = (
        completed_interviews
        .filter(
            completed_at__gte=week_start
        )
        .count()
    )

    weekly_progress = [

        {
            "label": "Applications sent",
            "value": (
                f"{weekly_applications} "
                f"this week"
            ),
            "current": weekly_applications,
            "target": 5,
            "pct": min(
                round(
                    (
                        weekly_applications / 5
                    ) * 100
                ),
                100,
            ),
        },

        {
            "label": "Mock interviews",
            "value": (
                f"{weekly_interviews} "
                f"this week"
            ),
            "current": weekly_interviews,
            "target": 3,
            "pct": min(
                round(
                    (
                        weekly_interviews / 3
                    ) * 100
                ),
                100,
            ),
        },
    ]

    # =====================================================
    # RECOMMENDATIONS
    # =====================================================

    recommendations = []

    if resume_score <= 0:

        recommendations.append({
            "title": "Analyze your CV",
            "meta": (
                "Upload your CV to get your "
                "first career score."
            ),
            "action": "/dashboard/resume",
        })

    elif resume_score < 70:

        recommendations.append({
            "title": "Strengthen your CV",
            "meta": (
                "Your current CV score suggests "
                "there is room for improvement."
            ),
            "action": "/dashboard/resume",
        })

    elif resume_score < 85:

        recommendations.append({
            "title": "Optimize your CV further",
            "meta": (
                "Your CV is progressing well. "
                "Focus on stronger keywords and "
                "measurable achievements."
            ),
            "action": "/dashboard/resume",
        })

    else:

        recommendations.append({
            "title": "Your CV is looking strong",
            "meta": (
                "Keep your resume updated as you "
                "gain new experience."
            ),
            "action": "/dashboard/resume",
        })

    # =====================================================
    # INTERVIEW RECOMMENDATION
    # =====================================================

    if interview_count == 0:

        recommendations.append({
            "title": (
                "Complete your first "
                "mock interview"
            ),
            "meta": (
                "Practice your answers and get "
                "your first interview score."
            ),
            "action": "/dashboard/interview",
        })

    elif avg_interview_score < 70:

        recommendations.append({
            "title": (
                "Practice your interview skills"
            ),
            "meta": (
                "Your interview score has room "
                "to improve with more practice."
            ),
            "action": "/dashboard/interview",
        })

    else:

        recommendations.append({
            "title": (
                "Keep practicing interviews"
            ),
            "meta": (
                "Regular practice can help maintain "
                "your interview performance."
            ),
            "action": "/dashboard/interview",
        })

    # =====================================================
    # APPLICATION RECOMMENDATION
    # =====================================================

    if application_count == 0:

        recommendations.append({
            "title": "Start applying",
            "meta": (
                "Explore jobs that match your "
                "career profile."
            ),
            "action": "/jobs",
        })

    else:

        recommendations.append({
            "title": (
                "Keep your application momentum"
            ),
            "meta": (
                f"You have submitted "
                f"{application_count} application"
                f"{'' if application_count == 1 else 's'}."
            ),
            "action": "/jobs",
        })

    recommendations = recommendations[:3]

    # =====================================================
    # RECENT ACTIVITIES
    # =====================================================

    activities = []

    # -----------------------------------------------------
    # RESUME
    # -----------------------------------------------------

    if latest_analysis:

        activities.append({
            "id": (
                f"resume-{latest_analysis.id}"
            ),
            "type": "resume",
            "title": "Resume analyzed",
            "meta": (
                f"Your CV received a score of "
                f"{round(resume_score, 1)}%."
            ),
            "time": (
                timesince(
                    latest_analysis.created_at
                )
                + " ago"
            ),
            "created_at": (
                latest_analysis.created_at
            ),
        })

    # -----------------------------------------------------
    # INTERVIEWS
    # -----------------------------------------------------

    latest_interviews = (
        completed_interviews
        .order_by(
            "-completed_at",
            "-started_at",
        )[:10]
    )

    for interview in latest_interviews:

        interview_time = (
            interview.completed_at
            or interview.started_at
        )

        activities.append({
            "id": (
                f"interview-{interview.id}"
            ),
            "type": "interview",
            "title": (
                "Mock interview completed"
            ),
            "meta": (
                f"{interview.job_role} at "
                f"{interview.company} • "
                f"Score: "
                f"{round(interview.overall_score or 0, 1)}%"
            ),
            "time": (
                timesince(
                    interview_time
                )
                + " ago"
            ),
            "created_at": interview_time,
        })

    # -----------------------------------------------------
    # APPLICATIONS
    # -----------------------------------------------------

    latest_applications = (
        submitted_applications
        .select_related("job")
        .order_by("-updated_at")[:10]
    )

    for application in latest_applications:

        if not application.job:
            continue

        activities.append({
            "id": (
                f"application-{application.id}"
            ),
            "type": "application",
            "title": (
                "Job application updated"
            ),
            "meta": (
                f"{application.job.title} at "
                f"{application.job.company} • "
                f"{application.status.title()}"
            ),
            "time": (
                timesince(
                    application.updated_at
                )
                + " ago"
            ),
            "created_at": (
                application.updated_at
            ),
        })

    # -----------------------------------------------------
    # SORT ACTIVITIES
    # -----------------------------------------------------

    activities.sort(
        key=lambda activity: (
            activity["created_at"]
        ),
        reverse=True,
    )

    activities = activities[:10]

    for activity in activities:

        activity.pop(
            "created_at",
            None
        )

    # =====================================================
    # TOP JOB MATCHES
    # =====================================================

    top_jobs = []

    applied_jobs = (
        submitted_applications
        .select_related("job")
        .filter(
            match_score__isnull=False,
            match_score__gt=0,
        )
        .order_by(
            "-match_score",
            "-updated_at",
        )[:5]
    )

    seen_job_ids = set()

    for application in applied_jobs:

        if not application.job:
            continue

        job = application.job

        if job.id in seen_job_ids:
            continue

        seen_job_ids.add(
            job.id
        )

        title = (
            job.title
            or "Job opportunity"
        )

        company = (
            job.company
            or "Company"
        )

        location = (
            job.location
            or "Location not specified"
        )

        job_type = (
            job.job_type
            or "Job"
        )

        meta = (
            f"{company} • "
            f"{location} • "
            f"{job_type}"
        )

        code = "".join(
            word[0]
            for word in title.split()
            if word
        )[:2].upper()

        top_jobs.append({
            "id": job.id,
            "code": code,
            "title": title,
            "meta": meta,
            "match": round(
                float(
                    application.match_score
                    or 0
                )
            ),
            "apply_url": (
                job.apply_url
                or ""
            ),
        })

    # =====================================================
    # UPCOMING
    # =====================================================

    upcoming = []

    # =====================================================
    # RESPONSE
    # =====================================================

    profile_data = {
        "full_name": profile.full_name or "",
        "phone": profile.phone or "",
        "country": profile.country or "",
        "city": profile.city or "",
        "bio": profile.bio or "",
        "career_goal": profile.career_goal or "",
        "target_role": profile.target_role or "",
        "years_experience": profile.years_experience or 0,
        "work_preference": profile.work_preference or "",
        "linkedin": profile.linkedin or "",
        "github": profile.github or "",
        "portfolio": profile.portfolio or "",
        "resume_filename": profile.resume_filename or "",
        "resume_score": profile.resume_score or 0,
        "ats_score": profile.ats_score or 0,
        "resume_word_count": profile.resume_word_count or 0,
        "resume_uploaded": profile.resume_uploaded,
        "resume_analyzed": profile.resume_analyzed,
        "career_score": profile.career_score or 0,
        "profile_completion": profile.profile_completion or 0,
        "completed": profile.completed,
        "profile_picture": profile_picture,
    }

    data = {

        "success": True,

        "user": {
            "username": (
                user.first_name
                or user.username
            ),
            "email": user.email,
        },

        "profile": profile_data,

        "skills": [
            {
                "id": skill.id,
                "name": skill.name,
                "level": skill.level,
                "category": skill.category,
            }
            for skill in skills
        ],

        "experiences": [
            {
                "id": experience.id,
                "role": experience.role,
                "company": experience.company,
                "period": experience.period,
                "description": experience.description,
            }
            for experience in experiences
        ],

        "stats": {

            "resume_score": round(
                resume_score,
                1
            ),

            "applications": (
                application_count
            ),

            "interviews": (
                interview_count
            ),

            "career_progress": (
                career_progress
            ),

            "avg_interview_score": (
                avg_interview_score
            ),

            "avg_application_score": (
                avg_application_score
            ),

            "score_change": (
                score_change
            ),
        },

        "activities": activities,

        "recommended_jobs": top_jobs,

        "weekly_progress": weekly_progress,

        "recommendations": recommendations,

        "upcoming": upcoming,
    }

    return Response(
        data,
        status=status.HTTP_200_OK
    )


# =========================================================
# CV STUDIO
# =========================================================

@api_view(["POST"])
@permission_classes([IsAuthenticated])
@throttle_classes([AIRateThrottle])
def analyze_cv(request):

    uploaded_file = request.FILES.get("cv")

    if not uploaded_file:

        return Response(
            {
                "success": False,
                "error": "Please upload a CV."
            },
            status=status.HTTP_400_BAD_REQUEST
        )

    filename = uploaded_file.name.lower()

    allowed_extensions = [
        ".pdf",
        ".docx"
    ]

    if not any(
        filename.endswith(ext)
        for ext in allowed_extensions
    ):

        return Response(
            {
                "success": False,
                "error": (
                    "Please upload a PDF or DOCX file."
                )
            },
            status=status.HTTP_400_BAD_REQUEST
        )

    if uploaded_file.size > 10 * 1024 * 1024:

        return Response(
            {
                "success": False,
                "error": "CV must be smaller than 10 MB."
            },
            status=status.HTTP_400_BAD_REQUEST
        )

    try:
        validate_cv_upload(uploaded_file)
    except ValueError as error:
        return Response(
            {
                "success": False,
                "error": str(error),
            },
            status=status.HTTP_400_BAD_REQUEST
        )

    # =====================================================
    # EXTRACT TEXT
    # =====================================================

    try:

        text = extract_cv_text(
            uploaded_file
        )

        if not text or not text.strip():

            return Response(
                {
                    "success": False,
                    "error": (
                        "We could not extract text from this CV."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST
            )

    except ValueError as error:

        return Response(
            {
                "success": False,
                "error": str(error)
            },
            status=status.HTTP_400_BAD_REQUEST
        )

    except Exception as error:

        print(
            "CV TEXT EXTRACTION ERROR:",
            error
        )

        return Response(
            {
                "success": False,
                "error": (
                    "Something went wrong while reading the CV."
                )
            },
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

    try:
        uploaded_file.seek(0)
    except Exception:
        pass

    # =====================================================
    # ANALYZE CV
    # =====================================================

    try:

        analysis = analyze_cv_text(
            text
        )

    except Exception as error:

        print(
            "CV ANALYSIS ERROR:",
            error
        )

        return Response(
            {
                "success": False,
                "error": (
                    "Something went wrong while analyzing the CV."
                )
            },
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

    # =====================================================
    # AI PROFILE EXTRACTION
    # =====================================================

    try:

        profile_data = extract_profile_from_cv(
            text
        )

        if not isinstance(
            profile_data,
            dict
        ):
            profile_data = {}

    except Exception as error:

        print(
            "AI CV EXTRACTION ERROR:",
            error
        )

        return Response(
            {
                "success": False,
                "error": (
                    "The CV was read successfully, but we "
                    "could not extract the profile information."
                )
            },
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

    # =====================================================
    # USER
    # =====================================================

    user = request.user

    # =====================================================
    # SAVE
    # =====================================================

    try:

        with transaction.atomic():

            profile, created = UserProfile.objects.get_or_create(
                user=user
            )

            # -------------------------------------------------
            # SAVE RESUME
            # -------------------------------------------------

            profile.resume = uploaded_file

            profile.resume_filename = (
                uploaded_file.name
            )

            profile.resume_uploaded = True
            profile.resume_analyzed = True

            profile.resume_score = int(
                analysis.get(
                    "overall_score",
                    0
                ) or 0
            )

            profile.ats_score = int(
                analysis.get(
                    "ats_score",
                    0
                ) or 0
            )

            profile.resume_word_count = int(
                analysis.get(
                    "word_count",
                    0
                ) or 0
            )

            # -------------------------------------------------
            # PROFILE DATA
            # -------------------------------------------------

            full_name = (
                profile_data.get("full_name")
                or ""
            )

            email = (
                profile_data.get("email")
                or ""
            )

            phone = (
                profile_data.get("phone")
                or ""
            )

            country = (
                profile_data.get("country")
                or ""
            )

            city = (
                profile_data.get("city")
                or ""
            )

            bio = (
                profile_data.get("bio")
                or ""
            )

            skills_data = (
                profile_data.get("skills")
                or []
            )

            education_data = (
                profile_data.get("education")
                or []
            )

            experience_data = (
                profile_data.get("experience")
                or []
            )

            career_goal = (
                profile_data.get("career_goal")
                or ""
            )

            target_role = (
                profile_data.get("target_role")
                or ""
            )

            years_experience = profile_data.get(
                "years_experience",
                None
            )

            linkedin = (
                profile_data.get("linkedin")
                or ""
            )

            github = (
                profile_data.get("github")
                or ""
            )

            portfolio = (
                profile_data.get("portfolio")
                or ""
            )

            # -------------------------------------------------
            # UPDATE USER PROFILE
            # -------------------------------------------------

            if full_name:
                profile.full_name = full_name

            if phone:
                profile.phone = phone

            if country:
                profile.country = country

            if city:
                profile.city = city

            if bio:
                profile.bio = bio

            if career_goal:
                profile.career_goal = career_goal

            if target_role:
                profile.target_role = target_role

            if linkedin:
                profile.linkedin = linkedin

            if github:
                profile.github = github

            if portfolio:
                profile.portfolio = portfolio

            # -------------------------------------------------
            # YEARS EXPERIENCE
            # -------------------------------------------------

            if years_experience is not None:

                try:

                    profile.years_experience = max(
                        0,
                        int(years_experience)
                    )

                except (
                    TypeError,
                    ValueError
                ):
                    pass

            # -------------------------------------------------
            # UPDATE EMAIL
            # -------------------------------------------------

            if email and not user.email:

                user.email = email

                user.save(
                    update_fields=["email"]
                )

            # -------------------------------------------------
            # FALLBACK NAME
            # -------------------------------------------------

            if not profile.full_name:

                registration_name = (
                    f"{user.first_name} "
                    f"{user.last_name}"
                ).strip()

                if registration_name:
                    profile.full_name = registration_name

            # -------------------------------------------------
            # SAVE SKILLS
            # -------------------------------------------------

            if isinstance(
                skills_data,
                list
            ):

                for item in skills_data:

                    if isinstance(
                        item,
                        dict
                    ):

                        skill_name = (
                            item.get("name")
                            or item.get("skill")
                            or ""
                        )

                        skill_level = (
                            item.get("level")
                            or "Intermediate"
                        )

                        skill_category = (
                            item.get("category")
                            or "Technical"
                        )

                    else:

                        skill_name = str(item)

                        skill_level = "Intermediate"

                        skill_category = "Technical"

                    skill_name = str(
                        skill_name
                    ).strip()

                    if not skill_name:
                        continue

                    Skill.objects.get_or_create(
                        user=user,
                        name=skill_name,
                        defaults={
                            "level": skill_level,
                            "category": skill_category,
                        }
                    )

            # -------------------------------------------------
            # SAVE EDUCATION
            # -------------------------------------------------

            if isinstance(
                education_data,
                list
            ):

                for item in education_data:

                    if isinstance(
                        item,
                        dict
                    ):

                        degree = str(
                            item.get("degree")
                            or item.get("qualification")
                            or ""
                        ).strip()

                        institution = str(
                            item.get("institution")
                            or item.get("school")
                            or ""
                        ).strip()

                        field = str(
                            item.get("field")
                            or item.get("course")
                            or item.get("program")
                            or ""
                        ).strip()

                        period = str(
                            item.get("period")
                            or item.get("dates")
                            or ""
                        ).strip()

                        grade = str(
                            item.get("grade")
                            or ""
                        ).strip()

                    else:

                        degree = str(
                            item
                        ).strip()

                        institution = ""
                        field = ""
                        period = ""
                        grade = ""

                    if not degree and not institution:
                        continue

                    Education.objects.create(
                        user=user,
                        degree=degree,
                        institution=institution,
                        field=field,
                        period=period,
                        grade=grade,
                    )

            # -------------------------------------------------
            # SAVE EXPERIENCE
            # -------------------------------------------------

            if isinstance(
                experience_data,
                list
            ):

                for item in experience_data:

                    if isinstance(
                        item,
                        dict
                    ):

                        role = str(
                            item.get("role")
                            or item.get("position")
                            or item.get("title")
                            or ""
                        ).strip()

                        company = str(
                            item.get("company")
                            or item.get("organization")
                            or ""
                        ).strip()

                        period = str(
                            item.get("period")
                            or item.get("dates")
                            or ""
                        ).strip()

                        description = str(
                            item.get("description")
                            or item.get("responsibilities")
                            or ""
                        ).strip()

                    else:

                        role = str(
                            item
                        ).strip()

                        company = ""
                        period = ""
                        description = ""

                    if not role and not company:
                        continue

                    Experience.objects.create(
                        user=user,
                        role=role,
                        company=company,
                        period=period,
                        description=description,
                    )

            # -------------------------------------------------
            # CALCULATE PROFILE COMPLETION
            # -------------------------------------------------

            profile.profile_completion = min(
                max(
                    calculate_profile_completion(
                        profile
                    ),
                    0
                ),
                100
            )

            # -------------------------------------------------
            # CALCULATE CAREER SCORE
            # -------------------------------------------------

            profile.career_score = min(
                max(
                    calculate_career_score(
                        profile
                    ),
                    0
                ),
                100
            )

            profile.completed = (
                profile.profile_completion >= 70
            )

            # -------------------------------------------------
            # SAVE PROFILE
            # -------------------------------------------------

            profile.save()

            # -------------------------------------------------
            # PREPARE RELATED DATA
            # -------------------------------------------------

            saved_skills = Skill.objects.filter(
                user=user
            )

            saved_experiences = Experience.objects.filter(
                user=user
            )

            saved_educations = Education.objects.filter(
                user=user
            )

            skills_text = ", ".join(
                skill.name
                for skill in saved_skills
            )

            education_text = "\n".join(
                " | ".join(
                    str(value)
                    for value in [
                        education.degree,
                        education.institution,
                        education.field,
                        education.period,
                        education.grade,
                    ]
                    if value
                )
                for education in saved_educations
            )

            experience_text = "\n".join(
                " | ".join(
                    str(value)
                    for value in [
                        experience.role,
                        experience.company,
                        experience.period,
                        experience.description,
                    ]
                    if value
                )
                for experience in saved_experiences
            )

            # -------------------------------------------------
            # SAVE RESUME ANALYSIS
            # -------------------------------------------------

            ResumeAnalysis.objects.create(

                user=user,

                filename=uploaded_file.name,

                word_count=int(
                    analysis.get(
                        "word_count",
                        0
                    ) or 0
                ),

                score=int(
                    analysis.get(
                        "overall_score",
                        0
                    ) or 0
                ),

                ats_score=int(
                    analysis.get(
                        "ats_score",
                        0
                    ) or 0
                ),

                impact_score=int(
                    analysis.get(
                        "impact_score",
                        0
                    ) or 0
                ),

                keyword_score=int(
                    analysis.get(
                        "keyword_score",
                        0
                    ) or 0
                ),

                format_score=int(
                    analysis.get(
                        "format_score",
                        0
                    ) or 0
                ),

                skills=skills_text,

                education=education_text,

                experience=experience_text,

                summary=profile.bio or "",

                linkedin=profile.linkedin or "",

                github=profile.github or "",

                portfolio=profile.portfolio or "",

                phone=profile.phone or "",

                email=email or user.email or "",

                technologies=", ".join(
                    str(item)
                    for item in analysis.get(
                        "technologies",
                        []
                    )
                ),

                action_verbs=", ".join(
                    str(item)
                    for item in analysis.get(
                        "action_verbs",
                        []
                    )
                ),

                metrics_found=int(
                    analysis.get(
                        "metrics_found",
                        0
                    ) or 0
                ),

                strengths=analysis.get(
                    "strengths",
                    []
                ),

                weaknesses=analysis.get(
                    "weaknesses",
                    []
                ),

                recommendations=analysis.get(
                    "recommendations",
                    []
                ),
            )

            # -------------------------------------------------
            # NOTIFICATION
            # -------------------------------------------------

            Notification.objects.create(
                user=user,
                message=(
                    "Your CV was analyzed successfully "
                    "and your career profile has been updated."
                )
            )

    except Exception as error:

        print(
            "CV SAVE ERROR:",
            error
        )

        return Response(
            {
                "success": False,
                "error": (
                    "The CV was analyzed, but we could not "
                    "save the results. Please try again."
                )
            },
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

    # =====================================================
    # RESPONSE
    # =====================================================

    return Response(
        {
            "success": True,

            "filename": uploaded_file.name,

            "message": (
                "CV analyzed and profile updated successfully."
            ),

            "analysis": analysis,

            "profile": {
                "full_name": profile.full_name or "",
                "phone": profile.phone or "",
                "country": profile.country or "",
                "city": profile.city or "",
                "bio": profile.bio or "",
                "career_goal": profile.career_goal or "",
                "target_role": profile.target_role or "",

                "years_experience": (
                    profile.years_experience or 0
                ),

                "linkedin": profile.linkedin or "",
                "github": profile.github or "",
                "portfolio": profile.portfolio or "",

                "resume_filename": (
                    profile.resume_filename or ""
                ),

                "resume_score": (
                    profile.resume_score or 0
                ),

                "ats_score": (
                    profile.ats_score or 0
                ),

                "resume_word_count": (
                    profile.resume_word_count or 0
                ),

                "career_score": (
                    profile.career_score or 0
                ),

                "profile_completion": (
                    profile.profile_completion or 0
                ),

                "resume_uploaded": (
                    profile.resume_uploaded
                ),

                "resume_analyzed": (
                    profile.resume_analyzed
                ),

                "completed": (
                    profile.completed
                ),
            }
        },

        status=status.HTTP_201_CREATED
    )


# =========================================================
# PROFILE API
# =========================================================

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def profile_api(request):

    user = request.user

    profile, created = UserProfile.objects.get_or_create(
        user=user
    )

    skills = Skill.objects.filter(
        user=user
    ).order_by("-created_at")

    experiences = Experience.objects.filter(
        user=user
    ).order_by("-created_at")

    educations = Education.objects.filter(
        user=user
    ).order_by("-created_at")

    projects = Project.objects.filter(
        user=user
    ).order_by("-created_at")

    profile_picture = None

    if profile.profile_picture:

        profile_picture = request.build_absolute_uri(
            profile.profile_picture.url
        )

    return Response(
        {
            "success": True,

            "user": {
                "id": user.id,
                "username": user.username,
                "first_name": user.first_name,
                "last_name": user.last_name,
                "email": user.email,
            },

            "profile": {
                "full_name": profile.full_name or "",
                "phone": profile.phone or "",
                "country": profile.country or "",
                "city": profile.city or "",
                "bio": profile.bio or "",

                "career_goal": profile.career_goal or "",
                "target_role": profile.target_role or "",

                "years_experience": (
                    profile.years_experience or 0
                ),

                "work_preference": (
                    profile.work_preference or ""
                ),

                "linkedin": profile.linkedin or "",
                "github": profile.github or "",
                "portfolio": profile.portfolio or "",

                "resume_filename": (
                    profile.resume_filename or ""
                ),

                "resume_score": (
                    profile.resume_score or 0
                ),

                "ats_score": (
                    profile.ats_score or 0
                ),

                "resume_word_count": (
                    profile.resume_word_count or 0
                ),

                "career_score": (
                    profile.career_score or 0
                ),

                "profile_completion": (
                    profile.profile_completion or 0
                ),

                "resume_uploaded": (
                    profile.resume_uploaded
                ),

                "resume_analyzed": (
                    profile.resume_analyzed
                ),

                "completed": (
                    profile.completed
                ),

                "profile_picture": profile_picture,
            },

            "skills": [
                {
                    "id": skill.id,
                    "name": skill.name,
                    "level": skill.level,
                    "category": skill.category,
                }
                for skill in skills
            ],

            "experiences": [
                {
                    "id": experience.id,
                    "role": experience.role,
                    "company": experience.company,
                    "period": experience.period,
                    "description": experience.description,
                }
                for experience in experiences
            ],

            "educations": [
                {
                    "id": education.id,
                    "degree": education.degree,
                    "institution": education.institution,
                    "field": education.field,
                    "period": education.period,
                    "grade": education.grade,
                }
                for education in educations
            ],

            "projects": [
                {
                    "id": project.id,
                    "name": project.name,
                    "description": project.description,
                    "technologies": (
                        project.technologies or []
                    ),
                    "url": project.url,
                }
                for project in projects
            ],
        },

        status=status.HTTP_200_OK
    )


# =========================================================
# UPDATE PROFILE API
# =========================================================

@api_view(["PUT", "PATCH"])
@permission_classes([IsAuthenticated])
def update_profile_api(request):

    user = request.user

    profile, created = UserProfile.objects.get_or_create(
        user=user
    )

    data = request.data

    # =====================================================
    # USER INFORMATION
    # =====================================================

    if "first_name" in data:

        user.first_name = data.get(
            "first_name",
            ""
        )

    if "last_name" in data:

        user.last_name = data.get(
            "last_name",
            ""
        )

    if "email" in data:

        email = str(
            data.get(
                "email",
                ""
            )
        ).strip()

        if email:

            existing_user = User.objects.filter(
                email__iexact=email
            ).exclude(
                id=user.id
            ).first()

            if existing_user:

                return Response(
                    {
                        "success": False,
                        "error": (
                            "That email address is already "
                            "being used by another account."
                        )
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )

            user.email = email

    user.save()

    # =====================================================
    # NORMAL PROFILE FIELDS
    # =====================================================

    profile_fields = [
        "full_name",
        "phone",
        "country",
        "city",
        "bio",
        "career_goal",
        "target_role",
        "years_experience",
        "linkedin",
        "github",
        "portfolio",
    ]

    for field in profile_fields:

        if field not in data:
            continue

        value = data.get(field)

        if value is None:
            value = ""

        setattr(
            profile,
            field,
            value
        )

    # =====================================================
    # YEARS EXPERIENCE
    # =====================================================

    if "years_experience" in data:

        try:

            profile.years_experience = max(
                0,
                int(
                    data.get(
                        "years_experience"
                    ) or 0
                )
            )

        except (
            TypeError,
            ValueError
        ):

            profile.years_experience = 0

    # =====================================================
    # UPDATE SKILLS
    # =====================================================

    if "skills" in data:

        skills_data = data.get("skills")

        if isinstance(
            skills_data,
            list
        ):

            Skill.objects.filter(
                user=user
            ).delete()

            for item in skills_data:

                if isinstance(
                    item,
                    dict
                ):

                    name = str(
                        item.get("name")
                        or item.get("skill")
                        or ""
                    ).strip()

                    level = str(
                        item.get("level")
                        or "Intermediate"
                    ).strip()

                    category = str(
                        item.get("category")
                        or "Technical"
                    ).strip()

                else:

                    name = str(
                        item
                    ).strip()

                    level = "Intermediate"
                    category = "Technical"

                if name:

                    Skill.objects.create(
                        user=user,
                        name=name,
                        level=level,
                        category=category,
                    )

    # =====================================================
    # UPDATE EDUCATION
    # =====================================================

    if "education" in data:

        education_data = data.get(
            "education"
        )

        if isinstance(
            education_data,
            list
        ):

            Education.objects.filter(
                user=user
            ).delete()

            for item in education_data:

                if not isinstance(
                    item,
                    dict
                ):
                    continue

                Education.objects.create(
                    user=user,

                    degree=str(
                        item.get("degree")
                        or ""
                    ).strip(),

                    institution=str(
                        item.get("institution")
                        or ""
                    ).strip(),

                    field=str(
                        item.get("field")
                        or ""
                    ).strip(),

                    period=str(
                        item.get("period")
                        or ""
                    ).strip(),

                    grade=str(
                        item.get("grade")
                        or ""
                    ).strip(),
                )

    # =====================================================
    # UPDATE EXPERIENCE
    # =====================================================

    if "experience" in data:

        experience_data = data.get(
            "experience"
        )

        if isinstance(
            experience_data,
            list
        ):

            Experience.objects.filter(
                user=user
            ).delete()

            for item in experience_data:

                if not isinstance(
                    item,
                    dict
                ):
                    continue

                Experience.objects.create(
                    user=user,

                    role=str(
                        item.get("role")
                        or ""
                    ).strip(),

                    company=str(
                        item.get("company")
                        or ""
                    ).strip(),

                    period=str(
                        item.get("period")
                        or ""
                    ).strip(),

                    description=str(
                        item.get("description")
                        or ""
                    ).strip(),
                )

    # =====================================================
    # CALCULATE SCORES
    # =====================================================

    profile.profile_completion = min(
        max(
            calculate_profile_completion(
                profile
            ),
            0
        ),
        100
    )

    profile.career_score = min(
        max(
            calculate_career_score(
                profile
            ),
            0
        ),
        100
    )

    profile.completed = (
        profile.profile_completion >= 70
    )

    profile.save()

    # =====================================================
    # NOTIFICATION
    # =====================================================

    Notification.objects.create(
        user=user,
        message=(
            "Your career profile was updated successfully."
        )
    )

    # =====================================================
    # RETURN UPDATED DATA
    # =====================================================

    skills = Skill.objects.filter(
        user=user
    )

    experiences = Experience.objects.filter(
        user=user
    )

    educations = Education.objects.filter(
        user=user
    )

    projects = Project.objects.filter(
        user=user
    )

    return Response(
        {
            "success": True,

            "message": (
                "Profile updated successfully."
            ),

            "user": {
                "id": user.id,
                "username": user.username,
                "first_name": user.first_name,
                "last_name": user.last_name,
                "email": user.email,
            },

            "profile": {
                "full_name": profile.full_name or "",
                "phone": profile.phone or "",
                "country": profile.country or "",
                "city": profile.city or "",
                "bio": profile.bio or "",

                "career_goal": (
                    profile.career_goal or ""
                ),

                "target_role": (
                    profile.target_role or ""
                ),

                "years_experience": (
                    profile.years_experience or 0
                ),

                "linkedin": profile.linkedin or "",
                "github": profile.github or "",
                "portfolio": profile.portfolio or "",

                "resume_filename": (
                    profile.resume_filename or ""
                ),

                "resume_score": (
                    profile.resume_score or 0
                ),

                "ats_score": (
                    profile.ats_score or 0
                ),

                "resume_word_count": (
                    profile.resume_word_count or 0
                ),

                "career_score": (
                    profile.career_score or 0
                ),

                "profile_completion": (
                    profile.profile_completion or 0
                ),

                "resume_uploaded": (
                    profile.resume_uploaded
                ),

                "resume_analyzed": (
                    profile.resume_analyzed
                ),

                "completed": (
                    profile.completed
                ),
            },

            "skills": [
                {
                    "id": skill.id,
                    "name": skill.name,
                    "level": skill.level,
                    "category": skill.category,
                }
                for skill in skills
            ],

            "experiences": [
                {
                    "id": experience.id,
                    "role": experience.role,
                    "company": experience.company,
                    "period": experience.period,
                    "description": experience.description,
                }
                for experience in experiences
            ],

            "educations": [
                {
                    "id": education.id,
                    "degree": education.degree,
                    "institution": education.institution,
                    "field": education.field,
                    "period": education.period,
                    "grade": education.grade,
                }
                for education in educations
            ],

            "projects": [
                {
                    "id": project.id,
                    "name": project.name,
                    "description": project.description,
                    "technologies": (
                        project.technologies or []
                    ),
                    "url": project.url,
                }
                for project in projects
            ],
        },

        status=status.HTTP_200_OK
    )


# =========================================================
# RESUME ANALYSIS HISTORY
# =========================================================

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def resume_history_api(request):

    analyses = ResumeAnalysis.objects.filter(
        user=request.user
    ).order_by(
        "-created_at"
    )

    results = []

    for analysis in analyses:

        results.append(
            {
                "id": analysis.id,
                "filename": analysis.filename,
                "word_count": analysis.word_count,
                "score": analysis.score,
                "ats_score": analysis.ats_score,
                "impact_score": analysis.impact_score,
                "keyword_score": analysis.keyword_score,
                "format_score": analysis.format_score,
                "skills": analysis.skills,
                "education": analysis.education,
                "experience": analysis.experience,
                "summary": analysis.summary,
                "linkedin": analysis.linkedin,
                "github": analysis.github,
                "portfolio": analysis.portfolio,
                "phone": analysis.phone,
                "email": analysis.email,
                "technologies": analysis.technologies,
                "action_verbs": analysis.action_verbs,
                "metrics_found": analysis.metrics_found,
                "strengths": analysis.strengths,
                "weaknesses": analysis.weaknesses,
                "recommendations": analysis.recommendations,
                "created_at": analysis.created_at,
            }
        )

    return Response(
        {
            "success": True,
            "count": len(results),
            "results": results,
        },
        status=status.HTTP_200_OK
    )


# =========================================================
# NOTIFICATIONS
# =========================================================

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def notifications_api(request):

    notifications = Notification.objects.filter(
        user=request.user
    ).order_by(
        "-created_at"
    )

    results = []

    for notification in notifications:

        results.append(
            {
                "id": notification.id,
                "message": notification.message,
                "is_read": notification.is_read,
                "created_at": notification.created_at,
            }
        )

    return Response(
        {
            "success": True,
            "count": len(results),
            "notifications": results,
        },
        status=status.HTTP_200_OK
    )


# =========================================================
# MARK NOTIFICATION AS READ
# =========================================================

@api_view(["PATCH"])
@permission_classes([IsAuthenticated])
def mark_notification_read(
    request,
    notification_id
):

    try:

        notification = Notification.objects.get(
            id=notification_id,
            user=request.user
        )

    except Notification.DoesNotExist:

        return Response(
            {
                "success": False,
                "error": "Notification not found."
            },
            status=status.HTTP_404_NOT_FOUND
        )

    notification.is_read = True

    notification.save(
        update_fields=[
            "is_read"
        ]
    )

    return Response(
        {
            "success": True,
            "message": "Notification marked as read."
        },
        status=status.HTTP_200_OK
    )

from django.db.models import Q
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from jobs.models import Job
from users.models import Skill


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def global_search_api(request):
    query = request.GET.get("q", "").strip()

    if not query:
        return Response({
            "success": True,
            "query": "",
            "results": [],
        })

    if len(query) < 2:
        return Response({
            "success": True,
            "query": query,
            "results": [],
        })

    # --------------------------------------------------
    # JOBS
    # --------------------------------------------------

    jobs = (
        Job.objects
        .filter(
            Q(title__icontains=query)
            | Q(company__icontains=query)
            | Q(location__icontains=query)
            | Q(requirements__icontains=query)
            | Q(description__icontains=query)
        )
        .order_by("-id")[:6]
    )

    job_results = [
        {
            "id": job.id,
            "type": "job",
            "title": job.title,
            "subtitle": job.company,
            "location": job.location,
            "url": f"/jobs/{job.id}",
        }
        for job in jobs
    ]

    # --------------------------------------------------
    # SKILLS
    # --------------------------------------------------

    skills = (
        Skill.objects
        .filter(
            name__icontains=query
        )
        .order_by("name")[:5]
    )

    skill_results = [
        {
            "id": skill.id,
            "type": "skill",
            "title": skill.name,
            "subtitle": "Skill",
            "url": f"/jobs?search={skill.name}",
        }
        for skill in skills
    ]

    results = job_results + skill_results

    return Response({
        "success": True,
        "query": query,
        "results": results,
    })