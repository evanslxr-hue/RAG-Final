import os
import tempfile

import pytest
from fastapi.testclient import TestClient

os.environ["DATABASE_URL"] = "sqlite:///./data/test.db"
os.environ["STORAGE_DIR"] = "./data/test_uploads"
os.environ["EXPORT_DIR"] = "./data/test_exports"
os.environ["CHROMA_PERSIST_DIR"] = "./data/test_chroma"

from app.main import app
from app.db.base import Base
from app.db.session import engine


@pytest.fixture(scope="session", autouse=True)
def setup_db():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    yield


@pytest.fixture
def client():
    return TestClient(app)


@pytest.fixture
def sample_pdf_path():
    from reportlab.pdfgen import canvas

    fd, path = tempfile.mkstemp(suffix=".pdf")
    os.close(fd)
    c = canvas.Canvas(path)
    c.drawString(100, 750, "Page one content")
    c.showPage()
    c.drawString(100, 750, "Page two content")
    c.save()
    yield path
    os.remove(path)
