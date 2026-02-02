type Args = {
    entryIndex: number;
    sectionIndex: number;
    enableDrag: boolean;
    onMove: (dragIndex: number, hoverIndex: number) => void;
};
export declare function useEntryDnD({ entryIndex, sectionIndex, enableDrag, onMove, }: Args): {
    ref: import("react").MutableRefObject<HTMLDivElement | null>;
    isDragging: boolean;
};
export {};
