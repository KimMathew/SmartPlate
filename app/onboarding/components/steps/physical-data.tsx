"use client";
import { useState, useEffect } from "react";
import ProgressIndicator from "@/app/onboarding/components/progress-indicator";
import { Button } from "@/components/ui/button";
import CardSelect from "@/components/ui/card-select";

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
  const [imageVisible, setImageVisible] = useState(false);

  useEffect(() => {
    setCurrentStep(1); // step 2
    setSegmentProgress([100, 0, 0, 0]);
    setTimeout(() => {
      setSegmentProgress([100, 100, 0, 0]);
    }, 100);
    setTimeout(() => setImageVisible(true), 200); // trigger fade-in
  }, []);

  // Validation state
  const [errors, setErrors] = useState<{
    height?: string;
    weight?: string;
    activityLevel?: string;
  }>({});

  // Validation logic
  const validate = () => {
    const newErrors: {
      height?: string;
      weight?: string;
      activityLevel?: string;
    } = {};
    const numberRegex = /^\d+(\.\d+)?$/;
    if (!formData.height || !numberRegex.test(formData.height)) {
      newErrors.height = "Height is required and must be a valid number.";
    } else {
      const height = parseFloat(formData.height);
      if (height < 50 || height > 250) {
        newErrors.height = "Height should be between 50 and 250 cm.";
      }
    }
    if (!formData.weight || !numberRegex.test(formData.weight)) {
      newErrors.weight = "Weight is required and must be a valid number.";
    } else {
      const weight = parseFloat(formData.weight);
      if (weight < 20 || weight > 300) {
        newErrors.weight = "Weight should be between 20 and 300 kg.";
      }
    }
    if (!formData.activityLevel) {
      newErrors.activityLevel = "Please select your activity level.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validate()) {
      onNext();
    }
  };

  return (
    <div className="flex h-full w-full">
      <div className="w-full md:w-[65%] p-10 flex flex-col h-full overflow-auto">
        {/* Progress indicator */}
        <div className="mb-10 pt-2 flex justify-center bg-white">
          <ProgressIndicator currentStep={1} />
        </div>
        <div className="flex-1 min-h-min ">
          <h2 className="text-2xl font-bold text-gray-900 mb-2 max-sm:text-xl">
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
                Height (in cm) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="height"
                placeholder="e.g., 170"
                value={formData.height}
                onChange={(e) => {
                  onChange("height", e.target.value);
                  setErrors((prev) => ({ ...prev, height: undefined }));
                }}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-500 ${
                  errors.height ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.height && (
                <p className="text-red-500 text-xs mt-1">{errors.height}</p>
              )}
            </div>

            <div className="space-y-1">
              <label
                htmlFor="weight"
                className="block text-sm font-medium text-gray-700"
              >
                Weight (in kg) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="weight"
                placeholder="e.g., 70"
                value={formData.weight}
                onChange={(e) => {
                  onChange("weight", e.target.value);
                  setErrors((prev) => ({ ...prev, weight: undefined }));
                }}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-500 ${
                  errors.weight ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.weight && (
                <p className="text-red-500 text-xs mt-1">{errors.weight}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Activity <span className="text-red-500">*</span>
              </label>
              <CardSelect
                options={activityLevels.map((level) => ({
                  value: level.value,
                  label: level.label,
                  description: level.description,
                }))}
                value={formData.activityLevel}
                onChange={(val) => {
                  onChange("activityLevel", val);
                  setErrors((prev) => ({ ...prev, activityLevel: undefined }));
                }}
                columns={2}
                align="left"
                renderDescription={(option) =>
                  option.description ? (
                    <div className={`text-sm ${formData.activityLevel === option.value ? "text-emerald-600" : "text-gray-500"}`}>{option.description}</div>
                  ) : null
                }
              />
              {errors.activityLevel && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.activityLevel}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-between mt-10 mb-0">
          <Button
            onClick={onBack}
            variant="ghost"
            className="font-medium"
          >
            Back
          </Button>
          <Button
            onClick={handleNext}
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
          src="/step-2.png"
          alt="Illustration of a measuring tape for body stats"
          className={`max-w-[80%] max-h-[80%] object-contain transition-opacity duration-700 fade-in-illustration${
            imageVisible ? " opacity-100" : " opacity-0"
          }`}
        />
      </div>
    </div>
  );
}
