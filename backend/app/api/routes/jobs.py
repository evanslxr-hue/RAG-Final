from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.job import Job, JobLog
from app.schemas.common import JobLogEntry
from app.schemas.jobs import JobOut

router = APIRouter(prefix="/api/jobs", tags=["jobs"])


def _to_job_out(job: Job, logs: list[JobLog]) -> JobOut:
    return JobOut(
        id=job.id,
        document_id=job.document_id,
        status=job.status.value,
        progress=job.progress,
        logs=[JobLogEntry(ts=l.ts, level=l.level, message=l.message) for l in logs],
        error=job.error,
        created_at=job.created_at,
        updated_at=job.updated_at,
    )


@router.get("", response_model=list[JobOut])
def list_jobs(db: Session = Depends(get_db)):
    jobs = db.query(Job).order_by(Job.created_at.desc()).all()
    out = []
    for j in jobs:
        logs = db.query(JobLog).filter(JobLog.job_id == j.id).order_by(JobLog.ts.asc()).all()
        out.append(_to_job_out(j, logs))
    return out


@router.get("/{id}", response_model=JobOut)
def get_job(id: int, db: Session = Depends(get_db)):
    job = db.get(Job, id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    logs = db.query(JobLog).filter(JobLog.job_id == job.id).order_by(JobLog.ts.asc()).all()
    return _to_job_out(job, logs)
