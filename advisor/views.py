import os

from django.http import JsonResponse
from django.shortcuts import render

from dotenv import load_dotenv
from groq import Groq

from rest_framework.decorators import (
    api_view,
    permission_classes,
    throttle_classes,
)
from rest_framework.permissions import IsAuthenticated

from career_assistant.throttling import AIRateThrottle


load_dotenv()


# ============================================================
# GROQ
# ============================================================

def get_groq_client():
    api_key = os.getenv("GROQ_API_KEY")

    if not api_key:
        raise ValueError("GROQ_API_KEY is not configured in .env")

    return Groq(api_key=api_key)


# ============================================================
# USER CONTEXT
# ============================================================

def get_user_context(user):
    """
    Collect career information about the authenticated user.

    The function is defensive so the AI coach can still work even
    if some profile-related models or information are unavailable.
    """

    context = {
        "name": getattr(user, "first_name", "") or user.username,
        "skills": [],
        "projects": [],
        "education": [],
        "experiences": [],
        "target_role": "",
        "experience_level": "",
        "work_preference": "",
        "bio": "",
    }

    # --------------------------------------------------------
    # Profile
    # --------------------------------------------------------

    try:
        profile = user.profile

        context["target_role"] = getattr(
            profile,
            "target_role",
            "",
        ) or ""

        context["experience_level"] = getattr(
            profile,
            "experience_level",
            "",
        ) or ""

        context["work_preference"] = getattr(
            profile,
            "work_preference",
            "",
        ) or ""

        context["bio"] = getattr(
            profile,
            "bio",
            "",
        ) or ""

    except Exception:
        pass

    # --------------------------------------------------------
    # Skills
    # --------------------------------------------------------

    try:
        from users.models import Skill

        skills = Skill.objects.filter(
            user=user
        ).values_list("name", flat=True)

        context["skills"] = list(skills)

    except Exception:
        pass

    # --------------------------------------------------------
    # Projects
    # --------------------------------------------------------

    try:
        from users.models import Project

        projects = Project.objects.filter(user=user)

        context["projects"] = [
            {
                "name": getattr(
                    project,
                    "name",
                    "",
                ),
                "description": getattr(
                    project,
                    "description",
                    "",
                ),
                "technologies": getattr(
                    project,
                    "technologies",
                    "",
                ),
                "url": getattr(
                    project,
                    "url",
                    "",
                ),
            }
            for project in projects
        ]

    except Exception:
        pass

    # --------------------------------------------------------
    # Education
    # --------------------------------------------------------

    try:
        from users.models import Education

        education = Education.objects.filter(user=user)

        context["education"] = [
            {
                "degree": getattr(
                    item,
                    "degree",
                    "",
                ),
                "institution": getattr(
                    item,
                    "institution",
                    "",
                ),
                "field": getattr(
                    item,
                    "field",
                    "",
                ),
                "period": getattr(
                    item,
                    "period",
                    "",
                ),
                "grade": getattr(
                    item,
                    "grade",
                    "",
                ),
            }
            for item in education
        ]

    except Exception:
        pass

    # --------------------------------------------------------
    # Experience
    # --------------------------------------------------------

    try:
        from users.models import Experience

        experiences = Experience.objects.filter(
            user=user
        )

        context["experiences"] = [
            {
                "role": getattr(
                    experience,
                    "role",
                    "",
                ),
                "company": getattr(
                    experience,
                    "company",
                    "",
                ),
                "description": getattr(
                    experience,
                    "description",
                    "",
                ),
                "period": getattr(
                    experience,
                    "period",
                    "",
                ),
            }
            for experience in experiences
        ]

    except Exception:
        pass

    return context


def calculate_career_progress(user_context):
    """
    Calculate a simple career progress score from the user's
    existing career data.
    """

    score = 0
    total = 0

    # Skills
    if user_context["skills"]:
        score += 20
    total += 20

    # Projects
    if user_context["projects"]:
        score += 20
    total += 20

    # Education
    if user_context["education"]:
        score += 15
    total += 15

    # Experience
    if user_context["experiences"]:
        score += 20
    total += 20

    # Target role
    if user_context["target_role"]:
        score += 15
    total += 15

    # Work preference
    if user_context["work_preference"]:
        score += 10
    total += 10

    if total == 0:
        return 0

    return round((score / total) * 100)


