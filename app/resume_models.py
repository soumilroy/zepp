from __future__ import annotations

from typing import Any

from pydantic import BaseModel, ConfigDict, ValidationError, model_validator

from resume_schema import (
    ALLOWED_SECTION_KEYS,
    RESUME_SECTIONS,
    SECTION_FIELD_KEYS,
    SINGLE_ENTRY_SECTION_KEYS,
)


class ResumeItem(BaseModel):
    model_config = ConfigDict(extra="forbid")

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
            for item in section.items:
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

        return self


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
    if not isinstance(data, dict):
        return data

    sections = data.get("sections")
    if not isinstance(sections, list):
        return data

    normalized = dict(data)
    normalized_sections: list[Any] = []
    for section_index, section in enumerate(sections):
        if not isinstance(section, dict):
            normalized_sections.append(section)
            continue

        section_copy = dict(section)
        items = section.get("items")
        if not isinstance(items, list):
            normalized_sections.append(section_copy)
            continue

        normalized_items: list[Any] = []
        for item_index, item in enumerate(items):
            if not isinstance(item, dict):
                normalized_items.append(item)
                continue

            item_copy = dict(item)
            values = item.get("values")
            if not isinstance(values, dict):
                normalized_items.append(item_copy)
                continue

            normalized_values: dict[str, Any] = {}
            for key, value in values.items():
                if not isinstance(key, str):
                    raise ValueError(
                        f"LLM output invalid at sections.{section_index}.items.{item_index}.values: non-string key"
                    )
                try:
                    normalized_values[key] = _coerce_scalar_to_string(value)
                except TypeError as exc:
                    raise ValueError(
                        f"LLM output invalid at sections.{section_index}.items.{item_index}.values.{key}: "
                        f"value must be a string (or scalar), got {type(value).__name__}"
                    ) from exc

            item_copy["values"] = normalized_values
            normalized_items.append(item_copy)

        section_copy["items"] = normalized_items
        normalized_sections.append(section_copy)

    normalized["sections"] = normalized_sections
    return normalized


def validate_resume_form_values(data: Any) -> ResumeFormValues:
    try:
        normalized = normalize_llm_resume_form_values(data)
        return ResumeFormValues.model_validate(normalized)
    except ValidationError as exc:
        raise ValueError(str(exc)) from exc
