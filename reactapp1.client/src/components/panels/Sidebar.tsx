import { mockDatabase } from "../../constants/Mock";
import { DraggableTable } from "../DraggableTable";

const Sidebar: React.FC = () => {
  return (
    <div className="w-64 p-4 bg-gray-800 border-r border-gray-700 overflow-y-auto">
      <h2 className="text-xl font-bold mb-4 text-blue-400">Tables</h2>
      {mockDatabase.tables.map((table) => (
        <DraggableTable key={table.name} table={table} />
      ))}
    </div>
  );
};

export default Sidebar;
