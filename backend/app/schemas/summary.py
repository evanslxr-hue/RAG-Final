from pydantic import BaseModel


class GlossaryItem(BaseModel):
    term: str
    definition: str
    page: int | None = None


class SectionSummary(BaseModel):
    title: str
    page_range: str
    summary: str


class SummaryResponse(BaseModel):
    document_id: int
    tldr: str
    key_points: list[str]
    glossary: list[GlossaryItem]
    sections: list[SectionSummary]
