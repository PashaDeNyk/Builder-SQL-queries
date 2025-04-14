import { useState } from "react";

interface JoinBuilderProps {
  tables: string[];
  onJoinCreate: (join: any) => void;
}

export function JoinBuilder({ tables, onJoinCreate }: JoinBuilderProps) {
  const [joinType, setJoinType] = useState("INNER");
  const [leftTable, setLeftTable] = useState("");
  const [rightTable, setRightTable] = useState("");
  const [leftColumn, setLeftColumn] = useState("");
  const [rightColumn, setRightColumn] = useState("");

  const handleAddJoin = () => {
    onJoinCreate({
      type: joinType,
      leftTable,
      rightTable,
      leftColumn,
      rightColumn,
    });
    // Сброс полей
    setLeftTable("");
    setRightTable("");
    setLeftColumn("");
    setRightColumn("");
  };

  return (
    <div className="bg-blue-400 p-4 rounded-lg shadow">
      <h3 className="font-semibold mb-2">Create Join:</h3>
      <div className="grid grid-cols-2 gap-4">
        <select
          value={joinType}
          onChange={(e) => setJoinType(e.target.value)}
          className="p-2 border rounded"
        >
          <option>INNER</option>
          <option>LEFT</option>
          <option>RIGHT</option>
          <option>FULL</option>
        </select>

        <div className="space-y-2">
          <select
            value={leftTable}
            onChange={(e) => setLeftTable(e.target.value)}
            className="p-2 border rounded w-full"
          >
            <option value="">Select Left Table</option>
            {tables.map((table) => (
              <option key={table} value={table}>
                {table}
              </option>
            ))}
          </select>

          <select
            value={leftColumn}
            onChange={(e) => setLeftColumn(e.target.value)}
            className="p-2 border rounded w-full"
            disabled={!leftTable}
          >
            <option value="">Select Left Column</option>
            {/* Здесь нужно добавить реальные колонки для выбранной таблицы */}
          </select>
        </div>

        <div className="space-y-2">
          <select
            value={rightTable}
            onChange={(e) => setRightTable(e.target.value)}
            className="p-2 border rounded w-full"
          >
            <option value="">Select Right Table</option>
            {tables.map((table) => (
              <option key={table} value={table}>
                {table}
              </option>
            ))}
          </select>

          <select
            value={rightColumn}
            onChange={(e) => setRightColumn(e.target.value)}
            className="p-2 border rounded w-full"
            disabled={!rightTable}
          >
            <option value="">Select Right Column</option>
            {/* Здесь нужно добавить реальные колонки для выбранной таблицы */}
          </select>
        </div>

        <button
          onClick={handleAddJoin}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          disabled={!leftTable || !rightTable}
        >
          Add Join Condition
        </button>
      </div>
    </div>
  );
}
