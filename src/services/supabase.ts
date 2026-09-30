import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { UserProfile, WorkoutPlan } from '../types/fitness';
import { StorageService } from './storageService';

// Default Supabase project credentials (configured with user project)
const DEFAULT_SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://ryvnedgojzqapyvwpyxz.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_7SY-9yefVlFeFCJTG7q3fQ_xnk6xS5x';

let supabaseInstance: SupabaseClient | null = null;
let currentUrl = DEFAULT_SUPABASE_URL;
let currentKey = DEFAULT_SUPABASE_ANON_KEY;

export function isSupabaseConfigured(): boolean {
  return (
    Boolean(currentUrl) &&
    Boolean(currentKey) &&
    !currentUrl.includes('xyzcompany')
  );
}

export function getSupabase(): SupabaseClient {
  if (!supabaseInstance) {
    supabaseInstance = createClient(currentUrl, currentKey, {
      auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
    });
  }
  return supabaseInstance;
}

export async function initSupabase(): Promise<SupabaseClient> {
  const customConfig = await StorageService.getSupabaseConfig();
  if (customConfig && customConfig.url && customConfig.anonKey) {
    currentUrl = customConfig.url;
    currentKey = customConfig.anonKey;
  }
  supabaseInstance = null; // Recreate
  return getSupabase();
}

export async function setSupabaseConfig(url: string, anonKey: string): Promise<void> {
  currentUrl = url.trim();
  currentKey = anonKey.trim();
  await StorageService.saveSupabaseConfig({ url: currentUrl, anonKey: currentKey });
  supabaseInstance = null;
  getSupabase();
}

/**
 * Sync user profile to Supabase database (table: profiles)
 */
export async function syncProfileToSupabase(profile: UserProfile, userId: string): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;
  try {
    const supabase = getSupabase();
    const { error } = await supabase.from('profiles').upsert({
      id: userId,
      weight: profile.weight,
      weight_unit: profile.weightUnit,
      height: profile.height,
      height_unit: profile.heightUnit,
      age: profile.age,
      gender: profile.gender,
      gym_days_per_week: profile.gymDaysPerWeek,
      duration_minutes: profile.durationMinutes,
      goal: profile.goal,
      experience_level: profile.experienceLevel,
      updated_at: new Date().toISOString(),
    });
    if (error) {
      console.warn('Supabase syncProfile error:', error.message);
      return false;
    }
    return true;
  } catch (e) {
    console.warn('syncProfileToSupabase exception:', e);
    return false;
  }
}

/**
 * Load user profile from Supabase database
 */
export async function fetchProfileFromSupabase(userId: string): Promise<UserProfile | null> {
  if (!isSupabaseConfigured()) return null;
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error || !data) return null;

    return {
      id: data.id,
      email: data.email,
      weight: data.weight || 70,
      weightUnit: data.weight_unit || 'kg',
      height: data.height || 175,
      heightUnit: data.height_unit || 'cm',
      age: data.age || 25,
      gender: data.gender || 'male',
      gymDaysPerWeek: data.gym_days_per_week || 4,
      durationMinutes: data.duration_minutes || 60,
      goal: data.goal || 'hypertrophy',
      experienceLevel: data.experience_level || 'intermediate',
      equipment: 'full_gym',
    };
  } catch (e) {
    return null;
  }
}

/**
 * Save generated workout plan to Supabase
 */
export async function syncWorkoutPlanToSupabase(plan: WorkoutPlan, userId: string): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;
  try {
    const supabase = getSupabase();
    const { error } = await supabase.from('workout_plans').insert({
      user_id: userId,
      title: plan.title,
      split_type: plan.splitType,
      duration_minutes: plan.durationMinutes,
      plan_data: plan,
    });
    return !error;
  } catch (e) {
    return false;
  }
}
