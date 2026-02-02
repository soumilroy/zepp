import type { LucideIcon } from "lucide-react";
export type ResumeField = {
    key: string;
    label: string;
    type: string;
    editor?: "quill";
    fullWidth?: boolean;
    width?: "full" | "1/2" | "1/3" | "1/4";
};
export type ResumeSection = {
    key: string;
    title: string;
    description: string;
    entryType: "single" | "multiple";
    icon: LucideIcon;
    fields: ResumeField[];
};
export type FormValues = {
    sections: {
        sectionKey: string;
        items: {
            values: Record<string, string>;
        }[];
    }[];
};
