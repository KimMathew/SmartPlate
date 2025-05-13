"use client";

import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import ProgressIndicator from "@/app/onboarding/components/progress-indicator";
import CardSelect from "@/components/ui/card-select";

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
          <h2 className="text-2xl font-bold text-gray-900 mb-2 max-sm:text-xl">
            Your Health Goals
          </h2>
          <p className="text-gray-600 mb-8">
            Let us know what you want to achieve with your nutrition plan.
          </p>

          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="goalType" className="input-label">
                Goal Type <span className="text-red-500">*</span>
              </Label>
              <CardSelect
                options={[
                  { value: "lose-weight", label: "Lose Weight", icon: "⬇️" },
                  { value: "maintain", label: "Maintain", icon: "⚖️" },
                  { value: "gain-weight", label: "Gain Weight", icon: "⬆️" },
                ]}
                value={formData.goalType}
                onChange={(val) => onChange("goalType", val)}
                columns={3}
                align="center"
              />
              {error && <p className="text-red-500 text-xs mt-2">{error}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="targetWeight" className="input-label">
                Target Weight (in kg)
              </Label>
              {/* Removed optional label */}
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
            className="px-6 py-2 text-base"
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
            className="px-6 py-2 text-base"
          >
            Next
          </Button>
        </div>
      </div>

      {/* Right side - Green panel, hidden on small screens */}
      <div className="hidden md:flex w-[35%] bg-emerald-500 h-full items-center justify-center">
        <img
          src="/images/step-3.png"
          alt="Illustration of health goals"
          className={`max-w-[80%] max-h-[80%] object-contain transition-opacity duration-700 fade-in-illustration${
            imageVisible ? " opacity-100" : " opacity-0"
          }`}
        />
      </div>
    </div>
  );
}
