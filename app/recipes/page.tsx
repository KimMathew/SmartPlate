"use client";
import { createClient } from "@supabase/supabase-js";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { FaRegClock, FaRegStar, FaStar, FaHeart, FaRegHeart, FaUser } from "react-icons/fa";

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

const mockRecipes = [
  {
    id: 1,
    title: "Mediterranean Quinoa Bowl",
    time: 25,
    level: "Beginner",
    tags: ["Vegetarian", "High Protein", "Lunch"],
    calories: 420,
    protein: 18,
    fat: 15,
    rating: 4,
    reviews: 42,
    favorite: false,
    description: "A healthy Mediterranean quinoa bowl.",
    ingredients: ["Quinoa", "Tomatoes", "Olives", "Feta Cheese"],
    instructions: ["Cook quinoa", "Mix ingredients", "Serve with dressing"],
  },
  {
    id: 2,
    title: "Grilled Chicken with Avocado Salsa",
    time: 30,
    level: "Intermediate",
    tags: ["High Protein", "Gluten Free", "Dinner"],
    calories: 380,
    protein: 32,
    fat: 12,
    rating: 5,
    reviews: 78,
    favorite: true,
    description: "Grilled chicken topped with fresh avocado salsa.",
    ingredients: ["Chicken", "Avocado", "Tomatoes", "Onions", "Cilantro"],
    instructions: ["Grill chicken", "Prepare salsa", "Serve together"],
  },
];

const filters = [
  { label: "Diet:", value: "Vegetarian" },
  { label: "Meal:", value: "Lunch" },
  { label: "Time:", value: "Under 30 min" },
];

export default function RecipesPage() {
  const [search, setSearch] = useState("");
  const [recipes, setRecipes] = useState(mockRecipes);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedRecipe, setSelectedRecipe] = useState<any | null>(null); // For storing the selected recipe details
  const [recipeDetailsLoading, setRecipeDetailsLoading] = useState(false); // For loading the recipe details

  // Fetch recipes when the user submits the search
  async function handleSearch(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!search.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ search }),
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
          fat: meal.nutrition?.fats || meal.fats || 0,
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
    <div className="px-8 py-6">
      <h1 className="text-3xl font-bold mb-6">Recipe Recommendations</h1>

      {/* Search Bar */}
      <div className="bg-white rounded-xl shadow p-6 mb-8">
        <form className="flex items-center gap-4 mb-4" onSubmit={handleSearch}>
          <Input
            className="flex-1"
            placeholder="Search by ingredient or recipe name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Button variant="outline" className="flex items-center gap-2" type="submit" disabled={loading}>
            {loading ? 'Searching...' : 'Search'}
          </Button>
        </form>
        <div className="flex gap-2 flex-wrap">
          {filters.map((f, i) => (
            <Badge key={i} variant="outline" className="bg-green-100 text-green-700 font-medium px-3 py-1 rounded-full">
              {f.label} <span className="ml-1 font-semibold">{f.value}</span> <span className="ml-2 cursor-pointer">×</span>
            </Badge>
          ))}
        </div>
      </div>

      {/* Loading and error handling */}
      {loading && <div className="text-gray-500 mb-4">Loading recipes...</div>}
      {error && <div className="text-red-500 mb-4">{error}</div>}

      {/* Recipe Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {recipes.map((r) => (
          <Card key={r.id} className="p-6 shadow-md rounded-xl">
            <div className="flex justify-between items-start mb-2">
              <h2 className="text-xl font-semibold">{r.title}</h2>
              <button
                className="text-xl text-gray-400 hover:text-red-500"
                onClick={() => handleViewRecipe(r.id)}
              >
                {r.favorite ? <FaHeart className="text-red-500" /> : <FaRegHeart />}
              </button>
            </div>
            <div className="flex items-center gap-4 text-gray-500 text-sm mb-2">
              <span className="flex items-center gap-1"><FaRegClock /> {r.time} min</span>
              <span className="flex items-center gap-1"><FaUser /> {r.level}</span>
            </div>
            <div className="flex gap-2 mb-2 flex-wrap">
              {r.tags.map((tag, idx) => (
                <Badge key={idx} variant="secondary" className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full text-xs">{tag}</Badge>
              ))}
            </div>
            <Button onClick={() => handleViewRecipe(r.id)} className="w-full">View Recipe</Button>
          </Card>
        ))}
      </div>

      {/* Recipe Modal */}
      {selectedRecipe && (
        <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50">
          <div className="bg-white p-8 rounded-xl w-96">
            <h2 className="text-2xl font-semibold mb-4">{selectedRecipe.title}</h2>
            <p className="mb-4">{selectedRecipe.description}</p>
            <h3 className="font-semibold">Ingredients:</h3>
            <ul className="mb-4">
              {selectedRecipe.ingredients?.map((ingredient, idx) => (
                <li key={idx}>{ingredient}</li>
              ))}
            </ul>
            <h3 className="font-semibold">Instructions:</h3>
            <ul>
              {selectedRecipe.instructions?.map((step, idx) => (
                <li key={idx}>{step}</li>
              ))}
            </ul>
            <Button onClick={() => setSelectedRecipe(null)} className="mt-4 w-full">Close</Button>
          </div>
        </div>
      )}
    </div>
  );
}

