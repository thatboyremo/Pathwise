import re

from .models import Notification


# =========================================================
# CV ANALYSIS ENGINE
# =========================================================

def analyze_cv_text(cv_text):
    """
    Analyze CV text and return structured scoring information.
    """

    if not cv_text:
        cv_text = ""

    cv_text = cv_text.lower()

    skill_keywords = [
        "python",
        "django",
        "flask",
        "java",
        "c++",
        "c#",
        "javascript",
        "typescript",
        "html",
        "css",
        "sql",
        "react",
        "node",
        "node.js",
        "api",
        "machine learning",
        "artificial intelligence",
        "ai",
        "data science",
        "data analysis",
        "git",
        "github",
        "docker",
        "aws",
        "azure",
        "pandas",
        "numpy",
        "scikit-learn",
        "tensorflow",
        "pytorch",
        "streamlit",
        "tailwind",
    ]

    found_skills = [
        skill
        for skill in skill_keywords
        if skill in cv_text
    ]

    # -----------------------------------------------------
    # Word count
    # -----------------------------------------------------

    word_count = len(cv_text.split())

    # -----------------------------------------------------
    # Technology detection
    # -----------------------------------------------------

    technologies = found_skills.copy()

    # -----------------------------------------------------
    # Action verbs
    # -----------------------------------------------------

    action_verbs_list = [
        "developed",
        "designed",
        "created",
        "implemented",
        "built",
        "managed",
        "analyzed",
        "developed",
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
    ]

    action_verbs = [
        verb
        for verb in action_verbs_list
        if re.search(r"\b" + re.escape(verb) + r"\b", cv_text)
    ]

    # -----------------------------------------------------
    # Metrics
    # -----------------------------------------------------

    metrics_found = len(
        re.findall(
            r"\b\d+(?:\.\d+)?%?\b",
            cv_text
        )
    )

    # -----------------------------------------------------
    # Score components
    # -----------------------------------------------------

    keyword_score = min(
        len(found_skills) * 5,
        25
    )

    impact_score = min(
        len(action_verbs) * 4 + metrics_found * 3,
        25
    )

    format_score = 10

    if word_count >= 300:
        format_score += 5

    if word_count >= 500:
        format_score += 5

    format_score = min(format_score, 20)

    ats_score = min(
        keyword_score +
        impact_score +
        format_score +
        20,
        100
    )

    overall_score = min(
        int(
            (
                keyword_score +
                impact_score +
                format_score +
                ats_score
            ) / 2
        ),
        100
    )

    # -----------------------------------------------------
    # Strengths
    # -----------------------------------------------------

    strengths = []

    if found_skills:
        strengths.append(
            f"Relevant technical skills detected: "
            f"{', '.join(found_skills[:8])}."
        )

    if action_verbs:
        strengths.append(
            "The CV uses strong action verbs."
        )

    if metrics_found:
        strengths.append(
            "The CV contains measurable achievements or metrics."
        )

    if word_count >= 300:
        strengths.append(
            "The CV contains a reasonable amount of content."
        )

    if not strengths:
        strengths.append(
            "The CV contains basic professional information."
        )

    # -----------------------------------------------------
    # Weaknesses
    # -----------------------------------------------------

    weaknesses = []

    if not found_skills:
        weaknesses.append(
            "Few relevant technical skills were detected."
        )

    if not action_verbs:
        weaknesses.append(
            "Use stronger action verbs when describing experience."
        )

    if metrics_found == 0:
        weaknesses.append(
            "Add measurable results such as percentages, "
            "numbers, revenue, users, or performance improvements."
        )

    if word_count < 250:
        weaknesses.append(
            "The CV may contain too little detail."
        )

    # -----------------------------------------------------
    # Recommendations
    # -----------------------------------------------------

    recommendations = []

    if not found_skills:
        recommendations.append(
            "Add relevant technical and professional skills."
        )

    if not action_verbs:
        recommendations.append(
            "Replace generic descriptions with action-oriented statements."
        )

    if metrics_found == 0:
        recommendations.append(
            "Quantify achievements wherever possible."
        )

    recommendations.append(
        "Tailor the CV keywords to each target job description."
    )

    recommendations.append(
        "Keep formatting simple and ATS-friendly."
    )

    # -----------------------------------------------------
    # Feedback
    # -----------------------------------------------------

    if overall_score >= 80:
        feedback = ["Excellent CV"]
    elif overall_score >= 70:
        feedback = ["Strong CV"]
    elif overall_score >= 50:
        feedback = ["Good CV, but improvements are recommended"]
    else:
        feedback = ["Needs improvement"]

    return {
        "score": overall_score,
        "overall_score": overall_score,
        "ats_score": ats_score,
        "impact_score": impact_score,
        "keyword_score": keyword_score,
        "format_score": format_score,
        "word_count": word_count,
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
# EXTRACT PROFILE INFORMATION FROM CV
# =========================================================

def extract_profile_from_cv(cv_text):
    """
    Extract basic profile information from CV text.

    This is a rule-based extractor. It can later be replaced
    or enhanced with an AI/LLM extraction service.
    """

    if not cv_text:
        return {
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
            "portfolio": "",
        }

    original_text = cv_text.strip()

    # -----------------------------------------------------
    # Email
    # -----------------------------------------------------

    email_match = re.search(
        r"[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}",
        original_text
    )

    email = (
        email_match.group(0)
        if email_match
        else ""
    )

    # -----------------------------------------------------
    # Phone
    # -----------------------------------------------------

    phone_match = re.search(
        r"(?:\+?\d[\d\s().-]{7,}\d)",
        original_text
    )

    phone = (
        phone_match.group(0).strip()
        if phone_match
        else ""
    )

    # -----------------------------------------------------
    # LinkedIn
    # -----------------------------------------------------

    linkedin_match = re.search(
        r"https?://(?:www\.)?linkedin\.com/[^\s]+",
        original_text,
        re.IGNORECASE
    )

    linkedin = (
        linkedin_match.group(0).rstrip(".,)")
        if linkedin_match
        else ""
    )

    # -----------------------------------------------------
    # GitHub
    # -----------------------------------------------------

    github_match = re.search(
        r"https?://(?:www\.)?github\.com/[^\s]+",
        original_text,
        re.IGNORECASE
    )

    github = (
        github_match.group(0).rstrip(".,)")
        if github_match
        else ""
    )

    # -----------------------------------------------------
    # Portfolio / personal website
    # -----------------------------------------------------

    urls = re.findall(
        r"https?://[^\s]+",
        original_text
    )

    portfolio = ""

    for url in urls:
        clean_url = url.rstrip(".,)")

        if (
            "linkedin.com" not in clean_url.lower()
            and "github.com" not in clean_url.lower()
        ):
            portfolio = clean_url
            break

    # -----------------------------------------------------
    # Full name
    # -----------------------------------------------------

    lines = [
        line.strip()
        for line in original_text.splitlines()
        if line.strip()
    ]

    full_name = ""

    if lines:
        # Usually the first line of a CV is the candidate's name.
        candidate = lines[0]

        if (
            len(candidate.split()) <= 6
            and not re.search(r"[@:/\\]", candidate)
            and len(candidate) <= 100
        ):
            full_name = candidate

    # -----------------------------------------------------
    # Skills
    # -----------------------------------------------------

    skill_keywords = [
        "Python",
        "Django",
        "Flask",
        "Java",
        "C++",
        "C#",
        "JavaScript",
        "TypeScript",
        "HTML",
        "CSS",
        "SQL",
        "React",
        "Node.js",
        "API",
        "Machine Learning",
        "Artificial Intelligence",
        "AI",
        "Data Science",
        "Data Analysis",
        "Git",
        "GitHub",
        "Docker",
        "AWS",
        "Azure",
        "Pandas",
        "NumPy",
        "Scikit-learn",
        "TensorFlow",
        "PyTorch",
        "Streamlit",
        "Tailwind CSS",
        "MySQL",
    ]

    lower_text = original_text.lower()

    skills = [
        skill
        for skill in skill_keywords
        if skill.lower() in lower_text
    ]

    # -----------------------------------------------------
    # Education
    # -----------------------------------------------------

    education = []

    education_keywords = [
        "university",
        "college",
        "bachelor",
        "b.sc",
        "bsc",
        "master",
        "m.sc",
        "msc",
        "degree",
        "education",
    ]

    for line in lines:
        lower_line = line.lower()

        if any(
            keyword in lower_line
            for keyword in education_keywords
        ):
            education.append(line)

    # Remove duplicates
    education = list(dict.fromkeys(education))

    # -----------------------------------------------------
    # Experience
    # -----------------------------------------------------

    experience = []

    experience_keywords = [
        "experience",
        "intern",
        "internship",
        "developer",
        "engineer",
        "analyst",
        "manager",
        "worked",
        "employment",
    ]

    for line in lines:
        lower_line = line.lower()

        if any(
            keyword in lower_line
            for keyword in experience_keywords
        ):
            experience.append(line)

    experience = list(dict.fromkeys(experience))

    # -----------------------------------------------------
    # Years of experience
    # -----------------------------------------------------

    years_experience = 0

    years_match = re.search(
        r"(\d+)\+?\s+years?",
        lower_text
    )

    if years_match:
        try:
            years_experience = int(
                years_match.group(1)
            )
        except ValueError:
            years_experience = 0

    # -----------------------------------------------------
    # Target role
    # -----------------------------------------------------

    target_role = ""

    role_keywords = [
        "software developer",
        "software engineer",
        "data analyst",
        "data scientist",
        "machine learning engineer",
        "ml engineer",
        "ai engineer",
        "web developer",
        "frontend developer",
        "backend developer",
        "full stack developer",
        "python developer",
        "cloud engineer",
        "cybersecurity analyst",
    ]

    for role in role_keywords:
        if role in lower_text:
            target_role = role.title()
            break

    # -----------------------------------------------------
    # Career goal
    # -----------------------------------------------------

    career_goal = ""

    if target_role:
        career_goal = (
            f"Build a career as a {target_role}."
        )

    # -----------------------------------------------------
    # Bio / summary
    # -----------------------------------------------------

    bio = ""

    summary_headers = [
        "professional summary",
        "summary",
        "profile",
        "about me",
        "objective",
    ]

    for index, line in enumerate(lines):

        if line.lower().strip() in summary_headers:

            summary_lines = []

            for next_line in lines[index + 1:index + 5]:

                if next_line.lower().strip() in [
                    "experience",
                    "education",
                    "skills",
                    "projects",
                    "certifications",
                ]:
                    break

                summary_lines.append(next_line)

            bio = " ".join(summary_lines).strip()

            if bio:
                break

    return {
        "full_name": full_name,
        "email": email,
        "phone": phone,
        "country": "",
        "city": "",
        "bio": bio,
        "skills": skills,
        "education": education,
        "experience": experience,
        "career_goal": career_goal,
        "target_role": target_role,
        "years_experience": years_experience,
        "linkedin": linkedin,
        "github": github,
        "portfolio": portfolio,
    }


# =========================================================
# PROFILE COMPLETION
# =========================================================

def calculate_profile_completion(profile):
    """
    Calculate profile completion percentage.
    """

    fields = [
        profile.full_name,
        profile.phone,
        profile.country,
        profile.city,
        profile.bio,
        profile.skills,
        profile.education,
        profile.experience,
        profile.career_goal,
        profile.target_role,
        profile.linkedin,
        profile.github,
        profile.portfolio,
    ]

    completed_fields = sum(
        1
        for field in fields
        if field
    )

    total_fields = len(fields)

    if total_fields == 0:
        return 0

    return round(
        (completed_fields / total_fields) * 100
    )


# =========================================================
# CAREER SCORE
# =========================================================

def calculate_career_score(profile):
    """
    Calculate a basic career-readiness score.
    """

    score = 0

    if profile.full_name:
        score += 5

    if profile.bio:
        score += 10

    if profile.skills:
        score += 20

    if profile.education:
        score += 15

    if profile.experience:
        score += 15

    if profile.target_role:
        score += 10

    if profile.career_goal:
        score += 5

    if profile.linkedin:
        score += 5

    if profile.github:
        score += 5

    if profile.portfolio:
        score += 5

    if profile.resume_analyzed:
        score += 5

    return min(score, 100)


# =========================================================
# NOTIFICATION CREATOR
# =========================================================

def create_notification(user, message):
    return Notification.objects.create(
        user=user,
        message=message,
        is_read=False
    )