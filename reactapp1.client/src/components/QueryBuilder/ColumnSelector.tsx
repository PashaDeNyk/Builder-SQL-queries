interface Column {
  name: string;
  type: string;
}

interface ColumnSelectorProps {
  table: string;
  columns: Column[];
  onSelect: (columns: string[]) => void;
}

export function ColumnSelector({
  table,
  columns,
  onSelect,
}: ColumnSelectorProps) {
  return (
    <div className="mb-4">
      <h3 className="font-medium mb-2">Columns in {table}:</h3>
      <div className="flex flex-wrap gap-2">
        {columns.map((column) => (
          <button
            key={`${table}.${column.name}`}
            onClick={() => onSelect([`${table}.${column.name}`])}
            className="bg-blue-100 px-3 py-1 rounded hover:bg-blue-200"
          >
            {column.name} ({column.type})
          </button>
        ))}
      </div>
    </div>
  );
}
