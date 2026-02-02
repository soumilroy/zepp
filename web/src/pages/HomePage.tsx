import { useMemo } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { toast } from "sonner";

import AppHeader from "../components/AppHeader";
import { ResumeBuilderHeader } from "./home/components/ResumeBuilderHeader";
import { SectionCard } from "./home/components/SectionCard";
import { defaultValues, resumeSectionMap } from "./home/resume";
import type { FormValues } from "./home/types";

export default function HomePage() {
  const { control, handleSubmit, register } = useForm<FormValues>({
    defaultValues,
  });

  const { fields } = useFieldArray({
    control,
    name: "sections",
  });

  const orderedSections = useMemo(
    () =>
      fields.map((field) => ({
        id: field.id,
        sectionKey: field.sectionKey,
        section: resumeSectionMap[field.sectionKey],
      })),
    [fields],
  );

  const onSubmit = (data: FormValues) => {
    console.log("Resume form values", data);
  };
  const onSave = handleSubmit(onSubmit);
  const onEntrySave = handleSubmit((data) => {
    onSubmit(data);
    toast.success("Saved entry");
  });

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50">
      <AppHeader />
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-6 py-10">
        <ResumeBuilderHeader />
        <div className="flex w-full flex-col gap-6 lg:flex-row">
          <div className="w-full lg:w-[70%]">
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
                    />
                  ) : null,
                )}
              </form>
            </DndProvider>
          </div>
          <div className="w-full lg:w-[30%]" />
        </div>
      </section>
    </main>
  );
}