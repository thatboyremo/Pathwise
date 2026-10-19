from django.core.management.base import BaseCommand

from jobs.services.remotive import import_remotive_jobs


class Command(BaseCommand):
    help = "Import remote jobs from Remotive into the Pathwise database"

    def handle(self, *args, **options):

        self.stdout.write(
            self.style.WARNING(
                "Fetching jobs from Remotive..."
            )
        )

        try:
            imported = import_remotive_jobs(
                limit=100,
            )

            self.stdout.write(
                self.style.SUCCESS(
                    f"Successfully imported {imported} new jobs."
                )
            )

        except Exception as error:

            self.stdout.write(
                self.style.ERROR(
                    f"Remotive import failed: {error}"
                )
            )
