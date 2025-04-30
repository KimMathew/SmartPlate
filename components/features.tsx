import { FeatureIcons } from "./feature-icons"

export default function Features() {
  return (
    <section className="py-24 md:py-32 bg-[#f2f9f6]">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
        {/* Section header */}
        <div className="text-center mb-16">
          <div className="inline-block px-4 py-1.5 bg-emerald-100 rounded-full text-emerald-700 text-sm font-medium mb-6">
            Key Features
          </div>

          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#1a2942] mb-6">
            Intelligent Solutions for Your Dietary Needs
          </h2>

          <p className="text-gray-600 text-lg max-w-3xl mx-auto">
            SmartPlate combines cutting-edge technology with nutritional expertise to deliver a comprehensive meal
            planning system.
          </p>
        </div>

        {/* Feature cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <div className="bg-white p-8 rounded-lg shadow-sm flex flex-col items-center text-center">
            <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mb-6">
              {FeatureIcons.mealPlanning}
            </div>

            <h3 className="text-xl font-bold text-[#1a2942] mb-3">Automated Meal Planning</h3>

            <p className="text-gray-600">
              Personalized meal plans based on your dietary preferences, restrictions, and health goals.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="bg-white p-8 rounded-lg shadow-sm flex flex-col items-center text-center">
            <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mb-6">
              {FeatureIcons.recipeRecommendations}
            </div>

            <h3 className="text-xl font-bold text-[#1a2942] mb-3">AI Recipe Recommendations</h3>

            <p className="text-gray-600">
              Discover new recipes tailored to your taste with our Gemini API-powered recommendation engine.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="bg-white p-8 rounded-lg shadow-sm flex flex-col items-center text-center">
            <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mb-6">
              {FeatureIcons.nutritionTracking}
            </div>

            <h3 className="text-xl font-bold text-[#1a2942] mb-3">Precise Nutrition Tracking</h3>

            <p className="text-gray-600">
              Track your nutritional intake with accurate data from the USDA FoodData Central API.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
