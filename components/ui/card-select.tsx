import React from "react";

interface CardOption {
  value: string;
  label: string;
  icon?: React.ReactNode | string;
  description?: string;
}

interface CardSelectProps {
  options: CardOption[];
  value: string | string[];
  onChange: (value: string) => void;
  multiple?: boolean;
  columns?: number; // number of columns for desktop
  mobileColumns?: number; // number of columns for mobile
  align?: "left" | "center";
  className?: string;
  cardClassName?: string;
  renderDescription?: (option: CardOption) => React.ReactNode;
}

export const CardSelect: React.FC<CardSelectProps> = ({
  options,
  value,
  onChange,
  multiple = false,
  columns = 3,
  mobileColumns,
  align = "center",
  className = "",
  cardClassName = "",
  renderDescription,
}) => {
  const isSelected = (optionValue: string) => {
    if (multiple && Array.isArray(value)) {
      return value.includes(optionValue);
    }
    return value === optionValue;
  };

  const handleSelect = (optionValue: string) => {
    if (multiple && Array.isArray(value)) {
      if (value.includes(optionValue)) {
        onChange(value.filter((v) => v !== optionValue).join(","));
      } else {
        onChange([...value, optionValue].join(","));
      }
    } else {
      onChange(optionValue);
    }
  };

  // Responsive grid: mobileColumns on mobile, columns on md+
  const gridCols = `${mobileColumns ? `grid-cols-${mobileColumns}` : `grid-cols-1`} md:grid-cols-${columns}`;
  const textAlign = align === "left" ? "text-left" : "text-center";

  return (
    <div className={`grid ${gridCols} gap-3 ${className}`}>
      {options.map((option) => (
        <div
          key={option.value}
          onClick={() => handleSelect(option.value)}
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              handleSelect(option.value);
            }
          }}
          className={`relative px-4 py-4 rounded-lg border cursor-pointer transition-all duration-200 ${textAlign} text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 ${
            isSelected(option.value)
              ? "border-emerald-500 bg-emerald-50 scale-102 shadow-lg"
              : "border-gray-300 hover:border-emerald-300 hover:bg-emerald-50"
          } ${cardClassName}`}
          aria-pressed={isSelected(option.value)}
          style={{ minWidth: 0 }}
        >
          {/* Checkmark icon */}
          {isSelected(option.value) && (
            <span className="absolute top-2 right-2 text-emerald-500">
              <svg
                width="20"
                height="20"
                fill="none"
                viewBox="0 0 20 20"
              >
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
          {option.icon && (
            <div className="text-xl mb-1">{option.icon}</div>
          )}
          <div
            className={`font-medium ${
              isSelected(option.value) ? "text-emerald-700" : "text-gray-700"
            }`}
          >
            {option.label}
          </div>
          {renderDescription && renderDescription(option)}
        </div>
      ))}
    </div>
  );
};

export default CardSelect;
