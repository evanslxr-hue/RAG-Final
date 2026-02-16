import chromadb
from chromadb.config import Settings as ChromaSettings

from app.core.config import get_settings


class VectorStore:
    def __init__(self):
        settings = get_settings()
        self.client = chromadb.PersistentClient(path=settings.chroma_persist_dir, settings=ChromaSettings(anonymized_telemetry=False))

    def _col_name(self, collection_id: int) -> str:
        return f"collection_{collection_id}"

    def upsert_chunks(self, collection_id: int, chunks: list[dict], embeddings: list[list[float]]) -> None:
        col = self.client.get_or_create_collection(self._col_name(collection_id))
        col.upsert(
            ids=[c["chunk_id"] for c in chunks],
            documents=[c["text"] for c in chunks],
            embeddings=embeddings,
            metadatas=[
                {
                    "document_id": c["document_id"],
                    "filename": c["filename"],
                    "page": c["page_number"],
                    "chunk_id": c["chunk_id"],
                }
                for c in chunks
            ],
        )

    def query(self, collection_id: int, query_embedding: list[float], top_k: int) -> list[dict]:
        col = self.client.get_or_create_collection(self._col_name(collection_id))
        result = col.query(query_embeddings=[query_embedding], n_results=top_k)
        out = []
        docs = result.get("documents", [[]])[0]
        metas = result.get("metadatas", [[]])[0]
        dists = result.get("distances", [[]])[0]
        for i in range(len(docs)):
            out.append({"text": docs[i], "metadata": metas[i], "distance": float(dists[i]) if dists else 1.0})
        return out
