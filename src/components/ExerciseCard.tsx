import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Exercise } from '../types/fitness';
import { Colors } from '../theme/colors';

interface ExerciseCardProps {
  exercise: Exercise;
  index: number;
  completedSets: Record<number, boolean>;
  onToggleSet: (exerciseId: string, setIndex: number) => void;
  onStartRestTimer: (restSeconds: number) => void;
}

export const ExerciseCard: React.FC<ExerciseCardProps> = ({
  exercise,
  index,
  completedSets,
  onToggleSet,
  onStartRestTimer,
}) => {
  const [expanded, setExpanded] = useState(false);

  const handleSetPress = (setIdx: number) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (e) {}
    onToggleSet(exercise.id, setIdx);
  };

  const handleTimerPress = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (e) {}
    onStartRestTimer(exercise.restSeconds || 60);
  };

  // Determine completed count
  let completedCount = 0;
  for (let s = 0; s < exercise.sets; s++) {
    if (completedSets[s]) completedCount++;
  }
  const isFullyComplete = completedCount === exercise.sets;

  return (
    <View style={[styles.card, isFullyComplete && styles.cardComplete]}>
      {/* Top Header */}
      <View style={styles.topRow}>
        <View style={styles.exerciseIndexBadge}>
          <Text style={styles.indexText}>{index + 1}</Text>
        </View>

        <View style={styles.titleArea}>
          <Text style={styles.exerciseName}>{exercise.name}</Text>
          <View style={styles.tagsRow}>
            <View style={styles.muscleBadge}>
              <Text style={styles.muscleText}>{exercise.targetMuscle}</Text>
            </View>
            <View style={styles.metricBadge}>
              <Ionicons name="repeat-outline" size={12} color={Colors.cyan} />
              <Text style={styles.metricText}>{exercise.sets} sets × {exercise.reps}</Text>
            </View>
          </View>
        </View>

        <TouchableOpacity
          style={styles.timerShortcut}
          onPress={handleTimerPress}
          activeOpacity={0.7}
        >
          <Ionicons name="timer-outline" size={16} color={Colors.primary} />
          <Text style={styles.timerText}>{exercise.restSeconds}s</Text>
        </TouchableOpacity>
      </View>

      {/* Sets Tracker Row */}
      <View style={styles.setsContainer}>
        <Text style={styles.setsLabel}>Mark Sets Complete:</Text>
        <View style={styles.setsList}>
          {Array.from({ length: exercise.sets }).map((_, sIdx) => {
            const isDone = Boolean(completedSets[sIdx]);
            return (
              <TouchableOpacity
                key={sIdx}
                style={[styles.setCircle, isDone && styles.setCircleDone]}
                onPress={() => handleSetPress(sIdx)}
                activeOpacity={0.6}
              >
                {isDone ? (
                  <Ionicons name="checkmark" size={14} color="#0B0F19" />
                ) : (
                  <Text style={styles.setNumberText}>{sIdx + 1}</Text>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Form Tips Toggle */}
      {exercise.tips ? (
        <View style={styles.tipsSection}>
          <TouchableOpacity
            style={styles.tipsToggle}
            onPress={() => setExpanded(!expanded)}
            activeOpacity={0.7}
          >
            <Ionicons name="bulb-outline" size={15} color={Colors.orange} />
            <Text style={styles.tipsToggleText}>Trainer Form Cue</Text>
            <Ionicons
              name={expanded ? 'chevron-up' : 'chevron-down'}
              size={16}
              color={Colors.textSecondary}
              style={{ marginLeft: 'auto' }}
            />
          </TouchableOpacity>

          {expanded && (
            <View style={styles.tipsContent}>
              <Text style={styles.tipsText}>{exercise.tips}</Text>
            </View>
          )}
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardComplete: {
    borderColor: 'rgba(16, 185, 129, 0.4)',
    backgroundColor: 'rgba(19, 27, 46, 0.95)',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  exerciseIndexBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  indexText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  titleArea: {
    flex: 1,
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    lineHeight: 22,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 6,
  },
  muscleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
  },
  muscleText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.primary,
  },
  metricBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    backgroundColor: 'rgba(6, 182, 212, 0.1)',
  },
  metricText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.cyan,
  },
  timerShortcut: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.25)',
  },
  timerText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
  },
  setsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  setsLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  setsList: {
    flexDirection: 'row',
    gap: 8,
  },
  setCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  setCircleDone: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  setNumberText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  tipsSection: {
    marginTop: 12,
    paddingTop: 8,
  },
  tipsToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  tipsToggleText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.orange,
  },
  tipsContent: {
    marginTop: 8,
    padding: 10,
    borderRadius: 10,
    backgroundColor: 'rgba(245, 158, 11, 0.08)',
    borderLeftWidth: 3,
    borderLeftColor: Colors.orange,
  },
  tipsText: {
    fontSize: 12,
    color: '#E2E8F0',
    lineHeight: 18,
  },
});
