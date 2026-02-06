import { useState, useRef } from 'react';
import { X, Settings, Sparkles, ChevronLeft, ChevronRight, Check, Eye, EyeOff, RefreshCw, Plus, List, Search, Dumbbell, Loader2 } from 'lucide-react';
import { useWorkouts } from '../hooks/useWorkouts';

interface ActiveWorkoutPageProps {
  onClose: () => void;
  muscleGroup?: string;
}

interface LoggedSet {
  weight: number;
  reps: number;
}

interface Exercise {
  id: number;
  name: string;
  muscleGroups: string;
  videoId: string;
  sets: number;
  aiSuggestion: { weight: number; reps: string };
}

// Master exercise library organized by primary muscle
const exerciseLibrary: Record<string, Exercise[]> = {
  'Chest': [
    { id: 101, name: 'Bench Press', muscleGroups: 'Chest • Triceps • Barbell', videoId: 'rT7DgCr-3pg', sets: 4, aiSuggestion: { weight: 185, reps: '8-10' } },
    { id: 102, name: 'Incline Dumbbell Press', muscleGroups: 'Upper Chest • Dumbbells', videoId: '8iPEnn-ltC8', sets: 4, aiSuggestion: { weight: 70, reps: '10-12' } },
    { id: 103, name: 'Cable Flyes', muscleGroups: 'Chest • Cable', videoId: 'Iwe6AmxVf7o', sets: 3, aiSuggestion: { weight: 40, reps: '12-15' } },
    { id: 104, name: 'Dips', muscleGroups: 'Lower Chest • Triceps • Bodyweight', videoId: '2z8JmcrW-As', sets: 3, aiSuggestion: { weight: 0, reps: '10-15' } },
    { id: 105, name: 'Dumbbell Flyes', muscleGroups: 'Chest • Dumbbells', videoId: 'eozdVDA78K0', sets: 3, aiSuggestion: { weight: 35, reps: '12-15' } },
    { id: 106, name: 'Incline Barbell Press', muscleGroups: 'Upper Chest • Barbell', videoId: 'SrqOu55lrYU', sets: 4, aiSuggestion: { weight: 155, reps: '8-10' } },
    { id: 107, name: 'Decline Bench Press', muscleGroups: 'Lower Chest • Barbell', videoId: 'LfyQBUKR8SE', sets: 3, aiSuggestion: { weight: 175, reps: '8-10' } },
    { id: 108, name: 'Chest Press Machine', muscleGroups: 'Chest • Machine', videoId: 'xUm0BiZCWlQ', sets: 3, aiSuggestion: { weight: 140, reps: '10-12' } },
    { id: 109, name: 'Push-ups', muscleGroups: 'Chest • Bodyweight', videoId: 'IODxDxX7oi4', sets: 3, aiSuggestion: { weight: 0, reps: '15-20' } },
    { id: 110, name: 'Pec Deck', muscleGroups: 'Chest • Machine', videoId: 'Z57CtFmRMxA', sets: 3, aiSuggestion: { weight: 120, reps: '12-15' } },
  ],
  'Back': [
    { id: 201, name: 'Deadlift', muscleGroups: 'Back • Hamstrings • Barbell', videoId: 'op9kVnSso6Q', sets: 5, aiSuggestion: { weight: 315, reps: '5-8' } },
    { id: 202, name: 'Barbell Rows', muscleGroups: 'Back • Biceps • Barbell', videoId: 'FWJR5Ve8bnQ', sets: 4, aiSuggestion: { weight: 155, reps: '8-10' } },
    { id: 203, name: 'Pull-ups', muscleGroups: 'Lats • Biceps • Bodyweight', videoId: 'eGo4IYlbE5g', sets: 4, aiSuggestion: { weight: 0, reps: '8-12' } },
    { id: 204, name: 'Lat Pulldown', muscleGroups: 'Lats • Cable', videoId: 'CAwf7n6Luuc', sets: 3, aiSuggestion: { weight: 140, reps: '10-12' } },
    { id: 205, name: 'Seated Cable Row', muscleGroups: 'Back • Cable', videoId: 'GZbfZ033f74', sets: 3, aiSuggestion: { weight: 130, reps: '10-12' } },
    { id: 206, name: 'Dumbbell Rows', muscleGroups: 'Back • Dumbbells', videoId: 'pYcpY20QaE8', sets: 3, aiSuggestion: { weight: 70, reps: '10-12' } },
    { id: 207, name: 'T-Bar Rows', muscleGroups: 'Back • Barbell', videoId: 'j3Igk5nyZE4', sets: 4, aiSuggestion: { weight: 135, reps: '8-10' } },
    { id: 208, name: 'Chin-ups', muscleGroups: 'Lats • Biceps • Bodyweight', videoId: 'brhRXlOhsAM', sets: 3, aiSuggestion: { weight: 0, reps: '8-12' } },
    { id: 209, name: 'Straight Arm Pulldown', muscleGroups: 'Lats • Cable', videoId: 'AjCCGN2tU3Q', sets: 3, aiSuggestion: { weight: 50, reps: '12-15' } },
  ],
  'Shoulders': [
    { id: 301, name: 'Overhead Press', muscleGroups: 'Shoulders • Triceps • Barbell', videoId: '2yjwXTZQDDI', sets: 4, aiSuggestion: { weight: 115, reps: '8-10' } },
    { id: 302, name: 'Lateral Raises', muscleGroups: 'Side Delts • Dumbbells', videoId: '3VcKaXpzqRo', sets: 4, aiSuggestion: { weight: 25, reps: '12-15' } },
    { id: 303, name: 'Face Pulls', muscleGroups: 'Rear Delts • Cable', videoId: 'rep-qVOkqgk', sets: 3, aiSuggestion: { weight: 40, reps: '15-20' } },
    { id: 304, name: 'Dumbbell Shoulder Press', muscleGroups: 'Shoulders • Dumbbells', videoId: 'qEwKCR5JCog', sets: 4, aiSuggestion: { weight: 50, reps: '8-10' } },
    { id: 305, name: 'Arnold Press', muscleGroups: 'Shoulders • Dumbbells', videoId: '6Z15_WdXmVw', sets: 3, aiSuggestion: { weight: 45, reps: '10-12' } },
    { id: 306, name: 'Reverse Flyes', muscleGroups: 'Rear Delts • Dumbbells', videoId: 'oLrBD5bBkZg', sets: 3, aiSuggestion: { weight: 20, reps: '12-15' } },
    { id: 307, name: 'Cable Lateral Raises', muscleGroups: 'Side Delts • Cable', videoId: 'PPrzBWZDOhA', sets: 3, aiSuggestion: { weight: 15, reps: '12-15' } },
    { id: 308, name: 'Front Raises', muscleGroups: 'Front Delts • Dumbbells', videoId: '-t7fuZ0KhDA', sets: 3, aiSuggestion: { weight: 25, reps: '12-15' } },
    { id: 309, name: 'Upright Rows', muscleGroups: 'Shoulders • Traps • Barbell', videoId: 'amCU-ziHITM', sets: 3, aiSuggestion: { weight: 65, reps: '10-12' } },
    { id: 310, name: 'Shrugs', muscleGroups: 'Traps • Dumbbells', videoId: 'cJRVVxmytaM', sets: 3, aiSuggestion: { weight: 70, reps: '12-15' } },
  ],
  'Biceps': [
    { id: 401, name: 'Barbell Curl', muscleGroups: 'Biceps • Barbell', videoId: 'kwG2ipFRgFo', sets: 4, aiSuggestion: { weight: 75, reps: '10-12' } },
    { id: 402, name: 'Hammer Curls', muscleGroups: 'Biceps • Brachialis • Dumbbells', videoId: 'zC3nLlEvin4', sets: 3, aiSuggestion: { weight: 35, reps: '10-12' } },
    { id: 403, name: 'Incline Dumbbell Curl', muscleGroups: 'Biceps • Dumbbells', videoId: 'soxrZlIl35U', sets: 3, aiSuggestion: { weight: 30, reps: '10-12' } },
    { id: 404, name: 'Preacher Curls', muscleGroups: 'Biceps • Machine', videoId: 'fIWP-FRFNU0', sets: 3, aiSuggestion: { weight: 55, reps: '10-12' } },
    { id: 405, name: 'Cable Curls', muscleGroups: 'Biceps • Cable', videoId: 'NFzTWp2qpiE', sets: 3, aiSuggestion: { weight: 40, reps: '12-15' } },
    { id: 406, name: 'Concentration Curls', muscleGroups: 'Biceps • Dumbbells', videoId: '0AUGkch3tzc', sets: 3, aiSuggestion: { weight: 30, reps: '10-12' } },
    { id: 407, name: 'EZ Bar Curl', muscleGroups: 'Biceps • EZ Bar', videoId: 'zG2xJ0Q5QtI', sets: 3, aiSuggestion: { weight: 65, reps: '10-12' } },
    { id: 408, name: 'Spider Curls', muscleGroups: 'Biceps • Dumbbells', videoId: 'yN6Q1UI_xkE', sets: 3, aiSuggestion: { weight: 25, reps: '10-12' } },
    { id: 409, name: 'Reverse Curls', muscleGroups: 'Forearms • Biceps • Barbell', videoId: 'nRgxYX2Ve9w', sets: 3, aiSuggestion: { weight: 45, reps: '12-15' } },
  ],
  'Triceps': [
    { id: 501, name: 'Tricep Pushdowns', muscleGroups: 'Triceps • Cable', videoId: '2-LAMcpzODU', sets: 4, aiSuggestion: { weight: 60, reps: '10-12' } },
    { id: 502, name: 'Skull Crushers', muscleGroups: 'Triceps • EZ Bar', videoId: 'd_KZxkY_0cM', sets: 3, aiSuggestion: { weight: 65, reps: '10-12' } },
    { id: 503, name: 'Overhead Tricep Extension', muscleGroups: 'Triceps • Cable', videoId: 'kiuVA0gs3EI', sets: 3, aiSuggestion: { weight: 50, reps: '10-12' } },
    { id: 504, name: 'Close-Grip Bench Press', muscleGroups: 'Triceps • Chest • Barbell', videoId: 'nEF0bv2FW94', sets: 3, aiSuggestion: { weight: 135, reps: '8-10' } },
    { id: 505, name: 'Tricep Kickbacks', muscleGroups: 'Triceps • Dumbbells', videoId: 'ZO81bExngMI', sets: 3, aiSuggestion: { weight: 20, reps: '12-15' } },
    { id: 506, name: 'Diamond Push-ups', muscleGroups: 'Triceps • Bodyweight', videoId: 'J0DnG1_S3li', sets: 3, aiSuggestion: { weight: 0, reps: '12-15' } },
    { id: 507, name: 'Rope Pushdowns', muscleGroups: 'Triceps • Cable', videoId: 'vB5OHsJ3EME', sets: 3, aiSuggestion: { weight: 45, reps: '12-15' } },
  ],
  'Legs': [
    { id: 601, name: 'Squat', muscleGroups: 'Quads • Glutes • Barbell', videoId: 'ultWZbUMPL8', sets: 5, aiSuggestion: { weight: 225, reps: '8-10' } },
    { id: 602, name: 'Romanian Deadlift', muscleGroups: 'Hamstrings • Glutes • Barbell', videoId: 'jEy_czb3RKA', sets: 4, aiSuggestion: { weight: 185, reps: '8-10' } },
    { id: 603, name: 'Leg Press', muscleGroups: 'Quads • Glutes • Machine', videoId: 'IZxyjW7MPJQ', sets: 4, aiSuggestion: { weight: 360, reps: '10-12' } },
    { id: 604, name: 'Leg Curls', muscleGroups: 'Hamstrings • Machine', videoId: '1Tq3QdYUuHs', sets: 3, aiSuggestion: { weight: 100, reps: '12-15' } },
    { id: 605, name: 'Calf Raises', muscleGroups: 'Calves • Machine', videoId: 'gwLzBJYoWlI', sets: 4, aiSuggestion: { weight: 150, reps: '15-20' } },
    { id: 606, name: 'Leg Extensions', muscleGroups: 'Quads • Machine', videoId: 'YyvSfVjQeL0', sets: 3, aiSuggestion: { weight: 120, reps: '12-15' } },
    { id: 607, name: 'Bulgarian Split Squats', muscleGroups: 'Quads • Glutes • Dumbbells', videoId: '2C-uNgKwPLE', sets: 3, aiSuggestion: { weight: 50, reps: '10-12' } },
    { id: 608, name: 'Hip Thrusts', muscleGroups: 'Glutes • Barbell', videoId: 'SEdqd1s0UcI', sets: 4, aiSuggestion: { weight: 185, reps: '10-12' } },
    { id: 609, name: 'Lunges', muscleGroups: 'Quads • Glutes • Dumbbells', videoId: 'QOVaHwm-Q6U', sets: 3, aiSuggestion: { weight: 40, reps: '10-12' } },
    { id: 610, name: 'Hack Squat', muscleGroups: 'Quads • Machine', videoId: '0tn5K9NlCfo', sets: 4, aiSuggestion: { weight: 180, reps: '10-12' } },
  ],
  'Core': [
    { id: 701, name: 'Cable Crunches', muscleGroups: 'Abs • Cable', videoId: 'AV5PmknP4ow', sets: 3, aiSuggestion: { weight: 80, reps: '15-20' } },
    { id: 702, name: 'Hanging Leg Raises', muscleGroups: 'Abs • Bodyweight', videoId: 'hdng3Nm1x_E', sets: 3, aiSuggestion: { weight: 0, reps: '12-15' } },
    { id: 703, name: 'Ab Wheel Rollouts', muscleGroups: 'Abs • Equipment', videoId: 'rqiTPdK1c_I', sets: 3, aiSuggestion: { weight: 0, reps: '10-15' } },
    { id: 704, name: 'Plank', muscleGroups: 'Core • Bodyweight', videoId: 'ASdvN_XEl_c', sets: 3, aiSuggestion: { weight: 0, reps: '45-60s' } },
    { id: 705, name: 'Russian Twists', muscleGroups: 'Obliques • Dumbbells', videoId: 'wkD8rjkodUI', sets: 3, aiSuggestion: { weight: 25, reps: '20' } },
    { id: 706, name: 'Decline Sit-ups', muscleGroups: 'Abs • Bodyweight', videoId: '-MNCtOlSEJY', sets: 3, aiSuggestion: { weight: 0, reps: '15-20' } },
  ],
};

