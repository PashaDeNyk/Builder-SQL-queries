import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import api from "../api/client";
import DBConnectionField from "../components/DBConnectionField";
import { fetchTables } from "../api/tables";
import { useNavigate } from "react-router-dom";

interface DBConfig {
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
}

export default function ConnectDBPage() {

    const queryClient = useQueryClient();
    const navigate = useNavigate();
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<DBConfig>();



    const loadTables = async () => {
        try {
            const response = await fetchTables();

            let correctedData = response
            //возможно понадобится
            //    // 1. Заменяем все кавычки
            //    .replace(/'/g, '"')
            //    // 2. Исправляем ключи объектов
            //    .replace(/(\w+):/g, '"$1":')
            //    // 3. Фиксим UUID
            //    .replace(/"([a-f0-9]{8})-([a-f0-9]{4})-([a-f0-9]{4})-([a-f0-9]{4})-([a-f0-9]{12})"/g, '"$1-$2-$3-$4-$5"')
            //    // 4. Исправляем даты
            //    .replace(/"(\d{2}\.\d{2}\.\d{4})\s+"0":"(\d{2})":(\d{2})"/g, '"$1 $2:$3:00"')
            //    // 5. Убираем лишние символы
            //    .replace(/",\s*"/g, '","')
            //    // 6. Экранируем переносы строк
            //    .replace(/\n/g, "\\n")
            //    // 7. Фиксим структуру объектов
            //    .replace(/"},{\"name\"/g, '},{"name"')
            //    // 8. Убираем лишние запятые
            //    .replace(/,\s*}/g, '}')
            //    .replace(/,\s*]/g, ']');

            //const fullJson = `{${correctedData}}`;
            //console.log("Validated JSON:", fullJson);

            const parsedData = JSON.parse(fullJson);
            queryClient.setQueryData(["userTables"], parsedData.tables);
            return true;
        } catch (error) {
            console.error("Error loading tables:", error);
            // Обработка ошибки
            return false;
        }
    };

  const { mutate, isPending, isError } = useMutation({
    mutationFn: (config: DBConfig) => api.post("/database/connect", config),
      onSuccess: async () => {
          const flag = await loadTables();
          console.log('succeed');
          if (flag) navigate('/');
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
