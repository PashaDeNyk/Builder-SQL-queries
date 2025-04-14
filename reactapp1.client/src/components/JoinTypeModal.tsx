import React from "react";
import { Connection } from "reactflow";
import { JoinType } from "../types";

interface JoinTypeModalProps {
  visible: boolean;
  connection: Connection | null;
  onConfirm: (type: JoinType) => void;
  onCancel: () => void;
}

const JoinTypeModal = ({
  visible,
  connection,
  onConfirm,
  onCancel,
}: JoinTypeModalProps) => {
  if (!visible) return null;

  const joinTypes: JoinType[] = ["INNER", "LEFT", "RIGHT", "FULL", "CROSS"];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-800 p-6 rounded-lg space-y-4 border border-gray-700">
        <h3 className="text-lg font-semibold text-gray-200">
          Select JOIN Type
        </h3>
        <div className="grid grid-cols-2 gap-2">
          {joinTypes.map((type) => (
            <button
              key={type}
              onClick={() => onConfirm(type)}
              className="p-2 bg-gray-700 hover:bg-gray-600 rounded text-gray-200"
            >
              {type} JOIN
            </button>
          ))}
        </div>
        <button onClick={onCancel} className="text-red-400 hover:text-red-500">
          Cancel
        </button>
      </div>
    </div>
  );
};

export default JoinTypeModal;
