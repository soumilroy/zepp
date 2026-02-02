import { useRef } from "react";
import { useDrag, useDrop } from "react-dnd";

import { ENTRY_TYPE, type EntryDragItem } from "./types";

type Args = {
  entryIndex: number;
  sectionIndex: number;
  enableDrag: boolean;
  onMove: (dragIndex: number, hoverIndex: number) => void;
};

export function useEntryDnD({
  entryIndex,
  sectionIndex,
  enableDrag,
  onMove,
}: Args) {
  const ref = useRef<HTMLDivElement | null>(null);

  const [{ isDragging }, drag] = useDrag(
    () => ({
      type: ENTRY_TYPE,
      item: { entryIndex, sectionIndex } satisfies EntryDragItem,
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
      hover: (item: EntryDragItem) => {
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
    [entryIndex, sectionIndex, enableDrag, onMove],
  );

  if (enableDrag) {
    drag(drop(ref));
  } else {
    drop(ref);
  }

  return { ref, isDragging };
}

