"use client";

import { useState, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import ProgressIndicator from "../progress-indicator";

interface BasicInformationProps {
  formData: any;
  onChange: (field: string, value: string | string[]) => void;
  onNext: () => void;
  onSkip: () => void;
}

export default function BasicInformation({
  formData,
  onChange,
  onNext,
}: BasicInformationProps) {
  const [genderOpen, setGenderOpen] = useState(false);
  // Animated progress bar state
  const [currentStep, setCurrentStep] = useState(0);
  const [segmentProgress, setSegmentProgress] = useState([0, 0, 0, 0]);

  useEffect(() => {
    setCurrentStep(0); // step 1
    setSegmentProgress([0, 0, 0, 0]);
    setTimeout(() => {
      setSegmentProgress([100, 0, 0, 0]);
    }, 100);
  }, []);

  const handleGenderSelect = (gender: string) => {
    onChange("gender", gender);
    setGenderOpen(false);
  };

  return (
    <div className="flex h-full w-full">
      <div className="w-[65%] p-10 flex flex-col justify-center h-full">
        {/* Progress indicator */}
        <div className="mb-10 pt-2 flex justify-center bg-white">
          <ProgressIndicator currentStep={0} />
        </div>
        {/* Form content */}
        <div className="flex-1 flex flex-col justify-center min-h-min">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Let's Get to Know You!
          </h2>
          <p className="text-gray-600 mb-8">
            Share a few details to start your personalized meal planning
            journey.
          </p>

          <div className="space-y-6">
            <div className="space-y-1">
              <label
                htmlFor="dateOfBirth"
                className="block text-sm font-medium text-gray-700"
              >
                Date of Birth
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="dateOfBirth"
                  placeholder="mm/dd/yyyy"
                  value={formData.dateOfBirth}
                  onChange={(e) => onChange("dateOfBirth", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-500 pr-10"
                  onFocus={(e) => (e.target.type = "date")}
                  onBlur={(e) => {
                    if (!e.target.value) e.target.type = "text";
                  }}
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                  {/* Calendar icon as per design */}
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M12 2.66675H3.99998C2.52722 2.66675 1.33331 3.86066 1.33331 5.33341V12.0001C1.33331 13.4728 2.52722 14.6667 3.99998 14.6667H12C13.4727 14.6667 14.6666 13.4728 14.6666 12.0001V5.33341C14.6666 3.86066 13.4727 2.66675 12 2.66675Z"
                      stroke="#6B7280"
                      strokeWidth="1.33333"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M5.33331 1.33337V4.00004"
                      stroke="#6B7280"
                      strokeWidth="1.33333"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M10.6666 1.33337V4.00004"
                      stroke="#6B7280"
                      strokeWidth="1.33333"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M1.33331 6.66675H14.6666"
                      stroke="#6B7280"
                      strokeWidth="1.33333"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <label
                htmlFor="gender"
                className="block text-sm font-medium text-gray-700"
              >
                Gender (Optional)
              </label>
              <div className="relative">
                <button
                  type="button"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-left flex justify-between items-center focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  onClick={() => setGenderOpen(!genderOpen)}
                >
                  <span
                    className={
                      formData.gender ? "text-gray-900" : "text-gray-400"
                    }
                  >
                    {formData.gender || "Select gender"}
                  </span>
                  <ChevronDown className="h-4 w-4 text-gray-500" />
                </button>

                {genderOpen && (
                  <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md border border-gray-200 py-1">
                    {["Male", "Female", "Non-binary", "Prefer not to say"].map(
                      (option) => (
                        <div
                          key={option}
                          className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-gray-700"
                          onClick={() => handleGenderSelect(option)}
                        >
                          {option}
                        </div>
                      )
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end mt-8 pt-4 bg-white">
          <button
            onClick={onNext}
            className="px-6 py-2 bg-emerald-500 text-white rounded-md hover:bg-emerald-600 transition-colors"
          >
            Next
          </button>
        </div>
      </div>

      {/* Right side - Green panel */}
      <div className="w-[35%] bg-emerald-500"></div>
    </div>
  );
}
