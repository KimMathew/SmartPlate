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
import { useState } from "react";
import { User, Apple, Target, Settings, Pencil } from "lucide-react";
import PersonalInfoTab from "./profile-tabs/personal_info_tab";
import DietaryPreferencesTab from "./profile-tabs/dietary_tab";
import HealthGoalsTab from "./profile-tabs/health_goals_tab";

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
  const [activeTab, setActiveTab] = useState(0); // Default to Personal Info
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({
    name: "Jane Smith",
    dob: "1990-01-01",
    gender: "Female",
    height: "165",
    weight: "65",
  });
  const [formBackup, setFormBackup] = useState(form);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleEdit() {
    setFormBackup(form);
    setEditMode(true);
  }

  function handleCancel() {
    setForm(formBackup);
    setEditMode(false);
  }

  function handleSave(updatedForm: typeof form) {
    setForm(updatedForm);
    setEditMode(false);
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
          <CardContent className="flex items-center gap-8 pt-8 pb-8 pl-8 pr-8">
            <Avatar className="h-24 w-24">
              <AvatarImage src="/placeholder-user.jpg" alt={form.name} />
              <AvatarFallback className="bg-gray-200 text-gray-700 text-3xl">
                {form.name.split(" ").map((n) => n[0]).join("")}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex flex-col justify-center">
                <div className="text-2xl font-bold text-gray-900">{form.name}</div>
                <div className="text-gray-500 text-base mt-1">jane.smith@example.com</div>
              </div>
            </div>
            {/* Removed Edit Profile Button */}
          </CardContent>
        </Card>
        <div className="w-full flex bg-[#f3f6fa] rounded-lg p-1 shadow-sm">
          {TABS.map((tab, i) => (
            <button
              key={tab.label}
              className={`flex-1 flex items-center justify-center px-5 py-1.5 text-sm font-semibold rounded-md transition-colors duration-150 focus:outline-none ${
                activeTab === i
                  ? "bg-white text-gray-900 shadow font-bold"
                  : "bg-transparent text-gray-500"
              }`}
              onClick={() => setActiveTab(i)}
              type="button"
              style={{ minWidth: 0 }}
            >
              {tab.icon}
              {tab.label}
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
              />
            )}
            {activeTab === 1 && (
              <DietaryPreferencesTab />
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
