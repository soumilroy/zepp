import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { useFieldArray, useWatch, } from "react-hook-form";
import { Plus } from "lucide-react";
import { buildPrefilledValues, buildSummary } from "../resume";
import { DraggableEntry } from "./DraggableEntry";
export function SectionEntries({ section, sectionIndex, control, register, }) {
    const { fields, append, remove, move } = useFieldArray({
        control,
        name: `sections.${sectionIndex}.items`,
    });
    const watchedItems = useWatch({
        control,
        name: `sections.${sectionIndex}.items`,
    }) ?? [];
    const [isOpen, setIsOpen] = useState(fields.length > 0);
    const [expandedIds, setExpandedIds] = useState([]);
    useEffect(() => {
        if (fields.length > 0 && !isOpen) {
            setIsOpen(true);
        }
    }, [fields.length, isOpen]);
    const isSingleEntry = section.entryType === "single";
    const isAddDisabled = isSingleEntry && fields.length > 0;
    const handleAdd = () => {
        setIsOpen(true);
        if (isAddDisabled)
            return;
        append({ values: buildPrefilledValues(section) });
    };
    const toggleExpanded = (id) => {
        setExpandedIds((prev) => prev.includes(id) ? prev.filter((entry) => entry !== id) : [...prev, id]);
    };
    return (_jsxs("div", { className: "mt-4", children: [_jsx("div", { className: "flex flex-wrap items-center justify-between gap-3" }), _jsx("div", { className: `transition-[max-height] duration-300 ease-in-out ${isOpen ? "mt-4 max-h-[2000px]" : "mt-0 max-h-0"} overflow-hidden`, children: _jsx("div", { className: "flex flex-col gap-3", children: fields.length === 0 ? (_jsx("p", { className: "text-sm text-slate-500", children: "No entries yet." })) : (fields.map((field, itemIndex) => {
                        const isExpanded = expandedIds.includes(field.id);
                        const summary = buildSummary(section, watchedItems[itemIndex]?.values);
                        const primaryKey = section.fields[0]?.key;
                        const primaryValue = primaryKey
                            ? watchedItems[itemIndex]?.values?.[primaryKey]?.trim()
                            : "";
                        const entryTitle = primaryValue || `${section.title} entry`;
                        return (_jsx(DraggableEntry, { entryId: field.id, entryIndex: itemIndex, section: section, sectionIndex: sectionIndex, control: control, register: register, entryTitle: entryTitle, summary: summary, isExpanded: isExpanded, enableDrag: !isSingleEntry, allowDelete: true, onToggle: toggleExpanded, onRemove: remove, onMove: move }, field.id));
                    })) }) }), _jsx("div", { className: "pt-3", children: _jsx("button", { type: "button", onClick: handleAdd, className: `rounded-md border border-dashed border-slate-600 px-3 py-1.5 text-sm text-slate-200 ${isAddDisabled
                        ? "cursor-not-allowed opacity-50"
                        : "hover:border-slate-400"}`, disabled: isAddDisabled, children: _jsxs("span", { className: "inline-flex items-center gap-2", children: [_jsx(Plus, { className: "h-4 w-4" }), "Add ", section.title] }) }) })] }));
}
