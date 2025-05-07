'use client';

import { useState } from 'react';
import { fetchRecipes } from '@/lib/api';
import { BrowserRouter as Router, Route, Link, Routes, useLocation } from 'react-router-dom';

// Define a TypeScript interface for recipes
interface Recipe {
  name: string;
  prep_time: string;
  cook_time: string;
  ingredients: string[];
  instructions: string[];
  nutrition: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  serving_size: string;
}

function RecipesPage() {
  const [input, setInput] = useState('');
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [selected, setSelected] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    const ingredients = input.split(',').map(str => str.trim()).filter(Boolean);
    if (ingredients.length === 0) {
      setError('Please enter at least one ingredient.');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const data = await fetchRecipes({ ingredients, cuisine: 'any' });
      setRecipes(data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-green-50 min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Recipe Recommendations</h1>

      <div className="flex items-center gap-2 mb-6">
        <input
          type="text"
          placeholder="Search by ingredient or recipe name..."
          value={input}
          onChange={e => setInput(e.target.value)}
          className="p-3 rounded border flex-1"
        />
        <button
          onClick={handleSearch}
          disabled={loading}
          className={`px-4 py-2 rounded ${
            loading
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-emerald-500 hover:bg-emerald-600 text-white'
          }`}
        >
          {loading ? 'Searching...' : 'Search'}
        </button>
      </div>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
          {recipes.map((r, idx) => (
            <div
              key={idx}
              className="bg-white shadow rounded-xl p-4 cursor-pointer hover:shadow-lg transition"
              onClick={() => setSelected(r)}
            >
              <h2 className="text-lg font-semibold">{r.name}</h2>
              <p className="text-sm text-gray-500 mt-1">
                ⏱ {r.prep_time} | 🍽 {r.serving_size}
              </p>
              <p className="mt-2 font-medium text-gray-700">
                {r.nutrition.calories} calories
              </p>
              <button className="mt-3 text-emerald-600 font-semibold hover:underline">
                View Recipe
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Recipe Modal */}
      {selected && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white p-6 rounded-xl max-w-lg w-full overflow-auto max-h-[90vh] relative">
            <button
              onClick={() => setSelected(null)}
              className="absolute top-2 right-3 text-gray-500 hover:text-red-500 text-xl"
              aria-label="Close"
            >
              ×
            </button>
            <h2 className="text-xl font-bold mb-2">{selected.name}</h2>
            <p className="text-sm text-gray-600 mb-2">
              Prep: {selected.prep_time} | Cook: {selected.cook_time}
            </p>
            <p className="text-sm text-gray-700 mb-3">
              Serving size: {selected.serving_size}
            </p>
            <h3 className="font-semibold mb-1">Ingredients:</h3>
            <ul className="list-disc pl-5 mb-3">
              {selected.ingredients.map((ing, i) => (
                <li key={i}>{ing}</li>
              ))}
            </ul>
            <h3 className="font-semibold mb-1">Instructions:</h3>
            <ol className="list-decimal pl-5 mb-3">
              {selected.instructions.map((step, i) => (
                <li key={i}>{step}</li>
              ))}
            </ol>
            <h3 className="font-semibold mb-1">Nutrition:</h3>
            <ul className="text-sm text-gray-700">
              <li>Calories: {selected.nutrition.calories}</li>
              <li>Protein: {selected.nutrition.protein}g</li>
              <li>Carbs: {selected.nutrition.carbs}g</li>
              <li>Fat: {selected.nutrition.fat}g</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

function ProfilePage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
      <div className="bg-white rounded-xl shadow-md p-6">
        <p className="text-gray-500">
          Your user profile settings will appear here.
        </p>
      </div>
    </div>
  );
}

function NavLink({ to, children }: { to: string; children: React.ReactNode }) {
  const location = useLocation();
  const isActive = location.pathname === to;
  return (
    <Link
      to={to}
      className={`text-white font-semibold ${
        isActive ? 'underline' : ''
      }`}
    >
      {children}
    </Link>
  );
}

export default function App() {
  return (
    <Router>
      <nav className="p-4 bg-green-500 flex gap-4">
        <NavLink to="/">Recipes</NavLink>
        <NavLink to="/profile">Profile</NavLink>
      </nav>
      <Routes>
        <Route path="/" element={<RecipesPage />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Routes>
    </Router>
  );
}