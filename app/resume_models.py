from __future__ import annotations

from datetime import datetime
from typing import Any
import re
import uuid

from pydantic import BaseModel, ConfigDict, ValidationError, model_validator
from urllib.parse import urlparse

from resume_schema import (
    ALLOWED_SECTION_KEYS,
    RESUME_SECTIONS,
    SECTION_FIELD_KEYS,
    SINGLE_ENTRY_SECTION_KEYS,
    EXTRA_URL_FIELD_KEYS,
    URL_FIELD_KEYS,
)


def new_entry_id() -> str:
    return str(uuid.uuid4())


class ResumeItem(BaseModel):
    model_config = ConfigDict(extra="forbid")

    id: str
    values: dict[str, str]


class ResumeSectionPayload(BaseModel):
    model_config = ConfigDict(extra="forbid")

    sectionKey: str
    items: list[ResumeItem]


class ResumeFormValues(BaseModel):
    model_config = ConfigDict(extra="forbid")

    sections: list[ResumeSectionPayload]

    @model_validator(mode="after")
    def validate_resume_schema(self) -> "ResumeFormValues":
        seen_item_ids: set[str] = set()

        seen: list[str] = [section.sectionKey for section in self.sections]
        missing = [s.key for s in RESUME_SECTIONS if s.key not in seen]
        extra = [key for key in seen if key not in ALLOWED_SECTION_KEYS]

        if extra:
            raise ValueError(f"Unknown sectionKey(s): {sorted(set(extra))}")
        if missing:
            raise ValueError(f"Missing sectionKey(s): {missing}")

        duplicates = sorted({k for k in seen if seen.count(k) > 1})
        if duplicates:
            raise ValueError(f"Duplicate sectionKey(s): {duplicates}")

        expected_order = [s.key for s in RESUME_SECTIONS]
        if seen != expected_order:
            raise ValueError(
                "Sections must be in canonical order: "
                + ", ".join(expected_order)
            )

        for section in self.sections:
            if section.sectionKey in SINGLE_ENTRY_SECTION_KEYS and len(section.items) > 1:
                raise ValueError(
                    f"Section {section.sectionKey} allows at most 1 item"
                )

            allowed_fields = set(SECTION_FIELD_KEYS[section.sectionKey])
            url_fields = set(URL_FIELD_KEYS.get(section.sectionKey, ())) | set(
                EXTRA_URL_FIELD_KEYS.get(section.sectionKey, ())
            )
            for item in section.items:
                if not item.id or not item.id.strip():
                    raise ValueError(f"Section {section.sectionKey} has an item with an empty id")
                if item.id in seen_item_ids:
                    raise ValueError(f"Duplicate item id: {item.id}")
                seen_item_ids.add(item.id)

                keys = set(item.values.keys())
                missing_fields = allowed_fields - keys
                extra_fields = keys - allowed_fields
                if extra_fields:
                    raise ValueError(
                        f"Section {section.sectionKey} has unknown field key(s): {sorted(extra_fields)}"
                    )
                if missing_fields:
                    raise ValueError(
                        f"Section {section.sectionKey} is missing field key(s): {sorted(missing_fields)}"
                    )

                for url_field_key in url_fields:
                    raw = item.values.get(url_field_key, "")
                    value = raw.strip() if isinstance(raw, str) else ""
                    if not value:
                        continue
                    normalized = _normalize_url_for_field(section.sectionKey, url_field_key, value)
                    if not _is_valid_url(normalized):
                        # Be forgiving: store invalid URL-like values as empty strings.
                        item.values[url_field_key] = ""
                        continue
                    item.values[url_field_key] = normalized

        return self


def _is_valid_url(value: str) -> bool:
    candidate = value.strip()
    if not candidate:
        return True
    if not candidate.lower().startswith(("http://", "https://")):
        candidate = "https://" + candidate
    parsed = urlparse(candidate)
    if parsed.scheme not in ("http", "https"):
        return False
    if not parsed.netloc:
        return False
    # Basic sanity: require at least a dot in the hostname.
    host = parsed.netloc.split("@")[-1].split(":")[0]
    if "." not in host:
        return False
    return True


_HANDLE_RE = re.compile(r"^[A-Za-z0-9](?:[A-Za-z0-9-]{0,98}[A-Za-z0-9])?$")


def _normalize_url_for_field(section_key: str, field_key: str, value: str) -> str:
    trimmed = value.strip()
    if not trimmed:
        return ""

    candidate = trimmed.strip("()[]{}<>\"'")
    candidate = candidate.strip()

    if candidate.lower().startswith(("http://", "https://")):
        return candidate

    # Accept common handle inputs for GitHub/LinkedIn and expand into URLs.
    if section_key == "personal-information" and field_key in ("github", "linkedin"):
        handle = candidate.lstrip("@").strip()
        if _HANDLE_RE.match(handle):
            if field_key == "github":
                return f"https://github.com/{handle}"
            return f"https://linkedin.com/in/{handle}"

    if not candidate.lower().startswith(("http://", "https://")):
        candidate = "https://" + candidate
    return candidate


