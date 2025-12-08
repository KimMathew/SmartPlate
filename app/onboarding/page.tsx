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
      console.error("No signup data found.");
      return;
    }
    const email = fetchData.email;
    const password = fetchData.password;
    const firstName = fetchData.firstName;
    const lastname = fetchData.lastName;

    console.log("firstname is: ", firstName);
    console.log("lastname is: ", lastname);

    // Check if user is already authenticated (they should be after email confirmation)
    const { data: sessionData } = await supabase.auth.getSession();
    let userId = sessionData?.session?.user?.id;

    // If no active session, try to sign up (for new users) or sign in
    if (!userId) {
      const { data: userData, error: userError } = await supabase.auth.signUp({
        email,
        password,
      });
      
      if (userData && userData.user) {
        console.log("User id is:", userData.user.id);
        userId = userData.user.id;
      } else {
        console.error("User creation failed:", userError);
        // If signUp fails, try signIn (user might already exist)
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        if (signInData?.user) {
          userId = signInData.user.id;
        } else {
          console.error("Sign in also failed:", signInError);
          return;
        }
      }
    }

    if (!userId) {
      console.error("Could not get user ID");
      return;
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
    
    // Check if user already exists in Users table
    const { data: existingUser, error: checkError } = await supabase
      .from("Users")
      .select("id")
      .eq("id", userId)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      console.error("Error checking user existence:", checkError);
    }

    const userProfileData = {
      'id': userId,
      'first_name': firstName,
      'last_name': lastname,
      'email': email,
      "birth-date": formData.dateOfBirth || null,
      'gender': formData.gender || null,
      'height': formData.height ? Number(formData.height) : null,
      'weight': formData.weight ? Number(formData.weight) : null,
      'activity_level': formData.activityLevel || null,
      'goal_type': formData.goalType || null,
      'target_weight': formData.targetWeight ? Number(formData.targetWeight) : null,
      'diet_type': (formData.dietType === "other" && formData.dietTypeOther) ? formData.dietTypeOther : formData.dietType || null,
      'allergens': allergens.length > 0 ? allergens : null,
      'disliked_ingredients': formData.dislikedIngredients.length > 0 ? formData.dislikedIngredients : null,
      'preferred_cuisines': preferredCuisines.length > 0 ? preferredCuisines : null,
      'meals_perday': formData.mealsPerDay.length > 0 ? formData.mealsPerDay : null,
      'prep_time_limit': formData.mealPrepTimeLimit || null,
    };

    let data, error;
    
    if (existingUser) {
      // User exists, update their profile
      const result = await supabase
        .from("Users")
        .update(userProfileData)
        .eq("id", userId);
      data = result.data;
      error = result.error;
    } else {
      // User doesn't exist, insert new profile
      const result = await supabase
        .from("Users")
        .insert(userProfileData);
      data = result.data;
      error = result.error;
    }

    console.log("data: ", data);
    console.log("dbay:", formData.dateOfBirth);
    console.log("error:", error);

    if (error) {
      console.error("Error saving user profile:", error);
      // Optionally show an error message to the user
    }

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
