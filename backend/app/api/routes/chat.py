import json

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.chat import ChatMessage, ChatSession
from app.schemas.chat import ChatRequest, ChatResponse, CitationOut
from app.services.llm_ollama import chat_with_ollama
from app.services.retrieval import retrieve

router = APIRouter(prefix="/api/chat", tags=["chat"])


@router.post("", response_model=ChatResponse)
def chat(payload: ChatRequest, db: Session = Depends(get_db)):
    session = db.get(ChatSession, payload.session_id) if payload.session_id else None
    if session is None:
        session = ChatSession(collection_id=payload.collection_id)
        db.add(session)
        db.commit()
        db.refresh(session)

    hits = retrieve(payload.collection_id, payload.question)
    citations = []
    context_blocks = []
    for h in hits:
        m = h["metadata"]
        snippet = h["text"][:240]
        citations.append(
            CitationOut(
                document_id=int(m["document_id"]),
                filename=m["filename"],
                page=int(m["page"]),
                chunk_id=m["chunk_id"],
                snippet=snippet,
            )
        )
        context_blocks.append(f"[{m['filename']} p{m['page']} {m['chunk_id']}] {h['text']}")

    strict_line = "If answer missing in context, say exactly: Not found in documents." if payload.strict_mode else "Prefer context; you may answer generally if needed."
    prompt = (
        "You are a PDF RAG assistant. "
        f"{strict_line} Cite used sources inline like [filename pX].\n"
        "Context:\n"
        + "\n\n".join(context_blocks)
        + f"\n\nQuestion: {payload.question}"
    )
    answer = chat_with_ollama([{"role": "user", "content": prompt}])

    user_msg = ChatMessage(session_id=session.id, role="user", content=payload.question)
    db.add(user_msg)
    db.commit()

    assistant_msg = ChatMessage(session_id=session.id, role="assistant", content=answer, citations_json=json.dumps([c.model_dump() for c in citations]))
    db.add(assistant_msg)
    db.commit()
    db.refresh(assistant_msg)

    distances = [h["distance"] for h in hits] if hits else [1.0]
    confidence = max(0.0, min(1.0, 1 - (sum(distances) / len(distances))))

    return ChatResponse(
        session_id=session.id,
        message_id=assistant_msg.id,
        answer=answer,
        confidence=confidence,
        citations=citations,
    )
