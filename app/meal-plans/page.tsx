"use client";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useUserChoice } from "@/lib/user-choice-context";
import { useState, useEffect } from 'react';
import { createClient } from "@/lib/supabase";
import { AlertCircle, Loader2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/components/ui/use-toast";
import { useSession } from "@/lib/session-context";
import { useRouter } from "next/navigation";

// Types
type Meal = {
  type: string;
  name: string;
  description: string;
  calories: number;
  protein: number;
  carbs?: number;
  fats?: number;
  ingredients?: string[];
  instructions?: string[];
  prepTime?: number;
  difficulty?: string;
};

type DayPlan = {
  day: string; // This will now be the formatted date
  start_date?: string; // Keep the raw date if needed elsewhere
  meals: Meal[];
};

// Helper to format date as 'Month Day, Year'
function formatDate(dateString?: string) {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
}

// Component for the meal plan day card
const MealPlanDayCard = ({ dayPlan }: { dayPlan: DayPlan }) => (
  <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
    <h2 className="text-xl font-bold text-gray-900 mb-4 border-b pb-2">{dayPlan.day}</h2>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {dayPlan.meals.map((meal, index) => (
        <MealCard key={index} meal={meal} />
      ))}
    </div>
  </div>
);

// Meal card component
const MealCard = ({ meal }: { meal: Meal }) => {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <>
      <div
        onClick={() => setShowDetails(true)}
        className="p-4 border rounded-lg hover:border-emerald-200 transition-colors cursor-pointer hover:bg-emerald-50"
      >
        <h3 className="text-lg font-semibold text-emerald-500">{meal.type}</h3>
        <p className="text-gray-800 font-medium">{meal.name}</p>
        <p className="text-gray-600 text-sm line-clamp-2">{meal.description}</p>
        <div className="flex justify-between mt-2 text-gray-500 text-sm">
          <span>{meal.calories} cal</span>
          <span>{meal.protein}g protein</span>
        </div>
      </div>

      {/* Meal Details Modal */}
      {showDetails && (
        <MealDetailsModal meal={meal} onClose={() => setShowDetails(false)} />
      )}
    </>
  );
};

