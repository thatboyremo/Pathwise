from django.core.management.base import BaseCommand
from django.utils import timezone

from jobs.models import Job


class Command(BaseCommand):
    help = "Mark expired jobs as unavailable"

    def handle(self, *args, **options):
        now = timezone.now()

        expired = Job.objects.filter(
            expires_at__isnull=False,
            expires_at__lt=now,
        )

        count = expired.count()

        expired.update(
            featured=False,
        )

        self.stdout.write(
            self.style.SUCCESS(
                f"Processed {count} expired jobs."
            )
        )
