import { useState, useCallback } from "react";
import { mockDatabase } from "../../constants/Mock";
import { Table } from "../../types";
import DraggableTable from "../DraggableTable";

interface SidebarProps {
    availableTables: Table[];
}

const Sidebar = ({ availableTables }: SidebarProps) => {
    const tables = availableTables ? availableTables : mockDatabase.tables;
    console.log(tables);
    const [selectedTables, setSelectedTables] = useState<Table[]>([]);

    // Мемоизированные колбэки
    const handleMultiDragStart = useCallback(() => {
        setSelectedTables([]);
    }, []);

    const handleSingleDragStart = useCallback((table: Table) => {
        setSelectedTables(prev =>
            prev.filter(t => t.name !== table.name)
        );
    }, []);

    const handleTableClick = useCallback((table: Table) => {
        setSelectedTables(prev =>
            prev.some(t => t.name === table.name)
                ? prev.filter(t => t.name !== table.name)
                : [...prev, table]
        );
    }, []);

    return (
        <div className="w-64 p-4 bg-gray-800 border-r border-gray-700 overflow-y-auto">
            <h2 className="text-xl font-bold mb-4 text-blue-400">Tables</h2>
            <div className="space-y-2">
                {tables.map((table) => (
                    <div
                        key={table.name}
                        onClick={() => handleTableClick(table)}
                        className={`cursor-pointer transition-colors rounded-lg p-2 ${selectedTables.some(t => t.name === table.name)
                                ? "bg-blue-600/30 border-2 border-blue-400"
                                : "hover:bg-gray-700/50"
                            }`}
                    >
                        <DraggableTable
                            table={table}
                            isSelected={selectedTables.includes(table)}
                            onMultiDragStart={handleMultiDragStart}
                            onSingleDragStart={() => handleSingleDragStart(table)}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Sidebar;