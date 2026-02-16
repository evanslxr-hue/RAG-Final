from sentence_transformers import SentenceTransformer

from app.core.config import get_settings


class EmbeddingProvider:
    def __init__(self):
        self.settings = get_settings()
        self.model = SentenceTransformer(self.settings.embedding_model_name)

    def embed(self, texts: list[str]) -> list[list[float]]:
        vectors = self.model.encode(texts, normalize_embeddings=True)
        return [v.tolist() for v in vectors]
