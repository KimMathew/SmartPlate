"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import OnboardingLayout from "@/app/onboarding/components/onboarding-layout";
import BasicInformation from "@/app/onboarding/components/steps/basic-information";
import PhysicalData from "@/app/onboarding/components/steps/physical-data";
import HealthGoals from "@/app/onboarding/components/steps/health-goals";
import DietaryPreferences from "@/app/onboarding/components/steps/dietary-preferences";
import CompletionStep from "@/app/onboarding/components/steps/completion-step";
import { createClient } from "@/lib/supabase";
import { useSearchParams } from "next/navigation";
import Forbidden from "@/components/ui/forbidden";

type OnboardingStep = 1 | 2 | 3 | 4 | 5;

export default function OnboardingPage() {
  const router = useRouter();
  const supabase = createClient();

  const [fetchData, setFetchData] = useState<{
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  } | null>(null);
  const [forbidden, setForbidden] = useState(false);

  useEffect(() => {
    //1. Check sessionStorage for signup data
    const storedData = sessionStorage.getItem("tempSignupData");

    // 2. If no data exists, show forbidden
    if (!storedData) {
      setForbidden(true);
      return;
    }

    // 3. Parse and set the user data
    const parsed = JSON.parse(storedData);
    setUserData(parsed);
    // Update formData with firstName, lastName, email from signup
    setFormData((prev) => ({
      ...prev,
      firstName: parsed.firstName || "User",
      lastName: parsed.lastName || "",
      email: parsed.email || "",

    // //BYPASS ONBOARDING FOR DEBUGGING
    // setUserData({
    //   firstName: "Debug",
    //   lastName: "User",
    //   email: "debug@example.com",
    //   password: "password123"
    // });
    // setFormData((prev) => ({
    //   ...prev,
    //   firstName: "Debug",
    //   lastName: "User",
    //   email: "debug@example.com"
    }));
  }, [router]);

  const [userData, setUserData] = useState<{
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  } | null>(null);

  const [formData, setFormData] = useState({
    // Basic Information
    dateOfBirth: "",
    gender: null,

    // Physical Data
    height: "",
    weight: "",
    activityLevel: "",

    // Health Goals
    goalType: "",
    weeklyGoal: "",
    targetWeight: null,

    // Dietary Preferences
    dietType: "",
    dietTypeOther: "", // Added field for custom diet type
    allergens: [] as string[],
    allergenOther: "", // Added for custom allergen(s)
    dislikedIngredients: [] as string[],
    preferredCuisines: [] as string[],
    cuisineOther: "", // Added for custom cuisine(s)
    mealsPerDay: [] as string[],
    mealPrepTimeLimit: "",

    // User data from signup
    firstName: "User",
    lastName: "",
    email: "",
  });

  const retrieveTempSignupData = () => {
    // Check if window is defined (client-side)
    console.log("GETTING:", sessionStorage.getItem("tempSignupData"));
    if (typeof window !== "undefined") {
      const storedData = sessionStorage.getItem("tempSignupData");
      return storedData ? JSON.parse(storedData) : null;
    } else {
      console.log("undefined");
    }
    return null;
  };

  useEffect(() => {
    const data = retrieveTempSignupData();
    console.log("data: ", data);
    if (data) {
      setFetchData(data);
    }

    console.log(fetchData);
  }, []);

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
    if (!fetchData) {
      // Optionally show an error or return early
      console.error("No signup data found.");
      return;
    }
    const email = fetchData.email;
    const password = fetchData.password;
    const firstName = fetchData.firstName;
    const lastname = fetchData.lastName;

    console.log("firstname is: ", firstName);
    console.log("lastname is: ", lastname);

    const { data: userData, error: userError } = await supabase.auth.signUp({
      email,
      password,
    });
    if (userData && userData.user) {
      console.log("User id is:", userData.user.id);
    } else {
      console.log(
        "User creation failed or user is undefined:",
        userData,
        userError
      );
    }

    // Prepare allergens and cuisines for DB: replace 'other' with custom values if present
    let allergens = formData.allergens;
    if (Array.isArray(allergens) && allergens.includes("other") && formData.allergenOther) {
      const customAllergens = typeof formData.allergenOther === "string"
        ? formData.allergenOther.split(",").map(s => s.trim()).filter(Boolean)
        : formData.allergenOther;
      allergens = [
        ...allergens.filter(a => a !== "other"),
        ...customAllergens
      ];
    }
    let preferredCuisines = formData.preferredCuisines;
    if (Array.isArray(preferredCuisines) && preferredCuisines.includes("other") && formData.cuisineOther) {
      const customCuisines = Array.isArray(formData.cuisineOther)
        ? formData.cuisineOther
        : String(formData.cuisineOther).split(",").map(s => s.trim()).filter(Boolean);
      preferredCuisines = [
        ...preferredCuisines.filter(c => c !== "other"),
        ...customCuisines
      ];
    }
    const { data, error } = await supabase
      .from("Users")
      .insert({
        'id': userData.user?.id,
        'first_name': firstName,
        'last_name': lastname,
        'email': email,
        "birth-date": formData.dateOfBirth,
        'gender': formData.gender,
        'height': formData.height,
        'weight': formData.weight,
        'activity_level': formData.activityLevel,
        'goal_type': formData.goalType,
        'target_weight': formData.targetWeight,
        'diet_type': (formData.dietType === "other" && formData.dietTypeOther) ? formData.dietTypeOther : formData.dietType,
        'allergens': allergens,
        'disliked_ingredients': formData.dislikedIngredients,
        'preferred_cuisines': preferredCuisines,
        'meals_perday': formData.mealsPerDay,
        'prep_time_limit': formData.mealPrepTimeLimit,
      })
      .eq("id", userData.user?.id);

    console.log("data: ", data);
    console.log("dbay:", formData.dateOfBirth);
    console.log("error:", error);

    // Here you would typically send the data to your backend
    console.log("Onboarding completed with data:", formData);
    setCurrentStep(5);
  };

  const goToDashboard = () => {
    router.push("/");
  };

  if (forbidden) {
    return (
      <Forbidden
        message="Access Forbidden: Please sign up first to access onboarding."
        actionHref="/"
        actionText="Go to Landing Page"
      />
    );
  }

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
            email={formData.email}
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
