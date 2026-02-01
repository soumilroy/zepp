import secrets
from typing import Optional

from fastapi import Depends, Header, HTTPException, status
import httpx
from pydantic import BaseModel
from sqlalchemy import Column, Integer, String, create_engine
from sqlalchemy.orm import Session as DBSession, declarative_base, sessionmaker

DATABASE_URL = "sqlite:///./app.db"
OPENAI_VALIDATE_URL = "https://api.openai.com/v1/models"

engine = create_engine(
    DATABASE_URL, connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


class UserSession(Base):
    __tablename__ = "sessions"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, nullable=False, index=True)
    session_token = Column(String, nullable=False, unique=True, index=True)
    openai_key = Column(String, nullable=False, unique=True, index=True)


class SessionCreate(BaseModel):
    email: str
    openai_key: str


class SessionResponse(BaseModel):
    email: str
    session_token: str
    openai_key: str


class UserResponse(BaseModel):
    email: str


def get_db() -> DBSession:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def require_session_token(
    session_token: Optional[str] = Header(default=None, alias="X-Session-Token"),
    db: DBSession = Depends(get_db),
) -> UserSession:
    if session_token is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Session token missing",
        )

    session = (
        db.query(UserSession).filter(UserSession.session_token == session_token).first()
    )
    if session is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid session token",
        )
    return session


def generate_openai_key() -> str:
    return f"sk-{secrets.token_urlsafe(32)}"


def validate_openai_key(openai_key: str, db: DBSession) -> None:
    normalized_key = openai_key.strip()
    if not normalized_key or not normalized_key.startswith("sk-") or len(normalized_key) < 6:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid OpenAI key. Use a key that starts with 'sk-'.",
        )
    if (
        db.query(UserSession)
        .filter(UserSession.openai_key == normalized_key)
        .first()
        is not None
    ):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="OpenAI key already has an active session.",
        )
    try:
        with httpx.Client(timeout=5.0) as client:
            response = client.get(
                OPENAI_VALIDATE_URL,
                headers={"Authorization": f"Bearer {normalized_key}"},
            )
    except httpx.HTTPError as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="OpenAI validation failed. Please try again.",
        ) from exc

    if response.status_code == 200:
        return
    if response.status_code in (401, 403):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="OpenAI key could not be validated. Check that the key is active.",
        )
    if response.status_code == 429:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="OpenAI validation rate-limited. Try again shortly.",
        )
    raise HTTPException(
        status_code=status.HTTP_502_BAD_GATEWAY,
        detail="OpenAI validation failed. Please try again.",
    )


def create_session(payload: SessionCreate, db: DBSession) -> SessionResponse:
    """Create a new session token for the given email."""
    validate_openai_key(payload.openai_key, db)
    token = secrets.token_urlsafe(32)

    while (
        db.query(UserSession).filter(UserSession.session_token == token).first()
        is not None
    ):
        token = secrets.token_urlsafe(32)

    session_entry = UserSession(
        email=payload.email,
        session_token=token,
        openai_key=payload.openai_key.strip(),
    )
    db.add(session_entry)
    db.commit()
    db.refresh(session_entry)
    return SessionResponse(
        email=session_entry.email,
        session_token=session_entry.session_token,
        openai_key=session_entry.openai_key,
    )


def logout_session(session_token: Optional[str], db: DBSession) -> dict[str, str]:
    """Invalidate the current session token."""
    if session_token is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid session",
        )

    session_entry = (
        db.query(UserSession)
        .filter(UserSession.session_token == session_token)
        .first()
    )
    if session_entry is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid session",
        )

    db.delete(session_entry)
    db.commit()
    return {"status": "success", "message": "Logged out"}
