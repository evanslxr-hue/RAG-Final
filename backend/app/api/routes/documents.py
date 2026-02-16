import os
from uuid import uuid4

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.db.session import get_db
from app.models.document import Document, DocumentStatus
from app.models.job import Job, JobLog, JobStatus
from app.schemas.documents import DocumentOut
from app.worker.tasks import process_document

router = APIRouter(tags=["documents"])


@router.post("/api/collections/{id}/documents", response_model=DocumentOut)
def upload_document(id: int, file: UploadFile = File(...), db: Session = Depends(get_db)):
    settings = get_settings()
    os.makedirs(settings.storage_dir, exist_ok=True)
    ext = os.path.splitext(file.filename)[1]
    new_name = f"{uuid4().hex}{ext}"
    path = os.path.join(settings.storage_dir, new_name)
    with open(path, "wb") as out:
        out.write(file.file.read())

    doc = Document(collection_id=id, filename=file.filename, storage_path=path, status=DocumentStatus.UPLOADED)
    db.add(doc)
    db.commit()
    db.refresh(doc)

    job = Job(document_id=doc.id, status=JobStatus.UPLOADED, progress=0)
    db.add(job)
    db.commit()
    db.refresh(job)

    db.add(JobLog(job_id=job.id, level="INFO", message="Document uploaded and job created"))
    doc.last_job_id = job.id
    doc.status = DocumentStatus.PROCESSING
    db.commit()

    process_document.delay(job.id, doc.id, id)
    db.refresh(doc)
    return doc


@router.get("/api/documents/{id}", response_model=DocumentOut)
def get_document(id: int, db: Session = Depends(get_db)):
    doc = db.get(Document, id)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    return doc


@router.get("/api/documents/{id}/file")
def get_document_file(id: int, db: Session = Depends(get_db)):
    doc = db.get(Document, id)
    if not doc or not os.path.exists(doc.storage_path):
        raise HTTPException(status_code=404, detail="File not found")
    return FileResponse(path=doc.storage_path, filename=doc.filename, media_type="application/pdf")
