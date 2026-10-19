from django.shortcuts import render
from django.http import JsonResponse
from django.contrib.auth.decorators import login_required

from docx import Document
import fitz  # PyMuPDF

from analyzer.models import Notification
from .services import analyze_cv_text


# =========================================================
# FILE EXTRACTION HELPERS
# =========================================================

def extract_text_from_pdf(file):
    try:
        text = ""
        doc = fitz.open(stream=file.read(), filetype="pdf")

        for page in doc:
            text += page.get_text()

        return text.lower()
    except Exception:
        return ""


def extract_text_from_docx(file):
    try:
        doc = Document(file)
        return "\n".join([p.text for p in doc.paragraphs]).lower()
    except Exception:
        return ""


def get_cv_text(file):
    filename = file.name.lower()

    if filename.endswith(".pdf"):
        return extract_text_from_pdf(file)

    if filename.endswith(".docx"):
        return extract_text_from_docx(file)

    return ""


# =========================================================
# CV ANALYZER UI
# =========================================================

@login_required
def cv_analyzer(request):
    result = None

    if request.method == "POST":
        # Extract CV text
        if "cv_file" in request.FILES:
            cv_text = get_cv_text(request.FILES["cv_file"])
        else:
            cv_text = request.POST.get("cv_text", "").lower()

        # AI analysis
        result = analyze_cv_text(cv_text)

        # Safe score extraction
        score = result.get("score", 0)

        # Create notification safely
        try:
            Notification.objects.create(
                user=request.user,
                message=f"CV analyzed successfully. Score: {score}"
            )
        except Exception:
            pass

    return render(request, "cv_analyzer.html", {"result": result})


# =========================================================
# CV ANALYZER API (AJAX)
# =========================================================

def cv_analyzer_api(request):
    if request.method == "POST":
        cv_text = request.POST.get("cv_text", "").lower()

        result = analyze_cv_text(cv_text)

        return JsonResponse({
            "success": True,
            "analysis": result
        })

    return JsonResponse({"error": "Invalid request"}, status=400)


# =========================================================
# NOTIFICATIONS API (REAL-TIME POLLING)
# =========================================================

@login_required
def get_notifications(request):
    notifications = Notification.objects.filter(
        user=request.user,
        is_read=False
    ).order_by('-created_at')[:5]

    data = [
        {
            "id": n.id,
            "message": n.message,
            "created_at": n.created_at
        }
        for n in notifications
    ]

    return JsonResponse({
        "notifications": data
    })


# =========================================================
# OTHER PAGES
# =========================================================

def mock_interview(request):
    return render(request, "mock_interview.html")


def scholarships(request):
    return render(request, "scholarships.html")


def ai_advisor(request):
    return render(request, "ai_advisor.html")


def settings(request):
    return render(request, "settings.html")