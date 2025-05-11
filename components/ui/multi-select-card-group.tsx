import React from "react";

interface Option {
  value: string;
  label: string;
  icon?: React.ReactNode | string;
}

interface MultiSelectCardGroupProps {
  options: Option[];
  selected: string[];
  onChange: (selected: string[]) => void;
  columns?: number;
  label?: string;
  error?: string;
  className?: string;
}

const MultiSelectCardGroup: React.FC<MultiSelectCardGroupProps> = ({
  options,
  selected,
  onChange,
  columns = 3,
  label,
  error,
  className = "",
}) => {
  const handleSelect = (value: string) => {
    const isSelected = selected.includes(value);
    const newSelected = isSelected
      ? selected.filter((v) => v !== value)
      : [...selected, value];
    onChange(newSelected);
  };

  return (
    <div className={className}>
      {label && (
        <label className="text-gray-900 text-base mb-1 block">{label}</label>
      )}
      <div className={`grid grid-cols-2 md:grid-cols-${columns} gap-3`}>
        {options.map((option) => {
          const isSelected = selected.includes(option.value);
          return (
            <div
              key={option.value}
              onClick={() => handleSelect(option.value)}
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  handleSelect(option.value);
                }
              }}
              className={`relative px-2 py-4 rounded-lg border cursor-pointer transition-all duration-200 text-center text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400
                ${
                  isSelected
                    ? "border-emerald-500 bg-emerald-50 scale-102 shadow-lg"
                    : "border-gray-300 hover:border-emerald-300 hover:bg-emerald-50"
                }
              `}
              aria-pressed={isSelected}
              style={{ minWidth: 0 }}
            >
              {isSelected && (
                <span className="absolute top-2 right-2 text-emerald-500">
                  <svg width="20" height="20" fill="none" viewBox="0 0 20 20">
                    <circle cx="10" cy="10" r="10" fill="#10B981" />
                    <path
                      d="M6 10.5l2.5 2.5 5-5"
                      stroke="#fff"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
              )}
              <div className="text-xl mb-1">
                {option.icon}
              </div>
              <div className={`font-medium ${isSelected ? "text-emerald-700" : "text-gray-700"}`}>
                {option.label}
              </div>
            </div>
          );
        })}
      </div>
      {error && <p className="text-red-500 text-xs mt-3">{error}</p>}
    </div>
  );
};

export default MultiSelectCardGroup;
