import React from "react";
import { useDrop } from "react-dnd";
import { Table } from "../types";

interface WorkspaceDropAreaProps {
    onDropItem: (tables: Table[], offset: { x: number; y: number } | null) => void;
    children: React.ReactNode;
}

export const WorkspaceDropArea: React.FC<WorkspaceDropAreaProps> = ({
    onDropItem,
    children,
}) => {
    const [, dropRef] = useDrop(() => ({
        accept: "TABLE",
        drop: (item: { tables: Table[] }, monitor) => {
            const offset = monitor.getSourceClientOffset();

            if (item.tables && Array.isArray(item.tables)) {
                onDropItem(item.tables, offset);
            }
            else if (item.table) {
                onDropItem([item.table], offset);
            }
        },
    }));

    return (
        <div ref={dropRef} className="flex-1 relative">
            {children}
        </div>
    );
};