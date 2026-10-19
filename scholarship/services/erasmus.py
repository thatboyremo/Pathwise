import re

import requests
from bs4 import BeautifulSoup


ERASMUS_URL = (
    "https://www.eacea.ec.europa.eu/"
    "scholarships/erasmus-mundus-catalogue_en"
)

BASE_URL = "https://www.eacea.ec.europa.eu"


def clean_text(value):
    if not value:
        return ""

    value = re.sub(r"\s+", " ", value)
    return value.strip()


def get_project_id(url):
    match = re.search(
        r"/projects/search/details/(\d+)",
        url,
    )

    if match:
        return match.group(1)

    return None


def fetch_erasmus_scholarships():
    response = requests.get(
        ERASMUS_URL,
        timeout=30,
        headers={
            "User-Agent": (
                "Mozilla/5.0 "
                "(Windows NT 10.0; Win64; x64) "
                "AppleWebKit/537.36 "
                "Chrome/131.0 Safari/537.36"
            )
        },
    )

    response.raise_for_status()

    soup = BeautifulSoup(
        response.text,
        "html.parser",
    )

    results = []
    seen_projects = set()

    links = soup.find_all("a", href=True)

    for index, link in enumerate(links):

        href = link.get("href", "").strip()

        # We only want Erasmus project overview links.
        if "/projects/search/details/" not in href:
            continue

        project_id = get_project_id(href)

        if not project_id:
            continue

        if project_id in seen_projects:
            continue

        seen_projects.add(project_id)

        # The programme's official website/title
        # appears immediately before its project overview.
        programme_link = None

        current_index = index - 1

        while current_index >= 0:

            previous = links[current_index]

            previous_href = (
                previous.get("href", "").strip()
            )

            previous_title = clean_text(
                previous.get_text(
                    " ",
                    strip=True,
                )
            )

            if (
                previous_href
                and previous_title
                and "/projects/search/details/"
                not in previous_href
                and previous_title.lower()
                not in {
                    "project overview",
                    "project overview -",
                    "next",
                    "previous",
                }
            ):
                programme_link = previous
                break

            current_index -= 1

        if not programme_link:
            continue

        title = clean_text(
            programme_link.get_text(
                " ",
                strip=True,
            )
        )

        website = (
            programme_link.get(
                "href",
                "",
            )
            .strip()
        )

        if not title or not website:
            continue

        # Ignore generic catalogue/navigation links.
        ignored_titles = {
            "erasmus mundus catalogue",
            "erasmus mundus joint masters",
            "read more",
            "next",
            "previous",
        }

        if title.lower() in ignored_titles:
            continue

        if website.startswith("/"):
            website = BASE_URL + website

        results.append(
            {
                "external_id": project_id,

                "title": title[:250],

                "university": (
                    "Erasmus Mundus Consortium"
                ),

                "country": "Europe",

                "funding": "full",

                "study_level": "masters",

                # Do not invent deadlines.
                "deadline": None,

                "description": (
                    f"{title} is an Erasmus Mundus "
                    "Joint Master programme supported "
                    "through the European Union's "
                    "Erasmus+ programme."
                ),

                "requirements": (
                    "Admission requirements vary by "
                    "programme. Applicants should check "
                    "the official programme website for "
                    "academic requirements, eligible "
                    "countries, application procedures "
                    "and scholarship availability."
                ),

                "website": website,

                "featured": False,

                "source": "Erasmus Mundus",
            }
        )

    return results