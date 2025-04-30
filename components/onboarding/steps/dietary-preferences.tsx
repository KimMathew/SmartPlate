"use client";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Check } from "lucide-react";
import { motion } from "framer-motion";

interface DietaryPreferencesProps {
  formData: any;
  onChange: (field: string, value: string | string[]) => void;
  onFinish: () => void;
  onBack: () => void;
  onSkip: () => void;
}

export default function DietaryPreferences({
  formData,
  onChange,
  onFinish,
  onBack,
  onSkip,
}: DietaryPreferencesProps) {
  const handleMultiSelect = (field: string, value: string) => {
    const currentValues = formData[field] as string[];
    const newValues = currentValues.includes(value)
      ? currentValues.filter((v) => v !== value)
      : [...currentValues, value];

    onChange(field, newValues);
  };

  return (
    <div className="flex h-full w-full">
      <div className="w-[65%] p-10 flex flex-col h-full overflow-auto pb-10">
        {/* Progress indicator */}
        <div className="flex gap-2 mb-8 top-0 bg-white pt-2 justify-center">
          <div className="h-1.5 w-20 bg-emerald-500 rounded-full"></div>
          <div className="h-1.5 w-20 bg-emerald-500 rounded-full"></div>
          <div className="h-1.5 w-20 bg-emerald-500 rounded-full"></div>
          <div className="h-1.5 w-20 bg-emerald-500 rounded-full"></div>
        </div>
        <div className="flex-1 flex flex-col justify-center min-h-min">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Your Food Preferences
          </h2>
          <p className="text-gray-600 mb-8">
            Help us create the perfect meal plan for you.
          </p>
          <div className="space-y-6">
            <div className="space-y-3">
              <Label htmlFor="dietType" className="text-gray-900 text-base">
                Diet Type
              </Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {[
                  { value: "vegan", label: "Vegan", icon: "🌱" },
                  { value: "keto", label: "Keto", icon: "🥑" },
                  {
                    value: "mediterranean",
                    label: "Mediterranean",
                    icon: "🫒",
                  },
                  { value: "gluten-free", label: "Gluten-Free", icon: "🌾" },
                  { value: "none", label: "No Restrictions", icon: "🍽️" },
                ].map((option) => (
                  <div
                    key={option.value}
                    onClick={() => onChange("dietType", option.value)}
                    className={`px-2 py-4 rounded-lg border cursor-pointer transition-all duration-200 text-center relative text-sm
                      ${
                        formData.dietType === option.value
                          ? "border-emerald-500 shadow-md ring-2 ring-emerald-500/20"
                          : "border-gray-300 hover:border-emerald-300 hover:bg-emerald-50/30"
                      }`}
                    style={{ minWidth: 0 }}
                  >
                    {formData.dietType === option.value && (
                      <div className="absolute top-0 right-0 w-0 h-0 border-t-[28px] border-r-[28px] border-t-emerald-500 border-r-transparent">
                        <Check className="absolute -top-[20px] right-[-20px] h-3 w-3 text-white" />
                      </div>
                    )}
                    <div className="text-xl mb-1">{option.icon}</div>
                    <div
                      className={`font-medium ${
                        formData.dietType === option.value
                          ? "text-emerald-700"
                          : "text-gray-700"
                      }`}
                    >
                      {option.label}
                    </div>
                    {formData.dietType === option.value && (
                      <div className="absolute inset-0 bg-emerald-500/5 rounded-lg pointer-events-none" />
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-gray-900 text-base">
                Allergens to Avoid
              </Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {[
                  { value: "gluten", label: "Gluten", icon: "🌾" },
                  { value: "dairy", label: "Dairy", icon: "🥛" },
                  { value: "nuts", label: "Nuts", icon: "🥜" },
                  { value: "shellfish", label: "Shellfish", icon: "🦐" },
                  { value: "eggs", label: "Eggs", icon: "🥚" },
                  { value: "none", label: "None", icon: "✓" },
                ].map((allergen) => (
                  <div
                    key={allergen.value}
                    onClick={() =>
                      handleMultiSelect("allergens", allergen.value)
                    }
                    className={`px-2 py-4 rounded-lg border cursor-pointer transition-all duration-200 text-center relative text-sm
                      ${
                        formData.allergens.includes(allergen.value)
                          ? "border-emerald-500 shadow-md ring-2 ring-emerald-500/20"
                          : "border-gray-300 hover:border-emerald-300 hover:bg-emerald-50/30"
                      }`}
                    style={{ minWidth: 0 }}
                  >
                    <div className="text-xl mb-1">{allergen.icon}</div>
                    <div
                      className={`font-medium ${
                        formData.allergens.includes(allergen.value)
                          ? "text-emerald-700"
                          : "text-gray-700"
                      }`}
                    >
                      {allergen.label}
                    </div>
                    {formData.allergens.includes(allergen.value) && (
                      <>
                        <div className="absolute top-2 right-2 h-5 w-5 bg-emerald-500 rounded-full flex items-center justify-center">
                          <Check className="h-3 w-3 text-white" />
                        </div>
                        <div className="absolute inset-0 bg-emerald-500/5 rounded-lg pointer-events-none" />
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <Label
                htmlFor="dislikedIngredients"
                className="text-gray-900 text-base"
              >
                Disliked Ingredients
              </Label>
              <div className="relative">
                <input
                  type="text"
                  id="dislikedIngredients"
                  placeholder="e.g., Mushrooms, Olives"
                  value={formData.dislikedIngredients.join(", ")}
                  onChange={(e) =>
                    onChange("dislikedIngredients", e.target.value.split(", "))
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-gray-900 bg-white shadow-sm transition-all duration-200"
                />
              </div>
              <p className="text-sm text-gray-500">
                Separate ingredients with commas.
              </p>
            </div>

            <div className="space-y-3">
              <Label className="text-gray-900 text-base">
                Preferred Cuisines
              </Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {[
                  { value: "italian", label: "Italian", icon: "🍝" },
                  { value: "mexican", label: "Mexican", icon: "🌮" },
                  { value: "asian", label: "Asian", icon: "🍜" },
                  {
                    value: "mediterranean",
                    label: "Mediterranean",
                    icon: "🫒",
                  },
                  { value: "indian", label: "Indian", icon: "🍛" },
                  { value: "any", label: "Any", icon: "🌍" },
                ].map((cuisine) => (
                  <div
                    key={cuisine.value}
                    onClick={() =>
                      handleMultiSelect("preferredCuisines", cuisine.value)
                    }
                    className={`px-2 py-4 rounded-lg border cursor-pointer transition-all duration-200 text-center relative text-sm
                      ${
                        formData.preferredCuisines.includes(cuisine.value)
                          ? "border-emerald-500 shadow-md ring-2 ring-emerald-500/20"
                          : "border-gray-300 hover:border-emerald-300 hover:bg-emerald-50/30"
                      }`}
                    style={{ minWidth: 0 }}
                  >
                    <div className="text-xl mb-1">{cuisine.icon}</div>
                    <div
                      className={`font-medium ${
                        formData.preferredCuisines.includes(cuisine.value)
                          ? "text-emerald-700"
                          : "text-gray-700"
                      }`}
                    >
                      {cuisine.label}
                    </div>
                    {formData.preferredCuisines.includes(cuisine.value) && (
                      <>
                        <div className="absolute top-2 right-2 h-5 w-5 bg-emerald-500 rounded-full flex items-center justify-center">
                          <Check className="h-3 w-3 text-white" />
                        </div>
                        <div className="absolute inset-0 bg-emerald-500/5 rounded-lg pointer-events-none" />
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label
                  htmlFor="mealsPerDay"
                  className="text-gray-900 text-base"
                >
                  Meals per Day
                </Label>
                <select
                  id="mealsPerDay"
                  value={formData.mealsPerDay}
                  onChange={(e) => onChange("mealsPerDay", e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-gray-900 bg-white shadow-sm transition-all duration-200"
                >
                  <option value="">Select</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                  <option value="4">4</option>
                  <option value="5">5</option>
                </select>
              </div>

              <div className="space-y-3">
                <Label
                  htmlFor="mealPrepTimeLimit"
                  className="text-gray-900 text-base"
                >
                  Meal Prep Time Limit
                </Label>
                <select
                  id="mealPrepTimeLimit"
                  value={formData.mealPrepTimeLimit}
                  onChange={(e) =>
                    onChange("mealPrepTimeLimit", e.target.value)
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-gray-900 bg-white shadow-sm transition-all duration-200"
                >
                  <option value="">Select</option>
                  <option value="15">{"<15 mins"}</option>
                  <option value="30">{"<30 mins"}</option>
                  <option value="60">{"<1 hour"}</option>
                  <option value="no-limit">No Limit</option>
                </select>
              </div>
            </div>
          </div>
        </div>
        <div className="flex justify-between mt-8 pt-4 bg-white">
          <button
            onClick={onBack}
            className="text-gray-700 hover:text-gray-900 font-medium"
          >
            Back
          </button>
          <button
            onClick={onFinish}
            className="px-6 py-2 bg-emerald-500 text-white rounded-md hover:bg-emerald-600 transition-colors"
          >
            Finish
          </button>
        </div>
      </div>
      <div className="w-[35%] bg-emerald-500 h-full"></div>
    </div>
  );
}
