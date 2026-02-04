export function ResumeBuilderHeader() {
  return (
    <header className="flex flex-col gap-3 rounded-2xl border border-slate-800/70 bg-gradient-to-br from-slate-900/70 via-slate-950/80 to-slate-950/30 p-6 shadow-sm">
      <span className="inline-flex w-fit items-center gap-2 rounded-full border border-slate-700/70 bg-slate-900/80 px-3 py-1 text-xs font-medium text-slate-200">
        Resume Builder
      </span>
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-semibold tracking-tight text-slate-50 sm:text-3xl">
          Resume editor
        </h2>
        <p className="max-w-2xl text-sm text-slate-300 sm:text-base">
          Draft and refine your resume content with structured sections, rich
          text descriptions, and quick reordering.
        </p>
      </div>
    </header>
  );
}

