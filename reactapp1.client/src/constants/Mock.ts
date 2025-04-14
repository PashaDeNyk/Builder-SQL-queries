import { Table } from "../types";

export const mockDatabase: { tables: Table[] } = {
  tables: [
    {
      name: "users",
      columns: [
        { name: "id", type: "integer" },
        { name: "name", type: "varchar" },
        { name: "email", type: "varchar" },
      ],
      data: [
        { id: 1, name: "John", email: "john@example.com" },
        { id: 2, name: "Jane", email: "jane@example.com" },
      ],
    },
    {
      name: "orders",
      columns: [
        { name: "order_id", type: "integer" },
        { name: "user_id", type: "integer" },
        { name: "amount", type: "decimal" },
      ],
      data: [
        { order_id: 1, user_id: 1, amount: 100.5 },
        { order_id: 2, user_id: 2, amount: 200.75 },
      ],
    },
  ],
};
