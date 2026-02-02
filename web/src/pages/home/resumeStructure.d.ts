import type { LucideIcon } from "lucide-react";
type RawField = {
    label: string;
    type: string;
    width?: "full" | "1/2" | "1/3" | "1/4";
    editor?: "quill";
    fullWidth?: boolean;
};
type RawSection = {
    title: string;
    description: string;
    entry_type: "single" | "multiple";
    icon: LucideIcon;
    fields: RawField[];
};
export declare const resumeStructure: RawSection[];
export {};
