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
import type { ResumeField } from "./types";

type FieldUi = Pick<ResumeField, "width" | "editor" | "fullWidth">;

type SectionUi = {
  description: string;
  icon: LucideIcon;
  fields?: Record<string, FieldUi>;
};

export const resumeUiMeta: Record<string, SectionUi> = {
  "personal-information": {
    description: "Add your personal information here",
    icon: User,
    fields: {
      "first-name": { width: "1/2" },
      "last-name": { width: "1/2" },
      designation: { width: "full" },
      email: { width: "1/4" },
      phone: { width: "1/4" },
      address: { width: "1/2" },
      city: { width: "1/4" },
      state: { width: "1/4" },
      "zip-code": { width: "1/4" },
      country: { width: "1/4" },
      linkedin: { width: "1/2" },
      github: { width: "1/2" },
    },
  },
  education: {
    description: "Add your education here",
    icon: GraduationCap,
    fields: {
      school: { width: "full" },
      degree: { width: "1/2" },
      "field-of-study": { width: "1/2" },
      "start-date": { width: "1/4" },
      "end-date": { width: "1/4" },
      grade: { width: "1/4" },
      gpa: { width: "1/4" },
      description: { width: "full", editor: "quill", fullWidth: true },
    },
  },
  "work-experience": {
    description: "Add your work experience here",
    icon: Briefcase,
    fields: {
      company: { width: "1/2" },
      position: { width: "1/2" },
      "start-date": { width: "1/2" },
      "end-date": { width: "1/2" },
      description: { width: "full", editor: "quill", fullWidth: true },
    },
  },
  portfolio: {
    description: "Add your portfolio here",
    icon: Folder,
    fields: {
      title: { width: "1/2" },
      url: { width: "1/2" },
      description: { width: "full", editor: "quill", fullWidth: true },
    },
  },
  skills: {
    description: "Add your skills here",
    icon: Wrench,
    fields: {
      skill: { width: "full" },
      description: { width: "full", editor: "quill", fullWidth: true },
    },
  },
  projects: {
    description: "Add your projects here",
    icon: FolderKanban,
    fields: {
      "project-name": { width: "full" },
      description: { width: "full", editor: "quill", fullWidth: true },
    },
  },
  references: {
    description: "Add your references here",
    icon: Users,
    fields: {
      "reference-name": { width: "full" },
      description: { width: "full", editor: "quill", fullWidth: true },
    },
  },
  certifications: {
    description: "Add your certifications here",
    icon: BadgeCheck,
    fields: {
      "certification-name": { width: "full" },
      description: { width: "full", editor: "quill", fullWidth: true },
    },
  },
  languages: {
    description: "Add your languages here",
    icon: Languages,
    fields: {
      language: { width: "1/2" },
      proficiency: { width: "1/2" },
    },
  },
};
