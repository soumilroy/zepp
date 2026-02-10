import { useMemo } from "react";
import { AlertTriangle, Info, XCircle } from "lucide-react";
import { useWatch, type Control } from "react-hook-form";

import type { ResumeAnalysisIssue } from "../../../api/types";
import type { FormValues, ResumeSection, SectionAnalysis } from "../types";

type Props = {
  section: ResumeSection;
  sectionIndex: number;
  control: Control<FormValues>;
  analysis?: SectionAnalysis;
};

function severityRank(severity: ResumeAnalysisIssue["severity"]) {
  if (severity === "error") return 3;
  if (severity === "warning") return 2;
  return 1;
}

function worstSeverity(issues: ResumeAnalysisIssue[]) {
  return issues.reduce<ResumeAnalysisIssue["severity"]>(
    (acc, issue) => (severityRank(issue.severity) > severityRank(acc) ? issue.severity : acc),
    "info",
  );
}

function toneClasses(severity: ResumeAnalysisIssue["severity"]) {
  if (severity === "error") {
    return "border-rose-200 bg-rose-50 text-rose-950 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-50";
  }
  if (severity === "warning") {
    return "border-amber-200 bg-amber-50 text-amber-950 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-50";
  }
  return "border-sky-200 bg-sky-50 text-sky-950 dark:border-sky-900/50 dark:bg-sky-950/30 dark:text-sky-50";
}

function SeverityIcon({ severity }: { severity: ResumeAnalysisIssue["severity"] }) {
  if (severity === "error") return <XCircle className="h-4 w-4" aria-hidden="true" />;
  if (severity === "warning") return <AlertTriangle className="h-4 w-4" aria-hidden="true" />;
  return <Info className="h-4 w-4" aria-hidden="true" />;
}

function issueKey(issue: ResumeAnalysisIssue, idx: number) {
  return `${issue.sectionKey}:${issue.itemId ?? "none"}:${issue.fieldKey ?? "none"}:${issue.category}:${idx}`;
}

export function SectionAnalysisPanel({ section, sectionIndex, control, analysis }: Props) {
  const watchedItems =
    useWatch({
      control,
      name: `sections.${sectionIndex}.items`,
    }) ?? [];
  const hasEntries = watchedItems.length > 0;

  const entryTitleById = useMemo(() => {
    const primaryKey = section.fields[0]?.key;
    const map = new Map<string, string>();
    for (const item of watchedItems) {
      const itemId = (item as { id?: string }).id;
      if (!itemId) continue;
      const values = (item as { values?: Record<string, string> }).values ?? {};
      const primaryValue = primaryKey ? values[primaryKey]?.trim() : "";
      map.set(itemId, primaryValue || `${section.title} entry`);
    }
    return map;
  }, [section.fields, section.title, watchedItems]);

  const orderedEntryIds = useMemo(() => {
    if (!analysis) return [];
    const idsInForm = watchedItems
      .map((item) => (item as { id?: string }).id)
      .filter(Boolean) as string[];
    const idsWithAnalysis = Object.keys(analysis.entries ?? {});
    return [
      ...idsInForm.filter((id) => idsWithAnalysis.includes(id)),
      ...idsWithAnalysis.filter((id) => !idsInForm.includes(id)),
    ];
  }, [analysis, watchedItems]);

  if (!analysis) {
    return (
      <aside className="rounded-lg border border-slate-200 bg-white/70 p-5 text-sm text-slate-700 shadow-sm dark:border-slate-800 dark:bg-slate-950/40 dark:text-slate-200">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">
          Analysis
        </p>
        <p className="mt-2">
          Click <span className="font-semibold">Analyze</span> to get recruiter-style feedback, typos/grammar checks,
          and improvements for this section.
        </p>
      </aside>
    );
  }

  return (
    <aside className="space-y-4 lg:sticky lg:top-20">
      <div className="rounded-lg border border-indigo-200 bg-indigo-50/70 p-5 text-sm text-indigo-950 shadow-sm dark:border-indigo-900/50 dark:bg-indigo-950/30 dark:text-indigo-50">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-indigo-700 dark:text-indigo-200">
          Analysis summary
        </p>
        <p className="mt-2 whitespace-pre-wrap">{analysis.summary}</p>
      </div>

      {analysis.sectionIssues.length ? (
        <div className="space-y-2">
          {analysis.sectionIssues.map((issue, idx) => (
            <div key={issueKey(issue, idx)} className={`rounded-lg border p-3 text-sm ${toneClasses(issue.severity)}`}>
              <div className="flex items-start gap-2">
                <SeverityIcon severity={issue.severity} />
                <div className="min-w-0">
                  <p className="font-semibold">{issue.message}</p>
                  <p className="mt-1 opacity-90">{issue.suggestion}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : null}

      {orderedEntryIds.length ? (
        <div className="space-y-3">
          {orderedEntryIds.map((entryId) => {
            const entry = analysis.entries[entryId];
            const fieldIssues = Object.entries(entry.fieldIssues).flatMap(([fieldKey, issues]) =>
              issues.map((issue) => ({ fieldKey, issue })),
            );
            const allIssues = [...entry.entryIssues, ...fieldIssues.map((row) => row.issue)];
            const severity = worstSeverity(allIssues);
            const title = entryTitleById.get(entryId) ?? `${section.title} entry`;

            return (
              <div key={entryId} className={`rounded-lg border p-4 ${toneClasses(severity)}`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">{title}</p>
                    <p className="mt-1 text-xs opacity-80">
                      {allIssues.length} issue{allIssues.length === 1 ? "" : "s"}
                    </p>
                  </div>
                  <div className="mt-0.5">
                    <SeverityIcon severity={severity} />
                  </div>
                </div>

                {entry.entryIssues.length ? (
                  <div className="mt-3 space-y-2">
                    {entry.entryIssues.map((issue, idx) => (
                      <div
                        key={issueKey(issue, idx)}
                        className="rounded-lg border border-black/5 bg-white/60 p-3 text-sm text-slate-950 dark:border-white/10 dark:bg-black/20 dark:text-slate-50"
                      >
                        <p className="font-semibold">{issue.message}</p>
                        <p className="mt-1 opacity-90">{issue.suggestion}</p>
                      </div>
                    ))}
                  </div>
                ) : null}

                {fieldIssues.length ? (
                  <div className="mt-3 space-y-2">
                    {fieldIssues.map(({ fieldKey, issue }, idx) => {
                      const label = section.fields.find((field) => field.key === fieldKey)?.label ?? fieldKey;
                      return (
                        <div
                          key={issueKey(issue, idx)}
                          className="rounded-lg border border-black/5 bg-white/60 p-3 text-sm text-slate-950 dark:border-white/10 dark:bg-black/20 dark:text-slate-50"
                        >
                          <p className="text-xs font-semibold uppercase tracking-[0.3em] opacity-70">{label}</p>
                          <p className="mt-2 font-semibold">{issue.message}</p>
                          <p className="mt-1 opacity-90">{issue.suggestion}</p>
                          {issue.replacement ? (
                            <p className="mt-2 rounded-lg bg-white/70 px-3 py-2 text-xs text-slate-950 dark:bg-black/30 dark:text-slate-50">
                              Suggested text: {issue.replacement}
                            </p>
                          ) : null}
                        </div>
                      );
                    })}
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      ) : hasEntries ? (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50/70 p-5 text-sm text-emerald-950 shadow-sm dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-50">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-700 dark:text-emerald-200">
            Looks good
          </p>
          <p className="mt-2">No section-level or entry-level issues were returned for this section.</p>
        </div>
      ) : null}
    </aside>
  );
}
