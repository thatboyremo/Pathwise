import re
from html import unescape

import requests
from django.utils.dateparse import parse_datetime

from jobs.models import Job


REMOTIVE_API_URL = "https://remotive.com/api/remote-jobs"


# =========================================================
# CLEAN HTML FROM JOB DESCRIPTIONS
# =========================================================

def clean_html(text):
    if not text:
        return ""

    text = unescape(text)

    text = re.sub(
        r"<br\s*/?>",
        "\n",
        text,
        flags=re.IGNORECASE,
    )

    text = re.sub(
        r"</p\s*>",
        "\n\n",
        text,
        flags=re.IGNORECASE,
    )

    text = re.sub(
        r"<li[^>]*>",
        "• ",
        text,
        flags=re.IGNORECASE,
    )

    text = re.sub(
        r"</li\s*>",
        "\n",
        text,
        flags=re.IGNORECASE,
    )

    text = re.sub(
        r"</ul\s*>",
        "\n",
        text,
        flags=re.IGNORECASE,
    )

    text = re.sub(
        r"</ol\s*>",
        "\n",
        text,
        flags=re.IGNORECASE,
    )

    # Remove remaining HTML
    text = re.sub(
        r"<[^>]+>",
        "",
        text,
    )

    # Clean excessive spaces and tabs
    text = re.sub(
        r"[ \t]+",
        " ",
        text,
    )

    # Clean excessive blank lines
    text = re.sub(
        r"\n\s*\n\s*\n+",
        "\n\n",
        text,
    )

    return text.strip()


# =========================================================
# JOB TYPE
# =========================================================

def normalize_job_type(job_type):
    job_type = (job_type or "").strip().lower()

    mapping = {
        "full_time": "full-time",
        "part_time": "part-time",
        "contract": "contract",
        "internship": "internship",
        "freelance": "contract",
    }

    return mapping.get(job_type, "remote")


# =========================================================
# IMPORT ALL REMOTIVE JOBS
# =========================================================

def import_remotive_jobs(limit=100):
    """
    Import ALL available remote jobs from Remotive.

    No keyword restrictions.
    No career-category restrictions.
    No AI/tech restrictions.
    Adzuna is not used.
    """

    created_count = 0
    updated_count = 0

    try:
        response = requests.get(
            REMOTIVE_API_URL,
            params={
                "limit": limit,
            },
            timeout=30,
        )

        response.raise_for_status()
        data = response.json()

    except requests.RequestException as error:
        print(
            f"Remotive request failed: {error}"
        )
        return 0

    except ValueError as error:
        print(
            f"Remotive returned invalid JSON: {error}"
        )
        return 0

    jobs = data.get("jobs", [])

    print(
        f"Remotive returned {len(jobs)} jobs."
    )

    # Prevent duplicate processing
    seen_ids = set()

    for item in jobs:

        external_id = str(
            item.get("id", "")
        ).strip()

        if not external_id:
            continue

        if external_id in seen_ids:
            continue

        seen_ids.add(external_id)

        title = (
            item.get("title", "")
            .strip()
        )

        company = (
            item.get("company_name", "")
            .strip()
        )

        location = (
            item.get(
                "candidate_required_location",
                "",
            )
            .strip()
        )

        description = clean_html(
            item.get("description", "")
        )

        apply_url = (
            item.get("url", "")
            .strip()
        )

        logo = (
            item.get("company_logo", "")
            .strip()
        )

        category = (
            item.get("category", "")
            .strip()
        )

        salary = (
            item.get("salary", "")
            .strip()
        )

        job_type = normalize_job_type(
            item.get("job_type", "")
        )

        # =====================================================
        # ACTUAL PUBLICATION DATE FROM REMOTIVE
        # =====================================================

        publication_date = item.get(
            "publication_date"
        )

        posted_at = None

        if publication_date:
            posted_at = parse_datetime(
                publication_date
            )

        # Skip incomplete jobs
        if not title or not apply_url:
            continue

        # Keep the actual category supplied
        # by Remotive. It is NOT used as a filter.
        requirements = category

        _, created = Job.objects.update_or_create(
            source="Remotive",
            external_id=external_id,
            defaults={
                "title": title,
                "company": company or "Unknown",
                "location": location or "Remote",
                "description": description,
                "requirements": requirements,
                "apply_url": apply_url,
                "logo": logo,
                "salary": salary,
                "job_type": job_type,
                "experience": "entry",
                "featured": False,
                "posted_at": posted_at,
            },
        )

        if created:
            created_count += 1
        else:
            updated_count += 1

    print(
        f"Remotive import complete: "
        f"{created_count} new, "
        f"{updated_count} updated."
    )

    return created_count