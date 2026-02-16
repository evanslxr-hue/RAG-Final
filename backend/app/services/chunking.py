def chunk_page_text(text: str, chunk_size: int, overlap: int) -> list[str]:
    chunks: list[str] = []
    if not text.strip():
        return chunks
    start = 0
    while start < len(text):
        end = min(start + chunk_size, len(text))
        chunks.append(text[start:end])
        if end == len(text):
            break
        start = max(0, end - overlap)
    return chunks


def chunk_document_pages(pages: list[dict], filename: str, chunk_size: int, overlap: int, document_id: int) -> list[dict]:
    out = []
    for page in pages:
        page_no = page["page_number"]
        for i, chunk_text in enumerate(chunk_page_text(page["text"], chunk_size, overlap), start=1):
            out.append(
                {
                    "chunk_id": f"d{document_id}_p{page_no}_c{i}",
                    "document_id": document_id,
                    "filename": filename,
                    "page_number": page_no,
                    "text": chunk_text,
                }
            )
    return out
