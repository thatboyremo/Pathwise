from django.core.management.base import BaseCommand
from django.utils import timezone

from scholarship.models import Scholarship
from scholarship.services.erasmus import (
    fetch_erasmus_scholarships,
)


class Command(BaseCommand):

    help = "Fetch Erasmus Mundus scholarships"

    def handle(self, *args, **kwargs):

        self.stdout.write("")
        self.stdout.write(
            self.style.WARNING(
                "Fetching Erasmus Mundus scholarships..."
            )
        )
        self.stdout.write("")

        try:
            scholarships = fetch_erasmus_scholarships()

        except Exception as error:

            self.stdout.write(
                self.style.ERROR(
                    f"Erasmus import failed: {error}"
                )
            )

            return

        created = 0
        updated = 0
        skipped = 0

        for item in scholarships:

            try:
                _, was_created = (
                    Scholarship.objects.update_or_create(
                        source="Erasmus Mundus",
                        external_id=item["external_id"],
                        defaults={
                            "title": item["title"],
                            "university": item["university"],
                            "country": item["country"],
                            "funding": item["funding"],
                            "study_level": item["study_level"],
                            "deadline": item["deadline"],
                            "description": item["description"],
                            "requirements": item["requirements"],
                            "website": item["website"],
                            "featured": item["featured"],
                            "last_verified": timezone.now(),
                        },
                    )
                )

                if was_created:
                    created += 1
                else:
                    updated += 1

            except Exception as error:

                skipped += 1

                self.stdout.write(
                    self.style.ERROR(
                        f"Skipped {item.get('title', 'Unknown')}: "
                        f"{error}"
                    )
                )

        self.stdout.write("")
        self.stdout.write(
            self.style.SUCCESS(
                "Erasmus import completed."
            )
        )

        self.stdout.write(
            f"Created: {created}"
        )

        self.stdout.write(
            f"Updated: {updated}"
        )

        self.stdout.write(
            f"Skipped: {skipped}"
        )

        self.stdout.write(
            f"Total processed: {len(scholarships)}"
        )

        self.stdout.write("")