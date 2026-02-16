from app.core.config import get_settings
from app.services.embeddings import EmbeddingProvider
from app.services.vectorstore import VectorStore


def retrieve(collection_id: int, question: str) -> list[dict]:
    settings = get_settings()
    embedder = EmbeddingProvider()
    store = VectorStore()
    query_vec = embedder.embed([question])[0]
    return store.query(collection_id=collection_id, query_embedding=query_vec, top_k=settings.top_k)
