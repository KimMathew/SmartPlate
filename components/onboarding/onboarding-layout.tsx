"use client";

import type React from "react";
import { motion } from "framer-motion";

interface OnboardingLayoutProps {
  children: React.ReactNode;
  currentStep: number;
  totalSteps: number;
}

export default function OnboardingLayout({ children }: OnboardingLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <motion.div
        className="bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden w-full max-w-4xl"
        style={{ height: "560px" }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="h-full overflow-y-auto">{children}</div>
      </motion.div>
    </div>
  );
}
