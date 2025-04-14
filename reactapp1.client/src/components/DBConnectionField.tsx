import { useState } from "react";
import { UseFormRegister, FieldError } from "react-hook-form";
import { FiEye } from "react-icons/fi";

interface DBConnectionFieldProps {
  name: string;
  label: string;
  type?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  register: UseFormRegister<any>;
  required?: boolean;
  error?: FieldError;
  min?: number;
  max?: number;
}

export default function DBConnectionField({
  name,
  label,
  type = "text",
  register,
  required = false,
  error,
  min,
  max,
}: DBConnectionFieldProps) {
  const [shown, setShown] = useState(false);
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      <div className="relative text-gray-700">
        <input
          {...register(name, {
            required,
            min,
            max,
            valueAsNumber: type === "number",
          })}
          className={`w-full px-4 py-2.5 border ${
            error
              ? "border-red-300 focus:ring-red-500 focus:border-red-500"
              : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
          } rounded-lg shadow-sm transition-colors focus:ring-2 focus:outline-none`}
          type={type === "password" ? (shown ? "text" : "password") : type}
          min={min}
          max={max}
        />
        {type === "password" && (
          <FiEye
            className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer"
            onClick={() => setShown(!shown)}
          />
        )}
      </div>
      {error && (
        <p className="mt-1.5 text-sm text-red-600">
          {error.type === "required"
            ? "Обязательное поле"
            : error.message || "Некорректное значение"}
        </p>
      )}
    </div>
  );
}
