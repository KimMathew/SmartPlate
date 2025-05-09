"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Pencil, ChevronDown } from "lucide-react";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { EditButton } from "@/components/ui/edit-button";
import { SaveCancelActions } from "@/components/ui/save-cancel-actions";

interface PersonalInfoTabProps {
  form: {
    firstName: string;
    lastName: string;
    dob: string;
    gender: string | null;
    height: string;
    weight: string;
    activityLevel: string;
  };
  editMode: boolean;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSave: (form: { firstName: string; lastName: string; dob: string; gender: string | null; height: string; weight: string; activityLevel: string; }) => void;
  handleCancel: () => void;
  handleEdit: () => void;
}

export default function PersonalInfoTab({ form, editMode, handleChange, handleSave, handleCancel, handleEdit }: PersonalInfoTabProps) {
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [genderDropdownOpen, setGenderDropdownOpen] = useState(false);
  const [activityLevelDropdownOpen, setActivityLevelDropdownOpen] = useState(false);
  const [firstNameError, setFirstNameError] = useState("");
  const [lastNameError, setLastNameError] = useState("");
  const [dobError, setDobError] = useState("");
  const [heightError, setHeightError] = useState("");
  const [weightError, setWeightError] = useState("");
  const [localForm, setLocalForm] = useState(form);

  const nameRegex = /^[A-Za-z\s'-]+$/;

  useEffect(() => {
    setLocalForm(form);
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

  function validateDob(value: string) {
    if (!value || value.trim() === "") {
      setDobError("Date of birth is required.");
      return false;
    }
    const [yyyy, mm, dd] = value.split("-");
    const date = new Date(Number(yyyy), Number(mm) - 1, Number(dd));
    if (isNaN(date.getTime())) {
      setDobError("Invalid date format.");
      return false;
    }
    const today = new Date();
    const dobNoTime = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const todayNoTime = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    if (dobNoTime >= todayNoTime) {
      setDobError("Date must be before today.");
      return false;
    }
    const minAgeDate = new Date(todayNoTime);
    minAgeDate.setFullYear(minAgeDate.getFullYear() - 13);
    if (dobNoTime > minAgeDate) {
      setDobError("You must be at least 13 years old.");
      return false;
    }
    setDobError("");
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
    if (name === "dob") {
      if (validateDob(value)) {
        setDobError("");
      }
    }
    if (name === "height") validateHeight(value);
    if (name === "weight") validateWeight(value);
    setLocalForm({ ...localForm, [name]: value });
  }

  // Helper to format date as yyyy-mm-dd
  function formatDate(date: Date | undefined) {
    if (!date) return "";
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    const yyyy = date.getFullYear();
    return `${yyyy}-${mm}-${dd}`;
  }

  function parseDate(value: string): Date | undefined {
    if (!value) return undefined;
    const [yyyy, mm, dd] = value.split("-");
    const date = new Date(Number(yyyy), Number(mm) - 1, Number(dd));
    return isNaN(date.getTime()) ? undefined : date;
  }

  function onGenderSelect(option: string) {
    setLocalForm({ ...localForm, gender: option });
    setGenderDropdownOpen(false);
  }

  function onDateSelect(date: Date | undefined) {
    if (date) {
      const formatted = formatDate(date);
      setLocalForm({ ...localForm, dob: formatted });
      if (validateDob(formatted)) {
        setDobError("");
      }
    }
    setCalendarOpen(false);
  }

  function onActivityLevelSelect(option: string) {
    setLocalForm({ ...localForm, activityLevel: option });
    setActivityLevelDropdownOpen(false);
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const validFirst = validateFirstName(localForm.firstName);
    const validLast = validateLastName(localForm.lastName);
    const validDob = validateDob(localForm.dob);
    const validHeight = validateHeight(localForm.height);
    const validWeight = validateWeight(localForm.weight);
    if (!validFirst || !validLast || !validDob || !validHeight || !validWeight) return;
    // Ensure gender is null if empty string
    const formToSave = {
      ...localForm,
      gender: localForm.gender === "" ? null : localForm.gender,
    };
    handleSave(formToSave);
  }

  function handleEditLocal() {
    setLocalForm(form);
    handleEdit();
  }

  function handleCancelLocal() {
    setLocalForm(form);
    handleCancel();
  }

  // Clear all error states when exiting edit mode (e.g., on cancel)
  useEffect(() => {
    if (!editMode) {
      setFirstNameError("");
      setLastNameError("");
      setDobError("");
      setHeightError("");
      setWeightError("");
    }
  }, [editMode]);

  const activityLevels = [
    { value: "sedentary", label: "Sedentary", description: "Little or no exercise" },
    { value: "lightly_active", label: "Lightly Active", description: "Light exercise/sports 1-3 days/week" },
    { value: "moderately_active", label: "Moderately Active", description: "Moderate exercise/sports 3-5 days/week" },
    { value: "very_active", label: "Very Active", description: "Hard exercise/sports 6-7 days a week" },
    { value: "super_active", label: "Super Active", description: "Very hard exercise/sports & physical job" },
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
          <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="dob">Date of Birth</label>
          <div className="relative">
            <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
              <PopoverTrigger asChild>
                <input
                  type="text"
                  name="dob"
                  id="dob"
                  className={`w-full px-3 py-2 border ${dobError ? "border-red-500" : "border-gray-300"} rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-500 text-sm text-gray-900 bg-white pr-10 ${editMode ? "cursor-pointer" : "cursor-default"}`}
                  placeholder="mm/dd/yyyy"
                  value={localForm.dob}
                  readOnly
                  onClick={editMode ? () => setCalendarOpen(true) : undefined}
                  onBlur={editMode ? (e) => validateDob(e.target.value) : undefined}
                  disabled={!editMode}
                />
              </PopoverTrigger>
              {editMode && (
                <div
                  className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer z-10"
                  onClick={editMode ? () => setCalendarOpen((v) => !v) : undefined}
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2.66675H3.99998C2.52722 2.66675 1.33331 3.86066 1.33331 5.33341V12.0001C1.33331 13.4728 2.52722 14.6667 3.99998 14.6667H12C13.4727 14.6667 14.6666 13.4728 14.6666 12.0001V5.33341C14.6666 3.86066 13.4727 2.66675 12 2.66675Z" stroke="#6B7280" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M5.33331 1.33337V4.00004" stroke="#6B7280" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M10.6666 1.33337V4.00004" stroke="#6B7280" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M1.33331 6.66675H14.6666" stroke="#6B7280" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              )}
              {editMode && (
                <PopoverContent align="start" className="p-0 w-auto bg-white">
                  <Calendar
                    mode="single"
                    selected={parseDate(localForm.dob)}
                    onSelect={onDateSelect}
                    initialFocus
                    fromYear={1900}
                    toYear={new Date().getFullYear()}
                  />
                </PopoverContent>
              )}
            </Popover>
          </div>
          {dobError && editMode && (
            <p className="text-xs text-red-500 mt-1">{dobError}</p>
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
            value={activityLevels.find(a => a.value === localForm.activityLevel)?.label || ""}
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
