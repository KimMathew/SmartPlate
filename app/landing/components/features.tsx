"use client";
import { FeatureIcons } from "@/app/landing/components/feature-icons";
import { useInView } from "@/hooks/use-in-view";

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  const { ref, inView } = useInView({ threshold: 0.15 });
  return (
    <div
      ref={ref}
      className={`feature-card transition-all duration-300 transform hover:-translate-y-2 hover:shadow-lg ${
        inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      }`}
    >
      <div className="feature-icon">{icon}</div>
      <h3 className="text-xl font-bold text-[#1a2942] mb-3">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}

function FeaturesHeader() {
  const { ref, inView } = useInView({ threshold: 0.15 });
  return (
    <div
      ref={ref}
      className={`text-center mb-16 transition-all duration-1000 ${
        inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      }`}
    >
      <div className="inline-block px-4 py-1.5 bg-emerald-100 rounded-full text-emerald-700 text-sm font-medium mb-6">
        Key Features
      </div>
      <h2 className="text-5xl font-bold text-[#1a2942] mb-6 max-sm:text-3xl">
        Intelligent Solutions for Your Dietary Needs
      </h2>
      <p className="text-gray-600 text-lg max-w-3xl mx-auto max-sm:text-base">
        SmartPlate combines cutting-edge technology with nutritional expertise
        to deliver a comprehensive meal planning system.
      </p>
    </div>
  );
}

export default function Features() {
  return (
    <section className="py-[104px] bg-[#EDFCF5]">
      <div className="container mx-auto px-6 max-w-6xl">
        <FeaturesHeader />
        {/* Feature cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <FeatureCard
            icon={FeatureIcons.mealPlanning}
            title="Automated Meal Planning"
            description="Personalized meal plans based on your dietary preferences, restrictions, and health goals."
          />
          <FeatureCard
            icon={FeatureIcons.recipeRecommendations}
            title="AI Recipe Recommendations"
            description="Discover new recipes tailored to your taste with our Gemini API-powered recommendation engine."
          />
          <FeatureCard
            icon={FeatureIcons.nutritionTracking}
            title="Precise Nutrition Tracking"
            description="Monitor your nutritional intake with accurate data powered by the Gemini API."
          />
        </div>
      </div>
    </section>
  );
}
