"use client";

import { useState, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import ProgressIndicator from "@/app/onboarding/components/progress-indicator";
import DropdownInput from "@/components/ui/dropdown-input";
import { Button } from "@/components/ui/button";

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
  const [ageError, setAgeError] = useState("");
  const [imageVisible, setImageVisible] = useState(false);

  useEffect(() => {
    setCurrentStep(0); // step 1
    setSegmentProgress([0, 0, 0, 0]);
    setTimeout(() => {
      setSegmentProgress([100, 0, 0, 0]);
    }, 100);
    setTimeout(() => setImageVisible(true), 200); // trigger fade-in
  }, []);

  const handleGenderSelect = (gender: string) => {
    onChange("gender", gender);
    setGenderOpen(false);
  };

  const handleAgeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    onChange("age", value);
    
    // Clear error when user starts typing
    if (ageError) {
      setAgeError("");
    }
  };

  const handleNext = () => {
    let error = "";

    // Check if age is defined and not empty
    const ageValue = formData.age ? formData.age.trim() : "";

    if (!ageValue) {
      error = "Age is required.";
    } else {
      // Check for non-numeric input
      if (!/^\d+$/.test(ageValue)) {
        error = "Please enter a valid number.";
      } else {
        const age = parseInt(ageValue, 10);
        
        // Check minimum age (13 years)
        if (age < 13) {
          error = "You must be at least 13 years old.";
        } 
        // Check maximum reasonable age (120 years)
        else if (age > 120) {
          error = "Please enter a realistic age (maximum 120 years).";
        }
      }
    }

    if (error) {
      setAgeError(error);
      return;
    }

    setAgeError("");
    onNext();
  };

  return (
    <div className="flex h-full w-full">
      <div className="w-full md:w-[65%] p-10 flex flex-col justify-center h-full overflow-auto">
        {/* Progress indicator */}
        <div className="mb-10 pt-2 flex justify-center bg-white">
          <ProgressIndicator currentStep={0} />
        </div>
        {/* Form content */}
        <div className="flex-1 flex flex-col justify-center min-h-min">
          <h2 className="text-2xl font-bold text-gray-900 mb-2 max-sm:text-xl">
            Let's Get to Know You!
          </h2>
          <p className="text-gray-600 mb-8">
            Share a few details to start your personalized meal planning
            journey.
          </p>

          <div className="space-y-6">
            <div className="space-y-2">
              <label
                htmlFor="age"
                className="input-label"
              >
                Age <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="age"
                placeholder="Enter your age"
                value={formData.age || ""}
                onChange={handleAgeChange}
                className={`w-full px-3 py-2 border ${
                  ageError ? "border-red-500" : "border-gray-300"
                } rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-500`}
                aria-invalid={ageError ? "true" : undefined}
                aria-describedby={ageError ? "age-error" : undefined}
                autoComplete="off"
              />
              {ageError && (
                <p
                  id="age-error"
                  className="text-red-500 text-xs mt-1 animate-fade-in"
                >
                  {ageError}
                </p>
              )}
            </div>

            <DropdownInput
              label="Gender (Optional)"
              options={[
                { value: "Male", label: "Male" },
                { value: "Female", label: "Female" },
                { value: "Non-binary", label: "Non-binary" },
                { value: "Prefer not to say", label: "Prefer not to say" },
              ]}
              value={formData.gender}
              onChange={val => onChange("gender", val)}
              placeholder="Select gender"
            />
          </div>
        </div>

        <div className="flex justify-end mt-8 pt-4 bg-white">
          <Button
            onClick={handleNext}
            size="lg"
            className="px-6 py-2 text-base"
          >
            Next
          </Button>
        </div>
      </div>

      {/* Right side - Green panel, hidden on small screens */}
      <div className="hidden md:flex w-[35%] bg-emerald-500 h-full items-center justify-center">
        <img
          src="/images/step-1.png"
          alt="Illustration of a calendar and silhouette for personal info"
          className={`max-w-[80%] max-h-[80%] object-contain transition-opacity duration-700 fade-in-illustration${imageVisible ? " opacity-100" : " opacity-0"
            }`}
        />
      </div>
    </div>
  );
}
