"use client";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import { useInView } from "@/hooks/use-in-view";

export default function Hero({
  openLoginModal,
}: {
  openLoginModal: () => void;
}) {
  // Use a single ref and inView for both text and button
  const { ref: contentRef, inView: contentInView } = useInView({
    threshold: 0.15,
  });
  const { ref: imgRef, inView: imgInView } = useInView({ threshold: 0.15 });

  return (
    <section className="container mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center pt-16 pb-16 relative">
      {/* Hero content */}
      <div
        ref={contentRef}
        className={`max-w-3xl mx-auto z-10 transition-all duration-1000 ${
          contentInView
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-8"
        }`}
      >
        <h1 className="text-5xl sm:text-6xl lg:text-6xl font-bold tracking-tight text-[#1a2942] mb-4">
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
          onClick={openLoginModal}
        >
          Plan Your First Meal
        </Button>
      </div>

      {/* Plate image container */}
      <div className="mt-16 relative w-full max-w-[650px] mx-auto">
        {/* Animated image */}
        <div
          ref={imgRef}
          className={`aspect-square rounded-full overflow-hidden border-8 border-[#2D2217] shadow-2xl shadow-black/35 transition-all duration-1000 ${
            imgInView ? "opacity-100 scale-100" : "opacity-0 scale-90"
          } hover:scale-105 hover:shadow-3xl cursor-pointer`}
        >
          <Image
            src="/images/hero-img.png"
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
