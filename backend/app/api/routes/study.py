import json

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.document import Document
from app.models.job import Job, JobLog, JobStatus
from app.models.study import Flashcard, Quiz
from app.schemas.study import FlashcardOut, QuizOut
from app.worker.tasks import process_document

router = APIRouter(tags=["study"])


@router.get("/api/documents/{id}/study/flashcards", response_model=list[FlashcardOut])
def get_flashcards(id: int, db: Session = Depends(get_db)):
    rows = db.query(Flashcard).filter(Flashcard.document_id == id).all()
    return [FlashcardOut(**json.loads(r.payload_json)) for r in rows]


@router.get("/api/documents/{id}/study/quizzes", response_model=list[QuizOut])
def get_quizzes(id: int, db: Session = Depends(get_db)):
    rows = db.query(Quiz).filter(Quiz.document_id == id).all()
    return [QuizOut(**json.loads(r.payload_json)) for r in rows]


@router.post("/api/documents/{id}/study/generate")
def generate_study(id: int, db: Session = Depends(get_db)):
    doc = db.get(Document, id)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    job = Job(document_id=doc.id, status=JobStatus.STUDY_ITEMS_GENERATING, progress=90)
    db.add(job)
    db.commit()
    db.refresh(job)
    db.add(JobLog(job_id=job.id, level="INFO", message="Manual study generation requested"))
    doc.last_job_id = job.id
    db.commit()
    process_document.delay(job.id, doc.id, doc.collection_id)
    return {"job_id": job.id, "status": "queued"}
