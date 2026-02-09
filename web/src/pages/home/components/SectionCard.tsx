import type { Control, UseFormRegister } from "react-hook-form";
import { Info } from "lucide-react";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../../../components/ui/tooltip";
import type { FormValues, ResumeSection, SectionAnalysis } from "../types";
import { SectionEntries } from "./SectionEntries";
import { SectionAnalysisPanel } from "./SectionAnalysisPanel";

export type SectionCardProps = {
  section: ResumeSection;
  index: number;
  control: Control<FormValues>;
  register: UseFormRegister<FormValues>;
  analysis?: SectionAnalysis;
  analysisId?: string;
};

export function SectionCard({
  section,
  index,
  control,
  register,
  analysis,
  analysisId,
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
      "personal-information": "border-sky-200 dark:border-sky-400/40",
      education: "border-emerald-200 dark:border-emerald-400/40",
      "work-experience": "border-amber-200 dark:border-amber-400/40",
      skills: "border-violet-200 dark:border-violet-400/40",
      projects: "border-cyan-200 dark:border-cyan-400/40",
      references: "border-rose-200 dark:border-rose-400/40",
      certifications: "border-lime-200 dark:border-lime-400/40",
      languages: "border-indigo-200 dark:border-indigo-400/40",
      portfolio: "border-fuchsia-200 dark:border-fuchsia-400/40",
    }[section.key] ?? "border-slate-200 dark:border-slate-600/40";

  const titleBgTone =
    {
      "personal-information": "bg-sky-50 dark:bg-sky-900/50",
      education: "bg-emerald-50 dark:bg-emerald-900/50",
      "work-experience": "bg-amber-50 dark:bg-amber-900/50",
      skills: "bg-violet-50 dark:bg-violet-900/50",
      projects: "bg-cyan-50 dark:bg-cyan-900/50",
      references: "bg-rose-50 dark:bg-rose-900/50",
      certifications: "bg-lime-50 dark:bg-lime-900/50",
      languages: "bg-indigo-50 dark:bg-indigo-900/50",
      portfolio: "bg-fuchsia-50 dark:bg-fuchsia-900/50",
    }[section.key] ?? "bg-slate-50 dark:bg-slate-800/60";

  return (
    <div
      className={`flex flex-col gap-2 ${index === 0 ? "" : "border-t border-slate-200/80 pt-6 dark:border-slate-800/70"
        }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="w-full">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div
                  className={`flex w-full items-center gap-2 rounded-lg border px-3 py-2 shadow-sm ${pillBorderTone} ${titleBgTone}`}
                  aria-label={`${section.title} description`}
                >
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-700/80">
                    <Icon className={`h-4 w-4 ${titleTone}`} />
                  </span>
                  <h3 className={`text-sm font-semibold ${titleTone}`}>
                    {section.title}
                  </h3>
                  <Info className={`h-4 w-4 ${titleTone} opacity-70`} />
                </div>
              </TooltipTrigger>
              <TooltipContent>{section.description}</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
      <div className="mt-2 grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,420px)] lg:items-start">
        <div>
          <SectionEntries
            section={section}
            sectionIndex={index}
            control={control}
            register={register}
            analysis={analysis}
            analysisId={analysisId}
          />
        </div>
        <SectionAnalysisPanel section={section} sectionIndex={index} control={control} analysis={analysis} />
      </div>
    </div>
  );
}
