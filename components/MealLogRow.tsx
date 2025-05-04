import React, { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

interface FoodItem {
  name: string;
  quantity: string;
  calories: number;
}

interface MealLogRowProps {
  name: string;
  time: string;
  calories: number;
  carbs: number;
  protein: number;
  fat: number;
  foodItems?: FoodItem[];
}

const MealLogRow: React.FC<MealLogRowProps> = ({
  name,
  time,
  calories,
  carbs,
  protein,
  fat,
  foodItems = [],
}) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      className="relative bg-white border border-gray-200 rounded-xl shadow-sm mb-3 transition hover:shadow-md group"
      style={{ minHeight: 60 }}
    >
      {/* Emerald accent bar */}
      <div className="absolute left-0 top-0 h-full w-1 rounded-l-xl bg-emerald-500" />
      <div
        className="flex items-center justify-between px-6 py-3 cursor-pointer select-none"
        onClick={() => setExpanded((e) => !e)}
      >
        <div className="flex items-center gap-3 min-w-[120px]">
          <button
            className="focus:outline-none rounded-full p-1 hover:bg-emerald-50 transition"
            tabIndex={-1}
            aria-label={expanded ? "Collapse" : "Expand"}
            onClick={(e) => {
              e.stopPropagation();
              setExpanded((v) => !v);
            }}
            type="button"
          >
            {expanded ? (
              <ChevronUp size={18} className="text-emerald-500" />
            ) : (
              <ChevronDown size={18} className="text-emerald-500" />
            )}
          </button>
          <div className="flex flex-col">
            <span className="font-semibold text-base text-gray-900">
              {name}
            </span>
            <span className="text-xs text-gray-500 mt-0.5">{time}</span>
          </div>
        </div>
        <div className="flex flex-col items-end min-w-[100px]">
          <span className="font-semibold text-black text-base tracking-tight">
            {calories} kcal
          </span>
          <span className="text-xs text-black mt-1 whitespace-nowrap flex gap-2">
            <span>C: {carbs}g</span>
            <span>P: {protein}g</span>
            <span>F: {fat}g</span>
          </span>
        </div>
      </div>
      {expanded && (
        <div className="px-4 pb-3">
          <table className="w-full text-sm mt-2">
            <thead>
              <tr className="text-gray-400 border-b border-gray-100">
                <th className="text-left font-medium px-2 py-2">Item</th>
                <th className="text-left font-medium px-2 py-2">Quantity</th>
                <th className="text-left font-medium px-2 py-2">Calories</th>
              </tr>
            </thead>
            <tbody>
              {foodItems.map((item, idx) => (
                <tr
                  key={idx}
                  className="hover:bg-emerald-50 transition rounded-lg"
                  style={{
                    borderBottom:
                      idx === foodItems.length - 1 ? "none" : undefined,
                  }}
                >
                  <td className="px-2 py-2 text-gray-900 font-medium">
                    {item.name}
                  </td>
                  <td className="px-2 py-2 text-gray-700">{item.quantity}</td>
                  <td className="px-2 py-2 text-gray-700">
                    {item.calories} kcal
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default MealLogRow;
