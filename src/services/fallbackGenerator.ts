import { UserProfile, WorkoutPlan, WorkoutDay, Exercise, NutritionGuidelines } from '../types/fitness';

/**
 * Calculates BMR using Mifflin-St Jeor equation and returns recommended macros
 */
export function calculateNutrition(profile: UserProfile): NutritionGuidelines {
  // Convert weight to kg and height to cm if imperial
  const weightKg = profile.weightUnit === 'lbs' ? profile.weight * 0.453592 : profile.weight;
  const heightCm = profile.heightUnit === 'ft_in' ? profile.height * 2.54 : profile.height;

  // Mifflin-St Jeor:
  // Male: 10 * weight(kg) + 6.25 * height(cm) - 5 * age + 5
  // Female: 10 * weight(kg) + 6.25 * height(cm) - 5 * age - 161
  let bmr = 10 * weightKg + 6.25 * heightCm - 5 * profile.age;
  if (profile.gender === 'male') {
    bmr += 5;
  } else if (profile.gender === 'female') {
    bmr -= 161;
  } else {
    bmr -= 78;
  }

  // Activity multiplier based on gym days
  let activityMultiplier = 1.2;
  if (profile.gymDaysPerWeek >= 6) activityMultiplier = 1.7;
  else if (profile.gymDaysPerWeek >= 4) activityMultiplier = 1.55;
  else if (profile.gymDaysPerWeek >= 2) activityMultiplier = 1.375;

  const tdee = Math.round(bmr * activityMultiplier);

  let targetCalories = tdee;
  let proteinFactor = 2.0; // g per kg

  switch (profile.goal) {
    case 'hypertrophy':
      targetCalories = tdee + 300; // Lean surplus
      proteinFactor = 2.2;
      break;
    case 'fat_loss':
      targetCalories = Math.max(1300, tdee - 450); // Moderate deficit
      proteinFactor = 2.2; // Keep protein high during deficit to spare muscle
      break;
    case 'strength':
      targetCalories = tdee + 200;
      proteinFactor = 2.0;
      break;
    case 'endurance':
      targetCalories = tdee + 150;
      proteinFactor = 1.6;
      break;
    case 'general':
    default:
      targetCalories = tdee;
      proteinFactor = 1.8;
      break;
  }

  const proteinGrams = Math.round(weightKg * proteinFactor);
  const fatGrams = Math.round((targetCalories * 0.25) / 9); // 25% calories from fat
  const carbsGrams = Math.max(50, Math.round((targetCalories - (proteinGrams * 4 + fatGrams * 9)) / 4));
  const waterLiters = Number(((weightKg * 0.035) + (profile.durationMinutes / 60 * 0.5)).toFixed(1));

  return {
    dailyCalories: targetCalories,
    proteinGrams,
    carbsGrams,
    fatGrams,
    waterLiters,
    tips: [
      `Consume ~${Math.round(proteinGrams / 4)}g protein distributed evenly across 4 meals.`,
      `Drink at least ${waterLiters}L of water daily, especially before and during workouts.`,
      profile.goal === 'fat_loss'
        ? 'Maintain a consistent caloric deficit while prioritizing sleep to preserve lean tissue.'
        : 'Aim for a slight caloric surplus with nutrient-dense whole foods to optimize muscle protein synthesis.',
    ],
  };
}

/**
 * Intelligent fallback generator implementing proven training splits
 * perfectly calibrated for session duration and weekly frequency.
 */
