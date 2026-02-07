import itertools
import sys
from pathlib import Path

import pytest
import httpx
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from main import app
from session_logic import Base, UserSession, get_db

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


@pytest.fixture(autouse=True)
def mock_openai_validation(monkeypatch):
    class FakeResponse:
        def __init__(self, status_code: int):
            self.status_code = status_code

    class FakeClient:
        def __init__(self, status_code: int = 200):
            self._status_code = status_code

        def __enter__(self):
            return self

        def __exit__(self, exc_type, exc_value, traceback):
            return False

        def get(self, _url, headers=None):
            return FakeResponse(self._status_code)

    monkeypatch.setattr(httpx, "Client", lambda *args, **kwargs: FakeClient())


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
    payload = {"email": "alice@example.com", "openai_key": "sk-test-alice"}

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
    response = client.post(
        "/sessions", json={"email": "alice@example.com", "openai_key": "sk-test-alice"}
    )
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

    monkeypatch.setattr("session_logic.secrets.token_urlsafe", fake_token_urlsafe)
    response = client.post(
        "/sessions",
        json={"email": "bob@example.com", "openai_key": "sk-test-bob"},
    )

    assert response.status_code == 200
    body = response.json()
    assert body["session_token"] == "unique-token"
    assert body["openai_key"] == "sk-test-bob"

    with TestingSessionLocal() as db:
        assert db.query(UserSession).filter_by(session_token="dup-token").count() == 1
        assert db.query(UserSession).filter_by(session_token="unique-token").count() == 1
        assert db.query(UserSession).filter_by(openai_key="sk-test-bob").count() == 1


def test_create_session_rejects_invalid_openai_key(client):
    response = client.post(
        "/sessions",
        json={"email": "invalid@example.com", "openai_key": "invalid-key"},
    )
    assert response.status_code == 400
    assert response.json()["detail"] == "Invalid OpenAI key. Use a key that starts with 'sk-'."


def test_create_session_rejects_unverified_openai_key(client, monkeypatch):
    class FakeResponse:
        def __init__(self, status_code: int):
            self.status_code = status_code

    class FakeClient:
        def __enter__(self):
            return self

        def __exit__(self, exc_type, exc_value, traceback):
            return False

        def get(self, _url, headers=None):
            return FakeResponse(401)

    monkeypatch.setattr(httpx, "Client", lambda *args, **kwargs: FakeClient())

    response = client.post(
        "/sessions",
        json={"email": "invalid@example.com", "openai_key": "sk-invalid"},
    )
    assert response.status_code == 401
    assert (
        response.json()["detail"]
        == "OpenAI key could not be validated. Check that the key is active."
    )


def test_create_session_allows_relogin_with_new_session_id_for_same_openai_key(
    client, monkeypatch
):
    insert_session(
        email="alice@example.com",
        token="old-token",
        openai_key="sk-test-alice",
    )

    monkeypatch.setattr(
        "session_logic.secrets.token_urlsafe", lambda _nbytes=32: "new-token"
    )

    response = client.post(
        "/sessions",
        json={"email": "alice+new@example.com", "openai_key": "sk-test-alice"},
    )

    assert response.status_code == 200
    body = response.json()
    assert body["email"] == "alice+new@example.com"
    assert body["openai_key"] == "sk-test-alice"
    assert body["session_token"] == "new-token"

    # DB should still have a single row for the key, with the token rotated.
    with TestingSessionLocal() as db:
        assert db.query(UserSession).filter_by(openai_key="sk-test-alice").count() == 1
        assert db.query(UserSession).filter_by(session_token="old-token").count() == 0
        assert db.query(UserSession).filter_by(session_token="new-token").count() == 1
        stored = db.query(UserSession).filter_by(openai_key="sk-test-alice").one()
        assert stored.email == "alice+new@example.com"

    # Old token should no longer authorize requests.
    old_user_response = client.get("/user", headers={"X-Session-Token": "old-token"})
    assert old_user_response.status_code == 401


