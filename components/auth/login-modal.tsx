"use client"

import { useState } from "react"
import { X, Eye, EyeOff } from "lucide-react"
import Image from "next/image"

interface LoginModalProps {
  isOpen: boolean
  onClose: () => void
  onSignupClick: () => void
}

export default function LoginModal({ isOpen, onClose, onSignupClick }: LoginModalProps) {
  const [showPassword, setShowPassword] = useState(false)

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div
        className="relative w-full max-w-4xl bg-white rounded-lg shadow-2xl overflow-hidden flex"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Left side - Image with text overlay */}
        <div className="hidden md:block w-5/12 relative">
          <div className="absolute inset-0 bg-black/20 z-10"></div>
          <Image
            src="/placeholder.svg?height=600&width=500"
            alt="Kitchen utensils and plate"
            width={500}
            height={600}
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-0 left-0 p-8 z-20 text-white">
            <h2 className="text-4xl font-bold mb-2">Welcome!</h2>
            <p className="text-xl">
              Build, Create, and
              <br />
              Eat Healthy with SmartPlate
            </p>
          </div>
        </div>

        {/* Right side - Form */}
        <div className="w-full md:w-7/12 p-8 flex flex-col min-h-[600px]">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-emerald-600">SmartPlate</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X size={24} />
            </button>
          </div>

          <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full">
            <h3 className="text-2xl font-bold text-gray-900 mb-8">Login</h3>

            <form className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  placeholder="example@gmail.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    placeholder="••••••••"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-md transition-colors"
              >
                Login
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-gray-700">
                Don't have an account?{" "}
                <button
                  type="button"
                  className="text-emerald-600 font-medium hover:text-emerald-700"
                  onClick={onSignupClick}
                >
                  Create Account
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