// Map workout names to which muscle groups to pull exercises from
function getExercisesForWorkout(muscleGroup: string): Exercise[] {
  const lower = muscleGroup.toLowerCase();

  // Direct match
  for (const key of Object.keys(exerciseLibrary)) {
    if (lower === key.toLowerCase()) return exerciseLibrary[key];
  }

  // Compound workout mappings
  const muscleKeywords: Record<string, string[]> = {
    'chest': ['Chest'],
    'back': ['Back'],
    'shoulders': ['Shoulders'],
    'arms': ['Biceps', 'Triceps'],
    'biceps': ['Biceps'],
    'triceps': ['Triceps'],
    'legs': ['Legs'],
    'quads': ['Legs'],
    'hamstrings': ['Legs'],
    'glutes': ['Legs'],
    'calves': ['Legs'],
    'core': ['Core'],
    'abs': ['Core'],
    'push': ['Chest', 'Shoulders', 'Triceps'],
    'pull': ['Back', 'Biceps'],
  };

  // Find all matching muscle groups from the workout name
  const matchedGroups = new Set<string>();
  for (const [keyword, groups] of Object.entries(muscleKeywords)) {
    if (lower.includes(keyword)) {
      groups.forEach(g => matchedGroups.add(g));
    }
  }

  if (matchedGroups.size > 0) {
    const exercises: Exercise[] = [];
    for (const group of matchedGroups) {
      const groupExercises = exerciseLibrary[group] || [];
      // Take top exercises from each group proportionally
      const take = Math.max(2, Math.ceil(6 / matchedGroups.size));
      exercises.push(...groupExercises.slice(0, take));
    }
    return exercises;
  }

  // Fallback: return shoulders/arms
  return [...(exerciseLibrary['Shoulders'] || []).slice(0, 3), ...(exerciseLibrary['Biceps'] || []).slice(0, 2), ...(exerciseLibrary['Triceps'] || []).slice(0, 1)];
}

