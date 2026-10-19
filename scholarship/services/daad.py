import requests

from bs4 import BeautifulSoup


DAAD_URL = (
    "https://www.daad.org/en/find-funding/"
    "scholarship-database/"
)


def clean_text(value):
    if not value:
        return ""

    return " ".join(
        value.split()
    ).strip()


def fetch_daad_scholarships():

    response = requests.get(
        DAAD_URL,
        timeout=30,
        headers={
            "User-Agent": "Pathwise Scholarship Aggregator"
        },
    )

    response.raise_for_status()

    soup = BeautifulSoup(
        response.text,
        "html.parser",
    )

    results = []

    seen = set()

    for heading in soup.find_all(
        ["h2", "h3"]
    ):

        title = clean_text(
            heading.get_text(" ", strip=True)
        )

        if not title:
            continue

        scholarship_keywords = [
            "scholarship",
            "study",
            "master",
            "doctoral",
            "research",
            "graduate",
        ]

        if not any(
            word in title.lower()
            for word in scholarship_keywords
        ):
            continue

        link = heading.find_next(
            "a",
            href=True,
        )

        if not link:
            continue

        href = link.get("href", "")

        if href.startswith("/"):
            href = (
                "https://www.daad.org"
                + href
            )

        if href in seen:
            continue

        seen.add(href)

        level = "masters"

        title_lower = title.lower()

        if (
            "doctoral" in title_lower
            or "phd" in title_lower
        ):
            level = "phd"

        elif "bachelor" in title_lower:
            level = "bachelor"

        results.append(
            {
                "external_id": (
                    f"daad-{len(results)}"
                )[:255],

                "title": title[:250],

                "university": "DAAD",

                "country": "Germany",

                "funding": "full",

                "study_level": level,

                "deadline": None,

                "description": (
                    f"{title} is a funding "
                    "opportunity listed in the "
                    "DAAD scholarship database."
                ),

                "requirements": (
                    "Eligibility and application "
                    "requirements depend on the "
                    "individual DAAD programme."
                ),

                "website": href,

                "featured": False,

                "source": "DAAD",
            }
        )

    return results