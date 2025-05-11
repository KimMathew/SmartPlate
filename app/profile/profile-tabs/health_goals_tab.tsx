"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import { EditButton } from "@/components/ui/edit-button";
import { SaveCancelActions } from "@/components/ui/save-cancel-actions";

const healthGoalOptions = [
  { value: "lose-weight", label: "Lose Weight" },
  { value: "maintain", label: "Maintain" },
  { value: "gain-weight", label: "Gain Weight" },
];

interface HealthGoalsForm {
  healthGoal: string;
  targetWeight: string;
}

const defaultForm: HealthGoalsForm = {
  healthGoal: "lose-weight",
  targetWeight: "",
};

interface HealthGoalsTabProps {
  form: HealthGoalsForm;
  setForm: (form: HealthGoalsForm) => void;
  onSave: (form: HealthGoalsForm) => Promise<void>;
  editMode: boolean;
  handleEdit: () => void;
  handleCancel: () => void;
}

export default function HealthGoalsTab({
  form,
  setForm,
  onSave,
  editMode,
  handleEdit,
  handleCancel,
}: HealthGoalsTabProps) {
  const [formBackup, setFormBackup] = useState<HealthGoalsForm>(form);
  const [localForm, setLocalForm] = useState<HealthGoalsForm>(form);
  const [goalDropdownOpen, setGoalDropdownOpen] = useState(false);

  useEffect(() => {
    setFormBackup(form);
    setLocalForm(form);
  }, [form]);

  const handleChange = (field: keyof HealthGoalsForm, value: any) => {
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

  const handleSaveLocal = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave(localForm);
    setForm(localForm); // update parent state
    setFormBackup(localForm); // update backup to latest after save
  };

  return (
    <form className="space-y-8" onSubmit={handleSaveLocal} autoComplete="off">
      <div className="flex items-start justify-between w-full mb-6">
        <div>
          <div className="text-2xl font-bold text-gray-900 mb-1 max-sm:text-xl">Health Goals</div>
          <div className="text-gray-500 text-base max-sm:text-sm">Define your health and nutrition goals.</div>
        </div>
        {!editMode && <EditButton onClick={handleEditLocal} />}
      </div>
      <div className="space-y-6">
        {/* Health Goal Dropdown */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Health Goal</label>
          {editMode ? (
            <>
              <div className="relative">
                <button
                  type="button"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-sm text-gray-900 text-left flex justify-between items-center focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  onClick={() => setGoalDropdownOpen((v) => !v)}
                  style={{ fontWeight: 400 }}
                >
                  <span className={localForm.healthGoal ? "text-gray-900" : "text-gray-400"}>
                    {healthGoalOptions.find(opt => opt.value === localForm.healthGoal)?.label || "Select health goal"}
                  </span>
                  <svg className="h-4 w-4 text-gray-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                </button>
                {goalDropdownOpen && (
                  <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md border border-gray-200 py-1">
                    {healthGoalOptions.map(option => (
                      <div
                        key={option.value}
                        className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-gray-700 text-sm"
                        onClick={() => {
                          handleChange("healthGoal", option.value);
                          setGoalDropdownOpen(false);
                        }}
                      >
                        {option.label}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {/* Removed rate per week input */}
            </>
          ) : (
            <>
              <input
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-500 text-sm text-gray-900 bg-white"
                value={healthGoalOptions.find(opt => opt.value === localForm.healthGoal)?.label || ""}
                disabled
              />
              {/* Removed rate per week input */}
            </>
          )}
        </div>
        {/* Target Weight */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Target Weight (kg)</label>
          <input
            type="text"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-500 text-sm text-gray-900 bg-white"
            placeholder="e.g., 65"
            value={localForm.targetWeight}
            onChange={editMode ? e => handleChange("targetWeight", e.target.value) : undefined}
            disabled={!editMode}
          />
        </div>
      </div>
      {editMode && (
        <SaveCancelActions onSave={handleSaveLocal} onCancel={handleCancelLocal} />
      )}
    </form>
  );
}
