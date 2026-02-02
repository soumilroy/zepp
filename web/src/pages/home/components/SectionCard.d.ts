import type { Control, UseFormRegister } from "react-hook-form";
import type { FormValues, ResumeSection } from "../types";
export type SectionCardProps = {
    section: ResumeSection;
    index: number;
    control: Control<FormValues>;
    register: UseFormRegister<FormValues>;
};
export declare function SectionCard({ section, index, control, register }: SectionCardProps): import("react/jsx-runtime").JSX.Element;
