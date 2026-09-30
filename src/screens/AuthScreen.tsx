import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { isSupabaseConfigured } from '../services/supabase';
import { Colors } from '../theme/colors';

interface AuthScreenProps {
  onOpenSettings: () => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onOpenSettings }) => {
  const { signIn, signUp, continueAsGuest } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!email.trim() || !password.trim()) {
      setErrorMessage('Please fill in both email and password.');
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    const res = isSignUp
      ? await signUp(email.trim(), password)
      : await signIn(email.trim(), password);

    setLoading(false);
    if (res.error) {
      setErrorMessage(res.error);
    }
  };

  const supaConnected = isSupabaseConfigured();

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {/* Top Header & Branding */}
        <View style={styles.brandContainer}>
          <View style={styles.logoCircle}>
            <Ionicons name="barbell" size={36} color={Colors.primary} />
          </View>
          <Text style={styles.brandName}>FITGURU</Text>
          <Text style={styles.brandTagline}>AI-Powered Precision Training</Text>
        </View>

        {/* Supabase connection indicator */}
        <View style={styles.connectionStatusContainer}>
          <View style={[styles.statusPill, supaConnected ? styles.pillConnected : styles.pillFallback]}>
            <View style={[styles.dot, supaConnected ? styles.dotConnected : styles.dotFallback]} />
            <Text style={[styles.pillText, supaConnected ? styles.pillTextConnected : styles.pillTextFallback]}>
              {supaConnected ? 'Supabase Cloud Connected' : 'Local / Offline Mode Ready'}
            </Text>
          </View>
          <TouchableOpacity onPress={onOpenSettings} style={styles.configBtn}>
            <Ionicons name="settings-outline" size={15} color={Colors.textSecondary} />
            <Text style={styles.configBtnText}>Config</Text>
          </TouchableOpacity>
        </View>

        {/* Auth Card */}
        <View style={styles.card}>
          {/* Tabs */}
          <View style={styles.tabsRow}>
            <TouchableOpacity
              style={[styles.tab, !isSignUp && styles.tabActive]}
              onPress={() => {
                setIsSignUp(false);
                setErrorMessage(null);
              }}
            >
              <Text style={[styles.tabText, !isSignUp && styles.tabTextActive]}>Sign In</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tab, isSignUp && styles.tabActive]}
              onPress={() => {
                setIsSignUp(true);
                setErrorMessage(null);
              }}
            >
              <Text style={[styles.tabText, isSignUp && styles.tabTextActive]}>Create Account</Text>
            </TouchableOpacity>
          </View>

          {/* Error Banner */}
          {errorMessage && (
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle" size={16} color={Colors.danger} />
              <Text style={styles.errorText}>{errorMessage}</Text>
            </View>
          )}

          {/* Inputs */}
          <Text style={styles.label}>Email Address</Text>
          <View style={styles.inputWrapper}>
            <Ionicons name="mail-outline" size={18} color={Colors.textSecondary} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="you@example.com"
              placeholderTextColor={Colors.textMuted}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>

          <Text style={styles.label}>Password</Text>
          <View style={styles.inputWrapper}>
            <Ionicons name="lock-closed-outline" size={18} color={Colors.textSecondary} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              placeholderTextColor={Colors.textMuted}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
            />
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              style={styles.eyeBtn}
            >
              <Ionicons
                name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                size={18}
                color={Colors.textSecondary}
              />
            </TouchableOpacity>
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={styles.submitBtn}
            onPress={handleSubmit}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color="#0B0F19" />
            ) : (
              <Text style={styles.submitBtnText}>{isSignUp ? 'Sign Up with Supabase' : 'Sign In'}</Text>
            )}
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OR</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Continue as Guest Button */}
          <TouchableOpacity
            style={styles.guestBtn}
            onPress={continueAsGuest}
            activeOpacity={0.8}
          >
            <Ionicons name="flash-outline" size={18} color={Colors.cyan} />
            <Text style={styles.guestBtnText}>Continue as Guest / Offline Preview</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.footerNote}>
          Data is saved on your device and synced to Supabase when connected.
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    padding: 24,
    justifyContent: 'center',
    minHeight: '100%',
  },
  brandContainer: {
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 20,
  },
  logoCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(16, 185, 129, 0.35)',
    marginBottom: 12,
  },
  brandName: {
    fontSize: 28,
    fontWeight: '900',
    color: Colors.text,
    letterSpacing: 2,
  },
  brandTagline: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '500',
    marginTop: 4,
  },
  connectionStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  pillConnected: {},
  pillFallback: {},
  dot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  dotConnected: {
    backgroundColor: Colors.primary,
  },
  dotFallback: {
    backgroundColor: Colors.orange,
  },
  pillText: {
    fontSize: 11,
    fontWeight: '600',
  },
  pillTextConnected: {
    color: Colors.primary,
  },
  pillTextFallback: {
    color: Colors.orange,
  },
  configBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 2,
    paddingHorizontal: 6,
  },
  configBtnText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  tabsRow: {
    flexDirection: 'row',
    backgroundColor: Colors.background,
    borderRadius: 14,
    padding: 4,
    marginBottom: 18,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
  },
  tabActive: {
    backgroundColor: Colors.surfaceLight,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textMuted,
  },
  tabTextActive: {
    color: Colors.text,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    padding: 12,
    borderRadius: 12,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  errorText: {
    flex: 1,
    fontSize: 12,
    color: Colors.danger,
    lineHeight: 16,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textSecondary,
    marginBottom: 6,
    marginTop: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 12,
    marginBottom: 10,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 14,
    color: Colors.text,
  },
  eyeBtn: {
    padding: 6,
  },
  submitBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 14,
  },
  submitBtnText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0B0F19',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
    gap: 10,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.border,
  },
  dividerText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textMuted,
  },
  guestBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'rgba(6, 182, 212, 0.08)',
    borderRadius: 14,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: 'rgba(6, 182, 212, 0.3)',
  },
  guestBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.cyan,
  },
  footerNote: {
    fontSize: 11,
    color: Colors.textMuted,
    textAlign: 'center',
    marginTop: 20,
    lineHeight: 16,
  },
});
