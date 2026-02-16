import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.router import api_router
from app.core.config import get_settings
from app.core.logging import setup_logging
from app.db.base import Base
from app.db.session import engine
from app.services.llm_ollama import ollama_health

settings = get_settings()
setup_logging()

for path in ["./data", settings.storage_dir, settings.export_dir, settings.chroma_persist_dir]:
    os.makedirs(path, exist_ok=True)

Base.metadata.create_all(bind=engine)

app = FastAPI(title="PDF RAG Study Assistant Backend")
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(api_router)


@app.get("/health")
def health():
    return {
        "status": "ok",
        "ollama_reachable": ollama_health(),
        "ollama_base_url": settings.ollama_base_url,
        "ollama_hint": "For Windows Docker + host Ollama, use http://host.docker.internal:11434",
    }
