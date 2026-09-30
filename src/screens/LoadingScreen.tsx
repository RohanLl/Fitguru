import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { FitGuruLogo } from '../components/FitGuruLogo';
import { ModernIcon } from '../components/ModernIcon';
import { Colors } from '../theme/colors';

interface LoadingScreenProps {
  statusMessage?: string;
  durationMinutes?: number;
  gymDays?: number;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({
  statusMessage = 'Crafting your personalized workout...',
  durationMinutes = 60,
  gymDays = 4,
}) => {
  const [stepIndex, setStepIndex] = useState(0);

  const steps = [
    'Analyzing biometric data and metabolic rate...',
    `Structuring optimal ${gymDays}-day training split...`,
    `Calibrating sets & rest intervals for ${durationMinutes}-minute sessions...`,
    'Synthesizing compound & isolation movements...',
    'Generating coach form cues and warmup routines...',
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setStepIndex((prev) => (prev < steps.length - 1 ? prev + 1 : prev));
    }, 1200);

    return () => clearInterval(timer);
  }, [steps.length]);

  return (
    <View style={styles.container}>
      <FitGuruLogo size={84} glow={true} style={{ marginBottom: 24 }} />

      <Text style={styles.title}>FITGURU AI</Text>
      <Text style={styles.subtitle}>Engineering your custom training program</Text>

      <ActivityIndicator size="large" color={Colors.primary} style={{ marginVertical: 24 }} />

      <View style={styles.stepBox}>
        <ModernIcon name="sparkles" size={16} color={Colors.cyan} />
        <Text style={styles.stepText}>{steps[stepIndex]}</Text>
      </View>

      <Text style={styles.subStatus}>{statusMessage}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
  },
  circleOuter: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(16, 185, 129, 0.3)',
    marginBottom: 24,
  },
  circleInner: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: '900',
    color: Colors.text,
    letterSpacing: 2,
  },
  subtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 6,
    textAlign: 'center',
  },
  stepBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: Colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    maxWidth: '100%',
  },
  stepText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.text,
  },
  subStatus: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 16,
    textAlign: 'center',
  },
});
