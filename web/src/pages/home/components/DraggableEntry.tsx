import { ChevronDown, ChevronUp, GripVertical, Trash2 } from "lucide-react";
import { useEntryDnD } from "../dnd/useEntryDnD";
import { Controller, type Control, type UseFormRegister } from "react-hook-form";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

import SafeHtml from "../../../components/SafeHtml";
import { quillFormats, quillModules } from "../quill";
import type { FormValues, ResumeSection } from "../types";

export type DraggableEntryProps = {
  entryId: string;
  entryIndex: number;
  section: ResumeSection;
  sectionIndex: number;
  control: Control<FormValues>;
  register: UseFormRegister<FormValues>;
  entryTitle: string;
  summary: { label: string; value: string }[];
  isExpanded: boolean;
  enableDrag: boolean;
  allowDelete: boolean;
  onToggle: (id: string) => void;
  onRemove: (index: number) => void;
  onMove: (dragIndex: number, hoverIndex: number) => void;
};

export function DraggableEntry({
  entryId,
  entryIndex,
  section,
  sectionIndex,
  control,
  register,
  entryTitle,
  summary,
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

  return (
    <div
      ref={ref}
      className="rounded-lg border border-slate-800 bg-slate-900/70"
      style={{ opacity: isDragging ? 0.6 : 1 }}
    >
      <div className="flex items-start justify-between gap-4 px-4 py-3">
        <button
          type="button"
          onClick={() => onToggle(entryId)}
          className="flex flex-1 items-start gap-3 text-left"
        >
          {enableDrag ? (
            <span className="mt-0.5 rounded border border-slate-700 px-1 py-2 text-[10px] uppercase tracking-wide text-slate-300">
              <GripVertical className="h-4 w-4" />
            </span>
          ) : null}
          <div>
            <p className="text-sm font-semibold text-slate-100">{entryTitle}</p>
            <div className="entry-summary-html text-xs text-slate-400">
              {summary.length === 0 ? null : (
                <div className="flex flex-wrap items-start gap-x-2 gap-y-1">
                  {summary.map((item, index) => (
                    <div
                      key={`${item.label}-${index}`}
                      className="inline-flex flex-wrap items-baseline gap-1"
                    >
                      {index > 0 ? (
                        <span className="text-slate-600">•</span>
                      ) : null}
                      <span className="text-slate-300">{item.label}:</span>
                      <SafeHtml html={item.value} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </button>
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1 text-xs text-slate-400">
            {isExpanded ? "Collapse" : "Expand"}
            {isExpanded ? (
              <ChevronUp className="h-3 w-3" />
            ) : (
              <ChevronDown className="h-3 w-3" />
            )}
          </span>
          {allowDelete ? (
            <button
              type="button"
              onClick={() => onRemove(entryIndex)}
              className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-slate-200"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Delete
            </button>
          ) : null}
        </div>
      </div>
      <div
        className={`transition-[max-height] duration-300 ease-in-out ${
          isExpanded ? "max-h-[1200px]" : "max-h-0"
        } overflow-hidden`}
      >
        <div className="grid gap-3 border-t border-slate-800 px-4 py-4 md:grid-cols-12">
          {section.fields.map((fieldDef) => (
            <label
              key={fieldDef.key}
              className={`flex flex-col gap-2 text-sm text-slate-200 ${
                fieldDef.fullWidth
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
                    <div className="resume-quill rounded-md border border-slate-700 bg-slate-950 text-slate-100">
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
                  className="rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100"
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

