import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Table {
    name: string;
    columns: Array<{ name: string; type: string }>;
    data: Array<Record<string, any>>;
}

interface TablesState {
    tables: Table[];
    loading: boolean;
    error: string | null;
}

const initialState: TablesState = {
    tables: [],
    loading: false,
    error: null
};

const tablesSlice = createSlice({
    name: 'tables',
    initialState,
    reducers: {
        setTables(state, action: PayloadAction<Table[]>) {
            state.tables = action.payload;
            state.error = null;
        },
        setLoading(state, action: PayloadAction<boolean>) {
            state.loading = action.payload;
        },
        setError(state, action: PayloadAction<string>) {
            state.error = action.payload;
            state.tables = [];
        },
        resetTables(state) {
            state.tables = [];
            state.error = null;
            state.loading = false;
        }
    }
});

export const { setTables, setLoading, setError, resetTables } = tablesSlice.actions;
export default tablesSlice;