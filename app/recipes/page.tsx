"use client";
import React from "react";
import ReactDOM from "react-dom";
import { createClient } from "@supabase/supabase-js";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FaRegClock, FaRegStar, FaStar, FaHeart, FaRegHeart, FaUser } from "react-icons/fa";
import { Clock, Globe, Loader2, Search, X } from "lucide-react";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Use server-side environment variables for API credentials
const createSupabaseClient = (authToken?: string, useServiceRole = false) => {
  // If service role is requested but not available, log a warning and use anon key instead
  if (useServiceRole && !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.warn("SUPABASE_SERVICE_ROLE_KEY is not defined. Falling back to anon key. You should add this to your environment variables.");
    useServiceRole = false;
  }

  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    useServiceRole ? process.env.SUPABASE_SERVICE_ROLE_KEY! : process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
      global: {
        headers: authToken && !useServiceRole
          ? {
            Authorization: `Bearer ${authToken}`,
          }
          : {},
      },
      db: {
        schema: 'public',
      },
    }
  );
};

// Use the server-side API key for Gemini - this should be a secret environment variable
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY!);

// Define types for the meal plan data structure
interface MealNutrition {
  calories?: number;
  protein?: number;
  carbs?: number;
  fats?: number;
  fiber?: number;
  vitamins?: string | null;
}

interface Meal {
  id?: number;
  name: string;
  type?: string;
  description?: string;
  nutrition?: MealNutrition;
  ingredients?: string[];
  instructions?: string[];
  cuisine_type?: string;
  prepTime?: number;
  prep_time?: number;
  difficulty?: string;
  image_url?: string;
  source_url?: string;
  title?: string;
  time?: number;
  level?: string;
  tags?: string[];
  calories?: number;
  protein?: number;
  fat?: number;
  rating?: number;
  reviews?: number;
  favorite?: boolean;
}

// Utility function to check if a table exists
async function getTableNames(supabase: ReturnType<typeof createSupabaseClient>) {
  const { data, error } = await supabase
    .rpc('get_all_tables'); // This assumes you have RPC access, otherwise use a different method

  if (error) {
    console.error("Error fetching table names:", error);
    return [];
  }

  return data || [];
}

// Utility to find the best matching table name
function findBestMatchingTable(tables: string[], baseName: string) {
  const lowerBaseName = baseName.toLowerCase();

  // Try exact match first
  if (tables.includes(baseName)) {
    return baseName;
  }

  // Try with common variations
  const variations = [
    baseName,
    baseName.toLowerCase(),
    baseName.toUpperCase(),
    baseName.replace('_', ''),
    baseName.replace('_', '') + 's',
    baseName + 's',
    baseName.slice(0, -1) // Remove potential trailing 's'
  ];

  for (const variation of variations) {
    if (tables.includes(variation)) {
      return variation;
    }
  }

  // Try partial matches
  for (const table of tables) {
    if (table.toLowerCase().includes(lowerBaseName)) {
      return table;
    }
  }

  return null;
}

const filters = [
  { label: "Diet:", value: "Vegetarian" },
  { label: "Meal:", value: "Lunch" },
  { label: "Time:", value: "Under 30 min" },
];

