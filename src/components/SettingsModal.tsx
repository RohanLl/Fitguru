import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { isSupabaseConfigured, setSupabaseConfig } from '../services/supabase';
import { StorageService } from '../services/storageService';
import { Colors } from '../theme/colors';

interface SettingsModalProps {
  visible: boolean;
  onClose: () => void;
  onResetWorkout: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  visible,
  onClose,
  onResetWorkout,
}) => {
  const { user, isGuest, signOut } = useAuth();
  const [supabaseUrl, setSupabaseUrl] = useState('');
  const [supabaseKey, setSupabaseKey] = useState('');
  const [savedStatus, setSavedStatus] = useState<string | null>(null);

  useEffect(() => {
    if (visible) {
      loadSettings();
    }
  }, [visible]);

  const loadSettings = async () => {
    const supa = await StorageService.getSupabaseConfig();
    if (supa) {
      setSupabaseUrl(supa.url);
      setSupabaseKey(supa.anonKey);
    }
  };

  const handleSaveSupabase = async () => {
    if (!supabaseUrl.trim() || !supabaseKey.trim()) {
      showAlert('Error', 'Please provide both Supabase URL and Anon Key');
      return;
    }
    await setSupabaseConfig(supabaseUrl, supabaseKey);
    setSavedStatus('Supabase configuration saved!');
    setTimeout(() => setSavedStatus(null), 3000);
  };

  const showAlert = (title: string, message: string) => {
    if (Platform.OS === 'web') {
      window.alert(`${title}: ${message}`);
    } else {
      Alert.alert(title, message);
    }
  };

  const isConnected = isSupabaseConfigured();

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.titleRow}>
              <Ionicons name="settings-sharp" size={20} color={Colors.primary} />
              <Text style={styles.title}>FitGuru Settings</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={20} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            {/* Status Notification */}
            {savedStatus ? (
              <View style={styles.statusToast}>
                <Ionicons name="checkmark-circle" size={16} color={Colors.primary} />
                <Text style={styles.statusToastText}>{savedStatus}</Text>
              </View>
            ) : null}

            {/* Account Status */}
            <View style={styles.accountCard}>
              <View style={styles.avatar}>
                <Ionicons name="person" size={20} color={Colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.accountEmail}>
                  {user?.email ? user.email : isGuest ? 'Guest User (Offline Mode)' : 'Not Signed In'}
                </Text>
                <View style={styles.badgeRow}>
                  <View style={[styles.statusBadge, isConnected && styles.statusBadgeConnected]}>
                    <View style={[styles.statusDot, isConnected && styles.statusDotConnected]} />
                    <Text style={[styles.statusBadgeText, isConnected && styles.statusBadgeTextConnected]}>
                      {isConnected ? 'Supabase Connected' : 'Local / Offline Fallback'}
                    </Text>
                  </View>
                </View>
              </View>
              <TouchableOpacity
                style={styles.signOutBtn}
                onPress={() => {
                  signOut();
                  onClose();
                }}
              >
                <Ionicons name="log-out-outline" size={18} color={Colors.danger} />
              </TouchableOpacity>
            </View>

            {/* Create New Routine Action */}
            <TouchableOpacity
              style={styles.resetPlanBtn}
              onPress={() => {
                onResetWorkout();
                onClose();
              }}
              activeOpacity={0.8}
            >
              <Ionicons name="refresh-circle" size={22} color={Colors.cyan} />
              <Text style={styles.resetPlanText}>Recalibrate & Generate New Plan</Text>
            </TouchableOpacity>

            {/* Supabase Configuration Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Supabase Cloud Settings</Text>
              <Text style={styles.sectionDescription}>
                Connect your Supabase project URL and anon public key to enable user auth, cloud database sync, and OpenAI Edge Functions.
              </Text>

              <Text style={styles.inputLabel}>Supabase Project URL</Text>
              <TextInput
                style={styles.input}
                placeholder="https://your-project.supabase.co"
                placeholderTextColor={Colors.textMuted}
                value={supabaseUrl}
                onChangeText={setSupabaseUrl}
                autoCapitalize="none"
              />

              <Text style={styles.inputLabel}>Supabase Anon Key</Text>
              <TextInput
                style={styles.input}
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                placeholderTextColor={Colors.textMuted}
                value={supabaseKey}
                onChangeText={setSupabaseKey}
                autoCapitalize="none"
                secureTextEntry
              />

              <TouchableOpacity style={styles.saveBtn} onPress={handleSaveSupabase} activeOpacity={0.7}>
                <Ionicons name="cloud-upload-outline" size={16} color="#0B0F19" />
                <Text style={styles.saveBtnText}>Save Supabase Config</Text>
              </TouchableOpacity>
            </View>

            {/* Backend AI Architecture Notice */}
            <View style={styles.section}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Ionicons name="shield-checkmark" size={18} color={Colors.primary} />
                <Text style={styles.sectionTitle}>Secure Backend AI Architecture</Text>
              </View>
              <Text style={styles.sectionDescription}>
                Your Google Gemini API key is securely managed on the backend (Supabase Edge Functions / Backend API). It is never exposed or stored on client devices.
              </Text>
            </View>

            {/* App Info */}
            <View style={styles.infoFooter}>
              <Text style={styles.infoText}>FitGuru Mobile v1.0.0</Text>
              <Text style={styles.infoSubtext}>Expo SDK 52 • React Native • Supabase • Google Gemini</Text>
            </View>
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
    maxHeight: '90%',
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
    gap: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.text,
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
  statusToast: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  statusToastText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.primary,
  },
  accountCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceLight,
    padding: 14,
    borderRadius: 16,
    gap: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  accountEmail: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text,
  },
  badgeRow: {
    flexDirection: 'row',
    marginTop: 4,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    backgroundColor: 'rgba(245, 158, 11, 0.12)',
  },
  statusBadgeConnected: {
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.orange,
  },
  statusDotConnected: {
    backgroundColor: Colors.primary,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.orange,
  },
  statusBadgeTextConnected: {
    color: Colors.primary,
  },
  signOutBtn: {
    padding: 8,
    borderRadius: 10,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  resetPlanBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'rgba(6, 182, 212, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(6, 182, 212, 0.3)',
    borderRadius: 14,
    paddingVertical: 14,
    marginBottom: 20,
  },
  resetPlanText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.cyan,
  },
  section: {
    backgroundColor: Colors.surfaceCard,
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
  },
  sectionDescription: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginVertical: 8,
    lineHeight: 17,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginTop: 10,
    marginBottom: 4,
  },
  input: {
    backgroundColor: Colors.background,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 12,
    marginTop: 14,
  },
  saveBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0B0F19',
  },
  infoFooter: {
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textMuted,
  },
  infoSubtext: {
    fontSize: 10,
    color: Colors.textMuted,
    marginTop: 2,
  },
});
