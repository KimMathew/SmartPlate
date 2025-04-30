"use client"

import { useState } from "react"
import { Check } from "lucide-react"
import BasicInformation from "./steps/basic-information"
import PhysicalData from "./steps/physical-data"
import HealthGoals from "./steps/health-goals"
import DietaryPreferences from "./steps/dietary-preferences"
import ProgressIndicator from "./progress-indicator"
import FruitBowlGraphic from "./fruit-bowl-graphic"

type OnboardingStep = 1 | 2 | 3 | 4 | 5

interface OnboardingWizardProps {
  isOpen: boolean
  onClose: () => void
  userData?: {
    firstName: string
    lastName: string
    email: string
  }
}

export default function OnboardingWizard({ isOpen, onClose, userData }: OnboardingWizardProps) {
  const [currentStep, setCurrentStep] = useState<OnboardingStep>(1)
  const [formData, setFormData] = useState({
    // Basic Information
    dateOfBirth: "",
    gender: "",

    // Physical Data
    height: "",
    weight: "",
    activityLevel: "",

    // Health Goals
    goalType: "",
    weeklyGoal: "",
    targetWeight: "",

    // Dietary Preferences
    dietType: "",
    allergens: [] as string[],
    dislikedIngredients: [] as string[],
    preferredCuisines: [] as string[],
    mealsPerDay: "",
    mealPrepTimeLimit: "",

    // User data from signup
    firstName: userData?.firstName || "",
    lastName: userData?.lastName || "",
    email: userData?.email || "",
  })

  if (!isOpen) return null

  const handleInputChange = (field: string, value: string | string[]) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const nextStep = () => {
    if (currentStep < 5) {
      setCurrentStep((prev) => (prev + 1) as OnboardingStep)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as OnboardingStep)
    }
  }

  const skipStep = () => {
    nextStep()
  }

  const handleFinish = () => {
    // Here you would typically send the data to your backend
    console.log("Onboarding completed with data:", formData)

    // Redirect to dashboard
    setCurrentStep(5)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div
        className="relative w-full max-w-4xl bg-white rounded-xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Progress indicator */}
        <ProgressIndicator currentStep={currentStep} totalSteps={4} />

        <div className="flex flex-col md:flex-row min-h-[600px]">
          {/* Left side - Graphic */}
          <div className="w-full md:w-2/5 bg-[#E8F5E9] p-8 flex items-center justify-center relative overflow-hidden">
            <FruitBowlGraphic />
            <div className="absolute inset-0 bg-gradient-to-br from-[#E8F5E9]/80 to-[#E8F5E9]/95 z-10"></div>
            <div className="relative z-20 text-center">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Welcome to NutriPlan</h2>
              <p className="text-gray-600">
                Let's personalize your experience to help you achieve your health and nutrition goals.
              </p>
            </div>
          </div>

          {/* Right side - Form */}
          <div className="w-full md:w-3/5 p-8">
            {currentStep === 1 && (
              <BasicInformation formData={formData} onChange={handleInputChange} onNext={nextStep} onSkip={skipStep} />
            )}

            {currentStep === 2 && (
              <PhysicalData
                formData={formData}
                onChange={handleInputChange}
                onNext={nextStep}
                onBack={prevStep}
                onSkip={skipStep}
              />
            )}

            {currentStep === 3 && (
              <HealthGoals
                formData={formData}
                onChange={handleInputChange}
                onNext={nextStep}
                onBack={prevStep}
                onSkip={skipStep}
              />
            )}

            {currentStep === 4 && (
              <DietaryPreferences
                formData={formData}
                onChange={handleInputChange}
                onFinish={handleFinish}
                onBack={prevStep}
                onSkip={skipStep}
              />
            )}

            {currentStep === 5 && (
              <div className="h-full flex flex-col items-center justify-center text-center">
                <div className="w-20 h-20 rounded-full bg-[#28A745]/20 flex items-center justify-center mb-6">
                  <Check className="w-10 h-10 text-[#28A745]" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Welcome, {formData.firstName}!</h2>
                <p className="text-gray-600 mb-8">
                  Your profile has been created successfully. Here's your first meal plan.
                </p>
                <button
                  onClick={onClose}
                  className="px-6 py-3 bg-[#28A745] text-white rounded-lg font-medium hover:bg-[#28A745]/90 transition-colors"
                >
                  Go to Dashboard
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
