from pypdf import PdfReader


def extract_pages(pdf_path: str) -> list[dict]:
    reader = PdfReader(pdf_path)
    pages = []
    for idx, page in enumerate(reader.pages, start=1):
        text = page.extract_text() or ""
        pages.append({"page_number": idx, "text": text})
    return pages
