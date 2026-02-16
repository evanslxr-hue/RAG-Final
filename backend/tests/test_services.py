from app.services.chunking import chunk_document_pages
from app.services.pdf_extract import extract_pages


def test_extraction_keeps_page_numbers(sample_pdf_path):
    pages = extract_pages(sample_pdf_path)
    assert len(pages) == 2
    assert pages[0]["page_number"] == 1
    assert pages[1]["page_number"] == 2


def test_chunk_metadata_includes_filename_and_page():
    pages = [{"page_number": 1, "text": "a" * 900}]
    chunks = chunk_document_pages(pages, filename="doc.pdf", chunk_size=800, overlap=120, document_id=7)
    assert chunks[0]["filename"] == "doc.pdf"
    assert chunks[0]["page_number"] == 1
    assert chunks[0]["chunk_id"].startswith("d7_p1_c")
