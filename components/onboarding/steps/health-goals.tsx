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
  const [error, setError] = useState<string | null>(null);
  const [targetWeightError, setTargetWeightError] = useState<string | null>(
    null
  );
  const [imageVisible, setImageVisible] = useState(false);

  useEffect(() => {
    setCurrentStep(3); // step 4
    setSegmentProgress([100, 100, 100, 0]);
    setTimeout(() => {
      setSegmentProgress([100, 100, 100, 100]);
    }, 100);
    setTimeout(() => setImageVisible(true), 200); // trigger fade-in
  }, []);

  return (
    <div className="flex h-full w-full">
      <div className="w-full md:w-[65%] p-10 flex flex-col h-full overflow-auto">
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
                  { value: "gain-weight", label: "Gain Weight", icon: "⬆️" },
                ].map((option) => {
                  const isSelected = formData.goalType === option.value;
                  return (
                    <div
                      key={option.value}
                      onClick={() => onChange("goalType", option.value)}
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          onChange("goalType", option.value);
                        }
                      }}
                      className={`relative px-2 py-4 rounded-lg border cursor-pointer transition-all duration-200 text-center text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400
                        ${
                          isSelected
                            ? "border-emerald-500 bg-emerald-50 scale-102 shadow-lg"
                            : "border-gray-300 hover:border-emerald-300 hover:bg-emerald-50"
                        }
                      `}
                      aria-pressed={isSelected}
                      style={{ minWidth: 0 }}
                    >
                      {/* Checkmark icon */}
                      {isSelected && (
                        <span className="absolute top-2 right-2 text-emerald-500">
                          <svg
                            width="20"
                            height="20"
                            fill="none"
                            viewBox="0 0 20 20"
                          >
                            <circle cx="10" cy="10" r="10" fill="#10B981" />
                            <path
                              d="M6 10.5l2.5 2.5 5-5"
                              stroke="#fff"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </span>
                      )}
                      <div className="text-xl mb-1">{option.icon}</div>
                      <div
                        className={`font-medium ${
                          isSelected ? "text-emerald-700" : "text-gray-700"
                        }`}
                      >
                        {option.label}
                      </div>
                      {/* Show numeric input for weekly rate if Lose/Gain Weight is selected */}
                      {isSelected &&
                        (option.value === "lose-weight" ||
                          option.value === "gain-weight") && (
                          <div className="mt-3 flex flex-col items-center w-full">
                            <Label className="mb-1 text-xs text-gray-500 self-start">
                              Optional
                            </Label>
                            <div className="flex items-center w-full">
                              <input
                                type="number"
                                min="0"
                                step="0.1"
                                placeholder={`e.g., 0.5`}
                                value={formData.weeklyGoal || ""}
                                onChange={(e) =>
                                  onChange("weeklyGoal", e.target.value)
                                }
                                className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-emerald-500 text-gray-900 bg-white shadow-sm text-sm"
                                aria-label="Weekly rate in kg per week"
                              />
                            </div>
                            <span className="text-xs text-gray-500 mt-1 self-start">
                              kg/week
                            </span>
                          </div>
                        )}
                    </div>
                  );
                })}
              </div>
              {error && <p className="text-red-500 text-xs mt-2">{error}</p>}
            </div>

            <div className="space-y-1">
              <Label htmlFor="targetWeight" className="text-gray-900 text-base">
                Target Weight (in kg)
              </Label>
              <div className="text-xs text-gray-500">Optional</div>
              <div className="relative">
                <input
                  type="number"
                  id="targetWeight"
                  min="0"
                  placeholder="e.g., 65"
                  value={formData.targetWeight ?? ""}
                  onChange={(e) => {
                    const value = e.target.value;
                    onChange("targetWeight", value);
                    if (value === "") {
                      setTargetWeightError(null);
                      return;
                    }
                    const num = parseFloat(value);
                    if (num < 20 || num > 300) {
                      setTargetWeightError(
                        "Please enter a realistic weight between 20 and 300 kg."
                      );
                    } else {
                      setTargetWeightError(null);
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-500 text-gray-900 bg-white shadow-sm transition-all duration-200"
                />
                {targetWeightError && (
                  <p className="text-red-500 text-xs mt-1">
                    {targetWeightError}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-between mt-8 pt-4 bg-white">
          <Button
            onClick={onBack}
            variant="ghost"
            className="font-medium"
          >
            Back
          </Button>
          <Button
            onClick={() => {
              if (!formData.goalType) {
                setError("Please select a goal type to continue.");
                return;
              }
              setError(null);
              onNext();
            }}
            size="lg"
            className="px-6 py-2"
          >
            Next
          </Button>
        </div>
      </div>

      {/* Right side - Green panel, hidden on small screens */}
      <div className="hidden md:flex w-[35%] bg-emerald-500 h-full items-center justify-center">
        <img
          src="/step-3.png"
          alt="Illustration of health goals"
          className={`max-w-[80%] max-h-[80%] object-contain transition-opacity duration-700 fade-in-illustration${
            imageVisible ? " opacity-100" : " opacity-0"
          }`}
        />
      </div>
    </div>
  );
}
