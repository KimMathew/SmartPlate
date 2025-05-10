"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Pencil, ChevronDown } from "lucide-react";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem
} from "@/components/ui/select";
import { BadgeInput } from "@/components/ui/badge-input";
import { EditButton } from "@/components/ui/edit-button";
import { SaveCancelActions } from "@/components/ui/save-cancel-actions";

interface DietaryPreferencesForm {
  dietType: string;
  dietTypeOther: string;
  allergens: string[];
  allergenOther: string[];
  dislikedIngredients: string[];
  preferredCuisines: string[];
  cuisineOther: string[];
  mealsPerDay: string[];
  mealPrepTimeLimit: string;
}

interface DietaryPreferencesTabProps {
  form: DietaryPreferencesForm;
  setForm: (form: DietaryPreferencesForm) => void;
  onSave: (form: DietaryPreferencesForm) => Promise<void>;
  editMode: boolean;
  handleEdit: () => void;
  handleCancel: () => void;
}

export default function DietaryPreferencesTab({ form, setForm, onSave, editMode, handleEdit, handleCancel }: DietaryPreferencesTabProps) {
  const [formBackup, setFormBackup] = useState<DietaryPreferencesForm>(form);
  const [localForm, setLocalForm] = useState<DietaryPreferencesForm>(form);
  const [dietTypeDropdownOpen, setDietTypeDropdownOpen] = useState(false);
  const [mealPrepTimeDropdownOpen, setMealPrepTimeDropdownOpen] = useState(false);
  const [allergenInput, setAllergenInput] = useState("");

  // Meals per day options
  const mealOptions = [
    { value: "breakfast", label: "Breakfast" },
    { value: "lunch", label: "Lunch" },
    { value: "dinner", label: "Dinner" },
  ];

  useEffect(() => {
    setFormBackup(form);
    setLocalForm({
      ...form,
      mealsPerDay: Array.isArray(form.mealsPerDay)
        ? form.mealsPerDay
        : typeof form.mealsPerDay === "string" && form.mealsPerDay
        ? [form.mealsPerDay]
        : [],
    });
  }, [form]);

  const handleChange = (field: keyof DietaryPreferencesForm, value: any) => {
    // For arrays, store all items in lowercase
    if (["allergens", "dislikedIngredients", "preferredCuisines"].includes(field)) {
      if (Array.isArray(value)) {
        value = value.map((v) => typeof v === "string" ? v.toLowerCase() : v);
      }
    }
    setLocalForm({ ...localForm, [field]: value });
  };

  const handleEditLocal = () => {
    setFormBackup(form);
    setLocalForm(form);
    handleEdit();
  };

  const handleCancelLocal = () => {
    setLocalForm(formBackup);
    handleCancel();
  };

  const handleSave = async () => {
    await onSave(localForm);
    setForm(localForm); // update parent state
    setFormBackup(localForm); // update backup to latest
  };

  const handleRemoveAllergen = (item: string) => {
    setLocalForm({
      ...localForm,
      allergens: localForm.allergens.filter((allergen) => allergen !== item),
    });
  };

  const handleAllergenInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAllergenInput(e.target.value);
  };

  const handleAllergenKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const newAllergen = allergenInput.trim().toLowerCase();
      if (newAllergen && !localForm.allergens.includes(newAllergen)) {
        setLocalForm({
          ...localForm,
          allergens: [...localForm.allergens, newAllergen],
        });
      }
      setAllergenInput("");
    }
  };

  const handleMealSelect = (meal: string) => {
    let updatedMeals = Array.isArray(localForm.mealsPerDay) ? [...localForm.mealsPerDay] : [];
    if (updatedMeals.includes(meal)) {
      // Prevent deselecting last meal
      if (updatedMeals.length === 1) return;
      updatedMeals = updatedMeals.filter((m) => m !== meal);
    } else {
      updatedMeals.push(meal);
    }
    setLocalForm({ ...localForm, mealsPerDay: updatedMeals });
  };

  // Dropdown options
  const dietTypeOptions = [
    { value: "vegan", label: "Vegan" },
    { value: "keto", label: "Keto" },
    { value: "mediterranean", label: "Mediterranean" },
    { value: "gluten-free", label: "Gluten-Free" },
    { value: "none", label: "No Restrictions" },
    { value: "other", label: "Other" },
  ];
  const mealPrepTimeOptions = [
    { value: "15", label: "<15 mins" },
    { value: "30", label: "<30 mins" },
    { value: "60", label: "<1 hour" },
    { value: "no-limit", label: "No Limit" },
  ];

  return (
    <form className="space-y-8" onSubmit={e => { e.preventDefault(); handleSave(); }} autoComplete="off">
      <div className="flex items-start justify-between w-full mb-6">
        <div>
          <div className="text-2xl font-bold text-gray-900 mb-1 max-sm:text-xl">Dietary Preferences</div>
          <div className="text-gray-500 text-base max-sm:text-sm">Customize your dietary preferences here.</div>
        </div>
        {!editMode && <EditButton onClick={handleEditLocal} />}
      </div>
      <div className="space-y-6">
        {/* Diet Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Diet Type</label>
          {editMode ? (
            <div className="relative">
              <button
                type="button"
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-sm text-gray-900 text-left flex justify-between items-center focus:outline-none focus:ring-1 focus:ring-emerald-500"
                onClick={() => setDietTypeDropdownOpen((v) => !v)}
                style={{ fontWeight: 400 }}
              >
                <span className={localForm.dietType ? "text-gray-900" : "text-gray-400"}>
                  {(() => {
                    const found = dietTypeOptions.find(opt => opt.value === localForm.dietType);
                    if (found) return found.label;
                    if (localForm.dietType && localForm.dietType !== "other") return localForm.dietType;
                    return "Select diet type";
                  })()}
                </span>
                <ChevronDown className="h-4 w-4 text-gray-500" />
              </button>
              {dietTypeDropdownOpen && (
                <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md border border-gray-200 py-1">
                  {dietTypeOptions.map(option => (
                    <div
                      key={option.value}
                      className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-gray-700 text-sm"
                      onClick={() => {
                        handleChange("dietType", option.value);
                        setDietTypeDropdownOpen(false);
                      }}
                    >
                      {option.label}
                    </div>
                  ))}
                </div>
              )}
              {localForm.dietType === "other" && (
                <div className="mt-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Specify Your Diet</label>
                  <input
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-500 text-sm text-gray-900 bg-white"
                    placeholder="e.g., Paleo"
                    value={localForm.dietTypeOther}
                    onChange={e => handleChange("dietTypeOther", e.target.value)}
                    disabled={!editMode}
                  />
                </div>
              )}
            </div>
          ) : (
            <input
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-500 text-sm text-gray-900 bg-white"
              value={(() => {
                const found = dietTypeOptions.find(opt => opt.value === localForm.dietType);
                if (found && localForm.dietType !== "other") return found.label;
                if (localForm.dietType === "other" && localForm.dietTypeOther) return localForm.dietTypeOther;
                if (localForm.dietType && localForm.dietType !== "other") return localForm.dietType;
                return "";
              })()}
              disabled
            />
          )}
        </div>
        {/* Allergens */}
        <BadgeInput
          label="Allergens to Avoid"
          items={localForm.allergens}
          onChange={items => handleChange("allergens", items)}
          editMode={editMode}
          placeholder="Type allergen and press Enter or comma"
        />
        {/* Disliked Ingredients */}
        <BadgeInput
          label="Disliked Ingredients"
          items={localForm.dislikedIngredients}
          onChange={items => handleChange("dislikedIngredients", items)}
          editMode={editMode}
          placeholder="Type ingredient and press Enter or comma"
        />
        {/* Preferred Cuisines */}
        <BadgeInput
          label="Preferred Cuisines"
          items={localForm.preferredCuisines}
          onChange={items => handleChange("preferredCuisines", items)}
          editMode={editMode}
          placeholder="Type cuisine and press Enter or comma"
        />
        {/* Meals per Day & Meal Prep Time Limit side by side */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Meals per Day */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Meals per Day</label>
            {editMode ? (
              <div className="flex gap-2">
                {mealOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    className={`px-4 py-2 rounded-md border text-sm font-medium transition-colors duration-150 ${
                      localForm.mealsPerDay.includes(option.value)
                        ? "bg-emerald-500 text-white border-emerald-500"
                        : "bg-white text-gray-900 border-gray-300 hover:bg-gray-100"
                    }`}
                    onClick={() => handleMealSelect(option.value)}
                    aria-pressed={localForm.mealsPerDay.includes(option.value)}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            ) : (
              <div className="flex gap-2">
                {localForm.mealsPerDay && localForm.mealsPerDay.length > 0 ? (
                  localForm.mealsPerDay.map((meal) => {
                    const label = mealOptions.find((opt) => opt.value === meal)?.label || meal;
                    return (
                      <span
                        key={meal}
                        className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold border border-emerald-200"
                      >
                        {label}
                      </span>
                    );
                  })
                ) : (
                  <span className="text-gray-400 text-sm">No meals selected</span>
                )}
              </div>
            )}
          </div>
          {/* Meal Prep Time Limit */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Meal Prep Time Limit</label>
            {editMode ? (
              <div className="relative">
                <button
                  type="button"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-sm text-gray-900 text-left flex justify-between items-center focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  onClick={() => setMealPrepTimeDropdownOpen((v) => !v)}
                  style={{ fontWeight: 400 }}
                >
                  <span className={localForm.mealPrepTimeLimit ? "text-gray-900" : "text-gray-400"}>
                    {mealPrepTimeOptions.find(opt => opt.value === localForm.mealPrepTimeLimit)?.label || "Select time limit"}
                  </span>
                  <ChevronDown className="h-4 w-4 text-gray-500" />
                </button>
                {mealPrepTimeDropdownOpen && (
                  <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md border border-gray-200 py-1">
                    {mealPrepTimeOptions.map(option => (
                      <div
                        key={option.value}
                        className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-gray-700 text-sm"
                        onClick={() => {
                          handleChange("mealPrepTimeLimit", option.value);
                          setMealPrepTimeDropdownOpen(false);
                        }}
                      >
                        {option.label}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <input
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-500 text-sm text-gray-900 bg-white"
                value={mealPrepTimeOptions.find(opt => opt.value === localForm.mealPrepTimeLimit)?.label || ""}
                disabled
              />
            )}
          </div>
        </div>
      </div>
      {editMode && (
        <SaveCancelActions onSave={e => { e.preventDefault(); handleSave(); }} onCancel={handleCancelLocal} />
      )}
    </form>
  );
}
