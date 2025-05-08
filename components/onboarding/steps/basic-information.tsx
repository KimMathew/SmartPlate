"use client";

import { useState, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import ProgressIndicator from "../progress-indicator";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
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
  const [dobError, setDobError] = useState("");
  const [calendarOpen, setCalendarOpen] = useState(false);
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

  const handleNext = () => {
    const today = new Date();
    let error = "";

    // Check if dateOfBirth is defined and not empty
    const dobValue = formData.dateOfBirth ? formData.dateOfBirth.trim() : "";

    if (!dobValue) {
      error = "Date of birth is required.";
    } else {
      const dob = parseDate(dobValue);
      if (!dob) {
        error = "Invalid date format.";
      } else {
        // Check if date is in the future
        const dobNoTime = new Date(dob.getFullYear(), dob.getMonth(), dob.getDate());
        const todayNoTime = new Date(today.getFullYear(), today.getMonth(), today.getDate());

        if (dobNoTime >= todayNoTime) {
          error = "Date must be before today.";
        } else {
          // Check if user is at least 13 years old
          const minAgeDate = new Date(todayNoTime);
          minAgeDate.setFullYear(minAgeDate.getFullYear() - 13);

          if (dobNoTime > minAgeDate) {
            error = "You must be at least 13 years old.";
          }
        }
      }
    }

    if (error) {
      setDobError(error);
      return;
    }

    setDobError("");
    onNext();
  };

  // Helper to format date as mm/dd/yyyy
  function formatDate(date: Date | undefined) {
    if (!date) {
      console.log("error on formatDate")
      return "";
    }
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    const yyyy = date.getFullYear();
    return `${yyyy}-${mm}-${dd}`;
  }

  // Parse input value to Date
  function parseDate(value: string): Date | undefined {
    //if (!value || value.trim() === "") return undefined;

    const [yyyy, mm, dd] = value.split("-");
    //if (!yyyy || !mm || !dd) return undefined;

    const date = new Date(Number(yyyy), Number(mm) - 1, Number(dd));
    return isNaN(date.getTime()) ? undefined : date;
  }

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
            <div className="space-y-1">
              <label
                htmlFor="dateOfBirth"
                className="block text-sm font-medium text-gray-700"
              >
                Date of Birth <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                  <PopoverTrigger asChild>
                    <input
                      type="text"
                      id="dateOfBirth"
                      placeholder="mm/dd/yyyy"
                      value={formData.dateOfBirth}
                      readOnly
                      onClick={() => setCalendarOpen(true)}
                      className={`w-full px-3 py-2 border ${dobError ? "border-red-500" : "border-gray-300"
                        } rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-500 pr-10 cursor-pointer`}
                      aria-invalid={dobError ? "true" : undefined}
                      aria-describedby={dobError ? "dob-error" : undefined}
                      autoComplete="off"
                    />
                  </PopoverTrigger>
                  <div
                    className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer z-10"
                    onClick={() => setCalendarOpen((v) => !v)}
                  >
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
                  <PopoverContent align="start" className="p-0 w-auto bg-white">
                    <Calendar
                      mode="single"
                      selected={parseDate(formData.dateOfBirth)}
                      onSelect={(date) => {
                        setCalendarOpen(false);
                        if (date) {
                          onChange("dateOfBirth", formatDate(date));
                          if (dobError) setDobError("");
                        }
                      }}
                      initialFocus
                      fromYear={1900}
                      toYear={new Date().getFullYear()}
                    />
                  </PopoverContent>
                </Popover>
              </div>
              {dobError && (
                <p
                  id="dob-error"
                  className="text-red-500 text-xs mt-1 animate-fade-in"
                >
                  {dobError}
                </p>
              )}
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
          src="/step-1.png"
          alt="Illustration of a calendar and silhouette for personal info"
          className={`max-w-[80%] max-h-[80%] object-contain transition-opacity duration-700 fade-in-illustration${imageVisible ? " opacity-100" : " opacity-0"
            }`}
        />
      </div>
    </div>
  );
}
