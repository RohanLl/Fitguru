// Supabase Edge Function: generate-workout
// Powered by Google Gemini API
// Deploy with: supabase functions deploy generate-workout
// Set secret: supabase secrets set GEMINI_API_KEY=your_gemini_api_key_here

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
    const geminiApiKey = Deno.env.get("GEMINI_API_KEY");

    if (!geminiApiKey) {
      return new Response(
        JSON.stringify({
          error: "GEMINI_API_KEY is not configured in Supabase Secrets. Set it via 'supabase secrets set GEMINI_API_KEY=your_key'.",
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const {
      weight,
      weightUnit = "kg",
      height,
      heightUnit = "cm",
      age,
      gender,
      gymDaysPerWeek,
      durationMinutes = 60,
      goal = "hypertrophy",
      experienceLevel = "intermediate",
    } = await req.json();

    // Verify user if auth token provided
    let userId = null;
    if (authHeader && supabaseUrl && supabaseAnonKey) {
      const supabase = createClient(supabaseUrl, supabaseAnonKey, {
        global: { headers: { Authorization: authHeader } },
      });
      const { data: { user } } = await supabase.auth.getUser();
      if (user) userId = user.id;
    }

    const prompt = `
You are an elite certified strength and conditioning specialist (CSCS) and sports nutritionist.
Design a comprehensive, periodized, and scientifically optimized custom workout routine and nutrition plan based on the client's biometrics and strict constraints:

Client Profile:
- Gender: ${gender}
- Age: ${age} years old
- Body Weight: ${weight} ${weightUnit}
- Height: ${height} ${heightUnit}
- Gym Frequency: ${gymDaysPerWeek} days per week
- Target Workout Session Duration: ${durationMinutes} minutes per session
- Primary Goal: ${goal}
- Experience Level: ${experienceLevel}

Requirements:
1. Design exactly ${gymDaysPerWeek} training days appropriate for their frequency (e.g. 3 days: Full Body or Push/Pull/Legs; 4 days: Upper/Lower; 5 days: PPL + Upper/Lower or Arnold Split; 6 days: PPL x2).
2. For each training day, ensure the total volume (exercises, sets, and rest intervals) strictly fits within the ${durationMinutes}-minute workout duration.
3. Every exercise must include target muscle, working sets (e.g. 3 or 4), reps (e.g. "8-10" or "10-12"), recommended rest time in seconds, and an actionable coaching/form tip.
4. Include a concise dynamic warm-up (3-5 min) and cool-down for each session.
5. Provide personalized daily nutrition guidelines: estimated maintenance and target calories (based on Mifflin-St Jeor), protein in grams (around 1.6-2.2g per kg of bodyweight depending on goal), healthy carbs, fats, daily water intake in liters, and practical nutrition tips.

Return ONLY a valid JSON object matching this exact schema:
{
  "title": "string (e.g., 4-Day Hypertrophy Upper/Lower Split)",
  "splitType": "string (e.g., Upper / Lower)",
  "overview": "string (2-3 sentence overview of this program)",
  "durationMinutes": ${durationMinutes},
  "days": [
    {
      "dayNumber": 1,
      "title": "string (e.g., Day 1: Upper Body Power & Hypertrophy)",
      "focus": "string (e.g., Chest, Back & Shoulders)",
      "isRestDay": false,
      "warmup": ["Dynamic arm circles", "Band pull-aparts"],
      "exercises": [
        {
          "id": "ex-1",
          "name": "Barbell Bench Press",
          "targetMuscle": "Chest",
          "sets": 4,
          "reps": "8-10",
          "restSeconds": 90,
          "tips": "Retract scapulae, touch mid-chest, drive through heels."
        }
      ],
      "cooldown": ["Chest door stretch", "Lat hanging stretch"]
    }
  ],
  "nutrition": {
    "dailyCalories": 2400,
    "proteinGrams": 160,
    "carbsGrams": 260,
    "fatGrams": 70,
    "waterLiters": 3.5,
    "tips": [
      "Prioritize 30-40g protein per meal",
      "Drink 500ml water immediately upon waking"
    ]
  }
}
`;

    // Call Google Gemini API
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent?key=${geminiApiKey}`;

    const response = await fetch(geminiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0.7,
        },
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      return new Response(JSON.stringify({ error: `Google Gemini API error: ${errText}` }), {
        status: response.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const geminiData = await response.json();
    const rawText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawText) {
      throw new Error("No response text returned by Gemini");
    }

    const planJson = JSON.parse(rawText);

    // Save to Supabase workout_plans if user is authenticated
    if (userId && supabaseUrl && supabaseAnonKey) {
      const supabaseAdmin = createClient(supabaseUrl, supabaseAnonKey, {
        global: { headers: { Authorization: authHeader } },
      });
      await supabaseAdmin.from("workout_plans").insert({
        user_id: userId,
        title: planJson.title || "Custom Workout Plan",
        split_type: planJson.splitType || `${gymDaysPerWeek}-Day Split`,
        duration_minutes: durationMinutes,
        plan_data: planJson,
      });
    }

    return new Response(JSON.stringify(planJson), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
