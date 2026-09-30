import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Colors } from '../theme/colors';

interface RestTimerModalProps {
  visible: boolean;
  onClose: () => void;
  initialSeconds?: number;
}

export const RestTimerModal: React.FC<RestTimerModalProps> = ({
  visible,
  onClose,
  initialSeconds = 60,
}) => {
  const [secondsLeft, setSecondsLeft] = useState(initialSeconds);
  const [isActive, setIsActive] = useState(false);
  const [totalSeconds, setTotalSeconds] = useState(initialSeconds);

  useEffect(() => {
    if (visible) {
      setSecondsLeft(initialSeconds);
      setTotalSeconds(initialSeconds);
      setIsActive(true);
    } else {
      setIsActive(false);
    }
  }, [visible, initialSeconds]);

  useEffect(() => {
    let interval: any = null;
    if (isActive && secondsLeft > 0) {
      interval = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            setIsActive(false);
            try {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            } catch (e) {}
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, secondsLeft]);

  const setTimerPreset = (secs: number) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (e) {}
    setTotalSeconds(secs);
    setSecondsLeft(secs);
    setIsActive(true);
  };

  const addTime = (secs: number) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (e) {}
    setSecondsLeft((prev) => prev + secs);
    setTotalSeconds((prev) => prev + secs);
  };

  const toggleActive = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (e) {}
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (e) {}
    setSecondsLeft(totalSeconds);
    setIsActive(false);
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${mins}:${remainder < 10 ? '0' : ''}${remainder}`;
  };

  const progressPercent = totalSeconds > 0 ? (secondsLeft / totalSeconds) * 100 : 0;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          {/* Header */}
          <View style={styles.cardHeader}>
            <View style={styles.titleRow}>
              <Ionicons name="timer-outline" size={24} color={Colors.primary} />
              <Text style={styles.cardTitle}>Rest Interval</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={20} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Time Display */}
          <View style={styles.timerCircleContainer}>
            <View style={[styles.timerCircle, secondsLeft === 0 && styles.timerCircleComplete]}>
              <Text style={[styles.timeText, secondsLeft === 0 && styles.timeTextComplete]}>
                {secondsLeft === 0 ? "TIME'S UP!" : formatTime(secondsLeft)}
              </Text>
              <Text style={styles.subtext}>
                {secondsLeft === 0 ? 'Ready for your next set' : isActive ? 'Resting...' : 'Paused'}
              </Text>
            </View>
          </View>

          {/* Quick Presets */}
          <View style={styles.presetsRow}>
            {[30, 60, 90, 120].map((s) => (
              <TouchableOpacity
                key={s}
                style={[styles.presetChip, totalSeconds === s && styles.presetChipActive]}
                onPress={() => setTimerPreset(s)}
              >
                <Text
                  style={[
                    styles.presetChipText,
                    totalSeconds === s && styles.presetChipTextActive,
                  ]}
                >
                  {s}s
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Controls */}
          <View style={styles.controlsRow}>
            <TouchableOpacity style={styles.actionBtnSecondary} onPress={resetTimer}>
              <Ionicons name="refresh" size={20} color={Colors.textSecondary} />
              <Text style={styles.actionBtnTextSec}>Reset</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionBtnPrimary, !isActive && styles.actionBtnPrimaryPaused]}
              onPress={toggleActive}
            >
              <Ionicons name={isActive ? 'pause' : 'play'} size={22} color="#0B0F19" />
              <Text style={styles.actionBtnTextPrim}>{isActive ? 'Pause' : 'Start'}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionBtnSecondary} onPress={() => addTime(15)}>
              <Ionicons name="add" size={20} color={Colors.primary} />
              <Text style={[styles.actionBtnTextSec, { color: Colors.primary }]}>+15s</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(5, 8, 15, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: Colors.surface,
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: '#000',
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timerCircleContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 16,
  },
  timerCircle: {
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: Colors.background,
    borderWidth: 4,
    borderColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timerCircleComplete: {
    borderColor: Colors.danger,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  timeText: {
    fontSize: 38,
    fontWeight: '800',
    color: Colors.text,
    letterSpacing: 1,
  },
  timeTextComplete: {
    fontSize: 22,
    color: Colors.danger,
  },
  subtext: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 6,
  },
  presetsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 16,
    gap: 8,
  },
  presetChip: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: Colors.surfaceLight,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  presetChipActive: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderColor: Colors.primary,
  },
  presetChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  presetChipTextActive: {
    color: Colors.primary,
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 8,
  },
  actionBtnSecondary: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: Colors.surfaceLight,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  actionBtnTextSec: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  actionBtnPrimary: {
    flex: 1.4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: Colors.primary,
  },
  actionBtnPrimaryPaused: {
    backgroundColor: Colors.cyan,
  },
  actionBtnTextPrim: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0B0F19',
  },
});
