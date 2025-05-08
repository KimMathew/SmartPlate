"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { CardContent } from "@/components/ui/card";
import { Pencil } from "lucide-react";

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
          <input
            type="text"
            name="dob"
            id="dob"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-500 text-sm text-gray-900 bg-white"
            placeholder="mm/dd/yyyy"
            value={localForm.dob}
            onChange={localEditMode ? handleLocalChange : undefined}
            disabled={!localEditMode}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="gender">Gender (Optional)</label>
          <input
            type="text"
            name="gender"
            id="gender"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-500 text-sm text-gray-900 bg-white"
            placeholder="e.g., Female"
            value={localForm.gender}
            onChange={localEditMode ? handleLocalChange : undefined}
            disabled={!localEditMode}
          />
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
