from datetime import datetime
from pydantic import BaseModel


class JobLogEntry(BaseModel):
    ts: datetime
    level: str
    message: str
