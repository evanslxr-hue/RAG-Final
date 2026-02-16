# PDF RAG Study Assistant Backend (FastAPI + Celery + Chroma + Ollama)

Production-style local backend for a React frontend, supporting:
- PDF upload and async indexing
- RAG chat with citations
- Summary generation
- Flashcards/quizzes generation
- PDF/DOCX export

## Tech Stack
- FastAPI (`/docs` OpenAPI)
- SQLAlchemy + SQLite
- Celery + Redis (background jobs)
- Chroma persistent vector DB
- Sentence Transformers embeddings (default: `BAAI/bge-small-en-v1.5`)
- Ollama local chat model (`llama3.1`)

## Required API Paths
Implemented exactly as requested:
- `POST /api/collections`
- `GET /api/collections`
- `GET /api/collections/{id}/documents`
- `POST /api/collections/{id}/documents`
- `GET /api/documents/{id}`
- `GET /api/documents/{id}/file`
- `GET /api/jobs`
- `GET /api/jobs/{id}`
- `POST /api/chat`
- `GET /api/documents/{id}/summary`
- `POST /api/documents/{id}/summarize`
- `GET /api/documents/{id}/study/flashcards`
- `GET /api/documents/{id}/study/quizzes`
- `POST /api/documents/{id}/study/generate`
- `POST /api/export/answer`
- `POST /api/export/summary`
- `POST /api/export/study-pack`
- `GET /api/exports`
- `GET /api/exports/{id}/download`

## Windows + Docker + Ollama
This setup assumes:
- Backend/worker are in Docker containers.
- Ollama runs on Windows host.
- Containers reach Ollama via `http://host.docker.internal:11434`.

Use `/health` to check if Ollama is reachable.

## Environment
Copy `backend/.env.example` to `backend/.env` if you want local overrides.

## Run (Docker Compose)
```bash
docker compose up --build
```

Then verify:
- API docs: `http://localhost:8000/docs`
- Health: `http://localhost:8000/health`

## Manual Flow Test
1. Create collection: `POST /api/collections`
2. Upload PDF: `POST /api/collections/{id}/documents` (multipart)
3. Check job progress: `GET /api/jobs` or `GET /api/jobs/{id}`
4. Ask question: `POST /api/chat`
5. View summary/study items using summary/study endpoints
6. Export answer/summary/study pack and download from `/api/exports/{id}/download`

## Project Structure
```
backend/
  app/
    main.py
    api/
      router.py
      routes/
    core/
    db/
      migrations/
    models/
    schemas/
    services/
    worker/
  requirements.txt
  .env.example
  README.md
docker-compose.yml
```

## Tests
From repo root:
```bash
cd backend
PYTHONPATH=. pytest -q
```
