-- =====================================================
-- SMARTPLATE DATABASE SCHEMA
-- Supabase PostgreSQL Database Creation Script
-- =====================================================
-- This script creates all tables and relationships
-- for the SmartPlate meal planning application
-- =====================================================

-- Enable UUID extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- TABLE: Users
-- Purpose: Store user profile and preferences
-- =====================================================
CREATE TABLE IF NOT EXISTS "Users" (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    email VARCHAR(255) NOT NULL UNIQUE,
    "birth-date" DATE,
    gender VARCHAR(20),
    height NUMERIC(5,2), -- in cm
    weight NUMERIC(5,2), -- in kg
    activity_level VARCHAR(50), -- sedentary, lightly_active, moderately_active, very_active, extra_active
    goal_type VARCHAR(100), -- lose_weight, maintain_weight, gain_weight, build_muscle, etc.
    target_weight NUMERIC(5,2), -- in kg
    diet_type VARCHAR(100), -- vegan, vegetarian, keto, paleo, etc.
    allergens TEXT[], -- Array of allergens
    disliked_ingredients TEXT[], -- Array of disliked ingredients
    preferred_cuisines TEXT[], -- Array of preferred cuisines
    meals_perday TEXT[], -- Array of meal types (breakfast, lunch, dinner, snacks)
    prep_time_limit VARCHAR(50), -- e.g., "30 minutes", "1 hour"
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- TABLE: recipe
-- Purpose: Store recipe information
-- =====================================================
CREATE TABLE IF NOT EXISTS recipe (
    recipe_id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    ingredients JSONB NOT NULL DEFAULT '[]', -- JSON array of ingredients
    instruction JSONB NOT NULL DEFAULT '[]', -- JSON array of instructions
    cuisine_type VARCHAR(100),
    prep_time INTEGER, -- in minutes
    image_url TEXT,
    source_url TEXT,
    day INTEGER, -- Day number in meal plan
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- TABLE: nutrition_info
-- Purpose: Store nutritional information for recipes
-- =====================================================
CREATE TABLE IF NOT EXISTS nutrition_info (
    nutrition_id SERIAL PRIMARY KEY,
    recipe_id INTEGER REFERENCES recipe(recipe_id) ON DELETE CASCADE,
    calories NUMERIC(7,2) DEFAULT 0,
    protein_g NUMERIC(6,2) DEFAULT 0,
    carbs_g NUMERIC(6,2) DEFAULT 0,
    fats_g NUMERIC(6,2) DEFAULT 0,
    vitamins JSONB, -- JSON array of vitamin information
    day INTEGER, -- Day number in meal plan
    total_calorie_count NUMERIC(7,2) DEFAULT 0, -- Total calories for the day
    total_protein_count NUMERIC(6,2) DEFAULT 0, -- Total protein for the day
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- TABLE: meal_plan
-- Purpose: Store generated meal plans for users
-- =====================================================
CREATE TABLE IF NOT EXISTS meal_plan (
    plan_id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES "Users"(id) ON DELETE CASCADE,
    nutrition_id INTEGER REFERENCES nutrition_info(nutrition_id) ON DELETE SET NULL,
    recipe_id INTEGER REFERENCES recipe(recipe_id) ON DELETE SET NULL,
    plan_type VARCHAR(50) NOT NULL, -- breakfast, lunch, dinner, snack
    plan_name VARCHAR(255) NOT NULL,
    description TEXT,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    days_covered INTEGER NOT NULL DEFAULT 1, -- Number of days this plan covers
    day INTEGER NOT NULL, -- Specific day number in the plan (1, 2, 3, etc.)
    batch_number INTEGER NOT NULL DEFAULT 1, -- Version number for meal plan generations
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- TABLE: meal_schedule
-- Purpose: Store user's actual meal schedule/calendar
-- =====================================================
CREATE TABLE IF NOT EXISTS meal_schedule (
    schedule_id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES "Users"(id) ON DELETE CASCADE,
    meal_name VARCHAR(255) NOT NULL,
    meal_date DATE NOT NULL,
    meal_type VARCHAR(50) NOT NULL, -- breakfast, lunch, dinner, snack
    recipe_id INTEGER REFERENCES recipe(recipe_id) ON DELETE SET NULL,
    nutrition_id INTEGER REFERENCES nutrition_info(nutrition_id) ON DELETE SET NULL,
    plan_id INTEGER REFERENCES meal_plan(plan_id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- INDEXES FOR PERFORMANCE OPTIMIZATION
-- =====================================================

-- Users table indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON "Users"(email);
CREATE INDEX IF NOT EXISTS idx_users_id ON "Users"(id);

-- Recipe table indexes
CREATE INDEX IF NOT EXISTS idx_recipe_day ON recipe(day);
CREATE INDEX IF NOT EXISTS idx_recipe_created_at ON recipe(created_at DESC);

-- Nutrition info table indexes
CREATE INDEX IF NOT EXISTS idx_nutrition_recipe_id ON nutrition_info(recipe_id);
CREATE INDEX IF NOT EXISTS idx_nutrition_day ON nutrition_info(day);
CREATE INDEX IF NOT EXISTS idx_nutrition_created_at ON nutrition_info(created_at DESC);

-- Meal plan table indexes
CREATE INDEX IF NOT EXISTS idx_meal_plan_user_id ON meal_plan(user_id);
CREATE INDEX IF NOT EXISTS idx_meal_plan_batch_number ON meal_plan(batch_number);
CREATE INDEX IF NOT EXISTS idx_meal_plan_user_batch ON meal_plan(user_id, batch_number);
CREATE INDEX IF NOT EXISTS idx_meal_plan_day ON meal_plan(day);
CREATE INDEX IF NOT EXISTS idx_meal_plan_start_date ON meal_plan(start_date);
CREATE INDEX IF NOT EXISTS idx_meal_plan_created_at ON meal_plan(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_meal_plan_recipe_id ON meal_plan(recipe_id);
CREATE INDEX IF NOT EXISTS idx_meal_plan_nutrition_id ON meal_plan(nutrition_id);

-- Meal schedule table indexes
CREATE INDEX IF NOT EXISTS idx_meal_schedule_user_id ON meal_schedule(user_id);
CREATE INDEX IF NOT EXISTS idx_meal_schedule_meal_date ON meal_schedule(meal_date);
CREATE INDEX IF NOT EXISTS idx_meal_schedule_user_date ON meal_schedule(user_id, meal_date);
CREATE INDEX IF NOT EXISTS idx_meal_schedule_meal_type ON meal_schedule(meal_type);
CREATE INDEX IF NOT EXISTS idx_meal_schedule_recipe_id ON meal_schedule(recipe_id);
CREATE INDEX IF NOT EXISTS idx_meal_schedule_nutrition_id ON meal_schedule(nutrition_id);
CREATE INDEX IF NOT EXISTS idx_meal_schedule_plan_id ON meal_schedule(plan_id);

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE "Users" ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipe ENABLE ROW LEVEL SECURITY;
ALTER TABLE nutrition_info ENABLE ROW LEVEL SECURITY;
ALTER TABLE meal_plan ENABLE ROW LEVEL SECURITY;
ALTER TABLE meal_schedule ENABLE ROW LEVEL SECURITY;

-- Users table policies
CREATE POLICY "Users can view own profile"
    ON "Users" FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
    ON "Users" FOR UPDATE
    USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
    ON "Users" FOR INSERT
    WITH CHECK (auth.uid() = id);

-- Recipe table policies
CREATE POLICY "Recipes are viewable by authenticated users"
    ON recipe FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Service role can insert recipes"
    ON recipe FOR INSERT
    TO service_role
    WITH CHECK (true);

CREATE POLICY "Service role can update recipes"
    ON recipe FOR UPDATE
    TO service_role
    USING (true);

-- Nutrition info table policies
CREATE POLICY "Nutrition info viewable by authenticated users"
    ON nutrition_info FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Service role can insert nutrition info"
    ON nutrition_info FOR INSERT
    TO service_role
    WITH CHECK (true);

CREATE POLICY "Service role can update nutrition info"
    ON nutrition_info FOR UPDATE
    TO service_role
    USING (true);

-- Meal plan table policies
CREATE POLICY "Users can view own meal plans"
    ON meal_plan FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Service role can insert meal plans"
    ON meal_plan FOR INSERT
    TO service_role
    WITH CHECK (true);

CREATE POLICY "Users can insert own meal plans"
    ON meal_plan FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own meal plans"
    ON meal_plan FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own meal plans"
    ON meal_plan FOR DELETE
    USING (auth.uid() = user_id);

-- Meal schedule table policies
CREATE POLICY "Users can view own meal schedule"
    ON meal_schedule FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own meal schedule"
    ON meal_schedule FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own meal schedule"
    ON meal_schedule FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own meal schedule"
    ON meal_schedule FOR DELETE
    USING (auth.uid() = user_id);

-- =====================================================
-- FUNCTIONS AND TRIGGERS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers to automatically update updated_at
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON "Users"
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_recipe_updated_at
    BEFORE UPDATE ON recipe
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_nutrition_info_updated_at
    BEFORE UPDATE ON nutrition_info
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_meal_plan_updated_at
    BEFORE UPDATE ON meal_plan
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_meal_schedule_updated_at
    BEFORE UPDATE ON meal_schedule
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- COMMENTS ON TABLES AND COLUMNS
-- =====================================================

COMMENT ON TABLE "Users" IS 'Stores user profile information and dietary preferences';
COMMENT ON TABLE recipe IS 'Stores recipe information including ingredients and instructions';
COMMENT ON TABLE nutrition_info IS 'Stores nutritional information for each recipe';
COMMENT ON TABLE meal_plan IS 'Stores AI-generated meal plans for users with versioning';
COMMENT ON TABLE meal_schedule IS 'Stores users actual scheduled meals on their calendar';

COMMENT ON COLUMN meal_plan.batch_number IS 'Version number for meal plan generations - increments with each new generation';
COMMENT ON COLUMN meal_plan.days_covered IS 'Total number of days this meal plan covers (e.g., 3, 5, 7)';
COMMENT ON COLUMN meal_plan.day IS 'Specific day number within the plan (1-based index)';
COMMENT ON COLUMN nutrition_info.total_calorie_count IS 'Sum of all calories for the day this meal belongs to';
COMMENT ON COLUMN nutrition_info.total_protein_count IS 'Sum of all protein for the day this meal belongs to';

-- =====================================================
-- SAMPLE DATA (OPTIONAL - FOR DEVELOPMENT/TESTING)
-- =====================================================

-- Note: User data is managed through Supabase Auth
-- Sample data would be inserted after user authentication

-- =====================================================
-- END OF SCHEMA
-- =====================================================
