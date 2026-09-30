import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView } from 'react-native';
import { ModernIcon } from './ModernIcon';
import { NutritionGuidelines } from '../types/fitness';
import { Colors } from '../theme/colors';

interface NutritionModalProps {
  visible: boolean;
  onClose: () => void;
  nutrition: NutritionGuidelines | null;
}

export const NutritionModal: React.FC<NutritionModalProps> = ({
  visible,
  onClose,
  nutrition,
}) => {
  if (!nutrition) return null;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.titleRow}>
              <View style={styles.iconCircle}>
                <ModernIcon name="restaurant" size={20} color={Colors.primary} />
              </View>
              <View>
                <Text style={styles.title}>Nutrition & Macros</Text>
                <Text style={styles.subtitle}>Calibrated for your biometric profile</Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <ModernIcon name="close" size={20} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            {/* Calories Banner */}
            <View style={styles.caloriesBanner}>
              <Text style={styles.calLabel}>Daily Target Calories</Text>
              <Text style={styles.calNumber}>{nutrition.dailyCalories} <Text style={styles.calUnit}>kcal / day</Text></Text>
            </View>

            {/* Macros Grid */}
            <Text style={styles.sectionHeader}>Target Macronutrients</Text>
            <View style={styles.macroGrid}>
              <View style={[styles.macroItem, { borderColor: 'rgba(16, 185, 129, 0.3)' }]}>
                <Text style={[styles.macroVal, { color: Colors.primary }]}>{nutrition.proteinGrams}g</Text>
                <Text style={styles.macroLabel}>Protein</Text>
                <Text style={styles.macroSub}>Muscle synthesis</Text>
              </View>

              <View style={[styles.macroItem, { borderColor: 'rgba(6, 182, 212, 0.3)' }]}>
                <Text style={[styles.macroVal, { color: Colors.cyan }]}>{nutrition.carbsGrams}g</Text>
                <Text style={styles.macroLabel}>Carbs</Text>
                <Text style={styles.macroSub}>Training fuel</Text>
              </View>

              <View style={[styles.macroItem, { borderColor: 'rgba(245, 158, 11, 0.3)' }]}>
                <Text style={[styles.macroVal, { color: Colors.orange }]}>{nutrition.fatGrams}g</Text>
                <Text style={styles.macroLabel}>Fats</Text>
                <Text style={styles.macroSub}>Hormone balance</Text>
              </View>
            </View>

            {/* Hydration Card */}
            <View style={styles.waterCard}>
              <ModernIcon name="water" size={24} color={Colors.cyan} />
              <View style={{ flex: 1 }}>
                <Text style={styles.waterTitle}>Daily Water Goal</Text>
                <Text style={styles.waterSubtitle}>Stay hydrated to maximize muscle performance</Text>
              </View>
              <Text style={styles.waterVal}>{nutrition.waterLiters}L</Text>
            </View>

            {/* Nutrition Guidelines List */}
            {nutrition.tips && nutrition.tips.length > 0 && (
              <View style={styles.tipsSection}>
                <Text style={styles.sectionHeader}>Nutrition Advice</Text>
                {nutrition.tips.map((tip, idx) => (
                  <View key={idx} style={styles.tipRow}>
                    <ModernIcon name="checkmark-circle" size={16} color={Colors.primary} />
                    <Text style={styles.tipText}>{tip}</Text>
                  </View>
                ))}
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(5, 8, 15, 0.85)',
    justifyContent: 'flex-end',
  },
  card: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 36,
    maxHeight: '85%',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.text,
  },
  subtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: Colors.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingVertical: 16,
  },
  caloriesBanner: {
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
    borderRadius: 18,
    padding: 18,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.25)',
    marginBottom: 20,
  },
  calLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  calNumber: {
    fontSize: 34,
    fontWeight: '800',
    color: Colors.primary,
    marginTop: 4,
  },
  calUnit: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
  sectionHeader: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 12,
  },
  macroGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  macroItem: {
    flex: 1,
    backgroundColor: Colors.surfaceLight,
    borderRadius: 16,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
  },
  macroVal: {
    fontSize: 20,
    fontWeight: '800',
  },
  macroLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.text,
    marginTop: 4,
  },
  macroSub: {
    fontSize: 10,
    color: Colors.textMuted,
    marginTop: 2,
    textAlign: 'center',
  },
  waterCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: 'rgba(6, 182, 212, 0.08)',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(6, 182, 212, 0.2)',
    marginBottom: 20,
  },
  waterTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text,
  },
  waterSubtitle: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  waterVal: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.cyan,
  },
  tipsSection: {
    marginTop: 4,
  },
  tipRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 10,
    backgroundColor: Colors.surfaceLight,
    padding: 12,
    borderRadius: 12,
  },
  tipText: {
    flex: 1,
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
});
