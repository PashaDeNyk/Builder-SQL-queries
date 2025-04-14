import { useDrag } from "react-dnd";
import { Table } from "../types";

export const DraggableTable = ({ table }: { table: Table }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: "TABLE",
    item: table,
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  return (
    <div
      ref={drag}
      className={`p-3 mb-2 cursor-move bg-gray-800 rounded-lg shadow-sm border border-gray-700
          ${
            isDragging ? "opacity-50" : "hover:border-blue-400"
          } transition-all`}
    >
      <span className="text-gray-200">{table.name}</span>
    </div>
  );
};
