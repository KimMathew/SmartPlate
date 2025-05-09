"use client";
import { useState } from "react";
import Navbar from "@/app/landing/components/navbar";
import Hero from "@/app/landing/components/hero";
import Features from "@/app/landing/components/features";
import WhyChooseSection from "@/app/landing/components/why-choose-section";
import Footer from "@/app/landing/components/footer";
import LoginModal from "@/components/auth/login-modal";
import SignupModal from "@/components/auth/signup-modal";

export default function Home() {
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [signupModalOpen, setSignupModalOpen] = useState(false);

  const openLoginModal = () => {
    setSignupModalOpen(false);
    setLoginModalOpen(true);
  };

  const openSignupModal = () => {
    setLoginModalOpen(false);
    setSignupModalOpen(true);
  };

  const handleSignup = (userData: any) => {
    setSignupModalOpen(false);
    // Here you would typically store user data in context or state
    // router.push("/onboarding")
    window.location.href = "/onboarding";
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar
        openLoginModal={openLoginModal}
        openSignupModal={openSignupModal}
      />
      <Hero openLoginModal={openLoginModal} />
      <Features />
      <WhyChooseSection />
      <Footer />
      <LoginModal
        isOpen={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
        onSignupClick={openSignupModal}
      />
      <SignupModal
        isOpen={signupModalOpen}
        onClose={() => setSignupModalOpen(false)}
        onLoginClick={openLoginModal}
      />
    </div>
  );
}
