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
      // Fetch nutrition_info
      const { data, error } = await supabase
        .from("nutrition_info")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (error) {
        setNutritionInfo([]);
      } else {
        setNutritionInfo(data || []);
      }
      // Fetch meal_schedule for this user
      const { data: mealData, error: mealError } = await supabase
        .from("meal_schedule")
        .select("*")
        .eq("user_id", user.id)
        .order("meal_date", { ascending: true });
      if (!mealError) {
        setMealSchedule(mealData || []);
      } else {
        setMealSchedule([]);
      }
      // Fetch Users table
      const { data: userData, error: userError } = await supabase
        .from("Users")
        .select("*")
        .eq("id", user.id)
        .single();
      if (!userError) {
        setUserProfile(userData);
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    }
    fetchNutritionInfo();
  }, []);

  const goalNutrients = calculateGoalNutrients(userProfile);

  // Calculate consumed nutrients for today
  function getTodayConsumed() {
    const today = new Date();
    const todayStr = today.toISOString().slice(0, 10);
    const now = today.getHours() + today.getMinutes() / 60;
    // Filter meals for today and only those whose time has passed
    const mealsToday = mealSchedule.filter((meal) => {
      if (meal.meal_date !== todayStr) return false;
      if (meal.meal_type === 'breakfast' && now < 8) return false;
      if (meal.meal_type === 'lunch' && now < 12) return false;
      if (meal.meal_type === 'dinner' && now < 19) return false;
      return true;
    });
    // Sum nutrients from nutrition_info for each meal
    let total = { calories: 0, protein: 0, carbs: 0, fat: 0 };
    for (const meal of mealsToday) {
      const nut = nutritionInfo.find((n) => n.nutrition_id === meal.nutrition_id);
      if (nut) {
        // Use the new field names with fallbacks to the old names
        total.calories += nut.total_calorie_count ?? nut.calories ?? nut.calories_g ?? 0;
        total.protein += nut.total_protein_count ?? nut.protein_g ?? 0;
        total.carbs += nut.carbs_g ?? 0;
        total.fat += nut.fats_g ?? 0;
      }
    }
    return total;
  }

  // Calculate consumed nutrients for the current week
  function getWeekConsumed() {
    const today = new Date();
    const nowHour = today.getHours() + today.getMinutes() / 60;
  
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay()); // Sunday
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
        // Use the new field names (total_calorie_count and total_protein_count) with fallbacks to the old names
        const calories = nut.total_calorie_count ?? nut.calories ?? nut.calories_g ?? 0;
        const protein = nut.total_protein_count ?? nut.protein_g ?? 0;
        
        console.log(`DEBUG - FOUND MATCH: meal.nutrition_id=${meal.nutrition_id}, calories=${calories}, protein=${protein}`);
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

  // Alert the weekly consumed calories for debugging
  useEffect(() => {
    if (summaryView === "Weekly") {
      alert(`Weekly consumed calories: ${weeklyConsumed.calories}`);
    }
  }, [summaryView, weeklyConsumed.calories]);

  // Use correct consumed values for daily/weekly
  const consumed = summaryView === "Weekly" ? weeklyConsumed : dailyConsumed;

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

  // Calculate weekly calories and goals from nutritionInfo if summaryView is Weekly
  let weeklyCaloriesData = weeklyCalories;
  let weeklyAvgData = weeklyAvg;
  let weeklyGoal = goalNutrients;
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
    nutritionInfo.forEach((entry: any) => {
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
          carbs: { consumed: nutritionInfo.reduce((acc, n) => acc + (n.carbs_g || 0), 0), goal: weeklyGoal.carbs, color: "#34D399" },
          protein: { consumed: nutritionInfo.reduce((acc, n) => acc + (n.protein_g || 0), 0), goal: weeklyGoal.protein, color: "#10B981" },
          fat: { consumed: nutritionInfo.reduce((acc, n) => acc + (n.fats_g || 0), 0), goal: weeklyGoal.fat, color: "#059669" },
        },
        micronutrients: nutritionData.micronutrients,
        macronutrientSplit: nutritionData.macronutrientSplit,
      }
    : nutritionData;

  const caloriePercent = Math.round(
    (nutritionDataToUse.calories.consumed / nutritionDataToUse.calories.goal) * 100
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
          nutritionData={nutritionDataToUse}
          caloriePercent={caloriePercent}
        />
        <NutritionVisualizationCard
          visualizationTab={visualizationTab}
          setVisualizationTab={setVisualizationTab}
          nutritionData={nutritionDataToUse}
          weeklyCalories={weeklyCaloriesData}
          weeklyAvg={weeklyAvgData}
        />
        <div className="lg:col-span-2">
          <MealLogCard />
        </div>
      </div>
    </div>
  );
}
