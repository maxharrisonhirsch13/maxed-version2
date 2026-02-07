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

const WORKOUT_FROM_PROMPT_SYSTEM_PROMPT = `You are a fitness workout designer. The user will describe the kind of workout they want in natural language. Generate a workout name and brief description that captures their intent.

Rules:
- The "name" should be a short, clean workout title (2-4 words) like "Calisthenics & Core", "Upper Hypertrophy", "Kettlebell HIIT", etc.
- The "description" should be 1 sentence explaining the workout focus
- Match the user's intent closely — if they say "calisthenics with stability", don't give them a barbell workout
- If they mention specific muscle groups, include those in the name
- If the scheduled workout type is provided, acknowledge they're switching from it

You must respond with valid JSON matching this schema:
{ "name": string, "description": string }`

const SET_UPDATE_SYSTEM_PROMPT = `You are a real-time lifting coach giving guidance between sets. The user just finished a set and you must tell them exactly what to do next.

You are given: the exercise, all sets completed so far (in order), how many sets remain, and the user's fitness goal.

FATIGUE ANALYSIS (most important — do this first):
Look at the rep trend across completed sets at the same weight. Fatigue is NORMAL and EXPECTED.
- If reps HELD STEADY (e.g. 10, 10): they can maintain — keep weight, same rep target.
- If reps DROPPED by 1-2 (e.g. 10→8, or 8→7): they are fatiguing. Project the trend forward.
  - If they went 10→8, the next set will likely be ~6-7, NOT 8 again. Suggest the REALISTIC number.
  - Consider dropping weight 5-10 lbs to maintain rep quality, OR lower the rep target to match the fatigue curve.
- If reps DROPPED by 3+ (e.g. 10→6, or 8→5): they are significantly fatigued. Drop weight by 10-20 lbs to preserve form.
- If reps INCREASED or weight went up: they were sandbagging or warming up — push them harder.
- NEVER suggest the same reps as the last set if reps have been declining. The trend continues downward.

GOAL-BASED COACHING (applies on top of fatigue analysis):
- "gain strength" / "build muscle" / "hypertrophy": prioritize keeping weight heavy. Accept lower reps (down to 5-6) before dropping weight. When dropping, reduce by only 5-10 lbs.
- "get lean" / "lose weight" / "tone": prioritize rep quality over heavy weight. Drop weight earlier to stay in 12-15 rep range. If reps fall below 10, definitely reduce weight.
- "general health" / "maintain" / null: balanced — moderate weight drops to stay in 8-12 range.
- "athletic performance" / "sport": keep reps moderate (5-8), drop weight to maintain explosiveness if reps fall.

OTHER RULES:
- If setsRemaining is 0, this was their last set. Give a motivating wrap-up note. Still return realistic weight/reps (use their last set values).
- For bodyweight exercises (weight = 0), only adjust reps, keep weight at 0.
- Note must be under 12 words, direct and motivating. Talk TO the lifter like a coach.
- "reps" should be a specific target number as a string (e.g. "7"), not a range.

Respond with valid JSON: { "weight": number, "reps": string, "note": string }`

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
  // Reject oversized payloads
  const bodyStr = JSON.stringify(body)
  if (bodyStr.length > 50000) {
    return res.status(413).json({ error: 'Request body too large' })
  }
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
    } else if (body.type === 'workout-from-prompt') {
      systemPrompt = WORKOUT_FROM_PROMPT_SYSTEM_PROMPT
      userPrompt = JSON.stringify({
        userRequest: body.prompt,
        scheduledWorkout: body.scheduledWorkout || null,
        userSplit: body.userSplit || null,
      })
    } else if (body.type === 'set-update') {
      systemPrompt = SET_UPDATE_SYSTEM_PROMPT
      userPrompt = JSON.stringify({
        exercise: body.exercise,
        completedSets: body.completedSets,
        setsRemaining: body.setsRemaining,
        goal: body.goal,
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

    const maxTokens = body.type === 'set-update' ? 150 : 800

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
        max_tokens: maxTokens,
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
