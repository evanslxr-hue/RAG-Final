from datetime import datetime
from typing import Literal

from pydantic import BaseModel

from app.schemas.common import JobLogEntry


class JobOut(BaseModel):
    id: int
    document_id: int
    status: Literal[
        "UPLOADED",
        "EXTRACTING",
        "OCR_IF_NEEDED",
        "CHUNKING",
        "EMBEDDING",
        "INDEXED",
        "SUMMARY_GENERATING",
        "STUDY_ITEMS_GENERATING",
        "DONE",
        "FAILED",
    ]
    progress: int
    logs: list[JobLogEntry]
    error: str | None
    created_at: datetime
    updated_at: datetime
