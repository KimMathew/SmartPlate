"use client";

import { createContext, useContext, useState, ReactNode } from "react";

// Define the shape of the context
interface UserChoiceContextType {
  selectedDays: number | null;
  setSelectedDays: (days: number) => void;
}

// Create the context
const UserChoiceContext = createContext<UserChoiceContextType | undefined>(undefined);

// Create a provider component
export const UserChoiceProvider = ({ children }: { children: ReactNode }) => {
  const [selectedDays, setSelectedDays] = useState<number | null>(null);

  return (
    <UserChoiceContext.Provider value={{ selectedDays, setSelectedDays }}>
      {children}
    </UserChoiceContext.Provider>
  );
};

// Custom hook for using the context
export const useUserChoice = () => {
  const context = useContext(UserChoiceContext);
  if (context === undefined) {
    throw new Error("useUserChoice must be used within a UserChoiceProvider");
  }
  return context;
};
