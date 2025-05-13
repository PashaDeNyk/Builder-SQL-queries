import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import api from "../api/client";
import DBConnectionField from "../components/DBConnectionField";
import { fetchTables } from "../api/tables";

interface DBConfig {
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
}

export default function ConnectDBPage() {

  const queryClient = useQueryClient();
  const {
    register,
    handleSubmit,
    formState: { errors },
    } = useForm<DBConfig>();



    const loadTables = async () => {
        try {
            const tables = await fetchTables();
            console.log(tables);
            queryClient.setQueryData(["userTables"], tables);
            console.log()
        } catch (error) {
            console.error("Error loading tables:", error);
            // Обработка ошибки
        }
    };

  const { mutate, isPending, isError } = useMutation({
    mutationFn: (config: DBConfig) => api.post("/database/connect", config),
      onSuccess: async () => {
          await loadTables();
          console.log('succeed');
      },
      onError: (error) => { console.error(error); }
  });

  return (
    <div className="flex items-center justify-center">
      <form
        onSubmit={handleSubmit((data) => mutate(data))}
        className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md space-y-6"
      >
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">
            Подключение к базе данных
          </h2>
        </div>

        {isError && (
          <div className="p-3 bg-red-50 text-red-700 rounded-lg">
            Ошибка подключения. Проверьте параметры и повторите попытку
          </div>
        )}

        <div className="space-y-4">
          <DBConnectionField
            name="host"
            label="Хост"
            register={register} //строка подключения
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
          disabled={isPending}
          className="w-full mt-5 py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium rounded-lg transition-colors"
        >
          {isPending ? "Подключение..." : "Подключиться"}
        </button>
      </form>
    </div>
  );
}
