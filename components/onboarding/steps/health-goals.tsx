"use client";

import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import ProgressIndicator from "../progress-indicator";

interface HealthGoalsProps {
  formData: any;
  onChange: (field: string, value: string | string[]) => void;
  onNext: () => void;
  onBack: () => void;
  onSkip: () => void;
}

export default function HealthGoals({
  formData,
  onChange,
  onNext,
  onBack,
  onSkip,
}: HealthGoalsProps) {
  // Animated progress bar state
  const [currentStep, setCurrentStep] = useState(2);
  const [segmentProgress, setSegmentProgress] = useState([100, 100, 0, 0]);

  useEffect(() => {
    setCurrentStep(2); // step 3
    setSegmentProgress([100, 100, 0, 0]);
    setTimeout(() => {
      setSegmentProgress([100, 100, 100, 0]);
    }, 100);
  }, []);

  return (
    <div className="flex h-full w-full">
      <div className="w-[65%] p-10 flex flex-col h-full overflow-auto">
        {/* Progress indicator */}
        <div className="mb-10 pt-2 flex justify-center bg-white">
          <ProgressIndicator currentStep={2} />
        </div>
        <div className="flex-1 flex flex-col justify-center min-h-min">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Your Health Goals
          </h2>
          <p className="text-gray-600 mb-8">
            Let us know what you want to achieve with your nutrition plan.
          </p>

          <div className="space-y-6">
            <div className="space-y-3">
              <Label htmlFor="goalType" className="text-gray-900 text-base">
                Goal Type
              </Label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {[
                  { value: "lose-weight", label: "Lose Weight", icon: "⬇️" },
                  { value: "maintain", label: "Maintain", icon: "⚖️" },
                  { value: "gain-muscle", label: "Gain Muscle", icon: "💪" },
                ].map((option) => (
                  <div
                    key={option.value}
                    onClick={() => onChange("goalType", option.value)}
                    className={`px-2 py-4 rounded-lg border cursor-pointer transition-all duration-200 text-center relative text-sm
                      ${
                        formData.goalType === option.value
                          ? "border-emerald-500 shadow-md ring-2 ring-emerald-500/20"
                          : "border-gray-300 hover:border-emerald-300 hover:bg-emerald-50/30"
                      }`}
                    style={{ minWidth: 0 }}
                  >
                    {formData.goalType === option.value && (
                      <div className="absolute top-0 right-0 w-0 h-0 border-t-[28px] border-r-[28px] border-t-emerald-500 border-r-transparent">
                        <Check className="absolute -top-[20px] right-[-20px] h-3 w-3 text-white" />
                      </div>
                    )}
                    <div className="text-xl mb-1">{option.icon}</div>
                    <div
                      className={`font-medium ${
                        formData.goalType === option.value
                          ? "text-emerald-700"
                          : "text-gray-700"
                      }`}
                    >
                      {option.label}
                    </div>
                    {formData.goalType === option.value && (
                      <div className="absolute inset-0 bg-emerald-500/5 rounded-lg pointer-events-none" />
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <Label htmlFor="weeklyGoal" className="text-gray-900 text-base">
                Weekly Goal (Optional)
              </Label>
              <div className="relative">
                <input
                  type="text"
                  id="weeklyGoal"
                  placeholder="e.g., Lose 0.5kg/week"
                  value={formData.weeklyGoal}
                  onChange={(e) => onChange("weeklyGoal", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-500 text-gray-900 bg-white shadow-sm transition-all duration-200"
                />
              </div>
            </div>

            <div className="space-y-3">
              <Label htmlFor="targetWeight" className="text-gray-900 text-base">
                Target Weight (Optional)
              </Label>
              <div className="relative">
                <input
                  type="text"
                  id="targetWeight"
                  placeholder="e.g., 65 kg or 143 lbs"
                  value={formData.targetWeight}
                  onChange={(e) => onChange("targetWeight", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-500 text-gray-900 bg-white shadow-sm transition-all duration-200"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-between mt-8 pt-4 bg-white">
          <button
            onClick={onBack}
            className="text-gray-700 hover:text-gray-900 font-medium"
          >
            Back
          </button>
          <button
            onClick={onNext}
            className="px-6 py-2 bg-emerald-500 text-white rounded-md hover:bg-emerald-600 transition-colors"
          >
            Next
          </button>
        </div>
      </div>

      {/* Right side - Green panel */}
      <div className="w-[35%] bg-emerald-500 h-full"></div>
    </div>
  );
}
