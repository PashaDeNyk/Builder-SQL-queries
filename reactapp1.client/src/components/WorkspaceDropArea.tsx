// /src/components/WorkspaceDropArea.tsx
import React from "react";
import { useDrop } from "react-dnd";

interface WorkspaceDropAreaProps {
    onDropItem: (item: any, offset: { x: number; y: number } | null) => void;
    children: React.ReactNode;
}

export const WorkspaceDropArea = ({
    onDropItem,
    children,
}: WorkspaceDropAreaProps) => {
    const [, dropRef] = useDrop(() => ({
        accept: "TABLE",
        drop(item, monitor) {
            const offset = monitor.getSourceClientOffset();
            onDropItem(item, offset);
        },
    }));

    return (
        <div ref={dropRef} className="flex-1 relative">
            {children}
        </div>
    );
};
