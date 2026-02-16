import json
import os
from uuid import uuid4

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.db.session import get_db
from app.models.chat import ChatMessage
from app.models.export import Export
from app.models.study import Flashcard, Quiz
from app.models.summary import Summary
from app.schemas.exports import (
    ExportAnswerRequest,
    ExportOut,
    ExportStudyPackRequest,
    ExportSummaryRequest,
)
from app.services.exporter_docx import write_docx
from app.services.exporter_pdf import write_pdf

router = APIRouter(prefix="/api", tags=["exports"])


def _write(format_: str, path: str, title: str, sections: list[tuple[str, str]]):
    if format_ == "pdf":
        write_pdf(path, title, sections)
    else:
        write_docx(path, title, sections)


@router.post("/export/answer", response_model=ExportOut)
def export_answer(payload: ExportAnswerRequest, db: Session = Depends(get_db)):
    settings = get_settings()
    os.makedirs(settings.export_dir, exist_ok=True)
    answer = payload.answer or ""
    citations = payload.citations or []
    session_id = payload.session_id
    if payload.message_id:
        msg = db.get(ChatMessage, payload.message_id)
        if not msg:
            raise HTTPException(status_code=404, detail="Message not found")
        answer = msg.content
        citations = json.loads(msg.citations_json or "[]")
        session_id = msg.session_id
    ext = payload.format
    filename = f"answer_{uuid4().hex}.{ext}"
    path = os.path.join(settings.export_dir, filename)
    _write(ext, path, "Answer Export", [("Answer", answer), ("Citations", json.dumps(citations, indent=2))])
    obj = Export(type="answer", format=ext, filename=filename, filepath=path, session_id=session_id)
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj


@router.post("/export/summary", response_model=ExportOut)
def export_summary(payload: ExportSummaryRequest, db: Session = Depends(get_db)):
    settings = get_settings()
    os.makedirs(settings.export_dir, exist_ok=True)
    row = db.query(Summary).filter(Summary.document_id == payload.document_id).first()
    if not row:
        raise HTTPException(status_code=404, detail="Summary not found")
    data = json.loads(row.payload_json)
    ext = payload.format
    filename = f"summary_{uuid4().hex}.{ext}"
    path = os.path.join(settings.export_dir, filename)
    _write(ext, path, "Summary Export", [("TLDR", data.get("tldr", "")), ("Key Points", "\n".join(data.get("key_points", [])))])
    obj = Export(type="summary", format=ext, filename=filename, filepath=path, document_id=payload.document_id)
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj


@router.post("/export/study-pack", response_model=ExportOut)
def export_study_pack(payload: ExportStudyPackRequest, db: Session = Depends(get_db)):
    settings = get_settings()
    os.makedirs(settings.export_dir, exist_ok=True)
    flashcards = [json.loads(r.payload_json) for r in db.query(Flashcard).filter(Flashcard.document_id == payload.document_id).all()]
    quizzes = [json.loads(r.payload_json) for r in db.query(Quiz).filter(Quiz.document_id == payload.document_id).all()]
    ext = payload.format
    filename = f"study_pack_{uuid4().hex}.{ext}"
    path = os.path.join(settings.export_dir, filename)
    _write(ext, path, "Study Pack", [("Flashcards", json.dumps(flashcards, indent=2)), ("Quizzes", json.dumps(quizzes, indent=2))])
    obj = Export(type="study-pack", format=ext, filename=filename, filepath=path, document_id=payload.document_id)
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj


@router.get("/exports", response_model=list[ExportOut])
def list_exports(db: Session = Depends(get_db)):
    return db.query(Export).order_by(Export.created_at.desc()).all()


@router.get("/exports/{id}/download")
def download_export(id: int, db: Session = Depends(get_db)):
    row = db.get(Export, id)
    if not row or not os.path.exists(row.filepath):
        raise HTTPException(status_code=404, detail="Export not found")
    media_type = "application/pdf" if row.format == "pdf" else "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    return FileResponse(path=row.filepath, filename=row.filename, media_type=media_type)
