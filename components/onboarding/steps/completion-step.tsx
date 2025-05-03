"use client";

import { Check, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

interface CompletionStepProps {
  firstName: string;
  onContinue: () => void;
}

export default function CompletionStep({
  firstName,
  onContinue,
}: CompletionStepProps) {
  return (
    <div className="h-full flex flex-col items-center justify-center text-center p-6 rounded-xl bg-white shadow-lg">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
        className="w-32 h-32 rounded-full bg-emerald-100 flex items-center justify-center mb-[40px]"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{
            delay: 0.3,
            type: "spring",
            stiffness: 200,
            damping: 20,
          }}
          className="w-24 h-24 rounded-full bg-emerald-500 flex items-center justify-center"
        >
          <Check className="w-16 h-16 text-white" />
        </motion.div>
      </motion.div>

      <motion.h2
        className="text-4xl font-bold text-gray-900 mb-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        Welcome, {firstName}!
      </motion.h2>

      <motion.p
        className="text-xl text-gray-600 mb-8 max-w-[580px]"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        Your profile has been created successfully. Your personalized meal plan
        is ready for you!
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
      >
        <Button
          onClick={onContinue}
          className="px-8 py-6 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-medium text-lg transition-all duration-200"
        >
          Go to Meal Plan
        </Button>
      </motion.div>
    </div>
  );
}
