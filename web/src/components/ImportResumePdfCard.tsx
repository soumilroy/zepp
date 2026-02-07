import { useState } from "react";
import { FileUp, FileWarning } from "lucide-react";
import { toast } from "sonner";

import { useImportResumePdfMutation } from "../api/hooks";
import type { ResumeImportResponse } from "../api/types";
import { Button } from "./ui/button";

const MAX_PDF_BYTES = 10 * 1024 * 1024;
const SESSION_TOKEN_KEY = "session_token";

type Props = {
  onImported: (data: ResumeImportResponse) => void;
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

export default function ImportResumePdfCard({ onImported }: Props) {
  const importMutation = useImportResumePdfMutation();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  return (
    <aside className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
      <header className="mb-4">
        <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Import</p>
        <h2 className="text-2xl font-semibold text-white">Import resume PDF</h2>
        <p className="mt-2 text-sm text-slate-400">
          Upload a PDF (max 10 MB). We’ll parse it into the resume editor fields.
        </p>
      </header>

      <div className="flex flex-col gap-4">
        <label className="text-sm text-slate-300">
          <span className="flex items-center gap-2">
            <FileUp className="h-4 w-4 text-slate-400" />
            PDF file
          </span>
          <input
            className="mt-2 block w-full cursor-pointer rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-200 file:mr-3 file:rounded-md file:border-0 file:bg-slate-800 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-slate-200 hover:file:bg-slate-700"
            type="file"
            accept="application/pdf,.pdf"
            onChange={(event) => {
              const file = event.target.files?.[0] ?? null;
              setSelectedFile(file);
              setValidationError(file ? validatePdf(file) : null);
            }}
          />
        </label>

        {selectedFile ? (
          <p className="text-xs text-slate-400">
            Selected: <span className="text-slate-200">{selectedFile.name}</span> (
            {formatBytes(selectedFile.size)})
          </p>
        ) : null}

        {validationError ? (
          <p className="flex items-start gap-2 rounded-lg border border-rose-900/50 bg-rose-950/30 p-3 text-sm text-rose-200">
            <FileWarning className="mt-0.5 h-4 w-4" />
            <span>{validationError}</span>
          </p>
        ) : null}

        <Button
          type="button"
          className="gap-2"
          disabled={!selectedFile || Boolean(validationError) || importMutation.isPending}
          onClick={() => {
            if (!selectedFile) return;
            const token = sessionStorage.getItem(SESSION_TOKEN_KEY);
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
          <FileUp className="h-4 w-4" />
          {importMutation.isPending ? "Importing..." : "Import PDF"}
        </Button>
      </div>
    </aside>
  );
}

