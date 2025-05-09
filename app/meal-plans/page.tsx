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
};

type DayPlan = {
  day: string;
  meals: Meal[];
};

// Component for the meal plan day card
const MealPlanDayCard = ({ dayPlan }: { dayPlan: DayPlan }) => (
  <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
    <h2 className="text-xl font-bold text-gray-900 mb-4 border-b pb-2">{dayPlan.day}</h2>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {dayPlan.meals.map((meal, index) => (
        <div
          key={index}
          className="p-4 border rounded-lg hover:border-emerald-200 transition-colors"
        >
          <h3 className="text-lg font-semibold text-emerald-500">{meal.type}</h3>
          <p className="text-gray-800 font-medium">{meal.name}</p>
          <p className="text-gray-600 text-sm line-clamp-2">{meal.description}</p>
          <div className="flex justify-between mt-2 text-gray-500 text-sm">
            <span>{meal.calories} cal</span>
            <span>{meal.protein}g protein</span>
          </div>
        </div>
      ))}
    </div>
  </div>
);

// Main component
export default function MealPlansPage() {
  const router = useRouter();
  const { session, user, isLoading: sessionLoading } = useSession();
  // State
  const [localSelectedDays, setLocalSelectedDays] = useState<number>(3);
  const [viewGeneratedPlan, setViewGeneratedPlan] = useState(false);
  const [mealPlan, setMealPlan] = useState<DayPlan[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
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
        throw new Error(errorData.error || `Server error: ${response.status}`);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || "Failed to generate meal plan");
      }

      // Update to use the correct property based on API response structure
      const planData = data.data?.meal_plan?.days || [];

      // Transform API data to match our component structure
      const formattedPlan = planData.map((day: { day: string; meals: Meal[] }) => ({
        day: day.day,
        meals: day.meals.map(meal => ({
          type: meal.type,
          name: meal.name,
          description: meal.description,
          calories: meal.calories,
          protein: meal.protein
        }))
      }));

      setMealPlan(formattedPlan);
      setViewGeneratedPlan(true);

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
    setViewGeneratedPlan(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // UI for generated plan view
  if (viewGeneratedPlan) {
    return (
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
              onClick={() => {/* Implement save functionality */ }}
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
    );
  }

  // UI for plan selection view
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Personalized Meal Plan</h1>
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm text-gray-500">Step 1: Select Duration</span>
        <Progress value={50} className="w-full mx-4" />
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
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
    </div>
  );
}
