import json

from app.services.llm_ollama import chat_with_ollama


def generate_study_items(summary: dict, chunks: list[dict]) -> tuple[list[dict], list[dict]]:
    seed = chunks[:8]
    seed_text = "\n".join([f"{c['filename']} p{c['page_number']} {c['chunk_id']}: {c['text'][:220]}" for c in seed])
    prompt = (
        "Create JSON object with keys flashcards and quizzes. "
        "flashcards[]: {id,question,answer,difficulty,citation:{filename,page,chunk_id}}. "
        "quizzes[]: {id,question,choices,correct_index,explanation,citation:{filename,page,chunk_id}}. "
        f"Summary TLDR: {summary.get('tldr','')}\nContext:\n{seed_text}"
    )
    txt = chat_with_ollama([{"role": "user", "content": prompt}])
    try:
        obj = json.loads(txt)
        return obj.get("flashcards", []), obj.get("quizzes", [])
    except Exception:
        return [], []
