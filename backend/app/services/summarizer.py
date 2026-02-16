import json

from app.services.llm_ollama import chat_with_ollama


def generate_summary(document_id: int, chunks: list[dict]) -> dict:
    if not chunks:
        return {
            "document_id": document_id,
            "tldr": "No extractable text found.",
            "key_points": [],
            "glossary": [],
            "sections": [],
        }
    sample = "\n\n".join([f"(p{c['page_number']}) {c['text'][:400]}" for c in chunks[:12]])
    prompt = (
        "Return strict JSON with keys document_id,tldr,key_points,glossary,sections. "
        "glossary entries: {term,definition,page}. sections entries: {title,page_range,summary}."
        f"\nDocument ID: {document_id}\nText:\n{sample}"
    )
    out = chat_with_ollama([{"role": "user", "content": prompt}])
    try:
        parsed = json.loads(out)
        parsed["document_id"] = document_id
        return parsed
    except Exception:
        return {
            "document_id": document_id,
            "tldr": out[:300],
            "key_points": ["Summary parsing fallback used."],
            "glossary": [],
            "sections": [],
        }
