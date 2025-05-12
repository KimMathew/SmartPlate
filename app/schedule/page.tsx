"use client";

import React, { useState, useEffect } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Share, Printer } from "lucide-react";

export default function SchedulePage() {
  const [date, setDate] = useState<Date>(new Date());
  const [mealPlan, setMealPlan] = useState<any[]>([]);

  // Remove loading meal plan from localStorage
  useEffect(() => {
    setMealPlan([]);
  }, []);

  // Auto-load meal plan on mount if user is logged in
  useEffect(() => {
    (async () => {
      const { createClient } = await import("@/lib/supabase");
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user;
      if (!user?.id) return;
      const { data: maxBatchResult } = await supabase
        .from('meal_plan')
        .select('batch_number')
        .eq('user_id', user.id)
        .order('batch_number', { ascending: false })
        .limit(1);
      const maxBatchNumber = maxBatchResult?.[0]?.batch_number;
      if (!maxBatchNumber) return;
      const { data: mealPlans } = await supabase
        .from('meal_plan')
        .select(`plan_id, day, start_date, plan_type, plan_name, description, recipe_id, nutrition_id, batch_number, user_id, recipe:recipe_id (title, ingredients, instruction, prep_time), nutrition:nutrition_id (calories, protein_g, carbs_g, fats_g)`)
        .eq('user_id', user.id)
        .eq('batch_number', maxBatchNumber)
        .order('day', { ascending: true });
      if (!mealPlans || mealPlans.length === 0) return;
      const plansByDay: Record<string, any[]> = {};
      mealPlans.forEach((plan: any) => {
        const date = plan.start_date;
        if (!plansByDay[date]) plansByDay[date] = [];
        plansByDay[date].push(plan);
      });
      const formattedPlan = Object.entries(plansByDay).map(([start_date, meals]) => ({
        start_date,
        meals: (meals as any[]).map((meal: any) => ({
          type: meal.plan_type,
          name: meal.plan_name,
          description: meal.description,
          calories: meal.nutrition?.calories || 0,
          protein: meal.nutrition?.protein_g || 0,
          carbs: meal.nutrition?.carbs_g || 0,
          fats: meal.nutrition?.fats_g || 0,
          ingredients: meal.recipe?.ingredients ? JSON.parse(meal.recipe.ingredients) : [],
          instructions: meal.recipe?.instruction ? JSON.parse(meal.recipe.instruction) : [],
          prepTime: meal.recipe?.prep_time || 0,
          difficulty: 'medium',
        }))
      }));
      setMealPlan(formattedPlan);
    })();
  }, []);

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
  }
  function getMealForDateAndType(date: Date, type: string) {
    const dateStr = getLocalDateString(date);
    for (const day of mealPlan) {
      if (day.start_date === dateStr) {
        const meal = day.meals.find((m: any) => m.type?.toLowerCase() === type.toLowerCase());
        if (meal) return meal;
      }
    }
    return null;
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
        </div>
      </div>

      <div className="flex items-center justify-between mb-4">
        <Button variant="outline" size="sm" className="flex items-center gap-2">
          Weekly View
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
          {weekDays.map((day, index) => (
            <div
              key={index}
              className="p-4 max-sm:p-1 text-center border-r last:border-r-0"
            >
              <div className="text-sm text-gray-500">
                {day.toLocaleDateString('en-US', { weekday: 'short' })}
              </div>
              <div className={`text-lg font-semibold ${day.toDateString() === new Date().toDateString() ? 'text-emerald-500' : ''
                }`}>
                {day.getDate()}
              </div>
              <div className="text-sm text-gray-500">
                {day.toLocaleDateString('en-US', { month: 'short' })}
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-8">
          {mealTypes.map((mealType) => (
            <React.Fragment key={mealType}>
              <div className="p-4 border-r border-b flex items-center">
                <span className="capitalize text-sm text-gray-600">{mealType}</span>
              </div>
              {weekDays.map((day, dayIndex) => {
                const meal = getMealForDateAndType(day, mealType);
                return (
                  <div
                    key={`${mealType}-${dayIndex}`}
                    className="p-4 border-r border-b last:border-r-0"
                  >
                    {meal ? (
                      <div className="bg-emerald-50 rounded-lg p-2 text-center">
                        <div className="font-semibold text-emerald-700">{meal.name}</div>
                        <div className="text-xs text-gray-500">{meal.calories} cal</div>
                      </div>
                    ) : (
                      <Button
                        variant="outline"
                        className="w-full h-full min-h-[60px] border-dashed"
                      >
                        + Add {mealType}
                      </Button>
                    )}
                  </div>
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </div>

    {/* Save the Generated Plan Button */}
      <div className="flex justify-center mb-4">
        <Button
          variant="default"
          onClick={async () => {
            const { createClient } = await import("@/lib/supabase");
            const supabase = createClient();
            const { data: { session } } = await supabase.auth.getSession();
            const user = session?.user;
            if (!user?.id) {
              alert("You must be logged in to load your meal plan.");
              return;
            }
            console.log("User ID:", user.id);
            // Get the max batch_number for this user
            const { data: maxBatchResult, error: maxBatchError } = await supabase
              .from('meal_plan')
              .select('batch_number')
              .eq('user_id', user.id)
              .order('batch_number', { ascending: false })
              .limit(1);
            const maxBatchNumber = maxBatchResult?.[0]?.batch_number;
            if (!maxBatchNumber) {
              alert(`No meal plan found for your account.\n\nYou need to generate a meal plan first.\n\nUser ID: ${user.id}\nMax Batch Data: ${JSON.stringify(maxBatchResult)}\nMax Batch Error: ${maxBatchError ? JSON.stringify(maxBatchError) : 'None'}`);
              return;
            }
            // Use a simpler query: just filter meal_plan.user_id === user.id and batch_number === maxBatchNumber
            const { data: mealPlans, error: fetchError } = await supabase
              .from('meal_plan')
              .select(`plan_id, day, start_date, plan_type, plan_name, description, recipe_id, nutrition_id, batch_number, user_id, recipe:recipe_id (title, ingredients, instruction, prep_time), nutrition:nutrition_id (calories, protein_g, carbs_g, fats_g)`)
              .eq('user_id', user.id)
              .eq('batch_number', maxBatchNumber)
              .order('day', { ascending: true });
            if (fetchError) {
              alert("Error fetching meal plan: " + fetchError.message);
              return;
            }
            if (!mealPlans || mealPlans.length === 0) {
              alert("No meal plan data found for your account.");
              return;
            }
            // Group meals by start_date (fix TS errors by typing accumulator and meals)
            const plansByDay: Record<string, typeof mealPlans> = {};
            mealPlans.forEach((plan: any) => {
              const date = plan.start_date;
              if (!plansByDay[date]) plansByDay[date] = [];
              plansByDay[date].push(plan);
            });
            // Format for calendar
            const formattedPlan = Object.entries(plansByDay).map(([start_date, meals]) => ({
              start_date,
              meals: (meals as any[]).map((meal) => ({
                type: meal.plan_type,
                name: meal.plan_name,
                description: meal.description,
                calories: meal.nutrition?.calories || 0,
                protein: meal.nutrition?.protein_g || 0,
                carbs: meal.nutrition?.carbs_g || 0,
                fats: meal.nutrition?.fats_g || 0,
                ingredients: meal.recipe?.ingredients ? JSON.parse(meal.recipe.ingredients) : [],
                instructions: meal.recipe?.instruction ? JSON.parse(meal.recipe.instruction) : [],
                prepTime: meal.recipe?.prep_time || 0,
                difficulty: 'medium',
              }))
            }));
            setMealPlan(formattedPlan);
          }}
        >
          Save the Generated Plan
        </Button>
      </div>

    </div>
  );
}
