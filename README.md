# FitGuru 🏋️‍♂️⚡
**Cross-Platform AI Workout Generator for Android & iOS**
*Built with React Native, Expo SDK 52, TypeScript, Supabase, and Google Gemini API.*

---

## 🌟 Key Features

1. **Biometric & Schedule Intake**:
   - **Weight** (Toggle `kg` / `lbs`)
   - **Height** (Toggle `cm` / `in`)
   - **Age** & **Gender**
   - **Weekly Gym Frequency** (1 to 7 days per week)
   - **Workout Duration** (30m, 45m, 60m, 75m, 90m per session)
   - **Fitness Goal** (Hypertrophy, Fat Loss, Strength, General Health)
   - **Experience Level** (Beginner, Intermediate, Advanced)

2. **Google Gemini API Integration via Supabase**:
   - Powered by `gemini-1.5-flash` with strict structured JSON output.
   - **Supabase Edge Function** (`supabase/functions/generate-workout/index.ts`) keeps your `GEMINI_API_KEY` private and secure in Supabase Secrets (never exposed on client devices).
   - **Built-in Offline / Algorithmic Fallback Engine**: Works immediately out-of-the-box even without Supabase keys configured!

3. **Supabase Authentication & Cloud Database**:
   - Email/password user signup, login, session persistence, and instant **Guest Mode**.
   - Cloud database sync for user biometrics (`profiles` table) and workout routines (`workout_plans` table) with Row-Level Security (RLS).

4. **Interactive Workout Dashboard**:
   - Day-by-day split switcher (e.g. Day 1: Upper Body Push, Day 2: Lower Body Pull...).
   - Checkable set circles with tactile haptic feedback.
   - Built-in **Rest Countdown Timer** with 30s/60s/90s/120s presets, +15s button, and completion notifications.
   - **Nutrition & Macro Target Modal**: Calorie target (Mifflin-St Jeor), protein in grams, carbs, healthy fats, water intake, and nutritional advice.
   - Share / Export formatted workout to clipboard or social apps.

---

## 🚀 Quick Start

### 1. Install & Start Development Server
```bash
npm install
npx expo start
```

- **Scan QR Code** with the **Expo Go** app on your physical iPhone or Android device!
- Press `w` in terminal to launch in **Web Browser**.
- Press `a` to run on Android Emulator (if Android Studio is installed).
- Press `i` to run on iOS Simulator (on macOS).

---

## ☁️ Supabase & Google Gemini Setup

### Step 1: Create Database Tables in Supabase
1. Open your [Supabase Dashboard](https://supabase.com/dashboard).
2. Go to **SQL Editor** -> **New Query**.
3. Copy and run the contents of [`supabase/schema.sql`](./supabase/schema.sql).

### Step 2: Deploy Edge Function & Set Gemini Secret
```bash
# Login to Supabase CLI
supabase login

# Link your Supabase project
supabase link --project-ref your-project-ref

# Set your Gemini API key in Supabase Secrets (safe and private)
supabase secrets set GEMINI_API_KEY=your-gemini-api-key-here

# Deploy the Edge Function
supabase functions deploy generate-workout
```

### Step 3: Connect in Mobile App
- Either copy `.env.example` to `.env` and fill in:
  ```env
  EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
  EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
  ```
- Or open the app, tap the **Settings** icon ⚙️, and enter your Supabase URL & Anon Key directly.
