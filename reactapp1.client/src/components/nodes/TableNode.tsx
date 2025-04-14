import { Handle, Position } from "reactflow";
import { Table } from "../../types";

interface TableNodeProps {
  id: string;
  data: Table;
  selected?: boolean;
}

export const TableNode = ({ id, data, selected }: TableNodeProps) => {
  const onDelete = () => {
    window.dispatchEvent(new CustomEvent("deleteTable", { detail: { id } }));
  };

  return (
    <div
      className={`bg-gray-800 p-4 rounded-lg shadow-lg border-2 ${
        selected ? "border-blue-400" : "border-gray-700"
      } relative group`}
    >
      <button
        onClick={onDelete}
        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
      >
        ×
      </button>
      <div className="font-bold text-lg mb-2 text-blue-400">{data.name}</div>
      <div className="space-y-1">
        {data.columns.map((column, index) => (
          <div
            key={index}
            className="flex items-center p-1 hover:bg-gray-700 rounded relative"
          >
            <Handle
              type="target"
              position={Position.Left}
              id={`${data.name}|${column.name}`}
              style={{ top: "50%", background: "#555" }}
            />
            <span className="text-sm font-mono text-gray-200">
              {column.name}
            </span>
            <span className="ml-2 text-xs text-gray-400">{column.type}</span>
            <Handle
              type="source"
              position={Position.Right}
              id={`${data.name}|${column.name}`}
              style={{ top: "50%", background: "#555" }}
            />
          </div>
        ))}
      </div>
    </div>
  );
};
