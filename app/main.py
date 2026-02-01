import secrets
from typing import Optional

from fastapi import Depends, FastAPI, Header, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy import Column, Integer, String, create_engine
from sqlalchemy.orm import Session as DBSession, declarative_base, sessionmaker

app = FastAPI(title="Zepp.ai Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost",
        "http://localhost:3000",
        "http://localhost:5173",
        "http://127.0.0.1",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
    ],
    allow_origin_regex=r"^http://(localhost|127\.0\.0\.1)(:\d+)?$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DATABASE_URL = "sqlite:///./app.db"

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


@app.get("/")
async def root():
    return {"status": "success", "message": "Zepp.ai API is running"}


@app.get("/user", response_model=UserResponse)
async def get_user(session: UserSession = Depends(require_session_token)):
    """Return the active session user's email."""
    return UserResponse(email=session.email)

@app.post(
    "/sessions",
    response_model=SessionResponse,
)
async def create_session(
    payload: SessionCreate,
    db: DBSession = Depends(get_db),
):
    """Create a new session token for the given email"""
    token = secrets.token_urlsafe(32)

    while (
        db.query(UserSession).filter(UserSession.session_token == token).first()
        is not None
    ):
        token = secrets.token_urlsafe(32)

    openai_key = generate_openai_key()
    while (
        db.query(UserSession).filter(UserSession.openai_key == openai_key).first()
        is not None
    ):
        openai_key = generate_openai_key()

    session_entry = UserSession(
        email=payload.email,
        session_token=token,
        openai_key=openai_key,
    )
    db.add(session_entry)
    db.commit()
    db.refresh(session_entry)
    return SessionResponse(
        email=session_entry.email,
        session_token=session_entry.session_token,
        openai_key=session_entry.openai_key,
    )


@app.delete("/logout")
async def logout(
    session_token: Optional[str] = Header(default=None, alias="X-Session-Token"),
    db: DBSession = Depends(get_db),
):
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
