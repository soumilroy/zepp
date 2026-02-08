import { useEffect, useMemo } from "react";
import { ArrowLeft, Trash2 } from "lucide-react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useForm, useFieldArray } from "react-hook-form";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

import AppHeader from "../components/AppHeader";
import FullScreenLoadingOverlay from "../components/FullScreenLoadingOverlay";
import {
  useDeleteResumeMutation,
  useResumeQuery,
  useResumeSchemaQuery,
  useSaveResumeMutation,
} from "../api/hooks";
import { useSessionToken } from "../lib/sessionToken";
import { Button } from "../components/ui/button";
import { SectionCard } from "./home/components/SectionCard";
import {
  buildDefaultValues,
  buildResumeSectionMap,
  buildResumeSections,
} from "./home/resume";
import type { FormValues } from "./home/types";

export default function ResumeEditorPage() {
  const sessionToken = useSessionToken();
  const navigate = useNavigate();
  const params = useParams<{ resumeId: string }>();
  const resumeId = params.resumeId ?? null;
  const resumeSchemaQuery = useResumeSchemaQuery();
  const resumeQuery = useResumeQuery(sessionToken ?? undefined, resumeId);
  const saveResume = useSaveResumeMutation();
  const deleteResume = useDeleteResumeMutation();
  const queryClient = useQueryClient();

  const { control, handleSubmit, register, reset } = useForm<FormValues>({
    defaultValues: { sections: [] },
  });

  const { fields } = useFieldArray({
    control,
    name: "sections",
  });

  const resumeSections = useMemo(
    () => (resumeSchemaQuery.data ? buildResumeSections(resumeSchemaQuery.data) : []),
    [resumeSchemaQuery.data],
  );

  const resumeSectionMap = useMemo(
    () => buildResumeSectionMap(resumeSections),
    [resumeSections],
  );

  const orderedSections = useMemo(
    () =>
      fields.map((field) => ({
        id: field.id,
        sectionKey: field.sectionKey,
        section: resumeSectionMap[field.sectionKey],
      })),
    [fields, resumeSectionMap],
  );

  useEffect(() => {
    if (resumeQuery.data) {
      reset({ sections: resumeQuery.data.sections } as unknown as FormValues);
      return;
    }
    if (resumeSchemaQuery.data) {
      reset(buildDefaultValues(resumeSections));
    }
  }, [resumeQuery.data, resumeSchemaQuery.data, reset, resumeSections]);

  useEffect(() => {
    if (resumeQuery.isError) {
      toast.error(resumeQuery.error.message);
    }
    if (resumeSchemaQuery.isError) {
      toast.error(resumeSchemaQuery.error.message);
    }
  }, [resumeQuery.error, resumeQuery.isError, resumeSchemaQuery.error, resumeSchemaQuery.isError]);

  const onSubmit = (data: FormValues) => {
    console.log("Resume form values", data);
  };
  type EntrySaveVariant = "success" | "info" | "warning";

  const persistEntries = (
    data: FormValues,
    {
      loadingMessage,
      successMessage,
      successVariant = "success",
    }: {
      loadingMessage: string;
      successMessage: string;
      successVariant?: EntrySaveVariant;
    },
  ) => {
    onSubmit(data);
    if (!sessionToken || !resumeId) {
      toast.error("Please create a session first.");
      return;
    }

    const toastId = toast.loading(loadingMessage);
    saveResume.mutate(
      { token: sessionToken, resumeId, body: { sections: data.sections } },
      {
        onSuccess: () => {
          const successToast =
            successVariant === "warning"
              ? toast.warning
              : successVariant === "info"
                ? toast.info
                : toast.success;
          successToast(successMessage, { id: toastId });
          queryClient.invalidateQueries({ queryKey: ["resumes", sessionToken] });
        },
        onError: (error) => {
          toast.error(error.message, { id: toastId });
        },
      },
    );
  };

  const onEntrySave = handleSubmit((data) => {
    persistEntries(data, {
      loadingMessage: "Saving…",
      successMessage: "Saved",
    });
  });

  const onEntryDelete = handleSubmit((data) => {
    persistEntries(data, {
      loadingMessage: "Deleting entry…",
      successMessage: "Entry deleted",
      successVariant: "warning",
    });
  });

  const onSaveAll = () => onEntrySave();
  const handleEntryDelete = (_sectionIndex: number, _entryIndex: number) => {
    onEntryDelete();
  };

  const onDelete = () => {
    if (!sessionToken || !resumeId) {
      toast.error("Please create a session first.");
      return;
    }
    if (!confirm("Delete this resume? This cannot be undone.")) {
      return;
    }
    const toastId = toast.loading("Deleting…");
    deleteResume.mutate(
      { token: sessionToken, resumeId },
      {
        onSuccess: () => {
          toast.success("Deleted", { id: toastId });
          queryClient.invalidateQueries({ queryKey: ["resumes", sessionToken] });
          navigate("/resumes");
        },
        onError: (error) => {
          toast.error(error.message, { id: toastId });
        },
      },
    );
  };

  return (
    <main className="min-h-screen">
      <AppHeader />
      <FullScreenLoadingOverlay
        open={resumeSchemaQuery.isFetching || resumeQuery.isFetching || deleteResume.isPending}
        title={
          deleteResume.isPending
            ? "Deleting resume…"
            : resumeSchemaQuery.isFetching
              ? "Loading editor…"
              : "Loading resume…"
        }
        message={
          deleteResume.isPending
            ? "Removing your resume. Please don’t close this tab."
            : "Loading your resume data. Please don’t close this tab."
        }
      />
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-6 py-10">
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="text-xs font-medium uppercase tracking-[0.35em] text-slate-500 dark:text-slate-400">
              Editing
            </p>
            <p className="truncate text-lg font-semibold text-slate-950 dark:text-slate-50">
              {resumeQuery.data?.resume_id ?? resumeId ?? "Resume"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onDelete}
              disabled={resumeQuery.isFetching || saveResume.isPending || deleteResume.isPending}
            >
              <Trash2 className="mr-2 h-4 w-4" aria-hidden="true" />
              Delete
            </Button>
            <Button asChild type="button" variant="secondary" size="sm" disabled={resumeQuery.isFetching}>
              <Link to="/resumes">
                <ArrowLeft className="mr-2 h-4 w-4" aria-hidden="true" />
                Back to resumes
              </Link>
            </Button>
          </div>
        </div>

        {resumeSchemaQuery.isError ? (
          <aside className="rounded-3xl border border-rose-200 bg-rose-50 p-6 text-rose-800 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-200">
            {resumeSchemaQuery.error.message}
          </aside>
        ) : null}

        {resumeQuery.isError ? (
          <aside className="rounded-3xl border border-rose-200 bg-rose-50 p-6 text-rose-800 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-200">
            {resumeQuery.error.message}
          </aside>
        ) : null}

        <DndProvider backend={HTML5Backend}>
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            {orderedSections.map(({ id, section }, index) =>
              section ? (
                <SectionCard
                  key={id}
                  index={index}
                  section={section}
                  control={control}
                  register={register}
                  onSave={onEntrySave}
                  onDelete={handleEntryDelete}
                />
              ) : null,
            )}
          </form>
        </DndProvider>
      </section>
    </main>
  );
}
