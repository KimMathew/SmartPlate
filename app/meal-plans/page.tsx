"use client";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useUserChoice } from "@/lib/user-choice-context";
import { useState, useEffect } from 'react';
import { createClient } from "@/lib/supabase";
import { AlertCircle, Loader2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
// Ensure the correct path to the use-toast module
import { useToast } from "@/components/ui/use-toast"; // Update the path to the correct location
import { useSession } from "@/lib/session-context";
import { useRouter } from "next/navigation";
import { MealDetailsModal, capitalizeMealType } from "@/app/auth/meal-details-modal";

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
  // Add these fields for DB mapping
  plan_id?: number;
  recipe_id?: number;
  nutrition_id?: number;
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
    <>      <div
        onClick={() => setShowDetails(true)}
        className="p-4 border rounded-lg hover:border-emerald-200 transition-colors cursor-pointer hover:bg-emerald-50"
      >        <h3 className="text-lg font-semibold text-emerald-500">
          {capitalizeMealType(meal.type)}
        </h3>
        <p className="text-gray-800 font-medium">{meal.name}</p>
        <p className="text-gray-600 text-sm line-clamp-2">{meal.description}</p>
        <div className="flex justify-between mt-2 text-gray-500 text-sm">
          <span>{meal.calories} cal</span>
          <span>{meal.protein}g protein</span>
        </div>
      </div>

      {/* Meal Details Modal */}
      {showDetails && (
        <MealDetailsModal meal={{
          ...meal,
          difficulty: ["easy", "medium", "hard"].includes(meal.difficulty || "") ? meal.difficulty as ("easy" | "medium" | "hard") : undefined
        }} onClose={() => setShowDetails(false)} />
      )}
    </>
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
  const [currentBatchNumber, setCurrentBatchNumber] = useState<number | null>(null);
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

  // Helper to get user-specific localStorage key
  function getMealPlanKey(userId?: string) {
    return userId ? `smartPlate_mealPlan_${userId}` : 'smartPlate_mealPlan';
  }
  function getSelectedDaysKey(userId?: string) {
    return userId ? `smartPlate_selectedDays_${userId}` : 'smartPlate_selectedDays';
  }
  function getBatchNumberKey(userId?: string) {
    return userId ? `smartPlate_batchNumber_${userId}` : 'smartPlate_batchNumber';
  }
  useEffect(() => {
  const key = getMealPlanKey(user?.id);
  const savedPlan = localStorage.getItem(key);
  const batchKey = getBatchNumberKey(user?.id);
  const savedBatchNumber = localStorage.getItem(batchKey);
  
  if (savedBatchNumber) {
    try {
      const batchNumber = parseInt(savedBatchNumber);
      setCurrentBatchNumber(batchNumber);
    } catch (err) {
      console.error("Error parsing batch number from localStorage", err);
    }
  }
  
  if (savedPlan) {
    try {
      const parsedPlan: DayPlan[] = JSON.parse(savedPlan);
      if (Array.isArray(parsedPlan) && parsedPlan.length > 0) {
        // Filter out duplicate meals based on name+type or a unique ID if present
        const dedupedPlan = parsedPlan.map(day => ({
          ...day,
          meals: Array.from(new Map(day.meals.map(m => [m.name + m.type, m])).values()),
        }));
        setMealPlan(dedupedPlan);
        setGeneratedPlanExists(true);
      }
    } catch (err) {
      console.error("Error parsing meal plan from localStorage", err);
    }
  }
}, [user?.id]);


  // Load meal plans from Supabase when user is authenticated
  useEffect(() => {
    const fetchExistingMealPlans = async () => {
      if (!user?.id) return;

      try {        // Get the maximum batch_number for this user
        const { data: maxBatchData, error: maxBatchError } = await supabase
          .from('meal_plan')
          .select('batch_number')
          .eq('user_id', user.id)
          .order('batch_number', { ascending: false })
          .limit(1);
          
        if (maxBatchError) {
          console.error("Error fetching max batch number:", maxBatchError);
        } else if (maxBatchData && maxBatchData.length > 0) {
          const maxBatchNumber = maxBatchData[0].batch_number;
          setCurrentBatchNumber(maxBatchNumber);
          // Save to localStorage
          localStorage.setItem(getBatchNumberKey(user?.id), maxBatchNumber.toString());
        }
        
        // Fetch the most recent meal plan for this user with the max batch_number
        let batchNumberFilter = maxBatchData?.[0]?.batch_number;
        
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
            batch_number,
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
          .eq('batch_number', batchNumberFilter)
          .order('day', { ascending: true })
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
          if (formattedPlans.length > 0 && !localStorage.getItem(getMealPlanKey(user?.id))) {
            setMealPlan(formattedPlans);
            setGeneratedPlanExists(true);

            // Set days based on the fetched plan
            const daysCovered = mealPlans[0]?.days_covered || 3;
            if (daysCovered > 0) {
              setSelectedDays(daysCovered);
              localStorage.setItem(getSelectedDaysKey(user?.id), daysCovered.toString());
            }

            // Save to localStorage as well
            localStorage.setItem(getMealPlanKey(user?.id), JSON.stringify(formattedPlans));
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

  // After fetching mealPlans from Supabase, map IDs to mealPlan in state
  useEffect(() => {
    if (!user?.id) return;
    (async () => {
      const { data: maxBatchData } = await supabase
        .from('meal_plan')
        .select('batch_number')
        .eq('user_id', user.id)
        .order('batch_number', { ascending: false })
        .limit(1);
      const batchNumberFilter = maxBatchData?.[0]?.batch_number;
      if (!batchNumberFilter) return;
      const { data: mealPlans } = await supabase
        .from('meal_plan')
        .select('plan_id, plan_type, plan_name, start_date, recipe_id, nutrition_id')
        .eq('user_id', user.id)
        .eq('batch_number', batchNumberFilter);
      if (!mealPlans) return;
      setMealPlan((prev) => prev.map(dayPlan => ({
        ...dayPlan,
        meals: dayPlan.meals.map(meal => {
          const match = mealPlans.find(p =>
            p.plan_name?.toLowerCase() === meal.name?.toLowerCase() &&
            p.plan_type?.toLowerCase() === meal.type?.toLowerCase() &&
            p.start_date === dayPlan.start_date
          );
          return match ? { ...meal, plan_id: match.plan_id, recipe_id: match.recipe_id, nutrition_id: match.nutrition_id } : meal;
        })
      })));
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, generatedPlanExists]);

  // Check authentication on component mount
  useEffect(() => {
    if (!sessionLoading && !session) {
      // Clear in-memory meal plan and state on logout
      setMealPlan([]);
      setGeneratedPlanExists(false);
      setError(null);
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

      // Get the next batch_number for this user
      let nextBatchNumber = 1;
      const { data: maxBatch, error: batchError } = await supabase
        .from('meal_plan')
        .select('batch_number')
        .eq('user_id', user.id)
        .order('batch_number', { ascending: false })
        .limit(1);
      if (!batchError && maxBatch && maxBatch.length > 0 && maxBatch[0].batch_number) {
        nextBatchNumber = maxBatch[0].batch_number + 1;
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
      }      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || "Failed to generate meal plan");
      }

      // Get the batch_number from the API response
      const batchNumber = data.data?.batch_number;
      if (batchNumber) {
        setCurrentBatchNumber(batchNumber);
        // Save batch_number to localStorage
        localStorage.setItem(getBatchNumberKey(user?.id), batchNumber.toString());
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
      });      setMealPlan(formattedPlan);
      setGeneratedPlanExists(true);
      
      // Save the meal plan to localStorage
      localStorage.setItem(getMealPlanKey(user?.id), JSON.stringify(formattedPlan));
      localStorage.setItem(getSelectedDaysKey(user?.id), selectedDays.toString());
      
      // Batch number was already saved earlier from the API response

      toast({
        title: "Meal plan generated!",
        description: `Your ${selectedDays}-day meal plan is ready. (Batch #${currentBatchNumber})`,
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
    localStorage.removeItem(getMealPlanKey(user?.id));
    localStorage.removeItem(getSelectedDaysKey(user?.id));
    localStorage.removeItem(getBatchNumberKey(user?.id));
    setMealPlan([]);
    setGeneratedPlanExists(false);
    setCurrentBatchNumber(null);
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
      // Prepare inserts for meal_schedule
      const inserts: any[] = [];
      mealPlan.forEach((dayPlan) => {
        dayPlan.meals.forEach((meal) => {
          // Try to find the matching plan/recipe/nutrition IDs if available
          let planId = null, recipeId = null, nutritionId = null;
          if (meal.plan_id) planId = meal.plan_id;
          if (meal.recipe_id) recipeId = meal.recipe_id;
          if (meal.nutrition_id) nutritionId = meal.nutrition_id;
          inserts.push({
            user_id: user.id,
            meal_name: meal.name,
            meal_date: dayPlan.start_date,
            meal_type: meal.type, 
            plan_id: planId,
            recipe_id: recipeId,
            nutrition_id: nutritionId,
          });
        });
      });
      // Prevent duplicates: fetch existing for this user/date/name
      const { data: existing, error: existingError } = await supabase
        .from('meal_schedule')
        .select('meal_name, meal_date')
        .eq('user_id', user.id);
      if (existingError) throw new Error("Failed to check for existing meals: " + existingError.message);
      const existingSet = new Set((existing || []).map(e => `${e.meal_name}|${e.meal_date}`));
      const filteredInserts = inserts.filter(
        i => !existingSet.has(`${i.meal_name}|${i.meal_date}`)
      );
      if (filteredInserts.length === 0) {
        toast({
          title: "Already Saved",
          description: "All meals in this plan are already saved to your schedule.",
          variant: "default"
        });
        return;
      }
      const { error: insertError } = await supabase
        .from('meal_schedule')
        .insert(filteredInserts);
      if (insertError) throw new Error("Failed to save to meal_schedule: " + insertError.message);
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
          </div>          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">AI Generated Meal Plan</h2>
            <div className="bg-emerald-50 p-4 rounded-md mb-6">
              <p className="text-emerald-700 font-medium">Based on your preferences</p>
              <p className="text-gray-600">Your personalized {selectedDays}-day nutrition plan</p>
              {currentBatchNumber && (
                <div className="bg-emerald-100 px-2 py-1 mt-2 rounded inline-flex items-center">
                  <span className="text-sm text-emerald-700 font-medium">Batch #{currentBatchNumber}</span>
                </div>
              )}
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
