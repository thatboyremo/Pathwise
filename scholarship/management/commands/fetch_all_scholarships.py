from django.core.management.base import BaseCommand
from django.core.management import call_command


class Command(BaseCommand):

    help = "Fetch scholarships from all configured sources"

    def handle(self, *args, **kwargs):

        self.stdout.write("")
        self.stdout.write(
            self.style.SUCCESS(
                "========================================"
            )
        )
        self.stdout.write(
            self.style.SUCCESS(
                "Starting Pathwise Scholarship Refresh"
            )
        )
        self.stdout.write(
            self.style.SUCCESS(
                "========================================"
            )
        )
        self.stdout.write("")

        sources = [
            (
                "Open Scholarships",
                "fetch_scholarships",
            ),

            (
                "EduCanada",
                "fetch_educanada",
            ),
            (
                "DAAD",
                "fetch_daad",
            ),
            (
                "Erasmus Mundus",
                "fetch_erasmus",
            ),
        ]

        for source_name, command_name in sources:

            self.stdout.write("")
            self.stdout.write(
                self.style.WARNING(
                    f"Source: {source_name}"
                )
            )

            try:

                call_command(
                    command_name
                )

                self.stdout.write(
                    self.style.SUCCESS(
                        f"✓ {source_name} completed"
                    )
                )

            except Exception as error:

                self.stdout.write(
                    self.style.ERROR(
                        f"✗ {source_name} failed: "
                        f"{error}"
                    )
                )

        self.stdout.write("")
        self.stdout.write(
            self.style.SUCCESS(
                "========================================"
            )
        )
        self.stdout.write(
            self.style.SUCCESS(
                "Scholarship refresh completed"
            )
        )
        self.stdout.write(
            self.style.SUCCESS(
                "========================================"
            )
        )