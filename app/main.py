from fastapi import Depends, FastAPI, Header
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session as DBSession

from session_logic import (
    SessionCreate,
    SessionResponse,
    UserSession,
    UserResponse,
    create_session as create_session_logic,
    get_db,
    logout_session,
    require_session_token,
)

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

@app.get("/")
async def root():
    return {"status": "success", "message": "Zepp.ai API is running"}


@app.get("/user", response_model=UserResponse)
async def get_user(session: UserSession = Depends(require_session_token)):
    """Return the active session user's email."""
    return UserResponse(email=session.email)

@app.get("/session-status-check")
async def session_status_check(_session: UserSession = Depends(require_session_token)):
    return {"status": "success", "message": "ok"}

@app.post(
    "/sessions",
    response_model=SessionResponse,
)
async def create_session(
    payload: SessionCreate,
    db: DBSession = Depends(get_db),
):
    return create_session_logic(payload, db)


@app.delete("/logout")
async def logout(
    db: DBSession = Depends(get_db),
    session_token: str | None = Header(default=None, alias="X-Session-Token"),
):
    return logout_session(session_token, db)
