import { useRef } from "react";
import { useDrag, useDrop } from "react-dnd";
import { ENTRY_TYPE } from "./types";
export function useEntryDnD({ entryIndex, sectionIndex, enableDrag, onMove, }) {
    const ref = useRef(null);
    const [{ isDragging }, drag] = useDrag(() => ({
        type: ENTRY_TYPE,
        item: { entryIndex, sectionIndex },
        canDrag: enableDrag,
        collect: (monitor) => ({
            isDragging: monitor.isDragging(),
        }),
    }), [entryIndex, sectionIndex, enableDrag]);
    const [, drop] = useDrop(() => ({
        accept: ENTRY_TYPE,
        hover: (item) => {
            if (!ref.current)
                return;
            if (!enableDrag)
                return;
            if (item.sectionIndex !== sectionIndex)
                return;
            const dragIndex = item.entryIndex;
            const hoverIndex = entryIndex;
            if (dragIndex === hoverIndex)
                return;
            onMove(dragIndex, hoverIndex);
            item.entryIndex = hoverIndex;
        },
    }), [entryIndex, sectionIndex, enableDrag, onMove]);
    if (enableDrag) {
        drag(drop(ref));
    }
    else {
        drop(ref);
    }
    return { ref, isDragging };
}
