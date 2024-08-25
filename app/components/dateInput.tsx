import React, { useState, useEffect } from "react";
import clsx from "clsx";

interface DateInputProps {
  name: string;
  label: string;
  required?: boolean;
  min?: string;
  max?: string;
  onChange: (name: string, value: string) => void;
  error?: string;
  defaultValue?: string;
  className?: string;
  theme?: "light" | "dark";
}

export const DateInput: React.FC<DateInputProps> = ({
  name,
  label,
  required,
  min,
  max,
  onChange,
  error,
  defaultValue,
  className,
  theme = "dark", // Default to dark theme
}) => {
  const [value, setValue] = useState(defaultValue);
  const [isValid, setIsValid] = useState(true);

  useEffect(() => {
    setIsValid(!error);
  }, [error]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value;
    setValue(newValue);
    onChange(name, newValue);
  };

  const inputClasses = clsx(
    "w-full pl-3 pr-10 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-[#ff6b6b] focus:border-[#ff6b6b]",
    {
      "border-red-500": !isValid || error,
      "border-[#3a3f4f]": !error && theme === "dark",
      "border-gray-300": !error && theme === "light",
      "bg-white text-[#1a1e2e]": theme === "dark",
      "bg-gray-100 text-gray-900": theme === "light",
    },
    className
  );

  const labelClasses = clsx("text-sm font-medium", {
    "text-white": theme === "dark",
    "text-gray-700": theme === "light",
  });

  const iconColor = theme === "dark" ? "text-gray-400" : "text-gray-500";

  return (
    <div className="flex flex-col space-y-1">
      <label htmlFor={name} className={labelClasses}>
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="relative">
        <input
          type="date"
          id={name}
          name={name}
          value={value}
          required={required}
          min={min}
          max={max}
          onChange={handleChange}
          className={inputClasses}
        />
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          <svg
            className={`w-5 h-5 ${iconColor}`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      </div>
      {error && <p className="mt-1 text-sm text-red-400">{error}</p>}
    </div>
  );
};
