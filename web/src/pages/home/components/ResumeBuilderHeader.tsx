export function ResumeBuilderHeader() {
  return (
    <header className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-gradient-to-br from-white via-slate-50 to-slate-100 p-6 shadow-sm dark:border-slate-800/70 dark:from-slate-900/70 dark:via-slate-950/80 dark:to-slate-950/30">
      <span className="inline-flex w-fit items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-700 dark:border-slate-700/70 dark:bg-slate-900/80 dark:text-slate-200">
        Resume Builder
      </span>
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl dark:text-slate-50">
          Resume editor
        </h2>
        <p className="max-w-2xl text-sm text-slate-600 sm:text-base dark:text-slate-300">
          Draft and refine your resume content with structured sections, rich
          text descriptions, and quick reordering.
        </p>
      </div>
    </header>
  );
}
