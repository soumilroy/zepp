import { useEffect, useRef, useState } from "react";
import {
  useFieldArray,
  useWatch,
  type Control,
  type UseFormRegister,
} from "react-hook-form";
import { Plus } from "lucide-react";

import { buildPrefilledValues } from "../resume";
import type { FormValues, ResumeSection } from "../types";
import { DraggableEntry } from "./DraggableEntry";
import { Button } from "../../../components/ui/button";

export type SectionEntriesProps = {
  section: ResumeSection;
  sectionIndex: number;
  control: Control<FormValues>;
  register: UseFormRegister<FormValues>;
  onSave: () => void;
  onDelete?: (sectionIndex: number, entryIndex: number) => void;
};

export function SectionEntries({
  section,
  sectionIndex,
  control,
  register,
  onSave,
  onDelete,
}: SectionEntriesProps) {
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
  const prevLengthRef = useRef(fields.length);

  useEffect(() => {
    if (fields.length > 0 && !isOpen) {
      setIsOpen(true);
    }
  }, [fields.length, isOpen]);

  useEffect(() => {
    if (fields.length > prevLengthRef.current) {
      const newestId = fields[fields.length - 1]?.id;
      if (newestId) {
        setExpandedIds((prev) =>
          prev.includes(newestId) ? prev : [...prev, newestId],
        );
      }
    }
    prevLengthRef.current = fields.length;
  }, [fields]);

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

  const handleRemove = (itemIndex: number, entryId: string) => {
    setExpandedIds((prev) => prev.filter((entry) => entry !== entryId));
    remove(itemIndex);
    onDelete?.(sectionIndex, itemIndex);
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
            <p className="text-sm text-slate-600 dark:text-slate-500">No entries yet.</p>
          ) : (
            fields.map((field, itemIndex) => {
              const isExpanded = expandedIds.includes(field.id);
              const primaryKey = section.fields[0]?.key;
              const primaryValue = primaryKey
                ? watchedItems[itemIndex]?.values?.[primaryKey]?.trim()
                : "";
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
                  onSave={onSave}
                  entryTitle={entryTitle}
                  isExpanded={isExpanded}
                  enableDrag={!isSingleEntry}
                  allowDelete
                  onToggle={toggleExpanded}
                  onRemove={() => handleRemove(itemIndex, field.id)}
                  onMove={move}
                />
              );
            })
          )}
        </div>
      </div>
      <div className="pt-3">
        <Button
          type="button"
          onClick={handleAdd}
          variant="default"
          size="sm"
          disabled={isAddDisabled}
        >
          <span className="inline-flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add {section.title}
          </span>
        </Button>
      </div>
    </div>
  );
}
