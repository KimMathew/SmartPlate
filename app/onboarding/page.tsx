"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import OnboardingLayout from "@/components/onboarding/onboarding-layout";
import BasicInformation from "@/components/onboarding/steps/basic-information";
import PhysicalData from "@/components/onboarding/steps/physical-data";
import HealthGoals from "@/components/onboarding/steps/health-goals";
import DietaryPreferences from "@/components/onboarding/steps/dietary-preferences";
import CompletionStep from "@/components/onboarding/steps/completion-step";
import { createClient } from "@/lib/supabase"
import { useSearchParams } from 'next/navigation';

type OnboardingStep = 1 | 2 | 3 | 4 | 5;

export default function OnboardingPage() {
  const router = useRouter();
  const supabase = createClient();
  const searchParams = useSearchParams();
  const userId = searchParams.get('userId');
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
    firstName: "User",
    lastName: "",
    email: "",
  });

  const [currentStep, setCurrentStep] = useState<OnboardingStep>(1);


  const handleInputChange = (field: string, value: string | string[]) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const nextStep = () => {
    setCurrentStep((prev) => {
      if (prev < 5) {
        return (prev + 1) as OnboardingStep;
      }
      return prev;
    });
    window.scrollTo(0, 0);
  };

  const prevStep = () => {
    setCurrentStep((prev) => {
      if (prev > 1) {
        return (prev - 1) as OnboardingStep;
      }
      return prev;
    });
    window.scrollTo(0, 0);
  };

  const skipStep = () => {
    nextStep();
  };

  const handleFinish = async () => {

    const { data, error } = await supabase
      .from('Users')
      .update({
        'birth-date': formData.dateOfBirth,
        'gender': formData.gender,
        'height': formData.height,
        'weight': formData.weight,
        'activity_level': formData.activityLevel,
        'goal_type': formData.goalType,
        'target_weight': formData.targetWeight,
        'diet_type': formData.dietType,
        'allergens': formData.allergens,
        'disliked_ingredients': formData.dislikedIngredients,
        'preferred_cuisines': formData.preferredCuisines,
        'meals_per_day': formData.mealsPerDay,
        'prep_time_limit': formData.mealPrepTimeLimit,

      })
      .eq('id', userId)

    const { data: userData, error: fetchError } = await supabase
      .from('Users')
      .select("*")
      .eq('id', userId)
      .single()

    console.log("alldata: ", userData);

    console.log("id: ", userId);
    console.log("data: ", data);
    console.log("dbay:", formData.dateOfBirth);
    console.log("error:", error);

    if (!data || error) {
    }


    // Here you would typically send the data to your backend
    console.log("Onboarding completed with data:", formData);
    setCurrentStep(5);
  };

  const goToDashboard = () => {
    router.push("/meal-plans");
  };

  // Render different step components based on currentStep
  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <BasicInformation
            formData={formData}
            onChange={handleInputChange}
            onNext={nextStep}
            onSkip={skipStep}
          />
        );
      case 2:
        return (
          <PhysicalData
            formData={formData}
            onChange={handleInputChange}
            onNext={nextStep}
            onBack={prevStep}
            onSkip={skipStep}
          />
        );
      case 3:
        return (
          <HealthGoals
            formData={formData}
            onChange={handleInputChange}
            onNext={nextStep}
            onBack={prevStep}
            onSkip={skipStep}
          />
        );
      case 4:
        return (
          <DietaryPreferences
            formData={formData}
            onChange={handleInputChange}
            onFinish={handleFinish}
            onBack={prevStep}
            onSkip={skipStep}
          />
        );
      case 5:
        return (
          <CompletionStep
            firstName={formData.firstName}
            onContinue={goToDashboard}
          />
        );
      default:
        return null;
    }
  };

  return (
    <OnboardingLayout currentStep={currentStep} totalSteps={4}>
      {renderStep()}
    </OnboardingLayout>
  );
}
