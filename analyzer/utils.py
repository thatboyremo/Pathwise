import fitz
from docx import Document


# =========================================================
# PDF EXTRACTION
# =========================================================

def extract_text_from_pdf(uploaded_file):
    """
    Extract text from a PDF uploaded through Django.
    """

    try:
        uploaded_file.seek(0)

        document = fitz.open(
            stream=uploaded_file.read(),
            filetype="pdf"
        )

        text = ""

        for page in document:
            text += page.get_text()

        document.close()

        return text

    except Exception as error:
        print("PDF EXTRACTION ERROR:", error)
        return ""


# =========================================================
# DOCX EXTRACTION
# =========================================================

def extract_text_from_docx(uploaded_file):
    """
    Extract text from a DOCX uploaded through Django.
    """

    try:
        uploaded_file.seek(0)

        document = Document(uploaded_file)

        text = "\n".join(
            paragraph.text
            for paragraph in document.paragraphs
        )

        return text

    except Exception as error:
        print("DOCX EXTRACTION ERROR:", error)
        return ""


# =========================================================
# MAIN CV EXTRACTION FUNCTION
# =========================================================

def extract_cv_text(uploaded_file):
    """
    Extract text from supported CV formats.
    Supports PDF and DOCX.
    """

    if not uploaded_file:
        raise ValueError(
            "No CV file was provided."
        )

    filename = uploaded_file.name.lower()

    if filename.endswith(".pdf"):

        text = extract_text_from_pdf(
            uploaded_file
        )

    elif filename.endswith(".docx"):

        text = extract_text_from_docx(
            uploaded_file
        )

    else:

        raise ValueError(
            "Unsupported CV format. "
            "Please upload a PDF or DOCX file."
        )

    if not text.strip():

        raise ValueError(
            "We could not extract text from this CV. "
            "Please make sure the document contains selectable text."
        )

    return text.strip()