"use client";

import React, { useState, useEffect } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Share, Printer, Trash2, Plus, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

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
  const [selectedMeal, setSelectedMeal] = useState<any | null>(null)
  // Modal state for custom modal
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMeal, setModalMeal] = useState<any>(null);
  const [modalMealPlan, setModalMealPlan] = useState<any>(null);
  const [modalRecipe, setModalRecipe] = useState<any>(null);
  const [modalNutrition, setModalNutrition] = useState<any>(null);
  const [modalLoading, setModalLoading] = useState(false);

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

    // Only fetch from meal_schedule, no joins
    const { data: scheduleMeals } = await supabase
      .from('meal_schedule')
      .select('*')
      .eq('user_id', user.id);
    console.log('[loadMealPlan] Fetched scheduleMeals:', scheduleMeals);

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

  // Remove all localStorage logic and only use savedMeals from Supabase
  useEffect(() => {
    // Only use savedMeals from Supabase
    const merged: any[] = [];
    for (const day of savedMeals) {
      // Ensure all meals have a type
      const processedMeals = day.meals.map((meal: { name?: string; type?: string }) => {
        if (!meal.type) {
          let inferredType = 'breakfast';
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
      if (processedMeals.length > 0) {
        merged.push({ start_date: day.start_date, meals: processedMeals });
      }
    }
    setMergedMealPlan(merged);
  }, [savedMeals, date]);

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
  }, [date]);

  function getMealForDateAndType(date: Date, type: string) {
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

  // Add meal handler (remove localStorage fallback)
  async function handleAddMeal() {
    if (!addMealDialog.date || !addMealDialog.type || !newMealName) return;
    setLoading(true);
    const dateStr = getLocalDateString(addMealDialog.date);
    try {
      // Only insert into Supabase meal_schedule
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
        alert("You must be logged in to add a meal.");
      }
    } catch (err: any) {
      alert("An error occurred while adding the meal. " + (err?.message ? err.message : String(err)));
    } finally {
      setLoading(false);
      setAddMealDialog({ open: false, date: null, type: null });
      setNewMealName("");
    }
  }

  // Update delete handler to only delete from Supabase
  async function handleDeleteMeal(meal: any, dateStr: string, type: string) {
    if (!window.confirm(`Are you sure you want to delete the meal '${meal.name}' for ${type} on ${dateStr}?`)) {
      return;
    }
    setLoading(true);
    // Only delete from Supabase
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
    const { error: delError } = await supabase
      .from('meal_schedule')
      .delete()
      .eq('meal_name', meal.name)
      .eq('meal_date', dateStr)
      .eq('meal_type', type);
    setLoading(false);
    if (delError) {
      alert("Failed to delete meal from meal_schedule: " + delError.message);
      return;
    }
    // Refresh meal plan after deletion
    await loadMealPlan();
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
    }
    // Only fetch from meal_schedule, no joins
    const { data: scheduleMeals } = await supabase
      .from('meal_schedule')
      .select('*')
      .eq('user_id', user.id);
    console.log('[handleRefreshMeals] Fetched scheduleMeals:', scheduleMeals);
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
  }

  // Handler for Load Meal Plan button
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
      // Only fetch from meal_schedule, no joins
      const { data: scheduleMeals, error } = await supabase
        .from('meal_schedule')
        .select('*')
        .eq('user_id', user.id);
      console.log('[handleLoadMealPlan] Fetched scheduleMeals:', scheduleMeals);

      if (error) {
        console.error("Error fetching meals:", error);
        alert("Failed to load meal plan. Please try again.\n" + error.message);
        setLoading(false);
        return;
      }

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

  // Handler for meal click: fetch meal_plan, recipe, nutrition_info
  async function handleMealClick(meal: any) {
    setModalOpen(true);
    setModalMeal(meal);
    setModalMealPlan(null);
    setModalRecipe(null);
    setModalNutrition(null);
    setModalLoading(true);
    const { createClient } = await import("@/lib/supabase");
    const supabase = createClient();
    // Fetch meal_plan by plan_id (if present)
    let mealPlan = null, recipe = null, nutrition = null;
    if (meal.plan_id) {
      const { data: mealPlanData } = await supabase
        .from("meal_plan")
        .select("*")
        .eq("plan_id", meal.plan_id)
        .single();
      mealPlan = mealPlanData;
    }
    // Fetch recipe by recipe_id (from meal or mealPlan)
    const recipeId = meal.recipe_id || mealPlan?.recipe_id;
    if (recipeId) {
      const { data: recipeData } = await supabase
        .from("recipe")
        .select("*")
        .eq("recipe_id", recipeId)
        .single();
      recipe = recipeData;
    }
    // Fetch nutrition_info by nutrition_id (from meal or mealPlan)
    const nutritionId = meal.nutrition_id || mealPlan?.nutrition_id;
    if (nutritionId) {
      const { data: nutritionData } = await supabase
        .from("nutrition_info")
        .select("*")
        .eq("nutrition_id", nutritionId)
        .single();
      nutrition = nutritionData;
    }
    // Show all fetched data in an alert for debugging
    alert(
      '[handleMealClick] meal: ' + JSON.stringify(meal, null, 2) + '\n' +
      '[handleMealClick] mealPlan: ' + JSON.stringify(mealPlan, null, 2) + '\n' +
      '[handleMealClick] recipe: ' + JSON.stringify(recipe, null, 2) + '\n' +
      '[handleMealClick] nutrition: ' + JSON.stringify(nutrition, null, 2)
    );
    setModalMealPlan(mealPlan);
    setModalRecipe(recipe);
    setModalNutrition(nutrition);
    setModalLoading(false);
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Meal Scheduling</h1>
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

      <div className="bg-white rounded-xl shadow-md">
        <div className="grid grid-cols-8 border-b">
          <div className="p-4 border-r"></div>
          {weekDayLabels.map((label, index) => (
            <div
              key={index}
              className="p-4 text-center border-r last:border-r-0"
            >
              <div className="text-sm text-gray-500">{label}</div>
              <div className={`text-lg font-semibold ${weekDays[index].toDateString() === new Date().toDateString() ? 'text-emerald-500' : ''}`}>{weekDays[index].getDate()}</div>
              <div className="text-sm text-gray-500">{weekDays[index].toLocaleDateString('en-US', { month: 'short' })}</div>
            </div>
          ))}
        </div>

        {/* Only render calendar grid after client hydration and mergedMealPlan is ready */}
        {isClient && mergedMealPlan ? (
          <div className="grid grid-cols-8">
            {mealTypes.map((mealType) => (
              <React.Fragment key={mealType}>
                <div className="p-4 border-r border-b flex items-center">
                  <span className="capitalize text-sm text-gray-600">{mealType}</span>
                </div>
                {weekDays.map((day, dayIndex) => {
                  const meal = getMealForDateAndType(day, mealType);
                  const dateStr = getLocalDateString(day);
                  return (
                    <div
                      key={`${mealType}-${dayIndex}`}
                      className="p-4 border-r border-b last:border-r-0"
                    >
                      {meal ? (
                        <div
                          className="bg-emerald-50 rounded-lg p-2 text-center relative cursor-pointer hover:bg-emerald-100 transition"
                          onClick={() => handleMealClick(meal)}
                        >
                          <div className="font-semibold text-emerald-700">{meal.name}</div>
                          <button
                            className="absolute top-1 right-1 text-gray-400 hover:text-red-500"
                            title="Delete meal"
                            onClick={e => { e.stopPropagation(); handleDeleteMeal(meal, dateStr, mealType); }}
                            disabled={loading}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ) : (
                        <Button
                          variant="outline"
                          className="w-full h-full min-h-[60px] border-dashed flex items-center justify-center gap-1"
                          onClick={() => setAddMealDialog({ open: true, date: day, type: mealType })}
                          disabled={loading}
                        >
                          <Plus size={16} /> Add {mealType}
                        </Button>
                      )}
                    </div>
                  );
                })}
              </React.Fragment>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center text-gray-400">
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5 mr-2 text-emerald-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
              </svg>
              Loading meal plan...
            </span>
          </div>
        )}
      </div>

      {/* Debug: Show modal meal data as JSON below the calendar */}
      <div className="bg-yellow-50 rounded-lg p-4 mt-6 border border-yellow-200">
        <div className="font-bold mb-2 text-yellow-700">Debug: Modal Meal Data (what is shown in modal)</div>
        <pre className="text-xs overflow-x-auto whitespace-pre-wrap break-all text-yellow-900">
          {JSON.stringify({
            meal: modalMeal,
            mealPlan: modalMealPlan,
            recipe: modalRecipe,
            nutrition: modalNutrition
          }, null, 2)}
        </pre>
      </div>

      {/* Add Meal Dialog */}
      <Dialog open={addMealDialog.open} onOpenChange={open => setAddMealDialog(v => ({ ...v, open }))}>
        <DialogContent>
          <DialogTitle>Add {addMealDialog.type} for {addMealDialog.date ? addMealDialog.date.toLocaleDateString() : ''}</DialogTitle>
          <Input
            placeholder="Meal name"
            value={newMealName}
            onChange={e => setNewMealName(e.target.value)}
            disabled={loading}
          />
          <Button onClick={handleAddMeal} disabled={loading || !newMealName}>
            Add Meal
          </Button>
        </DialogContent>
      </Dialog>

      {/* Meal Details Modal */}
      {modalOpen && (
        <Dialog open={modalOpen} onOpenChange={open => { if (!open) setModalOpen(false); }}>
          <DialogContent className="w-full max-w-xl max-h-[90vh] overflow-y-auto p-0">
            <DialogTitle className="sr-only">Meal Details</DialogTitle>
            {modalLoading ? (
              <div className="flex flex-col items-center justify-center p-8">
                <Loader2 className="animate-spin h-8 w-8 text-emerald-500 mb-4" />
                <span>Loading meal details...</span>
              </div>            ) : (
              <div className="p-5">
                {/* Modal content remains unchanged, but now scrolls if too tall */}
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-emerald-100 text-emerald-600 p-3 rounded-full text-2xl">
                      {modalMeal?.type?.toLowerCase() === 'breakfast' && '🍳'}
                      {modalMeal?.type?.toLowerCase() === 'lunch' && '🥗'}
                      {modalMeal?.type?.toLowerCase() === 'dinner' && '🍽️'}
                      {!['breakfast', 'lunch', 'dinner'].includes(modalMeal?.type?.toLowerCase()) && '🍲'}
                    </div>
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900">{modalMealPlan?.plan_name || modalMeal?.name}</h2>
                  </div>
                  {/* Removed custom close button to avoid duplicate X icon */}
                </div>
                <div className="flex flex-wrap items-center gap-3 border-b border-gray-200 pb-3 mb-4">
                  <span className="text-emerald-600 font-semibold uppercase tracking-wide text-base">{modalMeal?.type}</span>
                  {modalRecipe?.prepTime && (
                    <span className="flex items-center gap-1 text-gray-500 text-sm">
                      <svg className="inline h-4 w-4 mr-0.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2" /></svg>
                      {modalRecipe.prepTime} mins
                    </span>
                  )}
                  {modalRecipe?.difficulty && (
                    <span className="flex items-center gap-1 text-gray-500 text-sm">
                      ⭐ {modalRecipe.difficulty.charAt(0).toUpperCase() + modalRecipe.difficulty.slice(1)}
                    </span>
                  )}
                </div>
                {/* Show mealPlan description above nutrition info if present */}
                {modalMealPlan?.description && (
                  <div className="mb-6 text-gray-700 text-base">{modalMealPlan.description}</div>
                )}
                {modalRecipe?.description && !modalMealPlan?.description && (
                  <div className="mb-6 text-gray-700 text-base">{modalRecipe.description}</div>
                )}
                {/* Nutrition info from nutrition_info table */}
                {modalNutrition && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                    <div className="bg-gray-50 rounded-lg p-4 text-center">
                      <div className="text-emerald-600 text-2xl font-bold">{modalNutrition.calories ?? 0}</div>
                      <div className="text-gray-500 text-xs">Calories</div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4 text-center">
                      <div className="text-emerald-600 text-2xl font-bold">{modalNutrition.protein_g ?? 0}g</div>
                      <div className="text-gray-500 text-xs">Protein</div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4 text-center">
                      <div className="text-emerald-600 text-2xl font-bold">{modalNutrition.carbs_g ?? 0}g</div>
                      <div className="text-gray-500 text-xs">Carbs</div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4 text-center">
                      <div className="text-emerald-600 text-2xl font-bold">{modalNutrition.fats_g ?? 0}g</div>
                      <div className="text-gray-500 text-xs">Fats</div>
                    </div>
                  </div>
                )}
                {modalRecipe?.ingredients && (
                  <>
                    <div className="font-bold text-lg mb-2">Ingredients</div>
                    <ul className="list-disc pl-5 space-y-1 text-gray-700 mb-6">
                      {(() => {
                        let ingredients = modalRecipe.ingredients;
                        if (typeof ingredients === 'string' && ingredients.trim().startsWith('[')) {
                          try {
                            ingredients = JSON.parse(ingredients);
                          } catch { }
                        }
                        if (Array.isArray(ingredients)) {
                          return ingredients.map((ing: string, idx: number) => (
                            <li key={idx} className="break-words whitespace-pre-line">{ing}</li>
                          ));
                        }
                        return String(ingredients)
                          .split('\n')
                          .map((ing: string, idx: number) => (
                            <li key={idx} className="break-words whitespace-pre-line">{ing}</li>
                          ));
                      })()}
                    </ul>
                  </>
                )}                
                {modalRecipe?.instructions && (
                  <>
                    <div className="font-bold text-lg mb-2">Instructions</div>
                    <ol className="list-decimal pl-5 space-y-2 text-gray-700">
                      {Array.isArray(modalRecipe.instructions)
                        ? modalRecipe.instructions.map((step: string, index: number) => (
                            <li key={index} className="break-words whitespace-pre-line">{step}</li>
                          ))
                        : typeof modalRecipe.instructions === 'string' 
                            ? modalRecipe.instructions.split('\n').filter((s: string) => s.trim() !== '').map((step: string, index: number) => (
                                <li key={index} className="break-words whitespace-pre-line">{step}</li>
                              ))
                            : modalRecipe.instructions ? <li className="break-words whitespace-pre-line">{String(modalRecipe.instructions)}</li> : null
                      }
                    </ol>
                  </>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
