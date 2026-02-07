import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import AppHeader from "../components/AppHeader";
import FullScreenLoadingOverlay from "../components/FullScreenLoadingOverlay";
import ImportResumePdfCard from "../components/ImportResumePdfCard";
import { useDeleteResumeMutation, useResumesQuery } from "../api/hooks";
import { useSessionToken } from "../lib/sessionToken";
import { Button } from "../components/ui/button";

export default function ResumesPage() {
  const [isImporting, setIsImporting] = useState(false);
  const sessionToken = useSessionToken();
  const resumesQuery = useResumesQuery(sessionToken ?? undefined);
  const deleteResume = useDeleteResumeMutation();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return (
    <main className="min-h-screen">
      <AppHeader />
      <FullScreenLoadingOverlay
        open={isImporting || deleteResume.isPending}
        title={deleteResume.isPending ? "Deleting resume…" : "Importing resume…"}
      />
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-6 py-10">
        <aside className="rounded-3xl border border-slate-200 bg-white/70 p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950/40">
          <header className="flex flex-col gap-2">
            <p className="text-xs font-medium uppercase tracking-[0.35em] text-slate-500 dark:text-slate-400">
              Library
            </p>
            <h2 className="text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl dark:text-slate-50">
              Your resumes
            </h2>
            <p className="max-w-2xl text-sm text-slate-600 sm:text-base dark:text-slate-300">
              Pick a resume to continue editing, or import a new one.
            </p>
          </header>

          <div className="mt-5 flex flex-col gap-3">
            {resumesQuery.isLoading ? (
              <p className="text-sm text-slate-600 dark:text-slate-300">Loading…</p>
            ) : resumesQuery.data?.resumes?.length ? (
              resumesQuery.data.resumes.map((resume) => (
                <div
                  key={resume.resume_id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white/60 px-4 py-3 dark:border-slate-800 dark:bg-slate-950/40"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">
                      {resume.label}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {new Date(resume.created_at).toLocaleString()}
                      {resume.has_content ? "" : " • (incomplete)"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="destructive"
                      onClick={() => {
                        if (!sessionToken) {
                          toast.error("Please create a session first.");
                          return;
                        }
                        if (!confirm("Delete this resume? This cannot be undone.")) {
                          return;
                        }
                        const toastId = toast.loading("Deleting…");
                        deleteResume.mutate(
                          { token: sessionToken, resumeId: resume.resume_id },
                          {
                            onSuccess: () => {
                              toast.success("Deleted", { id: toastId });
                              queryClient.invalidateQueries({ queryKey: ["resumes", sessionToken] });
                            },
                            onError: (error) => {
                              toast.error(error.message, { id: toastId });
                            },
                          },
                        );
                      }}
                      disabled={!sessionToken || isImporting || deleteResume.isPending}
                    >
                      Delete
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => navigate(`/resumes/${resume.resume_id}`)}
                      disabled={!sessionToken || isImporting || deleteResume.isPending || !resume.has_content}
                    >
                      Open
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-600 dark:text-slate-300">No resumes yet.</p>
            )}
            {resumesQuery.isError ? (
              <p className="text-sm text-rose-600 dark:text-red-400">{resumesQuery.error.message}</p>
            ) : null}
          </div>
        </aside>

        <ImportResumePdfCard
          onImported={(data) => {
            if (sessionToken) {
              queryClient.invalidateQueries({ queryKey: ["resumes", sessionToken] });
            }
            navigate(`/resumes/${data.resume_id}`);
          }}
          onProcessingChange={setIsImporting}
        />
      </section>
    </main>
  );
}
