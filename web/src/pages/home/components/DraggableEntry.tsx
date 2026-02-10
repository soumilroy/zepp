import { GripVertical, Trash2 } from "lucide-react";
import { useEntryDnD } from "../dnd/useEntryDnD";
import {
  Controller,
  type Control,
  type UseFormRegister,
} from "react-hook-form";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

import { quillFormats, quillModules } from "../quill";
import type { EntryAnalysis, FormValues, ResumeSection } from "../types";

export type DraggableEntryProps = {
  entryId: string;
  entryIndex: number;
  section: ResumeSection;
  sectionIndex: number;
  control: Control<FormValues>;
  register: UseFormRegister<FormValues>;
  analysis?: EntryAnalysis;
  entryTitle: string;
  isExpanded: boolean;
  enableDrag: boolean;
  allowDelete: boolean;
  onToggle: (id: string) => void;
  onRemove: () => void;
  onMove: (dragIndex: number, hoverIndex: number) => void;
};

const PLACEHOLDER_EXAMPLES: Record<string, string> = {
  "First Name": "Jane",
  "Last Name": "Doe",
  Email: "jane.doe@gmail.com",
  Phone: "(555) 123-4567",
  Location: "Austin, TX",
  Website: "janedoe.dev",
  LinkedIn: "linkedin.com/in/janedoe",
  GitHub: "github.com/janedoe",
  School: "University of Texas",
  Degree: "B.S. Computer Science",
  Major: "Computer Science",
  GPA: "3.8",
  Company: "Acme Corp",
  Position: "Software Engineer",
  Title: "Portfolio Website",
  Designation: "Senior Product Designer",
  "Start Date": "Aug 2021",
  "End Date": "May 2025",
};

const getPlaceholder = (label: string, editor?: "quill") => {
  const example = PLACEHOLDER_EXAMPLES[label];
  if (editor === "quill") {
    return example ? `Write something like: "${example}"` : `Write ${label}`;
  }
  return example ? `e.g. ${example}` : `Enter ${label}`;
};

function isValidUrl(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed) return true;
  let candidate = trimmed;
  if (!candidate.toLowerCase().startsWith("http://") && !candidate.toLowerCase().startsWith("https://")) {
    candidate = `https://${candidate}`;
  }
  try {
    const url = new URL(candidate);
    if (url.protocol !== "http:" && url.protocol !== "https:") return false;
    if (!url.hostname || !url.hostname.includes(".")) return false;
    return true;
  } catch {
    return false;
  }
}

function shouldValidateUrl(sectionKey: string, fieldKey: string, fieldType: string) {
  if (fieldType === "url") return true;
  if (sectionKey === "personal-information" && (fieldKey === "linkedin" || fieldKey === "github")) {
    return true;
  }
  return false;
}

function severityRank(severity: "info" | "warning" | "error") {
  if (severity === "error") return 3;
  if (severity === "warning") return 2;
  return 1;
}

function worstSeverity(analysis?: EntryAnalysis) {
  const severities: ("info" | "warning" | "error")[] = [];
  if (analysis?.entryIssues?.length) {
    severities.push(...analysis.entryIssues.map((issue) => issue.severity));
  }
  if (analysis?.fieldIssues) {
    for (const issues of Object.values(analysis.fieldIssues)) {
      severities.push(...issues.map((issue) => issue.severity));
    }
  }
  return severities.reduce<"info" | "warning" | "error">(
    (acc, severity) => (severityRank(severity) > severityRank(acc) ? severity : acc),
    "info",
  );
}

function entryToneBorder(severity: "info" | "warning" | "error") {
  if (severity === "error") return "border-rose-300 dark:border-rose-700/70";
  if (severity === "warning") return "border-amber-300 dark:border-amber-700/70";
  return "border-sky-300 dark:border-sky-700/70";
}

function issueCount(analysis?: EntryAnalysis) {
  let count = analysis?.entryIssues?.length ?? 0;
  if (analysis?.fieldIssues) {
    for (const issues of Object.values(analysis.fieldIssues)) {
      count += issues.length;
    }
  }
  return count;
}

