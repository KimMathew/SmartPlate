"use client";

import React, { useState, useEffect } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Share, Printer, Coffee, Utensils, ChefHat, Trash2, Plus, Loader2 } from "lucide-react";;
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import ReactDOM from "react-dom";

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
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ meal: any, dateStr: string, type: string } | null>(null);

  // Set isClient to true after mount
  useEffect(() => {
    setIsClient(true);
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

  // Replace window.confirm with modal logic
  async function handleDeleteMeal(meal: any, dateStr: string, type: string) {
    setDeleteTarget({ meal, dateStr, type });
    setShowDeleteModal(true);
  }

  async function confirmDeleteMeal() {
    if (!deleteTarget) return;
    setLoading(true);
    const { meal, dateStr, type } = deleteTarget;
    const { createClient } = await import("@/lib/supabase");
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    const user = session?.user;
    if (!user?.id) {
      setLoading(false);
      alert("You must be logged in to delete a meal.");
      setShowDeleteModal(false);
      setDeleteTarget(null);
      return;
    }
    const { error: delError } = await supabase
      .from('meal_schedule')
      .delete()
      .eq('meal_name', meal.name)
      .eq('meal_date', dateStr)
      .eq('meal_type', type);
    setLoading(false);
    setShowDeleteModal(false);
    setDeleteTarget(null);
    if (delError) {
      alert("Failed to delete meal from meal_schedule: " + delError.message);
      return;
    }
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
    setModalMealPlan(mealPlan);
    setModalRecipe(recipe);
    setModalNutrition(nutrition);
    setModalLoading(false);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-4 justify-between items-start lg:flex-row lg:space-y-0 lg:items-center">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-gray-900">
            Meal Scheduling
          </h1>
          <p className="text-gray-500 dark:text-gray-300 mb-2">
            Set your meal times and get a personalized plan tailored to your lifestyle and diet
          </p>
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
          {weekDays.map((day, index) => (
            <div
              key={index}
              className="p-4 max-sm:p-1 text-center border-r last:border-r-0"
            >
              <div className="text-sm text-gray-500 max-sm:text-xs">
                {day.toLocaleDateString('en-US', { weekday: 'short' })}
              </div>
              <div className={`text-lg max-sm:text-sm font-semibold ${day.toDateString() === new Date().toDateString() ? 'text-emerald-500' : ''}`}>{day.getDate()}</div>
              <div className="text-sm max-sm:text-xs text-gray-500">
                {day.toLocaleDateString('en-US', { month: 'short' })}
              </div>
            </div>
          ))}
        </div>

        {/* Only render calendar grid after client hydration and mergedMealPlan is ready */}
        {isClient && mergedMealPlan ? (
          <div className="grid grid-cols-8">
            {mealTypes.map((mealType) => (
              <React.Fragment key={mealType}>
                <div className="w-auto lg:pl-4 md:p-2 p-0 border-r border-b flex items-center">
                  <span className="hidden lg:block bg-emerald-50 p-1.5 rounded-full text-emerald-500 group-hover:bg-emerald-100 group-hover:text-emerald-600 transition-colors duration-200 mr-2">
                    {getMealTypeIcon(mealType)}
                  </span>
                  <span className="capitalize max-md:text-xs max-sm:text-xs text-gray-600 font-medium text-base overflow-x-hidden">{mealType}</span>
                </div>
                {weekDays.map((day, dayIndex) => {
                  const meal = getMealForDateAndType(day, mealType);
                  const dateStr = getLocalDateString(day);
                  return (
                    <div
                      key={`${mealType}-${dayIndex}`}
                      className="lg:p-4 md:p-2 p-[4px] border-r border-b last:border-r-0"
                    >
                      {meal ? (
                        <div className="bg-emerald-50 rounded-lg p-2 max-sm:p-1 text-center space-y-2 border border-emerald-300 relative cursor-pointer hover:bg-emerald-100 transition"
                          onClick={() => handleMealClick(meal)}
                        >
                          <div className="overflow-hidden font-semibold text-emerald-700 text-sm max-sm:text-xs text-ellipsis whitespace-nowrap pr-6" title={meal.name}>{meal.name}</div>
                          
                          <button
                            className="absolute top-1 max-sm:-top-0.5 right-1 text-gray-400 hover:text-red-500"
                            title="Delete meal"
                            onClick={e => { e.stopPropagation(); handleDeleteMeal(meal, dateStr, mealType); }}
                            disabled={loading}
                          >
                            {/* Trash2 icon, keep as in current code if imported */}
                            <Trash2 className="w-4 h-4 max-sm:w-3 max-sm:h-3" />
                          </button>
                        </div>
                      ) : (
                        <Button
                          variant="outline"
                          className="max-sm:p-1 w-full h-full min-h-[60px] border-dashed text-xs flex items-center justify-center"
                          onClick={() => setAddMealDialog({ open: true, date: day, type: mealType })}
                          disabled={loading}
                        >
                          <span className="hidden lg:inline-block lg:text-xs md:text-[10px]">+ Add</span>
                          <span className="text-lg font-extralight inline-block lg:hidden text-center w-full">+</span>
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
      </Card>

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
        <MealDetailsModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          meal={modalMeal}
          mealPlan={modalMealPlan}
          recipe={modalRecipe}
          nutrition={modalNutrition}
          loading={modalLoading}
        />
      )}

      {/* Delete Meal Modal */}
      <DeleteMealModal
        open={showDeleteModal && !!deleteTarget}
        onClose={() => { setShowDeleteModal(false); setDeleteTarget(null); }}
        onDelete={confirmDeleteMeal}
        loading={loading}
        meal={deleteTarget?.meal}
        dateStr={deleteTarget?.dateStr || ''}
        type={deleteTarget?.type || ''}
      />
    </div>
  );
}

// Delete Meal Modal Component
function DeleteMealModal({ open, onClose, onDelete, loading, meal, dateStr, type }: {
  open: boolean;
  onClose: () => void;
  onDelete: () => void;
  loading: boolean;
  meal: any;
  dateStr: string;
  type: string;
}) {
  const [visible, setVisible] = React.useState(open);
  const [animate, setAnimate] = React.useState(false);

  React.useEffect(() => {
    if (open) {
      setVisible(true);
      setTimeout(() => setAnimate(true), 10);
    } else {
      setAnimate(false);
      setTimeout(() => setVisible(false), 200);
    }
  }, [open]);

  if (!visible) return null;

  const handleClose = () => {
    setAnimate(false);
    setTimeout(() => {
      setVisible(false);
      onClose();
    }, 200);
  };

  // Use ReactDOM.createPortal to render modal at document.body
  if (typeof window === 'undefined' || !document.body) return null;
  return ReactDOM.createPortal(
    <div className={`fixed inset-0 z-50 flex items-center justify-center bg-black/50 transition-opacity duration-200 ${animate ? 'opacity-100' : 'opacity-0'}`} onClick={handleClose}>
      <div
        className={`bg-white w-full max-w-md rounded-xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto relative transition-all duration-200 mx-auto ${animate ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}
        onClick={e => e.stopPropagation()}
      >
        {/* Close (X) button */}
        <button onClick={handleClose} className="text-gray-400 hover:text-gray-600 absolute top-5 right-4 z-10">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <div className="p-0">
          <div className="flex items-center gap-3 px-6 pt-6 pb-2">
            <div className="bg-rose-100 rounded-full p-2 flex items-center justify-center">
              <svg className="h-7 w-7 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="white" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01" />
              </svg>
            </div>
            <div className="text-left">
              <div className="font-semibold text-lg text-gray-900">Delete Meal?</div>
              <div className="text-gray-600 text-sm mt-1">
                Are you sure you want to delete the meal '<b>{meal?.name}</b>'?
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-3 px-6 py-4">
            <Button onClick={handleClose} variant="outline" className="min-w-[90px]">Cancel</Button>
            <Button onClick={onDelete} className="min-w-[90px] bg-rose-500 hover:bg-rose-600 text-white" disabled={loading}>{loading ? 'Deleting...' : 'Delete'}</Button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

// Meal Details Modal (portal-based, animated, scroll lock, matches meal-plans)
function MealDetailsModal({ open, onClose, meal, mealPlan, recipe, nutrition, loading }: {
  open: boolean;
  onClose: () => void;
  meal: any;
  mealPlan: any;
  recipe: any;
  nutrition: any;
  loading: boolean;
}) {
  const [visible, setVisible] = React.useState(false);

  // Prevent background scroll when modal is open
  React.useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
      setVisible(true);
    } else {
      setVisible(false);
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  // Handle fade-out before unmount
  const handleClose = () => {
    setVisible(false);
    setTimeout(onClose, 200); // match transition duration
  };

  if (!open) return null;
  if (typeof window === 'undefined') return null;

  const modalContent = (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 transition-opacity duration-200 ${visible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
      aria-modal="true"
      role="dialog"
      tabIndex={-1}
      onClick={handleClose}
    >
      <div
        className={`bg-white w-full max-w-xl rounded-xl shadow-2xl transition-all duration-200 overflow-hidden max-h-[90vh] overflow-y-auto relative transform ${visible ? 'scale-100' : 'scale-95'}`}
        onClick={e => e.stopPropagation()}
      >
        <button onClick={handleClose} className="text-gray-400 hover:text-gray-600 absolute top-5 right-4 z-10" aria-label="Close modal">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <div className="p-5">
          {loading ? (
            <div className="flex flex-col items-center justify-center p-8">
              <Loader2 className="animate-spin h-8 w-8 text-emerald-500 mb-4" />
              <span>Loading meal details...</span>
            </div>
          ) : (
            <>
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="bg-emerald-100 text-emerald-600 p-3 rounded-full text-2xl">
                    {meal?.type?.toLowerCase() === 'breakfast' && '🍳'}
                    {meal?.type?.toLowerCase() === 'lunch' && '🥗'}
                    {meal?.type?.toLowerCase() === 'dinner' && '🍽️'}
                    {!['breakfast', 'lunch', 'dinner'].includes(meal?.type?.toLowerCase()) && '🍲'}
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 max-sm:text-lg pr-2 max-sm:pr-4">{mealPlan?.plan_name || meal?.name}</h2>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-3 border-b border-gray-200 pb-3 mb-4">
                <span className="text-emerald-600 font-semibold uppercase tracking-wide text-base">{meal?.type}</span>
                {recipe?.prepTime && (
                  <span className="flex items-center gap-1 text-gray-500 text-sm">
                    <svg className="inline h-4 w-4 mr-0.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2" /></svg>
                    {recipe.prepTime} mins
                  </span>
                )}
                {recipe?.difficulty && (
                  <span className="flex items-center gap-1 text-gray-500 text-sm">
                    ⭐ {recipe.difficulty.charAt(0).toUpperCase() + recipe.difficulty.slice(1)}
                  </span>
                )}
              </div>
              {mealPlan?.description && (
                <div className="mb-6 text-gray-700 text-base">{mealPlan.description}</div>
              )}
              {recipe?.description && !mealPlan?.description && (
                <div className="mb-6 text-gray-700 text-base">{recipe.description}</div>
              )}
              {nutrition && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                  <Badge variant="outline" className="bg-amber-50 border-amber-100 text-amber-700 hover:bg-amber-50 flex flex-col items-center py-4">
                    <div className="text-lg font-bold">{nutrition.calories ?? 0}</div>
                    <div className="text-xs font-medium">Calories</div>
                  </Badge>
                  <Badge variant="outline" className="bg-blue-50 border-blue-100 text-blue-700 hover:bg-blue-50 flex flex-col items-center py-4">
                    <div className="text-lg font-bold">{nutrition.protein_g ?? 0}g</div>
                    <div className="text-xs font-medium">Protein</div>
                  </Badge>
                  <Badge variant="outline" className="bg-emerald-50 border-emerald-100 text-emerald-700 hover:bg-emerald-50 flex flex-col items-center py-4">
                    <div className="text-lg font-bold">{nutrition.carbs_g ?? 0}g</div>
                    <div className="text-xs font-medium">Carbs</div>
                  </Badge>
                  <Badge variant="outline" className="bg-rose-50 border-rose-100 text-rose-700 hover:bg-rose-50 flex flex-col items-center py-4">
                    <div className="text-lg font-bold">{nutrition.fats_g ?? 0}g</div>
                    <div className="text-xs font-medium">Fats</div>
                  </Badge>
                </div>
              )}
              {recipe?.ingredients && (
                <>
                  <div className="font-bold text-lg mb-2">Ingredients</div>
                  <ul className="list-disc pl-5 space-y-1 text-gray-700 mb-6">
                    {(() => {
                      let ingredients = recipe.ingredients;
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
              {(recipe?.instruction || recipe?.instructions) && (
                <>
                  <div className="font-bold text-lg mb-2">Instructions</div>
                  <ol className="list-decimal pl-5 space-y-2 text-gray-700">
                    {(() => {
                      let instructions = recipe.instruction || recipe.instructions;
                      if (typeof instructions === 'string' && instructions.trim().startsWith('[')) {
                        try {
                          instructions = JSON.parse(instructions);
                        } catch { }
                      }
                      if (Array.isArray(instructions)) {
                        return instructions.map((step: string, idx: number) => (
                          <li key={idx} className="break-words whitespace-pre-line">{step}</li>
                        ));
                      }
                      return String(instructions)
                        .split('\n')
                        .filter((s: string) => s.trim() !== '')
                        .map((step: string, idx: number) => (
                          <li key={idx} className="break-words whitespace-pre-line">{step}</li>
                        ));
                    })()}
                  </ol>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );

  return ReactDOM.createPortal(modalContent, document.body);
}
