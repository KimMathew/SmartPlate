"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { CardContent } from "@/components/ui/card";
import { Pencil, ChevronDown } from "lucide-react";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";

interface PersonalInfoTabProps {
  form: {
    name: string;
    dob: string;
    gender: string;
    height: string;
    weight: string;
  };
  editMode: boolean;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSave: (form: { name: string; dob: string; gender: string; height: string; weight: string; }) => void;
  handleCancel: () => void;
}

export default function PersonalInfoTab({ form, editMode, handleChange, handleSave, handleCancel }: PersonalInfoTabProps) {
  const [localEditMode, setLocalEditMode] = useState(false);
  const [localForm, setLocalForm] = useState(form);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [genderDropdownOpen, setGenderDropdownOpen] = useState(false);

  // Keep localForm in sync with form when not editing
  useEffect(() => {
    if (!localEditMode) {
      setLocalForm(form);
    }
  }, [form, localEditMode]);

  const handleLocalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLocalForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleEdit = () => {
    setLocalForm(form);
    setLocalEditMode(true);
  };

  const handleCancelEdit = () => {
    setLocalForm(form);
    setLocalEditMode(false);
  };

  const handleLocalSave = (e: React.FormEvent) => {
    e.preventDefault();
    handleSave(localForm); // Pass the updated values to parent
    setLocalEditMode(false);
  };

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

  return (
    <form className="space-y-8" onSubmit={handleLocalSave} autoComplete="off">
      <div className="flex items-start justify-between w-full mb-6">
        <div>
          <div className="text-2xl font-bold text-gray-900 mb-1">Personal Information</div>
          <div className="text-gray-500 text-base">Update your personal details here.</div>
        </div>
        {!localEditMode && (
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
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="name">Full Name</label>
          <input
            type="text"
            name="name"
            id="name"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-500 text-sm text-gray-900 bg-white"
            placeholder="e.g., Juan Dela Cruz"
            value={localForm.name}
            onChange={localEditMode ? handleLocalChange : undefined}
            disabled={!localEditMode}
          />
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
                  className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-500 text-sm text-gray-900 bg-white pr-10 ${localEditMode ? "cursor-pointer" : "cursor-default"}`}
                  placeholder="mm/dd/yyyy"
                  value={localForm.dob}
                  readOnly
                  onClick={localEditMode ? () => setCalendarOpen(true) : undefined}
                  disabled={!localEditMode}
                />
              </PopoverTrigger>
              {localEditMode && (
                <PopoverContent align="start" className="p-0 w-auto bg-white">
                  <Calendar
                    mode="single"
                    selected={parseDate(localForm.dob)}
                    onSelect={(date) => {
                      setCalendarOpen(false);
                      if (date) {
                        setLocalForm((prev) => ({ ...prev, dob: formatDate(date) }));
                      }
                    }}
                    initialFocus
                    fromYear={1900}
                    toYear={new Date().getFullYear()}
                  />
                </PopoverContent>
              )}
              {localEditMode && (
                <div
                  className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer z-10"
                  onClick={localEditMode ? () => setCalendarOpen((v) => !v) : undefined}
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2.66675H3.99998C2.52722 2.66675 1.33331 3.86066 1.33331 5.33341V12.0001C1.33331 13.4728 2.52722 14.6667 3.99998 14.6667H12C13.4727 14.6667 14.6666 13.4728 14.6666 12.0001V5.33341C14.6666 3.86066 13.4727 2.66675 12 2.66675Z" stroke="#6B7280" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M5.33331 1.33337V4.00004" stroke="#6B7280" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M10.6666 1.33337V4.00004" stroke="#6B7280" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M1.33331 6.66675H14.6666" stroke="#6B7280" strokeWidth="1.33333" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              )}
            </Popover>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="gender">Gender (Optional)</label>
          {localEditMode ? (
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
                      onClick={() => {
                        setLocalForm(prev => ({ ...prev, gender: option }));
                        setGenderDropdownOpen(false);
                      }}
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
              value={localForm.gender}
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
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-500 text-sm text-gray-900 bg-white"
            placeholder="e.g., 170"
            value={localForm.height}
            onChange={localEditMode ? handleLocalChange : undefined}
            disabled={!localEditMode}
          />
        </div>
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="weight">Weight (kg)</label>
          <input
            type="text"
            name="weight"
            id="weight"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-500 text-sm text-gray-900 bg-white"
            placeholder="e.g., 70"
            value={localForm.weight}
            onChange={localEditMode ? handleLocalChange : undefined}
            disabled={!localEditMode}
          />
        </div>
      </div>
      {localEditMode && (
        <div className="flex gap-4 pt-2">
          <Button type="submit" className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold px-8 py-3 rounded-md">Save Changes</Button>
          <Button type="button" variant="outline" onClick={handleCancelEdit}>Cancel</Button>
        </div>
      )}
    </form>
  );
}
