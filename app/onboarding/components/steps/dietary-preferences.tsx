"use client";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Check, X, ChevronDown } from "lucide-react";
import DropdownInput from "@/components/ui/dropdown-input";
import { useState, useEffect } from "react";
import ProgressIndicator from "@/app/onboarding/components/progress-indicator";
import CardSelect from "@/components/ui/card-select";
import MultiSelectCardGroup from "@/components/ui/multi-select-card-group";
import { Loader } from "@/components/ui/loader";

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
  const [imageVisible, setImageVisible] = useState(false);
  const [mealsPerDayOpen, setMealsPerDayOpen] = useState(false);
  const [mealPrepTimeOpen, setMealPrepTimeOpen] = useState(false);
  const [loading, setLoading] = useState(false);

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

  const cuisineOptions = [
    { value: "italian", label: "Italian", icon: "🍝" },
    { value: "mexican", label: "Mexican", icon: "🌮" },
    { value: "asian", label: "Asian", icon: "🍜" },
    { value: "indian", label: "Indian", icon: "🍛" },
    { value: "any", label: "Any", icon: "🌍" },
    { value: "other", label: "Other", icon: "❓" },
  ];

  const mealsPerDayOptions2 = [
    { value: "breakfast", label: "Breakfast", icon: "🥐" },
    { value: "lunch", label: "Lunch", icon: "🥗" },
    { value: "dinner", label: "Dinner", icon: "🍝" },
  ];

  const mealsPerDayOptions = [
    { value: "2", label: "2" },
    { value: "3", label: "3" },
    { value: "4", label: "4" },
    { value: "5", label: "5" },
  ];
  const mealPrepTimeOptions = [
    { value: "15", label: "<15 mins" },
    { value: "30", label: "<30 mins" },
    { value: "60", label: "<1 hour" },
    { value: "no-limit", label: "No Limit" },
  ];

  useEffect(() => {
    setCurrentStep(3); // step 4
    setSegmentProgress([100, 100, 100, 0]);
    setTimeout(() => {
      setSegmentProgress([100, 100, 100, 100]);
    }, 100);
    setTimeout(() => setImageVisible(true), 200); // trigger fade-in
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

  const handleOtherDietInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setOtherDiet(e.target.value);
    onChange("dietTypeOther", e.target.value);
    // Do NOT update dietType here!
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
        setDislikedIngredientList(updated); // <-- Fix: update local state
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
      formData.allergens.includes("other") &&
      otherAllergenList.length === 0
    ) {
      setAllergenError("Please specify at least one allergen.");
      hasError = true;
    } else {
      setAllergenError("");
    }
    setDislikedIngredientsError("");
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
    setLoading(true);
    Promise.resolve(onFinish()).finally(() => setLoading(false));
  };

  return (
    <div className="flex h-full w-full">
      <div className="w-full md:w-[65%] p-10 flex flex-col h-full overflow-auto">
        {/* Progress indicator */}
        <div className="mb-10 pt-2 flex justify-center bg-white">
          <ProgressIndicator currentStep={3} />
        </div>
        <div className="flex-1 flex flex-col justify-center min-h-min">
          <h2 className="text-2xl font-bold text-gray-900 mb-2 max-sm:text-xl">
            Your Food Preferences
          </h2>
          <p className="text-gray-600 mb-8">
            Help us create the perfect meal plan for you.
          </p>
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="dietType" className="input-label">
                Diet Type <span className="text-red-500">*</span>
              </Label>
              <CardSelect
                options={dietOptions}
                value={formData.dietType}
                onChange={handleDietTypeChange}
                columns={3}
                align="center"
                mobileColumns={2}
              />
              {formData.dietType === "other" && (
                <div className="pt-4 space-y-2">
                  <Label
                    htmlFor="dietTypeOther"
                    className="input-label"
                  >
                    Specify Your Diet
                  </Label>
                  <input
                    id="dietTypeOther"
                    type="text"
                    value={otherDiet}
                    onChange={handleOtherDietInput}
                    placeholder="e.g., Paleo"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-gray-900 bg-white shadow-sm transition-all duration-200 mt-1"
                  />
                </div>
              )}
              {dietError && (
                <p className="text-red-500 text-xs mt-1">{dietError}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label className="input-label">
                Allergens to Avoid <span className="text-red-500">*</span>
              </Label>
              <MultiSelectCardGroup
                options={allergenOptions}
                selected={formData.allergens}
                onChange={(vals) => onChange("allergens", vals)}
                columns={3}
                error={allergenError}
              />
              {formData.allergens && formData.allergens.includes("other") && (
                <div className="pt-4 space-y-2">
                  <Label
                    htmlFor="allergenOther"
                    className="input-label"
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
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="dislikedIngredients"
                className="input-label"
              >
                Disliked Ingredients (if any)
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
            </div>

            <div className="space-y-2">
              <Label className="text-gray-900 text-base">
                Preferred Cuisines <span className="text-red-500">*</span>
              </Label>
              <MultiSelectCardGroup
                options={cuisineOptions}
                selected={formData.preferredCuisines}
                onChange={(vals) => onChange("preferredCuisines", vals)}
                columns={3}
                error={preferredCuisinesError}
              />
              {formData.preferredCuisines.includes("other") && (
                <div className="pt-4 space-y-2">
                  <Label
                    htmlFor="cuisineOther"
                    className="input-label"
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
              
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="mealsPerDay"
                className="input-label"
              >
                Meals per Day (Choose at least 1) <span className="text-red-500">*</span>
              </Label>
              <MultiSelectCardGroup
                options={mealsPerDayOptions2}
                selected={formData.mealsPerDay}
                onChange={(vals) => onChange("mealsPerDay", vals)}
                columns={3}
                error={mealsPerDayError}
              />
              {mealsPerDayError && (
                <p className="text-red-500 text-xs mt-1">
                  {mealsPerDayError}
                </p>
              )}
            </div>

            <DropdownInput
              label={<>Meal Prep Time Limit <span className="text-red-500">*</span></>}
              options={mealPrepTimeOptions}
              value={formData.mealPrepTimeLimit}
              onChange={val => onChange("mealPrepTimeLimit", val)}
              placeholder="Select"
              error={mealPrepTimeLimitError}
              disabled={false}
            />
          </div>
        </div>
        <div className="flex justify-between mt-8 pt-4 bg-white">
          <Button
            onClick={onBack}
            variant="ghost"
            className="px-6 py-2 text-base"
            disabled={loading}
          >
            Back
          </Button>
          <Button
            onClick={handleFinish}
            size="lg"
            className="px-6 py-2 text-base"
            disabled={loading}
          >
            {loading ? <Loader className="mx-auto animate-spin" size={24} /> : "Finish"}
          </Button>
        </div>
      </div>
      {/* Right side - Green panel, hidden on small screens */}
      <div className="hidden md:flex w-[35%] bg-emerald-500 h-full items-center justify-center">
        <img
          src="/images/step-4.png"
          alt="Illustration of a grocery basket"
          className={`max-w-[80%] max-h-[80%] object-contain transition-opacity duration-700 fade-in-illustration${
            imageVisible ? " opacity-100" : " opacity-0"
          }`}
        />
      </div>
    </div>
  );
}