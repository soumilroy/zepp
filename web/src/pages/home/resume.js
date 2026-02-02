import { resumeStructure } from "./resumeStructure";
export const toKey = (value) => value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
export const resumeSections = resumeStructure.map((section) => ({
    key: toKey(section.title),
    title: section.title,
    description: section.description,
    entryType: section.entry_type === "single" ? "single" : "multiple",
    icon: section.icon,
    fields: section.fields.map((field) => ({
        key: toKey(field.label),
        label: field.label,
        type: field.type,
        editor: field.editor === "quill" ? "quill" : undefined,
        fullWidth: field.fullWidth === true,
        width: field.width === "1/2" ||
            field.width === "1/3" ||
            field.width === "1/4" ||
            field.width === "full"
            ? field.width
            : undefined,
    })),
}));
export const resumeSectionMap = Object.fromEntries(resumeSections.map((section) => [section.key, section]));
export const defaultValues = {
    sections: resumeSections.map((section) => ({
        sectionKey: section.key,
        items: [],
    })),
};
export const buildPrefilledValues = (section) => {
    const values = Object.fromEntries(section.fields.map((field) => [field.key, ""]));
    const firstField = section.fields.find((field) => field.type === "text");
    if (firstField) {
        values[firstField.key] = `New ${section.title}`;
    }
    return values;
};
export const buildSummary = (section, values) => section.fields.slice(1, 3).map((field) => {
    const value = values?.[field.key]?.trim();
    return { label: field.label, value: value || "—" };
});
