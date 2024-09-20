import React, { useState, useEffect } from "react";
import clsx from "clsx";

interface FloatingLabelInputProps {
  name: string;
  type?: string;
  defaultValue?: string;
  placeholder: string;
  minLength?: number;
  min?: string | number;
  max?: string | number;
  step?: string | number;
  pattern?: string;
  required?: boolean;
  onChange: (name: string, value: string) => void;
  className?: string;
  error?: string;
  theme: "light" | "dark";
}

export const FloatingLabelInput: React.FC<FloatingLabelInputProps> = ({
  name,
  type = "text",
  defaultValue = "",
  placeholder,
  minLength,
  min,
  max,
  step,
  pattern,
  required,
  onChange,
  className,
  error,
  theme,
}) => {
  const [value, setValue] = useState(defaultValue);
  const [isFocused, setIsFocused] = useState(false);
  const [isValid, setIsValid] = useState(true);

  useEffect(() => {
    setIsValid(!error);
  }, [error]);

  const handleBlur = (event: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(false);
    setIsValid(event.target.checkValidity() && !error);
  };

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value;
    setValue(newValue);
    onChange(name, newValue);
  };

  const inputClasses = clsx(
    "appearance-none block w-full border rounded px-3 py-2 leading-tight focus:outline-none transition-colors duration-300",
    {
      "bg-gray-700 text-white border-gray-600": theme === "dark",
      "bg-gray-100 text-gray-900 border-gray-300": theme === "light",
      "border-red-500": !isValid || error,
      "border-orange-500": isValid && value && !error,
    },
    className
  );

  const labelClasses = clsx(
    "absolute left-3 transition-all duration-300 ease-in-out pointer-events-none",
    {
      "text-gray-400": !isFocused && !value && theme === "dark",
      "text-gray-500": !isFocused && !value && theme === "light",
      "top-2": !isFocused && !value,
      "-top-6 text-xs": isFocused || value,
      "text-white": (isFocused || value) && theme === "dark",
      "text-gray-900": (isFocused || value) && theme === "light",
      "text-red-500": !isValid || error,
      "text-orange-500": isValid && value && !error,
    }
  );

  return (
    <div className="relative mt-6 mb-2">
      <input
        className={inputClasses}
        id={name}
        type={type}
        name={name}
        value={value}
        onChange={handleChange}
        onBlur={handleBlur}
        onFocus={handleFocus}
        minLength={minLength}
        min={min}
        max={max}
        step={step}
        pattern={pattern}
        required={required}
      />
      <label htmlFor={name} className={labelClasses}>
        {placeholder}
      </label>
      {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
    </div>
  );
};
