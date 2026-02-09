from __future__ import annotations

from datetime import datetime
import json
import os
from typing import Any, Literal

import httpx
from pydantic import BaseModel, ConfigDict, ValidationError

from resume_models import upgrade_resume_form_values
from resume_schema import ALLOWED_SECTION_KEYS, SECTION_FIELD_KEYS, resume_schema_for_prompt

OPENAI_CHAT_COMPLETIONS_URL = "https://api.openai.com/v1/chat/completions"


AnalysisSeverity = Literal["info", "warning", "error"]
AnalysisCategory = Literal[
    "typo",
    "grammar",
    "tone",
    "clarity",
    "format",
    "consistency",
    "impact",
    "ats",
    "other",
]


class ResumeAnalysisIssue(BaseModel):
    model_config = ConfigDict(extra="forbid")

    severity: AnalysisSeverity
    category: AnalysisCategory
    message: str
    suggestion: str

    sectionKey: str
    itemId: str | None = None
    fieldKey: str | None = None

    replacement: str | None = None


class ResumeSectionAnalysis(BaseModel):
    model_config = ConfigDict(extra="forbid")

    sectionKey: str
    summary: str
    issues: list[ResumeAnalysisIssue]


class ResumeAnalysisResult(BaseModel):
    model_config = ConfigDict(extra="forbid")

    designation: str
    overall_summary: str
    recruiter_feedback: str
    strengths: list[str]
    risks: list[str]
    sections: list[ResumeSectionAnalysis]


class ResumeAnalysisResponse(ResumeAnalysisResult):
    model_config = ConfigDict(extra="forbid")

    analysis_id: str
    created_at: datetime
    model: str


SYSTEM_PROMPT = """\
You are an expert technical recruiter and resume editor.

Your job:
- Analyze a candidate's FULL resume (structured JSON) as a recruiter would, given their target designation.
- Identify corrections and improvements: typos, grammar, tone, clarity, formatting/consistency, and impact.
- Provide section-by-section feedback and field-level issues when possible.
 - Validate URL fields (LinkedIn, GitHub, Portfolio URL): if present, they should be valid URLs (prefer https://...).

Output requirements (CRITICAL):
- Output MUST be valid JSON only (no markdown, no prose).
- Output MUST match the provided output schema exactly.
- Do NOT invent employers, degrees, dates, metrics, or URLs. If a value is unknown, comment on the gap; do not fabricate.
- Keep feedback actionable and specific. Prefer concrete rewrites for bullet/description fields.
"""


def _openai_model() -> str:
    return os.environ.get("OPENAI_ANALYSIS_MODEL") or os.environ.get("OPENAI_MODEL", "gpt-4o-mini")

def openai_analysis_model() -> str:
    return _openai_model()


def _extract_designation(resume_values: dict[str, Any]) -> str:
    sections = resume_values.get("sections")
    if not isinstance(sections, list) or not sections:
        return ""
    first = sections[0]
    if not isinstance(first, dict):
        return ""
    if first.get("sectionKey") != "personal-information":
        return ""
    items = first.get("items")
    if not isinstance(items, list) or not items:
        return ""
    values = items[0].get("values") if isinstance(items[0], dict) else None
    if not isinstance(values, dict):
        return ""
    designation = values.get("designation")
    return designation.strip() if isinstance(designation, str) else ""


