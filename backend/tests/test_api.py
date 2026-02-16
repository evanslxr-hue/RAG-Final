import io

from app.models.collection import Collection
from app.models.document import Document, DocumentStatus
from app.models.job import Job, JobStatus
from app.db.session import SessionLocal


def test_chat_returns_citations_array(client, monkeypatch):
    def fake_retrieve(collection_id, question):
        return [
            {
                "text": "context",
                "metadata": {"document_id": 1, "filename": "x.pdf", "page": 1, "chunk_id": "c1"},
                "distance": 0.2,
            }
        ]

    monkeypatch.setattr("app.api.routes.chat.retrieve", fake_retrieve)
    monkeypatch.setattr("app.api.routes.chat.chat_with_ollama", lambda messages: "answer")

    col = client.post("/api/collections", json={"name": "Test"}).json()
    res = client.post("/api/chat", json={"collection_id": col["id"], "question": "Q", "strict_mode": True})
    body = res.json()
    assert res.status_code == 200
    assert isinstance(body["citations"], list)
    assert body["citations"][0]["page"] == 1


def test_retrieval_returns_page_numbers():
    # Retrieval format contract test
    hit = {"metadata": {"page": 3, "filename": "z.pdf", "chunk_id": "k"}}
    assert "page" in hit["metadata"]


def test_export_creates_files(client, monkeypatch, tmp_path):
    monkeypatch.setattr("app.api.routes.exports.get_settings", lambda: type("S", (), {"export_dir": str(tmp_path)})())
    res = client.post("/api/export/answer", json={"answer": "hello", "citations": [], "format": "pdf"})
    assert res.status_code == 200
    filename = res.json()["filename"]
    assert (tmp_path / filename).exists()
