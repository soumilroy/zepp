import { useEffect, useMemo, useRef, useState } from "react";
import {
  useForm,
  useFieldArray,
  useWatch,
  Controller,
  type Control,
  type UseFormRegister,
} from "react-hook-form";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import {
  ChevronDown,
  ChevronUp,
  BadgeCheck,
  Briefcase,
  FolderKanban,
  GraduationCap,
  GripVertical,
  Heart,
  Languages,
  Plus,
  Trash2,
  User,
  Users,
  Wrench,
  Info,
  type LucideIcon,
} from "lucide-react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

import AppHeader from "../components/AppHeader";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../components/ui/tooltip";

const resumeStructure = [
  {
    title: "Personal Information",
    description: "Add your personal information here",
    entry_type: "single",
    icon: User,
    fields: [
      {
        label: "First Name",
        type: "text",
        width: "1/2",
      },
      {
        label: "Last Name",
        type: "text",
        width: "1/2",
      },
      {
        label: "Email",
        type: "text",
        width: "1/2",
      },
      {
        label: "Phone",
        type: "text",
        width: "1/2",
      },
      {
        label: "Address",
        type: "text",
        width: "full",
      },
      {
        label: "City",
        type: "text",
        width: "1/2",
      },
      {
        label: "State",
        type: "text",
        width: "1/2",
      },
      {
        label: "Zip Code",
        type: "text",
        width: "1/2",
      },
      {
        label: "Country",
        type: "text",
        width: "1/2",
      },
      {
        label: "LinkedIn",
        type: "text",
        width: "1/2",
      },
      {
        label: "GitHub",
        type: "text",
        width: "1/2",
      },
    ],
  },
  {
    title: "Education",
    description: "Add your education here",
    entry_type: "multiple",
    icon: GraduationCap,
    fields: [
      {
        label: "School",
        type: "text",
        width: "full",
      },
      {
        label: "Degree",
        type: "text",
        width: "1/2",
      },
      {
        label: "Field of Study",
        type: "text",
        width: "1/2",
      },
      {
        label: "Start Date",
        type: "date",
        width: "1/4",
      },
      {
        label: "End Date",
        type: "date",
        width: "1/4",
      },

      {
        label: "Grade",
        type: "number",
        width: "1/4",
      },
      {
        label: "GPA",
        type: "number",
        width: "1/4",
      },
      {
        label: "Description",
        type: "text",
        editor: "quill",
        fullWidth: true,
        width: "full",
      },
    ],
  },
  {
    title: "Work Experience",
    description: "Add your work experience here",
    entry_type: "multiple",
    icon: Briefcase,
    fields: [
      {
        label: "Company",
        type: "text",
        width: "1/2",
      },
      {
        label: "Position",
        type: "text",
        width: "1/2",
      },
      {
        label: "Start Date",
        type: "date",
        width: "1/2",
      },
      {
        label: "End Date",
        type: "date",
        width: "1/2",
      },
      {
        label: "Description",
        type: "text",
        editor: "quill",
        fullWidth: true,
        width: "full",
      },
      {
        label: "Responsibilities",
        type: "text",
        width: "full",
      },
      {
        label: "Skills",
        type: "text",
        width: "full",
      },
    ],
  },
  {
    title: "Skills",
    description: "Add your skills here",
    entry_type: "multiple",
    icon: Wrench,
    fields: [
      {
        label: "Skill",
        type: "text",
        width: "full",
      },
    ],
  },
  {
    title: "Projects",
    description: "Add your projects here",
    entry_type: "multiple",
    icon: FolderKanban,
    fields: [
      {
        label: "Project Name",
        type: "text",
        width: "1/2",
      },
      {
        label: "Description",
        type: "text",
        editor: "quill",
        fullWidth: true,
        width: "full",
      },
    ],
  },
  {
    title: "References",
    description: "Add your references here",
    entry_type: "multiple",
    icon: Users,
    fields: [
      {
        label: "Reference Name",
        type: "text",
        width: "full",
      },
    ],
  },
  {
    title: "Certifications",
    description: "Add your certifications here",
    entry_type: "multiple",
    icon: BadgeCheck,
    fields: [
      {
        label: "Certification Name",
        type: "text",
        width: "full",
      },
    ],
  },
  {
    title: "Languages",
    description: "Add your languages here",
    entry_type: "multiple",
    icon: Languages,
    fields: [
      {
        label: "Language",
        type: "text",
        width: "1/2",
      },
    ],
  },
  {
    title: "Interests",
    description: "Add your interests here",
    entry_type: "multiple",
    icon: Heart,
    fields: [
      {
        label: "Interest",
        type: "text",
        width: "1/2",
      },
    ],
  },
];

