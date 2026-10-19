import requests

from bs4 import BeautifulSoup


EDUCANADA_URL = (
    "https://www.educanada.ca/"
    "scholarships-bourses/non_can/index.aspx?lang=eng"
)


def clean_text(value):
    if not value:
        return ""

    return " ".join(
        value.split()
    ).strip()


def fetch_educanada_scholarships():

    response = requests.get(
        EDUCANADA_URL,
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

    keywords = [
        "Emerging Leaders",
        "Study in Canada",
        "SEED",
        "Canada-China",
        "OAS",
    ]

    for heading in soup.find_all(
        ["h2", "h3", "h4"]
    ):

        title = clean_text(
            heading.get_text(" ", strip=True)
        )

        if not title:
            continue

        matched = any(
            keyword.lower() in title.lower()
            for keyword in keywords
        )

        if not matched:
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
                "https://www.educanada.ca"
                + href
            )

        if href in seen:
            continue

        seen.add(href)

        results.append(
            {
                "external_id": (
                    f"educanada-{len(results)}"
                )[:255],

                "title": title[:250],

                "university": (
                    "Government of Canada"
                ),

                "country": "Canada",

                "funding": "full",

                "study_level": "masters",

                "deadline": None,

                "description": (
                    f"{title} is an official "
                    "Canadian international scholarship "
                    "or academic exchange opportunity."
                ),

                "requirements": (
                    "Eligibility, participating countries, "
                    "application method and deadlines vary "
                    "by programme. Check the official "
                    "EduCanada programme page."
                ),

                "website": href,

                "featured": True,

                "source": "EduCanada",
            }
        )

    return results