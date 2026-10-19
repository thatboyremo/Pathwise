from django.core.exceptions import ValidationError
from django.core.validators import validate_email as django_validate_email


PDF_MAGIC = b"%PDF"
ZIP_MAGIC = b"PK"
MAX_CV_PAGES = 40
MAX_CV_TEXT_CHARS = 200_000


def is_valid_email(value: str) -> bool:
    try:
        django_validate_email(value)
    except ValidationError:
        return False
    return True


def file_signature(uploaded_file, size: int = 8) -> bytes:
    current = uploaded_file.tell() if hasattr(uploaded_file, "tell") else 0
    uploaded_file.seek(0)
    header = uploaded_file.read(size)
    uploaded_file.seek(current)
    return header


def validate_cv_upload(uploaded_file) -> None:
    """
    Confirm a CV is a PDF or DOCX by extension and file signature.
    """

    filename = (uploaded_file.name or "").lower()

    if filename.endswith(".pdf"):
        header = file_signature(uploaded_file)
        if not header.startswith(PDF_MAGIC):
            raise ValueError("The uploaded file is not a valid PDF.")
        return

    if filename.endswith(".docx"):
        header = file_signature(uploaded_file)
        if not header.startswith(ZIP_MAGIC):
            raise ValueError("The uploaded file is not a valid DOCX document.")
        return

    raise ValueError("Please upload a PDF or DOCX file.")