export function generateFallbackWorkout(profile: UserProfile): WorkoutPlan {
  const nutrition = calculateNutrition(profile);
  const duration = profile.durationMinutes || 60;
  const daysCount = Math.min(7, Math.max(1, profile.gymDaysPerWeek || 4));

  // Determine exercise count based on session duration:
  // ~30 min: 3-4 exercises, shorter rests
  // ~45 min: 4-5 exercises
  // ~60 min: 5-6 exercises
  // ~75-90 min: 6-8 exercises
  const maxExercises = duration <= 35 ? 4 : duration <= 50 ? 5 : duration <= 65 ? 6 : 7;
  const restTime = duration <= 40 ? 60 : 75;

  const days: WorkoutDay[] = [];
  let splitName = '';
  let overview = '';

  if (daysCount === 1) {
    splitName = '1-Day Total Body Blast';
    overview = `High-efficiency full body routine designed to stimulate all major muscle groups in a ${duration}-minute session.`;
    days.push({
      dayNumber: 1,
      title: 'Full Body Efficiency',
      focus: 'Quads, Chest, Back, Shoulders & Core',
      isRestDay: false,
      warmup: ['Arm circles 1m', 'Bodyweight squats 1m', 'Cat-cow stretch 1m'],
      exercises: [
        { id: 'fb-1', name: 'Barbell Goblet / Back Squat', targetMuscle: 'Quadriceps & Glutes', sets: 4, reps: '8-10', restSeconds: restTime, tips: 'Keep chest upright and drive through midfoot.' },
        { id: 'fb-2', name: 'Dumbbell Bench Press', targetMuscle: 'Chest & Triceps', sets: 4, reps: '8-12', restSeconds: restTime, tips: 'Tuck elbows at 45 degrees, full range of motion.' },
        { id: 'fb-3', name: 'Lat Pulldown or Pull-ups', targetMuscle: 'Lats & Upper Back', sets: 4, reps: '8-12', restSeconds: restTime, tips: 'Pull elbows down toward back pockets.' },
        { id: 'fb-4', name: 'Dumbbell Roman Deadlift', targetMuscle: 'Hamstrings & Glutes', sets: 3, reps: '10-12', restSeconds: restTime, tips: 'Hinge hips backwards, flat neutral spine.' },
        { id: 'fb-5', name: 'Standing Overhead Press', targetMuscle: 'Shoulders & Core', sets: 3, reps: '10-12', restSeconds: restTime, tips: 'Brace abs and glutes, press straight overhead.' },
      ].slice(0, maxExercises),
      cooldown: ['Hamstring stretch 1m', 'Doorway chest stretch 1m'],
    });
  } else if (daysCount === 2) {
    splitName = '2-Day Full Body Split (A / B)';
    overview = `Two distinct full-body sessions providing high frequency stimulation with full recovery days between workouts.`;
    days.push(
      {
        dayNumber: 1,
        title: 'Full Body A (Quad & Push Focus)',
        focus: 'Quadriceps, Chest, Shoulders & Triceps',
        isRestDay: false,
        warmup: ['Leg swings', 'Band pull-aparts', 'Torso twists'],
        exercises: [
          { id: 'fbA-1', name: 'Barbell Squat', targetMuscle: 'Quadriceps', sets: 4, reps: '6-8', restSeconds: restTime, tips: 'Brace core before descent.' },
          { id: 'fbA-2', name: 'Incline Dumbbell Press', targetMuscle: 'Upper Chest', sets: 3, reps: '8-10', restSeconds: restTime, tips: 'Control the 2-second negative eccentric.' },
          { id: 'fbA-3', name: 'Seated Cable Row', targetMuscle: 'Mid-Back', sets: 3, reps: '10-12', restSeconds: restTime, tips: 'Squeeze shoulder blades together.' },
          { id: 'fbA-4', name: 'Dumbbell Lateral Raise', targetMuscle: 'Lateral Deltoids', sets: 3, reps: '12-15', restSeconds: 60, tips: 'Lead with elbows, avoid using body momentum.' },
          { id: 'fbA-5', name: 'Cable Tricep Pushdown', targetMuscle: 'Triceps', sets: 3, reps: '12-15', restSeconds: 60, tips: 'Keep upper arms pinned at ribs.' },
        ].slice(0, maxExercises),
        cooldown: ['Quad stretch', 'Chest stretch'],
      },
      {
        dayNumber: 2,
        title: 'Full Body B (Hinge & Pull Focus)',
        focus: 'Hamstrings, Back, Biceps & Core',
        isRestDay: false,
        warmup: ['Hip openers', 'Wrist circles', 'Light cardio 3m'],
        exercises: [
          { id: 'fbB-1', name: 'Romanian Deadlift (RDL)', targetMuscle: 'Hamstrings & Posterior Chain', sets: 4, reps: '8-10', restSeconds: restTime, tips: 'Feel deep hamstring stretch at bottom.' },
          { id: 'fbB-2', name: 'Lat Pulldown / Chin-ups', targetMuscle: 'Lats & Biceps', sets: 4, reps: '8-12', restSeconds: restTime, tips: 'Slight arch in upper chest, lead with chest.' },
          { id: 'fbB-3', name: 'Dumbbell Shoulder Press', targetMuscle: 'Anterior & Lateral Delts', sets: 3, reps: '8-10', restSeconds: restTime, tips: 'Full press lockout without hyperextending back.' },
          { id: 'fbB-4', name: 'Walking Dumbbell Lunges', targetMuscle: 'Glutes & Quads', sets: 3, reps: '10 per leg', restSeconds: restTime, tips: 'Maintain balance and upright torso.' },
          { id: 'fbB-5', name: 'Incline Dumbbell Bicep Curl', targetMuscle: 'Biceps', sets: 3, reps: '10-12', restSeconds: 60, tips: 'Get a full stretch at bottom of each rep.' },
        ].slice(0, maxExercises),
        cooldown: ['Couch stretch', 'Child pose stretch'],
      }
    );
  } else if (daysCount === 3) {
    splitName = '3-Day Push / Pull / Legs';
    overview = `Classic 3-day muscle building split isolating movement patterns to maximize progressive overload within ${duration}-minute sessions.`;
    days.push(
      {
        dayNumber: 1,
        title: 'Day 1: Push (Chest, Shoulders & Triceps)',
        focus: 'Pectorals, Anterior/Lateral Delts, Triceps',
        isRestDay: false,
        warmup: ['Arm circles', 'Push-up plus', 'Banded external rotations'],
        exercises: [
          { id: 'p1', name: 'Barbell Flat Bench Press', targetMuscle: 'Chest', sets: 4, reps: '6-8', restSeconds: restTime, tips: 'Plant feet flat, drive through heels.' },
          { id: 'p2', name: 'Incline Dumbbell Bench Press', targetMuscle: 'Upper Chest', sets: 3, reps: '8-10', restSeconds: restTime, tips: 'Set bench to 30-degree incline.' },
          { id: 'p3', name: 'Seated Dumbbell Shoulder Press', targetMuscle: 'Front Deltoids', sets: 3, reps: '8-12', restSeconds: restTime, tips: 'Press directly above crown of head.' },
          { id: 'p4', name: 'Dumbbell Lateral Raise', targetMuscle: 'Side Delts', sets: 4, reps: '12-15', restSeconds: 60, tips: 'Slight forward lean, raise arms to parallel.' },
          { id: 'p5', name: 'Tricep Rope Overhead Extension', targetMuscle: 'Triceps Long Head', sets: 3, reps: '12-15', restSeconds: 60, tips: 'Flatter elbows out slightly at full extension.' },
        ].slice(0, maxExercises),
        cooldown: ['Chest wall stretch', 'Overhead tricep stretch'],
      },
      {
        dayNumber: 2,
        title: 'Day 2: Pull (Back, Rear Delts & Biceps)',
        focus: 'Lats, Rhomboids, Rear Delts, Biceps',
        isRestDay: false,
        warmup: ['Scapular shrugs', 'Light rowing', 'Band dislocations'],
        exercises: [
          { id: 'pl1', name: 'Chest-Supported Row', targetMuscle: 'Mid-Back & Rhomboids', sets: 4, reps: '8-10', restSeconds: restTime, tips: 'Drive elbows back, eliminate lower back momentum.' },
          { id: 'pl2', name: 'Wide-Grip Lat Pulldown', targetMuscle: 'Latissimus Dorsi', sets: 4, reps: '10-12', restSeconds: restTime, tips: 'Pull bar toward upper clavicle.' },
          { id: 'pl3', name: 'Face Pulls with Rope', targetMuscle: 'Rear Delts & Rotator Cuff', sets: 4, reps: '15', restSeconds: 60, tips: 'Pull rope toward eyes, external rotation at end.' },
          { id: 'pl4', name: 'Barbell or Dumbbell Curl', targetMuscle: 'Biceps', sets: 3, reps: '10-12', restSeconds: 60, tips: 'Keep elbows locked at sides.' },
          { id: 'pl5', name: 'Hammer Curls', targetMuscle: 'Brachialis & Forearms', sets: 3, reps: '12', restSeconds: 60, tips: 'Neutral grip throughout the lift.' },
        ].slice(0, maxExercises),
        cooldown: ['Lat stretch on rig', 'Bicep doorway stretch'],
      },
      {
        dayNumber: 3,
        title: 'Day 3: Legs & Core (Quads, Hamstrings & Calves)',
        focus: 'Lower Body & Abdominals',
        isRestDay: false,
        warmup: ['Bodyweight deep squats', 'Ankle mobility rocks', 'Glute bridges'],
        exercises: [
          { id: 'l1', name: 'Barbell or Leg Press Squat', targetMuscle: 'Quadriceps', sets: 4, reps: '8-10', restSeconds: restTime, tips: 'Knees track in line with toes.' },
          { id: 'l2', name: 'Romanian Deadlift (RDL)', targetMuscle: 'Hamstrings & Glutes', sets: 4, reps: '8-10', restSeconds: restTime, tips: 'Push hips back until deep stretch is felt.' },
          { id: 'l3', name: 'Bulgarian Split Squat or Leg Ext.', targetMuscle: 'Quads & Glutes', sets: 3, reps: '10 per leg', restSeconds: restTime, tips: 'Control descent down smoothly.' },
          { id: 'l4', name: 'Standing Calf Raise', targetMuscle: 'Calves (Gastrocnemius)', sets: 4, reps: '12-15', restSeconds: 60, tips: 'Hold 2 second stretch at bottom, squeeze peak.' },
          { id: 'l5', name: 'Hanging Leg Raise or Plank', targetMuscle: 'Core & Rectus Abdominis', sets: 3, reps: '12-15 reps / 45s', restSeconds: 60, tips: 'Curl pelvis up, don’t just swing legs.' },
        ].slice(0, maxExercises),
        cooldown: ['Hamstring hurdle stretch', 'Pigeon pose for glutes'],
      }
    );
  } else if (daysCount === 4) {
    splitName = '4-Day Upper / Lower Split';
    overview = `Evidence-based 4-day split hitting each muscle group twice weekly with optimal volume for ${duration}-minute workouts.`;
    days.push(
      {
        dayNumber: 1,
        title: 'Day 1: Upper Body Heavy',
        focus: 'Chest, Upper Back, Shoulders & Arms',
        isRestDay: false,
        warmup: ['Band pull-aparts', 'Arm circles', 'Rotator cuff rotations'],
        exercises: [
          { id: 'u1-1', name: 'Barbell Bench Press', targetMuscle: 'Pectoralis Major', sets: 4, reps: '6-8', restSeconds: restTime, tips: 'Firm grip, lower bar under control.' },
          { id: 'u1-2', name: 'Bent-Over Barbell Row', targetMuscle: 'Upper Back & Lats', sets: 4, reps: '6-8', restSeconds: restTime, tips: 'Torso at 45 degrees, pull to lower ribcage.' },
          { id: 'u1-3', name: 'Seated Dumbbell Overhead Press', targetMuscle: 'Deltoids', sets: 3, reps: '8-10', restSeconds: restTime, tips: 'Full extension overhead without arching lumbar.' },
          { id: 'u1-4', name: 'Cable Chest Fly', targetMuscle: 'Chest Squeeze', sets: 3, reps: '12-15', restSeconds: 60, tips: 'Hug a barrel movement, squeeze inner chest.' },
          { id: 'u1-5', name: 'Superset: Barbell Curl + Skullcrusher', targetMuscle: 'Biceps & Triceps', sets: 3, reps: '10-12', restSeconds: 60, tips: 'Continuous tension without resting between arms.' },
        ].slice(0, maxExercises),
        cooldown: ['Chest wall stretch', 'Upper back foam roll'],
      },
      {
        dayNumber: 2,
        title: 'Day 2: Lower Body Heavy',
        focus: 'Quadriceps, Hamstrings & Glutes',
        isRestDay: false,
        warmup: ['Hip 90/90s', 'Bodyweight squats', 'High knees'],
        exercises: [
          { id: 'l1-1', name: 'Barbell Back Squat', targetMuscle: 'Quadriceps & Core', sets: 4, reps: '6-8', restSeconds: restTime, tips: 'Depth below parallel, knees tracking toes.' },
          { id: 'l1-2', name: 'Romanian Deadlift (Dumbbell or Barbell)', targetMuscle: 'Hamstrings & Glutes', sets: 4, reps: '8-10', restSeconds: restTime, tips: 'Hinge hips backwards with proud chest.' },
          { id: 'l1-3', name: 'Leg Press', targetMuscle: 'Quadriceps', sets: 3, reps: '10-12', restSeconds: restTime, tips: 'Do not lock out knees at top.' },
          { id: 'l1-4', name: 'Lying Leg Curl', targetMuscle: 'Hamstrings', sets: 3, reps: '10-12', restSeconds: 60, tips: 'Control negative 2-3 seconds down.' },
          { id: 'l1-5', name: 'Standing Calf Raise', targetMuscle: 'Calves', sets: 4, reps: '15', restSeconds: 45, tips: 'Full stretch at bottom, explosive rise.' },
        ].slice(0, maxExercises),
        cooldown: ['Couch stretch', 'Hamstring stretch'],
      },
      {
        dayNumber: 3,
        title: 'Day 3: Upper Body Hypertrophy',
        focus: 'Upper Body Pump & Volume',
        isRestDay: false,
        warmup: ['Light cardio 3m', 'Dynamic shoulder rolls'],
        exercises: [
          { id: 'u2-1', name: 'Incline Dumbbell Press', targetMuscle: 'Upper Pectorals', sets: 4, reps: '8-12', restSeconds: restTime, tips: 'Focus on maximum chest contraction.' },
          { id: 'u2-2', name: 'Lat Pulldown (Neutral Grip)', targetMuscle: 'Lats & Teres Major', sets: 4, reps: '10-12', restSeconds: restTime, tips: 'Drive elbows down into hips.' },
          { id: 'u2-3', name: 'Cable Lateral Raise', targetMuscle: 'Side Delts', sets: 4, reps: '12-15', restSeconds: 60, tips: 'Constant tension provided by cable line.' },
          { id: 'u2-4', name: 'Face Pulls', targetMuscle: 'Rear Delts & Traps', sets: 3, reps: '15', restSeconds: 60, tips: 'External rotation with rope.' },
          { id: 'u2-5', name: 'Incline Dumbbell Bicep Curl', targetMuscle: 'Biceps', sets: 3, reps: '12', restSeconds: 60, tips: 'Deep stretch at bottom, strict form.' },
        ].slice(0, maxExercises),
        cooldown: ['Shoulder cross-body stretch', 'Lat stretch'],
      },
      {
        dayNumber: 4,
        title: 'Day 4: Lower Body & Abs Hypertrophy',
        focus: 'Hamstring, Quad & Core Isolation',
        isRestDay: false,
        warmup: ['Glute bridges', 'Lateral lunges'],
        exercises: [
          { id: 'l2-1', name: 'Trap Bar or Barbell Deadlift', targetMuscle: 'Posterior Chain', sets: 4, reps: '5-8', restSeconds: restTime, tips: 'Flat spine, push the floor away.' },
          { id: 'l2-2', name: 'Bulgarian Split Squats', targetMuscle: 'Quads & Glutes', sets: 3, reps: '10-12 per leg', restSeconds: restTime, tips: 'Keep front foot flat, torso upright.' },
          { id: 'l2-3', name: 'Seated Leg Extension', targetMuscle: 'Rectus Femoris', sets: 3, reps: '12-15', restSeconds: 60, tips: 'Pause 1 second at full knee extension.' },
          { id: 'l2-4', name: 'Seated Leg Curl', targetMuscle: 'Hamstrings', sets: 3, reps: '12-15', restSeconds: 60, tips: 'Slow eccentric tempo.' },
          { id: 'l2-5', name: 'Cable Woodchopper / Ab Crunch', targetMuscle: 'Obliques & Abs', sets: 3, reps: '15 per side', restSeconds: 45, tips: 'Rotate with core, not arms.' },
        ].slice(0, maxExercises),
        cooldown: ['Pigeon stretch', 'Quad stretch'],
      }
    );
  } else {
    // 5 to 7 days: Push / Pull / Legs + Upper / Lower
    splitName = `${daysCount}-Day Athlete Split`;
    overview = `Advanced high-frequency training system distributing volume across ${daysCount} days with strict ${duration}-minute time management.`;
    const dayTemplates = [
      {
        title: 'Day 1: Chest & Triceps (Push A)',
        focus: 'Chest, Front Delts, Triceps',
        exercises: [
          { id: 'd1-1', name: 'Barbell Bench Press', targetMuscle: 'Chest', sets: 4, reps: '8', restSeconds: restTime, tips: 'Drive through floor, arch slightly.' },
          { id: 'd1-2', name: 'Incline Dumbbell Press', targetMuscle: 'Upper Chest', sets: 3, reps: '10', restSeconds: restTime, tips: 'Keep elbows at 45 degrees.' },
          { id: 'd1-3', name: 'Cable Chest Fly', targetMuscle: 'Inner Chest', sets: 3, reps: '12', restSeconds: 60, tips: 'Squeeze hands together at apex.' },
          { id: 'd1-4', name: 'Tricep Rope Pushdown', targetMuscle: 'Triceps', sets: 3, reps: '12', restSeconds: 60, tips: 'Lock out fully at bottom.' },
        ],
      },
      {
        title: 'Day 2: Back & Biceps (Pull A)',
        focus: 'Lats, Upper Back, Biceps',
        exercises: [
          { id: 'd2-1', name: 'Barbell Deadlift', targetMuscle: 'Back & Glutes', sets: 4, reps: '5', restSeconds: restTime, tips: 'Keep bar tight against shins.' },
          { id: 'd2-2', name: 'Lat Pulldown', targetMuscle: 'Lats', sets: 4, reps: '10', restSeconds: restTime, tips: 'Pull with elbows, not wrists.' },
          { id: 'd2-3', name: 'Seated Cable Row', targetMuscle: 'Rhomboids', sets: 3, reps: '12', restSeconds: 60, tips: 'Squeeze shoulder blades.' },
          { id: 'd2-4', name: 'Barbell Bicep Curl', targetMuscle: 'Biceps', sets: 3, reps: '10', restSeconds: 60, tips: 'Strict form, no swinging.' },
        ],
      },
      {
        title: 'Day 3: Quads, Hamstrings & Calves (Legs A)',
        focus: 'Lower Body Power',
        exercises: [
          { id: 'd3-1', name: 'Barbell Back Squat', targetMuscle: 'Quads & Glutes', sets: 4, reps: '8', restSeconds: restTime, tips: 'Descend to parallel, chest up.' },
          { id: 'd3-2', name: 'Romanian Deadlift', targetMuscle: 'Hamstrings', sets: 3, reps: '10', restSeconds: restTime, tips: 'Hinge back deeply.' },
          { id: 'd3-3', name: 'Walking Lunges', targetMuscle: 'Glutes & Quads', sets: 3, reps: '12 / leg', restSeconds: 60, tips: 'Take controlled, deep strides.' },
          { id: 'd3-4', name: 'Standing Calf Raise', targetMuscle: 'Calves', sets: 4, reps: '15', restSeconds: 45, tips: 'Pause at bottom stretch.' },
        ],
      },
      {
        title: 'Day 4: Shoulders & Arms',
        focus: 'Deltoids, Biceps & Triceps',
        exercises: [
          { id: 'd4-1', name: 'Standing Overhead Press', targetMuscle: 'Shoulders', sets: 4, reps: '8', restSeconds: restTime, tips: 'Tight glutes, lock out overhead.' },
          { id: 'd4-2', name: 'Dumbbell Lateral Raise', targetMuscle: 'Side Delts', sets: 4, reps: '15', restSeconds: 45, tips: 'Raise to shoulder level.' },
          { id: 'd4-3', name: 'Incline Dumbbell Curl', targetMuscle: 'Biceps', sets: 3, reps: '12', restSeconds: 60, tips: 'Deep bicep stretch.' },
          { id: 'd4-4', name: 'Skull Crushers', targetMuscle: 'Triceps', sets: 3, reps: '12', restSeconds: 60, tips: 'Lower bar towards forehead safely.' },
        ],
      },
      {
        title: 'Day 5: Full Body / Weak Points & Core',
        focus: 'Compound conditioning & core stability',
        exercises: [
          { id: 'd5-1', name: 'Front Squat or Leg Press', targetMuscle: 'Quads', sets: 3, reps: '10', restSeconds: restTime, tips: 'Elbows high, vertical torso.' },
          { id: 'd5-2', name: 'Pull-Ups / Chin-Ups', targetMuscle: 'Lats & Arms', sets: 3, reps: 'Max / 8-10', restSeconds: restTime, tips: 'Full hang to chin over bar.' },
          { id: 'd5-3', name: 'Dumbbell Incline Bench', targetMuscle: 'Chest', sets: 3, reps: '10', restSeconds: restTime, tips: 'Full chest stretch.' },
          { id: 'd5-4', name: 'Hanging Leg Raises', targetMuscle: 'Core', sets: 3, reps: '15', restSeconds: 45, tips: 'Roll hips toward ribs.' },
        ],
      },
      {
        title: 'Day 6: Functional Conditioning & Mobility',
        focus: 'Active recovery, core, agility',
        exercises: [
          { id: 'd6-1', name: 'Kettlebell Swings', targetMuscle: 'Glutes & Core', sets: 4, reps: '15', restSeconds: 45, tips: 'Explosive hip snap.' },
          { id: 'd6-2', name: 'Goblet Squats', targetMuscle: 'Quads', sets: 3, reps: '12', restSeconds: 45, tips: 'Elbows inside knees at bottom.' },
          { id: 'd6-3', name: 'Push-ups to Pike', targetMuscle: 'Chest & Shoulders', sets: 3, reps: '12', restSeconds: 45, tips: 'Drive hips up into pike at top.' },
          { id: 'd6-4', name: 'Plank with Shoulder Taps', targetMuscle: 'Core Stability', sets: 3, reps: '20 taps', restSeconds: 45, tips: 'Do not rock hips side to side.' },
        ],
      },
      {
        title: 'Day 7: Active Recovery & Mobility',
        focus: 'Mobility, foam rolling and light cardio',
        exercises: [
          { id: 'd7-1', name: 'World’s Greatest Stretch', targetMuscle: 'Full Body Mobility', sets: 3, reps: '5 / side', restSeconds: 30, tips: 'Hold each movement for 3s.' },
          { id: 'd7-2', name: 'Banded Hip Distractions', targetMuscle: 'Hips', sets: 3, reps: '10 / side', restSeconds: 30, tips: 'Relax into band tension.' },
          { id: 'd7-3', name: 'Foam Rolling Major Muscles', targetMuscle: 'Myofascial Release', sets: 3, reps: '60s per muscle', restSeconds: 30, tips: 'Roll slowly over tight spots.' },
        ],
      },
    ];

    for (let i = 0; i < daysCount; i++) {
      const template = dayTemplates[i];
      days.push({
        dayNumber: i + 1,
        title: template.title,
        focus: template.focus,
        isRestDay: false,
        warmup: ['Dynamic full-body warmup 3m', 'Joint circles'],
        exercises: template.exercises.slice(0, maxExercises),
        cooldown: ['Targeted static stretches 2m'],
      });
    }
  }

  return {
    id: `plan_${Date.now()}`,
    title: `${profile.gymDaysPerWeek}-Day Custom ${profile.goal.toUpperCase()} Routine`,
    splitType: splitName,
    overview,
    durationMinutes: duration,
    createdAt: new Date().toISOString(),
    userSnapshot: profile,
    days,
    nutrition,
  };
}
