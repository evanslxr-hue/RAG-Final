from pydantic import AliasChoices, BaseModel, Field, field_validator


class ChatRequest(BaseModel):
    collection_id: int
    question: str = Field(validation_alias=AliasChoices("question", "message"))
    strict_mode: bool = False
    session_id: int | None = None

    @field_validator("session_id", mode="before")
    @classmethod
    def normalize_session_id(cls, value):
        if value in (None, "", "default"):
            return None
        return value


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
