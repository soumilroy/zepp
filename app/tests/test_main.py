import itertools
import sys
from pathlib import Path

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from main import Base, UserSession, app, get_db

TEST_DATABASE_URL = "sqlite:///./test_app.db"

test_engine = create_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)


def insert_session(email: str, token: str, openai_key: str | None = None) -> None:
    generated_key = openai_key or f"sk-test-{email}"
    with TestingSessionLocal() as db:
        db.add(UserSession(email=email, session_token=token, openai_key=generated_key))
        db.commit()


@pytest.fixture(autouse=True)
def prepare_database():
    Base.metadata.drop_all(bind=test_engine)
    Base.metadata.create_all(bind=test_engine)

    def override_get_db():
        db = TestingSessionLocal()
        try:
            yield db
        finally:
            db.close()

    app.dependency_overrides[get_db] = override_get_db
    yield
    app.dependency_overrides.clear()
    Base.metadata.drop_all(bind=test_engine)


@pytest.fixture()
def client():
    return TestClient(app)


@pytest.fixture()
def auth_headers():
    token = "valid-token"
    insert_session(email="tester@example.com", token=token)
    return {"X-Session-Token": token}


def test_root_endpoint_returns_status(client):
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {
        "status": "success",
        "message": "Zepp.ai API is running",
    }


def test_create_session_persists_token(client):
    payload = {"email": "alice@example.com"}

    response = client.post("/sessions", json=payload)

    assert response.status_code == 200
    body = response.json()
    assert body["email"] == payload["email"]
    assert isinstance(body["session_token"], str) and len(body["session_token"]) > 20
    assert body["openai_key"].startswith("sk-")

    with TestingSessionLocal() as db:
        stored = db.query(UserSession).filter_by(email=payload["email"]).one()
        assert stored.session_token == body["session_token"]
        assert stored.openai_key == body["openai_key"]


def test_create_session_does_not_require_session_token(client):
    response = client.post("/sessions", json={"email": "alice@example.com"})
    assert response.status_code == 200
    body = response.json()
    assert body["email"] == "alice@example.com"
    assert isinstance(body["session_token"], str) and len(body["session_token"]) > 20
    assert body["openai_key"].startswith("sk-")


def test_create_session_regenerates_token_on_collision(client, monkeypatch):
    insert_session(email="seed@example.com", token="dup-token")

    token_values = itertools.cycle([
        "dup-token",  # initial collision for session token
        "unique-token",  # regenerated session token
    ])

    def fake_token_urlsafe(_nbytes=32):
        return next(token_values)

    monkeypatch.setattr("main.secrets.token_urlsafe", fake_token_urlsafe)
    monkeypatch.setattr("main.generate_openai_key", lambda: "sk-generated")

    response = client.post("/sessions", json={"email": "bob@example.com"})

    assert response.status_code == 200
    body = response.json()
    assert body["session_token"] == "unique-token"
    assert body["openai_key"] == "sk-generated"

    with TestingSessionLocal() as db:
        assert db.query(UserSession).filter_by(session_token="dup-token").count() == 1
        assert db.query(UserSession).filter_by(session_token="unique-token").count() == 1
        assert db.query(UserSession).filter_by(openai_key="sk-generated").count() == 1
