import React, { useState } from "react";

interface BadgeInputProps {
  label: string;
  items: string[];
  onChange: (items: string[]) => void;
  editMode: boolean;
  placeholder?: string;
}

export const BadgeInput: React.FC<BadgeInputProps> = ({
  label,
  items,
  onChange,
  editMode,
  placeholder = "Type and press Enter or comma",
}) => {
  const [input, setInput] = useState("");

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if ((e.key === "Enter" || e.key === ",") && input.trim()) {
      e.preventDefault();
      const value = input.trim().replace(/,$/, "");
      if (value && !items.includes(value)) {
        onChange([...items, value]);
      }
      setInput("");
    }
  };

  const handleRemove = (item: string) => {
    onChange(items.filter((i) => i !== item));
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      {editMode ? (
        <div className="w-full flex flex-wrap items-center min-h-[48px] px-2 py-1 border border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-emerald-500 focus-within:border-transparent bg-white shadow-sm transition-all duration-200">
          {items.map((item) => (
            <span
              key={item}
              className="inline-flex items-center px-3 py-1 mr-2 mb-1 rounded-full bg-emerald-100 text-emerald-800 text-sm font-medium"
            >
              {item.charAt(0).toUpperCase() + item.slice(1)}
              <button
                type="button"
                className="ml-2 text-emerald-600 hover:text-red-500 focus:outline-none"
                onClick={() => handleRemove(item)}
                aria-label={`Remove ${item}`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
              </button>
            </span>
          ))}
          <input
            type="text"
            value={input}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            placeholder={items.length === 0 ? placeholder : "Add more..."}
            className="flex-1 min-w-[120px] px-2 py-2 border-none outline-none bg-transparent text-gray-900 text-base"
          />
        </div>
      ) : (
        <div className="w-full flex flex-wrap items-center min-h-[36px] px-2 py-0.5 bg-white">
          {items.length === 0 ? (
            <span className="text-gray-400 text-sm">No {label.toLowerCase()} specified</span>
          ) : (
            items.map((item) => (
              <span
                key={item}
                className="inline-flex items-center px-3 py-1 mr-2 mb-1 rounded-full bg-emerald-100 text-emerald-800 text-sm font-medium"
              >
                {item.charAt(0).toUpperCase() + item.slice(1)}
              </span>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default BadgeInput;
