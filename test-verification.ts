import { generateFallbackWorkout, calculateNutrition } from './src/services/fallbackGenerator';
import { UserProfile } from './src/types/fitness';

console.log('--- RUNNING FITGURU AUTOMATED TEST SUITE ---');

const testProfiles: { name: string; profile: UserProfile }[] = [
  {
    name: '4-Day Upper/Lower Hypertrophy (45 min)',
    profile: {
      weight: 75,
      weightUnit: 'kg',
      height: 178,
      heightUnit: 'cm',
      age: 25,
      gender: 'male',
      gymDaysPerWeek: 4,
      durationMinutes: 45,
      goal: 'hypertrophy',
      experienceLevel: 'intermediate',
      equipment: 'full_gym',
    },
  },
  {
    name: '3-Day Push/Pull/Legs Fat Loss (60 min)',
    profile: {
      weight: 160,
      weightUnit: 'lbs',
      height: 70,
      heightUnit: 'ft_in',
      age: 30,
      gender: 'female',
      gymDaysPerWeek: 3,
      durationMinutes: 60,
      goal: 'fat_loss',
      experienceLevel: 'beginner',
      equipment: 'full_gym',
    },
  },
  {
    name: '5-Day Athlete Strength (75 min)',
    profile: {
      weight: 85,
      weightUnit: 'kg',
      height: 185,
      heightUnit: 'cm',
      age: 28,
      gender: 'male',
      gymDaysPerWeek: 5,
      durationMinutes: 75,
      goal: 'strength',
      experienceLevel: 'advanced',
      equipment: 'full_gym',
    },
  },
];

let allPassed = true;

for (const t of testProfiles) {
  console.log(`\nTesting Profile: ${t.name}`);
  const plan = generateFallbackWorkout(t.profile);
  const nutrition = calculateNutrition(t.profile);

  console.log(`  Split: ${plan.splitType}`);
  console.log(`  Total Days: ${plan.days.length} (Expected: ${t.profile.gymDaysPerWeek})`);
  console.log(`  Session Duration: ${plan.durationMinutes} min`);
  console.log(`  Nutrition: ${nutrition.dailyCalories} kcal | ${nutrition.proteinGrams}g Protein | ${nutrition.waterLiters}L Water`);

  if (plan.days.length !== t.profile.gymDaysPerWeek) {
    console.error(`  FAIL: Days mismatch. Got ${plan.days.length}`);
    allPassed = false;
  }

  plan.days.forEach((d) => {
    console.log(`    Day ${d.dayNumber} [${d.focus}]: ${d.exercises.length} exercises`);
    if (d.exercises.length === 0) {
      console.error(`  FAIL: Day ${d.dayNumber} has 0 exercises`);
      allPassed = false;
    }
    // Verify each exercise has name, sets, reps, restSeconds, tips
    d.exercises.forEach((ex) => {
      if (!ex.name || !ex.sets || !ex.reps || !ex.restSeconds) {
        console.error(`  FAIL: Incomplete exercise model in ${ex.name}`);
        allPassed = false;
      }
    });
  });
}

if (allPassed) {
  console.log('\n=========================================');
  console.log('✅ ALL VERIFICATION CHECKS PASSED (100%)');
  console.log('=========================================');
  process.exit(0);
} else {
  console.error('\n❌ VERIFICATION CHECKS FAILED');
  process.exit(1);
}
