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
}) => {
  const [value, setValue] = useState(defaultValue);
  const [isFocused, setIsFocused] = useState(false);
  const [isValid, setIsValid] = useState(true);

  useEffect(() => {
    // Update isValid when the error prop changes
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
    "appearance-none block w-full bg-gray-100 text-gray-700 border rounded py-2 px-3 leading-tight focus:outline-none",
    {
      "border-red-500": !isValid || error,
      "border-green-500": isValid && value && !error,
    },
    className
  );

  const labelClasses = clsx(
    "absolute left-3 transition-all duration-300 ease-in-out pointer-events-none",
    {
      "top-2 text-gray-500": !isFocused && !value,
      "-top-6 text-xs": isFocused || value,
      "text-red-500": !isValid || error,
      "text-green-500": isValid && value && !error,
    }
  );

  return (
    <div className="relative my-2">
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
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
};