// Meal Details Modal Component
const MealDetailsModal = ({ meal, onClose }: { meal: Meal; onClose: () => void }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={onClose}>
      <div
        className="bg-white w-full max-w-xl rounded-xl shadow-2xl transition-all duration-200 overflow-hidden max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <div className="bg-emerald-100 text-emerald-600 p-2 rounded-full">
                {meal.type.toLowerCase() === 'breakfast' && '🍳'}
                {meal.type.toLowerCase() === 'lunch' && '🥗'}
                {meal.type.toLowerCase() === 'dinner' && '🍽️'}
                {meal.type.toLowerCase() === 'snack' && '🥜'}
                {!['breakfast', 'lunch', 'dinner', 'snack'].includes(meal.type.toLowerCase()) && '🍲'}
              </div>
              <h3 className="text-xl font-bold text-gray-900">{meal.name}</h3>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="border-b border-gray-200 mb-4 pb-2">
            <span className="text-sm font-medium text-emerald-600 uppercase">{meal.type}</span>
            {meal.prepTime && (
              <span className="text-sm text-gray-500 ml-4">⏱️ {meal.prepTime} mins</span>
            )}
            {meal.difficulty && (
              <span className="text-sm text-gray-500 ml-4">
                {meal.difficulty === 'easy' && '⭐ Easy'}
                {meal.difficulty === 'medium' && '⭐⭐ Medium'}
                {meal.difficulty === 'hard' && '⭐⭐⭐ Hard'}
              </span>
            )}
          </div>

          <div className="text-gray-600 mb-6">
            <p>{meal.description}</p>
          </div>

          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="bg-gray-50 p-3 rounded-lg text-center">
              <p className="text-lg font-bold text-emerald-600">{meal.calories}</p>
              <p className="text-xs text-gray-500">Calories</p>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg text-center">
              <p className="text-lg font-bold text-emerald-600">{meal.protein}g</p>
              <p className="text-xs text-gray-500">Protein</p>
            </div>
            {meal.carbs !== undefined && (
              <div className="bg-gray-50 p-3 rounded-lg text-center">
                <p className="text-lg font-bold text-emerald-600">{meal.carbs}g</p>
                <p className="text-xs text-gray-500">Carbs</p>
              </div>
            )}
            {meal.fats !== undefined && (
              <div className="bg-gray-50 p-3 rounded-lg text-center">
                <p className="text-lg font-bold text-emerald-600">{meal.fats}g</p>
                <p className="text-xs text-gray-500">Fats</p>
              </div>
            )}
          </div>

          {/* Ingredients Section */}
          {meal.ingredients && meal.ingredients.length > 0 && (
            <div className="mb-6">
              <h4 className="font-semibold text-gray-800 mb-3">Ingredients</h4>
              <ul className="list-disc pl-5 space-y-1 text-gray-600">
                {meal.ingredients.map((ingredient, index) => (
                  <li key={index}>{ingredient}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Instructions Section */}
          {meal.instructions && meal.instructions.length > 0 && (
            <div className="mb-6">
              <h4 className="font-semibold text-gray-800 mb-3">Instructions</h4>
              <ol className="list-decimal pl-5 space-y-2 text-gray-600">
                {meal.instructions.map((step, index) => (
                  <li key={index} className="pl-1">{step}</li>
                ))}
              </ol>
            </div>
          )}

          <div className="mt-6">
            <Button onClick={onClose} className="w-full bg-emerald-500 hover:bg-emerald-600 text-white">Close</Button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main component
export default function MealPlansPage() {
  const router = useRouter();
  const { session, user, isLoading: sessionLoading } = useSession();
  // State
  const [localSelectedDays, setLocalSelectedDays] = useState<number>(3);
  const [generatedPlanExists, setGeneratedPlanExists] = useState(false);
  const [mealPlan, setMealPlan] = useState<DayPlan[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryAfter, setRetryAfter] = useState<number | null>(null);
  const [isServiceDown, setIsServiceDown] = useState(false);
  const { toast } = useToast();
  const supabase = createClient();

  // Context handling with fallback
  let contextValue;
  try {
    contextValue = useUserChoice();
  } catch (error) {
    console.warn("UserChoiceProvider not available, using local state instead");
  }

  const selectedDays = contextValue?.selectedDays ?? localSelectedDays;
  const setSelectedDays = contextValue?.setSelectedDays ?? setLocalSelectedDays;

  // Load meal plan from localStorage on initial render
  useEffect(() => {
    const savedPlan = localStorage.getItem('smartPlate_mealPlan');
    if (savedPlan) {
      try {
        const parsedPlan = JSON.parse(savedPlan);
        if (Array.isArray(parsedPlan) && parsedPlan.length > 0) {
          setMealPlan(parsedPlan);
          setGeneratedPlanExists(true);

          // Also restore the selected days if available
          const savedDays = localStorage.getItem('smartPlate_selectedDays');
          if (savedDays) {
            const days = parseInt(savedDays);
            if (!isNaN(days) && days > 0) {
              setSelectedDays(days);
            }
          }
        }
      } catch (e) {
        console.error("Error parsing saved meal plan:", e);
      }
    }
  }, []);

  // Load meal plans from Supabase when user is authenticated
  useEffect(() => {
    const fetchExistingMealPlans = async () => {
      if (!user?.id) return;

      try {
        // Fetch the most recent meal plan for this user
        const { data: mealPlans, error: fetchError } = await supabase
          .from('meal_plan')
          .select(`
            plan_id,
            plan_type,
            plan_name,
            description,
            days_covered,
            day,
            start_date,
            recipe:recipe_id (
              recipe_id,
              title,
              ingredients,
              instruction,
              cuisine_type,
              prep_time
            ),
            nutrition:nutrition_id (
              nutrition_id,
              calories,
              protein_g,
              carbs_g,
              fats_g
            )
          `)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(30); // Get latest plans to organize by days

        if (fetchError) {
          console.error("Error fetching meal plans:", fetchError);
          return;
        }

        // If we found meal plans in the database and no local plans exist, convert to our format
        if (mealPlans && mealPlans.length > 0 && !generatedPlanExists) {
          // Group by day to reconstruct the full meal plan
          const plansByDay = mealPlans.reduce((acc, plan) => {
            const day = plan.day || 1;
            if (!acc[day]) acc[day] = [];
            acc[day].push(plan);
            return acc;
          }, {} as Record<number, any[]>);

          // Convert to our DayPlan format
          const formattedPlans: DayPlan[] = Object.entries(plansByDay).map(([day, meals]) => {
            // Use the start_date from the first meal of the day (all should be the same)
            const startDate = meals[0]?.start_date;
            return {
              day: startDate ? formatDate(startDate) : `Day ${day}`,
              start_date: startDate,
              meals: meals.map(meal => ({
                type: meal.plan_type || 'meal',
                name: meal.plan_name || meal.recipe?.title || 'Unnamed meal',
                description: meal.description || '',
                calories: meal.nutrition?.calories || 0,
                protein: meal.nutrition?.protein_g || 0,
                carbs: meal.nutrition?.carbs_g || 0,
                fats: meal.nutrition?.fats_g || 0,
                ingredients: meal.recipe?.ingredients ? JSON.parse(meal.recipe.ingredients) : [],
                instructions: meal.recipe?.instruction ? JSON.parse(meal.recipe.instruction) : [],
                prepTime: meal.recipe?.prep_time || 0,
                difficulty: 'medium'
              }))
            };
          }).sort((a, b) => {
            // Sort by date if available, else by day number
            if (a.start_date && b.start_date) {
              return new Date(a.start_date).getTime() - new Date(b.start_date).getTime();
            }
            const dayNumberA = parseInt(a.day.replace(/\D/g, '')) || 0;
            const dayNumberB = parseInt(b.day.replace(/\D/g, '')) || 0;
            return dayNumberA - dayNumberB;
          });

          // Only set if we have valid data and we don't already have a local plan
          if (formattedPlans.length > 0 && !localStorage.getItem('smartPlate_mealPlan')) {
            setMealPlan(formattedPlans);
            setGeneratedPlanExists(true);

            // Set days based on the fetched plan
            const daysCovered = mealPlans[0]?.days_covered || 3;
            if (daysCovered > 0) {
              setSelectedDays(daysCovered);
              localStorage.setItem('smartPlate_selectedDays', daysCovered.toString());
            }

            // Save to localStorage as well
            localStorage.setItem('smartPlate_mealPlan', JSON.stringify(formattedPlans));
          }
        }
      } catch (e) {
        console.error("Error loading saved meal plans:", e);
      }
    };

    if (user && !isLoading && !generatedPlanExists) {
      fetchExistingMealPlans();
    }
  }, [user, isLoading]);

  // Check authentication on component mount
  useEffect(() => {
    if (!sessionLoading && !session) {
      toast({
        title: "Authentication required",
        description: "Please log in to generate meal plans.",
        variant: "destructive"
      });
      router.push('/'); // Redirect to home/login page
    }
  }, [session, sessionLoading, toast, router]);

  // Event handlers
  const handleDaySelection = (days: number) => {
    setSelectedDays(days);
    setError(null); // Clear any previous errors
  };

  const handleGenerateMealPlan = async () => {
    setError(null);
    setIsLoading(true);

    try {
      if (!user?.id) {
        setError("Authentication error. Please log in again.");
        toast({
          title: "Authentication required",
          description: "Please log in to generate meal plans.",
          variant: "destructive"
        });
        return;
      }

      // Get the session token
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !sessionData?.session?.access_token) {
        setError("Failed to retrieve session token. Please log in again.");
        toast({
          title: "Session error",
          description: "Please log in to continue.",
          variant: "destructive"
        });
        return;
      }

      const token = sessionData.session.access_token;

      // Check if user exists in Users table
      const { data: userProfile, error: profileError } = await supabase
        .from('Users')
        .select('*')
        .eq('id', user.id);

      if (profileError) {
        console.error("Profile fetch error:", profileError);
        setError("Couldn't fetch your profile data.");
        return;
      }

      if (!userProfile || userProfile.length === 0) {
        // User exists in auth but not in Users table - create a basic profile
        const { error: insertError } = await supabase
          .from('Users')
          .insert([{
            id: user.id,
            email: user.email,
            created_at: new Date().toISOString()
          }]);

        if (insertError) {
          console.error("Profile creation error:", insertError);
          setError("Couldn't create your profile.");
          return;
        }
      }

      // Send request to generate meal plan with session token
      // In your frontend when making the request
      const { data: { session: sessionObj } } = await supabase.auth.getSession();
      const days = selectedDays; // Use the correct days value

      const response = await fetch('/api/gemini_meal_recommender', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionObj?.access_token}`
        },
        body: JSON.stringify({ userId: user.id, days })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));

        // Check specifically for Gemini service unavailability
        if (response.status === 503 ||
          (errorData.errorCode === "GEMINI_SERVICE_UNAVAILABLE") ||
          (errorData.error && errorData.error.includes("currently unavailable"))) {

          setIsServiceDown(true);
          setRetryAfter(errorData.retryAfter || 60);
          setError("AI service temporarily unavailable. Please try again later.");

          toast({
            title: "Service Unavailable",
            description: "Our AI meal planning service is temporarily unavailable. Please try again later.",
            variant: "default",
            duration: 6000
          });
          return;
        }

        throw new Error(errorData.error || `Server error: ${response.status}`);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || "Failed to generate meal plan");
      }

      // Update to use the correct property based on API response structure
      const planData = data.data?.meal_plan?.days || [];

      // Transform API data to match our component structure
      // Use local date (not UTC) for start_date to avoid timezone issues
      function getLocalDateString(date: Date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      }
      const baseDate = new Date();
      const formattedPlan = planData.map((day: { day: string; meals: Meal[] }, idx: number) => {
        // Calculate the date for this day
        const dayDate = new Date(baseDate);
        dayDate.setDate(baseDate.getDate() + idx);
        const formattedDate = formatDate(getLocalDateString(dayDate));
        return {
          day: formattedDate,
          start_date: getLocalDateString(dayDate),
          meals: day.meals.map(meal => ({
            type: meal.type,
            name: meal.name,
            description: meal.description,
            calories: meal.calories,
            protein: meal.protein,
            carbs: meal.carbs,
            fats: meal.fats,
            ingredients: meal.ingredients,
            instructions: meal.instructions,
            prepTime: meal.prepTime,
            difficulty: meal.difficulty
          }))
        };
      });

      setMealPlan(formattedPlan);
      setGeneratedPlanExists(true);

      // Save to localStorage
      localStorage.setItem('smartPlate_mealPlan', JSON.stringify(formattedPlan));
      localStorage.setItem('smartPlate_selectedDays', selectedDays.toString());

      toast({
        title: "Meal plan generated!",
        description: `Your ${selectedDays}-day meal plan is ready.`,
      });

    } catch (error) {
      console.error("Error generating meal plan:", error);
      setError(error instanceof Error ? error.message : "Failed to generate meal plan");

      toast({
        title: "Error",
        description: "There was a problem generating your meal plan.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegenerate = () => {
    // Don't clear the localStorage here - we'll update it when new plan is generated
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleClearMealPlan = () => {
    localStorage.removeItem('smartPlate_mealPlan');
    localStorage.removeItem('smartPlate_selectedDays');
    setMealPlan([]);
    setGeneratedPlanExists(false);
    setError(null);

    toast({
      title: "Meal plan cleared",
      description: "You can now generate a new meal plan.",
    });

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Save meal plan to meal_schedule
  const handleSaveMealPlan = async () => {
    if (!user?.id) {
      toast({
        title: "Authentication required",
        description: "Please log in to save your meal plan.",
        variant: "destructive"
      });
      return;
    }
    setIsLoading(true);
    try {
      console.log('Saving meal plan:', mealPlan);
      // 1. Try to fetch meal_plan records for this user and plan
      let { data: mealPlans, error: mealPlanError } = await supabase
        .from('meal_plan')
        .select(`plan_id, day, start_date, plan_type, plan_name, recipe_id, nutrition_id, recipe:recipe_id (title)`)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(selectedDays * 4);

      // 2. If not found, insert the plan/meals into meal_plan
      if (!mealPlans || mealPlans.length === 0) {
        // Insert each meal as a meal_plan row
        const mealPlanRows: {
          user_id: string;
          plan_type: string;
          plan_name: string;
          description: string;
          days_covered: number;
          day: number;
          start_date?: string;
          recipe_id: number | null;
          nutrition_id: number | null;
        }[] = [];
        mealPlan.forEach((dayPlan, dayIdx) => {
          dayPlan.meals.forEach((meal, mealIdx) => {
            mealPlanRows.push({
              user_id: user.id,
              plan_type: meal.type,
              plan_name: meal.name,
              description: meal.description,
              days_covered: selectedDays,
              day: dayIdx + 1,
              start_date: dayPlan.start_date,
              recipe_id: null,
              nutrition_id: null
            });
          });
        });
        const { data: insertedPlans, error: insertError } = await supabase
          .from('meal_plan')
          .insert(mealPlanRows)
          .select();
        if (insertError) throw new Error("Failed to insert meal plan: " + insertError.message);
        mealPlans = insertedPlans;
      }

      // 3. Now, match each meal in the local plan to a meal_plan record
      const inserts: {
        user_id: string;
        plan_id: number;
        recipe_id: number | null;
        nutrition_id: number | null;
      }[] = [];
      mealPlan.forEach((dayPlan) => {
        dayPlan.meals.forEach((meal) => {
          const planRecord = mealPlans.find((p) => {
            const planStartDate = p.start_date ? new Date(p.start_date).toISOString().slice(0, 10) : null;
            const dayStartDate = dayPlan.start_date ? new Date(dayPlan.start_date).toISOString().slice(0, 10) : null;
            let recipeTitle = '';
            if (Array.isArray(p.recipe) && p.recipe.length > 0 && p.recipe[0].title) {
              recipeTitle = p.recipe[0].title;
            }
            const nameMatch = (p.plan_name && meal.name && p.plan_name.toLowerCase() === meal.name.toLowerCase()) ||
              (recipeTitle && meal.name && recipeTitle.toLowerCase() === meal.name.toLowerCase());
            const typeMatch = p.plan_type && meal.type && p.plan_type.toLowerCase() === meal.type.toLowerCase();
            return (
              planStartDate === dayStartDate &&
              nameMatch &&
              typeMatch
            );
          });
          if (planRecord) {
            inserts.push({
              user_id: user.id,
              plan_id: planRecord.plan_id,
              recipe_id: planRecord.recipe_id || null,
              nutrition_id: planRecord.nutrition_id || null
            });
          }
        });
      });

      if (inserts.length === 0) {
        throw new Error("No matching meal plan records found to schedule. Please regenerate your plan or contact support.");
      }

      // 4. Insert all into meal_schedule
      const { error: scheduleError } = await supabase
        .from('meal_schedule')
        .insert(inserts);

      if (scheduleError) {
        throw new Error("Failed to save meal schedule: " + scheduleError.message);
      }

      toast({
        title: "Meal plan saved!",
        description: "Your meal plan has been added to your schedule.",
        variant: "default"
      });
      router.push('/schedule');
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      toast({
        title: "Save failed",
        description: err instanceof Error ? err.message : String(err),
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Personalized Meal Plan</h1>
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm text-gray-500">Step 1: Select Duration</span>
        <Progress value={50} className="w-full mx-4" />
      </div>

      {error && !isServiceDown && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {isServiceDown && (
        <Alert variant="default" className="bg-amber-50 border-amber-300 text-amber-800">
          <AlertCircle className="h-4 w-4 text-amber-500" />
          <AlertTitle>AI Service Temporarily Unavailable</AlertTitle>
          <AlertDescription className="flex flex-col gap-2">
            <p>Our meal plan generation service is currently experiencing high demand or maintenance.</p>
            <p>Please try again in {retryAfter || 60} seconds.</p>
          </AlertDescription>
        </Alert>
      )}

      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="text-center">
          <h2 className="text-xl font-bold text-gray-900 mb-2">Plan Your Meals</h2>
          <p className="text-gray-600 mb-6">
            Choose your plan duration and we'll create a personalized meal plan based on your preferences.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-3 mb-6">
          {[3, 5, 7, 14, 21, 30].map((days) => (
            <button
              key={days}
              onClick={() => handleDaySelection(days)}
              className={`px-4 py-2 md:px-6 md:py-3 rounded-lg text-center transition-all duration-200 
                focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent 
                text-gray-900 font-medium shadow-sm hover:shadow-md hover:bg-emerald-50
                ${selectedDays === days ? "bg-emerald-100 border-emerald-500 border-2" : "border border-gray-300"}`}
              disabled={isLoading}
            >
              {days} {days === 1 ? "day" : "days"}
            </button>
          ))}
        </div>

        <div className="text-center">
          <Button
            onClick={handleGenerateMealPlan}
            className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-md text-lg font-medium"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              "Generate My Meal Plan"
            )}
          </Button>
        </div>
      </div>

      {generatedPlanExists && (
        <div className="space-y-6 pb-8">
          <h1 className="text-2xl font-bold text-gray-900">Personalized Meal Plan</h1>
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-gray-500">Step 2: Generated Plan</span>
            <Progress value={100} className="w-full mx-4" />
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">AI Generated Meal Plan</h2>
            <div className="bg-emerald-50 p-4 rounded-md mb-6">
              <p className="text-emerald-700 font-medium">Based on your preferences</p>
              <p className="text-gray-600">Your personalized {selectedDays}-day nutrition plan</p>
            </div>
            <p className="text-gray-600 mb-6">
              Each meal is balanced to meet your nutritional goals while incorporating your favorite ingredients.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button
                onClick={handleRegenerate}
                variant="outline"
                className="hover:bg-emerald-50"
              >
                Generate New Plan
              </Button>
              <Button
                onClick={handleClearMealPlan}
                variant="outline"
                className="hover:bg-emerald-50"
              >
                Clear Meal Plan
              </Button>
              <Button
                onClick={handleSaveMealPlan}
                className="bg-emerald-500 hover:bg-emerald-600 text-white"
              >
                Save This Plan
              </Button>
            </div>
          </div>

          {mealPlan.length > 0 ? (
            mealPlan.map((dayPlan) => <MealPlanDayCard key={dayPlan.day} dayPlan={dayPlan} />)
          ) : (
            <div className="text-center py-10">
              <p className="text-gray-500">No meal plan data available.</p>
            </div>
          )}

          <div className="text-center mt-6">
            <Button
              variant="link"
              className="text-emerald-500 hover:text-emerald-700"
              onClick={() => {/* Implement export functionality */ }}
            >
              Export {selectedDays}-Day Plan
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
