from django import forms
from .models import InterviewSession


class InterviewSetupForm(forms.ModelForm):
    class Meta:
        model = InterviewSession

        fields = [
            "job_role",
            "company",
            "experience_level",
            "interview_type",
            "difficulty",
            "question_count",
            "resume",
            "job_description",
        ]

        widgets = {
            "job_role": forms.TextInput(
                attrs={
                    "class": "form-control",
                    "placeholder": "Backend Django Developer",
                }
            ),

            "company": forms.TextInput(
                attrs={
                    "class": "form-control",
                    "placeholder": "Google",
                }
            ),

            "experience_level": forms.Select(
                attrs={
                    "class": "form-select",
                }
            ),

            "interview_type": forms.Select(
                attrs={
                    "class": "form-select",
                }
            ),

            "difficulty": forms.Select(
                attrs={
                    "class": "form-select",
                }
            ),

            "question_count": forms.NumberInput(
                attrs={
                    "class": "form-control",
                    "min": 5,
                    "max": 20,
                    "value": 10,
                }
            ),

            "resume": forms.FileInput(
                attrs={
                    "class": "form-control",
                }
            ),

            "job_description": forms.Textarea(
                attrs={
                    "class": "form-control",
                    "rows": 8,
                    "placeholder": (
                        "Paste the job description here "
                        "(optional but recommended)."
                    ),
                }
            ),
        }

        labels = {
            "job_role": "Job Role",
            "company": "Company",
            "experience_level": "Experience Level",
            "interview_type": "Interview Type",
            "difficulty": "Difficulty",
            "question_count": "Number of Questions",
            "resume": "Resume (Optional)",
            "job_description": "Job Description",
        }

        help_texts = {
            "resume": "Upload your resume (PDF or DOCX).",
            "job_description": (
                "Providing a job description allows the AI to generate "
                "much more realistic interview questions."
            ),
        }