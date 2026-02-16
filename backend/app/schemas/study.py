from pydantic import BaseModel


class StudyCitation(BaseModel):
    filename: str
    page: int
    chunk_id: str


class FlashcardOut(BaseModel):
    id: str
    question: str
    answer: str
    difficulty: str
    citation: StudyCitation


class QuizOut(BaseModel):
    id: str
    question: str
    choices: list[str]
    correct_index: int
    explanation: str
    citation: StudyCitation
