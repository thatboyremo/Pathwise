from django.core.management.base import BaseCommand

from jobs.services.remotive import import_remotive_jobs
from jobs.services.jobicy import import_jobicy_jobs


class Command(BaseCommand):
    help = "Import jobs from approved job sources"

    def handle(self, *args, **options):

        total = 0

        self.stdout.write(
            self.style.WARNING(
                "Starting job import..."
            )
        )

        # Remotive
        try:
            self.stdout.write(
                "Fetching all available Remotive jobs..."
            )

            remotive_count = import_remotive_jobs(
                limit=100
            )

            total += remotive_count

            self.stdout.write(
                self.style.SUCCESS(
                    f"Remotive processed: {remotive_count}"
                )
            )

        except Exception as error:
            self.stdout.write(
                self.style.ERROR(
                    f"Remotive failed: {error}"
                )
            )

        # Jobicy
        try:
            self.stdout.write(
                "Fetching all available Jobicy jobs..."
            )

            jobicy_count = import_jobicy_jobs(
                limit=200
            )

            total += jobicy_count

            self.stdout.write(
                self.style.SUCCESS(
                    f"Jobicy processed: {jobicy_count}"
                )
            )

        except Exception as error:
            self.stdout.write(
                self.style.ERROR(
                    f"Jobicy failed: {error}"
                )
            )

        self.stdout.write(
            self.style.SUCCESS(
                f"Job import finished. "
                f"{total} jobs processed."
            )
        )