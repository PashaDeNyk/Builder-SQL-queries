interface TableSelectorProps {
  tables: string[];
  onSelect: (tables: string[]) => void;
}

export function TableSelector({ tables, onSelect }: TableSelectorProps) {
  return (
    <div className="mb-4">
      <h3 className="font-medium mb-2">Select Tables:</h3>
      <div className="flex flex-wrap gap-2">
        {tables.map((table) => (
          <button
            key={table}
            onClick={() => onSelect([table])}
            className="bg-gray-100 px-3 py-1 rounded hover:bg-gray-200"
          >
            {table}
          </button>
        ))}
      </div>
    </div>
  );
}