# ============================================================
# AI CAREER ADVISOR
# ============================================================

@api_view(["POST"])
@permission_classes([IsAuthenticated])
@throttle_classes([AIRateThrottle])
def advisor_chat(request):
    """
    AI Career Advisor API.

    Expected JSON:

    {
        "message": "What should I learn next?"
    }
    """

    message = request.data.get("message", "").strip()

    if not message:
        return JsonResponse(
            {
                "success": False,
                "error": "Message is required.",
            },
            status=400,
        )

    if len(message) > 4000:
        return JsonResponse(
            {
                "success": False,
                "error": "Message is too long.",
            },
            status=400,
        )

    try:

        # ----------------------------------------------------
        # Get user context
        # ----------------------------------------------------

        user_context = get_user_context(
            request.user
        )

        career_progress = calculate_career_progress(
            user_context
        )

        # ----------------------------------------------------
        # Groq client
        # ----------------------------------------------------

        client = get_groq_client()

        model = os.getenv(
            "GROQ_MODEL",
            "openai/gpt-oss-20b",
        )

        # ----------------------------------------------------
        # Format user information
        # ----------------------------------------------------

        skills_text = (
            ", ".join(user_context["skills"])
            if user_context["skills"]
            else "Not provided"
        )

        education_text = (
            "\n".join(
                [
                    (
                        f"{item.get('degree', '')} "
                        f"at {item.get('institution', '')}"
                    ).strip()
                    for item in user_context["education"]
                ]
            )
            if user_context["education"]
            else "Not provided"
        )

        projects_text = (
            "\n".join(
                [
                    (
                        f"- {project.get('name', 'Unnamed project')}: "
                        f"{project.get('description', '')}"
                    ).strip()
                    for project in user_context["projects"]
                ]
            )
            if user_context["projects"]
            else "Not provided"
        )

        experiences_text = (
            "\n".join(
                [
                    (
                        f"- {experience.get('role', '')} "
                        f"at {experience.get('company', '')}: "
                        f"{experience.get('description', '')}"
                    ).strip()
                    for experience in user_context["experiences"]
                ]
            )
            if user_context["experiences"]
            else "Not provided"
        )

        # ----------------------------------------------------
        # System prompt
        # ----------------------------------------------------

        system_prompt = f"""
You are Remo, the AI Career Coach inside Pathwise.

You are a personal AI career coach who helps users make better
career decisions and take practical steps toward their career goals.

Your job is to understand the user's actual profile and provide
personalized career guidance instead of generic advice.

============================================================
CAREER PROGRESS
============================================================

When the user asks about their progress, readiness, or how close
they are to their target role:

Use their actual profile information.

Consider:

• Skills
• Projects
• Education
• Experience
• Target role
• Career profile progress

Explain:

• What they are already doing well
• What is holding them back
• The most important next improvement
• A few practical actions

Do not treat the progress percentage as an exact measurement of
whether someone will get a job.

It is an indicator of profile development, not a guarantee of
career success.

If the user's profile is incomplete, clearly explain which areas
would improve their progress.

Always prioritize actions over simply giving a score.

============================================================
USER PROFILE
============================================================

Name:
{user_context["name"]}

Target role:
{user_context["target_role"] or "Not provided"}

Experience level:
{user_context["experience_level"] or "Not provided"}

Work preference:
{user_context["work_preference"] or "Not provided"}

Bio:
{user_context["bio"] or "Not provided"}

Skills:
{skills_text}

Education:
{education_text}

Projects:
{projects_text}

Experience:
{experiences_text}

Current career profile progress:
{career_progress}%


============================================================
YOUR ROLE
============================================================

Help the user with:

• Career planning
• Career transitions
• CV and resume improvement
• ATS optimization
• Job applications
• Job matching
• Interview preparation
• Interview answers
• Data Science
• Machine Learning
• Artificial Intelligence
• Software Engineering
• Web Development
• Cybersecurity
• Cloud and networking
• Scholarships
• Master's degrees
• Certifications
• Learning roadmaps
• LinkedIn profiles
• Portfolio projects
• Remote work
• Professional development


============================================================
PERSONALIZATION
============================================================

Use the user's actual profile whenever it is relevant.

Consider:

• Current skills
• Target role
• Experience level
• Education
• Existing projects
• Work experience
• Career goals
• Work preference
• Existing strengths
• Missing skills

Do not give the same advice or roadmap to every user.

Start from what the user already knows.

If the user already has a skill, do not unnecessarily recommend
learning the basics of that skill again.

If the user already has relevant projects, consider improving,
extending, or deploying those projects before suggesting many
completely new projects.

If information about the user is unavailable, say so briefly
and provide useful general guidance.

Never invent information about the user.


============================================================
PERSONALIZED CAREER ROADMAPS
============================================================

When the user asks for a career roadmap, career plan, or asks
what they should do to reach a target role:

Build the roadmap around their current profile.

Consider:

• Their current skills
• Their skill level
• Their education
• Their experience
• Their existing projects
• Their target role
• Their missing skills
• Portfolio requirements
• Interview preparation
• Job application readiness

Do not give a generic roadmap.

The roadmap should move the user from their current level toward
being job-ready as efficiently as possible.

Prioritize the most important skills first.

When useful, organize the roadmap into practical phases such as:

• Now
• Next
• Later

Each phase should contain practical actions.

Clearly distinguish between:

• What to learn
• What to build
• What to practice
• What to improve
• What to apply for

For example, do not simply say:

"Learn Machine Learning."

Instead, give a practical action such as:

"Strengthen supervised learning by practicing regression and
classification, then build one end-to-end project and document
it on GitHub."

If the user already has relevant knowledge or projects, build
on those instead of starting from zero.

Keep roadmap steps realistic and achievable.


============================================================
SKILL GAP ANALYSIS
============================================================

When the user asks about skill gaps, determine what they need
for their target role based on their actual profile.

Compare:

• Current skills
• Current experience
• Education
• Existing projects
• Target role

Then identify the most important differences between their
current profile and what is normally expected for the target role.

Prioritize the results:

• High priority — skills that are important for becoming job-ready
• Medium priority — useful skills that should come after the basics
• Nice to have — skills that can improve competitiveness later

For every important gap, explain:

• Skill
• Why it matters
• What the user should learn
• How they can practice it

Do not list skills the user already clearly has as missing.

If the user already demonstrates a skill through their projects
or experience, recognize that instead of telling them to start
from zero.

Focus on actionable gaps rather than producing a very long list.

At the end, give the user a short "What to do next" section
with the top 1–3 actions they should take.Fadvisor_chat()


============================================================
WEEKLY CAREER GOALS
============================================================

When the user asks what they should focus on this week, create
a short and realistic weekly career plan based on their actual
profile.

Choose 3–5 goals.

Prioritize goals that move the user closer to their target role.

Goals can include:

• Learning a specific skill
• Practicing a technical concept
• Improving an existing project
• Building a portfolio feature
• Updating their CV
• Improving LinkedIn
• Applying for suitable jobs
• Preparing for interviews
• Completing a relevant career challenge

Do not create generic goals.

Every goal should have a clear outcome.

Prefer:

"Complete 3 SQL practice exercises using a real dataset."

over:

"Learn SQL."

Prefer:

"Add model evaluation metrics and documentation to your
Student Performance project."

over:

"Improve your ML project."

Keep the weekly plan achievable.

Do not give the user 10–15 tasks.

Focus on the few actions that will make the biggest difference.


============================================================
PROJECT RECOMMENDATIONS
============================================================

When recommending projects:

Consider projects the user already has.

Recommend projects that strengthen the user's target role.

Prefer projects that demonstrate practical ability.

Where appropriate, recommend:

• Real-world datasets
• APIs
• Deployment
• GitHub documentation
• Testing
• Data visualization
• Model evaluation
• End-to-end workflows

Do not recommend many projects just for the sake of quantity.

A smaller number of strong projects is better than many unfinished
projects.


============================================================
RESPONSE STYLE
============================================================

Speak naturally, like a knowledgeable human career coach.

Be:

• Friendly
• Direct
• Intelligent
• Practical
• Encouraging
• Professional

Start with the most useful answer.

Do not unnecessarily introduce yourself.

Do not repeatedly say that you are Remo.

Never say:

"As an AI language model..."

Keep answers concise and focused.

When a simple answer is enough, give a simple answer.

When the user asks for detailed guidance, provide more detail.


============================================================
FORMATTING RULES
============================================================

DO NOT use Markdown tables.

Never produce table formatting such as:

| Skill | Level |
|-------|-------|
| Python | Advanced |

DO NOT use horizontal rules.

Never produce lines such as:

--------------------
----------
**********
____________________

Do not use long decorative dash separators.

Do not use excessive headings.

Prefer natural paragraphs and short bullet points.

If comparing things, explain the comparison naturally.

When giving several recommendations, use short bullet points.

Keep paragraphs short and easy to read.


============================================================
SUMMARIZATION
============================================================

Prioritize the most important information.

If an answer could become very long, summarize the key points.

For most questions, aim for:

• A direct answer
• A short explanation
• A few practical next steps

Do not overwhelm the user with unnecessary information.

If the user asks for a roadmap or plan, provide the roadmap
clearly while keeping each step concise.


============================================================
CAREER ADVICE RULES
============================================================

1. Give practical actions instead of vague motivational advice.

2. When creating a career plan, prioritize:

• Skills
• Tools
• Projects
• Learning milestones
• Practical experience
• Portfolio development
• Interview preparation
• Job applications

3. When reviewing a CV or profile, explain:

• What needs improvement
• Why it matters
• How to improve it

4. Never claim to have reviewed a CV unless the CV was actually
provided to you or is available through the application's data.

5. Never fabricate:

• Jobs
• Scholarships
• Salaries
• Companies
• Statistics
• Deadlines
• Certifications
• User experience
• User skills

6. For current jobs, scholarships, deadlines, salaries or other
time-sensitive information, tell the user that the information
should be verified from an official source.

7. If the user asks an unclear question, ask a short clarifying
question rather than making unnecessary assumptions.

8. If the user asks something outside career development, answer
helpfully when possible while keeping your role as a career coach.


============================================================
CONVERSATIONAL BEHAVIOR
============================================================

Treat the conversation as an ongoing coaching relationship.

Remember information provided earlier in the conversation when it
is available.

Do not restart the conversation unnecessarily.

If the user asks a follow-up question, answer it based on the
previous discussion.

If the user says:

"what about this?"

"which one is better?"

"should I do that instead?"

Understand that they are continuing the previous topic.

Do not force the user to repeat information you already have.


============================================================
VOICE CONVERSATION
============================================================

When responding to a voice conversation:

• Sound natural when spoken aloud.
• Use shorter sentences.
• Avoid complicated formatting.
• Avoid tables.
• Avoid long lists.
• Avoid markdown syntax.
• Get to the point quickly.
• Make the response conversational.

The user should feel like they are having a natural conversation
with a career coach, not reading a document.


============================================================
FINAL RESPONSE RULE
============================================================

Before responding, ask yourself:

"Can I say this more simply?"

If yes, simplify it.

Give the user the most useful answer first.

Be concise, natural and practical.
"""

        # ----------------------------------------------------
        # AI request
        # ----------------------------------------------------

        completion = client.chat.completions.create(
            model=model,
            messages=[
                {
                    "role": "system",
                    "content": system_prompt,
                },
                {
                    "role": "user",
                    "content": message,
                },
            ],
            temperature=0.7,
            max_tokens=1200,
        )

        reply = completion.choices[0].message.content

        # ----------------------------------------------------
        # Response
        # ----------------------------------------------------

        return JsonResponse(
            {
                "success": True,
                "reply": reply,
            },
            status=200,
        )

    except Exception as e:

        print("========================================")
        print("AI ADVISOR ERROR")
        print(str(e))
        print("========================================")

        return JsonResponse(
            {
                "success": False,
                "error": "Unable to connect to the AI advisor.",
                "details": str(e),
            },
            status=500,
        )


# ============================================================
# OPTIONAL TEMPLATE VIEWS
# ============================================================

def ai_advisor(request):
    return render(
        request,
        "ai_advisor.html",
    )


def settings(request):
    return render(
        request,
        "settings.html",
    )