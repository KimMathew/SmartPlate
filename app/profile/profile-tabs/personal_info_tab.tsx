"use client";

import { useState, useEffect } from "react";
import { Pencil, ChevronDown } from "lucide-react";
import { EditButton } from "@/components/ui/edit-button";
import { SaveCancelActions } from "@/components/ui/save-cancel-actions";

interface PersonalInfoTabProps {
  form: {
    firstName: string;
    lastName: string;
    age: string;
    gender: string | null;
    height: string;
    weight: string;
    activityLevel: string;
  };
  editMode: boolean;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSave: (form: { firstName: string; lastName: string; age: string; gender: string | null; height: string; weight: string; activityLevel: string; }) => void;
  handleCancel: () => void;
  handleEdit: () => void;
}

export default function PersonalInfoTab({ form, editMode, handleChange, handleSave, handleCancel, handleEdit }: PersonalInfoTabProps) {
  const [genderDropdownOpen, setGenderDropdownOpen] = useState(false);
  const [activityLevelDropdownOpen, setActivityLevelDropdownOpen] = useState(false);
  const [firstNameError, setFirstNameError] = useState("");
  const [lastNameError, setLastNameError] = useState("");
  const [ageError, setAgeError] = useState("");
  const [heightError, setHeightError] = useState("");
  const [weightError, setWeightError] = useState("");
  const [localForm, setLocalForm] = useState(form);
  const [formBackup, setFormBackup] = useState(form);

  const nameRegex = /^[A-Za-z\s'-]+$/;

  useEffect(() => {
    setLocalForm(form);
    setFormBackup(form);
  }, [form]);

  function validateFirstName(value: string) {
    if (!value || !nameRegex.test(value)) {
      setFirstNameError("Please enter a valid name (letters only).");
      return false;
    }
    setFirstNameError("");
    return true;
  }

  function validateLastName(value: string) {
    if (!value || !nameRegex.test(value)) {
      setLastNameError("Please enter a valid name (letters only).");
      return false;
    }
    setLastNameError("");
    return true;
  }

  function validateAge(value: string) {
    if (!value || value.trim() === "") {
      setAgeError("Age is required.");
      return false;
    }
    // Check for non-numeric input
    if (!/^\d+$/.test(value)) {
      setAgeError("Please enter a valid number.");
      return false;
    }
    const age = parseInt(value, 10);
    // Check minimum age (13 years)
    if (age < 13) {
      setAgeError("You must be at least 13 years old.");
      return false;
    }
    // Check maximum reasonable age (120 years)
    if (age > 120) {
      setAgeError("Please enter a realistic age (maximum 120 years).");
      return false;
    }
    setAgeError("");
    return true;
  }

  function validateHeight(value: string) {
    const numberRegex = /^\d+(\.\d+)?$/;
    if (!value || !numberRegex.test(value)) {
      setHeightError("Height is required and must be a valid number.");
      return false;
    }
    const num = parseFloat(value);
    if (num < 50 || num > 250) {
      setHeightError("Height should be between 50 and 250 cm.");
      return false;
    }
    setHeightError("");
    return true;
  }

  function validateWeight(value: string) {
    const numberRegex = /^\d+(\.\d+)?$/;
    if (!value || !numberRegex.test(value)) {
      setWeightError("Weight is required and must be a valid number.");
      return false;
    }
    const num = parseFloat(value);
    if (num < 20 || num > 300) {
      setWeightError("Weight should be between 20 and 300 kg.");
      return false;
    }
    setWeightError("");
    return true;
  }

  function onInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    if (name === "firstName") validateFirstName(value);
    if (name === "lastName") validateLastName(value);
    if (name === "age") {
      if (ageError) setAgeError("");
    }
    if (name === "height") validateHeight(value);
    if (name === "weight") validateWeight(value);
    setLocalForm({ ...localForm, [name]: value });
  }

  function onGenderSelect(option: string) {
    setLocalForm({ ...localForm, gender: option });
    setGenderDropdownOpen(false);
  }

  function onActivityLevelSelect(option: string) {
    setLocalForm({ ...localForm, activityLevel: option });
    setActivityLevelDropdownOpen(false);
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const validFirst = validateFirstName(localForm.firstName);
    const validLast = validateLastName(localForm.lastName);
    const validAge = validateAge(localForm.age);
    const validHeight = validateHeight(localForm.height);
    const validWeight = validateWeight(localForm.weight);
    if (!validFirst || !validLast || !validAge || !validHeight || !validWeight) return;
    
    const formToSave = {
      ...localForm,
      gender: localForm.gender === "" ? null : localForm.gender,
    };
    handleSave(formToSave);
  }

  function handleEditLocal() {
    setFormBackup(form);
    setLocalForm(form);
    handleEdit();
  }

  function handleCancelLocal() {
    setLocalForm(formBackup);
    handleCancel();
  }

  // Clear all error states when exiting edit mode (e.g., on cancel)
  useEffect(() => {
    if (!editMode) {
      setFirstNameError("");
      setLastNameError("");
      setAgeError("");
      setHeightError("");
      setWeightError("");
    }
  }, [editMode]);

  const activityLevels = [
    { value: "sedentary", label: "Sedentary", description: "Little or no exercise" },
    { value: "lightly-active", label: "Lightly Active", description: "Light exercise/sports 1-3 days/week" },
    { value: "moderately-active", label: "Moderately Active", description: "Moderate exercise/sports 3-5 days/week" },
    { value: "very-active", label: "Very Active", description: "Hard exercise/sports 6-7 days a week" },
  ];

  return (
    <form className="space-y-8" onSubmit={onSubmit} autoComplete="off">
      <div className="flex items-start justify-between w-full mb-6">
        <div>
          <div className="text-2xl font-bold text-gray-900 mb-1 max-sm:text-xl">Personal Information</div>
          <div className="text-gray-500 text-base max-sm:text-sm">Manage your personal details easily.</div>
        </div>
        {!editMode && (
          <EditButton onClick={handleEditLocal} />
        )}
      </div>
      <div className="space-y-6">
        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="firstName">First Name</label>
            <input
              type="text"
              name="firstName"
              id="firstName"
              className={`w-full px-3 py-2 border ${firstNameError ? "border-red-500" : "border-gray-300"} rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-500 text-sm text-gray-900 bg-white`}
              placeholder="e.g., Juan"
              value={localForm.firstName}
              onChange={editMode ? onInputChange : undefined}
              onBlur={editMode ? (e) => validateFirstName(e.target.value) : undefined}
              disabled={!editMode}
            />
            {firstNameError && editMode && (
              <p className="text-xs text-red-500 mt-1">{firstNameError}</p>
            )}
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="lastName">Last Name</label>
            <input
              type="text"
              name="lastName"
              id="lastName"
              className={`w-full px-3 py-2 border ${lastNameError ? "border-red-500" : "border-gray-300"} rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-500 text-sm text-gray-900 bg-white`}
              placeholder="e.g., Dela Cruz"
              value={localForm.lastName}
              onChange={editMode ? onInputChange : undefined}
              onBlur={editMode ? (e) => validateLastName(e.target.value) : undefined}
              disabled={!editMode}
            />
            {lastNameError && editMode && (
              <p className="text-xs text-red-500 mt-1">{lastNameError}</p>
            )}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="age">Age</label>
          <input
            type="text"
            name="age"
            id="age"
            className={`w-full px-3 py-2 border ${ageError ? "border-red-500" : "border-gray-300"} rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-500 text-sm text-gray-900 bg-white`}
            placeholder="Enter your age"
            value={localForm.age}
            onChange={editMode ? onInputChange : undefined}
            onBlur={editMode ? (e) => validateAge(e.target.value) : undefined}
            disabled={!editMode}
            autoComplete="off"
          />
          {ageError && editMode && (
            <p className="text-xs text-red-500 mt-1">{ageError}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="gender">Gender (Optional)</label>
          {editMode ? (
            <div className="relative">
              <button
                type="button"
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-sm text-gray-900 text-left flex justify-between items-center focus:outline-none focus:ring-1 focus:ring-emerald-500"
                onClick={() => setGenderDropdownOpen((v) => !v)}
                style={{ fontWeight: 400 }}
              >
                <span className={localForm.gender ? "text-gray-900" : "text-gray-400"}>
                  {localForm.gender || "Select gender"}
                </span>
                <ChevronDown className="h-4 w-4 text-gray-500" />
              </button>
              {genderDropdownOpen && (
                <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md border border-gray-200 py-1">
                  {["Male", "Female", "Non-binary", "Prefer not to say"].map(option => (
                    <div
                      key={option}
                      className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-gray-700 text-sm"
                      onClick={() => onGenderSelect(option)}
                    >
                      {option}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <input
              type="text"
              name="gender"
              id="gender"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-500 text-sm text-gray-900 bg-white"
              placeholder="e.g., Female"
              value={localForm.gender ?? ""}
              readOnly
              disabled
            />
          )}
          <div className="text-gray-500 text-xs mt-2">This information helps us calculate your nutritional needs more accurately.</div>
        </div>
      </div>
      <hr className="my-6 border-gray-200" />
      <div className="flex flex-col md:flex-row gap-6">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="height">Height (cm)</label>
          <input
            type="text"
            name="height"
            id="height"
            className={`w-full px-3 py-2 border ${heightError ? "border-red-500" : "border-gray-300"} rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-500 text-sm text-gray-900 bg-white`}
            placeholder="e.g., 170"
            value={localForm.height}
            onChange={editMode ? onInputChange : undefined}
            onBlur={editMode ? (e) => validateHeight(e.target.value) : undefined}
            disabled={!editMode}
          />
          {heightError && editMode && (
            <p className="text-xs text-red-500 mt-1">{heightError}</p>
          )}
        </div>
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="weight">Weight (kg)</label>
          <input
            type="text"
            name="weight"
            id="weight"
            className={`w-full px-3 py-2 border ${weightError ? "border-red-500" : "border-gray-300"} rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-500 text-sm text-gray-900 bg-white`}
            placeholder="e.g., 70"
            value={localForm.weight}
            onChange={editMode ? onInputChange : undefined}
            onBlur={editMode ? (e) => validateWeight(e.target.value) : undefined}
            disabled={!editMode}
          />
          {weightError && editMode && (
            <p className="text-xs text-red-500 mt-1">{weightError}</p>
          )}
        </div>
      </div>
      {/* Activity Level Dropdown */}
      <div className="mt-6">
        <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="activityLevel">Activity Level</label>
        {editMode ? (
          <div className="relative">
            <button
              type="button"
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-sm text-gray-900 text-left flex justify-between items-center focus:outline-none focus:ring-1 focus:ring-emerald-500"
              onClick={() => setActivityLevelDropdownOpen((v) => !v)}
              style={{ fontWeight: 400 }}
            >
              <span className={localForm.activityLevel ? "text-gray-900" : "text-gray-400"}>
                {activityLevels.find(a => a.value === localForm.activityLevel)?.label || "Select activity level"}
              </span>
              <ChevronDown className="h-4 w-4 text-gray-500" />
            </button>
            {activityLevelDropdownOpen && (
              <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md border border-gray-200 py-1">
                {activityLevels.map(option => (
                  <div
                    key={option.value}
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-gray-700 text-sm"
                    onClick={() => onActivityLevelSelect(option.value)}
                  >
                    <div className="font-medium">{option.label}</div>
                    <div className="text-xs text-gray-500">{option.description}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <input
            type="text"
            name="activityLevel"
            id="activityLevel"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-500 text-sm text-gray-900 bg-white"
            placeholder="e.g., Moderately Active"
            value={(() => {
              if (!localForm.activityLevel) return "";
              const found = activityLevels.find(a => a.value === localForm.activityLevel);
              if (found) return found.label;
              // If activityLevel is not empty but not in the list, display the raw value
              return localForm.activityLevel;
            })()}
            readOnly
            disabled
          />
        )}
        <div className="text-gray-500 text-xs mt-2">This helps us calculate your calorie needs for better meal plans.</div>
      </div>
      {editMode && (
        <SaveCancelActions onSave={onSubmit} onCancel={handleCancelLocal} />
      )}
    </form>
  );
}
