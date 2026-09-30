import { Platform } from 'react-native';
import { UserProfile, WorkoutPlan } from '../types/fitness';
import { generateFallbackWorkout } from './fallbackGenerator';
import { getSupabase, isSupabaseConfigured, syncWorkoutPlanToSupabase } from './supabase';
import { StorageService } from './storageService';

export interface GenerationProgressCallback {
  (stage: string): void;
}

// Local backend server address (keeps API keys 100% on server)
const BACKEND_BASE_URL =
  Platform.OS === 'android'
    ? 'http://10.0.2.2:5001'
    : 'http://localhost:5001';

/**
 * Generates custom workout plan via:
 * 1. Supabase Cloud Edge Function (Backend)
 * 2. Secure Local Node.js Backend API (Backend)
 * 3. Smart Sports-Science Algorithmic Engine (Offline fallback)
 *
 * NOTE: The client NEVER holds or calls Google Gemini directly!
 */
export async function generateCustomWorkoutPlan(
  profile: UserProfile,
  onProgress?: GenerationProgressCallback
): Promise<{ plan: WorkoutPlan; source: 'supabase_edge' | 'backend_server' | 'algorithmic' }> {
  onProgress?.('Analyzing biometrics and duration constraints...');
  await new Promise((r) => setTimeout(r, 600));

  // 1. Try Supabase Edge Function (Cloud Backend)
  if (isSupabaseConfigured()) {
    try {
      onProgress?.('Contacting Supabase Backend (Gemini Edge Function)...');
      const supabase = getSupabase();
      const { data, error } = await supabase.functions.invoke('generate-workout', {
        body: {
          weight: profile.weight,
          weightUnit: profile.weightUnit,
          height: profile.height,
          heightUnit: profile.heightUnit,
          age: profile.age,
          gender: profile.gender,
          gymDaysPerWeek: profile.gymDaysPerWeek,
          durationMinutes: profile.durationMinutes,
          goal: profile.goal,
          experienceLevel: profile.experienceLevel,
        },
      });

      if (!error && data && data.days && data.days.length > 0) {
        onProgress?.('Backend workout generated! Finalizing schedule...');
        const plan: WorkoutPlan = {
          id: `plan_${Date.now()}`,
          title: data.title || `${profile.gymDaysPerWeek}-Day Gemini AI Routine`,
          splitType: data.splitType || 'Custom Split',
          overview: data.overview || 'AI-designed customized workout routine.',
          durationMinutes: profile.durationMinutes,
          createdAt: new Date().toISOString(),
          userSnapshot: profile,
          days: data.days,
          nutrition: data.nutrition,
        };

        await StorageService.saveActivePlan(plan);
        if (profile.id) {
          syncWorkoutPlanToSupabase(plan, profile.id).catch(() => {});
        }
        return { plan, source: 'supabase_edge' };
      }
    } catch (edgeError) {
      console.warn('Supabase Edge Function not reachable, trying backend server:', edgeError);
    }
  }

  // 2. Try Secure Local Backend Server
  try {
    onProgress?.('Requesting routine from Secure Backend Server...');
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000);

    const res = await fetch(`${BACKEND_BASE_URL}/api/generate-workout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profile),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (data && data.days && data.days.length > 0) {
        onProgress?.('Routine received from Backend Server!');
        const plan: WorkoutPlan = {
          id: `plan_${Date.now()}`,
          title: data.title || `${profile.gymDaysPerWeek}-Day Gemini AI Plan`,
          splitType: data.splitType || 'Custom Split',
          overview: data.overview || 'AI generated routine',
          durationMinutes: profile.durationMinutes,
          createdAt: new Date().toISOString(),
          userSnapshot: profile,
          days: data.days,
          nutrition: data.nutrition,
        };
        await StorageService.saveActivePlan(plan);
        if (profile.id && isSupabaseConfigured()) {
          syncWorkoutPlanToSupabase(plan, profile.id).catch(() => {});
        }
        return { plan, source: 'backend_server' };
      }
    }
  } catch (backendError) {
    console.log('Local backend server not running or unreachable, falling back to algorithmic engine.');
  }

  // 3. Fallback Sports-Science Generator (Guaranteed reliable offline)
  onProgress?.(`Applying sports-science periodization for ${profile.durationMinutes}m sessions...`);
  await new Promise((r) => setTimeout(r, 600));

  const plan = generateFallbackWorkout(profile);
  await StorageService.saveActivePlan(plan);
  if (profile.id && isSupabaseConfigured()) {
    syncWorkoutPlanToSupabase(plan, profile.id).catch(() => {});
  }

  return { plan, source: 'algorithmic' };
}
