"use client";

import React, { useState, useEffect } from "react";
import NutritionSummaryCard from "@/app/nutrition/components/NutritionSummaryCard";
import NutritionVisualizationCard from "@/app/nutrition/components/NutritionVisualizationCard";
import MealLogCard from "@/app/nutrition/components/MealLogCard";
import { createClient } from "@/lib/supabase";

// Calculate goal nutrients from userProfile
function calculateGoalNutrients(user: any) {
  if (!user) return {
    calories: 2000,
    carbs: 250,
    protein: 100,
    fat: 67
  };
  const weight = Number(user.weight) || 70; // kg
  const height = Number(user.height) || 170; // cm
  const age = Number(user.age) || 30;
  const gender = (user.gender || '').toLowerCase();
  // 1. BMR
  let bmr = 0;
  if (gender === 'male' || gender === 'm') {
    bmr = 10 * weight + 6.25 * height - 5 * age + 5;
  } else if (gender === 'female' || gender === 'f') {
    bmr = 10 * weight + 6.25 * height - 5 * age - 161;
  } else {
    bmr = 10 * weight + 6.25 * height - 5 * age;
  }
  // 2. Activity factor
  const activityMap: Record<string, number> = {
    sedentary: 1.2,
    lightly_active: 1.375,
    moderately_active: 1.55,
    very_active: 1.725,
    extra_active: 1.9
  };
  const activity = (user.activity_level || '').toLowerCase();
  const activityFactor = activityMap[activity] || 1.2;
  let tdee = bmr * activityFactor;
  // 3. Adjust for goal
  const goal = (user.goal_type || '').toLowerCase();
  if (goal.includes('lose')) tdee -= 500;
  else if (goal.includes('gain')) tdee += 500;
  // If maintain, do not adjust tdee
  // 4. Macronutrient split
  const calories = Math.round(tdee);
  const carbs = Math.round((calories * 0.5) / 4);
  const protein = Math.round((calories * 0.2) / 4);
  const fat = Math.round((calories * 0.3) / 9);
  return { calories, carbs, protein, fat };
}

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
  const [nutritionInfo, setNutritionInfo] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [mealSchedule, setMealSchedule] = useState<any[]>([]);

  useEffect(() => {
    async function fetchNutritionInfo() {
      setLoading(true);
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user;
      if (!user?.id) {
        setNutritionInfo([]);
        setUserProfile(null);
        setMealSchedule([]);
        setLoading(false);
        return;
      }
      // Fetch nutrition_info (no user_id filter, just get all for this user)
      const { data: nutritionData, error: nutritionError } = await supabase
        .from("nutrition_info")
        .select("*")
        .order("created_at", { ascending: false });
      // Fetch meal_schedule for this user
      const { data: mealData, error: mealError } = await supabase
        .from("meal_schedule")
        .select("*")
        .eq("user_id", user.id)
        .lte("meal_date", new Date().toISOString().slice(0, 10)) // Only fetch meals up to and including today
        .order("meal_date", { ascending: true });
      // Fetch Users table
      const { data: userData, error: userError } = await supabase
        .from("Users")
        .select("*")
        .eq("id", user.id)
        .single();
      // Log all fetched data as JSON for debugging
      console.log('Fetched nutrition_info:', JSON.stringify(nutritionData, null, 2));
      console.log('Fetched meal_schedule:', JSON.stringify(mealData, null, 2));
      console.log('Fetched user profile:', JSON.stringify(userData, null, 2));
      // Set state as before
      setNutritionInfo(nutritionData || []);
      setMealSchedule(mealData || []);
      setUserProfile(userData || null);
      setLoading(false);
    }
    fetchNutritionInfo();
  }, []);

  const goalNutrients = calculateGoalNutrients(userProfile);

  // Helper: get Date object in GMT+8
  function getDateInGMT8(date = new Date()) {
    // Always convert from UTC to GMT+8
    return new Date(date.getTime() + (8 * 60 * 60 * 1000));
  }

  // Calculate consumed nutrients for today (sum all meals for today in GMT+8)
  function getTodayConsumed() {
    const today = getDateInGMT8();
    const todayStr = today.toISOString().slice(0, 10);

    // Create a map for faster nutrition info lookups (by nutrition_id only)
    const nutritionMap: Record<string, any> = {};
    nutritionInfo.forEach(item => {
      if (item.nutrition_id) {
        nutritionMap[item.nutrition_id] = item;
      }
    });

    // Define total nutrients with proper typing
    const total = { calories: 0, protein: 0, carbs: 0, fat: 0 };

    // Filter and process meals for today
    console.log(`TodayStr: ${todayStr}`);
    console.log('mealSchedule dates:', mealSchedule.map(m => m.meal_date));
    const mealsToday = mealSchedule.filter(meal => {
      let mealDateStr = meal.meal_date;
      if (mealDateStr instanceof Date) {
        mealDateStr = mealDateStr.toISOString().slice(0, 10);
      } else if (typeof mealDateStr === 'string' && mealDateStr.length > 10) {
        mealDateStr = mealDateStr.slice(0, 10);
      }
      return mealDateStr === todayStr;
    });
    console.log(`Meals for today (${todayStr}):`, mealsToday);
    mealsToday.forEach(meal => {
      const nut = nutritionMap[meal.nutrition_id];
      if (nut) {
        // Extract nutrient values with fallbacks (do NOT use total_calorie_count or total_protein_count for per-meal sum)
        const calories = nut.calories ?? nut.calories_g ?? 0;
        const protein = nut.protein_g ?? 0;
        const carbs = nut.carbs_g ?? 0;
        const fat = nut.fats_g ?? 0;
        // Add to totals
        total.calories += Number(calories);
        total.protein += Number(protein);
        total.carbs += Number(carbs);
        total.fat += Number(fat);
        console.log(`Matched nutrition for meal (nutrition_id=${meal.nutrition_id}):`, nut);
      } else {
        console.log(`No nutrition info found for meal (nutrition_id=${meal.nutrition_id})`);
      }
    });
    console.log(`DAILY CONSUMED (${todayStr}):`, total);
    return total;
  }

  // Calculate consumed nutrients for the current week
  function getWeekConsumed() {
    const today = getDateInGMT8();
    const nowHour = today.getHours() + today.getMinutes() / 60;

    // Get start of week in GMT+8 (Sunday)
    const startOfWeek = getDateInGMT8();
    startOfWeek.setDate(today.getDate() - today.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    const startStr = startOfWeek.toISOString().slice(0, 10);
    const todayStr = today.toISOString().slice(0, 10);

    console.log(`DEBUG - Week range: ${startStr} to ${todayStr}, current hour: ${nowHour}`);
    console.log(`DEBUG - Total meal schedule entries: ${mealSchedule.length}`);
    console.log(`DEBUG - Total nutrition info entries: ${nutritionInfo.length}`);

    // Inspect nutrition_info IDs and the new field names
    console.log("Available nutrition_info entries with fields:");
    nutritionInfo.forEach(ni => {
      console.log(`nutrition_id: ${ni.nutrition_id}, calories: ${ni.total_calorie_count ?? ni.calories ?? ni.calories_g ?? 0}, protein: ${ni.total_protein_count ?? ni.protein_g ?? 0}`);
    });

    let total = { calories: 0, protein: 0, carbs: 0, fat: 0 };

    const mealsWeek = mealSchedule.filter(meal =>
      meal.meal_date >= startStr && meal.meal_date <= todayStr
    );

    console.log(`DEBUG - Filtered meals for week: ${mealsWeek.length}`);

    // For debugging only - show all meal details
    mealsWeek.forEach(meal => {
      console.log(`DEBUG - Meal: date=${meal.meal_date}, type=${meal.meal_type}, nutrition_id=${meal.nutrition_id}`);
    });

    for (const meal of mealsWeek) {
      let scheduledHour = 0;
      if (meal.meal_type === 'breakfast') scheduledHour = 8;
      else if (meal.meal_type === 'lunch') scheduledHour = 12;
      else if (meal.meal_type === 'dinner') scheduledHour = 19;

      // Skip meals based on time
      if (meal.meal_date === todayStr && nowHour < scheduledHour) {
        console.log(`DEBUG - Skipping meal: Current time ${nowHour} is before scheduled time ${scheduledHour}`);
        continue;
      }

      // Find nutrition info direct match
      const nut = nutritionInfo.find(n => n.nutrition_id === meal.nutrition_id);

      if (nut) {
        // Use only per-meal values (do NOT use total_calorie_count or total_protein_count)
        const calories = nut.calories ?? nut.calories_g ?? 0;
        const protein = nut.protein_g ?? 0;
        total.calories += calories;
        total.protein += protein;
        total.carbs += nut.carbs_g ?? 0;
        total.fat += nut.fats_g ?? 0;
      } else {
        console.log(`DEBUG - NO MATCH FOUND: meal.nutrition_id=${meal.nutrition_id}`);
      }
    }

    console.log(`DEBUG - Final weekly consumed calories: ${total.calories}, protein: ${total.protein}`);
    return total;
  }

  // Separate variables for daily and weekly consumed nutrients
  const dailyConsumed = getTodayConsumed();
  const weeklyConsumed = getWeekConsumed();

  // Get the 5 most recent meals from meal_plan joined with nutrition_info, sorted by date descending
  const todayGMT8 = getDateInGMT8();
  const todayStrGMT8 = todayGMT8.toISOString().slice(0, 10);
  const nowHourGMT8 = todayGMT8.getHours() + todayGMT8.getMinutes() / 60;
  const mealTypes = [
    { type: 'dinner', hour: 20 },
    { type: 'lunch', hour: 12 },
    { type: 'breakfast', hour: 8 },
  ];
  const recentMeals = mealTypes
    .map(({ type }) => {
      // Find the most recent meal of this type for today
      const mealsOfType = mealSchedule.filter(meal => {
        let mealDateStr = meal.meal_date;
        if (mealDateStr instanceof Date) {
          mealDateStr = mealDateStr.toISOString().slice(0, 10);
        } else if (typeof mealDateStr === 'string' && mealDateStr.length > 10) {
          mealDateStr = mealDateStr.slice(0, 10);
        }
        return mealDateStr === todayStrGMT8 && meal.meal_type === type;
      });
      if (mealsOfType.length === 0) return null;
      // Pick the most recent by meal_date
      const meal = mealsOfType.sort((a, b) => new Date(b.meal_date).getTime() - new Date(a.meal_date).getTime())[0];
      const mealPlan = nutritionInfo.find(n => n.nutrition_id === meal.nutrition_id);
      return {
        ...meal,
        calories: mealPlan?.calories ?? mealPlan?.calories_g ?? 0,
        carbs: mealPlan?.carbs_g ?? 0,
        protein: mealPlan?.protein_g ?? 0,
        fat: mealPlan?.fats_g ?? 0,
        item: meal.plan_name || meal.name || meal.meal_type || "Meal",
      };
    })
    .filter(Boolean);
  console.log('recentMeals:', recentMeals);

  // Use correct consumed values for daily/weekly
  const consumed = summaryView === "Weekly" ? weeklyConsumed : dailyConsumed;

// --- Micronutrient Calculation ---
// Recommended Daily Intake (RDI) values for adults (example values, adjust as needed)
const RDI: Record<string, number> = {
  "Vitamin A": 900, // mcg
  "Vitamin C": 90,  // mg
  "Vitamin D": 20,  // mcg
  "Iron": 18,       // mg
};

// Helper to normalize units (convert mg to mcg if needed, etc.)
function parseAmount(amount: string, vitamin: string): number {
  if (!amount) return 0;
  const num = parseFloat(amount);
  if (vitamin === "Vitamin A" || vitamin === "Vitamin D") {
    // mcg
    return num;
  } else if (vitamin === "Vitamin C" || vitamin === "Iron") {
    // mg
    return num;
  }
  return num;
}

// Aggregate consumed micronutrients for the selected period
function getMicronutrientTotals(nutritionInfo: any[], mealSchedule: any[], period: "Daily" | "Weekly") {
  const today = getDateInGMT8();
  const todayStr = today.toISOString().slice(0, 10);
  let relevantMeals: any[] = [];
  if (period === "Daily") {
    relevantMeals = mealSchedule.filter(meal => meal.meal_date === todayStr);
  } else {
    // Weekly: from start of week (Sunday) to today
    const startOfWeek = getDateInGMT8();
    startOfWeek.setDate(today.getDate() - today.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    const startStr = startOfWeek.toISOString().slice(0, 10);
    relevantMeals = mealSchedule.filter(meal => meal.meal_date >= startStr && meal.meal_date <= todayStr);
  }
  // Map nutrition_id to nutritionInfo
  const nutritionMap: Record<string, any> = {};
  nutritionInfo.forEach(item => {
    if (item.nutrition_id) nutritionMap[item.nutrition_id] = item;
  });
  // Sum vitamins
  const micronutrientTotals: Record<string, number> = {};
  relevantMeals.forEach(meal => {
    const nut = nutritionMap[meal.nutrition_id];
    if (nut && nut.vitamins) {
      let vitaminsArr: any[] = [];
      try {
        vitaminsArr = typeof nut.vitamins === 'string' ? JSON.parse(nut.vitamins) : nut.vitamins;
      } catch {
        vitaminsArr = [];
      }
      if (Array.isArray(vitaminsArr)) {
        vitaminsArr.forEach((v: any) => {
          if (v.name && v.amount) {
            const amt = parseAmount(v.amount, v.name);
            micronutrientTotals[v.name] = (micronutrientTotals[v.name] || 0) + amt;
          }
        });
      }
    }
  });
  return micronutrientTotals;
}

const micronutrientTotals = getMicronutrientTotals(nutritionInfo, mealSchedule, summaryView);
const micronutrients = Object.keys(RDI).map(name => {
  const consumed = micronutrientTotals[name] || 0;
  const percent = Math.round((consumed / RDI[name]) * 100);
  return {
    name,
    percent: percent > 100 ? 100 : percent,
    color: "#10B981"
  };
});

  const nutritionData = {
    calories: {
      consumed: consumed.calories,
      goal: goalNutrients.calories * (summaryView === "Weekly" ? 7 : 1),
      color: "#10B981",
    },
    macronutrients: {
      carbs: { consumed: consumed.carbs, goal: goalNutrients.carbs * (summaryView === "Weekly" ? 7 : 1), color: "#34D399" },
      protein: { consumed: consumed.protein, goal: goalNutrients.protein * (summaryView === "Weekly" ? 7 : 1), color: "#10B981" },
      fat: { consumed: consumed.fat, goal: goalNutrients.fat * (summaryView === "Weekly" ? 7 : 1), color: "#059669" },
    },
    micronutrients,
    macronutrientSplit: [
      { name: "Carbs", percent: 51, color: "#34D399" }, // Emerald 400
      { name: "Protein", percent: 36, color: "#10B981" }, // Emerald 500
      { name: "Fat", percent: 13, color: "#059669" }, // Emerald 600
    ],
  };

  // Calculate weekly calories and goals from nutritionInfo if summaryView is Weekly
  let weeklyCaloriesData = weeklyCalories;
  let weeklyAvgData = weeklyAvg;
  let weeklyGoal = goalNutrients;
  let userNutritionInfo: any[] = nutritionInfo;
  if (summaryView === "Weekly") {
    // Always multiply all goals by 7 for weekly view, even if no nutritionInfo
    weeklyGoal = {
      calories: goalNutrients.calories * 7,
      carbs: goalNutrients.carbs * 7,
      protein: goalNutrients.protein * 7,
      fat: goalNutrients.fat * 7
    };
    // Group by day (assuming nutritionInfo has a created_at date)
    const daysMap: Record<string, { consumed: number; goal: number }> = {};
    // Only include nutritionInfo entries that belong to the logged-in user
    userNutritionInfo = nutritionInfo.filter((entry: any) => {
      if (entry.user_id && userProfile?.id) return entry.user_id === userProfile.id;
      const meal = mealSchedule.find((m: any) => m.nutrition_id === entry.nutrition_id);
      return meal && meal.user_id === userProfile?.id;
    });
    userNutritionInfo.forEach((entry: any) => {
      const date = new Date(entry.created_at);
      const day = date.toLocaleDateString("en-US", { weekday: "short" });
      if (!daysMap[day]) {
        daysMap[day] = { consumed: 0, goal: weeklyGoal.calories / 7 };
      }
      daysMap[day].consumed += entry.calories ?? entry.calories_g ?? 0;
    });
    // Fill in all 7 days for the week
    const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    weeklyCaloriesData = weekDays.map(day => ({
      day,
      consumed: daysMap[day]?.consumed || 0,
      goal: weeklyGoal.calories / 7 // Always use weekly goal divided by 7 for each day
    }));
    weeklyAvgData = Math.round(
      weeklyCaloriesData.reduce((acc, d) => acc + d.consumed, 0) / weeklyCaloriesData.length
    );
  }

  // Use weekly goals in nutritionData if summaryView is Weekly
  const nutritionDataToUse = summaryView === "Weekly"
    ? {
      calories: {
        consumed: weeklyCaloriesData.reduce((acc, d) => acc + d.consumed, 0),
        goal: weeklyGoal.calories,
        color: "#10B981",
      },
      macronutrients: {
        carbs: { consumed: userNutritionInfo.reduce((acc: number, n: any) => acc + (n.carbs_g || 0), 0), goal: weeklyGoal.carbs, color: "#34D399" },
        protein: { consumed: userNutritionInfo.reduce((acc: number, n: any) => acc + (n.protein_g || 0), 0), goal: weeklyGoal.protein, color: "#10B981" },
        fat: { consumed: userNutritionInfo.reduce((acc: number, n: any) => acc + (n.fats_g || 0), 0), goal: weeklyGoal.fat, color: "#059669" },
      },
      micronutrients: nutritionData.micronutrients,
      macronutrientSplit: [
        { name: "Carbs", percent: Math.round((userNutritionInfo.reduce((acc: number, n: any) => acc + (n.carbs_g || 0), 0) / (userNutritionInfo.reduce((acc: number, n: any) => acc + (n.carbs_g || 0), 0) + userNutritionInfo.reduce((acc: number, n: any) => acc + (n.protein_g || 0), 0) + userNutritionInfo.reduce((acc: number, n: any) => acc + (n.fats_g ?? 0), 0))) * 100) || 0, color: "#34D399" },
        { name: "Protein", percent: Math.round((userNutritionInfo.reduce((acc: number, n: any) => acc + (n.protein_g || 0), 0) / (userNutritionInfo.reduce((acc: number, n: any) => acc + (n.carbs_g || 0), 0) + userNutritionInfo.reduce((acc: number, n: any) => acc + (n.protein_g || 0), 0) + userNutritionInfo.reduce((acc: number, n: any) => acc + (n.fats_g ?? 0), 0))) * 100) || 0, color: "#10B981" },
        { name: "Fat", percent: Math.round((userNutritionInfo.reduce((acc: number, n: any) => acc + (n.fats_g ?? 0), 0) / (userNutritionInfo.reduce((acc: number, n: any) => acc + (n.carbs_g ?? 0), 0) + userNutritionInfo.reduce((acc: number, n: any) => acc + (n.protein_g ?? 0), 0) + userNutritionInfo.reduce((acc: number, n: any) => acc + (n.fats_g ?? 0), 0))) * 100) || 0, color: "#059669" }
      ]
    }
    : nutritionData;

  const caloriePercent = Math.round(
    (nutritionDataToUse.calories.consumed / nutritionDataToUse.calories.goal) * 100
  );

  // --- Nutrition Visualization Data Calculation ---
  // This is separate from the summary card and does NOT depend on summaryView
  let vizWeeklyCaloriesData = weeklyCalories.map(day => ({
    ...day,
    goal: goalNutrients.calories // always daily goal for visualization
  }));
  let vizWeeklyAvgData = Math.round(
    vizWeeklyCaloriesData.reduce((acc, d) => acc + d.consumed, 0) / vizWeeklyCaloriesData.length
  );

  // --- Macronutrient Split Calculation for Visualization ---
  // Calculate total consumed for each macro from mealSchedule and nutritionInfo for each day of the week (Mon-Sun)
  const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const nutritionMap = Object.fromEntries(nutritionInfo.map(item => [item.nutrition_id, item]));
  // Map: { [weekday]: { carbs, protein, fat, consumed } }
  const vizMacrosByDay: Record<string, { carbs: number; protein: number; fat: number; consumed: number }> = {};
  weekDays.forEach(day => {
    vizMacrosByDay[day] = { carbs: 0, protein: 0, fat: 0, consumed: 0 };
  });
  mealSchedule.forEach(meal => {
    const date = new Date(meal.meal_date);
    const weekday = date.toLocaleDateString("en-US", { weekday: "short" });
    if (weekDays.includes(weekday)) {
      const nut = nutritionMap[meal.nutrition_id];
      if (nut) {
        vizMacrosByDay[weekday].carbs += Number(nut.carbs_g ?? 0);
        vizMacrosByDay[weekday].protein += Number(nut.protein_g ?? 0);
        vizMacrosByDay[weekday].fat += Number(nut.fats_g ?? 0);
        vizMacrosByDay[weekday].consumed += Number(nut.calories ?? nut.calories_g ?? 0);
      }
    }
  });
  // vizMacrosByDay now contains the macro and calorie data for each weekday
  // You can use vizMacrosByDay as needed for further visualization or debugging
  console.log('Macros and calories by weekday:', vizMacrosByDay);

  // Calculate total consumed for each macro from mealSchedule and nutritionInfo for today (in GMT+8)
  const today = new Date(new Date().getTime() + (8 - new Date().getTimezoneOffset() / 60) * 60 * 60 * 1000);
  const todayStr = today.toISOString().slice(0, 10);
  const mealsToday = mealSchedule.filter(meal => meal.meal_date === todayStr);
  let vizCarbs = 0, vizProtein = 0, vizFat = 0;
  mealsToday.forEach(meal => {
    const nut = nutritionMap[meal.nutrition_id];
    if (nut) {
      vizCarbs += Number(nut.carbs_g ?? 0);
      vizProtein += Number(nut.protein_g ?? 0);
      vizFat += Number(nut.fats_g ?? 0);
    }
  });
  const vizMacroTotal = vizCarbs + vizProtein + vizFat;
  const vizMacronutrientSplit = vizMacroTotal > 0 ? [
    { name: "Carbs", percent: Math.round((vizCarbs / vizMacroTotal) * 100), color: "#34D399" },
    { name: "Protein", percent: Math.round((vizProtein / vizMacroTotal) * 100), color: "#10B981" },
    { name: "Fat", percent: Math.round((vizFat / vizMacroTotal) * 100), color: "#059669" }
  ] : [
    { name: "Carbs", percent: 0, color: "#34D399" },
    { name: "Protein", percent: 0, color: "#10B981" },
    { name: "Fat", percent: 0, color: "#059669" }
  ];

  // Log the nutritionData prop for NutritionVisualizationCard
  console.log('NutritionVisualizationCard nutritionData:', {
    ...nutritionDataToUse,
    macronutrientSplit: vizMacronutrientSplit,
  });

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
          nutritionData={nutritionDataToUse}
          caloriePercent={caloriePercent}
        />
        <NutritionVisualizationCard
          visualizationTab={visualizationTab}
          setVisualizationTab={setVisualizationTab}
          nutritionData={{
            ...nutritionDataToUse,
            macronutrientSplit: vizMacronutrientSplit,
          }}
          weeklyCalories={vizWeeklyCaloriesData}
          weeklyAvg={vizWeeklyAvgData}
          meals={mealSchedule.map(meal => ({ meal_date: meal.meal_date, calories: (nutritionInfo.find(n => n.nutrition_id === meal.nutrition_id)?.calories ?? nutritionInfo.find(n => n.nutrition_id === meal.nutrition_id)?.calories_g ?? 0) }))}
          dailyCalorieGoal={goalNutrients.calories}
        />
        <div className="lg:col-span-2">
          <MealLogCard recentMeals={recentMeals} />
        </div>
      </div>
    </div>
  );
}
