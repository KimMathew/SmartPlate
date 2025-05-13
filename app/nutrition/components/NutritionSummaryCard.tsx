import React from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

type NutritionSummaryCardProps = {
  summaryView: "Daily" | "Weekly";
  setSummaryView: (view: "Daily" | "Weekly") => void;
  nutritionData: any;
  caloriePercent: number;
};

function getProgressValue(percent: number) {
  return percent > 100 ? 100 : percent;
}

const NutritionSummaryCard: React.FC<NutritionSummaryCardProps> = ({
  summaryView,
  setSummaryView,
  nutritionData,
  caloriePercent,
}) => (
  <Card>
    <CardHeader className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-2 p-6 pb-0 gap-3 lg:gap-0">
      <div>
        <CardTitle className="text-xl">Nutrition Summary</CardTitle>
        <CardDescription>
          Track your {summaryView.toLowerCase()} nutrient intake
        </CardDescription>
        {/* Tab changer below title/desc on mobile and medium screens */}
        <div className="flex w-full bg-[#f3f6fa] rounded-lg p-1 mt-3 lg:mt-0 lg:hidden gap-x-2">
          <button
            className={`flex-1 py-1.5 text-sm font-semibold rounded-md transition-colors duration-150 focus:outline-none shadow-sm ${
              summaryView === "Daily"
                ? "bg-white text-gray-900 shadow font-bold"
                : "bg-transparent text-gray-500"
            }`}
            onClick={() => setSummaryView("Daily")}
            type="button"
          >
            Daily
          </button>
          <button
            className={`flex-1 py-1.5 text-sm font-semibold rounded-md transition-colors duration-150 focus:outline-none ${
              summaryView === "Weekly"
                ? "bg-white text-gray-900 shadow font-bold"
                : "bg-transparent text-gray-500"
            }`}
            onClick={() => setSummaryView("Weekly")}
            type="button"
          >
            Weekly
          </button>
        </div>
      </div>
      {/* Tab changer on the right for lg+ */}
      <div className="hidden lg:flex bg-[#f3f6fa] rounded-lg p-1">
        <button
          className={`px-5 py-1.5 text-sm font-semibold rounded-md transition-colors duration-150 focus:outline-none shadow-sm ${
            summaryView === "Daily"
              ? "bg-white text-gray-900 shadow font-bold"
              : "bg-transparent text-gray-500"
          }`}
          onClick={() => setSummaryView("Daily")}
          type="button"
          style={{ minWidth: 80 }}
        >
          Daily
        </button>
        <button
          className={`px-5 py-1.5 text-sm font-semibold rounded-md transition-colors duration-150 focus:outline-none ${
            summaryView === "Weekly"
              ? "bg-white text-gray-900 shadow font-bold"
              : "bg-transparent text-gray-500"
          }`}
          onClick={() => setSummaryView("Weekly")}
          type="button"
          style={{ minWidth: 80 }}
        >
          Weekly
        </button>
      </div>
    </CardHeader>
    <CardContent className="flex flex-col gap-6 pt-4">
      {/* Calories */}
      <div>
        <div className="flex justify-between items-center mb-1">
          <span className="font-medium" style={{ color: "#333333" }}>
            Calories
          </span>
          <span className="text-sm" style={{ color: "#333333" }}>
            {nutritionData.calories.consumed} / {nutritionData.calories.goal}{" "}
            kcal
          </span>
          <span className="text-sm ml-2" style={{ color: "#333333" }}>
            {caloriePercent}%
          </span>
        </div>
        <Progress
          value={getProgressValue(caloriePercent)}
          className="h-2 bg-gray-200 dark:bg-gray-800"
          progressBarColor={nutritionData.calories.color}
        />
      </div>
      {/* Macronutrients */}
      <div>
        <div className="font-medium mb-2" style={{ color: "#333333" }}>
          Macronutrients
        </div>
        <div className="space-y-3">
          {Object.entries(nutritionData.macronutrients).map(
            ([key, macro]: any) => {
              const percent = Math.round((macro.consumed / macro.goal) * 100);
              return (
                <div key={key}>
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className="flex items-center gap-2 text-sm"
                      style={{ color: "#333333" }}
                    >
                      <span
                        className="w-2 h-2 rounded-full inline-block"
                        style={{ backgroundColor: macro.color }}
                      />
                      {key.charAt(0).toUpperCase() + key.slice(1)}
                    </span>
                    <span className="text-xs" style={{ color: "#333333" }}>
                      {macro.consumed}g / {macro.goal}g
                    </span>
                    <span className="text-xs ml-2" style={{ color: "#333333" }}>
                      {percent}%
                    </span>
                  </div>
                  <Progress
                    value={getProgressValue(percent)}
                    className="h-2 bg-gray-200 dark:bg-gray-800"
                    progressBarColor={macro.color}
                  />
                </div>
              );
            }
          )}
        </div>
      </div>
      {/* Micronutrients Highlights */}
      <div>
        <div className="font-medium mb-2" style={{ color: "#333333" }}>
          Micronutrients Highlights
        </div>
        <div className="grid grid-cols-3 gap-3">
          {nutritionData.micronutrients.map((micro: any) => (
            <div
              key={micro.name}
              className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 flex flex-col items-center"
            >
              <span className="text-xs" style={{ color: "#333333" }}>
                {micro.name}
              </span>
              <span
                className="font-semibold text-lg"
                style={{ color: micro.color }}
              >
                {micro.percent}%
              </span>
              <span className="text-xs" style={{ color: "#333333" }}>
                Daily
              </span>
            </div>
          ))}
        </div>
      </div>
    </CardContent>
  </Card>
);

export default NutritionSummaryCard;
