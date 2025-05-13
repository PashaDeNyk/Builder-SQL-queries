import { Column } from "../types";
import api from "./client";

export interface Table {
    name: string;
    columns: Column[];
    data: Record<string, any>[];
}

export const fetchTables = async (): Promise<Table[]> => {
    const response = await api.get("/database/read-database");
    if (!response) throw new Error("Network response was not ok");
    return response.data;
};