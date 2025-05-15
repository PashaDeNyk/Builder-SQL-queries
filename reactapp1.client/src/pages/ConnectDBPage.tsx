import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import api from "../api/client";
import DBConnectionField from "../components/DBConnectionField";
import { setError, setLoading, setTables } from "../redux/tableSlice";
import { fetchTables } from "../api/tables";
import { loadTablesFromDB, saveTables } from "../api/db";
import { useEffect } from "react";

interface DBConfig {
    host: string;
    port: number;
    database: string;
    username: string;
    password: string;
}

interface ApiResponse {
    data: string;
    [key: string]: any;
}

interface Table {
    name: string;
    columns: Array<{ name: string; type: string }>;
    data: Array<Record<string, any>>;
}

export default function ConnectDBPage() {
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    const { register, handleSubmit, formState: { errors } } = useForm<DBConfig>();

    const processTablesResponse = (response: string): Table[] => {
        try {
            const wrappedJson = `{${response}}`;

            const correctedData = wrappedJson
                .replace(/\n/g, "\\n")
                .replace(/\r/g, "\\r")
                .replace(/\t/g, "\\t")
                .replace(/,\s*]/g, ']')
                .replace(/,\s*}/g, '}')
                .replace(/:([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})/g, ':"$1"')
            console.log(correctedData);
            return JSON.parse(correctedData);
        } catch (error) {
            console.error("Data processing error:", error);
            throw new Error("Invalid server response");
        }
    };

    const loadTables = async () => {
        try {
            const response = await fetchTables();
            const tables = processTablesResponse(response);

            await saveTables(tables);
            queryClient.setQueryData(["userTables"], tables);
            return true;
        } catch (error) {
            console.error("Error loading tables:", error);
            return false;
        }
    };

    const { mutate: connectDB, isPending: isConnecting } = useMutation({
        mutationFn: (config: DBConfig) => api.post("/database/connect", config),
        onSuccess: async () => {
            const success = await loadTables();
            if (success) navigate('/');
        },
        onError: (error: Error) => {
            console.error("Connection error:", error);
        }
    });

    useEffect(() => {
        const loadInitialData = async () => {
            try {
                const savedTables = await loadTablesFromDB();
                if (savedTables.length > 0) {
                    queryClient.setQueryData(["userTables"], savedTables);
                }
            } catch (error) {
                console.error("Error loading initial data:", error);
            }
        };

        loadInitialData();
    }, [queryClient]);

    return (
        <div className="flex items-center justify-center">
            <form
                onSubmit={handleSubmit((data) => connectDB(data))}
                className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md space-y-6"
            >
                <div className="text-center">
                    <h2 className="text-3xl font-bold text-gray-900">
                        Подключение к базе данных
                    </h2>
                </div>

                <div className="space-y-4">
                    <DBConnectionField
                        name="host"
                        label="Хост"
                        register={register}
                        required
                        error={errors.host}
                    />

                    <DBConnectionField
                        name="port"
                        label="Порт"
                        type="number"
                        register={register}
                        required
                        error={errors.port}
                        min={1}
                        max={65535}
                    />

                    <DBConnectionField
                        name="username"
                        label="Имя пользователя"
                        register={register}
                        required
                        error={errors.username}
                    />

                    <DBConnectionField
                        name="database"
                        label="Название БД"
                        register={register}
                        required
                        error={errors.database}
                    />

                    <DBConnectionField
                        name="password"
                        label="Пароль"
                        type="password"
                        register={register}
                        required
                        error={errors.password}
                    />
                </div>

                <button
                    type="submit"
                    disabled={isConnecting}
                    className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium rounded-lg transition-colors duration-200"
                >
                    {isConnecting ? "Подключение..." : "Подключиться"}
                </button>
            </form>
        </div>
    );
}