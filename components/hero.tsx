import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Image from "next/image";

export default function Hero() {
  return (
    <section className="container mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center pt-16 pb-16 relative">
      {/* Hero content */}
      <div className="max-w-3xl mx-auto z-10">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-[#1a2942] mb-4">
          Smart Meal Planning
          <br />
          <span className="text-emerald-500">Made Simple</span>
        </h1>

        <p className="mx-auto max-w-[42rem] text-lg text-gray-600 mb-8">
          Personalized meal plans, automated grocery lists, and nutritional
          <br />
          insights tailored to your dietary needs and preferences.
        </p>

        <Button
          size="lg"
          className="bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-6 text-lg rounded-md"
        >
          Get Started
          <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
      </div>

      {/* Plate image container */}
      <div className="mt-16 relative w-full max-w-[650px] mx-auto">
        {/* This is a placeholder. Replace with your actual image */}
        <div className="aspect-square rounded-full overflow-hidden border-8 border-[#2D2217] shadow-2xl shadow-black/35">
          <Image
            src="/images/hero-img2.png"
            alt="Healthy meal in a plate"
            width={600}
            height={600}
            className="w-full h-full object-cover"
            priority
          />
        </div>
      </div>
    </section>
  );
}
