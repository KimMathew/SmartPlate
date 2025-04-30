"use client"

import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { ArrowLeft, ArrowRight, Check } from "lucide-react"
import { motion } from "framer-motion"

interface HealthGoalsProps {
  formData: any
  onChange: (field: string, value: string | string[]) => void
  onNext: () => void
  onBack: () => void
  onSkip: () => void
}

export default function HealthGoals({ formData, onChange, onNext, onBack, onSkip }: HealthGoalsProps) {
  return (
    <div className="h-full flex flex-col">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Your Health Goals</h2>
        <p className="text-lg text-gray-600 mb-8">Let us know what you want to achieve with your nutrition plan.</p>
      </motion.div>

      <div className="space-y-8 flex-1">
        <motion.div
          className="space-y-3"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Label htmlFor="goalType" className="text-gray-900 text-base">
            Goal Type
          </Label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[
              { value: "lose-weight", label: "Lose Weight", icon: "⬇️" },
              { value: "maintain", label: "Maintain", icon: "⚖️" },
              { value: "gain-muscle", label: "Gain Muscle", icon: "💪" },
            ].map((option) => (
              <motion.div
                key={option.value}
                onClick={() => onChange("goalType", option.value)}
                className={`px-4 py-6 rounded-lg border cursor-pointer transition-all duration-200 text-center relative
                  ${
                    formData.goalType === option.value
                      ? "border-emerald-500 shadow-md ring-2 ring-emerald-500/20"
                      : "border-gray-300 hover:border-emerald-300 hover:bg-emerald-50/30"
                  }`}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                animate={formData.goalType === option.value ? { y: [0, -5, 0] } : {}}
                transition={{ duration: 0.3 }}
              >
                {formData.goalType === option.value && (
                  <motion.div
                    className="absolute top-0 right-0 w-0 h-0 border-t-[40px] border-r-[40px] border-t-emerald-500 border-r-transparent"
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Check className="absolute -top-[30px] right-[-30px] h-4 w-4 text-white" />
                  </motion.div>
                )}
                <motion.div
                  className="text-3xl mb-2"
                  animate={formData.goalType === option.value ? { scale: [1, 1.2, 1] } : {}}
                  transition={{ duration: 0.4 }}
                >
                  {option.icon}
                </motion.div>
                <div
                  className={`font-medium ${formData.goalType === option.value ? "text-emerald-700" : "text-gray-700"}`}
                >
                  {option.label}
                </div>
                {formData.goalType === option.value && (
                  <motion.div
                    className="absolute inset-0 bg-emerald-500/5 rounded-lg pointer-events-none"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  />
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div
          className="space-y-3"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Label htmlFor="weeklyGoal" className="text-gray-900 text-base">
            Weekly Goal (Optional)
          </Label>
          <div className="relative">
            <input
              type="text"
              id="weeklyGoal"
              placeholder="e.g., Lose 0.5kg/week"
              value={formData.weeklyGoal}
              onChange={(e) => onChange("weeklyGoal", e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-gray-900 bg-white shadow-sm transition-all duration-200"
            />
          </div>
          <p className="text-sm text-gray-500">A healthy goal is 0.5-1kg (1-2lbs) per week for weight loss.</p>
        </motion.div>

        <motion.div
          className="space-y-3"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Label htmlFor="targetWeight" className="text-gray-900 text-base">
            Target Weight (Optional)
          </Label>
          <div className="relative">
            <input
              type="text"
              id="targetWeight"
              placeholder="e.g., 65 kg or 143 lbs"
              value={formData.targetWeight}
              onChange={(e) => onChange("targetWeight", e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-gray-900 bg-white shadow-sm transition-all duration-200"
            />
          </div>
          <p className="text-sm text-gray-500">Your long-term weight goal helps us plan your nutrition journey.</p>
        </motion.div>
      </div>

      <motion.div
        className="flex justify-between mt-8 pt-4 border-t border-gray-100"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <div className="flex gap-3">
          <Button variant="outline" onClick={onBack} className="border-gray-300 text-gray-700 hover:bg-gray-50">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>

          <Button variant="ghost" onClick={onSkip} className="text-gray-600 hover:text-gray-900">
            Skip
          </Button>
        </div>

        <Button
          onClick={onNext}
          className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
        >
          Continue
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </motion.div>
    </div>
  )
}
