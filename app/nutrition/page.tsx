"use client";

import React, { useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { PieChart, Pie, Cell, Label, ResponsiveContainer } from "recharts";

// TODO: Replace this with data from the backend/database
const nutritionData = {
  calories: {
    consumed: 1450,
    goal: 2000,
  },
  macronutrients: {
    carbs: { consumed: 180, goal: 250, color: "blue-500" },
    protein: { consumed: 125, goal: 150, color: "purple-500" },
    fat: { consumed: 45, goal: 60, color: "yellow-400" },
  },
  micronutrients: [
    {
      name: "Vitamin A",
      percent: 83,
      color: "text-blue-600 dark:text-blue-400",
    },
    {
      name: "Vitamin C",
      percent: 94,
      color: "text-green-600 dark:text-green-400",
    },
    {
      name: "Vitamin D",
      percent: 25,
      color: "text-yellow-500 dark:text-yellow-400",
    },
  ],
  macronutrientSplit: [
    { name: "Carbs", percent: 51, color: "text-blue-500" },
    { name: "Protein", percent: 36, color: "text-purple-500" },
    { name: "Fat", percent: 13, color: "text-yellow-500" },
  ],
};

export default function NutritionPage() {
  const [summaryView, setSummaryView] = useState<"Daily" | "Weekly">("Daily");
  const caloriePercent = Math.round(
    (nutritionData.calories.consumed / nutritionData.calories.goal) * 100
  );
  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Nutritional Tracking
        </h1>
        <p className="text-gray-500 dark:text-gray-300 mb-2">
          Monitor your nutrition intake and progress
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Nutrition Summary */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between mb-2 p-6 pb-0">
            <div>
              <CardTitle className="text-xl">Nutrition Summary</CardTitle>
              <CardDescription>
                Track your {summaryView.toLowerCase()} nutrient intake
              </CardDescription>
            </div>
            <div className="flex bg-[#f3f6fa] rounded-lg p-1">
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
                <span className="font-medium text-gray-800 dark:text-gray-200">
                  Calories
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {nutritionData.calories.consumed} /{" "}
                  {nutritionData.calories.goal} kcal
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">
                  {caloriePercent}%
                </span>
              </div>
              <Progress
                value={caloriePercent}
                className="h-2 bg-gray-200 dark:bg-gray-800"
              />
            </div>
            {/* Macronutrients */}
            <div>
              <div className="font-medium text-gray-800 dark:text-gray-200 mb-2">
                Macronutrients
              </div>
              <div className="space-y-3">
                {Object.entries(nutritionData.macronutrients).map(
                  ([key, macro]) => {
                    const percent = Math.round(
                      (macro.consumed / macro.goal) * 100
                    );
                    return (
                      <div key={key}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="flex items-center gap-2 text-sm">
                            <span
                              className={`w-2 h-2 rounded-full bg-${macro.color} inline-block`}
                            />
                            {key.charAt(0).toUpperCase() + key.slice(1)}
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {macro.consumed}g / {macro.goal}g
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                            {percent}%
                          </span>
                        </div>
                        <Progress
                          value={percent}
                          className="h-2 bg-gray-200 dark:bg-gray-800"
                        />
                      </div>
                    );
                  }
                )}
              </div>
            </div>
            {/* Micronutrients Highlights */}
            <div>
              <div className="font-medium text-gray-800 dark:text-gray-200 mb-2">
                Micronutrients Highlights
              </div>
              <div className="grid grid-cols-3 gap-3">
                {nutritionData.micronutrients.map((micro) => (
                  <div
                    key={micro.name}
                    className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 flex flex-col items-center"
                  >
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {micro.name}
                    </span>
                    <span className={`font-semibold text-lg ${micro.color}`}>
                      {micro.percent}%
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      Daily
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
        {/* Nutrition Visualization */}
        <Card>
          <CardHeader className="pb-0">
            <CardTitle className="text-xl">Nutrition Visualization</CardTitle>
            <CardDescription>
              Visual breakdown of your nutrition
            </CardDescription>
            <div className="w-full flex mt-4 mb-2 py-6">
              <div className="flex bg-[#f3f6fa] rounded-lg p-1 shadow-sm min-w-[370px] max-w-[410px] w-full">
                <button
                  className={`flex-1 px-5 py-1.5 text-sm font-semibold rounded-md transition-colors duration-150 focus:outline-none ${
                    true
                      ? "bg-white text-gray-900 shadow font-bold"
                      : "bg-transparent text-gray-500"
                  }`}
                  type="button"
                  style={{ minWidth: 0 }}
                >
                  Macronutrient Split
                </button>
                <button
                  className={`flex-1 px-5 py-1.5 text-sm font-semibold rounded-md transition-colors duration-150 focus:outline-none bg-transparent text-gray-500`}
                  type="button"
                  style={{ minWidth: 0 }}
                >
                  Weekly Calories
                </button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex flex-row items-start gap-8 pt-2 pb-8 px-8 overflow-x-visible">
            {/* Pie Chart and Legend Grouped Vertically */}
            <div
              className="flex flex-col items-center px-6"
              style={{ minWidth: 160, maxWidth: 180, height: 200 }}
            >
              <PieChart width={170} height={170}>
                <Pie
                  data={nutritionData.macronutrientSplit}
                  dataKey="percent"
                  nameKey="name"
                  innerRadius={48}
                  outerRadius={75}
                  strokeWidth={5}
                >
                  <Label
                    content={({ viewBox }) => {
                      if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                        return (
                          <text
                            x={viewBox.cx}
                            y={viewBox.cy}
                            textAnchor="middle"
                            dominantBaseline="middle"
                          >
                            <tspan
                              x={viewBox.cx}
                              y={viewBox.cy}
                              className="fill-foreground text-xl font-bold"
                            >
                              {nutritionData.macronutrientSplit.reduce(
                                (acc, curr) => acc + curr.percent,
                                0
                              )}
                              %
                            </tspan>
                            <tspan
                              x={viewBox.cx}
                              y={(viewBox.cy || 0) + 20}
                              className="fill-muted-foreground text-xs"
                            >
                              Split
                            </tspan>
                          </text>
                        );
                      }
                    }}
                  />
                  {nutritionData.macronutrientSplit.map((entry) => (
                    <Cell
                      key={entry.name}
                      fill={
                        entry.name === "Carbs"
                          ? "hsl(var(--chart-1))"
                          : entry.name === "Protein"
                          ? "hsl(var(--chart-2))"
                          : "hsl(var(--chart-3))"
                      }
                    />
                  ))}
                </Pie>
              </PieChart>
              <div className="flex flex-col items-center mt-2 text-sm font-medium w-full">
                {nutritionData.macronutrientSplit.map((macro) => (
                  <span
                    key={macro.name}
                    className="leading-tight"
                    style={{
                      color:
                        macro.name === "Carbs"
                          ? "hsl(var(--chart-1))"
                          : macro.name === "Protein"
                          ? "hsl(var(--chart-2))"
                          : "hsl(var(--chart-3))",
                    }}
                  >
                    {macro.name} {macro.percent}%
                  </span>
                ))}
              </div>
            </div>
            {/* Macronutrient Distribution */}
            <div className="flex-1 flex flex-col justify-start min-w-[260px] mt-2">
              <div className="font-semibold text-gray-900 dark:text-white mb-2 text-base">
                Macronutrient Distribution
              </div>
              <div className="space-y-3 mb-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 font-semibold text-[#3b82f6]">
                    <span className="w-3 h-3 rounded-full bg-[#3b82f6] inline-block" />
                    Carbs
                  </span>
                  <span className="text-gray-500 dark:text-gray-400 font-normal">
                    180g / 250g
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 font-semibold text-[#8b5cf6]">
                    <span className="w-3 h-3 rounded-full bg-[#8b5cf6] inline-block" />
                    Protein
                  </span>
                  <span className="text-gray-500 dark:text-gray-400 font-normal">
                    125g / 150g
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 font-semibold text-[#facc15]">
                    <span className="w-3 h-3 rounded-full bg-[#facc15] inline-block" />
                    Fat
                  </span>
                  <span className="text-gray-500 dark:text-gray-400 font-normal">
                    45g / 60g
                  </span>
                </div>
              </div>
              <div className="mt-2 text-sm text-gray-700 dark:text-gray-300">
                You're currently at{" "}
                <span className="font-bold text-gray-900 dark:text-white">
                  73%
                </span>{" "}
                of your daily calorie goal (1450 / 2000 kcal)
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
