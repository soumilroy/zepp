import type { FormValues, ResumeSection } from "./types";
export declare const toKey: (value: string) => string;
export declare const resumeSections: ResumeSection[];
export declare const resumeSectionMap: Record<string, ResumeSection>;
export declare const defaultValues: FormValues;
export declare const buildPrefilledValues: (section: ResumeSection) => Record<string, string>;
export declare const buildSummary: (section: ResumeSection, values?: Record<string, string>) => {
    label: string;
    value: string;
}[];
