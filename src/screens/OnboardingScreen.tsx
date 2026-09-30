import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Platform,
} from 'react-native';
import { ModernIcon } from '../components/ModernIcon';
import * as Haptics from 'expo-haptics';
import {
  UserProfile,
  Gender,
  WeightUnit,
  HeightUnit,
  FitnessGoal,
  ExperienceLevel,
} from '../types/fitness';
import { Header } from '../components/Header';
import { Colors } from '../theme/colors';

interface OnboardingScreenProps {
  initialProfile?: UserProfile | null;
  onGeneratePlan: (profile: UserProfile) => void;
  onOpenSettings: () => void;
}

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({
  initialProfile,
  onGeneratePlan,
  onOpenSettings,
}) => {
  // Biometric state
  const [gender, setGender] = useState<Gender>(initialProfile?.gender || 'male');
  const [weight, setWeight] = useState<string>(
    initialProfile?.weight ? String(initialProfile.weight) : '75'
  );
  const [weightUnit, setWeightUnit] = useState<WeightUnit>(initialProfile?.weightUnit || 'kg');

  const [height, setHeight] = useState<string>(
    initialProfile?.height ? String(initialProfile.height) : '178'
  );
  const [heightUnit, setHeightUnit] = useState<HeightUnit>(initialProfile?.heightUnit || 'cm');

  const [age, setAge] = useState<number>(initialProfile?.age || 25);

  // Training schedule state
  const [gymDays, setGymDays] = useState<number>(initialProfile?.gymDaysPerWeek || 4);
  const [duration, setDuration] = useState<number>(initialProfile?.durationMinutes || 60);

  // Goal & Experience
  const [goal, setGoal] = useState<FitnessGoal>(initialProfile?.goal || 'hypertrophy');
  const [experience, setExperience] = useState<ExperienceLevel>(
    initialProfile?.experienceLevel || 'intermediate'
  );

  const triggerHaptic = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (e) {}
  };

  const toggleWeightUnit = () => {
    triggerHaptic();
    const currentVal = parseFloat(weight) || 75;
    if (weightUnit === 'kg') {
      setWeightUnit('lbs');
      setWeight(Math.round(currentVal * 2.20462).toString());
    } else {
      setWeightUnit('kg');
      setWeight(Math.round(currentVal / 2.20462).toString());
    }
  };

  const toggleHeightUnit = () => {
    triggerHaptic();
    const currentVal = parseFloat(height) || 178;
    if (heightUnit === 'cm') {
      setHeightUnit('ft_in');
      setHeight(Math.round(currentVal / 2.54).toString()); // Total inches
    } else {
      setHeightUnit('cm');
      setHeight(Math.round(currentVal * 2.54).toString());
    }
  };

  const handleGenerate = () => {
    triggerHaptic();
    const profile: UserProfile = {
      gender,
      weight: parseFloat(weight) || 70,
      weightUnit,
      height: parseFloat(height) || 175,
      heightUnit,
      age: age || 25,
      gymDaysPerWeek: gymDays,
      durationMinutes: duration,
      goal,
      experienceLevel: experience,
      equipment: 'full_gym',
    };
    onGeneratePlan(profile);
  };

  const getSplitRecommendation = (days: number) => {
    switch (days) {
      case 1:
        return 'Total Body Blast';
      case 2:
        return 'Full Body A / B';
      case 3:
        return 'Push / Pull / Legs (PPL)';
      case 4:
        return 'Upper / Lower (Golden Standard)';
      case 5:
        return 'PPL + Upper / Lower';
      case 6:
        return 'Push / Pull / Legs × 2';
      case 7:
        return 'Daily Periodized Athlete';
      default:
        return 'Customized Split';
    }
  };

  return (
    <View style={styles.container}>
      <Header
        title="Biometric Intake"
        subtitle="Step 1 of 2: Personal Profile"
        onOpenSettings={onOpenSettings}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Intro Banner */}
        <View style={styles.banner}>
          <ModernIcon name="sparkles" size={20} color={Colors.primary} />
          <Text style={styles.bannerText}>
            FitGuru AI calibrates your program volume, exercise selection, and recovery intervals based on your exact biometrics.
          </Text>
        </View>

        {/* Section 1: Gender */}
        <Text style={styles.sectionTitle}>1. Gender</Text>
        <View style={styles.genderRow}>
          {(['male', 'female', 'other'] as Gender[]).map((g) => (
            <TouchableOpacity
              key={g}
              style={[styles.genderCard, gender === g && styles.genderCardActive]}
              onPress={() => {
                triggerHaptic();
                setGender(g);
              }}
              activeOpacity={0.7}
            >
              <ModernIcon
                name={g === 'male' ? 'male' : g === 'female' ? 'female' : 'person'}
                size={22}
                color={gender === g ? Colors.primary : Colors.textSecondary}
              />
              <Text style={[styles.genderText, gender === g && styles.genderTextActive]}>
                {g.charAt(0).toUpperCase() + g.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Section 2: Weight & Height */}
        <Text style={styles.sectionTitle}>2. Biometrics</Text>
        <View style={styles.metricsRow}>
          {/* Weight */}
          <View style={styles.metricCard}>
            <View style={styles.metricHeader}>
              <Text style={styles.metricLabel}>Weight</Text>
              <TouchableOpacity onPress={toggleWeightUnit} style={styles.unitToggle}>
                <Text style={styles.unitToggleText}>{weightUnit.toUpperCase()}</Text>
                <ModernIcon name="swap" size={12} color={Colors.primary} />
              </TouchableOpacity>
            </View>
            <View style={styles.inputBox}>
              <TextInput
                style={styles.numericInput}
                keyboardType="numeric"
                value={weight}
                onChangeText={setWeight}
                maxLength={4}
              />
              <Text style={styles.unitSuffix}>{weightUnit}</Text>
            </View>
          </View>

          {/* Height */}
          <View style={styles.metricCard}>
            <View style={styles.metricHeader}>
              <Text style={styles.metricLabel}>Height</Text>
              <TouchableOpacity onPress={toggleHeightUnit} style={styles.unitToggle}>
                <Text style={styles.unitToggleText}>
                  {heightUnit === 'cm' ? 'CM' : 'INCH'}
                </Text>
                <ModernIcon name="swap" size={12} color={Colors.primary} />
              </TouchableOpacity>
            </View>
            <View style={styles.inputBox}>
              <TextInput
                style={styles.numericInput}
                keyboardType="numeric"
                value={height}
                onChangeText={setHeight}
                maxLength={4}
              />
              <Text style={styles.unitSuffix}>{heightUnit === 'cm' ? 'cm' : 'in'}</Text>
            </View>
          </View>
        </View>

        {/* Section 3: Age */}
        <View style={styles.ageCard}>
          <View style={{ flex: 1 }}>
            <Text style={styles.metricLabel}>Age</Text>
            <Text style={styles.ageValue}>{age} <Text style={{ fontSize: 14, color: Colors.textSecondary }}>years old</Text></Text>
          </View>
          <View style={styles.stepperRow}>
            <TouchableOpacity
              style={styles.stepperBtn}
              onPress={() => {
                triggerHaptic();
                setAge((prev) => Math.max(14, prev - 1));
              }}
            >
              <ModernIcon name="remove" size={18} color={Colors.text} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.stepperBtn}
              onPress={() => {
                triggerHaptic();
                setAge((prev) => Math.min(99, prev + 1));
              }}
            >
              <ModernIcon name="add" size={18} color={Colors.primary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Section 4: Gym Days per Week */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>3. Weekly Gym Frequency</Text>
          <View style={styles.splitTag}>
            <Text style={styles.splitTagText}>{getSplitRecommendation(gymDays)}</Text>
          </View>
        </View>

        <View style={styles.daysRow}>
          {[1, 2, 3, 4, 5, 6, 7].map((d) => (
            <TouchableOpacity
              key={d}
              style={[styles.dayChip, gymDays === d && styles.dayChipActive]}
              onPress={() => {
                triggerHaptic();
                setGymDays(d);
              }}
              activeOpacity={0.7}
            >
              <Text style={[styles.dayChipNum, gymDays === d && styles.dayChipNumActive]}>
                {d}
              </Text>
              <Text style={[styles.dayChipSub, gymDays === d && styles.dayChipSubActive]}>
                {d === 1 ? 'day' : 'days'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Section 5: Workout Duration */}
        <Text style={styles.sectionTitle}>4. Target Workout Duration</Text>
        <Text style={styles.sectionSub}>Calibrates exercise count, set volume & rest intervals</Text>
        <View style={styles.durationRow}>
          {[30, 45, 60, 75, 90].map((mins) => (
            <TouchableOpacity
              key={mins}
              style={[styles.durationChip, duration === mins && styles.durationChipActive]}
              onPress={() => {
                triggerHaptic();
                setDuration(mins);
              }}
              activeOpacity={0.7}
            >
              <ModernIcon
                name="time"
                size={16}
                color={duration === mins ? Colors.cyan : Colors.textSecondary}
              />
              <Text
                style={[
                  styles.durationText,
                  duration === mins && styles.durationTextActive,
                ]}
              >
                {mins} min
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Section 6: Primary Goal */}
        <Text style={styles.sectionTitle}>5. Primary Fitness Goal</Text>
        <View style={styles.goalsGrid}>
          {[
            { id: 'hypertrophy', label: 'Muscle Growth', sub: 'Hypertrophy & Aesthetics', icon: 'barbell' },
            { id: 'fat_loss', label: 'Fat Loss', sub: 'Burn fat & preserve muscle', icon: 'flame' },
            { id: 'strength', label: 'Pure Strength', sub: 'Heavy compounds & power', icon: 'sparkles' },
            { id: 'general', label: 'General Health', sub: 'Functional strength & stamina', icon: 'fitness' },
          ].map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[styles.goalCard, goal === item.id && styles.goalCardActive]}
              onPress={() => {
                triggerHaptic();
                setGoal(item.id as FitnessGoal);
              }}
              activeOpacity={0.7}
            >
              <View style={[styles.goalIconCircle, goal === item.id && styles.goalIconActive]}>
                <ModernIcon
                  name={item.icon}
                  size={18}
                  color={goal === item.id ? Colors.primary : Colors.textSecondary}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.goalLabel, goal === item.id && styles.goalLabelActive]}>
                  {item.label}
                </Text>
                <Text style={styles.goalSub}>{item.sub}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Section 7: Experience Level */}
        <Text style={styles.sectionTitle}>6. Experience Level</Text>
        <View style={styles.expRow}>
          {[
            { id: 'beginner', label: 'Beginner', sub: '< 1 yr' },
            { id: 'intermediate', label: 'Intermediate', sub: '1–3 yrs' },
            { id: 'advanced', label: 'Advanced', sub: '3+ yrs' },
          ].map((exp) => (
            <TouchableOpacity
              key={exp.id}
              style={[styles.expChip, experience === exp.id && styles.expChipActive]}
              onPress={() => {
                triggerHaptic();
                setExperience(exp.id as ExperienceLevel);
              }}
              activeOpacity={0.7}
            >
              <Text style={[styles.expLabel, experience === exp.id && styles.expLabelActive]}>
                {exp.label}
              </Text>
              <Text style={styles.expSub}>{exp.sub}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Submit Action */}
        <TouchableOpacity
          style={styles.generateBtn}
          onPress={handleGenerate}
          activeOpacity={0.85}
        >
          <ModernIcon name="sparkles" size={20} color="#0B0F19" />
          <Text style={styles.generateBtnText}>Build Custom Workout Plan</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    padding: 20,
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.2)',
    marginBottom: 20,
  },
  bannerText: {
    flex: 1,
    fontSize: 12,
    color: '#D1FAE5',
    lineHeight: 18,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.text,
    marginTop: 8,
    marginBottom: 10,
    letterSpacing: 0.3,
  },
  sectionSub: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: -6,
    marginBottom: 10,
  },
  genderRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  genderCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  genderCardActive: {
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    borderColor: Colors.primary,
  },
  genderText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  genderTextActive: {
    color: Colors.primary,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 14,
  },
  metricCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  metricHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  metricLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
  },
  unitToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.surfaceLight,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
  },
  unitToggleText: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.primary,
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  numericInput: {
    fontSize: 26,
    fontWeight: '800',
    color: Colors.text,
    padding: 0,
    minWidth: 50,
  },
  unitSuffix: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  ageCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 16,
  },
  ageValue: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.text,
    marginTop: 2,
  },
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  stepperBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 6,
    marginBottom: 8,
  },
  splitTag: {
    backgroundColor: 'rgba(6, 182, 212, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  splitTagText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.cyan,
  },
  daysRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 18,
    gap: 6,
  },
  dayChip: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  dayChipActive: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderColor: Colors.primary,
  },
  dayChipNum: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.textSecondary,
  },
  dayChipNumActive: {
    color: Colors.primary,
  },
  dayChipSub: {
    fontSize: 9,
    color: Colors.textMuted,
    marginTop: 2,
  },
  dayChipSubActive: {
    color: Colors.primary,
    fontWeight: '600',
  },
  durationRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 18,
  },
  durationChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    backgroundColor: Colors.surface,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  durationChipActive: {
    backgroundColor: 'rgba(6, 182, 212, 0.12)',
    borderColor: Colors.cyan,
  },
  durationText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  durationTextActive: {
    color: Colors.cyan,
  },
  goalsGrid: {
    gap: 8,
    marginBottom: 18,
  },
  goalCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.surface,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  goalCardActive: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderColor: Colors.primary,
  },
  goalIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  goalIconActive: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
  },
  goalLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text,
  },
  goalLabelActive: {
    color: Colors.primary,
  },
  goalSub: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  expRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 26,
  },
  expChip: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  expChipActive: {
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    borderColor: Colors.primary,
  },
  expLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  expLabelActive: {
    color: Colors.primary,
  },
  expSub: {
    fontSize: 10,
    color: Colors.textMuted,
    marginTop: 2,
  },
  generateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 18,
    shadowColor: Colors.primary,
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
  generateBtnText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0B0F19',
    letterSpacing: 0.5,
  },
});
