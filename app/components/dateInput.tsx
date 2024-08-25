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
}

export const DateInput: React.FC<DateInputProps> = ({
  name,
  label,
  required,
  min,
  max,
  onChange,
  error,
  defaultValue 
}) => {
  const [value, setValue] = useState(defaultValue);
  const [isValid, setIsValid] = useState(true);

  useEffect(() => {
    // Update isValid when the error prop changes
    setIsValid(!error);
  }, [error]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value;
    setValue(newValue);
    onChange(name, newValue);
  };

  const inputClasses = clsx(
    "w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500",
    {
      "border-red-500": !isValid || error,
      "border-green-500": isValid && value && !error,
      "border-gray-300": !value && !error,
    }
  );

  return (
    <div className="flex flex-col">
      <label htmlFor={name} className="mb-1 text-sm font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
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
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
};
