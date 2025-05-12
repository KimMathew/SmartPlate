"use client";

import React, { useState, useEffect } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Share, Printer, Coffee, Utensils, ChefHat } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export default function SchedulePage() {
  const [date, setDate] = useState<Date>(new Date());
  // Remove mealPlan state, only use savedMeals (from meal_schedule)
  const [savedMeals, setSavedMeals] = useState<any[]>([]); // from meal_schedule
  const [mergedMealPlan, setMergedMealPlan] = useState<any[] | null>(null); // null = not ready
  const [addMealDialog, setAddMealDialog] = useState<{ open: boolean, date: Date | null, type: string | null }>({ open: false, date: null, type: null });
  const [newMealName, setNewMealName] = useState("");
  const [loading, setLoading] = useState(false);
  const [weekDayLabels, setWeekDayLabels] = useState<string[]>([]);
  const [weekDayDates, setWeekDayDates] = useState<string[]>([]);
  const [isClient, setIsClient] = useState(false);

  // Set isClient to true after mount
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Extracted fetch logic
  async function loadMealPlan() {
    const { createClient } = await import("@/lib/supabase");
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    const user = session?.user;
    if (!user?.id) return;

    const { data: scheduleMeals } = await supabase
      .from('meal_schedule')
      .select('plan_id, meal_name, meal_date, user_id, recipe_id, nutrition_id, meal_type, schedule_id')
      .eq('user_id', user.id);

    console.log('Fetched scheduleMeals:', scheduleMeals); // <-- Log fetched data

    let grouped: Record<string, any[]> = {};
    if (scheduleMeals && scheduleMeals.length > 0) {
      for (const meal of scheduleMeals) {
        const mealDate = meal.meal_date;
        // Use meal_type if available, otherwise infer from meal_name
        let type = meal.meal_type || 'breakfast';
        if (!meal.meal_type && meal.meal_name) {
          const name = meal.meal_name.toLowerCase();
          if (name.includes('lunch')) type = 'lunch';
          else if (name.includes('dinner')) type = 'dinner';
          else if (name.includes('breakfast')) type = 'breakfast';
        }
        grouped[mealDate] = grouped[mealDate] || [];
        grouped[mealDate].push({
          ...meal,
          name: meal.meal_name,
          type,
          schedule_id: meal.schedule_id, // ensure schedule_id is present
          source: 'schedule'
        });
      }
    }
    const savedArr = Object.entries(grouped).map(([start_date, meals]) => ({ start_date, meals }));
    setSavedMeals(savedArr);
  }

  // Fetch only meal_schedule on mount
  useEffect(() => {
    loadMealPlan();
  }, []);

  function getMealTypeIcon(type: string) {
    switch (type.toLowerCase()) {
      case "breakfast":
        return <Coffee className="w-5 h-5" />;
      case "lunch":
        return <Utensils className="w-5 h-5" />;
      case "dinner":
        return <ChefHat className="w-5 h-5" />;
      default:
        return null;
    }
  }

  // Calculate the start of the week (Sunday)
  const startOfWeek = new Date(date);
  startOfWeek.setDate(date.getDate() - date.getDay());

  // Generate week days
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const day = new Date(startOfWeek);
    day.setDate(startOfWeek.getDate() + i);
    return day;
  });

  const mealTypes = ["breakfast", "lunch", "dinner"];

  // Helper to find a meal for a given date and type
  function getLocalDateString(date: Date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }  // Merge meal_schedule (savedMeals) and localStorage custom meals for display (client only)
  useEffect(() => {
    if (!isClient) return;
    // Saved meals from meal_schedule
    const schedulePlan = savedMeals;
    // Local custom meals
    let customMeals: Record<string, any[]> = {};
    try {
      customMeals = JSON.parse(window.localStorage.getItem('customMeals') || '{}');
    } catch {}
    // Merge: for each day, meal_schedule > custom
    const allDates = new Set([
      ...schedulePlan.map((d: any) => d.start_date),
      ...Object.keys(customMeals)
    ]);
    const merged: any[] = [];
    
    for (const date of allDates) {
      // 1. meal_schedule
      const scheduleDay = schedulePlan.find((d: any) => d.start_date === date);
      // 2. custom
      const customDayMeals = customMeals[date] || [];
      let meals: any[] = [];
      
      // Add meal_schedule meals first with type verification
      if (scheduleDay && scheduleDay.meals) {
        // Make sure all meals have a type assigned
        const processedMeals = scheduleDay.meals.map((meal: { name?: string; type?: string }) => {
          // If meal doesn't have a type, infer from name
          if (!meal.type) {
            let inferredType = 'breakfast'; // Default
            if (meal.name) {
              const name = meal.name.toLowerCase();
              if (name.includes('breakfast')) inferredType = 'breakfast';
              else if (name.includes('lunch')) inferredType = 'lunch';
              else if (name.includes('dinner')) inferredType = 'dinner';
            }
            return { ...meal, type: inferredType };
          }
          return meal;
        });
        
        meals = [...processedMeals];
      }
      
      // Add custom meals if type not present
      for (const customMeal of customDayMeals) {
        if (!meals.some((m: any) => (m.type || m.plan_type) === customMeal.type)) {
          meals.push(customMeal);
        }
      }
      
      // Only add days with meals
      if (meals.length > 0) {
        merged.push({ start_date: date, meals });
      }
    }
    
    console.log("Merged meal plan:", merged);
    setMergedMealPlan(merged);
  }, [savedMeals, isClient, date]);

  // Precompute week day labels and date strings for rendering (avoid SSR/CSR mismatch)
  useEffect(() => {
    const labels: string[] = [];
    const dates: string[] = [];
    for (const day of weekDays) {
      labels.push(day.toLocaleDateString('en-US', { weekday: 'short' }));
      dates.push(getLocalDateString(day));
    }
    setWeekDayLabels(labels);
    setWeekDayDates(dates);
  }, [date]);  function getMealForDateAndType(date: Date, type: string) {
    if (!mergedMealPlan) return null;
    const dateStr = getLocalDateString(date);

    for (const day of mergedMealPlan) {
      if (day.start_date === dateStr && day.meals && day.meals.length > 0) {
        // Only return a meal if it matches the requested type
        const meal = day.meals.find((m: any) => m.type && m.type.toLowerCase() === type.toLowerCase());
        if (meal) {
          return meal;
        }
        // No fallback: do not return a meal if type does not match
        return null;
      }
    }
    return null;
  }

  // Add meal handler
  async function handleAddMeal() {
    if (!addMealDialog.date || !addMealDialog.type || !newMealName) return;
    setLoading(true);
    const dateStr = getLocalDateString(addMealDialog.date);
     try {
      // Try to insert into Supabase meal_schedule if user is logged in
      const { createClient } = await import("@/lib/supabase");
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user;
      if (user?.id) {
        // Insert into meal_schedule table
        const { error } = await supabase.from('meal_schedule').insert([
          {
            user_id: user.id,
            meal_name: newMealName,
            meal_date: dateStr,
            meal_type: addMealDialog.type,
            recipe_id: null,
            nutrition_id: null
          }
        ]);
        if (error) {
          alert("Failed to add meal to meal_schedule: " + error.message);
        } else {
          // Refresh meal plan from Supabase
          await loadMealPlan();
        }
      } else {
        // Not logged in: fallback to localStorage custom meal
        let customMeals: Record<string, any[]> = {};
        try {
          customMeals = JSON.parse(window.localStorage.getItem('customMeals') || '{}');
        } catch {}
        if (!customMeals[dateStr]) customMeals[dateStr] = [];
        // Prevent duplicate meal type for the same day
        customMeals[dateStr] = customMeals[dateStr].filter((m: any) => m.type !== addMealDialog.type);
        customMeals[dateStr].push({
          start_date: dateStr,
          type: addMealDialog.type,
          name: newMealName,
          description: '',
          calories: 0,
          protein: 0,
          carbs: 0,
          fats: 0,
          ingredients: [],
          instructions: [],
          prepTime: 0,
          difficulty: 'medium',
        });
        window.localStorage.setItem('customMeals', JSON.stringify(customMeals));
        setSavedMeals((prev) => [...prev]);
      }
    } catch (err: any) {
      alert("An error occurred while adding the meal. " + (err?.message ? err.message : String(err)));
    } finally {
      setLoading(false);
      setAddMealDialog({ open: false, date: null, type: null });
      setNewMealName("");
    }
  }

  // Update delete handler to show confirmation before deleting
  async function handleDeleteMeal(meal: any, dateStr: string, type: string) {
    if (!window.confirm(`Are you sure you want to delete the meal '${meal.name}' for ${type} on ${dateStr}?`)) {
      return;
    }
    setLoading(true);
    if (meal.source === 'schedule') {
      // Delete from meal_schedule using meal_name, meal_date, and meal_type (AND logic)
      const { createClient } = await import("@/lib/supabase");
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user;
      if (!user?.id) {
        setLoading(false);
        alert("You must be logged in to delete a meal.");
        return;
      }
      // Remove scheduleId check, delete by meal_name, meal_date, meal_type
      console.log('Attempting to delete meal with', meal.name, dateStr, type, 'for user:', user.id);
      const { error: delError, data: delData } = await supabase
        .from('meal_schedule')
        .delete()
        .eq('meal_name', meal.name)
        .eq('meal_date', dateStr)
        .eq('meal_type', type);
      console.log('Delete result:', { delError, delData });
      setLoading(false);
      if (delError) {
        alert("Failed to delete meal from meal_schedule: " + delError.message);
        return;
      }
      // Refresh meal plan after deletion
      await loadMealPlan();
    } else {
      // Delete from localStorage (custom meal)
      let customMeals: Record<string, any[]> = {};
      try {
        customMeals = JSON.parse(window.localStorage.getItem('customMeals') || '{}');
      } catch {}
      if (customMeals[dateStr]) {
        customMeals[dateStr] = customMeals[dateStr].filter((m: any) => m.type !== type);
        if (customMeals[dateStr].length === 0) {
          delete customMeals[dateStr];
        }
        window.localStorage.setItem('customMeals', JSON.stringify(customMeals));
      }
      setLoading(false);
      // Refresh merged meal plan
      setSavedMeals((prev) => [...prev]);
    }
  }
  // Add a refresh handler to re-fetch meal_schedule
  async function handleRefreshMeals() {
    setLoading(true);
    const { createClient } = await import("@/lib/supabase");
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    const user = session?.user;
    if (!user?.id) {
      setLoading(false);
      return;
    }    const { data: scheduleMeals } = await supabase
      .from('meal_schedule')
      .select('plan_id, meal_name, meal_date, user_id, recipe_id, nutrition_id, meal_type')
      .eq('user_id', user.id);
    let grouped: Record<string, any[]> = {};
    if (scheduleMeals && scheduleMeals.length > 0) {
      for (const meal of scheduleMeals) {
        const date = meal.meal_date;
        // Use meal_type if available, otherwise infer from meal_name
        let type = meal.meal_type || 'breakfast'; // Use meal_type if available
        
        // If meal_type is not available, infer from meal_name
        if (!meal.meal_type && meal.meal_name) {
          const name = meal.meal_name.toLowerCase();
          if (name.includes('breakfast')) type = 'breakfast';
          else if (name.includes('lunch')) type = 'lunch';
          else if (name.includes('dinner')) type = 'dinner';
        }
        
        if (!grouped[date]) grouped[date] = [];
        grouped[date].push({
          name: meal.meal_name,
          type: type, // Use the determined type
          source: 'schedule',
          ...meal
        });
      }
    }
    const savedArr = Object.entries(grouped).map(([start_date, meals]) => ({ start_date, meals }));
    setSavedMeals(savedArr);
    setLoading(false);
  }  // Handler for Load Meal Plan button
  async function handleLoadMealPlan() {
    setLoading(true);
    const { createClient } = await import("@/lib/supabase");
    const supabase = createClient();
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    const user = session?.user;
    console.log('User session:', user);
    if (!user?.id) {
      setLoading(false);
      alert("No user session found. Please log in.");
      return;
    }
    try {
      const { data: scheduleMeals, error } = await supabase
        .from('meal_schedule')
        .select('plan_id, meal_name, meal_date, user_id, recipe_id, nutrition_id, meal_type')
        .eq('user_id', user.id);

      // 🧪 Log scheduleMeals and verify structure and presence of meal_type
      console.log('Loaded scheduleMeals:', scheduleMeals);
      if (Array.isArray(scheduleMeals)) {
        scheduleMeals.forEach((meal, idx) => {
          console.log(`Meal[${idx}]:`, meal, 'meal_type:', meal.meal_type);
        });
        // 🧪 Alert the first 10 meals for debugging
        alert('Fetched meals (up to 10):\n' + scheduleMeals.slice(0, 10).map((m, i) => `${i + 1}. ${m.meal_name} (${m.meal_type || 'unknown'}) on ${m.meal_date}`).join('\n'));
      } else {
        alert('No meals fetched. scheduleMeals is: ' + JSON.stringify(scheduleMeals));
      }

      if (error) {
        console.error("Error fetching meals:", error);
        alert("Failed to load meal plan. Please try again.\n" + error.message);
        setLoading(false);
        return;
      }

      // Clear any existing custom meals to avoid conflicts
      window.localStorage.setItem('customMeals', JSON.stringify({}));

      let grouped: Record<string, any[]> = {};
      if (scheduleMeals && scheduleMeals.length > 0) {
        for (const meal of scheduleMeals) {
          const mealDate = meal.meal_date;
          // Use meal_type if available, otherwise infer from meal_name
          let type = meal.meal_type || 'breakfast';
          if (!meal.meal_type && meal.meal_name) {
            const name = meal.meal_name.toLowerCase();
            if (name.includes('breakfast')) type = 'breakfast';
            else if (name.includes('lunch')) type = 'lunch';
            else if (name.includes('dinner')) type = 'dinner';
          }
          if (!grouped[mealDate]) grouped[mealDate] = [];
          grouped[mealDate].push({
            name: meal.meal_name,
            type: type, // Use the determined type
            source: 'schedule',
            ...meal
          });
        }
      }

      const savedArr = Object.entries(grouped).map(([start_date, meals]) => ({ start_date, meals }));
      setSavedMeals(savedArr);
      // 🧪 Log after setSavedMeals to verify re-render
      console.log('setSavedMeals called with:', savedArr);

      // 🔄 Use a real state change to force re-render (advance date by 1ms)
      setDate(prev => new Date(prev.getTime() + 1));
      // 🧠 savedMeals triggers mergedMealPlan and re-renders calendar via useEffect
    } catch (err) {
      console.error("Error in handleLoadMealPlan:", err);
      alert("An error occurred while loading the meal plan.\n" + (typeof err === 'object' && err !== null && 'message' in err ? (err as any).message : String(err)));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-gray-900">
            Meal Scheduling
          </h1>
          <p className="text-gray-500 dark:text-gray-300 mb-2">
            Set your meal times and get a personalized plan tailored to your lifestyle and diet
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="flex items-center gap-2">
            <Printer className="h-4 w-4" />
            Print
          </Button>
          <Button variant="outline" size="sm" className="flex items-center gap-2">
            <Share className="h-4 w-4" />
            Share
          </Button>
          <Button variant="outline" size="sm" className="flex items-center gap-2" onClick={handleRefreshMeals} disabled={loading}>
            Refresh
          </Button>
        </div>
      </div>

      <div className="flex items-center justify-between mb-4">
        <Button variant="outline" size="sm" className="flex items-center gap-2" onClick={handleLoadMealPlan} disabled={loading}>
          Load Meal Plan
        </Button>
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => {
              const prevWeek = new Date(date);
              prevWeek.setDate(date.getDate() - 7);
              setDate(prevWeek);
            }}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm font-medium">
            Week of {startOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </span>
          <Button
            variant="outline"
            size="icon"
            onClick={() => {
              const nextWeek = new Date(date);
              nextWeek.setDate(date.getDate() + 7);
              setDate(nextWeek);
            }}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Card className="p-2 max-sm:p-1">
        <div className="grid grid-cols-8 border-b"> 
          <div className="p-4 border-r"></div>
          {weekDayLabels.map((label, index) => (
            <div
              key={index}
              className="p-4 max-sm:p-1 text-center border-r last:border-r-0"
            >
              <div className="text-sm text-gray-500 max-sm:text-xs">
                {day.toLocaleDateString('en-US', { weekday: 'short' })}
              </div>
              <div className={`text-lg max-sm:text-sm font-semibold ${day.toDateString() === new Date().toDateString() ? 'text-emerald-500' : ''
                }`}>
                {day.getDate()}
              </div>
              <div className="text-sm max-sm:text-xs text-gray-500">
                {day.toLocaleDateString('en-US', { month: 'short' })}
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-8" >
          {mealTypes.map((mealType) => (
            <React.Fragment key={mealType}>
              <div className="w-auto lg:pl-4 md:p-2 p-0 border-r border-b flex items-center">
                <span className="hidden lg:block bg-emerald-50 p-1.5 rounded-full text-emerald-500 group-hover:bg-emerald-100 group-hover:text-emerald-600 transition-colors duration-200 mr-2">
                  {getMealTypeIcon(mealType)}
                </span>
                <span className="capitalize max-sm:text-xs text-gray-600 font-medium text-base overflow-x-hidden">{mealType}</span>
              </div>
              {weekDays.map((day, dayIndex) => {
                const meal = getMealForDateAndType(day, mealType);
                return (
                  <div
                    key={`${mealType}-${dayIndex}`}
                    className="lg:p-4 md:p-2 p-[4px] border-r border-b last:border-r-0"
                  >
                    {meal ? (
                      <div className="bg-emerald-50 rounded-lg p-2 max-sm:p-1 text-center space-y-2 border border-emerald-300">
                        <div className="overflow-hidden font-semibold text-emerald-700 text-sm max-sm:text-xs">{meal.name}</div>
                        <Badge variant="outline" className="bg-amber-50 hidden lg:block border-amber-100 text-amber-700">
                          🔥 {meal.calories} cal
                        </Badge>
                        
                      </div>
                    ) : (
                      <Button
                        variant="outline"
                        className="max-sm:p-1 w-full h-full min-h-[60px] border-dashed text-xs flex items-center justify-center"
                      >
                        <span className="hidden lg:inline-block md:inline-block lg:text-xs md:text-[10px]">+ Add {mealType}</span>
                        <span className="text-lg font-extralight inline-block lg:hidden md:hidden text-center w-full">+</span>
                      </Button>
                    )}
                  </div>
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </Card>
    </div>
  );
}
