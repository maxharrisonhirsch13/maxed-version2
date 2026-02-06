export interface UserProfile {
  id: string
  name: string
  phone: string | null
  heightFeet: number | null
  heightInches: number | null
  weight: number | null
  experience: 'beginner' | 'intermediate' | 'advanced' | null
  gym: string | null
  isHomeGym: boolean
  wearables: string[]
  goal: string | null
  customGoal: string | null
  split: string | null
  customSplit: { day: number; muscles: string[] }[]
  onboardingCompleted: boolean
  avatarUrl: string | null
  createdAt: string
}

export interface WorkoutLog {
  id: string
  userId: string
  workoutType: string
  startedAt: string
  completedAt: string | null
  durationMinutes: number | null
  exercises: WorkoutExerciseLog[]
}

export interface WorkoutExerciseLog {
  id: string
  exerciseName: string
  sortOrder: number
  sets: WorkoutSetLog[]
}

export interface WorkoutSetLog {
  id: string
  setNumber: number
  weightLbs: number | null
  reps: number | null
  durationMinutes: number | null
  distanceMiles: number | null
  speedMph: number | null
  inclinePercent: number | null
  caloriesBurned: number | null
}

export interface PersonalRecord {
  exerciseName: string
  prType: 'weight' | 'reps' | 'duration' | 'distance'
  value: number
  unit: string
  achievedAt: string
}

export interface PrivacySettings {
  shareLiveActivity: boolean
  sharePrs: boolean
  shareWorkoutHistory: boolean
  shareStreak: boolean
  profileVisibility: 'everyone' | 'friends' | 'private'
}
