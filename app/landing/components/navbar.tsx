"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

export default function Navbar({
  openLoginModal,
  openSignupModal,
}: {
  openLoginModal: () => void;
  openSignupModal: () => void;
}) {
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSignup = (userData: any) => {
    // Here you would typically store user data in context or state
    router.push("/onboarding");
  };

  return (
    <>
      <header
        className={`w-full py-4 sticky top-0 z-50 transition-colors duration-300 ${scrolled ? "bg-white/90 shadow-md backdrop-blur" : "bg-white"}`}
      >
        <div className="container max-w-screen-2xl mx-auto px-6 lg:px-40 md:px-20 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2 text-2xl max-sm:text-lg font-bold text-emerald-800 ">
            <img src="/images/logo.png" alt="SmartPlate Logo" className="h-8 w-8 max-sm:h-6 max-sm:w-6" />
            <span>SmartPlate</span>
          </Link>

          <div className="flex items-center space-x-4 max-sm:space-x-3">
            <Button
              variant="ghost"
              className="text-gray-700 hover:text-gray-900 max-sm:text-xs max-sm:px-3"
              onClick={openLoginModal}
            >
              Login
            </Button>
            <Button
              onClick={openSignupModal}
              className="max-sm:text-xs max-sm:px-3"
            >
              Sign Up
            </Button>
          </div>
        </div>
      </header>
    </>
  );
}
