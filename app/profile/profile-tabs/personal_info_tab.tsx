"use client";

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
  handleSave: (e: React.FormEvent) => void;
  handleCancel: () => void;
}

export default function PersonalInfoTab({ form, editMode, handleChange, handleSave, handleCancel }: PersonalInfoTabProps) {
  return (
    <form className="space-y-8" onSubmit={handleSave} autoComplete="off">
      <div className="flex items-start justify-between w-full mb-6">
        <div>
          <div className="text-2xl font-bold text-gray-900 mb-1">Personal Information</div>
          <div className="text-gray-500 text-base">Update your personal details here.</div>
        </div>
        {!editMode && (
          <Button
            type="button"
            variant="default"
            className="ml-4 mt-1"
            onClick={handleChange as any /* You may want to provide a dedicated edit handler */}
          >
            <Pencil className="w-4 h-4 mr-2" />
            Edit
          </Button>
        )}
      </div>
      <div className="space-y-6">
        <div>
          <label className="block text-base font-semibold text-gray-900 mb-2" htmlFor="name">Full Name</label>
          <input
            type="text"
            name="name"
            id="name"
            className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-base text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-200 disabled:bg-gray-50"
            value={form.name}
            onChange={handleChange}
            disabled={!editMode}
          />
        </div>
        <div>
          <label className="block text-base font-semibold text-gray-900 mb-2" htmlFor="dob">Date of Birth</label>
          <input
            type="date"
            name="dob"
            id="dob"
            className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-base text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-200 disabled:bg-gray-50"
            value={form.dob}
            onChange={handleChange}
            disabled={!editMode}
          />
        </div>
        <div>
          <label className="block text-base font-semibold text-gray-900 mb-2" htmlFor="gender">Gender (Optional)</label>
          <input
            type="text"
            name="gender"
            id="gender"
            className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-base text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-200 disabled:bg-gray-50"
            value={form.gender}
            onChange={handleChange}
            disabled={!editMode}
          />
          <div className="text-gray-500 text-sm mt-2">This information helps us calculate your nutritional needs more accurately.</div>
        </div>
      </div>
      <hr className="my-6 border-gray-200" />
      <div className="flex flex-col md:flex-row gap-6">
        <div className="flex-1">
          <label className="block text-base font-semibold text-gray-900 mb-2" htmlFor="height">Height (cm)</label>
          <input
            type="number"
            name="height"
            id="height"
            className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-base text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-200 disabled:bg-gray-50"
            value={form.height}
            onChange={handleChange}
            disabled={!editMode}
          />
        </div>
        <div className="flex-1">
          <label className="block text-base font-semibold text-gray-900 mb-2" htmlFor="weight">Weight (kg)</label>
          <input
            type="number"
            name="weight"
            id="weight"
            className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-base text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-200 disabled:bg-gray-50"
            value={form.weight}
            onChange={handleChange}
            disabled={!editMode}
          />
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
