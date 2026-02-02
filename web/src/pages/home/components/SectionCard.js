import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger, } from "../../../components/ui/tooltip";
import { SectionEntries } from "./SectionEntries";
export function SectionCard({ section, index, control, register }) {
    const Icon = section.icon;
    const titleTone = {
        "personal-information": "text-sky-200",
        education: "text-emerald-200",
        "work-experience": "text-amber-200",
        skills: "text-violet-200",
        projects: "text-cyan-200",
        references: "text-rose-200",
        certifications: "text-lime-200",
        languages: "text-indigo-200",
        portfolio: "text-fuchsia-200",
    }[section.key] ?? "text-slate-100";
    const pillBorderTone = {
        "personal-information": "border-sky-700/30",
        education: "border-emerald-700/30",
        "work-experience": "border-amber-700/30",
        skills: "border-violet-700/30",
        projects: "border-cyan-700/30",
        references: "border-rose-700/30",
        certifications: "border-lime-700/30",
        languages: "border-indigo-700/30",
        portfolio: "border-fuchsia-700/30",
    }[section.key] ?? "border-slate-800/30";
    return (_jsxs("div", { className: `flex flex-col gap-2 ${index === 0 ? "" : "border-t border-slate-800/70 pt-6"}`, children: [_jsx("div", { className: "flex items-start justify-between gap-4", children: _jsx("div", { children: _jsx(TooltipProvider, { children: _jsxs(Tooltip, { children: [_jsx(TooltipTrigger, { asChild: true, children: _jsxs("div", { className: `inline-flex items-center gap-2 rounded-full border bg-slate-800/70 py-1 pl-1 pr-3 ${pillBorderTone}`, "aria-label": `${section.title} description`, children: [_jsx("span", { className: "inline-flex h-8 w-8 items-center justify-center rounded-full bg-slate-700/80", children: _jsx(Icon, { className: "h-4 w-4 text-slate-200" }) }), _jsx("h3", { className: `text-sm font-semibold ${titleTone}`, children: section.title }), _jsx(Info, { className: "h-4 w-4 text-slate-400" })] }) }), _jsx(TooltipContent, { children: section.description })] }) }) }) }), _jsx(SectionEntries, { section: section, sectionIndex: index, control: control, register: register })] }));
}
