import json

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.document import Document
from app.models.job import Job, JobLog, JobStatus
from app.models.summary import Summary
from app.schemas.summary import SummaryResponse
from app.worker.tasks import process_document

router = APIRouter(tags=["summary"])


@router.get("/api/documents/{id}/summary", response_model=SummaryResponse)
def get_summary(id: int, db: Session = Depends(get_db)):
    row = db.query(Summary).filter(Summary.document_id == id).first()
    if not row:
        raise HTTPException(status_code=404, detail="Summary not found")
    payload = json.loads(row.payload_json)
    return SummaryResponse(**payload)


@router.post("/api/documents/{id}/summarize")
def enqueue_summary(id: int, db: Session = Depends(get_db)):
    doc = db.get(Document, id)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    job = Job(document_id=doc.id, status=JobStatus.SUMMARY_GENERATING, progress=80)
    db.add(job)
    db.commit()
    db.refresh(job)
    db.add(JobLog(job_id=job.id, level="INFO", message="Manual summarize requested"))
    doc.last_job_id = job.id
    db.commit()
    process_document.delay(job.id, doc.id, doc.collection_id)
    return {"job_id": job.id, "status": "queued"}
