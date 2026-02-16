from pydantic import BaseModel


class ChatRequest(BaseModel):
    collection_id: int
    question: str
    strict_mode: bool
    session_id: int | None = None


class CitationOut(BaseModel):
    document_id: int
    filename: str
    page: int
    chunk_id: str
    snippet: str


class ChatResponse(BaseModel):
    session_id: int
    message_id: int
    answer: str
    confidence: float
    citations: list[CitationOut]
