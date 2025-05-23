import React from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import {
  ChartTooltip,
  ChartTooltipContent,
  ChartContainer,
} from "@/components/ui/chart";
import {
  PieChart,
  Pie,
  Cell,
  Label,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

type Weekday = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';

// Helper to aggregate calories by weekday from meals array
function getBarChartDataFromMeals(meals: Array<{ meal_date: string; calories: number }>, calorieGoal: number) {
  const weekOrder: Weekday[] = [
    'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
  ];
  const weekData: Record<Weekday, number> = {
    Monday: 0,
    Tuesday: 0,
    Wednesday: 0,
    Thursday: 0,
    Friday: 0,
    Saturday: 0,
    Sunday: 0,
  };
  meals.forEach(meal => {
    const date = new Date(meal.meal_date);
    const weekday = date.toLocaleDateString('en-US', { weekday: 'long' }) as Weekday;
    if (weekData[weekday] !== undefined) {
      weekData[weekday] += Number(meal.calories) || 0;
    }
  });
  // Always use the daily calorie goal for each day, not the weekly goal
  // Ensure the order is always Monday-Sunday
  return weekOrder.map(day => ({
    day,
    consumed: weekData[day],
    goal: calorieGoal,
  }));
}

const getMacronutrientSplit = (nutritionData: any) => {
  // Prefer provided split, but compute if missing or all percents are zero
  if (
    nutritionData.macronutrientSplit &&
    Array.isArray(nutritionData.macronutrientSplit) &&
    nutritionData.macronutrientSplit.some((entry: any) => entry.percent && entry.percent > 0)
  ) {
    return nutritionData.macronutrientSplit;
  }
  // Compute from macronutrients if possible
  if (nutritionData.macronutrients) {
    const { carbs, protein, fat } = nutritionData.macronutrients;
    const total = (carbs?.consumed || 0) + (protein?.consumed || 0) + (fat?.consumed || 0);
    if (total > 0) {
      return [
        {
          name: 'Carbs',
          percent: Math.round(((carbs?.consumed || 0) / total) * 100),
          color: '#34D399',
        },
        {
          name: 'Protein',
          percent: Math.round(((protein?.consumed || 0) / total) * 100),
          color: '#10B981',
        },
        {
          name: 'Fat',
          percent: Math.round(((fat?.consumed || 0) / total) * 100),
          color: '#059669',
        },
      ];
    }
  }
  return [];
};

type NutritionVisualizationCardProps = {
  visualizationTab: "Macronutrient Split" | "Weekly Calories";
  setVisualizationTab: (tab: "Macronutrient Split" | "Weekly Calories") => void;
  nutritionData: any;
  weeklyCalories: any[];
  weeklyAvg: number;
  meals?: Array<{ meal_date: string; calories: number }>;
  dailyCalorieGoal: number;
};

const NutritionVisualizationCard: React.FC<NutritionVisualizationCardProps> = ({
  visualizationTab,
  setVisualizationTab,
  nutritionData,
  weeklyCalories, // not used for bar chart anymore
  weeklyAvg,
  meals, // required for bar chart
  dailyCalorieGoal,
}) => {
  console.log('NutritionVisualizationCard meals:', meals);
  console.log('NutritionVisualizationCard dailyCalorieGoal:', dailyCalorieGoal);
  console.log('PieChart macronutrientSplit:', nutritionData.macronutrientSplit);

  const macronutrientSplit =
    (nutritionData.macronutrientSplit && nutritionData.macronutrientSplit.length > 0)
      ? nutritionData.macronutrientSplit
      : getMacronutrientSplit(nutritionData.macronutrients);

  return (
    <Card>
      <CardHeader className="pb-0">
        <CardTitle className="text-xl">Nutrition Visualization</CardTitle>
        <CardDescription>Visual breakdown of your nutrition</CardDescription>
        <div className="w-full flex mt-4 mb-2 py-6">
          <div className="flex bg-[#f3f6fa] rounded-lg p-1 shadow-sm w-full">
            <button
              className={`flex-1 px-5 py-1.5 text-sm font-semibold rounded-md transition-colors duration-150 focus:outline-none ${visualizationTab === "Macronutrient Split"
                ? "bg-white text-gray-900 shadow font-bold"
                : "bg-transparent text-gray-500"
                }`}
              type="button"
              style={{ minWidth: 0 }}
              onClick={() => setVisualizationTab("Macronutrient Split")}
            >
              Macronutrient Split
            </button>
            <button
              className={`flex-1 px-5 py-1.5 text-sm font-semibold rounded-md transition-colors duration-150 focus:outline-none ${visualizationTab === "Weekly Calories"
                ? "bg-white text-gray-900 shadow font-bold"
                : "bg-transparent text-gray-500"
                }`}
              type="button"
              style={{ minWidth: 0 }}
              onClick={() => setVisualizationTab("Weekly Calories")}
            >
              Weekly Calories
            </button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col xl:flex-row items-start gap-6 xl:gap-8 pt-2 pb-8 px-4 xl:px-8 min-w-0 overflow-x-auto">
        {visualizationTab === "Macronutrient Split" ? (
          <>
            {/* Pie Chart and Legend Grouped Vertically */}
            <div
              className="flex flex-col mx-auto"
              style={{ minWidth: 160, maxWidth: 180, height: 200 }}
            >
              <ChartContainer
                config={{
                  Carbs: { label: "Carbs", color: "#34D399" }, // Emerald 400
                  Protein: { label: "Protein", color: "#10B981" }, // Emerald 500
                  Fat: { label: "Fat", color: "#059669" }, // Emerald 600
                }}
                style={{ height: 200, width: 200 }}
              >
                {(getMacronutrientSplit(nutritionData).length === 0) ? (
                  <div className="text-center text-gray-500 text-sm py-12">
                    No data available.
                  </div>
                ) : (
                  <PieChart width={170} height={170}>
                    <Pie
                      data={getMacronutrientSplit(nutritionData)}
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
                                  style={{
                                    fill: "#333333",
                                    fontSize: 20,
                                    fontWeight: 700,
                                  }}
                                >
                                  {getMacronutrientSplit(nutritionData).reduce(
                                    (acc: number, curr: any) => acc + curr.percent,
                                    0
                                  )}
                                  %
                                </tspan>
                                <tspan
                                  x={viewBox.cx}
                                  y={(viewBox.cy || 0) + 20}
                                  style={{ fill: "#333333", fontSize: 12 }}
                                >
                                  Split
                                </tspan>
                              </text>
                            );
                          }
                        }}
                      />
                      {getMacronutrientSplit(nutritionData).map((entry: any) => (
                        <Cell key={entry.name} fill={entry.color} />
                      ))}
                    </Pie>
                    {/* Tooltip on hover for each pie segment */}
                    <ChartTooltip
                      content={
                        <ChartTooltipContent
                          formatter={(value, name) => `${name}: ${value}%`}
                          hideIndicator={false}
                          indicator="dot"
                        />
                      }
                    />
                  </PieChart>
                )}
              </ChartContainer>
              {/* Removed static legend below the pie chart */}
            </div>
            {/* Macronutrient Distribution */}
            <div className="flex-1 flex flex-col justify-start min-w-[260px] mt-2">
              <div
                className="font-semibold mb-2 text-base"
                style={{ color: "#333333" }}
              >
                Macronutrient Distribution
              </div>
              <div className="space-y-3 mb-2">
                <div className="flex items-center justify-between text-sm">
                  <span
                    className="flex items-center gap-2 font-semibold"
                    style={{ color: "#34D399" }} // Emerald 400
                  >
                    <span
                      className="w-3 h-3 rounded-full inline-block"
                      style={{ backgroundColor: "#34D399" }}
                    />
                    Carbs
                  </span>
                  <span className="font-normal" style={{ color: "#333333" }}>
                    {nutritionData.macronutrients.carbs.consumed}g / {nutritionData.macronutrients.carbs.goal}g
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span
                    className="flex items-center gap-2 font-semibold"
                    style={{ color: "#10B981" }} // Emerald 500
                  >
                    <span
                      className="w-3 h-3 rounded-full inline-block"
                      style={{ backgroundColor: "#10B981" }}
                    />
                    Protein
                  </span>
                  <span className="font-normal" style={{ color: "#333333" }}>
                    {nutritionData.macronutrients.protein.consumed}g / {nutritionData.macronutrients.protein.goal}g
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span
                    className="flex items-center gap-2 font-semibold"
                    style={{ color: "#059669" }} // Emerald 600
                  >
                    <span
                      className="w-3 h-3 rounded-full inline-block"
                      style={{ backgroundColor: "#059669" }}
                    />
                    Fat
                  </span>
                  <span className="font-normal" style={{ color: "#333333" }}>
                    {nutritionData.macronutrients.fat.consumed}g / {nutritionData.macronutrients.fat.goal}g
                  </span>
                </div>
              </div>
              <div className="mt-2 text-sm" style={{ color: "#333333" }}>
                You're currently at{" "}
                <span className="font-bold" style={{ color: "#333333" }}>
                  {Math.round((nutritionData.calories.consumed / nutritionData.calories.goal) * 100)}%
                </span>{" "}
                of your {nutritionData.calories.goal > 5000 ? "weekly" : "daily"} goal ({nutritionData.calories.consumed} / {nutritionData.calories.goal} kcal)
              </div>
            </div>
          </>
        ) : (
          // Weekly Calories Bar Chart with recharts
          <div className="w-full flex flex-col items-center">
            <div className="w-full max-w-xl">
              {(!meals || meals.length === 0 || meals.every(m => !m.calories || m.calories === 0)) ? (
                <div className="text-center text-gray-500 py-12">
                  No calorie data available for this week.
                </div>
              ) : (
                <ChartContainer
                  config={{
                    consumed: {
                      label: "Calories Consumed",
                      color: "#10B981", // Emerald 500
                    },
                    goal: { label: "Calorie Goal", color: "#A7F3D0" }, // Emerald 200
                  }}
                  style={{ height: 180, aspectRatio: "unset" }}
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={getBarChartDataFromMeals(meals || [], dailyCalorieGoal)}
                      barGap={2}
                      barCategoryGap={10}
                    >
                      <CartesianGrid stroke="#222a" vertical={false} />
                      <XAxis
                        dataKey="day"
                        axisLine={false}
                        tickLine={false}
                        stroke="#b3b3b3"
                        fontSize={13}
                      />
                      <YAxis hide domain={[0, Math.max(nutritionData.calories.goal, 2400)]} />
                      <Bar
                        dataKey="goal"
                        fill="#A7F3D0" // Emerald 200
                        radius={[4, 4, 0, 0]}
                        barSize={18}
                      />
                      <Bar
                        dataKey="consumed"
                        fill="#10B981" // Emerald 500
                        radius={[4, 4, 0, 0]}
                        barSize={18}
                      />
                      {/* Tooltip for bar chart */}
                      <ChartTooltip
                        cursor={false}
                        content={
                          <ChartTooltipContent
                            formatter={(value, name) =>
                              `${name === "consumed"
                                ? "Calories Consumed"
                                : "Calorie Goal"
                              }: ${value} kcal`
                            }
                            indicator="dot"
                          />
                        }
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              )}
              <div className="flex items-center justify-center gap-6 mb-2 mt-2">
                <div className="flex items-center gap-2">
                  <span
                    className="inline-block w-4 h-3 rounded-sm"
                    style={{ background: "#10B981" }} // Emerald 500
                  ></span>
                  <span className="text-sm text-gray-700 font-medium">
                    Calories Consumed
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className="inline-block w-4 h-3 rounded-sm"
                    style={{ background: "#A7F3D0" }} // Emerald 200
                  ></span>
                  <span className="text-sm text-gray-700 font-medium">
                    Calorie Goal
                  </span>
                </div>
              </div>
              <div className="text-center text-sm text-gray-600 mt-2">
                Your weekly average is{" "}
                <span className="font-bold text-gray-900">{weeklyAvg} kcal</span>{" "}
                per day compared to your 2000 kcal daily goal.
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default NutritionVisualizationCard;