const ENTRY_TYPE = "RESUME_ENTRY";

type ResumeField = {
  key: string;
  label: string;
  type: string;
  editor?: "quill";
  fullWidth?: boolean;
  width?: "full" | "1/2" | "1/3" | "1/4";
};

type ResumeSection = {
  key: string;
  title: string;
  description: string;
  entryType: "single" | "multiple";
  icon: LucideIcon;
  fields: ResumeField[];
};

type FormValues = {
  sections: {
    sectionKey: string;
    items: {
      values: Record<string, string>;
    }[];
  }[];
};

const toKey = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");

const resumeSections: ResumeSection[] = resumeStructure.map((section) => ({
  key: toKey(section.title),
  title: section.title,
  description: section.description,
  entryType: section.entry_type === "single" ? "single" : "multiple",
  icon: section.icon,
  fields: section.fields.map((field) => ({
    key: toKey(field.label),
    label: field.label,
    type: field.type,
    editor: field.editor === "quill" ? "quill" : undefined,
    fullWidth: field.fullWidth === true,
    width:
      field.width === "1/2" ||
        field.width === "1/3" ||
        field.width === "1/4" ||
        field.width === "full"
        ? field.width
        : undefined,
  })),
}));

const resumeSectionMap = Object.fromEntries(
  resumeSections.map((section) => [section.key, section]),
) as Record<string, ResumeSection>;

const defaultValues: FormValues = {
  sections: resumeSections.map((section) => ({
    sectionKey: section.key,
    items: [],
  })),
};

const buildPrefilledValues = (section: ResumeSection) => {
  const values: Record<string, string> = Object.fromEntries(
    section.fields.map((field) => [field.key, ""]),
  );
  const firstField = section.fields.find((field) => field.type === "text");
  if (firstField) {
    values[firstField.key] = `New ${section.title}`;
  }
  return values;
};

const buildSummary = (section: ResumeSection, values?: Record<string, string>) =>
  section.fields.slice(1, 3).map((field) => {
    const value = values?.[field.key]?.trim();
    return `${field.label}: ${value || "—"}`;
  });

type SectionEntriesProps = {
  section: ResumeSection;
  sectionIndex: number;
  control: Control<FormValues>;
  register: UseFormRegister<FormValues>;
};

type DraggableEntryProps = {
  entryId: string;
  entryIndex: number;
  section: ResumeSection;
  sectionIndex: number;
  control: Control<FormValues>;
  register: UseFormRegister<FormValues>;
  entryTitle: string;
  summary: string[];
  isExpanded: boolean;
  enableDrag: boolean;
  allowDelete: boolean;
  onToggle: (id: string) => void;
  onRemove: (index: number) => void;
  onMove: (dragIndex: number, hoverIndex: number) => void;
};

