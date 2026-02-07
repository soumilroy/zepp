import { ChevronDown, ChevronUp, GripVertical, Save, Trash2 } from "lucide-react";
import { useEntryDnD } from "../dnd/useEntryDnD";
import {
  Controller,
  useWatch,
  type Control,
  type UseFormRegister,
} from "react-hook-form";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { toast } from "sonner";

import { quillFormats, quillModules } from "../quill";
import type { FormValues, ResumeSection } from "../types";

export type DraggableEntryProps = {
  entryId: string;
  entryIndex: number;
  section: ResumeSection;
  sectionIndex: number;
  control: Control<FormValues>;
  register: UseFormRegister<FormValues>;
  onSave: () => void;
  entryTitle: string;
  isExpanded: boolean;
  enableDrag: boolean;
  allowDelete: boolean;
  onToggle: (id: string) => void;
  onRemove: (index: number) => void;
  onMove: (dragIndex: number, hoverIndex: number) => void;
};

const REQUIRED_FIELDS_BY_SECTION: Record<string, string[]> = {
  "Personal Information": ["First Name", "Email", "Phone"],
  Education: ["School"],
  "Work Experience": ["Company", "Position"],
  Portfolio: ["Title"],
};

export function DraggableEntry({
  entryId,
  entryIndex,
  section,
  sectionIndex,
  control,
  register,
  onSave,
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
  const entryValues =
    useWatch({
      control,
      name: `sections.${sectionIndex}.items.${entryIndex}.values`,
    }) ?? {};

  const handleSave = () => {
    const requiredLabels = REQUIRED_FIELDS_BY_SECTION[section.title] ?? [];
    if (requiredLabels.length === 0) {
      onSave();
      return;
    }

    const requiredKeys = section.fields
      .filter((field) => requiredLabels.includes(field.label))
      .map((field) => field.key);
    const missingLabels = requiredKeys
      .filter((key) => !entryValues?.[key]?.trim())
      .map(
        (key) => section.fields.find((field) => field.key === key)?.label ?? key,
      );

    if (missingLabels.length > 0) {
      if (!isExpanded) {
        onToggle(entryId);
      }
      toast.error(
        `Please fill required fields: ${missingLabels.join(", ")}.`,
      );
      return;
    }

    onSave();
  };

  return (
    <div
      ref={ref}
      className="rounded-lg border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900/70"
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
          <button
            type="button"
            onClick={handleSave}
            className="inline-flex items-center gap-1 rounded-md bg-emerald-600/10 px-1.5 py-1 text-xs text-emerald-800 hover:bg-emerald-600/15 dark:bg-emerald-500/15 dark:text-emerald-100 dark:hover:bg-emerald-500/25"
          >
            <Save className="h-3 w-3" />
            Save
          </button>
          <span className="h-4 w-px bg-slate-200 dark:bg-slate-700" aria-hidden="true" />
          {allowDelete ? (
            <button
              type="button"
              onClick={() => onRemove(entryIndex)}
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
          {section.fields.map((fieldDef) => (
            <label
              key={fieldDef.key}
              className={`flex flex-col gap-2 text-sm text-slate-800 dark:text-slate-200 ${fieldDef.fullWidth
                ? "md:col-span-12"
                : fieldDef.width === "1/4"
                  ? "md:col-span-3"
                  : fieldDef.width === "1/3"
                    ? "md:col-span-4"
                    : fieldDef.width === "1/2"
                      ? "md:col-span-6"
                      : "md:col-span-12"
                }`}
            >
              <span>{fieldDef.label}</span>
              {fieldDef.editor === "quill" ? (
                <Controller
                  control={control}
                  name={`sections.${sectionIndex}.items.${entryIndex}.values.${fieldDef.key}`}
                  render={({ field }) => (
                    <div className="resume-quill rounded-md border border-slate-200 bg-white text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100">
                      <ReactQuill
                        theme="snow"
                        modules={quillModules}
                        formats={[...quillFormats]}
                        value={field.value || ""}
                        onChange={field.onChange}
                        placeholder={fieldDef.label}
                      />
                    </div>
                  )}
                />
              ) : (
                <input
                  type={fieldDef.type}
                  className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                  placeholder={fieldDef.label}
                  {...register(
                    `sections.${sectionIndex}.items.${entryIndex}.values.${fieldDef.key}`,
                  )}
                />
              )}
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
