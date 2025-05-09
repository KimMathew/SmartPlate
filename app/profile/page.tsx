"use client";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { useState, useEffect } from "react";
import { User, Apple, Target, Settings, Pencil } from "lucide-react";
import PersonalInfoTab from "./profile-tabs/personal_info_tab";
import DietaryPreferencesTab from "./profile-tabs/dietary_tab";
import HealthGoalsTab from "./profile-tabs/health_goals_tab";
import { useSession } from "@/lib/session-context";
import { createClient } from "@/lib/supabase";

const TABS = [
  { label: "Personal Info", icon: <User className="w-4 h-4 mr-2" /> },
  { label: "Dietary Preferences", icon: <Apple className="w-4 h-4 mr-2 text-emerald-500" /> },
  { label: "Health Goals", icon: <Target className="w-4 h-4 mr-2 text-blue-500" /> },
];

const DIET_TYPES = [
  { value: "balanced", label: "Balanced" },
  { value: "vegetarian", label: "Vegetarian" },
  { value: "vegan", label: "Vegan" },
  { value: "low-carb", label: "Low Carb" },
  { value: "keto", label: "Keto" },
  { value: "pescatarian", label: "Pescatarian" },
  { value: "other", label: "Other" },
];

export default function ProfilePage() {
  const { user, isLoading } = useSession();
  const [profile, setProfile] = useState<{ fullName: string; email: string } | null>(null);
  const [activeTab, setActiveTab] = useState(0); // Default to Personal Info
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({
    firstName: "Jane",
    lastName: "Smith",
    dob: "1990-01-01",
    gender: "Female" as string | null,
    height: "165",
    weight: "65",
  });
  const [formBackup, setFormBackup] = useState(form);

  // Add this initial state for dietary preferences
  const [dietaryForm, setDietaryForm] = useState({
    dietType: "",
    dietTypeOther: "",
    allergens: [] as string[],
    allergenOther: [] as string[],
    dislikedIngredients: [] as string[],
    preferredCuisines: [] as string[],
    cuisineOther: [] as string[],
    mealsPerDay: "",
    mealPrepTimeLimit: "",
  });

  useEffect(() => {
    const supabase = createClient();
    const fetchProfile = async () => {
      if (user) {
        const { data, error } = await supabase
          .from("Users")
          .select(`first_name, last_name, email, "birth-date", gender, height, weight, diet_type, allergens, disliked_ingredients, preferred_cuisines, meals_per_day, prep_time_limit`)
          .eq("id", user.id)
          .single();
        if (data) {
          setProfile({
            fullName: `${data.first_name ?? ""} ${data.last_name ?? ""}`.trim(),
            email: data.email ?? user.email ?? "",
          });
          setForm({
            firstName: data.first_name ?? "",
            lastName: data.last_name ?? "",
            dob: data["birth-date"] ?? "",
            gender: data.gender ?? "",
            height: data.height !== undefined && data.height !== null ? String(data.height) : "",
            weight: data.weight !== undefined && data.weight !== null ? String(data.weight) : "",
          });
          setDietaryForm({
            dietType: data.diet_type ?? "",
            dietTypeOther: "", // You may want to add this field to your DB if needed
            allergens: Array.isArray(data.allergens) ? data.allergens : (data.allergens ? data.allergens.split(",") : []),
            allergenOther: [], // You may want to add this field to your DB if needed
            dislikedIngredients: Array.isArray(data.disliked_ingredients) ? data.disliked_ingredients : (data.disliked_ingredients ? data.disliked_ingredients.split(",") : []),
            preferredCuisines: Array.isArray(data.preferred_cuisines) ? data.preferred_cuisines : (data.preferred_cuisines ? data.preferred_cuisines.split(",") : []),
            cuisineOther: [], // You may want to add this field to your DB if needed
            mealsPerDay: data.meals_per_day ?? "",
            mealPrepTimeLimit: data.prep_time_limit ?? "",
          });
        } else {
          setProfile({ fullName: "", email: user.email ?? "" });
          setForm({
            firstName: "",
            lastName: "",
            dob: "",
            gender: "",
            height: "",
            weight: "",
          });
          setDietaryForm({
            dietType: "",
            dietTypeOther: "",
            allergens: [],
            allergenOther: [],
            dislikedIngredients: [],
            preferredCuisines: [],
            cuisineOther: [],
            mealsPerDay: "",
            mealPrepTimeLimit: "",
          });
        }
      } else {
        setProfile(null);
        setForm({
          firstName: "",
          lastName: "",
          dob: "",
          gender: "",
          height: "",
          weight: "",
        });
        setDietaryForm({
          dietType: "",
          dietTypeOther: "",
          allergens: [],
          allergenOther: [],
          dislikedIngredients: [],
          preferredCuisines: [],
          cuisineOther: [],
          mealsPerDay: "",
          mealPrepTimeLimit: "",
        });
      }
    };
    fetchProfile();
  }, [user]);

  async function updateProfile(updatedForm: typeof form) {
    if (!user) return;
    const supabase = createClient();
    const { error } = await supabase
      .from("Users")
      .update({
        first_name: updatedForm.firstName,
        last_name: updatedForm.lastName,
        "birth-date": updatedForm.dob,
        gender: updatedForm.gender === "" ? null : updatedForm.gender,
        height: updatedForm.height ? Number(updatedForm.height) : null,
        weight: updatedForm.weight ? Number(updatedForm.weight) : null,
      })
      .eq("id", user.id);
    if (!error) {
      setForm(updatedForm);
      setEditMode(false);
      setProfile({
        fullName: `${updatedForm.firstName} ${updatedForm.lastName}`.trim(),
        email: profile?.email || user.email || "",
      });
    } else {
      // Optionally show error to user
      alert("Failed to update profile. Please try again.");
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleEdit() {
    setFormBackup(form); // Save current form as backup
    setEditMode(true);
  }

  function handleCancel() {
    setForm(formBackup); // Restore backup
    setEditMode(false);
  }

  function handleSave(updatedForm: typeof form) {
    updateProfile(updatedForm);
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          My Profile
        </h1>
      </div>
      <div className="grid grid-cols-1 gap-6 w-full">
        <Card>
          <CardContent className="flex items-center gap-8 pt-8 pb-8 pl-8 pr-8 flex-row
            max-sm:gap-6 max-sm:pt-6 max-sm:pb-6 max-sm:pl-6 max-sm:pr-6 max-sm:flex-row">
            <Avatar className="h-24 w-24 max-sm:h-16 max-sm:w-16">
              <AvatarImage src="/placeholder-user.jpg" alt={profile?.fullName || `${form.firstName} ${form.lastName}`} />
              <AvatarFallback className="bg-gray-200 text-gray-700 text-3xl max-sm:text-xl">
                {(profile?.fullName || `${form.firstName} ${form.lastName}`).split(" ").map((n: string) => n[0]).join("")}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex flex-col justify-center">
                <div className="text-2xl font-bold text-gray-900 max-sm:text-xl">{profile?.fullName || `${form.firstName} ${form.lastName}`}</div>
                <div className="text-gray-500 text-base mt-1 max-sm:text-sm">{profile?.email || ""}</div>
              </div>
            </div>
            {/* Removed Edit Profile Button */}
          </CardContent>
        </Card>
        <div className="w-full flex bg-[#f3f6fa] rounded-lg p-1 shadow-sm overflow-x-auto scrollbar-hide max-sm:flex-col">
          {TABS.map((tab, i) => (
            <button
              key={tab.label}
              className={`flex-1 flex flex-row items-center justify-center px-3 py-2 text-sm font-semibold rounded-md transition-colors duration-150 focus:outline-none min-w-[100px] max-w-full whitespace-normal break-words text-center ${
                activeTab === i
                  ? "bg-white text-gray-900 shadow font-bold"
                  : "bg-transparent text-gray-500"
              }`}
              onClick={() => setActiveTab(i)}
              type="button"
              style={{ minWidth: 0 }}
            >
              <span className="block leading-tight max-sm:hidden">{tab.icon}</span>
              <span className="block leading-tight ml-2">{tab.label}</span>
            </button>
          ))}
        </div>
        <Card>
          <CardContent className="p-8">
            {activeTab === 0 && (
              <PersonalInfoTab
                form={form}
                editMode={editMode}
                handleChange={handleChange}
                handleSave={handleSave}
                handleCancel={handleCancel}
                handleEdit={handleEdit}
              />
            )}
            {activeTab === 1 && (
              <DietaryPreferencesTab form={dietaryForm} setForm={setDietaryForm} />
            )}
            {activeTab === 2 && (
              // Render HealthGoalsTab for the Health Goals tab
              <HealthGoalsTab />
            )}
            {/* ...existing code for other tabs... */}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
