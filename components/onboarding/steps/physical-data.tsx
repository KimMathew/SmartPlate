"use client";
import { useState, useEffect } from "react";
import ProgressIndicator from "../progress-indicator";

interface PhysicalDataProps {
  formData: any;
  onChange: (field: string, value: string | string[]) => void;
  onNext: () => void;
  onBack: () => void;
  onSkip: () => void;
}

export default function PhysicalData({
  formData,
  onChange,
  onNext,
  onBack,
}: PhysicalDataProps) {
  const activityLevels = [
    {
      value: "sedentary",
      label: "Sedentary",
      description: "Little to no exercise",
    },
    {
      value: "lightly-active",
      label: "Lightly Active",
      description: "Light exercise 1-3 days/week",
    },
    {
      value: "moderately-active",
      label: "Moderately Active",
      description: "Moderate exercise 3-5 days/week",
    },
    {
      value: "very-active",
      label: "Very Active",
      description: "Hard exercise 6-7 days/week",
    },
  ];

  // Animated progress bar state
  const [currentStep, setCurrentStep] = useState(1);
  const [segmentProgress, setSegmentProgress] = useState([100, 0, 0, 0]);

  useEffect(() => {
    setCurrentStep(1); // step 2
    setSegmentProgress([100, 0, 0, 0]);
    setTimeout(() => {
      setSegmentProgress([100, 100, 0, 0]);
    }, 100);
  }, []);

  return (
    <div className="flex h-full w-full">
      <div className="w-[65%] p-10 flex flex-col h-full overflow-auto">
        {/* Progress indicator */}
        <div className="mb-10 pt-2 flex justify-center bg-white">
          <ProgressIndicator currentStep={1} />
        </div>
        <div className="flex-1 min-h-min ">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Tell Us About Your Body
          </h2>
          <p className="text-gray-600 mb-6">
            This helps us calculate your calorie needs for better meal plans.
          </p>

          <div className="space-y-5">
            <div className="space-y-1">
              <label
                htmlFor="height"
                className="block text-sm font-medium text-gray-700"
              >
                Height
              </label>
              <input
                type="text"
                id="height"
                placeholder="e.g., 170 cm or 5'7&quot;"
                value={formData.height}
                onChange={(e) => onChange("height", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div className="space-y-1">
              <label
                htmlFor="weight"
                className="block text-sm font-medium text-gray-700"
              >
                Weight
              </label>
              <input
                type="text"
                id="weight"
                placeholder="e.g., 70 kg or 154 lbs"
                value={formData.weight}
                onChange={(e) => onChange("weight", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Activity
              </label>
              <div className="grid grid-cols-2 gap-3">
                {activityLevels.map((level) => (
                  <div
                    key={level.value}
                    onClick={() => onChange("activityLevel", level.value)}
                    className={`min-w-[180px] border rounded-md p-3 cursor-pointer transition-colors
                      ${
                        formData.activityLevel === level.value
                          ? "border-emerald-500 bg-white"
                          : "border-gray-300 hover:border-gray-400"
                      }
                    `}
                  >
                    <div className="font-medium text-gray-900">
                      {level.label}
                    </div>
                    <div className="text-sm text-gray-500">
                      {level.description}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-between mt-10 mb-0">
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
