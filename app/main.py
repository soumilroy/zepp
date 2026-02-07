from fastapi import Depends, FastAPI, File, Header, HTTPException, UploadFile, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session as DBSession

from pdf_import import MAX_PDF_BYTES, import_resume_from_pdf_bytes
from resume_models import ResumeFormValues
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

@app.post("/resume/import/pdf", response_model=ResumeFormValues)
async def import_resume_pdf(
    file: UploadFile = File(...),
    session: UserSession = Depends(require_session_token),
):
    filename = (file.filename or "").lower()
    is_pdf_name = filename.endswith(".pdf")
    is_pdf_type = file.content_type in ("application/pdf", "application/x-pdf")
    if not (is_pdf_name or is_pdf_type):
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail="Only PDF files are supported.",
        )

    chunks: list[bytes] = []
    size = 0
    while True:
        chunk = await file.read(1024 * 1024)
        if not chunk:
            break
        size += len(chunk)
        if size > MAX_PDF_BYTES:
            raise HTTPException(
                status_code=status.HTTP_413_CONTENT_TOO_LARGE,
                detail="PDF file is too large (max 10 MB).",
            )
        chunks.append(chunk)

    try:
        return import_resume_from_pdf_bytes(b"".join(chunks), session.openai_key)
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            detail=str(exc),
        ) from exc
    except RuntimeError as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=str(exc),
        ) from exc

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
