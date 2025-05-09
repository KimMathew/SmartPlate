import { createClient, SupabaseClient } from '@supabase/supabase-js';

interface UserProfile {
    id?: string;
    name: string;
    email: string;
    avatar?: string;
    diet_type?: string | null;
    allergens: string[];
    meal_preferences: string[];
    meal_frequency?: string | null;
}

class UserProfileManager {
    private supabase: SupabaseClient;
    private currentUser: UserProfile | null = null;
    
    constructor(supabaseUrl: string, supabaseKey: string) {
        this.supabase = createClient(supabaseUrl, supabaseKey);
    }
    
    private validateEmail(email: string): boolean {
        const pattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        return pattern.test(email);
    }
    
    async createProfile(name: string, email: string, avatarUrl?: string): Promise<UserProfile> {
        if (!this.validateEmail(email)) {
            throw new Error("Invalid email format");
        }
            
        const profileData: UserProfile = {
            name,
            email,
            avatar: avatarUrl,
            diet_type: null,
            allergens: [],
            meal_preferences: [],
            meal_frequency: null
        };
        
        const { data, error } = await this.supabase
            .from('profiles')
            .insert(profileData)
            .select()
            .single();
        
        if (error) throw error;
        
        this.currentUser = data;
        return data;
    }
    
    async updateProfile(updates: Partial<UserProfile>): Promise<UserProfile> {
        if (!this.currentUser?.id) {
            throw new Error("No user logged in");
        }
            
        if (updates.email && !this.validateEmail(updates.email)) {
            throw new Error("Invalid email format");
        }
            
        const { data, error } = await this.supabase
            .from('profiles')
            .update(updates)
            .eq('id', this.currentUser.id)
            .select()
            .single();
        
        if (error) throw error;
        
        this.currentUser = data;
        return data;
    }
    
    async setDietaryPreferences(
        dietType: string,
        allergens: string[],
        mealPreferences: string[],
        mealFrequency: string
    ): Promise<UserProfile> {
        return this.updateProfile({
            diet_type: dietType,
            allergens,
            meal_preferences: mealPreferences,
            meal_frequency: mealFrequency
        });
    }
    
    getProfile(): UserProfile | null {
        return this.currentUser;
    }
    
    displayProfile(): void {
        if (!this.currentUser) {
            console.log("No user profile loaded");
            return;
        }
            
        console.log("\nUser Profile:");
        console.log(`Name: ${this.currentUser.name}`);
        console.log(`Email: ${this.currentUser.email}`);
        console.log(`Avatar: ${this.currentUser.avatar || 'Not set'}`);
        console.log("\nDietary Settings:");
        console.log(`Diet Type: ${this.currentUser.diet_type || 'Not set'}`);
        console.log(`Allergens: ${this.currentUser.allergens.length ? this.currentUser.allergens.join(', ') : 'None'}`);
        console.log(`Meal Preferences: ${this.currentUser.meal_preferences.length ? this.currentUser.meal_preferences.join(', ') : 'None'}`);
        console.log(`Meal Frequency: ${this.currentUser.meal_frequency || 'Not set'}`);
    }
}

// Example usage
(async () => {
    // Initialize with your Supabase URL and key
    const supabaseUrl = "your-supabase-url";
    const supabaseKey = "your-supabase-key";
    
    const profileManager = new UserProfileManager(supabaseUrl, supabaseKey);
    
    try {
        // Create a new profile
        await profileManager.createProfile(
            "John Doe",
            "john.doe@example.com",
            "https://example.com/avatar.jpg"
        );
        
        // Set dietary preferences
        await profileManager.setDietaryPreferences(
            "keto",
            ["peanuts", "dairy"],
            ["high-protein", "low-carb"],
            "3 meals/day"
        );
        
        // Display profile
        profileManager.displayProfile();
        
        // Update profile
        await profileManager.updateProfile({
            name: "Johnathan Doe",
            meal_frequency: "5 meals/day"
        });
        
        console.log("\nAfter update:");
        profileManager.displayProfile();
        
    } catch (error) {
        console.error("Error:", error instanceof Error ? error.message : error);
    }
})();