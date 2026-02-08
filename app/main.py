from fastapi import Depends, FastAPI, File, Header, HTTPException, UploadFile, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session as DBSession

from pdf_import import MAX_PDF_BYTES, import_resume_from_pdf_bytes
from resume_models import (
    ResumeFormValues,
    ResumeImportResponse,
    ResumeListItem,
    ResumeListResponse,
    ResumeSchemaResponse,
    upgrade_resume_form_values,
)
from resume_schema import resume_schema_for_client
from session_logic import (
    Resume,
    SessionCreate,
    SessionResponse,
    UserSession,
    UserResponse,
    create_session as create_session_logic,
    get_db,
    logout_session,
    new_resume_id,
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


@app.get("/resume/schema", response_model=ResumeSchemaResponse)
async def get_resume_schema():
    return ResumeSchemaResponse(sections=resume_schema_for_client())

@app.post("/resume/import/pdf", response_model=ResumeImportResponse)
async def import_resume_pdf(
    file: UploadFile = File(...),
    session: UserSession = Depends(require_session_token),
    db: DBSession = Depends(get_db),
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

    resume_id = new_resume_id()
    resume_entry = Resume(id=resume_id, user_email=session.email)
    db.add(resume_entry)
    db.commit()

    try:
        resume = import_resume_from_pdf_bytes(b"".join(chunks), session.openai_key)
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

    resume_entry.normalized_json = resume.model_dump()
    db.add(resume_entry)
    db.commit()
    return ResumeImportResponse(resume_id=resume_id, **resume.model_dump())


def _resume_label(normalized_json: object | None, fallback_email: str) -> str:
    if not isinstance(normalized_json, dict):
        return fallback_email
    sections = normalized_json.get("sections")
    if not isinstance(sections, list) or not sections:
        return fallback_email
    personal = sections[0]
    if not isinstance(personal, dict):
        return fallback_email
    items = personal.get("items")
    if not isinstance(items, list) or not items:
        return fallback_email
    first_item = items[0]
    if not isinstance(first_item, dict):
        return fallback_email
    values = first_item.get("values")
    if not isinstance(values, dict):
        return fallback_email
    first = values.get("first-name")
    last = values.get("last-name")
    name = " ".join(part for part in [first, last] if isinstance(part, str) and part.strip()).strip()
    return name or fallback_email


@app.get("/resumes", response_model=ResumeListResponse)
async def list_resumes(
    session: UserSession = Depends(require_session_token),
    db: DBSession = Depends(get_db),
):
    rows: list[Resume] = (
        db.query(Resume)
        .filter(Resume.user_email == session.email)
        .order_by(Resume.created_at.desc())
        .all()
    )
    return ResumeListResponse(
        resumes=[
            ResumeListItem(
                resume_id=row.id,
                created_at=row.created_at,
                has_content=row.normalized_json is not None,
                label=_resume_label(row.normalized_json, session.email),
            )
            for row in rows
        ]
    )


@app.get("/resumes/{resume_id}", response_model=ResumeImportResponse)
async def get_resume(
    resume_id: str,
    session: UserSession = Depends(require_session_token),
    db: DBSession = Depends(get_db),
):
    row = (
        db.query(Resume)
        .filter(Resume.id == resume_id, Resume.user_email == session.email)
        .first()
    )
    if row is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Resume not found.")
    if row.normalized_json is None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Resume is not ready yet. Please re-import.",
        )

    upgraded = upgrade_resume_form_values(row.normalized_json)
    if upgraded != row.normalized_json:
        row.normalized_json = upgraded
        db.add(row)
        db.commit()

    return ResumeImportResponse(resume_id=row.id, **upgraded)


@app.put("/resumes/{resume_id}", response_model=ResumeImportResponse)
async def save_resume(
    resume_id: str,
    payload: ResumeFormValues,
    session: UserSession = Depends(require_session_token),
    db: DBSession = Depends(get_db),
):
    row = (
        db.query(Resume)
        .filter(Resume.id == resume_id, Resume.user_email == session.email)
        .first()
    )
    if row is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Resume not found.")

    row.normalized_json = payload.model_dump()
    db.add(row)
    db.commit()
    return ResumeImportResponse(resume_id=row.id, **row.normalized_json)


@app.delete("/resumes/{resume_id}")
async def delete_resume(
    resume_id: str,
    session: UserSession = Depends(require_session_token),
    db: DBSession = Depends(get_db),
):
    row = (
        db.query(Resume)
        .filter(Resume.id == resume_id, Resume.user_email == session.email)
        .first()
    )
    if row is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Resume not found.")
    db.delete(row)
    db.commit()
    return {"status": "success", "message": "Resume deleted"}

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