function DraggableEntry({
  entryId,
  entryIndex,
  section,
  sectionIndex,
  control,
  register,
  entryTitle,
  summary,
  isExpanded,
  enableDrag,
  allowDelete,
  onToggle,
  onRemove,
  onMove,
}: DraggableEntryProps) {
  const ref = useRef<HTMLDivElement | null>(null);

  const [{ isDragging }, drag] = useDrag(
    () => ({
      type: ENTRY_TYPE,
      item: { entryIndex, sectionIndex },
      canDrag: enableDrag,
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
    }),
    [entryIndex, sectionIndex, enableDrag],
  );

  const [, drop] = useDrop(
    () => ({
      accept: ENTRY_TYPE,
      hover: (item: { entryIndex: number; sectionIndex: number }) => {
        if (!ref.current) return;
        if (!enableDrag) return;
        if (item.sectionIndex !== sectionIndex) return;
        const dragIndex = item.entryIndex;
        const hoverIndex = entryIndex;
        if (dragIndex === hoverIndex) return;
        onMove(dragIndex, hoverIndex);
        item.entryIndex = hoverIndex;
      },
    }),
    [entryIndex, sectionIndex, onMove],
  );

  if (enableDrag) {
    drag(drop(ref));
  } else {
    drop(ref);
  }

  return (
    <div
      ref={ref}
      className="rounded-lg border border-slate-800 bg-slate-900/70"
      style={{ opacity: isDragging ? 0.6 : 1 }}
    >
      <div className="flex items-start justify-between gap-4 px-4 py-3">
        <button
          type="button"
          onClick={() => onToggle(entryId)}
          className="flex flex-1 items-start gap-3 text-left"
        >
          {enableDrag ? (
            <span className="mt-0.5 rounded border border-slate-700 px-1 py-2 text-[10px] uppercase tracking-wide text-slate-300">
              <GripVertical className="h-4 w-4" />
            </span>
          ) : null}
          <div>
            <p className="text-sm font-semibold text-slate-100">{entryTitle}</p>
            <p className="text-xs text-slate-400">{summary.join(" • ")}</p>
          </div>
        </button>
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1 text-xs text-slate-400">
            {isExpanded ? "Collapse" : "Expand"}
            {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          </span>
          {allowDelete ? (
            <button
              type="button"
              onClick={() => onRemove(entryIndex)}
              className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-slate-200"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Delete
            </button>
          ) : null}
        </div>
      </div>
      <div
        className={`transition-[max-height] duration-300 ease-in-out ${isExpanded ? "max-h-[1200px]" : "max-h-0"
          } overflow-hidden`}
      >
        <div className="grid gap-3 border-t border-slate-800 px-4 py-4 md:grid-cols-12">
          {section.fields.map((fieldDef) => (
            <label
              key={fieldDef.key}
              className={`flex flex-col gap-2 text-sm text-slate-200 ${fieldDef.fullWidth
                ? "md:col-span-12"
                : fieldDef.width === "1/4"
                  ? "md:col-span-3"
                  : fieldDef.width === "1/3"
                    ? "md:col-span-4"
                    : fieldDef.width === "1/2"
                      ? "md:col-span-6"
                      : "md:col-span-12"
                }`}
            >
              <span>{fieldDef.label}</span>
              {fieldDef.editor === "quill" ? (
                <Controller
                  control={control}
                  name={`sections.${sectionIndex}.items.${entryIndex}.values.${fieldDef.key}`}
                  render={({ field }) => (
                    <div className="resume-quill rounded-md border border-slate-700 bg-slate-950 text-slate-100">
                      <ReactQuill
                        theme="snow"
                        value={field.value || ""}
                        onChange={field.onChange}
                        placeholder={fieldDef.label}
                      />
                    </div>
                  )}
                />
              ) : (
                <input
                  type={fieldDef.type}
                  className="rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100"
                  placeholder={fieldDef.label}
                  {...register(
                    `sections.${sectionIndex}.items.${entryIndex}.values.${fieldDef.key}`,
                  )}
                />
              )}
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}

function SectionEntries({ section, sectionIndex, control, register }: SectionEntriesProps) {
  const { fields, append, remove, move } = useFieldArray({
    control,
    name: `sections.${sectionIndex}.items`,
  });
  const watchedItems =
    useWatch({
      control,
      name: `sections.${sectionIndex}.items`,
    }) ?? [];
  const [isOpen, setIsOpen] = useState(fields.length > 0);
  const [expandedIds, setExpandedIds] = useState<string[]>([]);

  useEffect(() => {
    if (fields.length > 0 && !isOpen) {
      setIsOpen(true);
    }
  }, [fields.length, isOpen]);

  const isSingleEntry = section.entryType === "single";
  const isAddDisabled = isSingleEntry && fields.length > 0;

  const handleAdd = () => {
    setIsOpen(true);
    if (isAddDisabled) return;
    append({ values: buildPrefilledValues(section) });
  };

  const toggleExpanded = (id: string) => {
    setExpandedIds((prev) =>
      prev.includes(id) ? prev.filter((entry) => entry !== id) : [...prev, id],
    );
  };

  return (
    <div className="mt-4">
      <div className="flex flex-wrap items-center justify-between gap-3" />
      <div
        className={`transition-[max-height] duration-300 ease-in-out ${isOpen ? "mt-4 max-h-[2000px]" : "mt-0 max-h-0"
          } overflow-hidden`}
      >
        <div className="flex flex-col gap-3">
          {fields.length === 0 ? (
            <p className="text-sm text-slate-500">No entries yet.</p>
          ) : (
            fields.map((field, itemIndex) => {
              const isExpanded = expandedIds.includes(field.id);
              const summary = buildSummary(section, watchedItems[itemIndex]?.values);
              const primaryKey = section.fields[0]?.key;
              const primaryValue =
                primaryKey ? watchedItems[itemIndex]?.values?.[primaryKey]?.trim() : "";
              const entryTitle = primaryValue || `${section.title} entry`;
              return (
                <DraggableEntry
                  key={field.id}
                  entryId={field.id}
                  entryIndex={itemIndex}
                  section={section}
                  sectionIndex={sectionIndex}
                  control={control}
                  register={register}
                  entryTitle={entryTitle}
                  summary={summary}
                  isExpanded={isExpanded}
                  enableDrag={!isSingleEntry}
                  allowDelete
                  onToggle={toggleExpanded}
                  onRemove={remove}
                  onMove={move}
                />
              );
            })
          )}
        </div>
      </div>
      <div className="pt-3">
        <button
          type="button"
          onClick={handleAdd}
          className={`rounded-md border border-dashed border-slate-600 px-3 py-1.5 text-sm text-slate-200 ${isAddDisabled ? "cursor-not-allowed opacity-50" : "hover:border-slate-400"
            }`}
          disabled={isAddDisabled}
        >
          <span className="inline-flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add {section.title}
          </span>
        </button>
      </div>
    </div>
  );
}

type SectionCardProps = {
  section: ResumeSection;
  index: number;
  control: Control<FormValues>;
  register: UseFormRegister<FormValues>;
};

function SectionCard({ section, index, control, register }: SectionCardProps) {
  const Icon = section.icon;
  const titleTone =
    {
      "personal-information": "text-sky-200",
      education: "text-emerald-200",
      "work-experience": "text-amber-200",
      skills: "text-violet-200",
      projects: "text-cyan-200",
      references: "text-rose-200",
      certifications: "text-lime-200",
      languages: "text-indigo-200",
      interests: "text-fuchsia-200",
    }[section.key] ?? "text-slate-100";
  const pillBorderTone =
    {
      "personal-information": "border-sky-700/30",
      education: "border-emerald-700/30",
      "work-experience": "border-amber-700/30",
      skills: "border-violet-700/30",
      projects: "border-cyan-700/30",
      references: "border-rose-700/30",
      certifications: "border-lime-700/30",
      languages: "border-indigo-700/30",
      interests: "border-fuchsia-700/30",
    }[section.key] ?? "border-slate-800/30";

  return (
    <div
      className={`flex flex-col gap-2 ${index === 0 ? "" : "border-t border-slate-800/70 pt-6"}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div
                  className={`inline-flex items-center gap-2 rounded-full border bg-slate-800/70 pl-1 pr-3 py-1 ${pillBorderTone}`}
                  aria-label={`${section.title} description`}
                >
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-slate-700/80">
                    <Icon className="h-4 w-4 text-slate-200" />
                  </span>
                  <h3 className={`text-sm font-semibold ${titleTone}`}>{section.title}</h3>
                  <Info className="h-4 w-4 text-slate-400" />
                </div>
              </TooltipTrigger>
              <TooltipContent>{section.description}</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
      <SectionEntries
        section={section}
        sectionIndex={index}
        control={control}
        register={register}
      />
    </div>
  );
}

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

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50">
      <AppHeader />
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-6 py-10">
        <header className="flex flex-col gap-3 rounded-2xl border border-slate-800/70 bg-gradient-to-br from-slate-900/70 via-slate-950/80 to-slate-950/30 p-6 shadow-sm">
          <span className="inline-flex w-fit items-center gap-2 rounded-full border border-slate-700/70 bg-slate-900/80 px-3 py-1 text-xs font-medium text-slate-200">
            Resume Builder
          </span>
          <div className="flex flex-col gap-2">
            <h2 className="text-2xl font-semibold tracking-tight text-slate-50 sm:text-3xl">
              Resume editor
            </h2>
            <p className="max-w-2xl text-sm text-slate-300 sm:text-base">
              Draft and refine your resume content with structured sections, rich text
              descriptions, and quick reordering.
            </p>
          </div>
        </header>
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
                />
              ) : null,
            )}
            <div className="flex justify-end">
              <button
                type="submit"
                className="rounded-md bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-950"
              >
                Save resume
              </button>
            </div>
          </form>
        </DndProvider>
      </section>
    </main>
  );
}