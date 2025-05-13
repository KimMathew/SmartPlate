"use client";
import Image from "next/image";
import { ArrowRight, ChevronRight } from "lucide-react";
import { useInView } from "@/hooks/use-in-view";

function WhyChooseFeature({ children }: { children: React.ReactNode }) {
  const { ref, inView } = useInView({ threshold: 0.15 });
  return (
    <div
      ref={ref}
      className={`flex gap-4 transition-all duration-1000 ${
        inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      }`}
    >
      {children}
    </div>
  );
}

function WhyChooseHeader() {
  const { ref, inView } = useInView({ threshold: 0.15 });
  return (
    <div
      ref={ref}
      className={`space-y-6 transition-all duration-1000 ${
        inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      }`}
    >
      <div className="inline-block px-4 py-2 bg-emerald-100 rounded-full text-emerald-700 text-sm font-medium">
        Why Choose SmartPlate
      </div>
      <h2 className="text-5xl max-sm:text-3xl font-bold text-gray-900">
        Designed for Everyone
      </h2>
      <p className="text-lg text-gray-600 max-sm:text-base">
        SmartPlate adapts to your unique needs, whether you're managing a health
        condition, following a specific diet, or simply wanting to eat
        healthier.
      </p>
    </div>
  );
}

function WhyChooseImage() {
  const { ref, inView } = useInView({ threshold: 0.15 });
  return (
    <div
      ref={ref}
      className={`rounded-full overflow-hidden aspect-square bg-[#E2E3E1] max-w-lg mx-auto flex items-center justify-center shadow-2xl shadow-black/35 transition-all duration-1000 ${
        inView ? "opacity-100 scale-100" : "opacity-0 scale-90"
      } hover:scale-105 hover:shadow-3xl`}
    >
      <Image
        src="/images/plate.png"
        alt="Healthy food on a plate"
        width={500}
        height={500}
        className="w-full h-auto"
      />
    </div>
  );
}

export default function WhyChooseSection() {
  const { ref, inView } = useInView({ threshold: 0.15 });
  return (
    <section className="py-[104px] bg-white">
      <div className="container mx-auto px-6 max-w-7xl">
        <div className="flex flex-col lg:flex-row items-center gap-12">
          {/* Left side - Image placeholder */}
          <div className="w-full lg:w-1/2">
            <WhyChooseImage />
          </div>

          {/* Right side - Content */}
          <div className="w-full lg:w-1/2 space-y-6">
            <WhyChooseHeader />

            <div className="space-y-6 pt-4">
              {/* Feature 1 */}
              <WhyChooseFeature>
                <div className="flex-shrink-0 h-8 w-8 bg-emerald-100 rounded-full flex items-center justify-center">
                  <ChevronRight className="text-emerald-600 h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-xl text-gray-900 max-sm:text-lg">
                    Personalized Experience
                  </h3>
                  <p className="text-gray-600 mt-1">
                    Customized meal plans that adapt to your preferences and
                    dietary requirements.
                  </p>
                </div>
              </WhyChooseFeature>

              {/* Feature 2 */}
              <WhyChooseFeature>
                <div className="flex-shrink-0 h-8 w-8 bg-emerald-100 rounded-full flex items-center justify-center">
                  <ChevronRight className="text-emerald-600 h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-xl text-gray-900 max-sm:text-lg">
                    Time-Saving Solutions
                  </h3>
                  <p className="text-gray-600 mt-1">
                    Eliminate the guesswork and time spent on meal planning and
                    nutritional calculations.
                  </p>
                </div>
              </WhyChooseFeature>

              {/* Feature 3 */}
              <WhyChooseFeature>
                <div className="flex-shrink-0 h-8 w-8 bg-emerald-100 rounded-full flex items-center justify-center">
                  <ChevronRight className="text-emerald-600 h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-xl text-gray-900 max-sm:text-lg">
                    Evidence-Based Nutrition
                  </h3>
                  <p className="text-gray-600 mt-1">
                    Supported by accurate nutritional data powered by the Gemini API for reliable insights.
                  </p>
                </div>
              </WhyChooseFeature>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
