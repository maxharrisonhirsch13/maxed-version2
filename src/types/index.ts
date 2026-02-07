export interface GymResult {
  placeId: string
  name: string
  address: string
  lat: number
  lng: number
}

export interface HomeEquipment {
  dumbbells: { has: boolean; maxWeight: number }
  barbell: { has: boolean; maxWeight: number }
  kettlebell: { has: boolean; maxWeight: number }
  cables: boolean
  pullUpBar: boolean
}

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
  gymPlaceId: string | null
  gymAddress: string | null
  gymLat: number | null
  gymLng: number | null
  wearables: string[]
  goal: string | null
  customGoal: string | null
  split: string | null
  customSplit: { day: number; muscles: string[] }[]
  homeEquipment: HomeEquipment | null
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

export interface WhoopData {
  recovery: {
    score: number
    restingHeartRate: number
    hrv: number
    spo2: number | null
    skinTemp: number | null
  } | null
  sleep: {
    qualityDuration: number
    totalInBedDuration: number
    remSleepDuration: number
    deepSleepDuration: number
    lightSleepDuration: number
    awakeDuration: number
    sleepScore: number | null
  } | null
  strain: {
    score: number
    averageHeartRate: number
    maxHeartRate: number
    kilojoules: number
  } | null
  connected: boolean
}

export interface OuraData {
  readiness: {
    score: number | null
    temperatureDeviation: number | null
    hrvBalance: number | null
    restingHeartRate: number | null
  } | null
  sleep: {
    score: number | null
    totalSleepDuration: number | null
    deepSleepDuration: number | null
    remSleepDuration: number | null
    efficiency: number | null
    restfulness: number | null
  } | null
  activity: {
    score: number | null
    activeCalories: number | null
    steps: number | null
    walkingDistance: number | null
  } | null
  connected: boolean
}

export interface PrivacySettings {
  shareLiveActivity: boolean
  sharePrs: boolean
  shareWorkoutHistory: boolean
  shareStreak: boolean
  profileVisibility: 'everyone' | 'friends' | 'private'
}
