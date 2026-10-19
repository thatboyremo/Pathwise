import requests

from datetime import datetime
from html import unescape

from django.core.management.base import BaseCommand
from django.utils import timezone

from scholarship.models import Scholarship


API_URL = "https://scholarships.grudged.io/api/scholarships"


class Command(BaseCommand):
    help = "Fetch open scholarships from the Open Scholarships API"

    def handle(self, *args, **kwargs):
        self.stdout.write(
            self.style.WARNING(
                "Fetching scholarships from Open Scholarships API..."
            )
        )

        created = 0
        updated = 0
        skipped = 0

        offset = 0
        limit = 50

        while True:
            try:
                response = requests.get(
                    API_URL,
                    params={
                        "availability": "open",
                        "limit": limit,
                        "offset": offset,
                    },
                    timeout=30,
                )

                response.raise_for_status()

            except requests.RequestException as error:
                self.stdout.write(
                    self.style.ERROR(
                        f"API request failed: {error}"
                    )
                )
                return

            try:
                data = response.json()

            except ValueError:
                self.stdout.write(
                    self.style.ERROR(
                        "API returned invalid JSON."
                    )
                )
                self.stdout.write(
                    f"Status code: {response.status_code}"
                )
                self.stdout.write(
                    response.text[:2000]
                )
                return

            results = data.get("results", [])

            if not results:
                break

            for item in results:
                scholarship = self.process_scholarship(item)

                if scholarship is None:
                    skipped += 1
                    continue

                obj, was_created = Scholarship.objects.update_or_create(
                    source="Open Scholarships",
                    external_id=scholarship["external_id"],
                    defaults={
                        "title": scholarship["title"],
                        "university": scholarship["university"],
                        "country": scholarship["country"],
                        "funding": scholarship["funding"],
                        "study_level": scholarship["study_level"],
                        "deadline": scholarship["deadline"],
                        "description": scholarship["description"],
                        "requirements": scholarship["requirements"],
                        "website": scholarship["website"],
                        "logo": "",
                        "featured": scholarship["featured"],
                        "last_verified": timezone.now(),
                    },
                )

                if was_created:
                    created += 1
                else:
                    updated += 1

            offset += limit

            total = data.get("total")

            if total is not None and offset >= total:
                break

            if len(results) < limit:
                break

        self.stdout.write("")
        self.stdout.write(
            self.style.SUCCESS(
                "Scholarship import completed successfully."
            )
        )

        self.stdout.write(f"Created: {created}")
        self.stdout.write(f"Updated: {updated}")
        self.stdout.write(f"Skipped: {skipped}")

        self.stdout.write(
            f"Total scholarships in database: "
            f"{Scholarship.objects.count()}"
        )

    def process_scholarship(self, item):
        title = self.clean_text(
            item.get("name")
        )

        if not title:
            return None

        external_id = str(
            item.get("id")
            or self.create_external_id(item)
        )

        sponsor = self.clean_text(
            item.get("sponsor")
        )

        deadline = self.get_deadline(item)

        if deadline is None:
            return None

        # Don't import scholarships whose deadline has passed.
        if deadline < timezone.now().date():
            return None

        eligibility = item.get("eligibility") or {}

        links = item.get("links") or {}

        description_parts = []

        if item.get("name"):
            description_parts.append(
                f"{item.get('name')} is a scholarship "
                f"provided by {sponsor}."
            )

        award = item.get("award") or {}

        amount_max = award.get("amount_max")
        currency = award.get("currency") or ""

        if amount_max:
            description_parts.append(
                f"Maximum award: {currency} {amount_max:,}."
            )

        description = self.clean_text(
            " ".join(description_parts)
        )

        requirements = self.build_requirements(
            eligibility
        )

        website = (
            links.get("apply_url")
            or links.get("info_url")
            or item.get("url")
            or ""
        )

        if not website:
            website = "https://scholarships.grudged.io/"

        country = self.get_country(
            eligibility
        )

        study_level = self.get_study_level(
            eligibility,
            item
        )

        funding = self.get_funding(
            item,
            amount_max
        )

        return {
            "external_id": external_id,
            "title": title[:250],
            "university": sponsor[:250],
            "country": country[:100],
            "funding": funding,
            "study_level": study_level,
            "deadline": deadline,
            "description": description,
            "requirements": requirements,
            "website": website,
            "featured": False,
        }

    def get_deadline(self, item):
        """
        API returns:

        "deadline": {
            "type": "annual",
            "date": "2026-11-30",
            "notes": "..."
        }
        """

        deadline = item.get("deadline")

        if not deadline:
            return None

        # New API structure
        if isinstance(deadline, dict):
            value = deadline.get("date")

        else:
            value = deadline

        if not value:
            return None

        try:
            value = str(value).strip()

            # YYYY-MM-DD
            return datetime.strptime(
                value,
                "%Y-%m-%d"
            ).date()

        except (ValueError, TypeError):
            return None

    def get_country(self, eligibility):
        residency = eligibility.get("residency", [])

        if residency:
            return ", ".join(
                str(country)
                for country in residency
            )

        return "USA"

    def get_study_level(self, eligibility, item):
        education_levels = eligibility.get(
            "education_level",
            []
        )

        levels = " ".join(
            str(level).lower()
            for level in education_levels
        )

        text = " ".join([
            str(item.get("name", "")),
            str(item.get("type", "")),
        ]).lower()

        if (
            "phd" in levels
            or "doctoral" in levels
            or "doctorate" in levels
            or "phd" in text
        ):
            return "phd"

        if (
            "master" in levels
            or "graduate" in levels
            or "postgraduate" in levels
        ):
            return "masters"

        if (
            "bachelor" in levels
            or "undergraduate" in levels
            or "college" in levels
        ):
            return "bachelor"

        return "masters"

    def get_funding(self, item, amount):
        name = str(
            item.get("name", "")
        ).lower()

        notes = str(
            (item.get("award") or {}).get("notes", "")
        ).lower()

        text = f"{name} {notes}"

        full_keywords = [
            "fully funded",
            "full funding",
            "full tuition",
            "100% tuition",
            "full scholarship",
        ]

        for keyword in full_keywords:
            if keyword in text:
                return "full"

        return "partial"

    def build_requirements(self, eligibility):
        requirements = []

        residency = eligibility.get(
            "residency",
            []
        )

        education_level = eligibility.get(
            "education_level",
            []
        )

        fields = eligibility.get(
            "fields_of_study",
            []
        )

        gpa = eligibility.get(
            "gpa_min"
        )

        other = eligibility.get(
            "other",
            []
        )

        if residency:
            requirements.append(
                "Residency: "
                + ", ".join(
                    str(value)
                    for value in residency
                )
            )

        if education_level:
            requirements.append(
                "Education level: "
                + ", ".join(
                    str(value)
                    for value in education_level
                )
            )

        if fields:
            requirements.append(
                "Fields of study: "
                + ", ".join(
                    str(value)
                    for value in fields
                )
            )

        if gpa:
            requirements.append(
                f"Minimum GPA: {gpa}"
            )

        if other:
            requirements.extend(
                str(value)
                for value in other
            )

        return self.clean_text(
            " | ".join(requirements)
        )

    def create_external_id(self, item):
        name = str(
            item.get("name", "")
        )

        sponsor = str(
            item.get("sponsor", "")
        )

        return (
            f"{name}-{sponsor}"
        )[:255]

    def clean_text(self, value):
        if not value:
            return ""

        value = unescape(
            str(value)
        )

        return " ".join(
            value.split()
        ).strip()