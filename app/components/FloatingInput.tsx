// app/components/FloatingInput.tsx
import React, { useState } from 'react';
import clsx from 'clsx';

interface FloatingLabelInputProps {
  name: string;
  type?: string;
  defaultValue?: string;
  placeholder: string;
  minLength?: number;
  pattern?: string;
  required?: boolean;
  onChange: (name: string, value: string, isValid: boolean) => void;
  className?: string; // Add className prop
}

export const FloatingLabelInput: React.FC<FloatingLabelInputProps> = ({
  name,
  type = "text",
  defaultValue = "",
  placeholder,
  minLength,
  pattern,
  required,
  onChange,
  className // Include className in the props destructuring
}) => {
  const [value, setValue] = useState(defaultValue);
  const [isFocused, setIsFocused] = useState(false);
  const [isValid, setIsValid] = useState(false);

  const handleBlur = (event: React.ChangeEvent<HTMLInputElement>) => {
    setIsFocused(false);
    setIsValid(event.target.checkValidity());
  };

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value;
    setValue(newValue);
    const newIsValid = event.target.checkValidity();
    setIsValid(newIsValid);
    onChange(name, newValue, newIsValid);
  };

  const inputClasses = clsx(
    "appearance-none block w-full bg-gray-100 text-gray-700 border rounded py-2 px-3 leading-tight focus:outline-none",
    {
      "border-red-500": isFocused && !isValid,
      "border-green-500": isValid && value,
    },
    className // Apply className prop if provided
  );

  const labelClasses = clsx(
    "absolute left-3 transition-all duration-300 ease-in-out pointer-events-none",
    {
      "top-2 text-gray-500": !isFocused && !value,
      "-top-6 text-xs": isFocused || value,
      "text-red-500": isFocused && !isValid,
      "text-green-500": isValid && value,
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
        pattern={pattern}
        required={required}
      />
      <label htmlFor={name} className={labelClasses}>
        {placeholder}
      </label>
    </div>
  );
};
