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
  theme: string;
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
    "appearance-none block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-1 sm:text-sm",
    {
      "bg-gray-700 text-white border-gray-600 focus:border-orange-500 focus:ring-orange-500": theme === "dark",
      "bg-white text-gray-900 border-gray-300 focus:border-blue-500 focus:ring-blue-500": theme === "light",
      "border-red-500": !isValid || error,
    },
    className
  );

  const labelClasses = clsx(
    "absolute left-3 transition-all duration-200 ease-in-out",
    {
      "text-gray-400": theme === "dark",
      "text-gray-500": theme === "light",
      "top-2 text-sm": !isFocused && !value,
      "-top-6 text-xs font-medium": isFocused || value,
      "text-orange-500": (isFocused || value) && theme === "dark",
      "text-blue-600": (isFocused || value) && theme === "light",
      "text-red-500": !isValid || error,
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
        placeholder=" "
      />
      <label htmlFor={name} className={labelClasses}>
        {placeholder}
      </label>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
};
