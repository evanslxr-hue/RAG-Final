import httpx

from app.core.config import get_settings


def chat_with_ollama(messages: list[dict]) -> str:
    settings = get_settings()
    payload = {"model": settings.ollama_model, "messages": messages, "stream": False}
    with httpx.Client(timeout=120) as client:
        res = client.post(f"{settings.ollama_base_url}/api/chat", json=payload)
        res.raise_for_status()
        data = res.json()
        return data.get("message", {}).get("content", "")


def ollama_health() -> bool:
    settings = get_settings()
    try:
        with httpx.Client(timeout=5) as client:
            r = client.get(f"{settings.ollama_base_url}/api/tags")
            return r.status_code == 200
    except Exception:
        return False
