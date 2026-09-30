// FitGuru Secure Backend Server
// Runs server-side. Keeps GEMINI_API_KEY 100% private from mobile/web clients.

const http = require('http');
const fs = require('fs');
const path = require('path');

// Load private server environment from .env (ignored by git)
const envPath = path.join(__dirname, '..', '.env');
if (fs.existsSync(envPath)) {
  const lines = fs.readFileSync(envPath, 'utf8').split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
      const idx = trimmed.indexOf('=');
      const k = trimmed.slice(0, idx).trim();
      const v = trimmed.slice(idx + 1).trim();
      process.env[k] = v;
    }
  }
}

const PORT = process.env.PORT || 5001;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

const server = http.createServer(async (req, res) => {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  if (req.url === '/api/health' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', service: 'fitguru-backend' }));
    return;
  }

  if (req.url === '/api/generate-workout' && req.method === 'POST') {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
    });

    req.on('end', async () => {
      try {
        const profile = JSON.parse(body);

        const prompt = `
You are an elite personal trainer and sports scientist.
Generate a structured custom workout routine and nutrition plan for:
- Gender: ${profile.gender}
- Age: ${profile.age} years old
- Body Weight: ${profile.weight} ${profile.weightUnit}
- Height: ${profile.height} ${profile.heightUnit}
- Gym Frequency: ${profile.gymDaysPerWeek} days/week
- Target Workout Session Duration: ${profile.durationMinutes} minutes per workout
- Primary Goal: ${profile.goal}
- Experience: ${profile.experienceLevel}

Requirements:
- Exactly ${profile.gymDaysPerWeek} training days.
- Ensure total exercises, sets, and rest times strictly fit inside ${profile.durationMinutes} minutes.
- Output ONLY valid JSON matching:
{
  "title": "string",
  "splitType": "string",
  "overview": "string",
  "durationMinutes": ${profile.durationMinutes},
  "days": [
    {
      "dayNumber": 1,
      "title": "string",
      "focus": "string",
      "isRestDay": false,
      "warmup": ["dynamic movements"],
      "exercises": [
        {
          "id": "ex-1",
          "name": "Exercise Name",
          "targetMuscle": "Muscle",
          "sets": 4,
          "reps": "8-10",
          "restSeconds": 75,
          "tips": "Form coaching tip"
        }
      ],
      "cooldown": ["cooldown stretches"]
    }
  ],
  "nutrition": {
    "dailyCalories": 2400,
    "proteinGrams": 160,
    "carbsGrams": 260,
    "fatGrams": 70,
    "waterLiters": 3.5,
    "tips": ["Tip 1", "Tip 2"]
  }
}
`;

        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${GEMINI_API_KEY}`;
        const response = await fetch(geminiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              responseMimeType: 'application/json',
              temperature: 0.7,
            },
          }),
        });

        if (!response.ok) {
          const errText = await response.text();
          res.writeHead(response.status, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: errText }));
          return;
        }

        const data = await response.json();
        const rawJsonText = data.candidates?.[0]?.content?.parts?.[0]?.text;
        const plan = JSON.parse(rawJsonText);

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(plan));
      } catch (err) {
        console.error('Server generation error:', err);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message }));
      }
    });
    return;
  }

  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Endpoint not found' }));
});

server.listen(PORT, () => {
  console.log(`✅ FitGuru Secure Backend Server running on port ${PORT}`);
  console.log(`🔒 Gemini API key safely isolated on server.`);
});
