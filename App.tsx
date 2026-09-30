import React, { useState, useEffect } from 'react';
import { View, StyleSheet, SafeAreaView, Platform, StatusBar as RNStatusBar } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { AuthScreen } from './src/screens/AuthScreen';
import { OnboardingScreen } from './src/screens/OnboardingScreen';
import { LoadingScreen } from './src/screens/LoadingScreen';
import { WorkoutPlanScreen } from './src/screens/WorkoutPlanScreen';
import { SettingsModal } from './src/components/SettingsModal';
import { UserProfile, WorkoutPlan } from './src/types/fitness';
import { StorageService } from './src/services/storageService';
import { generateCustomWorkoutPlan } from './src/services/aiWorkoutService';
import { initSupabase } from './src/services/supabase';
import { Colors } from './src/theme/colors';

function MainApp() {
  const { user, isGuest, profile, updateProfile } = useAuth();
  const [currentScreen, setCurrentScreen] = useState<'auth' | 'onboarding' | 'loading' | 'plan'>('auth');
  const [activePlan, setActivePlan] = useState<WorkoutPlan | null>(null);
  const [settingsVisible, setSettingsVisible] = useState<boolean>(false);
  const [loadingStatus, setLoadingStatus] = useState<string>('Initializing AI engine...');
  const [targetDuration, setTargetDuration] = useState<number>(60);
  const [targetGymDays, setTargetGymDays] = useState<number>(4);

  useEffect(() => {
    async function setupApp() {
      await initSupabase();
      const cachedPlan = await StorageService.getActivePlan();
      if (cachedPlan) {
        setActivePlan(cachedPlan);
      }
    }
    setupApp();
  }, []);

  // Control screen based on authentication state
  useEffect(() => {
    if (!user && !isGuest) {
      setCurrentScreen('auth');
    } else {
      if (activePlan) {
        setCurrentScreen('plan');
      } else {
        setCurrentScreen('onboarding');
      }
    }
  }, [user, isGuest, activePlan]);

  const handleGeneratePlan = async (userProfile: UserProfile) => {
    setTargetDuration(userProfile.durationMinutes || 60);
    setTargetGymDays(userProfile.gymDaysPerWeek || 4);
    setCurrentScreen('loading');

    // Update profile in state/db
    if (user?.id) {
      userProfile.id = user.id;
    }
    await updateProfile(userProfile);

    try {
      const { plan } = await generateCustomWorkoutPlan(userProfile, (msg) => {
        setLoadingStatus(msg);
      });
      setActivePlan(plan);
      setCurrentScreen('plan');
    } catch (e) {
      console.warn('Generation failed:', e);
      setCurrentScreen('onboarding');
    }
  };

  const handleResetWorkout = () => {
    setCurrentScreen('onboarding');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />
      <View style={styles.content}>
        {currentScreen === 'auth' && (
          <AuthScreen onOpenSettings={() => setSettingsVisible(true)} />
        )}

        {currentScreen === 'onboarding' && (
          <OnboardingScreen
            initialProfile={profile}
            onGeneratePlan={handleGeneratePlan}
            onOpenSettings={() => setSettingsVisible(true)}
          />
        )}

        {currentScreen === 'loading' && (
          <LoadingScreen
            statusMessage={loadingStatus}
            durationMinutes={targetDuration}
            gymDays={targetGymDays}
          />
        )}

        {currentScreen === 'plan' && activePlan && (
          <WorkoutPlanScreen
            plan={activePlan}
            onOpenSettings={() => setSettingsVisible(true)}
            onResetWorkout={handleResetWorkout}
          />
        )}
      </View>

      <SettingsModal
        visible={settingsVisible}
        onClose={() => setSettingsVisible(false)}
        onResetWorkout={handleResetWorkout}
      />
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingTop: Platform.OS === 'android' ? RNStatusBar.currentHeight : 0,
  },
  content: {
    flex: 1,
  },
});
