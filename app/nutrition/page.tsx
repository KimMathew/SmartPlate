"use client";

import React, { useState } from "react";
import NutritionSummaryCard from "@/app/nutrition/components/NutritionSummaryCard";
import NutritionVisualizationCard from "@/app/nutrition/components/NutritionVisualizationCard";
import MealLogCard from "@/app/nutrition/components/MealLogCard";

// TODO: Replace this with data from the backend/database
const nutritionData = {
  calories: {
    consumed: 1450,
    goal: 2000,
    color: "#10B981", // Emerald 500 for Calories
  },
  macronutrients: {
    carbs: { consumed: 180, goal: 250, color: "#34D399" }, // Emerald 400
    protein: { consumed: 125, goal: 150, color: "#10B981" }, // Emerald 500
    fat: { consumed: 45, goal: 60, color: "#059669" }, // Emerald 600
  },
  micronutrients: [
    {
      name: "Vitamin A",
      percent: 83,
      color: "#10B981", // Emerald 500 for consistency
    },
    {
      name: "Vitamin C",
      percent: 94,
      color: "#10B981", // Emerald 500 for consistency
    },
    {
      name: "Vitamin D",
      percent: 25,
      color: "#10B981", // Emerald 500 for consistency
    },
  ],
  macronutrientSplit: [
    { name: "Carbs", percent: 51, color: "#34D399" }, // Emerald 400
    { name: "Protein", percent: 36, color: "#10B981" }, // Emerald 500
    { name: "Fat", percent: 13, color: "#059669" }, // Emerald 600
  ],
};

const weeklyCalories = [
  { day: "Mon", consumed: 1750, goal: 2000 },
  { day: "Tue", consumed: 1800, goal: 2000 },
  { day: "Wed", consumed: 1950, goal: 2000 },
  { day: "Thu", consumed: 1700, goal: 2000 },
  { day: "Fri", consumed: 1900, goal: 2000 },
  { day: "Sat", consumed: 2200, goal: 2000 },
  { day: "Sun", consumed: 1300, goal: 2000 },
];
const weeklyAvg = Math.round(
  weeklyCalories.reduce((acc, d) => acc + d.consumed, 0) / weeklyCalories.length
);

export default function NutritionPage() {
  const [summaryView, setSummaryView] = useState<"Daily" | "Weekly">("Daily");
  const [visualizationTab, setVisualizationTab] = useState<
    "Macronutrient Split" | "Weekly Calories"
  >("Macronutrient Split");
  const caloriePercent = Math.round(
    (nutritionData.calories.consumed / nutritionData.calories.goal) * 100
  );
  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-gray-900">
          Nutritional Tracking
        </h1>
        <p className="text-gray-500 dark:text-gray-300 mb-2">
          Monitor your nutrition intake and progress
        </p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
        <NutritionSummaryCard
          summaryView={summaryView}
          setSummaryView={setSummaryView}
          nutritionData={nutritionData}
          caloriePercent={caloriePercent}
        />
        <NutritionVisualizationCard
          visualizationTab={visualizationTab}
          setVisualizationTab={setVisualizationTab}
          nutritionData={nutritionData}
          weeklyCalories={weeklyCalories}
          weeklyAvg={weeklyAvg}
        />
        <div className="lg:col-span-2">
          <MealLogCard />
        </div>
      </div>
    </div>
  );
}
