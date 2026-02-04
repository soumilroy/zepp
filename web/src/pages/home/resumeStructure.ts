import {
  BadgeCheck,
  Briefcase,
  Folder,
  FolderKanban,
  GraduationCap,
  Languages,
  User,
  Users,
  Wrench,
} from "lucide-react";

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

export const resumeStructure: RawSection[] = [
  {
    title: "Personal Information",
    description: "Add your personal information here",
    entry_type: "single",
    icon: User,
    fields: [
      { label: "First Name", type: "text", width: "1/2" },
      { label: "Last Name", type: "text", width: "1/2" },
      { label: "Email", type: "text", width: "1/4" },
      { label: "Phone", type: "text", width: "1/4" },
      { label: "Address", type: "text", width: "1/2" },
      { label: "City", type: "text", width: "1/4" },
      { label: "State", type: "text", width: "1/4" },
      { label: "Zip Code", type: "text", width: "1/4" },
      { label: "Country", type: "text", width: "1/4" },
      { label: "LinkedIn", type: "text", width: "1/2" },
      { label: "GitHub", type: "text", width: "1/2" },
    ],
  },
  {
    title: "Education",
    description: "Add your education here",
    entry_type: "multiple",
    icon: GraduationCap,
    fields: [
      { label: "School", type: "text", width: "full" },
      { label: "Degree", type: "text", width: "1/2" },
      { label: "Field of Study", type: "text", width: "1/2" },
      { label: "Start Date", type: "date", width: "1/4" },
      { label: "End Date", type: "date", width: "1/4" },
      { label: "Grade", type: "number", width: "1/4" },
      { label: "GPA", type: "number", width: "1/4" },
      {
        label: "Description",
        type: "text",
        editor: "quill",
        fullWidth: true,
        width: "full",
      },
    ],
  },
  {
    title: "Work Experience",
    description: "Add your work experience here",
    entry_type: "multiple",
    icon: Briefcase,
    fields: [
      { label: "Company", type: "text", width: "1/2" },
      { label: "Position", type: "text", width: "1/2" },
      { label: "Start Date", type: "date", width: "1/2" },
      { label: "End Date", type: "date", width: "1/2" },
      {
        label: "Description",
        type: "text",
        editor: "quill",
        fullWidth: true,
        width: "full",
      },
    ],
  },
  {
    title: "Portfolio",
    description: "Add your portfolio here",
    entry_type: "multiple",
    icon: Folder,
    fields: [
      { label: "Title", type: "text", width: "1/2" },
      { label: "URL", type: "text", width: "1/2" },
      {
        label: "Description",
        type: "text",
        editor: "quill",
        fullWidth: true,
        width: "full",
      },
    ],
  },
  {
    title: "Skills",
    description: "Add your skills here",
    entry_type: "multiple",
    icon: Wrench,
    fields: [
      { label: "Skill", type: "text", width: "full" },
      {
        label: "Description",
        type: "text",
        editor: "quill",
        fullWidth: true,
        width: "full",
      },
    ],
  },
  {
    title: "Projects",
    description: "Add your projects here",
    entry_type: "multiple",
    icon: FolderKanban,
    fields: [
      { label: "Project Name", type: "text", width: "full" },
      {
        label: "Description",
        type: "text",
        editor: "quill",
        fullWidth: true,
        width: "full",
      },
    ],
  },
  {
    title: "References",
    description: "Add your references here",
    entry_type: "multiple",
    icon: Users,
    fields: [
      { label: "Reference Name", type: "text", width: "full" },
      {
        label: "Description",
        type: "text",
        editor: "quill",
        fullWidth: true,
        width: "full",
      },
    ],
  },
  {
    title: "Certifications",
    description: "Add your certifications here",
    entry_type: "multiple",
    icon: BadgeCheck,
    fields: [
      { label: "Certification Name", type: "text", width: "full" },
      {
        label: "Description",
        type: "text",
        editor: "quill",
        fullWidth: true,
        width: "full",
      },
    ],
  },
  {
    title: "Languages",
    description: "Add your languages here",
    entry_type: "multiple",
    icon: Languages,
    fields: [
      { label: "Language", type: "text", width: "1/2" },
      { label: "Proficiency", type: "text", width: "1/2" },
    ],
  },
];

