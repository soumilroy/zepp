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
      "personal-information": "text-sky-200",
      education: "text-emerald-200",
      "work-experience": "text-amber-200",
      skills: "text-violet-200",
      projects: "text-cyan-200",
      references: "text-rose-200",
      certifications: "text-lime-200",
      languages: "text-indigo-200",
      portfolio: "text-fuchsia-200",
    }[section.key] ?? "text-slate-100";

  const pillBorderTone =
    {
      "personal-information": "border-sky-700/30",
      education: "border-emerald-700/30",
      "work-experience": "border-amber-700/30",
      skills: "border-violet-700/30",
      projects: "border-cyan-700/30",
      references: "border-rose-700/30",
      certifications: "border-lime-700/30",
      languages: "border-indigo-700/30",
      portfolio: "border-fuchsia-700/30",
    }[section.key] ?? "border-slate-800/30";

  return (
    <div
      className={`flex flex-col gap-2 ${index === 0 ? "" : "border-t border-slate-800/70 pt-6"
        }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div
                  className={`inline-flex items-center gap-2 rounded-full border bg-slate-800/70 py-1 pl-1 pr-3 ${pillBorderTone}`}
                  aria-label={`${section.title} description`}
                >
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-slate-700/80">
                    <Icon className="h-4 w-4 text-slate-200" />
                  </span>
                  <h3 className={`text-sm font-semibold ${titleTone}`}>
                    {section.title}
                  </h3>
                  <Info className="h-4 w-4 text-slate-400" />
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

