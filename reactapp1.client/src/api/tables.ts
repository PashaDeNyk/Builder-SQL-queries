import { Column } from "../types";
import api from "./client";

export interface Table {
    tableName: string;
    columns: Column[];
    data?: any[];
}

export const fetchTables = async (): Promise<Table[]> => {
    const response = await api.get("/api/user/tables");
    if (!response) throw new Error("Network response was not ok");
    return response.data.json();
};