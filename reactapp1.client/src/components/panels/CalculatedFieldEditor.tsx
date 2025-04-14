import { useState } from "react";
import { CalculatedField } from "../../types";

interface CalculatedFieldEditorProps {
  fields: CalculatedField[];
  onAdd: (field: CalculatedField) => void;
  onRemove: (index: number) => void;
}

const CalculatedFieldEditor: React.FC<CalculatedFieldEditorProps> = ({
  fields,
  onAdd,
  onRemove,
}) => {
  const [expression, setExpression] = useState("");
  const [alias, setAlias] = useState("");
  const [error, setError] = useState("");

  const handleAdd = () => {
    if (!expression || !alias) {
      setError("Both fields are required");
      return;
    }
    if (fields.some((f) => f.alias === alias)) {
      setError("Alias must be unique");
      return;
    }

    onAdd({ expression, alias });
    setExpression("");
    setAlias("");
    setError("");
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <input
          value={expression}
          onChange={(e) => setExpression(e.target.value)}
          placeholder="Expression (e.g. A + B)"
          className="flex-1 p-1 border rounded bg-gray-800 border-gray-700 text-gray-200"
        />
        <input
          value={alias}
          onChange={(e) => setAlias(e.target.value)}
          placeholder="Alias"
          className="w-24 p-1 border rounded bg-gray-800 border-gray-700 text-gray-200"
        />
        <button
          onClick={handleAdd}
          className="px-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          Add
        </button>
      </div>
      {error && <div className="text-red-400 text-sm">{error}</div>}

      <div className="mt-2 space-y-1">
        {fields.map((field, index) => (
          <div
            key={index}
            className="flex items-center justify-between bg-gray-800 p-2 rounded"
          >
            <span className="font-mono text-gray-300">
              {field.alias}: {field.expression}
            </span>
            <button
              onClick={() => onRemove(index)}
              className="text-red-400 hover:text-red-500"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CalculatedFieldEditor;
