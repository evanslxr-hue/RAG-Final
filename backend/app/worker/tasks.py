import json
import os

from app.db.session import SessionLocal
from app.models.document import Document, DocumentStatus
from app.models.job import Job, JobLog, JobStatus
from app.models.summary import Summary
from app.models.study import Flashcard, Quiz
from app.services.chunking import chunk_document_pages
from app.services.embeddings import EmbeddingProvider
from app.services.pdf_extract import extract_pages
from app.services.summarizer import generate_summary
from app.services.study_generator import generate_study_items
from app.services.vectorstore import VectorStore
from app.worker.celery_app import celery_app
from app.core.config import get_settings


def _log(db, job: Job, level: str, message: str):
    db.add(JobLog(job_id=job.id, level=level, message=message))


def _set_stage(db, job: Job, status: JobStatus, progress: int, message: str):
    job.status = status
    job.progress = progress
    _log(db, job, "INFO", message)
    db.commit()


@celery_app.task(name="process_document")
def process_document(job_id: int, document_id: int, collection_id: int):
    settings = get_settings()
    db = SessionLocal()
    try:
        job = db.get(Job, job_id)
        document = db.get(Document, document_id)
        if not job or not document:
            return

        _set_stage(db, job, JobStatus.EXTRACTING, 10, "Extracting PDF text by page")
        pages = extract_pages(document.storage_path)
        document.page_count = len(pages)
        db.commit()

        _set_stage(db, job, JobStatus.OCR_IF_NEEDED, 20, f"OCR enabled: {settings.enable_ocr}")

        _set_stage(db, job, JobStatus.CHUNKING, 35, "Chunking pages with overlap")
        chunks = chunk_document_pages(
            pages,
            filename=document.filename,
            chunk_size=settings.chunk_size,
            overlap=settings.chunk_overlap,
            document_id=document.id,
        )

        _set_stage(db, job, JobStatus.EMBEDDING, 55, "Computing embeddings")
        embedder = EmbeddingProvider()
        vectors = embedder.embed([c["text"] for c in chunks]) if chunks else []

        _set_stage(db, job, JobStatus.INDEXED, 70, "Upserting chunks into Chroma")
        if chunks:
            VectorStore().upsert_chunks(collection_id=collection_id, chunks=chunks, embeddings=vectors)

        document.status = DocumentStatus.INDEXED
        db.commit()

        _set_stage(db, job, JobStatus.SUMMARY_GENERATING, 82, "Generating summary")
        summary_payload = generate_summary(document.id, chunks)
        existing_summary = db.query(Summary).filter(Summary.document_id == document.id).first()
        if existing_summary:
            existing_summary.payload_json = json.dumps(summary_payload)
        else:
            db.add(Summary(document_id=document.id, payload_json=json.dumps(summary_payload)))
        db.commit()

        _set_stage(db, job, JobStatus.STUDY_ITEMS_GENERATING, 92, "Generating study items")
        flashcards, quizzes = generate_study_items(summary_payload, chunks)
        db.query(Flashcard).filter(Flashcard.document_id == document.id).delete()
        db.query(Quiz).filter(Quiz.document_id == document.id).delete()
        for item in flashcards:
            db.add(Flashcard(document_id=document.id, payload_json=json.dumps(item)))
        for item in quizzes:
            db.add(Quiz(document_id=document.id, payload_json=json.dumps(item)))
        db.commit()

        _set_stage(db, job, JobStatus.DONE, 100, "Processing complete")
    except Exception as exc:
        job = db.get(Job, job_id)
        document = db.get(Document, document_id)
        if job:
            job.status = JobStatus.FAILED
            job.progress = 100
            job.error = str(exc)
            db.add(JobLog(job_id=job.id, level="ERROR", message=f"Pipeline failed: {exc}"))
        if document:
            document.status = DocumentStatus.FAILED
        db.commit()
        raise
    finally:
        db.close()
