"use client";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useUserChoice } from "@/lib/user-choice-context";
import { useState, useEffect } from 'react';
import { createClient } from "@/lib/supabase";
import { AlertCircle, Calendar, Check, Download, Dumbbell, Flame, Loader2, RefreshCw, Save, Sparkles, Trash2, Coffee, Utensils, ChefHat } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
// Ensure the correct path to the use-toast module
import { useToast } from "@/components/ui/use-toast"; // Update the path to the correct location
import { useSession } from "@/lib/session-context";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

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
const MealPlanDayCard = ({ dayPlan }: { dayPlan: DayPlan }) => {
  // Calculate total calories and protein for the day using total_calorie_count and total_protein_count if available
  // Fallback to summing meals if not present (for backward compatibility)
  const totalCalories = (dayPlan as any).total_calorie_count ?? dayPlan.meals.reduce((sum, meal) => sum + (meal.calories || 0), 0);
  const totalProtein = (dayPlan as any).total_protein_count ?? dayPlan.meals.reduce((sum, meal) => sum + (meal.protein || 0), 0);

  return (
    <Card>
      <CardHeader className="pb-3 border-b">
        <div className="flex items-center justify-between flex-col space-y-2 md:space-y-0 md:flex-row">
          <div className="flex items-center gap-2">
            <div className="bg-emerald-100 p-1.5 rounded-full">
              <Calendar className="h-5 w-5 text-emerald-600" />
            </div>
            <CardTitle className="text-xl font-medium">{dayPlan.day}</CardTitle>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <Badge variant="outline" className="bg-amber-50 border-amber-100 text-amber-700 hover:bg-amber-50 text-sm">
              {/* Insert Total Calorie Here */}
              🔥 {totalCalories} cal
            </Badge>
            <Badge variant="outline" className="bg-blue-50 border-blue-100 text-blue-700 hover:bg-blue-50 text-sm">
              {/* Insert Total Grams of Protein Here */}
              💪 {totalProtein}g protein
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {dayPlan.meals.map((meal, index) => (
            <MealCard key={index} meal={meal} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

// Meal card component
const MealCard = ({ meal }: { meal: Meal }) => {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <>      <div
        onClick={() => setShowDetails(true)}
        className="p-5 border rounded-lg  hover:border-emerald-200 transition-colors cursor-pointer hover:bg-emerald-50"
      >
        <div className="flex items-center gap-2 mb-3">
          <div className="bg-emerald-50 p-1.5 rounded-full text-emerald-500">
            {meal.type.toLowerCase() === "breakfast" && <Coffee className="h-4 w-4" />}
            {meal.type.toLowerCase() === "lunch" && <Utensils className="h-4 w-4" />}
            {meal.type.toLowerCase() === "dinner" && <ChefHat className="h-4 w-4" />}
          </div>
          <h3 className="text-emerald-500 font-medium capitalize group-hover:text-emerald-600 transition-colors duration-200">
            {meal.type}
          </h3>
        </div>

        <h4 className="font-semibold text-gray-800 mb-2 leading-tight">{meal.name}</h4>
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{meal.description}</p>

        <div className="flex justify-between items-center pt-1">
          <Badge variant="outline" className="bg-amber-50 border-amber-100 text-amber-700 hover:bg-amber-50">
            🔥 {meal.calories} cal
          </Badge>
          <Badge variant="outline" className="bg-blue-50 border-blue-100 text-blue-700 hover:bg-blue-50">
            💪 {meal.protein}g protein
          </Badge>
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

// Meal Details Modal Component
const MealDetailsModal = ({ meal, onClose }: { meal: Meal; onClose: () => void }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={onClose}>
      <div
        className="bg-white w-full max-w-xl rounded-xl shadow-2xl transition-all duration-200 overflow-hidden max-h-[90vh] overflow-y-auto relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 absolute top-5 right-4 z-10">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
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
              <h3 className="text-xl font-bold text-gray-900 max-sm:text-lg pr-2 max-sm:pr-4">{meal.name}</h3>
            </div>
            
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
  const [currentBatchNumber, setCurrentBatchNumber] = useState<number | null>(null);
  const { toast } = useToast();
  const supabase = createClient();

  const [selectedDuration, setSelectedDuration] = useState("3 days")
  // Plan Your Meals Card Options
  const days = [1, 2, 3, 4, 5, 6, 7]

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
        meal_name: string;
        meal_date: string;
        meal_type: string;
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
              nutrition_id: planRecord.nutrition_id || null,
              meal_name: planRecord.plan_name || (Array.isArray(planRecord.recipe) && planRecord.recipe[0]?.title) || meal.name,
              meal_date: dayPlan.start_date || '', // fallback to empty string if undefined
              meal_type: planRecord.plan_type || meal.type
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
    <div className="space-y-6 ">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-gray-900">
          Personalized Meal Plan
        </h1>
        <p className="text-gray-500 dark:text-gray-300 mb-2">
          Tailored nutrition for your unique lifestyle
        </p>
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

      {/* For Plan Your Meals Card */}
      <Card className="overflow-hidden ">
        <CardHeader className="text-center space-y-1">
          <CardTitle  className="text-gray-900 font-bold text-2xl">
            Plan Your Meals
          </CardTitle>
          <CardDescription className="text-base">
            Pick your plan duration, and get a personalized meal plan tailored to your tastes and dietary needs.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-7 gap-3">
            {days.map((days) => (
              <Button
                key={days}
                variant={selectedDays === days ? "default" : "outline"}
                className={`h-16 ${
                  selectedDays === days
                    ? "bg-emerald-500 hover:bg-emerald-600"
                    : "hover:border-emerald-200 hover:bg-emerald-50"
                }`}
                onClick={() => handleDaySelection(days)}
              >
                <div className="flex items-center justify-center">
                  {selectedDays === days && <Check className="w-4 h-4 mr-1.5 -ml-1" />}
                  {days} {days === 1 ? "day" : "days"}
                </div>
              </Button>
            ))}
          </div>
        </CardContent>
        <CardFooter className="flex justify-center pt-2 pb-6">
          <Button 
          onClick={handleGenerateMealPlan}
          size="lg" className="px-6 py-3 text-base"
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
        </CardFooter>
      </Card>

      {generatedPlanExists && (
        <div className="space-y-6 pb-8 ">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-emerald-500" />
                <CardTitle className="text-xl font-medium">AI Generated Meal Plan</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-100">
                <h3 className="text-emerald-700 font-medium mb-1">Based on your preferences</h3>
                <CardDescription className="text-emerald-600">Your personalized 1-day nutrition plan</CardDescription>
              </div>

              <p className="text-gray-600 text-sm">
                Each meal is balanced to meet your nutritional goals while incorporating your favorite ingredients.
              </p>
            </CardContent>
            <CardFooter className="flex flex-wrap gap-3 pt-2 justify-start md:justify-end">
              <Button variant="outline" className="flex items-center gap-2" onClick={handleRegenerate} disabled={isLoading}>
                <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
                Generate New Plan
              </Button>
              <Button variant="outline" className="flex items-center gap-2 text-gray-500" onClick={handleClearMealPlan}>
                <Trash2 className="h-4 w-4" />
                Clear Meal Plan
              </Button>
              <Button className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 md:ml-auto" onClick={handleSaveMealPlan}>
                <Save className="h-4 w-4" />
                Save This Plan
              </Button>
            </CardFooter>
          </Card>

          {mealPlan.length > 0 ? (
            mealPlan.map((dayPlan) => <MealPlanDayCard key={dayPlan.day} dayPlan={dayPlan} />)
          ) : (
            <div className="text-center py-10">
              <p className="text-gray-500">No meal plan data available.</p>
            </div>
          )}

          <div className="text-center mt-6 flex flex-col items-center">
            <Button 
              variant="ghost" 
              className="text-emerald-500 hover:text-emerald-600 hover:bg-emerald-50 flex gap-2"
              onClick={() => {/* Implement export functionality */ }}
            >
              <Download className="h-4 w-4" />
              Export {selectedDays}-Day Plan
            </Button>
            
          </div>
        </div>
      )}
    </div>
  );
}
