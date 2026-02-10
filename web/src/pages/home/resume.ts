import type { FormValues, ResumeSection } from "./types";
import type { ResumeSchemaResponse } from "../../api/types";
import { resumeUiMeta } from "./uiMeta";
import { Folder } from "lucide-react";

export function buildResumeSections(schema: ResumeSchemaResponse): ResumeSection[] {
  return schema.sections.map((section) => {
    const ui = resumeUiMeta[section.sectionKey];
    return {
      key: section.sectionKey,
      title: section.title,
      description: ui?.description ?? "",
      entryType: section.entryType === "single" ? "single" : "multiple",
      icon: ui?.icon ?? Folder,
      fields: section.fields.map((field) => {
        const fieldUi = ui?.fields?.[field.key];
        return {
          key: field.key,
          label: field.label,
          type: field.type,
          editor: fieldUi?.editor,
          fullWidth: fieldUi?.fullWidth,
          width: fieldUi?.width,
        };
      }),
    };
  });
}

export function buildResumeSectionMap(resumeSections: ResumeSection[]) {
  return Object.fromEntries(
    resumeSections.map((section) => [section.key, section]),
  ) as Record<string, ResumeSection>;
}

export function buildDefaultValues(resumeSections: ResumeSection[]): FormValues {
  return {
    sections: resumeSections.map((section) => ({
      sectionKey: section.key,
      items: [],
    })),
  };
}

export function buildPrefilledValues(section: ResumeSection) {
  const values: Record<string, string> = Object.fromEntries(
    section.fields.map((field) => [field.key, ""]),
  );
  return values;
}

export function buildSummary(
  section: ResumeSection,
  values?: Record<string, string>,
) {
  section.fields.slice(1, 3).map((field) => {
    const value = values?.[field.key]?.trim();
    return { label: field.label, value: value || "—" };
  });
}
