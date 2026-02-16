from functools import lru_cache
from typing import List

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_env: str = "dev"
    database_url: str = "sqlite:///./data/app.db"
    redis_url: str = "redis://redis:6379/0"
    storage_dir: str = "./data/uploads"
    export_dir: str = "./data/exports"
    chroma_persist_dir: str = "./data/chroma"
    embedding_model_name: str = "BAAI/bge-small-en-v1.5"
    ollama_base_url: str = "http://host.docker.internal:11434"
    ollama_model: str = "llama3.1"
    top_k: int = 8
    chunk_size: int = 800
    chunk_overlap: int = 120
    enable_ocr: bool = False
    ocr_lang: str = "eng"
    cors_origins: List[str] = ["http://localhost:5173"]

    model_config = SettingsConfigDict(env_file="backend/.env", env_file_encoding="utf-8", case_sensitive=False)

    @field_validator("cors_origins", mode="before")
    @classmethod
    def _parse_cors(cls, value):
        if isinstance(value, str):
            return [v.strip() for v in value.split(",") if v.strip()]
        return value


@lru_cache
def get_settings() -> Settings:
    return Settings()
