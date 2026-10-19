from django.core.management.base import BaseCommand
from django.utils import timezone

from scholarship.models import Scholarship
from scholarship.services.daad import (
    fetch_daad_scholarships,
)


class Command(BaseCommand):

    help = "Fetch DAAD scholarships"

    def handle(self, *args, **kwargs):

        self.stdout.write(
            self.style.WARNING(
                "Fetching DAAD scholarships..."
            )
        )

        try:
            scholarships = (
                fetch_daad_scholarships()
            )

        except Exception as error:
            self.stdout.write(
                self.style.ERROR(
                    f"DAAD import failed: {error}"
                )
            )
            return

        created = 0
        updated = 0

        for item in scholarships:

            _, was_created = (
                Scholarship.objects.update_or_create(
                    source="DAAD",
                    external_id=item["external_id"],
                    defaults={
                        **item,
                        "last_verified": timezone.now(),
                    },
                )
            )

            if was_created:
                created += 1
            else:
                updated += 1

        self.stdout.write(
            self.style.SUCCESS(
                "DAAD import completed."
            )
        )

        self.stdout.write(
            f"Created: {created}"
        )

        self.stdout.write(
            f"Updated: {updated}"
        )