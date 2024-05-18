// app/components/FloatingPasswordInput.tsx
import React, { useState } from 'react';
import clsx from 'clsx';
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/20/solid";

interface FloatingPasswordInputProps {
  name: string;
  defaultValue?: string;
  placeholder: string;
  required?: boolean;
  onChange: (name: string, value: string, isValid: boolean) => void;
  className?: string;
  newPassword?: string;
}

export const FloatingPasswordInput: React.FC<FloatingPasswordInputProps> = ({
  name,
  defaultValue = "",
  placeholder,
  required,
  onChange,
  className,
  newPassword
}) => {
  const [value, setValue] = useState(defaultValue);
  const [isFocused, setIsFocused] = useState(false);
  const [isValid, setIsValid] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const validatePassword = (password: string) => {
    const lengthValid = password.length >= 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    return lengthValid && hasUpperCase && hasLowerCase && hasNumber && hasSpecialChar;
  };

  const handleBlur = (event: React.ChangeEvent<HTMLInputElement>) => {
    setIsFocused(false);
    const isValid = validatePassword(event.target.value);
    setIsValid(isValid);
  };

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value;
    setValue(newValue);
    const newIsValid = validatePassword(newValue);
    setIsValid(newIsValid);
    onChange(name, newValue, newIsValid);
  };

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const inputClasses = clsx(
    "appearance-none block w-full bg-gray-100 text-gray-700 border rounded py-2 px-3 leading-tight focus:outline-none",
    {
      "border-red-500": isFocused && !isValid,
      "border-green-500": isValid && value,
    },
    className
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
        type={showPassword ? "text" : "password"}
        name={name}
        value={value}
        onChange={handleChange}
        onBlur={handleBlur}
        onFocus={handleFocus}
        minLength={8}
        required={required}
      />
      <label htmlFor={name} className={labelClasses}>
        {placeholder}
      </label>
      <button
        type="button"
        onClick={toggleShowPassword}
        className="absolute right-3 top-2 text-gray-500 focus:outline-none"
      >
        {showPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
      </button>
      {isFocused && (
        <div className="mt-2 text-sm text-gray-600">
          Password must:
          <ul className="list-disc pl-5">
            <li>Be at least 8 characters long</li>
            <li>Include both lower and upper case characters</li>
            <li>Contain at least one number</li>
            <li>Have at least one special character (e.g., !@#$%)</li>
          </ul>
        </div>
      )}
      {name === "confirmpassword" && newPassword && (
        <p className={value !== newPassword ? "text-red-500 mt-1" : "text-green-500 mt-1"}>
          {value !== newPassword ? "Passwords do not match" : "Passwords match"}
        </p>
      )}
    </div>
  );
};