def test_session_status_check_requires_token(client):
    response = client.get("/session-status-check")
    assert response.status_code == 401
    assert response.json()["detail"] == "Session token missing"


def test_session_status_check_returns_success(client, auth_headers):
    response = client.get("/session-status-check", headers=auth_headers)
    assert response.status_code == 200
    assert response.json() == {"status": "success", "message": "ok"}


def test_import_resume_pdf_requires_token(client):
    response = client.post(
        "/resume/import/pdf",
        files={"file": ("resume.pdf", b"%PDF-1.4", "application/pdf")},
    )
    assert response.status_code == 401


def test_import_resume_pdf_rejects_non_pdf(client, auth_headers):
    response = client.post(
        "/resume/import/pdf",
        headers=auth_headers,
        files={"file": ("resume.txt", b"hello", "text/plain")},
    )
    assert response.status_code == 415
    assert response.json()["detail"] == "Only PDF files are supported."


def test_import_resume_pdf_rejects_oversize_pdf(client, auth_headers):
    too_large = b"0" * (10 * 1024 * 1024 + 1)
    response = client.post(
        "/resume/import/pdf",
        headers=auth_headers,
        files={"file": ("resume.pdf", too_large, "application/pdf")},
    )
    assert response.status_code == 413
    assert response.json()["detail"] == "PDF file is too large (max 10 MB)."


def test_import_resume_pdf_returns_parsed_resume(client, auth_headers, monkeypatch):
    import pdf_import
    from resume_schema import build_empty_resume_form_values, build_empty_values_for_section

    monkeypatch.setattr(
        pdf_import,
        "extract_text_from_pdf_bytes",
        lambda _bytes: (
            "Alice Smith\nalice@example.com\n"
            "Experience: Example Corp - Engineer\n"
            "Education: Example University\n"
        ),
    )

    llm_output = build_empty_resume_form_values()
    personal_values = build_empty_values_for_section("personal-information")
    personal_values.update(
        {
            "first-name": "Alice",
            "last-name": "Smith",
            "email": "alice@example.com",
            "phone": "555-0100",
        }
    )
    llm_output["sections"][0]["items"] = [{"values": personal_values}]

    monkeypatch.setattr(
        pdf_import,
        "call_openai_for_resume_json",
        lambda _key, _text: llm_output,
    )

    response = client.post(
        "/resume/import/pdf",
        headers=auth_headers,
        files={"file": ("resume.pdf", b"%PDF-1.4", "application/pdf")},
    )

    assert response.status_code == 200
    body = response.json()
    assert body["sections"][0]["sectionKey"] == "personal-information"
    assert body["sections"][0]["items"][0]["values"]["email"] == "alice@example.com"


def test_import_resume_pdf_coerces_numeric_values_to_strings(client, auth_headers, monkeypatch):
    import pdf_import
    from resume_schema import build_empty_resume_form_values, build_empty_values_for_section

    monkeypatch.setattr(
        pdf_import,
        "extract_text_from_pdf_bytes",
        lambda _bytes: (
            "Example University\nGPA 3.8\nExperience\n"
            "Worked on backend systems and shipped features.\n"
        ),
    )

    llm_output = build_empty_resume_form_values()
    education_values = build_empty_values_for_section("education")
    education_values.update(
        {
            "school": "Example University",
            "gpa": 3.8,  # LLM sometimes emits as a JSON number
        }
    )
    llm_output["sections"][1]["items"] = [{"values": education_values}]

    monkeypatch.setattr(
        pdf_import,
        "call_openai_for_resume_json",
        lambda _key, _text: llm_output,
    )

    response = client.post(
        "/resume/import/pdf",
        headers=auth_headers,
        files={"file": ("resume.pdf", b"%PDF-1.4", "application/pdf")},
    )

    assert response.status_code == 200
    body = response.json()
    assert body["sections"][1]["items"][0]["values"]["gpa"] == "3.8"
