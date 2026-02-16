from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.collection import Collection
from app.models.document import Document
from app.schemas.collections import CollectionCreate, CollectionOut
from app.schemas.documents import DocumentOut

router = APIRouter(prefix="/api/collections", tags=["collections"])


@router.post("", response_model=CollectionOut)
def create_collection(payload: CollectionCreate, db: Session = Depends(get_db)):
    obj = Collection(name=payload.name)
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj


@router.get("", response_model=list[CollectionOut])
def list_collections(db: Session = Depends(get_db)):
    return db.query(Collection).order_by(Collection.created_at.desc()).all()


@router.get("/{id}/documents", response_model=list[DocumentOut])
def list_collection_documents(id: int, db: Session = Depends(get_db)):
    return db.query(Document).filter(Document.collection_id == id).order_by(Document.created_at.desc()).all()
