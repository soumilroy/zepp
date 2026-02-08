from __future__ import annotations

from dataclasses import dataclass


def to_key(value: str) -> str:
    return (
        value.lower()
        .replace("&", "and")
        .replace("/", " ")
        .strip()
        .replace("’", "'")
    )


def _slugify(value: str) -> str:
    out: list[str] = []
    prev_dash = False
    for ch in value:
        if ch.isalnum():
            out.append(ch.lower())
            prev_dash = False
            continue
        if not prev_dash:
            out.append("-")
            prev_dash = True
    joined = "".join(out).strip("-")
    while "--" in joined:
        joined = joined.replace("--", "-")
    return joined


@dataclass(frozen=True)
class ResumeFieldSchema:
    key: str
    label: str
    field_type: str


@dataclass(frozen=True)
class ResumeSectionSchema:
    key: str
    title: str
    entry_type: str  # "single" | "multiple"
    fields: tuple[ResumeFieldSchema, ...]


_RAW_STRUCTURE: list[dict] = [
    {
        "title": "Personal Information",
        "entry_type": "single",
        "fields": [
            {"label": "First Name", "type": "text"},
            {"label": "Last Name", "type": "text"},
            {"label": "Designation", "type": "text"},
            {"label": "Email", "type": "text"},
            {"label": "Phone", "type": "text"},
            {"label": "Address", "type": "text"},
            {"label": "City", "type": "text"},
            {"label": "State", "type": "text"},
            {"label": "Zip Code", "type": "text"},
            {"label": "Country", "type": "text"},
            {"label": "LinkedIn", "type": "text"},
            {"label": "GitHub", "type": "text"},
        ],
    },
    {
        "title": "Education",
        "entry_type": "multiple",
        "fields": [
            {"label": "School", "type": "text"},
            {"label": "Degree", "type": "text"},
            {"label": "Field of Study", "type": "text"},
            {"label": "Start Date", "type": "date"},
            {"label": "End Date", "type": "date"},
            {"label": "Grade", "type": "number"},
            {"label": "GPA", "type": "number"},
            {"label": "Description", "type": "text"},
        ],
    },
    {
        "title": "Work Experience",
        "entry_type": "multiple",
        "fields": [
            {"label": "Company", "type": "text"},
            {"label": "Position", "type": "text"},
            {"label": "Start Date", "type": "date"},
            {"label": "End Date", "type": "date"},
            {"label": "Description", "type": "text"},
        ],
    },
    {
        "title": "Portfolio",
        "entry_type": "multiple",
        "fields": [
            {"label": "Title", "type": "text"},
            {"label": "URL", "type": "text"},
            {"label": "Description", "type": "text"},
        ],
    },
    {
        "title": "Skills",
        "entry_type": "multiple",
        "fields": [
            {"label": "Skill", "type": "text"},
            {"label": "Description", "type": "text"},
        ],
    },
    {
        "title": "Projects",
        "entry_type": "multiple",
        "fields": [
            {"label": "Project Name", "type": "text"},
            {"label": "Description", "type": "text"},
        ],
    },
    {
        "title": "References",
        "entry_type": "multiple",
        "fields": [
            {"label": "Reference Name", "type": "text"},
            {"label": "Description", "type": "text"},
        ],
    },
    {
        "title": "Certifications",
        "entry_type": "multiple",
        "fields": [
            {"label": "Certification Name", "type": "text"},
            {"label": "Description", "type": "text"},
        ],
    },
    {
        "title": "Languages",
        "entry_type": "multiple",
        "fields": [
            {"label": "Language", "type": "text"},
            {"label": "Proficiency", "type": "text"},
        ],
    },
]


def build_resume_sections() -> tuple[ResumeSectionSchema, ...]:
    sections: list[ResumeSectionSchema] = []
    for raw_section in _RAW_STRUCTURE:
        section_title = str(raw_section["title"])
        section_key = _slugify(to_key(section_title))
        fields: list[ResumeFieldSchema] = []
        for raw_field in raw_section["fields"]:
            field_label = str(raw_field["label"])
            field_key = _slugify(to_key(field_label))
            fields.append(
                ResumeFieldSchema(
                    key=field_key,
                    label=field_label,
                    field_type=str(raw_field["type"]),
                )
            )
        sections.append(
            ResumeSectionSchema(
                key=section_key,
                title=section_title,
                entry_type=str(raw_section["entry_type"]),
                fields=tuple(fields),
            )
        )
    return tuple(sections)


RESUME_SECTIONS: tuple[ResumeSectionSchema, ...] = build_resume_sections()

SECTION_BY_KEY: dict[str, ResumeSectionSchema] = {s.key: s for s in RESUME_SECTIONS}
ALLOWED_SECTION_KEYS: set[str] = set(SECTION_BY_KEY.keys())

SECTION_FIELD_KEYS: dict[str, tuple[str, ...]] = {
    section.key: tuple(field.key for field in section.fields)
    for section in RESUME_SECTIONS
}
SINGLE_ENTRY_SECTION_KEYS: set[str] = {
    section.key for section in RESUME_SECTIONS if section.entry_type == "single"
}


def build_empty_values_for_section(section_key: str) -> dict[str, str]:
    schema = SECTION_BY_KEY.get(section_key)
    if schema is None:
        raise KeyError(f"Unknown section_key: {section_key}")
    return {field.key: "" for field in schema.fields}


def build_empty_resume_form_values() -> dict:
    return {
        "sections": [
            {"sectionKey": section.key, "items": []}
            for section in RESUME_SECTIONS
        ]
    }


def resume_schema_for_prompt() -> list[dict]:
    """
    Compact schema for prompt injection.
    """
    return [
        {
            "sectionKey": section.key,
            "entryType": section.entry_type,
            "fields": [
                {"key": field.key, "label": field.label, "type": field.field_type}
                for field in section.fields
            ],
        }
        for section in RESUME_SECTIONS
    ]


def resume_schema_for_client() -> list[dict]:
    """
    Resume schema for frontend consumption.

    Includes stable keys plus user-facing titles/labels.
    """
    return [
        {
            "sectionKey": section.key,
            "title": section.title,
            "entryType": section.entry_type,
            "fields": [
                {"key": field.key, "label": field.label, "type": field.field_type}
                for field in section.fields
            ],
        }
        for section in RESUME_SECTIONS
    ]
