"use client"

import { motion } from "framer-motion"

interface ProgressIndicatorProps {
  currentStep: number
  totalSteps: number
}

export default function ProgressIndicator({ currentStep, totalSteps }: ProgressIndicatorProps) {
  const steps = [
    { name: "Basic Info", description: "Personal details" },
    { name: "Physical Data", description: "Height & weight" },
    { name: "Health Goals", description: "What you want to achieve" },
    { name: "Food Preferences", description: "Dietary needs & likes" },
  ]

  return (
    <div className="bg-white/80 backdrop-blur-sm py-6 sticky top-0 z-20 border-b border-gray-100 shadow-sm">
      <div className="container mx-auto max-w-4xl px-4">
        {/* Desktop progress indicator */}
        <div className="hidden md:block">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={index} className="flex flex-col items-center relative">
                {/* Connector line */}
                {index > 0 && (
                  <div className="absolute h-[2px] bg-gray-200 w-full -left-1/2 top-4 -z-10">
                    <div
                      className="h-full bg-emerald-500 transition-all duration-500 ease-out"
                      style={{
                        width: currentStep > index ? "100%" : currentStep === index ? "50%" : "0%",
                      }}
                    ></div>
                  </div>
                )}

                {/* Step circle */}
                <motion.div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium mb-2
                    ${
                      index + 1 === currentStep
                        ? "bg-emerald-500 text-white ring-4 ring-emerald-100"
                        : index + 1 < currentStep
                          ? "bg-emerald-500 text-white"
                          : "bg-gray-200 text-gray-500"
                    }`}
                  initial={false}
                  animate={index + 1 === currentStep ? { scale: [1, 1.1, 1] } : {}}
                  transition={{ duration: 0.5 }}
                >
                  {index + 1 < currentStep ? (
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ) : (
                    index + 1
                  )}
                </motion.div>

                {/* Step name and description */}
                <div className="text-center">
                  <p
                    className={`text-sm font-medium ${index + 1 === currentStep ? "text-emerald-600" : "text-gray-700"}`}
                  >
                    {step.name}
                  </p>
                  <p className="text-xs text-gray-500 hidden lg:block">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Mobile progress indicator */}
        <div className="md:hidden">
          <div className="flex items-center justify-between mb-2">
            {steps.map((step, index) => (
              <div
                key={index}
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium
                  ${
                    index + 1 === currentStep
                      ? "bg-emerald-500 text-white"
                      : index + 1 < currentStep
                        ? "bg-emerald-500 text-white"
                        : "bg-gray-200 text-gray-500"
                  }`}
              >
                {index + 1 < currentStep ? (
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : (
                  index + 1
                )}
              </div>
            ))}
          </div>
          <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 transition-all duration-500 ease-out"
              style={{ width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%` }}
            ></div>
          </div>
          <p className="text-sm font-medium text-emerald-600 mt-2">
            {steps[currentStep - 1]?.name}: {steps[currentStep - 1]?.description}
          </p>
        </div>
      </div>
    </div>
  )
}
