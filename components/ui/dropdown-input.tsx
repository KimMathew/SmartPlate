import React, { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";

interface DropdownOption {
  value: string;
  label: string;
}

interface DropdownInputProps {
  options: DropdownOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: React.ReactNode;
  error?: string;
  disabled?: boolean;
  className?: string;
  labelClassName?: string;
}

export const DropdownInput: React.FC<DropdownInputProps> = ({
  options,
  value,
  onChange,
  placeholder = "Select",
  label,
  error,
  disabled = false,
  className = "",
  labelClassName,
}) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  const selected = options.find((opt) => opt.value === value);

  return (
    <div className={`space-y-2 ${className}`} ref={ref}>
      {label && (
        <label className={labelClassName || "input-label"}>{label}</label>
      )}
      <div className="relative">
        <button
          type="button"
          className={`w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-left flex justify-between items-center focus:outline-none focus:ring-1 focus:ring-emerald-500 ${
            error
              ? "border-red-400 focus:ring-red-500"
              : "border-gray-300"
          } ${disabled ? "opacity-60 cursor-not-allowed" : ""}`}
          onClick={() => !disabled && setOpen((v) => !v)}
          disabled={disabled}
        >
          <span className={selected ? "text-gray-900" : "text-gray-400"}>
            {selected ? selected.label : placeholder}
          </span>
          <ChevronDown className="h-4 w-4 text-gray-500" />
        </button>
        {open && !disabled && (
          <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md border border-gray-200 py-1">
            {options.map((option) => (
              <div
                key={option.value}
                className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-gray-700"
                onClick={() => {
                  onChange(option.value);
                  setOpen(false);
                }}
              >
                {option.label}
              </div>
            ))}
          </div>
        )}
      </div>
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
};

export default DropdownInput;
