"use client"

import { useState } from "react"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

type ModalType = "login" | "signup" | null

export default function AuthModal({
  isOpen,
  type,
  onClose,
}: {
  isOpen: boolean
  type: ModalType
  onClose: () => void
}) {
  const [authType, setAuthType] = useState<ModalType>(type)

  if (!isOpen) return null

  const toggleAuthType = () => {
    setAuthType(authType === "login" ? "signup" : "login")
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="relative w-full max-w-md rounded-lg bg-white p-6 shadow-lg" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-500 hover:text-gray-700"
          aria-label="Close"
        >
          <X size={20} />
        </button>

        <div className="mb-6 text-center">
          <h2 className="text-2xl font-bold text-gray-900">
            {authType === "login" ? "Welcome Back" : "Create an Account"}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {authType === "login"
              ? "Sign in to access your meal plans and recipes"
              : "Join NutriPlan to start your healthy meal journey"}
          </p>
        </div>

        {authType === "login" ? <LoginForm /> : <SignupForm />}

        <div className="mt-6 text-center text-sm">
          <p className="text-gray-600">
            {authType === "login" ? "Don't have an account?" : "Already have an account?"}
            <button onClick={toggleAuthType} className="ml-1 font-medium text-emerald-600 hover:text-emerald-500">
              {authType === "login" ? "Sign up" : "Log in"}
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}

function LoginForm() {
  return (
    <form className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" placeholder="your@email.com" required />
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="password">Password</Label>
          <a href="#" className="text-xs font-medium text-emerald-600 hover:text-emerald-500">
            Forgot password?
          </a>
        </div>
        <Input id="password" type="password" placeholder="••••••••" required />
      </div>
      <Button type="submit" className="w-full bg-emerald-500 hover:bg-emerald-600">
        Log in
      </Button>
    </form>
  )
}

function SignupForm() {
  return (
    <form className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="firstName">First Name</Label>
          <Input id="firstName" placeholder="John" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName">Last Name</Label>
          <Input id="lastName" placeholder="Doe" required />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" placeholder="your@email.com" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input id="password" type="password" placeholder="••••••••" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirm Password</Label>
        <Input id="confirmPassword" type="password" placeholder="••••••••" required />
      </div>
      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="terms"
          className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
          required
        />
        <Label htmlFor="terms" className="text-sm text-gray-600">
          I agree to the{" "}
          <a href="#" className="text-emerald-600 hover:text-emerald-500">
            Terms of Service
          </a>{" "}
          and{" "}
          <a href="#" className="text-emerald-600 hover:text-emerald-500">
            Privacy Policy
          </a>
        </Label>
      </div>
      <Button type="submit" className="w-full bg-emerald-500 hover:bg-emerald-600">
        Create Account
      </Button>
    </form>
  )
}
