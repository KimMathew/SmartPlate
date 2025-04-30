"use client"

import { Check, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"

interface CompletionStepProps {
  firstName: string
  onContinue: () => void
}

export default function CompletionStep({ firstName, onContinue }: CompletionStepProps) {
  return (
    <div className="h-full flex flex-col items-center justify-center text-center py-12">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
        className="w-24 h-24 rounded-full bg-emerald-100 flex items-center justify-center mb-8"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3, type: "spring", stiffness: 200, damping: 20 }}
          className="w-16 h-16 rounded-full bg-emerald-500 flex items-center justify-center"
        >
          <Check className="w-10 h-10 text-white" />
        </motion.div>
      </motion.div>

      <motion.h2
        className="text-3xl font-bold text-gray-900 mb-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        Welcome, {firstName}!
      </motion.h2>

      <motion.p
        className="text-xl text-gray-700 mb-8 max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        Your profile has been created successfully. Your personalized meal plan is ready for you!
      </motion.p>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9 }}>
        <Button
          onClick={onContinue}
          className="px-8 py-6 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-medium text-lg shadow-lg hover:shadow-xl transition-all duration-200"
        >
          Go to Dashboard
          <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
      </motion.div>
    </div>
  )
}
