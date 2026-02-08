import { useEffect, useState } from "react";
import { FileText, FileUp, FileWarning, Sparkles } from "lucide-react";
import { toast } from "sonner";

import { useImportResumePdfMutation } from "../api/hooks";
import type { ResumeImportResponse } from "../api/types";
import { getSessionToken } from "../lib/sessionToken";
import { Button } from "./ui/button";

const MAX_PDF_BYTES = 10 * 1024 * 1024;

type Props = {
  onImported: (data: ResumeImportResponse) => void;
  onProcessingChange?: (processing: boolean) => void;
};

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  return `${(kb / 1024).toFixed(1)} MB`;
}

function validatePdf(file: File): string | null {
  const filename = file.name?.toLowerCase?.() ?? "";
  const isPdfName = filename.endsWith(".pdf");
  const isPdfType =
    file.type === "application/pdf" ||
    file.type === "application/x-pdf";
  if (!isPdfName && !isPdfType) {
    return "Only PDF files are supported.";
  }
  if (file.size > MAX_PDF_BYTES) {
    return `PDF file is too large (max 10 MB). Selected: ${formatBytes(file.size)}.`;
  }
  return null;
}

export default function ImportResumePdfCard({ onImported, onProcessingChange }: Props) {
  const importMutation = useImportResumePdfMutation();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    onProcessingChange?.(importMutation.isPending);
  }, [importMutation.isPending, onProcessingChange]);

  const disabled = importMutation.isPending;

  return (
    <section className="max-w-xl relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950/60">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(99,102,241,0.12),_transparent_55%)] dark:bg-[radial-gradient(circle_at_top,_rgba(99,102,241,0.18),_transparent_55%)]" />
      <header className="flex flex-col gap-4">
        <div className="flex items-start gap-3">
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-600 dark:bg-indigo-400/10 dark:text-indigo-300">
            <FileText className="h-5 w-5" />
          </span>
          <div className="space-y-0.5">
            <h2 className="text-xl font-semibold tracking-tight text-slate-950 dark:text-slate-50">
              Get started
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Upload your resume to get started.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-3 text-xs text-slate-500 dark:text-slate-400">
          <span className="rounded-full border border-slate-200 bg-white/70 px-3 py-1 dark:border-slate-800 dark:bg-slate-900/50">
            PDF only
          </span>
          <span className="rounded-full border border-slate-200 bg-white/70 px-3 py-1 dark:border-slate-800 dark:bg-slate-900/50">
            Max 10 MB
          </span>
          <span className="rounded-full border border-slate-200 bg-white/70 px-3 py-1 dark:border-slate-800 dark:bg-slate-900/50">
            Best with selectable text
          </span>
        </div>
      </header>

      <div className="flex w-full flex-col gap-4 mt-6">
        <label
          className={`group relative flex w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border border-dashed bg-slate-50 px-4 py-6 text-center transition dark:bg-slate-900/40 ${disabled
            ? "cursor-not-allowed border-slate-200 opacity-70 dark:border-slate-800"
            : "border-slate-300 hover:border-indigo-400 hover:bg-indigo-50/40 dark:border-slate-700 dark:hover:border-indigo-400 dark:hover:bg-indigo-500/10"
            }`}
        >
          <input
            className="sr-only"
            type="file"
            accept="application/pdf,.pdf"
            disabled={disabled}
            onChange={(event) => {
              const file = event.target.files?.[0] ?? null;
              setSelectedFile(file);
              setValidationError(file ? validatePdf(file) : null);
            }}
          />
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm dark:bg-slate-950">
            <FileUp className="h-4 w-4 text-slate-600 dark:text-slate-300" />
          </span>
          <div className="space-y-1">
            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              {selectedFile ? "Change PDF" : "Drop your PDF here"}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              or click to browse • PDF only • up to 10 MB
            </p>
          </div>
        </label>

        {selectedFile ? (
          <div className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm dark:border-slate-800 dark:bg-slate-950/70">
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-slate-900 dark:text-slate-200">
                {selectedFile.name}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {formatBytes(selectedFile.size)} • Ready to import
              </p>
            </div>
            <FileUp className="h-4 w-4 text-slate-500 dark:text-slate-400" aria-hidden="true" />
          </div>
        ) : (
          <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white/70 px-4 py-3 text-xs text-slate-500 dark:border-slate-800 dark:bg-slate-950/50 dark:text-slate-400">
            <Sparkles className="h-4 w-4 text-indigo-500/80 dark:text-indigo-300" />
            We’ll auto-detect sections like experience, education, and skills.
          </div>
        )}

        {validationError ? (
          <p className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-200">
            <FileWarning className="mt-0.5 h-4 w-4" />
            <span>{validationError}</span>
          </p>
        ) : null}

        <Button
          type="button"
          className="gap-2"
          disabled={!selectedFile || Boolean(validationError) || disabled}
          onClick={() => {
            if (!selectedFile) return;
            const token = getSessionToken();
            if (!token) {
              toast.error("Please create a session first.");
              return;
            }
            const localValidationError = validatePdf(selectedFile);
            if (localValidationError) {
              setValidationError(localValidationError);
              return;
            }

            importMutation.mutate(
              { token, file: selectedFile },
              {
                onSuccess: (data) => {
                  onProcessingChange?.(false);
                  onImported(data);
                  toast.success("Imported resume from PDF");
                },
                onError: (error) => {
                  toast.error(error.message);
                },
              }
            );
          }}
        >
          <Sparkles className="h-4 w-4" />
          {importMutation.isPending ? "Importing…" : "Import and fill editor"}
        </Button>
      </div>
    </section>
  );
}
