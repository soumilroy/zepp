import { type Control, type UseFormRegister } from "react-hook-form";
import type { FormValues, ResumeSection } from "../types";
export type SectionEntriesProps = {
    section: ResumeSection;
    sectionIndex: number;
    control: Control<FormValues>;
    register: UseFormRegister<FormValues>;
};
export declare function SectionEntries({ section, sectionIndex, control, register, }: SectionEntriesProps): import("react/jsx-runtime").JSX.Element;
