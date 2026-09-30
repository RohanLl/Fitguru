import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Alert,
} from 'react-native';
import { ModernIcon } from '../components/ModernIcon';
import * as Haptics from 'expo-haptics';
import { WorkoutPlan } from '../types/fitness';
import { Header } from '../components/Header';
import { ExerciseCard } from '../components/ExerciseCard';
import { RestTimerModal } from '../components/RestTimerModal';
import { NutritionModal } from '../components/NutritionModal';
import { StorageService } from '../services/storageService';
import { Colors } from '../theme/colors';

interface WorkoutPlanScreenProps {
  plan: WorkoutPlan;
  onOpenSettings: () => void;
  onResetWorkout: () => void;
}

export const WorkoutPlanScreen: React.FC<WorkoutPlanScreenProps> = ({
  plan,
  onOpenSettings,
  onResetWorkout,
}) => {
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  const [completedSets, setCompletedSets] = useState<Record<string, Record<number, boolean>>>({});
  const [timerVisible, setTimerVisible] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(60);
  const [nutritionVisible, setNutritionVisible] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState(false);

  useEffect(() => {
    loadCompletedSets();
  }, [plan.id]);

  const loadCompletedSets = async () => {
    const saved = await StorageService.getCompletedSets(plan.id);
    // Parse flat map { "exId_0": true } into nested structure
    const nested: Record<string, Record<number, boolean>> = {};
    for (const [key, val] of Object.entries(saved)) {
      const parts = key.split('_');
      if (parts.length >= 2) {
        const sIdx = parseInt(parts.pop() || '0', 10);
        const exId = parts.join('_');
        if (!nested[exId]) nested[exId] = {};
        nested[exId][sIdx] = val;
      }
    }
    setCompletedSets(nested);
  };

  const handleToggleSet = async (exerciseId: string, setIndex: number) => {
    setCompletedSets((prev) => {
      const exSets = { ...(prev[exerciseId] || {}) };
      exSets[setIndex] = !exSets[setIndex];

      const updated = {
        ...prev,
        [exerciseId]: exSets,
      };

      // Flatten and save
      const flatMap: Record<string, boolean> = {};
      for (const [eId, sMap] of Object.entries(updated)) {
        for (const [sI, isDone] of Object.entries(sMap)) {
          if (isDone) flatMap[`${eId}_${sI}`] = true;
        }
      }
      StorageService.saveCompletedSets(plan.id, flatMap);

      return updated;
    });
  };

  const handleStartRestTimer = (restSeconds: number) => {
    setTimerSeconds(restSeconds);
    setTimerVisible(true);
  };

  const handleSharePlan = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (e) {}

    let text = `🏋️ ${plan.title}\n`;
    text += `Split: ${plan.splitType} • ${plan.durationMinutes} min/session\n\n`;

    plan.days.forEach((day) => {
      text += `📅 ${day.title} (${day.focus})\n`;
      day.exercises.forEach((ex, i) => {
        text += `  ${i + 1}. ${ex.name} - ${ex.sets} sets x ${ex.reps} (Rest: ${ex.restSeconds}s)\n`;
      });
      text += '\n';
    });

    if (Platform.OS === 'web') {
      if (navigator.clipboard) {
        navigator.clipboard.writeText(text);
        setCopyFeedback(true);
        setTimeout(() => setCopyFeedback(false), 2500);
      } else {
        window.alert(text);
      }
    } else {
      Alert.alert('Workout Copied', 'Your custom workout program has been copied to clipboard!');
    }
  };

  const currentDay = plan.days[selectedDayIndex] || plan.days[0];

  return (
    <View style={styles.container}>
      <Header
        title="FitGuru Plan"
        subtitle={`${plan.splitType} • ${plan.days.length} Days`}
        onOpenSettings={onOpenSettings}
        onOpenNutrition={() => setNutritionVisible(true)}
      />

      {/* Plan Header Card */}
      <View style={styles.summaryBar}>
        <View style={styles.summaryTextGroup}>
          <Text style={styles.planTitle} numberOfLines={1}>{plan.title}</Text>
          <View style={styles.badgesRow}>
            <View style={styles.durationBadge}>
              <ModernIcon name="time" size={13} color={Colors.cyan} />
              <Text style={styles.durationBadgeText}>{plan.durationMinutes} min / workout</Text>
            </View>
            <View style={styles.splitBadge}>
              <ModernIcon name="fitness" size={13} color={Colors.primary} />
              <Text style={styles.splitBadgeText}>{plan.days.length} Days / Week</Text>
            </View>
          </View>
        </View>

        <TouchableOpacity style={styles.shareBtn} onPress={handleSharePlan} activeOpacity={0.7}>
          <ModernIcon name={copyFeedback ? 'checkmark' : 'share'} size={18} color={copyFeedback ? Colors.primary : Colors.text} />
          <Text style={[styles.shareBtnText, copyFeedback && { color: Colors.primary }]}>
            {copyFeedback ? 'Copied!' : 'Share'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Horizontal Day Tabs */}
      <View style={styles.dayTabsContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dayTabsScroll}>
          {plan.days.map((day, idx) => {
            const isSelected = selectedDayIndex === idx;
            return (
              <TouchableOpacity
                key={day.dayNumber || idx}
                style={[styles.dayTab, isSelected && styles.dayTabActive]}
                onPress={() => {
                  try {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  } catch (e) {}
                  setSelectedDayIndex(idx);
                }}
                activeOpacity={0.7}
              >
                <Text style={[styles.dayTabNumber, isSelected && styles.dayTabNumberActive]}>
                  Day {day.dayNumber}
                </Text>
                <Text style={[styles.dayTabFocus, isSelected && styles.dayTabFocusActive]} numberOfLines={1}>
                  {day.focus.split(',')[0]}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Active Day Content */}
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollBody}>
        {/* Day Headline */}
        <View style={styles.dayHeadline}>
          <Text style={styles.dayTitleText}>{currentDay.title}</Text>
          <View style={styles.focusChip}>
            <ModernIcon name="person" size={13} color={Colors.primary} />
            <Text style={styles.focusText}>Focus: {currentDay.focus}</Text>
          </View>
        </View>

        {/* Warmup Section */}
        {currentDay.warmup && currentDay.warmup.length > 0 && (
          <View style={styles.routineSection}>
            <View style={styles.routineHeader}>
              <ModernIcon name="flame" size={16} color={Colors.orange} />
              <Text style={styles.routineHeaderText}>Dynamic Warm-up (3-5 min)</Text>
            </View>
            <View style={styles.routinePills}>
              {currentDay.warmup.map((w, idx) => (
                <View key={idx} style={styles.routinePill}>
                  <Text style={styles.routinePillText}>{w}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Exercises Header */}
        <View style={styles.exercisesHeaderRow}>
          <Text style={styles.sectionHeader}>Working Exercises ({currentDay.exercises.length})</Text>
          <TouchableOpacity
            style={styles.inlineTimerBtn}
            onPress={() => {
              setTimerSeconds(60);
              setTimerVisible(true);
            }}
          >
            <ModernIcon name="timer" size={14} color={Colors.primary} />
            <Text style={styles.inlineTimerText}>Rest Timer</Text>
          </TouchableOpacity>
        </View>

        {/* Exercise Cards */}
        {currentDay.exercises.map((exercise, idx) => (
          <ExerciseCard
            key={exercise.id || idx}
            exercise={exercise}
            index={idx}
            completedSets={completedSets[exercise.id] || {}}
            onToggleSet={handleToggleSet}
            onStartRestTimer={handleStartRestTimer}
          />
        ))}

        {/* Cooldown Section */}
        {currentDay.cooldown && currentDay.cooldown.length > 0 && (
          <View style={styles.routineSection}>
            <View style={styles.routineHeader}>
              <ModernIcon name="leaf" size={16} color={Colors.cyan} />
              <Text style={[styles.routineHeaderText, { color: Colors.cyan }]}>
                Post-Workout Cool-Down & Mobility
              </Text>
            </View>
            <View style={styles.routinePills}>
              {currentDay.cooldown.map((c, idx) => (
                <View key={idx} style={[styles.routinePill, { borderColor: 'rgba(6, 182, 212, 0.2)' }]}>
                  <Text style={styles.routinePillText}>{c}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Bottom Actions */}
        <View style={styles.bottomActions}>
          <TouchableOpacity
            style={styles.nutritionActionBtn}
            onPress={() => setNutritionVisible(true)}
            activeOpacity={0.8}
          >
            <ModernIcon name="restaurant" size={18} color="#0B0F19" />
            <Text style={styles.nutritionActionText}>View Calorie & Macro Target</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.recalibrateBtn}
            onPress={onResetWorkout}
            activeOpacity={0.8}
          >
            <ModernIcon name="settings" size={18} color={Colors.textSecondary} />
            <Text style={styles.recalibrateText}>Adjust Biometrics / Schedule</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Modals */}
      <RestTimerModal
        visible={timerVisible}
        onClose={() => setTimerVisible(false)}
        initialSeconds={timerSeconds}
      />

      <NutritionModal
        visible={nutritionVisible}
        onClose={() => setNutritionVisible(false)}
        nutrition={plan.nutrition}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  summaryBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surfaceCard,
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  summaryTextGroup: {
    flex: 1,
  },
  planTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.text,
  },
  badgesRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  durationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(6, 182, 212, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  durationBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.cyan,
  },
  splitBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  splitBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.primary,
  },
  shareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.surfaceLight,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  shareBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.text,
  },
  dayTabsContainer: {
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  dayTabsScroll: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 8,
  },
  dayTab: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: Colors.surfaceLight,
    borderWidth: 1,
    borderColor: 'transparent',
    alignItems: 'center',
    minWidth: 80,
  },
  dayTabActive: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderColor: Colors.primary,
  },
  dayTabNumber: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.textSecondary,
  },
  dayTabNumberActive: {
    color: Colors.primary,
  },
  dayTabFocus: {
    fontSize: 10,
    color: Colors.textMuted,
    marginTop: 2,
    maxWidth: 90,
  },
  dayTabFocusActive: {
    color: Colors.primaryLight,
  },
  scrollBody: {
    padding: 16,
  },
  dayHeadline: {
    marginBottom: 16,
  },
  dayTitleText: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.text,
  },
  focusChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
  },
  focusText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.primary,
  },
  routineSection: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  routineHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  routineHeaderText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.orange,
  },
  routinePills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  routinePill: {
    backgroundColor: Colors.surfaceLight,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  routinePillText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  exercisesHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.text,
  },
  inlineTimerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  inlineTimerText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
  },
  bottomActions: {
    marginTop: 16,
    gap: 10,
  },
  nutritionActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.primary,
    borderRadius: 16,
    paddingVertical: 14,
  },
  nutritionActionText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0B0F19',
  },
  recalibrateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  recalibrateText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
});
