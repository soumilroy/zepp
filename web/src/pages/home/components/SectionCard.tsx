import type { Control, UseFormRegister } from "react-hook-form";
import { Info } from "lucide-react";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../../../components/ui/tooltip";
import type { FormValues, ResumeSection } from "../types";
import { SectionEntries } from "./SectionEntries";

export type SectionCardProps = {
  section: ResumeSection;
  index: number;
  control: Control<FormValues>;
  register: UseFormRegister<FormValues>;
  onSave: () => void;
};

export function SectionCard({
  section,
  index,
  control,
  register,
  onSave,
}: SectionCardProps) {
  const Icon = section.icon;

  const titleTone =
    {
      "personal-information": "text-sky-700 dark:text-sky-200",
      education: "text-emerald-700 dark:text-emerald-200",
      "work-experience": "text-amber-700 dark:text-amber-200",
      skills: "text-violet-700 dark:text-violet-200",
      projects: "text-cyan-700 dark:text-cyan-200",
      references: "text-rose-700 dark:text-rose-200",
      certifications: "text-lime-700 dark:text-lime-200",
      languages: "text-indigo-700 dark:text-indigo-200",
      portfolio: "text-fuchsia-700 dark:text-fuchsia-200",
    }[section.key] ?? "text-slate-900 dark:text-slate-100";

  const pillBorderTone =
    {
      "personal-information": "border-sky-200 dark:border-sky-700/30",
      education: "border-emerald-200 dark:border-emerald-700/30",
      "work-experience": "border-amber-200 dark:border-amber-700/30",
      skills: "border-violet-200 dark:border-violet-700/30",
      projects: "border-cyan-200 dark:border-cyan-700/30",
      references: "border-rose-200 dark:border-rose-700/30",
      certifications: "border-lime-200 dark:border-lime-700/30",
      languages: "border-indigo-200 dark:border-indigo-700/30",
      portfolio: "border-fuchsia-200 dark:border-fuchsia-700/30",
    }[section.key] ?? "border-slate-200 dark:border-slate-800/30";

  return (
    <div
      className={`flex flex-col gap-2 ${index === 0 ? "" : "border-t border-slate-200/80 pt-6 dark:border-slate-800/70"
        }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div
                  className={`inline-flex items-center gap-2 rounded-full border bg-white py-1 pl-1 pr-3 shadow-sm dark:bg-slate-800/70 ${pillBorderTone}`}
                  aria-label={`${section.title} description`}
                >
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-700/80">
                    <Icon className="h-4 w-4 text-slate-700 dark:text-slate-200" />
                  </span>
                  <h3 className={`text-sm font-semibold ${titleTone}`}>
                    {section.title}
                  </h3>
                  <Info className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                </div>
              </TooltipTrigger>
              <TooltipContent>{section.description}</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
      <SectionEntries
        section={section}
        sectionIndex={index}
        control={control}
        register={register}
        onSave={onSave}
      />
    </div>
  );
}
