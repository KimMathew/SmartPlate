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

  return (
    <form className="space-y-8" onSubmit={e => { e.preventDefault(); handleSave(); }} autoComplete="off">
      <div className="flex items-start justify-between w-full mb-6">
        <div>
          <div className="text-2xl font-bold text-gray-900 mb-1">Dietary Preferences</div>
          <div className="text-gray-500 text-base">Update your dietary preferences here.</div>
        </div>
        {!editMode && (
          <Button
            type="button"
            variant="default"
            className="ml-4 mt-1"
            onClick={handleEdit}
          >
            <Pencil className="w-4 h-4 mr-2" />
            Edit
          </Button>
        )}
      </div>
      <div className="space-y-6">
        {/* Diet Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Diet Type</label>
          {editMode ? (
            <>
              <Select value={form.dietType} onValueChange={v => handleChange("dietType", v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="vegan">Vegan</SelectItem>
                  <SelectItem value="keto">Keto</SelectItem>
                  <SelectItem value="mediterranean">Mediterranean</SelectItem>
                  <SelectItem value="gluten-free">Gluten-Free</SelectItem>
                  <SelectItem value="none">No Restrictions</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
              {form.dietType === "other" && (
                <input
                  className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-500 text-sm text-gray-900 bg-white"
                  placeholder="Specify your diet"
                  value={form.dietTypeOther}
                  onChange={e => handleChange("dietTypeOther", e.target.value)}
                  disabled={!editMode}
                />
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
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Allergens to Avoid</label>
          {editMode ? (
            <input
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-500 text-sm text-gray-900 bg-white"
              placeholder="e.g., Gluten, Dairy, Nuts"
              value={form.allergens.join(", ")}
              onChange={e => handleChange("allergens", e.target.value.split(",").map(s => s.trim()).filter(Boolean))}
            />
          ) : (
            <input
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-500 text-sm text-gray-900 bg-white"
              value={form.allergens.join(", ")}
              disabled
            />
          )}
        </div>
        {/* Disliked Ingredients */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Disliked Ingredients</label>
          {editMode ? (
            <input
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-500 text-sm text-gray-900 bg-white"
              placeholder="e.g., Broccoli, Mushrooms"
              value={form.dislikedIngredients.join(", ")}
              onChange={e => handleChange("dislikedIngredients", e.target.value.split(",").map(s => s.trim()).filter(Boolean))}
            />
          ) : (
            <input
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-500 text-sm text-gray-900 bg-white"
              value={form.dislikedIngredients.join(", ")}
              disabled
            />
          )}
        </div>
        {/* Preferred Cuisines */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Cuisines</label>
          {editMode ? (
            <input
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-500 text-sm text-gray-900 bg-white"
              placeholder="e.g., Italian, Asian, Other"
              value={form.preferredCuisines.join(", ")}
              onChange={e => handleChange("preferredCuisines", e.target.value.split(",").map(s => s.trim()).filter(Boolean))}
            />
          ) : (
            <input
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-500 text-sm text-gray-900 bg-white"
              value={form.preferredCuisines.join(", ")}
              disabled
            />
          )}
        </div>
        {/* Meals per Day */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Meals per Day</label>
          {editMode ? (
            <Select value={form.mealsPerDay} onValueChange={v => handleChange("mealsPerDay", v)}>
              <SelectTrigger>
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2">2</SelectItem>
                <SelectItem value="3">3</SelectItem>
                <SelectItem value="4">4</SelectItem>
                <SelectItem value="5">5</SelectItem>
              </SelectContent>
            </Select>
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
            <Select value={form.mealPrepTimeLimit} onValueChange={v => handleChange("mealPrepTimeLimit", v)}>
              <SelectTrigger>
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="15">{"<15 mins"}</SelectItem>
                <SelectItem value="30">{"<30 mins"}</SelectItem>
                <SelectItem value="60">{"<1 hour"}</SelectItem>
                <SelectItem value="no-limit">No Limit</SelectItem>
              </SelectContent>
            </Select>
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
      {editMode && (
        <div className="flex gap-4 pt-2">
          <Button type="submit" className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold px-8 py-3 rounded-md">Save Changes</Button>
          <Button type="button" variant="outline" onClick={handleCancel}>Cancel</Button>
        </div>
      )}
    </form>
  );
}
