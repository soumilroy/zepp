import { useEffect, useRef } from "react";

type Props = {
  open: boolean;
  title?: string;
  message?: string;
};

export default function FullScreenLoadingOverlay({
  open,
  title = "Working…",
  message = "Uploading and parsing your PDF. Please don’t close this tab.",
}: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    const previousActive = document.activeElement as HTMLElement | null;
    document.body.style.overflow = "hidden";
    previousActive?.blur();
    queueMicrotask(() => containerRef.current?.focus());
    return () => {
      document.body.style.overflow = previousOverflow;
      previousActive?.focus?.();
    };
  }, [open]);

  if (!open) return null;

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-busy="true"
      tabIndex={-1}
    >
      <div className="mx-6 w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-slate-950">
        <div className="flex items-center gap-4">
          <div
            className="h-10 w-10 animate-spin rounded-full border-2 border-slate-300 border-t-slate-900 dark:border-slate-700 dark:border-t-slate-100"
            aria-hidden="true"
          />
          <div className="flex flex-col gap-1">
            <p className="text-base font-semibold text-slate-900 dark:text-slate-50">{title}</p>
            <p className="text-sm text-slate-600 dark:text-slate-400">{message}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