// Recipe Details Modal Component
function RecipeDetailsModal({ recipe, onClose }: { recipe: any; onClose: () => void }) {
  const [visible, setVisible] = React.useState(true);
  const [animate, setAnimate] = React.useState(false);

  React.useEffect(() => {
    setVisible(true);
    setTimeout(() => setAnimate(true), 10);
    return () => {
      setAnimate(false);
      setVisible(false);
    };
  }, []);

  const handleClose = () => {
    setAnimate(false);
    setTimeout(() => setVisible(false), 200);
    setTimeout(onClose, 200);
  };

  if (!visible) return null;

  // Extract nutrition info (handles both flat and nested)
  const nutrition = recipe.nutrition || {};
  const calories = nutrition.calories ?? recipe.calories ?? 0;
  const protein = nutrition.protein ?? nutrition.protein_g ?? recipe.protein ?? 0;
  const carbs = nutrition.carbs ?? nutrition.carbs_g ?? recipe.carbs ?? 0;
  const fats = nutrition.fats ?? nutrition.fat ?? nutrition.fats_g ?? recipe.fats ?? 0;

  return ReactDOM.createPortal(
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 transition-opacity duration-200 ${animate ? 'opacity-100' : 'opacity-0'}`} onClick={handleClose}>
      <div
        className={`bg-white w-full max-w-xl rounded-xl shadow-2xl transition-all duration-200 overflow-hidden max-h-[90vh] overflow-y-auto relative mx-auto ${animate ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}
        onClick={e => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={handleClose}
          className="text-gray-400 hover:text-gray-600 absolute top-5 right-4 z-10"
          aria-label="Close modal"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
        <div className="p-6">
          {/* Title */}
          <h2 className="text-2xl font-bold mb-2 text-gray-900">{recipe.title || recipe.name}</h2>
          {/* Description */}
          {recipe.description && <p className="text-gray-600 mb-4">{recipe.description}</p>}

          {/* Nutrition Info (copied style from MealDetailsModal) */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2 text-gray-800">Nutritional Information</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-emerald-50 rounded-lg p-3 flex flex-col items-center">
                <span className="text-xs text-gray-500">Calories</span>
                <span className="font-bold text-lg text-emerald-700">{calories}</span>
              </div>
              <div className="bg-blue-50 rounded-lg p-3 flex flex-col items-center">
                <span className="text-xs text-gray-500">Protein</span>
                <span className="font-bold text-lg text-blue-700">{protein}g</span>
              </div>
              <div className="bg-amber-50 rounded-lg p-3 flex flex-col items-center">
                <span className="text-xs text-gray-500">Carbs</span>
                <span className="font-bold text-lg text-amber-700">{carbs}g</span>
              </div>
              <div className="bg-rose-50 rounded-lg p-3 flex flex-col items-center">
                <span className="text-xs text-gray-500">Fats</span>
                <span className="font-bold text-lg text-rose-700">{fats}g</span>
              </div>
            </div>
          </div>

          {/* Ingredients */}
          {recipe.ingredients && recipe.ingredients.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2 text-gray-800">Ingredients</h3>
              <ul className="list-disc list-inside text-gray-700 space-y-1">
                {recipe.ingredients.map((ing: string, idx: number) => (
                  <li key={idx}>{ing}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Instructions */}
          {recipe.instructions && recipe.instructions.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2 text-gray-800">Instructions</h3>
              <ol className="list-decimal list-inside text-gray-700 space-y-1">
                {recipe.instructions.map((step: string, idx: number) => (
                  <li key={idx}>{step}</li>
                ))}
              </ol>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}

// Error Modal Component
function ErrorModal({ message, onClose }: { message: string; onClose: () => void }) {
  const [visible, setVisible] = React.useState(true);
  const [animate, setAnimate] = React.useState(false);

  React.useEffect(() => {
    setVisible(true);
    setTimeout(() => setAnimate(true), 10);
    return () => {
      setAnimate(false);
      setVisible(false);
    };
  }, []);

  const handleClose = () => {
    setAnimate(false);
    setTimeout(() => setVisible(false), 200);
    setTimeout(onClose, 200);
  };

  if (!visible) return null;

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
              <div className="font-semibold text-lg text-gray-900">Search Error</div>
              <div className="text-gray-600 text-sm mt-1">
                {message || "Please provide at least one search criteria (ingredient, preparation time, or cuisine)."}
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-3 px-6 py-4">
            <Button onClick={handleClose} className="min-w-[90px] bg-emerald-500 hover:bg-emerald-600 text-white">OK</Button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

export default function RecipesPage() {
  const [search, setSearch] = useState("");
  const [recipes, setRecipes] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedRecipe, setSelectedRecipe] = useState<any | null>(null); // For storing the selected recipe details
  const [recipeDetailsLoading, setRecipeDetailsLoading] = useState(false); // For loading the recipe details

  const [ingredients, setIngredients] = useState<string[]>([])
  const [inputValue, setInputValue] = useState("")
  const [prepTime, setPrepTime] = useState("")
  const [cuisine, setCuisine] = useState("")

  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleAddIngredient = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && inputValue.trim()) {
      e.preventDefault()
      setIngredients([...ingredients, inputValue.trim()])
      setInputValue("")
    }
  }

  const handleRemoveIngredient = (ingredient: string) => {
    setIngredients(ingredients.filter((item) => item !== ingredient))
  }

  const handleReset = () => {
    setIngredients([])
    setInputValue("")
    setPrepTime("")
    setCuisine("")
  }

  const difficultyColors = {
    easy: {
      bg: "bg-emerald-50",
      border: "border-emerald-100",
      text: "text-emerald-700",
      hover: "hover:bg-emerald-50",
      emoji: "👌",
    },
    medium: {
      bg: "bg-amber-50",
      border: "border-amber-100",
      text: "text-amber-700",
      hover: "hover:bg-amber-50",
      emoji: "👍",
    },
    hard: {
      bg: "bg-rose-50",
      border: "border-rose-100",
      text: "text-rose-700",
      hover: "hover:bg-rose-50",
      emoji: "💪",
    },
  }

  // Helper function to get a valid difficulty key
  function getDifficultyKey(level: any): keyof typeof difficultyColors {
    if (typeof level === 'string') {
      const key = level.toLowerCase();
      if (key === 'easy' || key === 'medium' || key === 'hard') return key as keyof typeof difficultyColors;
    }
    return 'easy';
  }

  // Fetch recipes when the user submits the search
  async function handleSearch(e?: React.FormEvent<HTMLFormElement> | React.MouseEvent<HTMLButtonElement>) {
    if (e) e.preventDefault?.();
    // Validate at least one search criteria
    if (ingredients.length === 0 && !prepTime && !cuisine) {
      setErrorMessage("Please provide at least one search criteria.");
      setShowErrorModal(true);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ingredients,
          prepTime,
          cuisine
        }),
      });
      const data = await res.json();
      if (data.success && data.mealPlan) {
        const newRecipes = data.mealPlan.map((meal: any, idx: number) => ({
          id: idx + 1,
          title: meal.name || "Recipe",
          time: meal.prepTime || 0,
          level: meal.difficulty || "-",
          tags: [meal.cuisine_type || "", ...(meal.type ? [meal.type] : [])],
          calories: meal.nutrition?.calories || meal.calories || 0,
          protein: meal.nutrition?.protein || meal.protein || 0,
          carbs: meal.nutrition?.carbs || meal.carbs || 0, // <-- FIXED: map carbs
          fats: meal.nutrition?.fats || meal.fats || meal.fat || 0, // <-- FIXED: map fats
          rating: 4,
          reviews: 0,
          favorite: false,
          description: meal.description || "",
          ingredients: meal.ingredients || [],
          instructions: meal.instructions || [],
        }));
        setRecipes(newRecipes);
      } else {
        setError(data.error || "No recipes found");
        setRecipes([]);
      }
    } catch (e: any) {
      setError(e.message || "Unknown error");
      setRecipes([]);
    } finally {
      setLoading(false);
    }
  }

  

  // Fetch recipe details when the user clicks "View Recipe"
// inside your React component

const handleViewRecipe = async (recipeId: number) => {
  setRecipeDetailsLoading(true);
  setError(null);

  try {
    // Find the recipe in our existing mock data
    const recipe = recipes.find(r => r.id === recipeId);
    
    if (recipe) {
      setSelectedRecipe(recipe);
    } else {
      setError("Recipe not found in our database.");
    }
  } catch (error) {
    console.error(error);
    setError("Error loading recipe details.");
  } finally {
    setRecipeDetailsLoading(false);
  }
};


  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-gray-900">
          Recipe Recommendations
        </h1>
        <p className="text-gray-500 dark:text-gray-300 mb-2">
          Discover delicious, tailored recipes that inspire your meals
        </p>
      </div>

      <Card>
        <CardHeader className="text-center space-y-1">
          <CardTitle className="text-gray-900 font-bold text-2xl">Search Recipes</CardTitle>
          <CardDescription className="text-base">
            Find delicious recipes by ingredient, preparation time, and cuisine
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Ingredients */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="bg-emerald-50 p-1.5 rounded-full">
                  <Search className="h-4 w-4 text-emerald-600" />
                </div>
                <label htmlFor="ingredients" className="text-sm font-medium text-gray-700">
                  Ingredients
                </label>
              </div>
              <div className="relative">
                <Input
                  id="ingredients"
                  placeholder="Enter an ingredient and press Enter to add"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleAddIngredient}
                />
                {inputValue && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 p-0 text-gray-400 hover:text-gray-600"
                    onClick={() => setInputValue("")}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
              {ingredients.length > 0 && (
                <div className="flex flex-wrap gap-1 pt-1">
                  {ingredients.map((ingredient) => (
                    <Badge
                      key={ingredient}
                      variant="outline"
                      className="inline-flex items-center px-3 py-1 mr-2 mb-1 rounded-full bg-emerald-100 text-emerald-800 text-sm font-medium border-0"
                    >
                      {ingredient}
                      <button
                        className="ml-1 text-emerald-600 hover:text-red-500"
                        onClick={() => handleRemoveIngredient(ingredient)}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Preparation Time */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="bg-emerald-50 p-1.5 rounded-full">
                  <Clock className="h-4 w-4 text-emerald-600" />
                </div>
                <label htmlFor="prep-time" className="text-sm font-medium text-gray-700">
                  Preparation Time
                </label>
              </div>
              <Select value={prepTime} onValueChange={setPrepTime}>
                <SelectTrigger
                  id="prep-time"
                  className="px-3 py-2 border-gray-300 focus:outline-none focus:ring-emerald-500 focus:ring-1 [&>span]:flex [&>span]:items-center [&>span]:gap-2"
                >
                  <SelectValue placeholder="Select time" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="15">Under 15 minutes</SelectItem>
                    <SelectItem value="30">Under 30 minutes</SelectItem>
                    <SelectItem value="45">Under 45 minutes</SelectItem>
                    <SelectItem value="60">Under 1 hour</SelectItem>
                    <SelectItem value="120">1-2 hours</SelectItem>
                    <SelectItem value="180">Over 2 hours</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            {/* Cuisine */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="bg-emerald-50 p-1.5 rounded-full">
                  <Globe className="h-4 w-4 text-emerald-600" />
                </div>
                <label htmlFor="cuisine" className="text-sm font-medium text-gray-700">
                  Cuisine
                </label>
              </div>
              <Select value={cuisine} onValueChange={setCuisine}>
                <SelectTrigger
                  id="cuisine"
                  className="px-3 py-2 border-gray-300 focus:outline-none focus:ring-emerald-500 focus:ring-1 [&>span]:flex [&>span]:items-center [&>span]:gap-2"
                >
                  <SelectValue placeholder="Select cuisine" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="african">African</SelectItem>
                    <SelectItem value="american">American</SelectItem>
                    <SelectItem value="asian">Asian</SelectItem>
                    <SelectItem value="european">European</SelectItem>
                    <SelectItem value="mediterranean">Mediterranean</SelectItem>
                    <SelectItem value="middle-eastern">Middle Eastern</SelectItem>
                    <SelectItem value="south-american">South American</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-between pt-2">
            <Button
              variant="outline"
              onClick={handleReset}
              className="text-gray-600 border-gray-200 hover:bg-gray-50 hover:text-gray-800"
            >
              Reset
            </Button>
            <Button
              className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 md:ml-auto"
              onClick={handleSearch}
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Searching...
                </span>
              ) : (
                <>
                  <Search className="h-4 w-4" />
                  Search Recipes
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Loading and error handling */}
      {/* {loading && <div className="text-gray-500 mb-4">Loading recipes...</div>} */}
      {error && <div className="text-red-500 mb-4">{error}</div>}

      {/* Recipe Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {recipes.map((r: any) => {
          const difficultyKey = getDifficultyKey(r.level);
          return (
            <div key={r.id} className="p-5 border rounded-lg hover:shadow-md transition-shadow duration-200 flex flex-col h-full">
              <div className="flex items-center gap-2 mb-3">
                <div className="text-emerald-500">
                  <Globe className="h-4 w-4" />
                </div>
                <span className="text-sm font-medium text-emerald-500 capitalize">
                  {r.cuisine_type || r.tags[0]}
                </span>
              </div>
              <h4 className="font-semibold text-gray-800 mb-2 leading-tight">{r.title}</h4>
              <p className="text-gray-600 text-sm mb-4 line-clamp-2 flex-1">{r.description}</p>
              <div className="mt-auto">
                <div className="flex flex-wrap gap-2 items-center mb-3">
                  <Badge
                    variant="outline"
                    className="bg-blue-50 border-blue-100 text-blue-700 hover:bg-blue-50 flex items-center gap-1"
                  >
                    <Clock className="h-3 w-3" /> {r.time} min
                  </Badge>
                  <Badge
                    variant="outline"
                    className={`${difficultyColors[difficultyKey].bg} ${difficultyColors[difficultyKey].border} ${difficultyColors[difficultyKey].text} ${difficultyColors[difficultyKey].hover} flex items-center gap-1`}
                  >
                    {difficultyColors[difficultyKey].emoji} {difficultyKey.charAt(0).toUpperCase() + difficultyKey.slice(1)}
                  </Badge>
                </div>
                <Button onClick={() => handleViewRecipe(r.id)} className="w-full">View Recipe</Button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recipe Modal rendered outside main content for full overlay */}
      {selectedRecipe && (
        <RecipeDetailsModal recipe={selectedRecipe} onClose={() => setSelectedRecipe(null)} />
      )}

      {/* Error Modal rendered outside main content for full overlay */}
      {showErrorModal && (
        <ErrorModal message={errorMessage} onClose={() => setShowErrorModal(false)} />
      )}
    </div>
  );
}