def _build_user_prompt(resume_values: dict[str, Any]) -> str:
    schema = resume_schema_for_prompt()
    output_schema = {
        "designation": "string (echo input designation if present, else infer best-fit)",
        "overall_summary": "string",
        "recruiter_feedback": "string",
        "strengths": ["string", "..."],
        "risks": ["string", "..."],
        "sections": [
            {
                "sectionKey": "string",
                "summary": "string",
                "issues": [
                    {
                        "severity": "info|warning|error",
                        "category": "typo|grammar|tone|clarity|format|consistency|impact|ats|other",
                        "message": "string",
                        "suggestion": "string",
                        "sectionKey": "string",
                        "itemId": "string|null",
                        "fieldKey": "string|null",
                        "replacement": "string|null",
                    }
                ],
            }
        ],
    }

    designation = _extract_designation(resume_values)
    return (
        "Target designation:\n"
        + (designation or "(missing)")
        + "\n\n"
        + "Resume schema (input reference):\n"
        + json.dumps(schema, ensure_ascii=False)
        + "\n\n"
        + "Resume snapshot (input data):\n"
        + json.dumps(resume_values, ensure_ascii=False)
        + "\n\n"
        + "Output schema (you MUST match this exactly):\n"
        + json.dumps(output_schema, ensure_ascii=False)
    )


def call_openai_for_resume_analysis(
    openai_api_key: str, resume_values: dict[str, Any]
) -> dict[str, Any]:
    payload: dict[str, Any] = {
        "model": _openai_model(),
        "temperature": 0.2,
        "messages": [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": _build_user_prompt(resume_values)},
        ],
        "response_format": {"type": "json_object"},
    }

    headers = {"Authorization": f"Bearer {openai_api_key}"}
    with httpx.Client(timeout=90.0) as client:
        response = client.post(OPENAI_CHAT_COMPLETIONS_URL, json=payload, headers=headers)

    if response.status_code == 400:
        payload.pop("response_format", None)
        with httpx.Client(timeout=90.0) as client:
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
    content = data.get("choices", [{}])[0].get("message", {}).get("content", "")
    if not isinstance(content, str) or not content.strip():
        raise RuntimeError("OpenAI returned empty content")

    try:
        parsed = json.loads(content)
    except json.JSONDecodeError as exc:
        raise ValueError("LLM output was not valid JSON") from exc

    if not isinstance(parsed, dict):
        raise ValueError("LLM output must be a JSON object")
    return parsed


def validate_resume_analysis_for_resume(
    analysis_json: dict[str, Any], resume_values: dict[str, Any]
) -> ResumeAnalysisResult:
    try:
        parsed = ResumeAnalysisResult.model_validate(analysis_json)
    except ValidationError as exc:
        raise ValueError("LLM output did not match analysis schema") from exc

    upgraded = upgrade_resume_form_values(resume_values)
    section_item_ids: dict[str, set[str]] = {}
    for section in upgraded.get("sections", []):
        if not isinstance(section, dict):
            continue
        section_key = section.get("sectionKey")
        if not isinstance(section_key, str):
            continue
        ids: set[str] = set()
        items = section.get("items")
        if isinstance(items, list):
            for item in items:
                if not isinstance(item, dict):
                    continue
                item_id = item.get("id")
                if isinstance(item_id, str) and item_id.strip():
                    ids.add(item_id)
        section_item_ids[section_key] = ids

    for section in parsed.sections:
        if section.sectionKey not in ALLOWED_SECTION_KEYS:
            raise ValueError(f"Unknown sectionKey in analysis: {section.sectionKey}")
        allowed_fields = set(SECTION_FIELD_KEYS[section.sectionKey])
        allowed_item_ids = section_item_ids.get(section.sectionKey, set())

        for issue in section.issues:
            if issue.sectionKey != section.sectionKey:
                issue.sectionKey = section.sectionKey
            if issue.fieldKey is not None and issue.fieldKey not in allowed_fields:
                issue.fieldKey = None
                issue.itemId = None
            if (
                issue.itemId is not None
                and allowed_item_ids
                and issue.itemId not in allowed_item_ids
            ):
                issue.itemId = None
                issue.fieldKey = None

    return parsed


def analyze_resume_snapshot(
    openai_api_key: str, resume_values: dict[str, Any]
) -> ResumeAnalysisResult:
    analysis_json = call_openai_for_resume_analysis(openai_api_key, resume_values)
    return validate_resume_analysis_for_resume(analysis_json, resume_values)
