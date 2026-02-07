import type { VercelRequest, VercelResponse } from '@vercel/node'
import { createClient } from '@supabase/supabase-js'

const OPENAI_URL = 'https://api.openai.com/v1/chat/completions'

const WORKOUT_SYSTEM_PROMPT = `You are a concise fitness coach AI. Given a user's exercise list with their recent history and wearable data (from WHOOP, Garmin, Apple Health, or other platforms), generate personalized weight and rep recommendations.

Rules:
- For exercises with history: apply progressive overload (increase weight by 2.5-5lbs or add 1-2 reps when the user completed all sets at the target reps last session)
- If the user's last session shows they struggled (fewer reps than target or dropped weight mid-session), maintain or slightly decrease weight
- Adjust for recovery data from any wearable platform:
  - WHOOP: use recovery score directly
  - Garmin: Body Battery 0-100 maps to recovery, stress score inversely correlates
  - Apple Health: use HRV and resting HR trends
  - If recovery is below 50, reduce weight by ~5-10%. If above 80, allow more aggressive progression
- For bodyweight exercises (defaultSuggestion weight = 0), suggest reps only and keep weight at 0
- Consider user experience level: beginners progress faster, advanced lifters progress in smaller increments
- If homeEquipment is provided, the user is training at home. CRITICAL: Never suggest weights exceeding their available equipment:
  - Cap dumbbell exercise weights at homeEquipment.dumbbells.maxWeight (this is per dumbbell)
  - Cap barbell exercise weights at homeEquipment.barbell.maxWeight
  - Cap kettlebell exercise weights at homeEquipment.kettlebell.maxWeight
  - If an exercise would normally use heavier weight, suggest higher reps at the capped weight instead
- Keep notes under 15 words each, encouraging and motivating

You must respond with valid JSON matching this schema:
{ "suggestions": [{ "exerciseName": string, "weight": number, "reps": string, "sets": number, "note": string }] }

Include one entry per exercise in the input. The "reps" field should be a range like "8-10".`

const READINESS_SYSTEM_PROMPT = `You are a concise, motivating fitness readiness coach AI. Analyze biometric data from any wearable platform (WHOOP, Garmin, Apple Health, Oura, etc.) and training history to produce a readiness assessment.

Data normalization across platforms:
- WHOOP: recovery score (0-100), HRV (ms), resting HR, sleep stages, strain (0-21)
- Garmin: Body Battery (0-100), stress score (0-100, lower=better), HRV, sleep score, intensity minutes
- Apple Health: HRV, resting HR, sleep duration
- Oura: readiness score, HRV, sleep score
- Normalize all metrics to comparable scales before scoring

Rules:
- Calculate a readiness score between 55 and 100. IMPORTANT: Never output a score below 55 — even on rough days, frame it as "room to grow" not "you're broken"
- Score weighting: wearable recovery/readiness (~40%), sleep quality (~25%), HRV (~20%), recent training load (~15%)
- If no wearable data, base the score on training frequency and rest days, default to 70-80 range
- Training frequency > 5 days in last 7 suggests needing recovery (score ~60-65, not lower)
- Always be encouraging and actionable. Frame lower scores as "strategic recovery" not "poor performance"
- Provide specific, actionable coaching (2-3 sentences)
- Intensity recommendation should be a percentage range like "80-90%"
- Recommendation should be one specific motivating action item

You must respond with valid JSON matching this schema:
{ "readinessScore": number, "coachingText": string, "intensityRecommendation": string, "recommendation": string }`

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing auth token' })
  }

  const openaiKey = process.env.OPENAI_API_KEY
  if (!openaiKey) {
    return res.status(500).json({ error: 'AI service not configured' })
  }

  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL
  const anonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY
  if (!supabaseUrl || !anonKey) {
    return res.status(500).json({ error: 'Server configuration error' })
  }

  // Verify JWT
  const userToken = authHeader.replace('Bearer ', '')
  const authClient = createClient(supabaseUrl, anonKey)
  const { data: { user }, error: authError } = await authClient.auth.getUser(userToken)
  if (authError || !user) {
    return res.status(401).json({ error: 'Invalid token' })
  }

  const body = req.body
  if (!body?.type) {
    return res.status(400).json({ error: 'Missing request type' })
  }

  try {
    let systemPrompt: string
    let userPrompt: string

    if (body.type === 'workout-suggestions') {
      systemPrompt = WORKOUT_SYSTEM_PROMPT
      userPrompt = JSON.stringify({
        exercises: body.exercises,
        userProfile: body.userProfile,
        recovery: body.recovery,
      })
    } else if (body.type === 'readiness') {
      systemPrompt = READINESS_SYSTEM_PROMPT
      userPrompt = JSON.stringify({
        whoopData: body.whoopData,
        recentWorkouts: body.recentWorkouts,
        userProfile: body.userProfile,
      })
    } else {
      return res.status(400).json({ error: 'Invalid request type' })
    }

    const openaiRes = await fetch(OPENAI_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openaiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        response_format: { type: 'json_object' },
        temperature: 0.3,
        max_tokens: 800,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
      }),
    })

    if (openaiRes.status === 429) {
      return res.status(503).json({ error: 'AI service busy' })
    }

    if (!openaiRes.ok) {
      console.error('OpenAI error:', openaiRes.status, await openaiRes.text())
      return res.status(502).json({ error: 'AI service error' })
    }

    const openaiData = await openaiRes.json()
    const content = openaiData.choices?.[0]?.message?.content

    if (!content) {
      return res.status(502).json({ error: 'Invalid AI response' })
    }

    const parsed = JSON.parse(content)
    return res.json(parsed)
  } catch (err) {
    console.error('AI coach error:', err)
    return res.status(500).json({ error: 'Internal error' })
  }
}
