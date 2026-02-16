from datetime import datetime
from typing import Literal

from pydantic import BaseModel


class ExportOut(BaseModel):
    id: int
    type: Literal["answer", "summary", "study-pack"]
    format: Literal["pdf", "docx"]
    filename: str
    created_at: datetime
    document_id: int | None = None
    session_id: int | None = None

    model_config = {"from_attributes": True}


class ExportAnswerRequest(BaseModel):
    message_id: int | None = None
    session_id: int | None = None
    answer: str | None = None
    citations: list[dict] | None = None
    format: Literal["pdf", "docx"] = "pdf"


class ExportSummaryRequest(BaseModel):
    document_id: int
    format: Literal["pdf", "docx"] = "pdf"


class ExportStudyPackRequest(BaseModel):
    document_id: int
    format: Literal["pdf", "docx"] = "pdf"
