export interface Column {
    ColumnName: string;
    ColumnType: string;
};

export type Table = {
  name: string;
  columns: Column[];
  data: Record<string, unknown>[];
};

export type JoinType = "INNER" | "LEFT" | "RIGHT" | "FULL" | "CROSS";

export type Join = {
  leftTable: string;
  leftColumn: string;
  rightTable: string;
  rightColumn: string;
  type: JoinType;
};

export type CalculatedField = {
  expression: string;
  alias: string;
};

export type Condition = {
  column: string;
  operator: string;
  value: string;
};
