from datetime import datetime
from typing import Literal

from pydantic import BaseModel


class DocumentOut(BaseModel):
    id: int
    collection_id: int
    filename: str
    status: Literal["UPLOADED", "PROCESSING", "INDEXED", "FAILED"]
    page_count: int | None
    created_at: datetime
    last_job_id: int | None

    model_config = {"from_attributes": True}
