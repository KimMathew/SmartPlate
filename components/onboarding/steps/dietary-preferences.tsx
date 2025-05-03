"use client";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Check, X } from "lucide-react";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import ProgressIndicator from "../progress-indicator";

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
  // Animated progress bar state
  const [currentStep, setCurrentStep] = useState(3);
  const [segmentProgress, setSegmentProgress] = useState([100, 100, 100, 0]);
  const [otherDiet, setOtherDiet] = useState(formData.dietTypeOther || "");
  const [dietError, setDietError] = useState("");
  const [otherAllergen, setOtherAllergen] = useState(
    formData.allergenOther || ""
  );
  const [allergenError, setAllergenError] = useState("");
  const [otherAllergenInput, setOtherAllergenInput] = useState("");
  const [otherAllergenList, setOtherAllergenList] = useState<string[]>(
    formData.allergenOther ? formData.allergenOther.split(",") : []
  );
  const [dislikedIngredientInput, setDislikedIngredientInput] = useState("");
  const [dislikedIngredientList, setDislikedIngredientList] = useState<
    string[]
  >(
    Array.isArray(formData.dislikedIngredients)
      ? formData.dislikedIngredients
      : []
  );
  const [otherCuisineInput, setOtherCuisineInput] = useState("");
  const [otherCuisineList, setOtherCuisineList] = useState<string[]>(
    Array.isArray(formData.cuisineOther) && formData.cuisineOther.length > 0
      ? formData.cuisineOther
      : []
  );
  const [preferredCuisinesError, setPreferredCuisinesError] = useState("");
  const [dislikedIngredientsError, setDislikedIngredientsError] = useState("");
  const [mealsPerDayError, setMealsPerDayError] = useState("");
  const [mealPrepTimeLimitError, setMealPrepTimeLimitError] = useState("");

  const dietOptions = [
    { value: "vegan", label: "Vegan", icon: "🌱" },
    { value: "keto", label: "Keto", icon: "🥑" },
    { value: "mediterranean", label: "Mediterranean", icon: "🫒" },
    { value: "gluten-free", label: "Gluten-Free", icon: "🌾" },
    { value: "none", label: "No Restrictions", icon: "🍽️" },
    { value: "other", label: "Other", icon: "❓" },
  ];

  const allergenOptions = [
    { value: "gluten", label: "Gluten", icon: "🌾" },
    { value: "dairy", label: "Dairy", icon: "🥛" },
    { value: "nuts", label: "Nuts", icon: "🥜" },
    { value: "eggs", label: "Eggs", icon: "🥚" },
    { value: "none", label: "None", icon: "✓" },
    { value: "other", label: "Other", icon: "❓" },
  ];

  useEffect(() => {
    setCurrentStep(3); // step 4
    setSegmentProgress([100, 100, 100, 0]);
    setTimeout(() => {
      setSegmentProgress([100, 100, 100, 100]);
    }, 100);
  }, []);

  const handleMultiSelect = (field: string, value: string) => {
    const currentValues = formData[field] as string[];
    const newValues = currentValues.includes(value)
      ? currentValues.filter((v) => v !== value)
      : [...currentValues, value];

    onChange(field, newValues);
  };

  const handleDietTypeChange = (value: string) => {
    if (value === "other") {
      onChange("dietType", "other");
      setOtherDiet("");
    } else {
      onChange("dietType", value);
      setOtherDiet("");
      onChange("dietTypeOther", "");
    }
    setDietError("");
  };

  const handleAllergenChange = (value: string) => {
    if (value === "other") {
      onChange("allergens", ["other"]);
      setOtherAllergen("");
    } else {
      onChange("allergens", [value]);
      setOtherAllergen("");
      onChange("allergenOther", "");
    }
    setAllergenError("");
  };

  const handleOtherDietInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setOtherDiet(e.target.value);
    onChange("dietTypeOther", e.target.value);
    setDietError("");
  };

  const handleOtherAllergenInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setOtherAllergenInput(e.target.value);
    setAllergenError("");
  };

  const handleOtherAllergenKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if ((e.key === "Enter" || e.key === ",") && otherAllergenInput.trim()) {
      e.preventDefault();
      const value = otherAllergenInput.trim().replace(/,$/, "");
      if (value && !otherAllergenList.includes(value)) {
        const updated = [...otherAllergenList, value];
        setOtherAllergenList(updated);
        setOtherAllergenInput("");
        onChange("allergenOther", updated.join(","));
      }
    }
  };

  const handleRemoveOtherAllergen = (value: string) => {
    const updated = otherAllergenList.filter((item) => item !== value);
    setOtherAllergenList(updated);
    onChange("allergenOther", updated.join(","));
  };

  const handleDislikedIngredientInput = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setDislikedIngredientInput(e.target.value);
  };

  const handleDislikedIngredientKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (
      (e.key === "Enter" || e.key === ",") &&
      dislikedIngredientInput.trim()
    ) {
      e.preventDefault();
      const value = dislikedIngredientInput.trim().replace(/,$/, "");
      if (value && !dislikedIngredientList.includes(value)) {
        const updated = [...dislikedIngredientList, value];
        setDislikedIngredientList(updated);
        setDislikedIngredientInput("");
        onChange("dislikedIngredients", updated);
      }
    }
  };

  const handleRemoveDislikedIngredient = (value: string) => {
    const updated = dislikedIngredientList.filter((item) => item !== value);
    setDislikedIngredientList(updated);
    onChange("dislikedIngredients", updated);
  };

  const handleOtherCuisineInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setOtherCuisineInput(e.target.value);
  };

  const handleOtherCuisineKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if ((e.key === "Enter" || e.key === ",") && otherCuisineInput.trim()) {
      e.preventDefault();
      const value = otherCuisineInput.trim().replace(/,$/, "");
      if (value && !otherCuisineList.includes(value)) {
        const updated = [...otherCuisineList, value];
        setOtherCuisineList(updated);
        setOtherCuisineInput("");
        onChange("cuisineOther", updated);
      }
    }
  };

  const handleRemoveOtherCuisine = (value: string) => {
    const updated = otherCuisineList.filter((item) => item !== value);
    setOtherCuisineList(updated);
    onChange("cuisineOther", updated);
  };

  const handleFinish = () => {
    let hasError = false;
    if (!formData.dietType) {
      setDietError("Please select your diet type.");
      hasError = true;
    } else if (formData.dietType === "other" && !otherDiet.trim()) {
      setDietError("Please specify your diet type.");
      hasError = true;
    } else {
      setDietError("");
    }
    if (!formData.allergens || formData.allergens.length === 0) {
      setAllergenError("Please select an allergen to avoid.");
      hasError = true;
    } else if (
      formData.allergens[0] === "other" &&
      otherAllergenList.length === 0
    ) {
      setAllergenError("Please specify at least one allergen.");
      hasError = true;
    } else {
      setAllergenError("");
    }
    if (!dislikedIngredientList || dislikedIngredientList.length === 0) {
      setDislikedIngredientsError(
        "Please enter at least one disliked ingredient."
      );
      hasError = true;
    } else {
      setDislikedIngredientsError("");
    }
    if (
      !formData.preferredCuisines ||
      formData.preferredCuisines.length === 0
    ) {
      setPreferredCuisinesError(
        "Please select at least one preferred cuisine."
      );
      hasError = true;
    } else if (
      formData.preferredCuisines.includes("other") &&
      otherCuisineList.length === 0
    ) {
      setPreferredCuisinesError("Please specify at least one other cuisine.");
      hasError = true;
    } else {
      setPreferredCuisinesError("");
    }
    if (!formData.mealsPerDay) {
      setMealsPerDayError("Please select meals per day.");
      hasError = true;
    } else {
      setMealsPerDayError("");
    }
    if (!formData.mealPrepTimeLimit) {
      setMealPrepTimeLimitError("Please select a meal prep time limit.");
      hasError = true;
    } else {
      setMealPrepTimeLimitError("");
    }
    if (hasError) return;
    onFinish();
  };

  return (
    <div className="flex h-full w-full">
      <div className="w-full md:w-[65%] p-10 flex flex-col h-full overflow-auto">
        {/* Progress indicator */}
        <div className="mb-10 pt-2 flex justify-center bg-white">
          <ProgressIndicator currentStep={3} />
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
                {dietOptions.map((option) => {
                  const isSelected = formData.dietType === option.value;
                  return (
                    <div
                      key={option.value}
                      onClick={() => handleDietTypeChange(option.value)}
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          handleDietTypeChange(option.value);
                        }
                      }}
                      className={`relative px-2 py-4 rounded-lg border cursor-pointer transition-all duration-200 text-center text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400
                        ${
                          isSelected
                            ? "border-emerald-500 bg-emerald-50 scale-102 shadow-lg"
                            : "border-gray-300 hover:border-emerald-300 hover:bg-emerald-50"
                        }
                      `}
                      aria-pressed={isSelected}
                      style={{ minWidth: 0 }}
                    >
                      {/* Checkmark icon */}
                      {isSelected && (
                        <span className="absolute top-2 right-2 text-emerald-500">
                          <svg
                            width="20"
                            height="20"
                            fill="none"
                            viewBox="0 0 20 20"
                          >
                            <circle cx="10" cy="10" r="10" fill="#10B981" />
                            <path
                              d="M6 10.5l2.5 2.5 5-5"
                              stroke="#fff"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </span>
                      )}
                      <div className="text-xl mb-1">{option.icon}</div>
                      <div
                        className={`font-medium ${
                          isSelected ? "text-emerald-700" : "text-gray-700"
                        }`}
                      >
                        {option.label}
                      </div>
                    </div>
                  );
                })}
              </div>
              {formData.dietType === "other" && (
                <div className="mt-4">
                  <Label
                    htmlFor="dietTypeOther"
                    className="text-gray-900 text-sm"
                  >
                    Specify Your Diet
                  </Label>
                  <input
                    id="dietTypeOther"
                    type="text"
                    value={otherDiet}
                    onChange={handleOtherDietInput}
                    placeholder="e.g., Paleo"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-gray-900 bg-white shadow-sm transition-all duration-200 mt-1"
                  />
                </div>
              )}
              {dietError && (
                <p className="text-red-500 text-xs mt-1">{dietError}</p>
              )}
            </div>

            <div className="space-y-3">
              <Label className="text-gray-900 text-base">
                Allergens to Avoid
              </Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {allergenOptions.map((allergen) => {
                  const isSelected =
                    formData.allergens.length === 1 &&
                    formData.allergens[0] === allergen.value;
                  return (
                    <div
                      key={allergen.value}
                      onClick={() => handleAllergenChange(allergen.value)}
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          handleAllergenChange(allergen.value);
                        }
                      }}
                      className={`relative px-2 py-4 rounded-lg border cursor-pointer transition-all duration-200 text-center text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400
                        ${
                          isSelected
                            ? "border-emerald-500 bg-emerald-50 scale-102 shadow-lg"
                            : "border-gray-300 hover:border-emerald-300 hover:bg-emerald-50"
                        }
                      `}
                      aria-pressed={isSelected}
                      style={{ minWidth: 0 }}
                    >
                      {/* Checkmark icon */}
                      {isSelected && (
                        <span className="absolute top-2 right-2 text-emerald-500">
                          <svg
                            width="20"
                            height="20"
                            fill="none"
                            viewBox="0 0 20 20"
                          >
                            <circle cx="10" cy="10" r="10" fill="#10B981" />
                            <path
                              d="M6 10.5l2.5 2.5 5-5"
                              stroke="#fff"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </span>
                      )}
                      <div className="text-xl mb-1">{allergen.icon}</div>
                      <div
                        className={`font-medium ${
                          isSelected ? "text-emerald-700" : "text-gray-700"
                        }`}
                      >
                        {allergen.label}
                      </div>
                    </div>
                  );
                })}
              </div>
              {formData.allergens && formData.allergens[0] === "other" && (
                <div className="mt-4">
                  <Label
                    htmlFor="allergenOther"
                    className="text-gray-900 text-sm"
                  >
                    Specify Your Allergen(s)
                  </Label>
                  <div className="w-full flex flex-wrap items-center min-h-[48px] px-2 py-1 border border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-emerald-500 focus-within:border-transparent bg-white shadow-sm transition-all duration-200 mt-1">
                    {otherAllergenList.map((item) => (
                      <span
                        key={item}
                        className="inline-flex items-center px-3 py-1 mr-2 mb-1 rounded-full bg-emerald-100 text-emerald-800 text-sm font-medium"
                      >
                        {item}
                        <button
                          type="button"
                          className="ml-2 text-emerald-600 hover:text-red-500 focus:outline-none"
                          onClick={() => handleRemoveOtherAllergen(item)}
                          aria-label={`Remove ${item}`}
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </span>
                    ))}
                    <input
                      id="allergenOther"
                      type="text"
                      value={otherAllergenInput}
                      onChange={handleOtherAllergenInput}
                      onKeyDown={handleOtherAllergenKeyDown}
                      placeholder={
                        otherAllergenList.length === 0
                          ? "Type allergen and press Enter or comma"
                          : "Add more..."
                      }
                      className="flex-1 min-w-[120px] px-2 py-2 border-none outline-none bg-transparent text-gray-900 text-base"
                    />
                  </div>
                </div>
              )}
              {allergenError && (
                <p className="text-red-500 text-xs mt-1">{allergenError}</p>
              )}
            </div>

            <div className="space-y-3">
              <Label
                htmlFor="dislikedIngredients"
                className="text-gray-900 text-base"
              >
                Disliked Ingredients
              </Label>
              <div className="w-full flex flex-wrap items-center min-h-[48px] px-2 py-1 border border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-emerald-500 focus-within:border-transparent bg-white shadow-sm transition-all duration-200 relative">
                {dislikedIngredientList.map((item) => (
                  <span
                    key={item}
                    className="inline-flex items-center px-3 py-1 mr-2 mb-1 rounded-full bg-emerald-100 text-emerald-800 text-sm font-medium"
                  >
                    {item}
                    <button
                      type="button"
                      className="ml-2 text-emerald-600 hover:text-red-500 focus:outline-none"
                      onClick={() => handleRemoveDislikedIngredient(item)}
                      aria-label={`Remove ${item}`}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </span>
                ))}
                <input
                  id="dislikedIngredients"
                  type="text"
                  value={dislikedIngredientInput}
                  onChange={handleDislikedIngredientInput}
                  onKeyDown={handleDislikedIngredientKeyDown}
                  placeholder={
                    dislikedIngredientList.length === 0
                      ? "Type ingredient and press Enter or comma"
                      : "Add more..."
                  }
                  className="flex-1 min-w-[120px] px-2 py-2 border-none outline-none bg-transparent text-gray-900 text-base"
                />
              </div>
              {dislikedIngredientsError && (
                <p className="text-red-500 text-xs mt-1">
                  {dislikedIngredientsError}
                </p>
              )}
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
                  { value: "indian", label: "Indian", icon: "🍛" },
                  { value: "any", label: "Any", icon: "🌍" },
                  { value: "other", label: "Other", icon: "❓" },
                ].map((cuisine) => {
                  const isSelected = formData.preferredCuisines.includes(
                    cuisine.value
                  );
                  return (
                    <div
                      key={cuisine.value}
                      onClick={() =>
                        handleMultiSelect("preferredCuisines", cuisine.value)
                      }
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          handleMultiSelect("preferredCuisines", cuisine.value);
                        }
                      }}
                      className={`relative px-2 py-4 rounded-lg border cursor-pointer transition-all duration-200 text-center text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400
                        ${
                          isSelected
                            ? "border-emerald-500 bg-emerald-50 scale-102 shadow-lg"
                            : "border-gray-300 hover:border-emerald-300 hover:bg-emerald-50"
                        }
                      `}
                      aria-pressed={isSelected}
                      style={{ minWidth: 0 }}
                    >
                      {/* Checkmark icon */}
                      {isSelected && (
                        <span className="absolute top-2 right-2 text-emerald-500">
                          <svg
                            width="20"
                            height="20"
                            fill="none"
                            viewBox="0 0 20 20"
                          >
                            <circle cx="10" cy="10" r="10" fill="#10B981" />
                            <path
                              d="M6 10.5l2.5 2.5 5-5"
                              stroke="#fff"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </span>
                      )}
                      <div className="text-xl mb-1">{cuisine.icon}</div>
                      <div
                        className={`font-medium ${
                          isSelected ? "text-emerald-700" : "text-gray-700"
                        }`}
                      >
                        {cuisine.label}
                      </div>
                    </div>
                  );
                })}
              </div>
              {formData.preferredCuisines.includes("other") && (
                <div className="mt-4">
                  <Label
                    htmlFor="cuisineOther"
                    className="text-gray-900 text-sm"
                  >
                    Specify Other Cuisine(s)
                  </Label>
                  <div className="w-full flex flex-wrap items-center min-h-[48px] px-2 py-1 border border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-emerald-500 focus-within:border-transparent bg-white shadow-sm transition-all duration-200 mt-1">
                    {otherCuisineList.map((item) => (
                      <span
                        key={item}
                        className="inline-flex items-center px-3 py-1 mr-2 mb-1 rounded-full bg-emerald-100 text-emerald-800 text-sm font-medium"
                      >
                        {item}
                        <button
                          type="button"
                          className="ml-2 text-emerald-600 hover:text-red-500 focus:outline-none"
                          onClick={() => handleRemoveOtherCuisine(item)}
                          aria-label={`Remove ${item}`}
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </span>
                    ))}
                    <input
                      id="cuisineOther"
                      type="text"
                      value={otherCuisineInput}
                      onChange={handleOtherCuisineInput}
                      onKeyDown={handleOtherCuisineKeyDown}
                      placeholder={
                        otherCuisineList.length === 0
                          ? "Type cuisine and press Enter or comma"
                          : "Add more..."
                      }
                      className="flex-1 min-w-[120px] px-2 py-2 border-none outline-none bg-transparent text-gray-900 text-base"
                    />
                  </div>
                </div>
              )}
              {preferredCuisinesError && (
                <p className="text-red-500 text-xs mt-1">
                  {preferredCuisinesError}
                </p>
              )}
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
                {mealsPerDayError && (
                  <p className="text-red-500 text-xs mt-1">
                    {mealsPerDayError}
                  </p>
                )}
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
                {mealPrepTimeLimitError && (
                  <p className="text-red-500 text-xs mt-1">
                    {mealPrepTimeLimitError}
                  </p>
                )}
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
            onClick={handleFinish}
            className="px-6 py-2 bg-emerald-500 text-white rounded-md hover:bg-emerald-600 transition-colors"
          >
            Finish
          </button>
        </div>
      </div>
      {/* Right side - Green panel, hidden on small screens */}
      <div className="hidden md:flex w-[35%] bg-emerald-500 h-full items-center justify-center">
        <img
          src="/step-4.png"
          alt="Illustration of a grocery basket"
          className="max-w-[80%] max-h-[80%] object-contain"
        />
      </div>
    </div>
  );
}
