import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { ChevronDown, ChevronUp, GripVertical, Trash2 } from "lucide-react";
import { useEntryDnD } from "../dnd/useEntryDnD";
import { Controller } from "react-hook-form";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import SafeHtml from "../../../components/SafeHtml";
import { quillFormats, quillModules } from "../quill";
export function DraggableEntry({ entryId, entryIndex, section, sectionIndex, control, register, entryTitle, summary, isExpanded, enableDrag, allowDelete, onToggle, onRemove, onMove, }) {
    const { ref, isDragging } = useEntryDnD({
        entryIndex,
        sectionIndex,
        enableDrag,
        onMove,
    });
    return (_jsxs("div", { ref: ref, className: "rounded-lg border border-slate-800 bg-slate-900/70", style: { opacity: isDragging ? 0.6 : 1 }, children: [_jsxs("div", { className: "flex items-start justify-between gap-4 px-4 py-3", children: [_jsxs("button", { type: "button", onClick: () => onToggle(entryId), className: "flex flex-1 items-start gap-3 text-left", children: [enableDrag ? (_jsx("span", { className: "mt-0.5 rounded border border-slate-700 px-1 py-2 text-[10px] uppercase tracking-wide text-slate-300", children: _jsx(GripVertical, { className: "h-4 w-4" }) })) : null, _jsxs("div", { children: [_jsx("p", { className: "text-sm font-semibold text-slate-100", children: entryTitle }), _jsx("div", { className: "entry-summary-html text-xs text-slate-400", children: summary.length === 0 ? null : (_jsx("div", { className: "flex flex-wrap items-start gap-x-2 gap-y-1", children: summary.map((item, index) => (_jsxs("div", { className: "inline-flex flex-wrap items-baseline gap-1", children: [index > 0 ? (_jsx("span", { className: "text-slate-600", children: "\u2022" })) : null, _jsxs("span", { className: "text-slate-300", children: [item.label, ":"] }), _jsx(SafeHtml, { html: item.value })] }, `${item.label}-${index}`))) })) })] })] }), _jsxs("div", { className: "flex items-center gap-3", children: [_jsxs("span", { className: "inline-flex items-center gap-1 text-xs text-slate-400", children: [isExpanded ? "Collapse" : "Expand", isExpanded ? (_jsx(ChevronUp, { className: "h-3 w-3" })) : (_jsx(ChevronDown, { className: "h-3 w-3" }))] }), allowDelete ? (_jsxs("button", { type: "button", onClick: () => onRemove(entryIndex), className: "inline-flex items-center gap-1 text-xs text-slate-400 hover:text-slate-200", children: [_jsx(Trash2, { className: "h-3.5 w-3.5" }), "Delete"] })) : null] })] }), _jsx("div", { className: `transition-[max-height] duration-300 ease-in-out ${isExpanded ? "max-h-[1200px]" : "max-h-0"} overflow-hidden`, children: _jsx("div", { className: "grid gap-3 border-t border-slate-800 px-4 py-4 md:grid-cols-12", children: section.fields.map((fieldDef) => (_jsxs("label", { className: `flex flex-col gap-2 text-sm text-slate-200 ${fieldDef.fullWidth
                            ? "md:col-span-12"
                            : fieldDef.width === "1/4"
                                ? "md:col-span-3"
                                : fieldDef.width === "1/3"
                                    ? "md:col-span-4"
                                    : fieldDef.width === "1/2"
                                        ? "md:col-span-6"
                                        : "md:col-span-12"}`, children: [_jsx("span", { children: fieldDef.label }), fieldDef.editor === "quill" ? (_jsx(Controller, { control: control, name: `sections.${sectionIndex}.items.${entryIndex}.values.${fieldDef.key}`, render: ({ field }) => (_jsx("div", { className: "resume-quill rounded-md border border-slate-700 bg-slate-950 text-slate-100", children: _jsx(ReactQuill, { theme: "snow", modules: quillModules, formats: [...quillFormats], value: field.value || "", onChange: field.onChange, placeholder: fieldDef.label }) })) })) : (_jsx("input", { type: fieldDef.type, className: "rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100", placeholder: fieldDef.label, ...register(`sections.${sectionIndex}.items.${entryIndex}.values.${fieldDef.key}`) }))] }, fieldDef.key))) }) })] }));
}
