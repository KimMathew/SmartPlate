import Image from "next/image"

export default function WhyChooseSection() {
  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto">
        <div className="flex flex-col lg:flex-row items-center gap-12">
          {/* Left side - Image placeholder */}
          <div className="w-full lg:w-1/2">
            <div className="bg-gray-100 rounded-lg overflow-hidden aspect-square max-w-lg mx-auto flex items-center justify-center">
              <Image
                src="/placeholder.svg?height=500&width=500"
                alt="NutriPlan App Interface"
                width={500}
                height={500}
                className="w-full h-auto"
              />
            </div>
          </div>

          {/* Right side - Content */}
          <div className="w-full lg:w-1/2 space-y-6">
            <div className="inline-block px-4 py-2 bg-emerald-50 rounded-full text-emerald-700 text-sm font-medium">
              Why Choose NutriPlan
            </div>

            <h2 className="text-4xl font-bold text-gray-900">Designed for Everyone</h2>

            <p className="text-lg text-gray-600">
              NutriPlan adapts to your unique needs, whether you're managing a health condition, following a specific
              diet, or simply wanting to eat healthier.
            </p>

            <div className="space-y-6 pt-4">
              {/* Feature 1 */}
              <div className="flex gap-4">
                <div className="flex-shrink-0 h-8 w-8 bg-emerald-100 rounded-full flex items-center justify-center">
                  <span className="text-emerald-600">→</span>
                </div>
                <div>
                  <h3 className="font-bold text-xl text-gray-900">Personalized Experience</h3>
                  <p className="text-gray-600 mt-1">
                    Customized meal plans that adapt to your preferences and dietary requirements.
                  </p>
                </div>
              </div>

              {/* Feature 2 */}
              <div className="flex gap-4">
                <div className="flex-shrink-0 h-8 w-8 bg-emerald-100 rounded-full flex items-center justify-center">
                  <span className="text-emerald-600">→</span>
                </div>
                <div>
                  <h3 className="font-bold text-xl text-gray-900">Time-Saving Solutions</h3>
                  <p className="text-gray-600 mt-1">
                    Eliminate the guesswork and time spent on meal planning and nutritional calculations.
                  </p>
                </div>
              </div>

              {/* Feature 3 */}
              <div className="flex gap-4">
                <div className="flex-shrink-0 h-8 w-8 bg-emerald-100 rounded-full flex items-center justify-center">
                  <span className="text-emerald-600">→</span>
                </div>
                <div>
                  <h3 className="font-bold text-xl text-gray-900">Evidence-Based Nutrition</h3>
                  <p className="text-gray-600 mt-1">
                    Backed by reliable data from the USDA FoodData Central for accurate nutritional information.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