class ResumeImportResponse(ResumeFormValues):
    model_config = ConfigDict(extra="forbid")

    resume_id: str


class ResumeListItem(BaseModel):
    model_config = ConfigDict(extra="forbid")

    resume_id: str
    created_at: datetime
    has_content: bool
    label: str


class ResumeListResponse(BaseModel):
    model_config = ConfigDict(extra="forbid")

    resumes: list[ResumeListItem]


class ResumeItemInput(BaseModel):
    model_config = ConfigDict(extra="forbid")

    id: str | None = None
    values: dict[str, Any]


class ResumeSectionPayloadInput(BaseModel):
    model_config = ConfigDict(extra="forbid")

    sectionKey: str
    items: list[ResumeItemInput]


class ResumeFormValuesInput(BaseModel):
    model_config = ConfigDict(extra="forbid")

    sections: list[ResumeSectionPayloadInput]


class ResumeSchemaField(BaseModel):
    model_config = ConfigDict(extra="forbid")

    key: str
    label: str
    type: str


class ResumeSchemaSection(BaseModel):
    model_config = ConfigDict(extra="forbid")

    sectionKey: str
    title: str
    entryType: str
    fields: list[ResumeSchemaField]


class ResumeSchemaResponse(BaseModel):
    model_config = ConfigDict(extra="forbid")

    sections: list[ResumeSchemaSection]


def upgrade_resume_form_values(data: Any) -> dict[str, Any]:
    """
    Best-effort upgrade of stored resume JSON to the latest canonical schema.

    This avoids breaking older resumes when the schema changes (e.g. adding a
    new field). Unknown keys are ignored; missing keys are filled with "".
    """
    canonical_sections = [
        {"sectionKey": section.key, "items": []}
        for section in RESUME_SECTIONS
    ]
    if not isinstance(data, dict):
        return {"sections": canonical_sections}

    incoming_sections = data.get("sections")
    if not isinstance(incoming_sections, list):
        return {"sections": canonical_sections}

    incoming_by_key: dict[str, Any] = {}
    for section in incoming_sections:
        if not isinstance(section, dict):
            continue
        key = section.get("sectionKey")
        if isinstance(key, str):
            incoming_by_key[key] = section

    used_item_ids: set[str] = set()
    upgraded_sections: list[dict[str, Any]] = []
    for section in RESUME_SECTIONS:
        section_key = section.key
        allowed_fields = set(SECTION_FIELD_KEYS[section_key])
        url_fields = set(URL_FIELD_KEYS.get(section_key, ())) | set(
            EXTRA_URL_FIELD_KEYS.get(section_key, ())
        )
        incoming_section = incoming_by_key.get(section_key, {})
        incoming_items = (
            incoming_section.get("items")
            if isinstance(incoming_section, dict)
            else None
        )
        if not isinstance(incoming_items, list):
            incoming_items = []

        upgraded_items: list[dict[str, Any]] = []
        for item in incoming_items:
            if not isinstance(item, dict):
                continue

            raw_item_id = item.get("id")
            item_id = raw_item_id.strip() if isinstance(raw_item_id, str) else ""
            if not item_id or item_id in used_item_ids:
                item_id = new_entry_id()
                while item_id in used_item_ids:
                    item_id = new_entry_id()
            used_item_ids.add(item_id)

            values = item.get("values")
            if not isinstance(values, dict):
                values = {}

            upgraded_values: dict[str, str] = {}
            for field_key in SECTION_FIELD_KEYS[section_key]:
                raw_value = values.get(field_key)
                coerced = _coerce_scalar_to_string(raw_value)
                if field_key in url_fields and coerced.strip():
                    coerced = _normalize_url_for_field(section_key, field_key, coerced)
                upgraded_values[field_key] = coerced

            # If the client/LLM sent unknown keys, we intentionally drop them.
            unknown_keys = set(values.keys()) - allowed_fields
            if unknown_keys:
                # No-op: we already excluded them.
                pass

            upgraded_items.append({"id": item_id, "values": upgraded_values})

            if section_key in SINGLE_ENTRY_SECTION_KEYS:
                break

        upgraded_sections.append(
            {"sectionKey": section_key, "items": upgraded_items}
        )

    return {"sections": upgraded_sections}


def _coerce_scalar_to_string(value: Any) -> str:
    if value is None:
        return ""
    if isinstance(value, str):
        return value
    if isinstance(value, bool):
        return "true" if value else "false"
    if isinstance(value, (int, float)):
        return str(value)
    raise TypeError(f"Unsupported value type: {type(value).__name__}")


def normalize_llm_resume_form_values(data: Any) -> Any:
    """
    LLMs sometimes emit numbers/bools/nulls for fields we store as strings.
    We coerce scalar primitives into strings, but reject nested structures.
    """
    return upgrade_resume_form_values(data)


def validate_resume_form_values(data: Any) -> ResumeFormValues:
    try:
        normalized = normalize_llm_resume_form_values(data)
        return ResumeFormValues.model_validate(normalized)
    except ValidationError as exc:
        raise ValueError(str(exc)) from exc
