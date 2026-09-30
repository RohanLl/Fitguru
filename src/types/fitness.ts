export type Gender = 'male' | 'female' | 'other';
export type WeightUnit = 'kg' | 'lbs';
export type HeightUnit = 'cm' | 'ft_in';

export type FitnessGoal =
  | 'hypertrophy'
  | 'fat_loss'
  | 'strength'
  | 'endurance'
  | 'general';

export type ExperienceLevel = 'beginner' | 'intermediate' | 'advanced';
export type EquipmentType = 'full_gym' | 'dumbbells_only' | 'bodyweight';

export interface UserProfile {
  id?: string;
  email?: string;
  weight: number;
  weightUnit: WeightUnit;
  height: number;
  heightUnit: HeightUnit;
  age: number;
  gender: Gender;
  gymDaysPerWeek: number; // 1 to 7
  durationMinutes: number; // e.g., 30, 45, 60, 75, 90
  goal: FitnessGoal;
  experienceLevel: ExperienceLevel;
  equipment: EquipmentType;
}

export interface Exercise {
  id: string;
  name: string;
  targetMuscle: string;
  sets: number;
  reps: string;
  restSeconds: number;
  tips: string;
  completedSets?: boolean[];
}

export interface WorkoutDay {
  dayNumber: number;
  title: string;
  focus: string;
  isRestDay: boolean;
  warmup?: string[];
  exercises: Exercise[];
  cooldown?: string[];
}

export interface NutritionGuidelines {
  dailyCalories: number;
  proteinGrams: number;
  carbsGrams: number;
  fatGrams: number;
  waterLiters: number;
  tips: string[];
}

export interface WorkoutPlan {
  id: string;
  title: string;
  splitType: string;
  overview: string;
  durationMinutes: number;
  createdAt: string;
  userSnapshot?: UserProfile;
  days: WorkoutDay[];
  nutrition: NutritionGuidelines;
}