// Get ALL exercises from the same muscle groups as the current workout (for swapping)
function getRelatedExercises(muscleGroup: string): Exercise[] {
  const lower = muscleGroup.toLowerCase();
  const matchedGroups = new Set<string>();

  const muscleKeywords: Record<string, string[]> = {
    'chest': ['Chest'], 'back': ['Back'], 'shoulders': ['Shoulders'],
    'arms': ['Biceps', 'Triceps'], 'biceps': ['Biceps'], 'triceps': ['Triceps'],
    'legs': ['Legs'], 'quads': ['Legs'], 'hamstrings': ['Legs'],
    'glutes': ['Legs'], 'calves': ['Legs'], 'core': ['Core'], 'abs': ['Core'],
    'push': ['Chest', 'Shoulders', 'Triceps'], 'pull': ['Back', 'Biceps'],
  };

  for (const key of Object.keys(exerciseLibrary)) {
    if (lower === key.toLowerCase() || lower.includes(key.toLowerCase())) {
      matchedGroups.add(key);
    }
  }
  for (const [keyword, groups] of Object.entries(muscleKeywords)) {
    if (lower.includes(keyword)) {
      groups.forEach(g => matchedGroups.add(g));
    }
  }
  if (matchedGroups.size === 0) matchedGroups.add('Shoulders');

  const exercises: Exercise[] = [];
  for (const group of matchedGroups) {
    exercises.push(...(exerciseLibrary[group] || []));
  }
  return exercises.filter((e, i, self) => self.findIndex(x => x.name === e.name) === i);
}

