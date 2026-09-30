import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserProfile, WorkoutPlan } from '../types/fitness';

const KEYS = {
  USER_PROFILE: '@fitguru_profile',
  ACTIVE_PLAN: '@fitguru_active_plan',
  SAVED_PLANS: '@fitguru_saved_plans',
  SUPABASE_CONFIG: '@fitguru_supabase_config',
  COMPLETED_SETS: '@fitguru_completed_sets',
};

export interface CustomSupabaseConfig {
  url: string;
  anonKey: string;
}

export const StorageService = {
  async saveProfile(profile: UserProfile): Promise<void> {
    try {
      await AsyncStorage.setItem(KEYS.USER_PROFILE, JSON.stringify(profile));
    } catch (e) {
      console.warn('Failed to save profile locally:', e);
    }
  },

  async getProfile(): Promise<UserProfile | null> {
    try {
      const data = await AsyncStorage.getItem(KEYS.USER_PROFILE);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      console.warn('Failed to read profile:', e);
      return null;
    }
  },

  async saveActivePlan(plan: WorkoutPlan): Promise<void> {
    try {
      await AsyncStorage.setItem(KEYS.ACTIVE_PLAN, JSON.stringify(plan));
      // Also add to saved plans history
      await this.addToSavedPlans(plan);
    } catch (e) {
      console.warn('Failed to save active plan:', e);
    }
  },

  async getActivePlan(): Promise<WorkoutPlan | null> {
    try {
      const data = await AsyncStorage.getItem(KEYS.ACTIVE_PLAN);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      console.warn('Failed to read active plan:', e);
      return null;
    }
  },

  async addToSavedPlans(plan: WorkoutPlan): Promise<void> {
    try {
      const plans = await this.getSavedPlans();
      const updated = [plan, ...plans.filter((p) => p.id !== plan.id)].slice(0, 10);
      await AsyncStorage.setItem(KEYS.SAVED_PLANS, JSON.stringify(updated));
    } catch (e) {
      console.warn('Failed to add to history:', e);
    }
  },

  async getSavedPlans(): Promise<WorkoutPlan[]> {
    try {
      const data = await AsyncStorage.getItem(KEYS.SAVED_PLANS);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  },

  async saveCompletedSets(planId: string, completedMap: Record<string, boolean>): Promise<void> {
    try {
      await AsyncStorage.setItem(`${KEYS.COMPLETED_SETS}_${planId}`, JSON.stringify(completedMap));
    } catch (e) {
      console.warn('Failed to save completed sets:', e);
    }
  },

  async getCompletedSets(planId: string): Promise<Record<string, boolean>> {
    try {
      const data = await AsyncStorage.getItem(`${KEYS.COMPLETED_SETS}_${planId}`);
      return data ? JSON.parse(data) : {};
    } catch (e) {
      return {};
    }
  },

  async saveSupabaseConfig(config: CustomSupabaseConfig): Promise<void> {
    try {
      await AsyncStorage.setItem(KEYS.SUPABASE_CONFIG, JSON.stringify(config));
    } catch (e) {
      console.warn('Failed to save Supabase config:', e);
    }
  },

  async getSupabaseConfig(): Promise<CustomSupabaseConfig | null> {
    try {
      const data = await AsyncStorage.getItem(KEYS.SUPABASE_CONFIG);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      return null;
    }
  },


  async clearAllData(): Promise<void> {
    try {
      await AsyncStorage.clear();
    } catch (e) {
      console.warn('Failed to clear storage:', e);
    }
  },
};
