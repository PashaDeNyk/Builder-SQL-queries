import { useState, useCallback } from "react";
import { mockDatabase } from "../../constants/Mock";
import { Table } from "../../types";
import DraggableTable from "../DraggableTable";

interface SidebarProps {
    availableTables: Table[];
    onLogout?: () => void;
}

const Sidebar = ({ availableTables, onLogout }: SidebarProps) => {
    const tables = availableTables ? (availableTables.tables ? availableTables.tables : availableTables) : mockDatabase.tables;
    const [selectedTables, setSelectedTables] = useState<Table[]>([]);

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
        <div className="p-4 bg-gray-800 border-r border-gray-700 h-full flex flex-col">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-blue-400">Tables</h2>
                <button
                    onClick={onLogout}
                    className="text-gray-300 hover:text-blue-400 transition-colors text-sm"
                >
                    Logout
                </button>
            </div>
            <div className="flex-1 overflow-y-auto">
                <div className="flex xl:flex-col flex-row flex-wrap gap-2 xl:space-y-0 space-y-2">
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
        </div>
    );
};

export default Sidebar;
