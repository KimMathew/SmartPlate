"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem
} from "@/components/ui/select";
import { BadgeInput } from "@/components/ui/badge-input";
import { EditButton } from "@/components/edit-button";

interface DietaryPreferencesForm {
  dietType: string;
  dietTypeOther: string;
  allergens: string[];
  allergenOther: string[];
  dislikedIngredients: string[];
  preferredCuisines: string[];
  cuisineOther: string[];
  mealsPerDay: string;
  mealPrepTimeLimit: string;
}

const defaultForm: DietaryPreferencesForm = {
  dietType: "keto",
  dietTypeOther: "",
  allergens: ["Gluten", "Nuts"],
  allergenOther: [],
  dislikedIngredients: ["Broccoli", "Mushrooms"],
  preferredCuisines: ["Italian", "Asian"],
  cuisineOther: [],
  mealsPerDay: "3",
  mealPrepTimeLimit: "30",
};

export default function DietaryPreferencesTab() {
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState<DietaryPreferencesForm>(defaultForm);
  const [formBackup, setFormBackup] = useState<DietaryPreferencesForm>(defaultForm);
  const [dietTypeDropdownOpen, setDietTypeDropdownOpen] = useState(false);
  const [mealsPerDayDropdownOpen, setMealsPerDayDropdownOpen] = useState(false);
  const [mealPrepTimeDropdownOpen, setMealPrepTimeDropdownOpen] = useState(false);
  const [allergenInput, setAllergenInput] = useState("");

  useEffect(() => {
    // TODO: Fetch user's dietary preferences from backend and setForm
  }, []);

  const handleChange = (field: keyof DietaryPreferencesForm, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleEdit = () => {
    setFormBackup(form);
    setEditMode(true);
  };

  const handleCancel = () => {
    setForm(formBackup);
    setEditMode(false);
  };

  const handleSave = () => {
    // TODO: Save form to backend
    setEditMode(false);
  };

  const handleRemoveAllergen = (item: string) => {
    setForm((prev) => ({
      ...prev,
      allergens: prev.allergens.filter((allergen) => allergen !== item),
    }));
  };

  const handleAllergenInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAllergenInput(e.target.value);
  };

  const handleAllergenKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const newAllergen = allergenInput.trim();
      if (newAllergen && !form.allergens.includes(newAllergen)) {
        setForm((prev) => ({
          ...prev,
          allergens: [...prev.allergens, newAllergen],
        }));
      }
      setAllergenInput("");
    }
  };

  return (
    <form className="space-y-8" onSubmit={e => { e.preventDefault(); handleSave(); }} autoComplete="off">
      <div className="flex items-start justify-between w-full mb-6">
        <div>
          <div className="text-2xl font-bold text-gray-900 mb-1 max-sm:text-xl">Dietary Preferences</div>
          <div className="text-gray-500 text-base max-sm:text-sm">Customize your dietary preferences here.</div>
        </div>
        {!editMode && (
          <EditButton onClick={handleEdit} />
        )}
      </div>
      <div className="space-y-6">
        {/* Diet Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Diet Type</label>
          {editMode ? (
            <>
              <div className="relative">
                <button
                  type="button"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-sm text-gray-900 text-left flex justify-between items-center focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  onClick={() => setDietTypeDropdownOpen((v) => !v)}
                  style={{ fontWeight: 400 }}
                >
                  <span className={form.dietType ? "text-gray-900" : "text-gray-400"}>
                    {form.dietType === "vegan"
                      ? "Vegan"
                      : form.dietType === "keto"
                      ? "Keto"
                      : form.dietType === "mediterranean"
                      ? "Mediterranean"
                      : form.dietType === "gluten-free"
                      ? "Gluten-Free"
                      : form.dietType === "none"
                      ? "No Restrictions"
                      : form.dietType === "other"
                      ? form.dietTypeOther || "Other"
                      : "Select diet type"}
                  </span>
                  <svg className="h-4 w-4 text-gray-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                </button>
                {dietTypeDropdownOpen && (
                  <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md border border-gray-200 py-1">
                    {[{ value: "vegan", label: "Vegan" }, { value: "keto", label: "Keto" }, { value: "mediterranean", label: "Mediterranean" }, { value: "gluten-free", label: "Gluten-Free" }, { value: "none", label: "No Restrictions" }, { value: "other", label: "Other" }].map(option => (
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
              </div>
              {form.dietType === "other" && (
                <div className="mt-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Specify Your Diet</label>
                  <input
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-500 text-sm text-gray-900 bg-white"
                    placeholder="e.g., Paleo"
                    value={form.dietTypeOther}
                    onChange={e => handleChange("dietTypeOther", e.target.value)}
                    disabled={!editMode}
                  />
                </div>
              )}
            </>
          ) : (
            <input
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-500 text-sm text-gray-900 bg-white"
              value={
                form.dietType === "vegan" ? "Vegan" :
                form.dietType === "keto" ? "Keto" :
                form.dietType === "mediterranean" ? "Mediterranean" :
                form.dietType === "gluten-free" ? "Gluten-Free" :
                form.dietType === "none" ? "No Restrictions" :
                form.dietType === "other" ? (form.dietTypeOther || "Other") :
                ""
              }
              disabled
            />
          )}
        </div>
        {/* Allergens */}
        <BadgeInput
          label="Allergens to Avoid"
          items={form.allergens}
          onChange={items => handleChange("allergens", items)}
          editMode={editMode}
          placeholder="Type allergen and press Enter or comma"
        />
        {/* Disliked Ingredients */}
        <BadgeInput
          label="Disliked Ingredients"
          items={form.dislikedIngredients}
          onChange={items => handleChange("dislikedIngredients", items)}
          editMode={editMode}
          placeholder="Type ingredient and press Enter or comma"
        />
        {/* Preferred Cuisines */}
        <BadgeInput
          label="Preferred Cuisines"
          items={form.preferredCuisines}
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
              <>
                <div className="relative">
                  <button
                    type="button"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-sm text-gray-900 text-left flex justify-between items-center focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    onClick={() => setMealsPerDayDropdownOpen((v) => !v)}
                    style={{ fontWeight: 400 }}
                  >
                    <span className={form.mealsPerDay ? "text-gray-900" : "text-gray-400"}>
                      {form.mealsPerDay || "Select number of meals"}
                    </span>
                    <svg className="h-4 w-4 text-gray-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                  </button>
                  {mealsPerDayDropdownOpen && (
                    <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md border border-gray-200 py-1">
                      {["2", "3", "4", "5"].map(option => (
                        <div
                          key={option}
                          className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-gray-700 text-sm"
                          onClick={() => {
                            handleChange("mealsPerDay", option);
                            setMealsPerDayDropdownOpen(false);
                          }}
                        >
                          {option}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            ) : (
              <input
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-500 text-sm text-gray-900 bg-white"
                value={form.mealsPerDay}
                disabled
              />
            )}
          </div>
          {/* Meal Prep Time Limit */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Meal Prep Time Limit</label>
            {editMode ? (
              <>
                <div className="relative">
                  <button
                    type="button"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-sm text-gray-900 text-left flex justify-between items-center focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    onClick={() => setMealPrepTimeDropdownOpen((v) => !v)}
                    style={{ fontWeight: 400 }}
                  >
                    <span className={form.mealPrepTimeLimit ? "text-gray-900" : "text-gray-400"}>
                      {form.mealPrepTimeLimit === "15"
                        ? "<15 mins"
                        : form.mealPrepTimeLimit === "30"
                        ? "<30 mins"
                        : form.mealPrepTimeLimit === "60"
                        ? "<1 hour"
                        : form.mealPrepTimeLimit === "no-limit"
                        ? "No Limit"
                        : "Select time limit"}
                    </span>
                    <svg className="h-4 w-4 text-gray-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                  </button>
                  {mealPrepTimeDropdownOpen && (
                    <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md border border-gray-200 py-1">
                      {[
                        { value: "15", label: "<15 mins" },
                        { value: "30", label: "<30 mins" },
                        { value: "60", label: "<1 hour" },
                        { value: "no-limit", label: "No Limit" },
                      ].map(option => (
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
              </>
            ) : (
              <input
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-500 text-sm text-gray-900 bg-white"
                value={
                  form.mealPrepTimeLimit === "15" ? "<15 mins" :
                  form.mealPrepTimeLimit === "30" ? "<30 mins" :
                  form.mealPrepTimeLimit === "60" ? "<1 hour" :
                  form.mealPrepTimeLimit === "no-limit" ? "No Limit" :
                  ""
                }
                disabled
              />
            )}
          </div>
        </div>
      </div>
      {editMode && (
        <div className="flex gap-4 pt-2">
          <Button type="submit" className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold px-8 py-3 rounded-md">Save Changes</Button>
          <Button type="button" variant="outline" onClick={handleCancel}>Cancel</Button>
        </div>
      )}
    </form>
  );
}
