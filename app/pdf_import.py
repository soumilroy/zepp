from __future__ import annotations

import json
import os
from typing import Any

import httpx
from io import BytesIO

from resume_models import ResumeFormValues, validate_resume_form_values
from resume_schema import resume_schema_for_prompt

MAX_PDF_BYTES = 10 * 1024 * 1024
MIN_EXTRACTED_TEXT_CHARS = 50
OPENAI_CHAT_COMPLETIONS_URL = "https://api.openai.com/v1/chat/completions"


SYSTEM_PROMPT = """\
You are a resume extraction engine.

Input: plain text extracted from a user's resume PDF (may contain headers/footers, layout artifacts, and duplicated lines).
Goal: convert the resume into our application's canonical JSON structure.

Output requirements (CRITICAL):
- Output MUST be valid JSON only (no markdown, no prose).
- Output MUST match the provided schema exactly:
  - Top-level object: {"sections": [...]}
  - "sections" MUST include every section exactly once, in the exact order shown in the schema.
  - Each section object MUST be: {"sectionKey": string, "items": [{"id": string, "values": {...}} , ...]}
  - For every item, "id" MUST be present and MUST be the empty string "" (the server will assign IDs).
  - For every item, "values" MUST contain ALL field keys for that section.
  - ALL values MUST be strings. If the source is numeric (e.g., GPA), output it as a string like "3.8" (not a JSON number).
  - If a value is unknown/missing, set it to the empty string "".
  - Do not invent credentials, dates, or URLs. Keep unknowns empty.
  - Do not include any additional keys.
  - For single-entry sections, output at most one item.

Normalization guidance:
- Preserve original casing for names/companies where possible.
- Prefer ISO-like dates when clear (YYYY-MM or YYYY-MM-DD). Otherwise keep the original string.
- For rich text "Description" fields, output plain text with newlines and bullets as "-" lines.
- For URL fields (e.g., LinkedIn, GitHub, Portfolio URL), output a valid URL. Prefer full URLs starting with "https://".
"""


def extract_text_from_pdf_bytes(pdf_bytes: bytes) -> str:
    try:
        from pypdf import PdfReader  # type: ignore
    except Exception as exc:  # pragma: no cover
        raise RuntimeError(
            "PDF parsing dependency missing. Install `pypdf`."
        ) from exc

    reader = PdfReader(BytesIO(pdf_bytes))
    texts: list[str] = []
    for page in reader.pages:
        page_text = page.extract_text() or ""
        texts.append(page_text)
    combined = "\n\n".join(t.strip() for t in texts if t.strip())
    return combined.strip()


def _build_user_prompt(extracted_text: str) -> str:
    schema = resume_schema_for_prompt()
    return (
        "Schema:\n"
        + json.dumps(schema, ensure_ascii=False)
        + "\n\nResume text:\n"
        + extracted_text
    )


def _openai_model() -> str:
    return os.environ.get("OPENAI_MODEL", "gpt-4o-mini")


def call_openai_for_resume_json(openai_api_key: str, extracted_text: str) -> dict[str, Any]:
    payload: dict[str, Any] = {
        "model": _openai_model(),
        "temperature": 0,
        "messages": [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": _build_user_prompt(extracted_text)},
        ],
        "response_format": {"type": "json_object"},
    }

    headers = {"Authorization": f"Bearer {openai_api_key}"}
    with httpx.Client(timeout=60.0) as client:
        response = client.post(OPENAI_CHAT_COMPLETIONS_URL, json=payload, headers=headers)

    if response.status_code == 400:
        # Some models/accounts may not support response_format; retry without it.
        payload.pop("response_format", None)
        with httpx.Client(timeout=60.0) as client:
            response = client.post(
                OPENAI_CHAT_COMPLETIONS_URL, json=payload, headers=headers
            )

    if response.status_code != 200:
        details = response.text
        if len(details) > 500:
            details = details[:500] + "…"
        raise RuntimeError(
            f"OpenAI request failed with status {response.status_code}: {details}"
        )

    data = response.json()
    content = (
        data.get("choices", [{}])[0]
        .get("message", {})
        .get("content", "")
    )
    if not isinstance(content, str) or not content.strip():
        raise RuntimeError("OpenAI returned empty content")

    try:
        parsed = json.loads(content)
    except json.JSONDecodeError as exc:
        raise ValueError("LLM output was not valid JSON") from exc

    if not isinstance(parsed, dict):
        raise ValueError("LLM output must be a JSON object")
    return parsed


def import_resume_from_pdf_bytes(pdf_bytes: bytes, openai_api_key: str) -> ResumeFormValues:
    extracted_text = extract_text_from_pdf_bytes(pdf_bytes)
    if len(extracted_text) < MIN_EXTRACTED_TEXT_CHARS:
        raise ValueError(
            "Could not extract readable text from this PDF. "
            "If this is a scanned image PDF, please upload a text-based PDF."
        )

    llm_json = call_openai_for_resume_json(openai_api_key, extracted_text)
    resume = validate_resume_form_values(llm_json)
    return resume
