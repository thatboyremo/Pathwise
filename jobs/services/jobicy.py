import re
from html import unescape

import requests

from jobs.models import Job
from django.utils.dateparse import parse_datetime


JOBICY_API_URL = "https://jobicy.com/api/v2/remote-jobs"


# =========================================================
# CLEAN HTML
# =========================================================

def clean_html(text):
    if not text:
        return ""

    text = unescape(str(text))

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
        r"<[^>]+>",
        "",
        text,
    )

    text = re.sub(
        r"[ \t]+",
        " ",
        text,
    )

    text = re.sub(
        r"\n\s*\n\s*\n+",
        "\n\n",
        text,
    )

    return text.strip()


# =========================================================
# CONVERT VALUE TO TEXT
# =========================================================

def to_text(value):
    if value is None:
        return ""

    if isinstance(value, list):
        return ", ".join(
            str(item).strip()
            for item in value
            if item
        )

    return str(value).strip()


# =========================================================
# IMPORT ALL JOBICY JOBS
# =========================================================

def import_jobicy_jobs(limit=200):
    """
    Import all jobs returned by Jobicy.

    No keyword restrictions.
    No career restrictions.
    No industry restrictions.

    Jobicy is used as an additional job source.
    """

    created_count = 0
    updated_count = 0

    try:
        response = requests.get(
            JOBICY_API_URL,
            params={
                "count": min(limit, 200),
            },
            timeout=30,
        )

        response.raise_for_status()

        # Make sure the response is actually JSON
        content_type = (
            response.headers
            .get("content-type", "")
            .lower()
        )

        if "json" not in content_type:
            print(
                "Jobicy returned a non-JSON response."
            )
            print(
                response.text[:500]
            )
            return 0

        data = response.json()

    except requests.RequestException as error:
        print(
            f"Jobicy request failed: {error}"
        )
        return 0

    except ValueError as error:
        print(
            f"Jobicy returned invalid JSON: {error}"
        )
        print(
            response.text[:500]
        )
        return 0

    jobs = data.get("jobs", [])

    print(
        f"Jobicy returned {len(jobs)} jobs."
    )

    for item in jobs:

        external_id = str(
            item.get("id", "")
        ).strip()

        if not external_id:
            continue

        title = to_text(
            item.get("jobTitle")
        )

        company = to_text(
            item.get("companyName")
        )

        location = to_text(
            item.get("jobGeo")
        )

        description = clean_html(
            item.get("jobDescription")
            or item.get("jobExcerpt")
            or ""
        )

        apply_url = to_text(
            item.get("url")
        )

        logo = to_text(
            item.get("companyLogo")
        )

        job_type = to_text(
            item.get("jobType")
        )

        job_level = to_text(
            item.get("jobLevel")
        )

        industry = to_text(
            item.get("jobIndustry")
        )

        # -------------------------------------------------
        # SALARY
        # -------------------------------------------------

        salary_min = item.get(
            "salaryMin"
        )

        salary_max = item.get(
            "salaryMax"
        )

        salary_currency = to_text(
            item.get("salaryCurrency")
        )

        salary = ""

        if salary_min or salary_max:
            salary = (
                f"{salary_currency} "
                f"{salary_min or ''} - "
                f"{salary_max or ''}"
            ).strip()

        # -------------------------------------------------
        # VALIDATE BASIC FIELDS
        # -------------------------------------------------

        if not title:
            continue

        if not apply_url:
            continue

        # -------------------------------------------------
        # SAVE / UPDATE
        # -------------------------------------------------

        _, created = Job.objects.update_or_create(
            source="Jobicy",
            external_id=external_id,
            defaults={
                "title": title,
                "company": company or "Unknown",
                "location": location or "Remote",
                "description": description,
                "requirements": industry,
                "apply_url": apply_url,
                "logo": logo,
                "salary": salary,
                "job_type": job_type or "remote",
                "experience": job_level,
                "featured": False,
                "posted_at": parse_datetime(
                    item.get("pubDate", "")
                ) if item.get("pubDate") else None,
            },
        )

        if created:
            created_count += 1
        else:
            updated_count += 1

    print(
        "Jobicy import complete: "
        f"{created_count} new, "
        f"{updated_count} updated."
    )

    return created_count


