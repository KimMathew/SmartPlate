"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Navbar({
  openLoginModal,
  openSignupModal,
}: {
  openLoginModal: () => void;
  openSignupModal: () => void;
}) {
  const router = useRouter();

  const handleSignup = (userData: any) => {
    // Here you would typically store user data in context or state
    router.push("/onboarding");
  };

  return (
    <>
      <header className="w-full py-4">
        <div className="container max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-gray-900">
            SmartPlate
          </Link>

          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              className="text-gray-700 hover:text-gray-900"
              onClick={openLoginModal}
            >
              Login
            </Button>
            <Button
              className="bg-emerald-500 hover:bg-emerald-600 text-white"
              onClick={openSignupModal}
            >
              Sign Up
            </Button>
          </div>
        </div>
      </header>
    </>
  );
}
