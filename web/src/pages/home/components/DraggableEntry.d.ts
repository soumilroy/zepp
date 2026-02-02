import { type Control, type UseFormRegister } from "react-hook-form";
import "react-quill/dist/quill.snow.css";
import type { FormValues, ResumeSection } from "../types";
export type DraggableEntryProps = {
    entryId: string;
    entryIndex: number;
    section: ResumeSection;
    sectionIndex: number;
    control: Control<FormValues>;
    register: UseFormRegister<FormValues>;
    entryTitle: string;
    summary: {
        label: string;
        value: string;
    }[];
    isExpanded: boolean;
    enableDrag: boolean;
    allowDelete: boolean;
    onToggle: (id: string) => void;
    onRemove: (index: number) => void;
    onMove: (dragIndex: number, hoverIndex: number) => void;
};
export declare function DraggableEntry({ entryId, entryIndex, section, sectionIndex, control, register, entryTitle, summary, isExpanded, enableDrag, allowDelete, onToggle, onRemove, onMove, }: DraggableEntryProps): import("react/jsx-runtime").JSX.Element;
