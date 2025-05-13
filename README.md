# 📦 SmartPlate

SmartPlate is an intelligent meal planning system that delivers personalized meal plans, Gemini API-powered recipe suggestions, and nutrition tracking to help users meet their dietary needs and health goals.

# 📖 Table of Contents

📌 Introduction
🎯 Purpose
📦 Scope
📚 Definitions, Acronyms, and Abbreviations
📖 References
📝 Overall Description
  Product Perspective
  Product Features
  User Classes and Characteristics
  Operating Environment
  Design and Implementation Constraints
✅ Functional Requirements
🧪 Technology Stack

# 📌 Introduction

SmartPlate is a standalone digital application designed to help individuals better manage meal planning through AI-powered recommendations and nutrition insights.

# 🎯 Purpose

SmartPlate aims to provide efficient, smart solutions for users with various dietary preferences and health goals. Key features include:
Automated meal planning
Recipe recommendations (via Gemini API)
Nutrition tracking

# 📦 Scope

SmartPlate provides:
    Personalized meal plans
    Recipe recommendations with filters (ingredients, cuisine, prep time)
    Nutritional analysis (calories, macronutrients, vitamins)
    Weekly meal scheduling
    User profile management to monitor progress


# 📝 Overall Description

## Product Perspective

SmartPlate is a standalone web and mobile application. It connects to the Gemini API for recipes but currently does not integrate with:
Grocery delivery services
Smart kitchen appliances
Health monitoring systems

## Product Features

✅ Personalized meal plans
🍽️ Recipe search using Gemini API
🔍 Nutritional breakdown
📅 Meal scheduling with calendar view
👤 User profile and progress tracking

## User Classes and Characteristics

Health-conscious individuals
Families needing organized meal plans
Busy professionals seeking time-efficient solutions
People with dietary restrictions


# ✅ Functional Requirements

Account Management
    Register, log in, update profile (preferences, allergies), log out securely
Meal Plan Generation
    Personalized meal plans using Gemini API based on user inputs
Recipe Search & Recommendations
    Filter recipes by ingredient, cuisine, and prep time
Nutritional Analysis
    Display calories, protein, fat, carbs, and vitamins
Meal Scheduling
    Daily/weekly/monthly meal scheduling via interactive calendar
Security Management
    Secure session handling and user data protection

# 🧪 Technology Stack

| Area                | Tools / Platforms                  |
| ------------------- | ---------------------------------- |
| **Frontend**        | Next.js, TailwindCSS, ShadcnUI     |
| **Backend**         | Supabase                           |
| **API**             | Gemini API, Open Food Facts / USDA |
| **Deployment**      | Vercel                             |
| **Version Control** | GitHub                             |

# 🚀 Getting Started

Follow the steps below to run SmartPlate locally for development.

# ✅ Prerequisites

Before you begin, ensure you have the following installed:
    Node.js (v18+)
    Git
    Supabase CLI (optional)
    A Supabase account
    A Gemini API key (Get it here)
    
# 📦 Clone the Repository

    git clone https://github.com/your-username/smartplate.git
    cd smartplate

# 🛠️ Environment Setup

Create your .env.local file. then fill in the required values:
    NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
    NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
    GEMINI_API_KEY=your_gemini_api_key
    SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# 💻 Frontend Setup
    
    cd frontend
    npm install
    npm run dev
Open your browser and go to http://localhost:3000

# 🚀 Deployment

    This project is ready to be deployed on Vercel:
    Push your code to GitHub
    Connect your repo to Vercel
    Add environment variables via Vercel’s dashboard
    Deploy 🎉

# 📖 References
Gemini API Reference – Google (2024)
Shadcn/ui Documentation (2024)