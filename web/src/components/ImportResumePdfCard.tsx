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
  if (file.type !== "application/pdf") {
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
    <aside className="rounded-3xl border border-slate-200 bg-gradient-to-br from-white via-slate-50 to-slate-100 p-6 shadow-sm dark:border-slate-800 dark:from-slate-900/70 dark:via-slate-950/70 dark:to-slate-950/30">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <header className="flex flex-col gap-2">
          <p className="text-xs font-medium uppercase tracking-[0.35em] text-slate-500 dark:text-slate-400">
            Import
          </p>
          <h2 className="text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl dark:text-slate-50">
            Import your resume PDF
          </h2>
          <p className="max-w-2xl text-sm text-slate-600 sm:text-base dark:text-slate-300">
            Upload a text-based PDF (max 10 MB). We’ll convert it into editable sections.
          </p>
        </header>

        <div className="flex w-full flex-col gap-3 lg:w-[420px]">
          <label
            className={`group relative flex w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border border-dashed bg-white/70 px-4 py-5 text-center transition dark:bg-slate-950/40 ${disabled
              ? "cursor-not-allowed border-slate-200 opacity-70 dark:border-slate-800"
              : "border-slate-300 hover:border-slate-400 dark:border-slate-700 dark:hover:border-slate-500"
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
            <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200">
              <FileText className="h-5 w-5 text-slate-600 dark:text-slate-300" />
              <span className="text-sm font-semibold">
                {selectedFile ? "Change PDF" : "Choose a PDF"}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">PDF only • up to 10 MB</p>
          </label>

          {selectedFile ? (
            <div className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white/60 px-4 py-3 dark:border-slate-800 dark:bg-slate-950/50">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-slate-900 dark:text-slate-200">{selectedFile.name}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{formatBytes(selectedFile.size)}</p>
              </div>
              <FileUp className="h-4 w-4 text-slate-500 dark:text-slate-400" aria-hidden="true" />
            </div>
          ) : null}

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
      </div>
    </aside>
  );
}
