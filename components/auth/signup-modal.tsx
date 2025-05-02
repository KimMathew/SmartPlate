"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { X, Eye, EyeOff } from "lucide-react";
import Image from "next/image";

interface SignupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginClick: () => void;
}

export default function SignupModal({
  isOpen,
  onClose,
  onLoginClick,
}: SignupModalProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [visible, setVisible] = useState(isOpen);
  const [animate, setAnimate] = useState(false);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [firstNameError, setFirstNameError] = useState("");
  const [lastNameError, setLastNameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");

  const [firstNameTouched, setFirstNameTouched] = useState(false);
  const [lastNameTouched, setLastNameTouched] = useState(false);
  const [emailTouched, setEmailTouched] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [confirmPasswordTouched, setConfirmPasswordTouched] = useState(false);
  const [submitAttempted, setSubmitAttempted] = useState(false);

  // Validation helpers
  const nameRegex = /^[A-Za-z\s'-]+$/;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const passwordRegex = /^.{8,}$/;

  const validateFirstName = (value: string) => {
    if (!value || !nameRegex.test(value)) {
      setFirstNameError("Please enter a valid name (letters only).");
      return false;
    }
    setFirstNameError("");
    return true;
  };
  const validateLastName = (value: string) => {
    if (!value || !nameRegex.test(value)) {
      setLastNameError("Please enter a valid name (letters only).");
      return false;
    }
    setLastNameError("");
    return true;
  };
  const validateEmail = (value: string) => {
    if (!value || !emailRegex.test(value)) {
      setEmailError(
        "Please enter a valid email address (e.g., example@gmail.com)."
      );
      return false;
    }
    setEmailError("");
    return true;
  };
  const validatePassword = (value: string) => {
    if (!value || !passwordRegex.test(value)) {
      setPasswordError("Password must be at least 8 characters long.");
      return false;
    }
    setPasswordError("");
    return true;
  };
  const validateConfirmPassword = (value: string) => {
    if (value !== password) {
      setConfirmPasswordError("Passwords do not match. Please try again.");
      return false;
    }
    setConfirmPasswordError("");
    return true;
  };

  useEffect(() => {
    if (isOpen) {
      setVisible(true);
      setTimeout(() => setAnimate(true), 10);
    } else if (visible) {
      setAnimate(false);
      const timeout = setTimeout(() => setVisible(false), 200);
      // Reset all fields and errors when modal closes
      setFirstName("");
      setLastName("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      setFirstNameError("");
      setLastNameError("");
      setEmailError("");
      setPasswordError("");
      setConfirmPasswordError("");
      setFirstNameTouched(false);
      setLastNameTouched(false);
      setEmailTouched(false);
      setPasswordTouched(false);
      setConfirmPasswordTouched(false);
      setSubmitAttempted(false);
      return () => clearTimeout(timeout);
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitAttempted(true);
    // Validate all fields
    const validFirst = validateFirstName(firstName);
    const validLast = validateLastName(lastName);
    const validEmail = validateEmail(email);
    const validPass = validatePassword(password);
    const validConfirm = validateConfirmPassword(confirmPassword);
    if (
      !validFirst ||
      !validLast ||
      !validEmail ||
      !validPass ||
      !validConfirm
    ) {
      return;
    }
    // Here you would typically handle form validation and API submission
    console.log("Account creation submitted");

    // Close the modal and redirect to onboarding
    onClose();
    window.location.href = "/onboarding";
  };

  if (!visible) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-200 px-4 ${
        animate ? "opacity-100" : "opacity-0"
      } bg-black/50`}
      onClick={onClose}
    >
      <div
        className={`relative w-full max-w-4xl bg-white rounded-lg shadow-2xl overflow-hidden flex transition-all duration-200 mx-auto ${
          animate ? "scale-100 opacity-100" : "scale-95 opacity-0"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Left side - Image with text overlay */}
        <div className="hidden md:block w-5/12 relative">
          {/* Gradient overlay for better text readability */}
          <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/35 via-black/15 to-transparent"></div>
          <div className="absolute inset-0 bg-black/20 z-10"></div>
          <Image
            src="/images/signup-pic.png"
            alt="Kitchen utensils and plate"
            width={500}
            height={600}
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-0 left-0 p-8 z-20 text-white">
            <h2 className="text-4xl font-bold mb-2">Join Us!</h2>
            <p className="text-xl">
              Start your journey to
              <br />
              healthier meal planning
            </p>
          </div>
        </div>

        {/* Right side - Form */}
        <div className="w-full md:w-7/12 p-8 min-h-[600px]">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-emerald-600">SmartPlate</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X size={24} />
            </button>
          </div>

          <h3 className="text-2xl font-bold text-gray-900 mb-6">
            Create Account
          </h3>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label
                  htmlFor="firstName"
                  className="block text-sm font-medium text-gray-700"
                >
                  First Name
                </label>
                <input
                  type="text"
                  id="firstName"
                  placeholder="Juan"
                  className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                    firstNameError && (firstNameTouched || submitAttempted)
                      ? "border-red-400"
                      : ""
                  }`}
                  value={firstName}
                  onChange={(e) => {
                    setFirstName(e.target.value);
                    if (!firstNameTouched) setFirstNameTouched(true);
                    if (firstNameError) validateFirstName(e.target.value);
                  }}
                  onBlur={(e) => {
                    if (firstNameTouched) validateFirstName(e.target.value);
                  }}
                />
                {firstNameError && (firstNameTouched || submitAttempted) && (
                  <p className="text-xs text-red-500 mt-1">{firstNameError}</p>
                )}
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="lastName"
                  className="block text-sm font-medium text-gray-700"
                >
                  Last Name
                </label>
                <input
                  type="text"
                  id="lastName"
                  placeholder="Dela Cruz"
                  className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                    lastNameError && (lastNameTouched || submitAttempted)
                      ? "border-red-400"
                      : ""
                  }`}
                  value={lastName}
                  onChange={(e) => {
                    setLastName(e.target.value);
                    if (!lastNameTouched) setLastNameTouched(true);
                    if (lastNameError) validateLastName(e.target.value);
                  }}
                  onBlur={(e) => {
                    if (lastNameTouched) validateLastName(e.target.value);
                  }}
                />
                {lastNameError && (lastNameTouched || submitAttempted) && (
                  <p className="text-xs text-red-500 mt-1">{lastNameError}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Email
              </label>
              <input
                type="email"
                id="email"
                placeholder="example@gmail.com"
                className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                  emailError && (emailTouched || submitAttempted)
                    ? "border-red-400"
                    : ""
                }`}
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (!emailTouched) setEmailTouched(true);
                  if (emailError) validateEmail(e.target.value);
                }}
                onBlur={(e) => {
                  if (emailTouched) validateEmail(e.target.value);
                }}
              />
              {emailError && (emailTouched || submitAttempted) && (
                <p className="text-xs text-red-500 mt-1">{emailError}</p>
              )}
            </div>

            <div className="space-y-2">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  placeholder="••••••••"
                  className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                    passwordError && (passwordTouched || submitAttempted)
                      ? "border-red-400"
                      : ""
                  }`}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (!passwordTouched) setPasswordTouched(true);
                    if (passwordError) validatePassword(e.target.value);
                  }}
                  onBlur={(e) => {
                    if (passwordTouched) validatePassword(e.target.value);
                  }}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {passwordError && (passwordTouched || submitAttempted) && (
                <p className="text-xs text-red-500 mt-1">{passwordError}</p>
              )}
            </div>

            <div className="space-y-2">
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-700"
              >
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  id="confirmPassword"
                  placeholder="••••••••"
                  className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                    confirmPasswordError &&
                    (confirmPasswordTouched || submitAttempted)
                      ? "border-red-400"
                      : ""
                  }`}
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (!confirmPasswordTouched)
                      setConfirmPasswordTouched(true);
                    if (confirmPasswordError)
                      validateConfirmPassword(e.target.value);
                  }}
                  onBlur={(e) => {
                    if (confirmPasswordTouched)
                      validateConfirmPassword(e.target.value);
                  }}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>
              {confirmPasswordError &&
                (confirmPasswordTouched || submitAttempted) && (
                  <p className="text-xs text-red-500 mt-1">
                    {confirmPasswordError}
                  </p>
                )}
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-md transition-colors"
            >
              Create Account
            </button>

            <div className="text-center">
              <p className="text-gray-700">
                Already have an account?{" "}
                <button
                  type="button"
                  className="text-emerald-600 font-medium hover:text-emerald-700"
                  onClick={onLoginClick}
                >
                  Login
                </button>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
