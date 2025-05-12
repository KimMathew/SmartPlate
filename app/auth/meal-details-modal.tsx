import { Button } from '@/components/ui/button'; // Update this path to the actual location of the Button component


type Meal = {
  type: string;
  name: string;
  prepTime?: number;
  difficulty?: 'easy' | 'medium' | 'hard';
  description: string;
  calories: number;
  protein: number;
  carbs?: number;
  fats?: number;
  ingredients?: string[];
  instructions?: string[];
};

// Helper to capitalize meal types
export function capitalizeMealType(type: string): string {
  return type.charAt(0).toUpperCase() + type.slice(1);
}

export const MealDetailsModal = ({ meal, onClose }: { meal: any; onClose: () => void }) => {
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
                {meal.type?.toLowerCase() === 'breakfast' && '🍳'}
                {meal.type?.toLowerCase() === 'lunch' && '🥗'}
                {meal.type?.toLowerCase() === 'dinner' && '🍽️'}
                {meal.type?.toLowerCase() === 'snack' && '🥜'}
                {!['breakfast', 'lunch', 'dinner', 'snack'].includes(meal.type?.toLowerCase()) && '🍲'}
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
            <span className="text-sm font-medium text-emerald-600 uppercase">
              {capitalizeMealType(meal.type)}
            </span>
            {meal.recipe?.prepTime && (
              <span className="text-sm text-gray-500 ml-4">⏱️ {meal.recipe.prepTime} mins</span>
            )}
            {meal.recipe?.difficulty && (
              <span className="text-sm text-gray-500 ml-4">
                {meal.recipe.difficulty === 'easy' && '⭐ Easy'}
                {meal.recipe.difficulty === 'medium' && '⭐⭐ Medium'}
                {meal.recipe.difficulty === 'hard' && '⭐⭐⭐ Hard'}
              </span>
            )}
          </div>

          <div className="text-gray-600 mb-6">
            <p>{meal.recipe?.description}</p>
          </div>

          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="bg-gray-50 p-3 rounded-lg text-center">
              <p className="text-lg font-bold text-emerald-600">{meal.nutrition?.calories ?? 0}</p>
              <p className="text-xs text-gray-500">Calories</p>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg text-center">
              <p className="text-lg font-bold text-emerald-600">{meal.nutrition?.protein ?? 0}g</p>
              <p className="text-xs text-gray-500">Protein</p>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg text-center">
              <p className="text-lg font-bold text-emerald-600">{meal.nutrition?.carbs ?? 0}g</p>
              <p className="text-xs text-gray-500">Carbs</p>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg text-center">
              <p className="text-lg font-bold text-emerald-600">{meal.nutrition?.fats ?? 0}g</p>
              <p className="text-xs text-gray-500">Fats</p>
            </div>
          </div>

          {/* Ingredients Section */}
          {meal.recipe?.ingredients && meal.recipe.ingredients.length > 0 && (
            <div className="mb-6">
              <h4 className="font-semibold text-gray-800 mb-3">Ingredients</h4>
              <ul className="list-disc pl-5 space-y-1 text-gray-600">
                {Array.isArray(meal.recipe.ingredients)
                  ? meal.recipe.ingredients.map((ingredient: string, index: number) => (
                      <li key={index}>{ingredient}</li>
                    ))
                  : meal.recipe.ingredients.split('\n').map((ingredient: string, index: number) => (
                      <li key={index}>{ingredient}</li>
                    ))}
              </ul>
            </div>
          )}

          {/* Instructions Section */}
          {meal.recipe?.instructions && meal.recipe.instructions.length > 0 && (
            <div className="mb-6">
              <h4 className="font-semibold text-gray-800 mb-3">Instructions</h4>
              <ol className="list-decimal pl-5 space-y-2 text-gray-600">
                {Array.isArray(meal.recipe.instructions)
                  ? meal.recipe.instructions.map((step: string, index: number) => (
                      <li key={index} className="pl-1">{step}</li>
                    ))
                  : meal.recipe.instructions.split('\n').map((step: string, index: number) => (
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