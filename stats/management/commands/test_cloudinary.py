from django.core.management.base import BaseCommand
from django.core.files.base import ContentFile
from django.core.files.storage import default_storage


class Command(BaseCommand):
    """Upload a small test file to the default storage.

    Useful to verify Cloudinary connectivity when `DEFAULT_FILE_STORAGE` is
    configured to use Cloudinary on Heroku.
    """

    def handle(self, *args, **options):
        content = ContentFile(
            b"Test Cloudinary upload from management command"
        )

        name = "dashtia_test/test_upload.txt"

        try:
            path = default_storage.save(name, content)
            self.stdout.write(
                self.style.SUCCESS(f"Successfully saved file to: {path}")
            )

            # For storages like Cloudinary, path may be a URL or public id.
            if hasattr(default_storage, "url"):
                try:
                    url = default_storage.url(path)
                    self.stdout.write(
                        self.style.SUCCESS(f"Accessible at URL: {url}")
                    )
                except Exception as exc:  # pragma: no cover - runtime error
                    self.stdout.write(
                        self.style.WARNING(
                            f"Could not get URL from storage: {exc}"
                        )
                    )

        except Exception as exc:  # pragma: no cover - runtime error
            self.stderr.write(self.style.ERROR(f"Upload failed: {exc}"))
