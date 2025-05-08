import { memo, useCallback } from 'react';
import { useDrag } from "react-dnd";
import { Table } from "../types";

interface DraggableTableProps {
    table: Table;
    isSelected?: boolean;
    onSingleDragStart: () => void;
    onMultiDragStart: (table: Table) => void;
}

const DraggableTable = memo(({
    table,
    isSelected,
    onSingleDragStart,
    onMultiDragStart
}: DraggableTableProps) => {
    const [{ isDragging }, drag] = useDrag(() => ({
        type: "TABLE",
        item: () => {
            isSelected ? onMultiDragStart : onSingleDragStart();
            return { table };
        },
        collect: (monitor) => ({
            isDragging: monitor.isDragging(),
        }),
    }));

    return (
        <div
            ref={drag}
            className={`p-3 mb-2 cursor-move rounded-lg shadow-sm border-2
        ${isSelected
                    ? "bg-blue-600/30 border-blue-400"
                    : "bg-gray-800 border-gray-700 hover:border-blue-400"
                }
        ${isDragging ? "opacity-50" : ""} 
        transition-all`}
        >
            <span className="text-gray-200">{table.name}</span>
            <div className="mt-1 text-xs text-gray-400">
                {table.columns.length} columns
            </div>
        </div>
    );
}, (prev, next) => {
    // Реимплементация сравнения пропсов
    return prev.table === next.table &&
        prev.isSelected === next.isSelected &&
        prev.onSingleDragStart === next.onSingleDragStart &&
        prev.onMultiDragStart === next.onMultiDragStart;
});

export default DraggableTable;