export function DraggableEntry({
  entryId,
  entryIndex,
  section,
  sectionIndex,
  control,
  register,
  analysis,
  entryTitle,
  isExpanded,
  enableDrag,
  allowDelete,
  onToggle,
  onRemove,
  onMove,
}: DraggableEntryProps) {
  const { ref, isDragging } = useEntryDnD({
    entryIndex,
    sectionIndex,
    enableDrag,
    onMove,
  });

  const issues = issueCount(analysis);
  const severity = issues > 0 ? worstSeverity(analysis) : "info";

  return (
    <div
      ref={ref}
      className={`rounded-lg border bg-white shadow-sm dark:bg-slate-900/70 ${
        issues > 0 ? entryToneBorder(severity) : "border-slate-200 dark:border-slate-800"
      }`}
      style={{ opacity: isDragging ? 0.6 : 1 }}
    >
      <div className="flex items-center justify-between gap-4 px-4 py-3">
        <button
          type="button"
          onClick={() => onToggle(entryId)}
          className="flex items-center gap-3 text-left"
        >
          {enableDrag ? (
            <span className="mt-0.5 rounded border border-slate-300 bg-slate-50 py-0.5 text-[10px] uppercase tracking-wide text-slate-600 dark:border-slate-700 dark:bg-transparent dark:text-slate-300">
              <GripVertical className="h-4 w-4" />
            </span>
          ) : null}
          <p className="text-sm text-slate-900 dark:text-slate-100">{entryTitle}</p>
        </button>
        <div className="flex items-center gap-2">
          {issues > 0 ? (
            <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-1 text-[11px] font-semibold text-slate-700 dark:border-slate-700 dark:bg-slate-950/60 dark:text-slate-200">
              {issues} issue{issues === 1 ? "" : "s"}
            </span>
          ) : null}
          {allowDelete ? (
            <button
              type="button"
              onClick={onRemove}
              className="inline-flex items-center gap-1 rounded-md bg-rose-600/10 px-1.5 py-1 text-xs text-rose-800 hover:bg-rose-600/15 dark:bg-rose-500/15 dark:text-rose-100 dark:hover:bg-rose-500/25"
            >
              <Trash2 className="h-3 w-3" />
              Delete
            </button>
          ) : null}
        </div>
      </div>
      <div
        className={`transition-[max-height] duration-300 ease-in-out ${isExpanded ? "max-h-[1200px]" : "max-h-0"
          } overflow-hidden`}
      >
        <div className="grid gap-3 border-t border-slate-200 px-4 py-4 md:grid-cols-12 dark:border-slate-800">
            {section.fields.map((fieldDef) => {
              const fieldIssues = analysis?.fieldIssues?.[fieldDef.key] ?? [];
              const hasIssues = fieldIssues.length > 0;
              const gridSpan = fieldDef.fullWidth
                ? "md:col-span-12"
                : fieldDef.width === "1/4"
                  ? "md:col-span-3"
                  : fieldDef.width === "1/3"
                    ? "md:col-span-4"
                    : fieldDef.width === "1/2"
                      ? "md:col-span-6"
                      : "md:col-span-12";

              return (
                <label
                  key={fieldDef.key}
                  className={`flex flex-col gap-2 text-sm text-slate-800 dark:text-slate-200 ${gridSpan}`}
                >
                  <span className={hasIssues ? "font-semibold" : ""}>{fieldDef.label}</span>
                  {fieldDef.editor === "quill" ? (
                    <Controller
                      control={control}
                      name={`sections.${sectionIndex}.items.${entryIndex}.values.${fieldDef.key}`}
                      render={({ field }) => (
                        <div
                          className={`resume-quill rounded-md border bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-100 ${hasIssues
                            ? "border-amber-300 dark:border-amber-600/60"
                            : "border-slate-200 dark:border-slate-700"
                            }`}
                        >
                          <ReactQuill
                            theme="snow"
                            modules={quillModules}
                            formats={[...quillFormats]}
                            value={field.value || ""}
                            onChange={field.onChange}
                            placeholder={getPlaceholder(fieldDef.label, fieldDef.editor)}
                          />
                        </div>
                      )}
                    />
                  ) : (
                    <input
                      type={fieldDef.type}
                      className={`rounded-md border bg-white px-3 py-2 text-sm text-slate-900 dark:bg-slate-950 dark:text-slate-100 ${hasIssues
                        ? "border-amber-300 focus:border-amber-400 focus:outline-none dark:border-amber-600/60"
                        : "border-slate-300 dark:border-slate-700"
                        }`}
                      placeholder={getPlaceholder(fieldDef.label, fieldDef.editor)}
                      {...register(`sections.${sectionIndex}.items.${entryIndex}.values.${fieldDef.key}`, {
                        validate:
                          shouldValidateUrl(section.key, fieldDef.key, fieldDef.type)
                            ? (value) =>
                                typeof value !== "string" || !value.trim() || isValidUrl(value)
                                  ? true
                                  : "Enter a valid URL (prefer https://...)"
                            : undefined,
                      })}
                    />
                  )}
                </label>
              );
            })}
        </div>
      </div>
    </div>
  );
}