// All exercises for "Add from Library"
const allExercises: Exercise[] = Object.values(exerciseLibrary).flat().filter(
  (exercise, index, self) => self.findIndex(e => e.name === exercise.name) === index
);

export function ActiveWorkoutPage({ onClose, muscleGroup }: ActiveWorkoutPageProps) {
  const { saveWorkout, saving } = useWorkouts();
  const startedAt = useRef(new Date().toISOString());
  const initialExercises = muscleGroup ? getExercisesForWorkout(muscleGroup) : getExercisesForWorkout('Shoulders/Arms');
  const [exercises, setExercises] = useState<Exercise[]>(initialExercises);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [currentSet, setCurrentSet] = useState(1);
  const [weight, setWeight] = useState(initialExercises[0].aiSuggestion.weight);
  const [reps, setReps] = useState(8);
  const [completedSets, setCompletedSets] = useState<number[]>([]);

  // Track all logged set data per exercise: exerciseIndex -> setNumber -> {weight, reps}
  const [loggedData, setLoggedData] = useState<Record<number, Record<number, LoggedSet>>>({});
  const [showEndConfirm, setShowEndConfirm] = useState(false);
  const [workoutFinished, setWorkoutFinished] = useState(false);

  // Settings state
  const [showSettings, setShowSettings] = useState(false);
  const [showVideo, setShowVideo] = useState(true);
  const [logMode, setLogMode] = useState<'set' | 'bulk'>('set');
  const [showSwapModal, setShowSwapModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addMode, setAddMode] = useState<'library' | 'custom' | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Custom exercise form state
  const [customName, setCustomName] = useState('');
  const [customSets, setCustomSets] = useState(3);
  const [customWeight, setCustomWeight] = useState(0);
  const [customReps, setCustomReps] = useState('8-10');

  // Bulk log state
  const [bulkSets, setBulkSets] = useState<{ weight: number; reps: number }[]>([]);

  const currentExercise = exercises[currentExerciseIndex];

  const initBulkSets = () => {
    setBulkSets(
      Array.from({ length: currentExercise.sets }, () => ({
        weight: currentExercise.aiSuggestion.weight,
        reps: parseInt(currentExercise.aiSuggestion.reps.split('-')[0]),
      }))
    );
  };

  const logSetData = (exerciseIdx: number, setNum: number, setData: LoggedSet) => {
    setLoggedData(prev => ({
      ...prev,
      [exerciseIdx]: {
        ...(prev[exerciseIdx] || {}),
        [setNum]: setData,
      },
    }));
  };

  const handleLogSet = () => {
    logSetData(currentExerciseIndex, currentSet, { weight, reps });
    setCompletedSets([...completedSets, currentSet]);

    if (currentSet < currentExercise.sets) {
      setCurrentSet(currentSet + 1);
    } else if (currentExerciseIndex < exercises.length - 1) {
      setCurrentExerciseIndex(currentExerciseIndex + 1);
      setCurrentSet(1);
      setCompletedSets([]);
      setWeight(exercises[currentExerciseIndex + 1].aiSuggestion.weight);
      setReps(8);
    } else {
      // Last set of last exercise — auto-finish
      setWorkoutFinished(true);
    }
  };

  const handleLogAllSets = () => {
    // Save all bulk set data
    bulkSets.forEach((set, idx) => {
      logSetData(currentExerciseIndex, idx + 1, { weight: set.weight, reps: set.reps });
    });

    if (currentExerciseIndex < exercises.length - 1) {
      setCurrentExerciseIndex(currentExerciseIndex + 1);
      setCurrentSet(1);
      setCompletedSets([]);
      setWeight(exercises[currentExerciseIndex + 1].aiSuggestion.weight);
      setReps(8);
      initBulkSets();
    } else {
      setWorkoutFinished(true);
    }
  };

  const handleFinishWorkout = async () => {
    const now = new Date();
    const start = new Date(startedAt.current);
    const durationMinutes = Math.round((now.getTime() - start.getTime()) / 60000);

    const exercisesToSave = exercises
      .map((ex, idx) => {
        const setsForExercise = loggedData[idx];
        if (!setsForExercise || Object.keys(setsForExercise).length === 0) return null;
        return {
          exerciseName: ex.name,
          sortOrder: idx,
          sets: Object.entries(setsForExercise).map(([setNum, setData]) => ({
            setNumber: parseInt(setNum),
            weightLbs: setData.weight,
            reps: setData.reps,
          })),
        };
      })
      .filter(Boolean) as { exerciseName: string; sortOrder: number; sets: { setNumber: number; weightLbs: number; reps: number }[] }[];

    if (exercisesToSave.length === 0) {
      onClose();
      return;
    }

    try {
      await saveWorkout({
        workoutType: muscleGroup || 'Workout',
        startedAt: startedAt.current,
        durationMinutes,
        exercises: exercisesToSave,
      });
      onClose();
    } catch (err) {
      console.error('Failed to save workout:', err);
      // Still close on error for now
      onClose();
    }
  };

  const handleUseAISuggestion = () => {
    setWeight(currentExercise.aiSuggestion.weight);
    const repRange = currentExercise.aiSuggestion.reps.split('-');
    setReps(parseInt(repRange[0]));
  };

  const handlePreviousExercise = () => {
    if (currentExerciseIndex > 0) {
      const newIdx = currentExerciseIndex - 1;
      setCurrentExerciseIndex(newIdx);
      setCurrentSet(1);
      setCompletedSets([]);
      setWeight(exercises[newIdx].aiSuggestion.weight);
      setReps(8);
    }
  };

  const handleNextExercise = () => {
    if (currentExerciseIndex < exercises.length - 1) {
      const newIdx = currentExerciseIndex + 1;
      setCurrentExerciseIndex(newIdx);
      setCurrentSet(1);
      setCompletedSets([]);
      setWeight(exercises[newIdx].aiSuggestion.weight);
      setReps(8);
    }
  };

  const handleSwapExercise = (newExercise: Exercise) => {
    const updated = [...exercises];
    updated[currentExerciseIndex] = newExercise;
    setExercises(updated);
    setCurrentSet(1);
    setCompletedSets([]);
    setWeight(newExercise.aiSuggestion.weight);
    setReps(parseInt(newExercise.aiSuggestion.reps.split('-')[0]));
    setShowSwapModal(false);
  };

  const handleAddExercise = (exercise: Exercise) => {
    setExercises([...exercises, exercise]);
    setShowAddModal(false);
    setAddMode(null);
    setSearchQuery('');
  };

  const handleAddCustomExercise = () => {
    if (!customName.trim()) return;
    const newExercise: Exercise = {
      id: Date.now(),
      name: customName.trim(),
      muscleGroups: 'Custom',
      videoId: '',
      sets: customSets,
      aiSuggestion: { weight: customWeight, reps: customReps },
    };
    setExercises([...exercises, newExercise]);
    setShowAddModal(false);
    setAddMode(null);
    setCustomName('');
    setCustomSets(3);
    setCustomWeight(0);
    setCustomReps('8-10');
  };

  // Get swap alternatives: ONLY same muscle group exercises not currently in the workout
  const getSwapAlternatives = () => {
    const currentNames = exercises.map(e => e.name);
    const related = getRelatedExercises(muscleGroup || 'Shoulders/Arms');
    return related.filter(e => !currentNames.includes(e.name));
  };

  const filteredLibraryExercises = allExercises.filter(e =>
    !exercises.find(ex => ex.name === e.name) &&
    e.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-3">
      <div className="w-full max-w-2xl bg-gradient-to-b from-[#0f0f0f] to-black rounded-3xl shadow-2xl max-h-[96vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-b from-[#1a1a1a]/50 to-transparent backdrop-blur-sm relative">
          <button
            onClick={() => setShowEndConfirm(true)}
            className="flex items-center gap-1.5 text-gray-400 hover:text-white transition-colors -ml-2 p-2 rounded-xl hover:bg-white/5"
          >
            <ChevronLeft className="w-5 h-5" />
            <span className="text-sm font-medium">End</span>
          </button>

          <div className="absolute left-1/2 -translate-x-1/2">
            <h1 className="font-bold text-base">{currentExercise.name}</h1>
            <p className="text-[10px] text-gray-500 text-center">{currentExerciseIndex + 1} of {exercises.length}</p>
          </div>

          <button
            onClick={() => setShowSettings(!showSettings)}
            className={`p-2 rounded-xl transition-colors ${showSettings ? 'bg-white/10' : 'hover:bg-white/5'}`}
          >
            <Settings className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Settings Dropdown */}
        {showSettings && (
          <div className="mx-5 mb-2 bg-[#1a1a1a] border border-gray-800 rounded-2xl overflow-hidden">
            <button
              onClick={() => { setShowVideo(!showVideo); setShowSettings(false); }}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors"
            >
              {showVideo ? <EyeOff className="w-4 h-4 text-gray-400" /> : <Eye className="w-4 h-4 text-[#00ff00]" />}
              <span className="text-sm font-medium flex-1 text-left">{showVideo ? 'Hide Video' : 'Show Video'}</span>
            </button>
            <div className="h-px bg-gray-800 mx-4" />
            <button
              onClick={() => { setShowSwapModal(true); setShowSettings(false); }}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors"
            >
              <RefreshCw className="w-4 h-4 text-gray-400" />
              <span className="text-sm font-medium flex-1 text-left">Swap Exercise</span>
            </button>
            <div className="h-px bg-gray-800 mx-4" />
            <button
              onClick={() => { setShowAddModal(true); setShowSettings(false); }}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors"
            >
              <Plus className="w-4 h-4 text-gray-400" />
              <span className="text-sm font-medium flex-1 text-left">Add Exercise</span>
            </button>
            <div className="h-px bg-gray-800 mx-4" />
            <button
              onClick={() => {
                const newMode = logMode === 'set' ? 'bulk' : 'set';
                setLogMode(newMode);
                if (newMode === 'bulk') initBulkSets();
                setShowSettings(false);
              }}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors"
            >
              <List className="w-4 h-4 text-gray-400" />
              <span className="text-sm font-medium flex-1 text-left">
                {logMode === 'set' ? 'Log All at Once' : 'Log Set by Set'}
              </span>
              <span className="text-[10px] text-gray-500 bg-gray-800 px-2 py-0.5 rounded-full">
                {logMode === 'set' ? 'Set by Set' : 'Bulk'}
              </span>
            </button>
          </div>
        )}

        <div className="flex-1 overflow-y-auto scrollbar-hide">
          {/* Video Section */}
          {showVideo && currentExercise.videoId && (
            <div className="px-5 pt-3 pb-4">
              <div className="aspect-[16/9] w-full relative overflow-hidden rounded-2xl">
                <iframe
                  src={`https://www.youtube.com/embed/${currentExercise.videoId}?autoplay=0&controls=1&modestbranding=1&rel=0&showinfo=0`}
                  className="absolute inset-0 w-full h-full bg-black"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
                <div className="absolute top-3 left-3 bg-yellow-400 px-2.5 py-1 rounded-lg">
                  <span className="text-black text-[11px] font-bold">Form Check</span>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-3 text-center">{currentExercise.muscleGroups}</p>
            </div>
          )}

          {/* Muscle groups label when video hidden */}
          {(!showVideo || !currentExercise.videoId) && (
            <div className="px-5 pt-3 pb-2">
              <p className="text-xs text-gray-500 text-center">{currentExercise.muscleGroups}</p>
            </div>
          )}

          <div className="px-5 pb-6 space-y-4">
            {/* Set-by-Set Mode */}
            {logMode === 'set' && (
              <>
                {/* Set tracker circles */}
                <div className="flex items-center gap-2.5 justify-center">
                  {Array.from({ length: currentExercise.sets }).map((_, index) => {
                    const setNumber = index + 1;
                    const isCompleted = completedSets.includes(setNumber);
                    const isCurrent = setNumber === currentSet;

                    return (
                      <button
                        key={setNumber}
                        onClick={() => !isCompleted && setCurrentSet(setNumber)}
                        className={`relative w-11 h-11 rounded-full font-semibold text-sm transition-all ${
                          isCompleted
                            ? 'bg-[#00ff00] text-black scale-105'
                            : isCurrent
                            ? 'bg-white text-black scale-110 ring-2 ring-white/20 ring-offset-2 ring-offset-black'
                            : 'bg-[#1a1a1a] text-gray-500 hover:bg-[#252525] hover:text-gray-300'
                        }`}
                      >
                        {isCompleted ? <Check className="w-4 h-4 mx-auto" /> : setNumber}
                      </button>
                    );
                  })}
                </div>

                {/* AI Recommendation */}
                <div className="bg-[#00ff00]/5 rounded-2xl p-3.5 border border-[#00ff00]/10">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-[#00ff00]" />
                        <span className="text-[11px] text-[#00ff00] font-semibold tracking-wide">AI RECOMMENDS</span>
                      </div>
                      <p className="text-xl font-bold">
                        {currentExercise.aiSuggestion.weight} lbs <span className="text-gray-600">&times;</span> {currentExercise.aiSuggestion.reps}
                      </p>
                    </div>
                    <button
                      onClick={handleUseAISuggestion}
                      className="px-3.5 py-2 bg-[#00ff00] text-black rounded-xl font-semibold text-xs hover:bg-[#00dd00] transition-all active:scale-95"
                    >
                      Apply
                    </button>
                  </div>
                </div>

                {/* Weight & Reps Inputs */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-gray-500 mb-2 font-medium tracking-wide">WEIGHT</label>
                    <div className="bg-[#1a1a1a] rounded-2xl p-3">
                      <div className="flex items-center justify-between mb-2">
                        <button
                          onClick={() => setWeight(Math.max(0, weight - 5))}
                          className="w-9 h-9 bg-[#252525] hover:bg-[#333333] rounded-xl flex items-center justify-center transition-all active:scale-90"
                        >
                          <span className="text-xl font-bold text-gray-400">&minus;</span>
                        </button>
                        <div className="text-center">
                          <span className="text-2xl font-bold">{weight}</span>
                          <span className="text-xs text-gray-500 ml-1">lbs</span>
                        </div>
                        <button
                          onClick={() => setWeight(weight + 5)}
                          className="w-9 h-9 bg-[#252525] hover:bg-[#333333] rounded-xl flex items-center justify-center transition-all active:scale-90"
                        >
                          <span className="text-xl font-bold text-gray-400">+</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] text-gray-500 mb-2 font-medium tracking-wide">REPS</label>
                    <div className="bg-[#1a1a1a] rounded-2xl p-3">
                      <div className="flex items-center justify-between mb-2">
                        <button
                          onClick={() => setReps(Math.max(1, reps - 1))}
                          className="w-9 h-9 bg-[#252525] hover:bg-[#333333] rounded-xl flex items-center justify-center transition-all active:scale-90"
                        >
                          <span className="text-xl font-bold text-gray-400">&minus;</span>
                        </button>
                        <div className="text-center">
                          <span className="text-2xl font-bold">{reps}</span>
                        </div>
                        <button
                          onClick={() => setReps(reps + 1)}
                          className="w-9 h-9 bg-[#252525] hover:bg-[#333333] rounded-xl flex items-center justify-center transition-all active:scale-90"
                        >
                          <span className="text-xl font-bold text-gray-400">+</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleLogSet}
                  className="w-full bg-[#00ff00] text-black font-bold py-3.5 rounded-2xl text-sm hover:bg-[#00dd00] transition-all active:scale-[0.97] flex items-center justify-center gap-2 shadow-lg shadow-[#00ff00]/20"
                >
                  <Check className="w-4 h-4" />
                  Complete Set {currentSet}
                </button>
              </>
            )}

            {/* Bulk Log Mode */}
            {logMode === 'bulk' && (
              <>
                <div className="bg-[#1a1a1a] rounded-2xl p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <List className="w-4 h-4 text-[#00ff00]" />
                    <span className="text-xs font-semibold text-[#00ff00]">BULK LOG MODE</span>
                  </div>

                  <div className="space-y-2">
                    {/* Header row */}
                    <div className="grid grid-cols-[40px_1fr_1fr] gap-2 text-[10px] text-gray-500 font-medium px-1">
                      <span>SET</span>
                      <span>WEIGHT (lbs)</span>
                      <span>REPS</span>
                    </div>

                    {bulkSets.map((set, idx) => (
                      <div key={idx} className="grid grid-cols-[40px_1fr_1fr] gap-2 items-center">
                        <span className="text-sm font-semibold text-gray-400 text-center">{idx + 1}</span>
                        <input
                          type="number"
                          value={set.weight}
                          onChange={(e) => {
                            const updated = [...bulkSets];
                            updated[idx] = { ...updated[idx], weight: parseInt(e.target.value) || 0 };
                            setBulkSets(updated);
                          }}
                          className="bg-[#252525] rounded-xl px-3 py-2.5 text-sm text-white text-center focus:outline-none focus:ring-1 focus:ring-[#00ff00] transition-all"
                        />
                        <input
                          type="number"
                          value={set.reps}
                          onChange={(e) => {
                            const updated = [...bulkSets];
                            updated[idx] = { ...updated[idx], reps: parseInt(e.target.value) || 0 };
                            setBulkSets(updated);
                          }}
                          className="bg-[#252525] rounded-xl px-3 py-2.5 text-sm text-white text-center focus:outline-none focus:ring-1 focus:ring-[#00ff00] transition-all"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleLogAllSets}
                  className="w-full bg-[#00ff00] text-black font-bold py-3.5 rounded-2xl text-sm hover:bg-[#00dd00] transition-all active:scale-[0.97] flex items-center justify-center gap-2 shadow-lg shadow-[#00ff00]/20"
                >
                  <Check className="w-4 h-4" />
                  Complete All Sets
                </button>
              </>
            )}

            {/* Prev/Next Exercise Navigation */}
            {exercises.length > 1 && (
              <div className="flex items-center justify-between pt-1 px-1">
                <button
                  onClick={handlePreviousExercise}
                  disabled={currentExerciseIndex === 0}
                  className="flex items-center gap-1 text-gray-500 hover:text-white disabled:opacity-20 disabled:hover:text-gray-500 transition-colors text-xs font-medium"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Prev</span>
                </button>

                <div className="flex gap-1">
                  {exercises.map((_, idx) => (
                    <div
                      key={idx}
                      className={`w-1 h-1 rounded-full transition-all ${
                        idx === currentExerciseIndex ? 'bg-[#00ff00] w-3' : 'bg-gray-700'
                      }`}
                    />
                  ))}
                </div>

                <button
                  onClick={handleNextExercise}
                  disabled={currentExerciseIndex === exercises.length - 1}
                  className="flex items-center gap-1 text-gray-500 hover:text-white disabled:opacity-20 disabled:hover:text-gray-500 transition-colors text-xs font-medium"
                >
                  <span>Next</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Swap Exercise Modal */}
      {showSwapModal && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[60] flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-gradient-to-b from-[#0f0f0f] to-black rounded-3xl shadow-2xl max-h-[80vh] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-800">
              <div>
                <h2 className="font-bold text-lg">Swap Exercise</h2>
                <p className="text-xs text-gray-500 mt-0.5">Replace {currentExercise.name}</p>
              </div>
              <button
                onClick={() => setShowSwapModal(false)}
                className="p-2 hover:bg-white/5 rounded-xl transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {getSwapAlternatives().length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-8">No alternative exercises available</p>
              ) : (
                getSwapAlternatives().map((exercise) => (
                  <button
                    key={exercise.name}
                    onClick={() => handleSwapExercise(exercise)}
                    className="w-full bg-[#1a1a1a] hover:bg-[#252525] rounded-2xl p-4 flex items-center gap-3 transition-colors text-left"
                  >
                    <div className="w-10 h-10 bg-[#252525] rounded-xl flex items-center justify-center">
                      <Dumbbell className="w-5 h-5 text-[#00ff00]" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-sm">{exercise.name}</p>
                      <p className="text-xs text-gray-500">{exercise.muscleGroups}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-400">{exercise.sets} sets</p>
                      <p className="text-[10px] text-gray-600">{exercise.aiSuggestion.reps} reps</p>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* End Workout Confirmation */}
      {showEndConfirm && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[60] flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-[#1a1a1a] rounded-3xl p-6 text-center">
            <h2 className="font-bold text-lg mb-2">End Workout?</h2>
            <p className="text-sm text-gray-400 mb-6">
              {Object.keys(loggedData).length > 0
                ? 'Your logged sets will be saved.'
                : 'No sets logged yet. Nothing will be saved.'}
            </p>
            <div className="space-y-2">
              <button
                onClick={handleFinishWorkout}
                disabled={saving}
                className="w-full bg-[#00ff00] text-black font-bold py-3 rounded-2xl text-sm hover:bg-[#00dd00] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                {saving ? 'Saving...' : 'Save & End'}
              </button>
              <button
                onClick={onClose}
                className="w-full text-red-400 font-medium py-3 rounded-2xl text-sm hover:bg-red-500/10 transition-colors"
              >
                Discard & Exit
              </button>
              <button
                onClick={() => setShowEndConfirm(false)}
                className="w-full text-gray-400 font-medium py-3 rounded-2xl text-sm hover:bg-white/5 transition-colors"
              >
                Continue Workout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Workout Finished */}
      {workoutFinished && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[60] flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-[#1a1a1a] rounded-3xl p-6 text-center">
            <div className="w-16 h-16 bg-[#00ff00] rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-black" />
            </div>
            <h2 className="font-bold text-xl mb-2">Workout Complete!</h2>
            <p className="text-sm text-gray-400 mb-6">
              {Object.keys(loggedData).length} exercise{Object.keys(loggedData).length !== 1 ? 's' : ''} logged
            </p>
            <button
              onClick={handleFinishWorkout}
              disabled={saving}
              className="w-full bg-[#00ff00] text-black font-bold py-4 rounded-2xl text-sm hover:bg-[#00dd00] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              {saving ? 'Saving...' : 'Save Workout'}
            </button>
          </div>
        </div>
      )}

      {/* Add Exercise Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[60] flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-gradient-to-b from-[#0f0f0f] to-black rounded-3xl shadow-2xl max-h-[80vh] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-800">
              <h2 className="font-bold text-lg">
                {addMode === 'library' ? 'Exercise Library' : addMode === 'custom' ? 'Custom Exercise' : 'Add Exercise'}
              </h2>
              <button
                onClick={() => { setShowAddModal(false); setAddMode(null); setSearchQuery(''); }}
                className="p-2 hover:bg-white/5 rounded-xl transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {/* Mode Selection */}
              {!addMode && (
                <div className="space-y-3">
                  <button
                    onClick={() => setAddMode('library')}
                    className="w-full bg-[#1a1a1a] hover:bg-[#252525] rounded-2xl p-4 flex items-center gap-3 transition-colors"
                  >
                    <div className="w-10 h-10 bg-[#00ff00]/10 rounded-xl flex items-center justify-center">
                      <Search className="w-5 h-5 text-[#00ff00]" />
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-sm">From Library</p>
                      <p className="text-xs text-gray-500">Browse all exercises</p>
                    </div>
                  </button>

                  <button
                    onClick={() => setAddMode('custom')}
                    className="w-full bg-[#1a1a1a] hover:bg-[#252525] rounded-2xl p-4 flex items-center gap-3 transition-colors"
                  >
                    <div className="w-10 h-10 bg-[#00ff00]/10 rounded-xl flex items-center justify-center">
                      <Plus className="w-5 h-5 text-[#00ff00]" />
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-sm">Custom Exercise</p>
                      <p className="text-xs text-gray-500">Add one that's not in the library</p>
                    </div>
                  </button>
                </div>
              )}

              {/* Library Browse */}
              {addMode === 'library' && (
                <div className="space-y-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search exercises..."
                      className="w-full bg-[#1a1a1a] border border-gray-800 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#00ff00] transition-colors"
                      autoFocus
                    />
                  </div>

                  <div className="space-y-2">
                    {filteredLibraryExercises.map((exercise) => (
                      <button
                        key={exercise.name}
                        onClick={() => handleAddExercise(exercise)}
                        className="w-full bg-[#1a1a1a] hover:bg-[#252525] rounded-2xl p-4 flex items-center gap-3 transition-colors text-left"
                      >
                        <div className="w-10 h-10 bg-[#252525] rounded-xl flex items-center justify-center">
                          <Dumbbell className="w-5 h-5 text-[#00ff00]" />
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-sm">{exercise.name}</p>
                          <p className="text-xs text-gray-500">{exercise.muscleGroups}</p>
                        </div>
                        <Plus className="w-4 h-4 text-gray-500" />
                      </button>
                    ))}
                    {filteredLibraryExercises.length === 0 && (
                      <p className="text-sm text-gray-500 text-center py-6">No exercises found</p>
                    )}
                  </div>
                </div>
              )}

              {/* Custom Exercise Form */}
              {addMode === 'custom' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-[11px] text-gray-500 mb-2 font-medium tracking-wide">EXERCISE NAME</label>
                    <input
                      type="text"
                      value={customName}
                      onChange={(e) => setCustomName(e.target.value)}
                      placeholder="e.g. Cable Lateral Raise"
                      className="w-full bg-[#1a1a1a] border border-gray-800 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#00ff00] transition-colors"
                      autoFocus
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] text-gray-500 mb-2 font-medium tracking-wide">SETS</label>
                      <input
                        type="number"
                        value={customSets}
                        onChange={(e) => setCustomSets(parseInt(e.target.value) || 1)}
                        min={1}
                        max={10}
                        className="w-full bg-[#1a1a1a] border border-gray-800 rounded-xl px-3 py-3 text-sm text-white text-center focus:outline-none focus:border-[#00ff00] transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-gray-500 mb-2 font-medium tracking-wide">WEIGHT</label>
                      <input
                        type="number"
                        value={customWeight}
                        onChange={(e) => setCustomWeight(parseInt(e.target.value) || 0)}
                        className="w-full bg-[#1a1a1a] border border-gray-800 rounded-xl px-3 py-3 text-sm text-white text-center focus:outline-none focus:border-[#00ff00] transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-gray-500 mb-2 font-medium tracking-wide">REPS</label>
                      <input
                        type="text"
                        value={customReps}
                        onChange={(e) => setCustomReps(e.target.value)}
                        placeholder="8-10"
                        className="w-full bg-[#1a1a1a] border border-gray-800 rounded-xl px-3 py-3 text-sm text-white text-center focus:outline-none focus:border-[#00ff00] transition-colors"
                      />
                    </div>
                  </div>

                  <button
                    onClick={handleAddCustomExercise}
                    disabled={!customName.trim()}
                    className="w-full bg-[#00ff00] text-black font-bold py-3.5 rounded-2xl text-sm hover:bg-[#00dd00] transition-all active:scale-[0.97] disabled:opacity-30 flex items-center justify-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Add Exercise
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
