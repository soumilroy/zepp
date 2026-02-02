import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useMemo } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import AppHeader from "../components/AppHeader";
import { ResumeBuilderHeader } from "./home/components/ResumeBuilderHeader";
import { SectionCard } from "./home/components/SectionCard";
import { defaultValues, resumeSectionMap } from "./home/resume";
export default function HomePage() {
    const { control, handleSubmit, register } = useForm({
        defaultValues,
    });
    const { fields } = useFieldArray({
        control,
        name: "sections",
    });
    const orderedSections = useMemo(() => fields.map((field) => ({
        id: field.id,
        sectionKey: field.sectionKey,
        section: resumeSectionMap[field.sectionKey],
    })), [fields]);
    const onSubmit = (data) => {
        console.log("Resume form values", data);
    };
    return (_jsxs("main", { className: "min-h-screen bg-slate-950 text-slate-50", children: [_jsx(AppHeader, {}), _jsxs("section", { className: "mx-auto flex w-full max-w-7xl flex-col gap-6 px-6 py-10", children: [_jsx(ResumeBuilderHeader, {}), _jsx(DndProvider, { backend: HTML5Backend, children: _jsxs("form", { onSubmit: handleSubmit(onSubmit), className: "flex flex-col gap-4", children: [orderedSections.map(({ id, section }, index) => section ? (_jsx(SectionCard, { index: index, section: section, control: control, register: register }, id)) : null), _jsx("div", { className: "flex justify-end", children: _jsx("button", { type: "submit", className: "rounded-md bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-950", children: "Save resume" }) })] }) })] })] }));
}
