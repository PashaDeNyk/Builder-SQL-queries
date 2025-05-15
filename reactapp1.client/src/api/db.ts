const DB_NAME = "DatabaseConfig";
const STORE_NAME = "tables";
const DB_VERSION = 1;

export interface Table {
    name: string;
    columns: Array<{ name: string; type: string }>;
    data: Array<Record<string, any>>;
}

const openDB = () => {
    return new Promise<IDBDatabase>((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = (event) => {
            const db = (event.target as IDBOpenDBRequest).result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME, { keyPath: "id" });
            }
        };

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
};

export const saveTables = async (tables: Table[]): Promise<boolean> => {
    try {
        const db = await openDB();
        const transaction = db.transaction(STORE_NAME, "readwrite");
        const store = transaction.objectStore(STORE_NAME);
        store.put({ id: "current", tables });
        return new Promise((resolve) => {
            transaction.oncomplete = () => resolve(true);
            transaction.onerror = () => resolve(false);
        });
    } catch (error) {
        console.error("Error saving tables:", error);
        return false;
    }
};

export const loadTablesFromDB = async (): Promise<Table[]> => {
    try {
        const db = await openDB();
        const transaction = db.transaction(STORE_NAME, "readonly");
        const store = transaction.objectStore(STORE_NAME);
        const request = store.get("current");

        return new Promise((resolve, reject) => {
            request.onsuccess = () => resolve(request.result?.tables || []);
            request.onerror = () => reject(request.error);
        });
    } catch (error) {
        console.error("Error loading tables:", error);
        return [];
    }
};

export const clearDatabase = async () => {
    try {
        const db = await openDB();
        const transaction = db.transaction(STORE_NAME, "readwrite");
        const store = transaction.objectStore(STORE_NAME);
        store.clear();
        return new Promise((resolve) => {
            transaction.oncomplete = () => resolve(true);
        });
    } catch (error) {
        console.error("Error clearing database:", error);
        return false;
    }
};