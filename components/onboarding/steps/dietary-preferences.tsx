"use client"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Check } from "lucide-react"
import { motion } from "framer-motion"

interface DietaryPreferencesProps {
  formData: any
  onChange: (field: string, value: string | string[]) => void
  onFinish: () => void
  onBack: () => void
  onSkip: () => void
}

export default function DietaryPreferences({ formData, onChange, onFinish, onBack, onSkip }: DietaryPreferencesProps) {
  const handleMultiSelect = (field: string, value: string) => {
    const currentValues = formData[field] as string[]
    const newValues = currentValues.includes(value)
      ? currentValues.filter((v) => v !== value)
      : [...currentValues, value]

    onChange(field, newValues)
  }

  return (
    <div className="h-full flex flex-col">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Your Food Preferences</h2>
        <p className="text-lg text-gray-600 mb-8">Help us create the perfect meal plan for you.</p>
      </motion.div>

      <div className="space-y-8 flex-1 overflow-y-auto pr-2">
        <motion.div
          className="space-y-3"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Label htmlFor="dietType" className="text-gray-900 text-base">
            Diet Type
          </Label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {[
              { value: "vegan", label: "Vegan", icon: "🌱" },
              { value: "keto", label: "Keto", icon: "🥑" },
              { value: "mediterranean", label: "Mediterranean", icon: "🫒" },
              { value: "gluten-free", label: "Gluten-Free", icon: "🌾" },
              { value: "none", label: "No Restrictions", icon: "🍽️" },
            ].map((option) => (
              <motion.div
                key={option.value}
                onClick={() => onChange("dietType", option.value)}
                className={`px-4 py-3 rounded-lg border cursor-pointer transition-all duration-200 text-center relative
          ${
            formData.dietType === option.value
              ? "border-emerald-500 shadow-md ring-2 ring-emerald-500/20"
              : "border-gray-300 hover:border-emerald-300 hover:bg-emerald-50/30"
          }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                animate={formData.dietType === option.value ? { y: [0, -5, 0] } : {}}
                transition={{ duration: 0.3 }}
              >
                {formData.dietType === option.value && (
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
                  className="text-xl mb-1"
                  animate={formData.dietType === option.value ? { scale: [1, 1.2, 1] } : {}}
                  transition={{ duration: 0.4 }}
                >
                  {option.icon}
                </motion.div>
                <div
                  className={`font-medium ${formData.dietType === option.value ? "text-emerald-700" : "text-gray-700"}`}
                >
                  {option.label}
                </div>
                {formData.dietType === option.value && (
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
          <Label className="text-gray-900 text-base">Allergens to Avoid</Label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {[
              { value: "gluten", label: "Gluten", icon: "🌾" },
              { value: "dairy", label: "Dairy", icon: "🥛" },
              { value: "nuts", label: "Nuts", icon: "🥜" },
              { value: "shellfish", label: "Shellfish", icon: "🦐" },
              { value: "eggs", label: "Eggs", icon: "🥚" },
              { value: "none", label: "None", icon: "✓" },
            ].map((allergen) => (
              <motion.div
                key={allergen.value}
                onClick={() => handleMultiSelect("allergens", allergen.value)}
                className={`px-4 py-3 rounded-lg border cursor-pointer transition-all duration-200 text-center relative
          ${
            formData.allergens.includes(allergen.value)
              ? "border-emerald-500 shadow-md ring-2 ring-emerald-500/20"
              : "border-gray-300 hover:border-emerald-300 hover:bg-emerald-50/30"
          }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                animate={formData.allergens.includes(allergen.value) ? { y: [0, -3, 0] } : {}}
                transition={{ duration: 0.3 }}
              >
                <motion.div
                  className="text-xl mb-1"
                  animate={formData.allergens.includes(allergen.value) ? { scale: [1, 1.2, 1] } : {}}
                  transition={{ duration: 0.4 }}
                >
                  {allergen.icon}
                </motion.div>
                <div
                  className={`font-medium ${formData.allergens.includes(allergen.value) ? "text-emerald-700" : "text-gray-700"}`}
                >
                  {allergen.label}
                </div>
                {formData.allergens.includes(allergen.value) && (
                  <>
                    <motion.div
                      className="absolute top-2 right-2 h-5 w-5 bg-emerald-500 rounded-full flex items-center justify-center"
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Check className="h-3 w-3 text-white" />
                    </motion.div>
                    <motion.div
                      className="absolute inset-0 bg-emerald-500/5 rounded-lg pointer-events-none"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    />
                  </>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div
          className="space-y-3"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Label htmlFor="dislikedIngredients" className="text-gray-900 text-base">
            Disliked Ingredients
          </Label>
          <div className="relative">
            <input
              type="text"
              id="dislikedIngredients"
              placeholder="e.g., Mushrooms, Olives"
              value={formData.dislikedIngredients.join(", ")}
              onChange={(e) => onChange("dislikedIngredients", e.target.value.split(", "))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-gray-900 bg-white shadow-sm transition-all duration-200"
            />
          </div>
          <p className="text-sm text-gray-500">Separate ingredients with commas.</p>
        </motion.div>

        <motion.div
          className="space-y-3"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Label className="text-gray-900 text-base">Preferred Cuisines</Label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {[
              { value: "italian", label: "Italian", icon: "🍝" },
              { value: "mexican", label: "Mexican", icon: "🌮" },
              { value: "asian", label: "Asian", icon: "🍜" },
              { value: "mediterranean", label: "Mediterranean", icon: "🫒" },
              { value: "indian", label: "Indian", icon: "🍛" },
              { value: "any", label: "Any", icon: "🌍" },
            ].map((cuisine) => (
              <motion.div
                key={cuisine.value}
                onClick={() => handleMultiSelect("preferredCuisines", cuisine.value)}
                className={`px-4 py-3 rounded-lg border cursor-pointer transition-all duration-200 text-center relative
          ${
            formData.preferredCuisines.includes(cuisine.value)
              ? "border-emerald-500 shadow-md ring-2 ring-emerald-500/20"
              : "border-gray-300 hover:border-emerald-300 hover:bg-emerald-50/30"
          }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                animate={formData.preferredCuisines.includes(cuisine.value) ? { y: [0, -3, 0] } : {}}
                transition={{ duration: 0.3 }}
              >
                <motion.div
                  className="text-xl mb-1"
                  animate={formData.preferredCuisines.includes(cuisine.value) ? { scale: [1, 1.2, 1] } : {}}
                  transition={{ duration: 0.4 }}
                >
                  {cuisine.icon}
                </motion.div>
                <div
                  className={`font-medium ${formData.preferredCuisines.includes(cuisine.value) ? "text-emerald-700" : "text-gray-700"}`}
                >
                  {cuisine.label}
                </div>
                {formData.preferredCuisines.includes(cuisine.value) && (
                  <>
                    <motion.div
                      className="absolute top-2 right-2 h-5 w-5 bg-emerald-500 rounded-full flex items-center justify-center"
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Check className="h-3 w-3 text-white" />
                    </motion.div>
                    <motion.div
                      className="absolute inset-0 bg-emerald-500/5 rounded-lg pointer-events-none"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    />
                  </>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <div className="space-y-3">
            <Label htmlFor="mealsPerDay" className="text-gray-900 text-base">
              Meals per Day
            </Label>
            <select
              id="mealsPerDay"
              value={formData.mealsPerDay}
              onChange={(e) => onChange("mealsPerDay", e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-gray-900 bg-white shadow-sm transition-all duration-200"
            >
              <option value="">Select</option>
              <option value="2">2</option>
              <option value="3">3</option>
              <option value="4">4</option>
              <option value="5">5</option>
            </select>
          </div>

          <div className="space-y-3">
            <Label htmlFor="mealPrepTimeLimit" className="text-gray-900 text-base">
              Meal Prep Time Limit
            </Label>
            <select
              id="mealPrepTimeLimit"
              value={formData.mealPrepTimeLimit}
              onChange={(e) => onChange("mealPrepTimeLimit", e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-gray-900 bg-white shadow-sm transition-all duration-200"
            >
              <option value="">Select</option>
              <option value="15">{"<15 mins"}</option>
              <option value="30">{"<30 mins"}</option>
              <option value="60">{"<1 hour"}</option>
              <option value="no-limit">No Limit</option>
            </select>
          </div>
        </motion.div>
      </div>

      <motion.div
        className="flex justify-between mt-8 pt-4 border-t border-gray-100"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
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
          onClick={onFinish}
          className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
        >
          Finish
          <Check className="ml-2 h-4 w-4" />
        </Button>
      </motion.div>
    </div>
  )
}
