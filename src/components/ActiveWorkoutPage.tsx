import { useState, useRef, useEffect } from 'react';
import { X, Settings, Sparkles, ChevronLeft, ChevronRight, Check, Eye, EyeOff, RefreshCw, Plus, List, Search, Dumbbell, Loader2 } from 'lucide-react';
import { useWorkouts } from '../hooks/useWorkouts';
import { useWorkoutHistory } from '../hooks/useWorkoutHistory';
import { useWhoopData } from '../hooks/useWhoopData';
import { useAuth } from '../context/AuthContext';
import { useAICoach } from '../hooks/useAICoach';
import { ShareWorkoutPrompt } from './ShareWorkoutPrompt';
import type { HomeEquipment } from '../types';

interface ActiveWorkoutPageProps {
  onClose: () => void;
  muscleGroup?: string;
  fewerSets?: boolean;     // Cap all exercises at 3 sets
  quickVersion?: boolean;  // Only 4 exercises, 3 sets each
  customBuild?: boolean;   // Start empty, user adds exercises
  trainingAtHome?: boolean; // Whether user is training at home gym
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
// Video IDs verified from muscleandstrength.com — empty string = no video available
const exerciseLibrary: Record<string, Exercise[]> = {
  'Chest': [
    { id: 101, name: 'Bench Press', muscleGroups: 'Chest • Triceps • Barbell', videoId: 'tuwHzzPdaGc', sets: 4, aiSuggestion: { weight: 185, reps: '8-10' } },
    { id: 102, name: 'Incline Dumbbell Press', muscleGroups: 'Upper Chest • Dumbbells', videoId: '8nNi8jbbUPE', sets: 4, aiSuggestion: { weight: 70, reps: '10-12' } },
    { id: 103, name: 'Cable Flyes', muscleGroups: 'Chest • Cable', videoId: 'Iwe6AmxVf7o', sets: 3, aiSuggestion: { weight: 40, reps: '12-15' } },
    { id: 104, name: 'Dips', muscleGroups: 'Lower Chest • Triceps • Bodyweight', videoId: 'FG1ENBFsdHU', sets: 3, aiSuggestion: { weight: 0, reps: '10-15' } },
    { id: 105, name: 'Dumbbell Flyes', muscleGroups: 'Chest • Dumbbells', videoId: '-lcbvOddoi8', sets: 3, aiSuggestion: { weight: 35, reps: '12-15' } },
    { id: 106, name: 'Incline Barbell Press', muscleGroups: 'Upper Chest • Barbell', videoId: 'uIzbJX5EVIY', sets: 4, aiSuggestion: { weight: 155, reps: '8-10' } },
    { id: 107, name: 'Decline Bench Press', muscleGroups: 'Lower Chest • Barbell', videoId: 'oIgci8aNsG0', sets: 3, aiSuggestion: { weight: 175, reps: '8-10' } },
    { id: 108, name: 'Chest Press Machine', muscleGroups: 'Chest • Machine', videoId: '3gM2jGQJffk', sets: 3, aiSuggestion: { weight: 140, reps: '10-12' } },
    { id: 109, name: 'Push-ups', muscleGroups: 'Chest • Bodyweight', videoId: 'KEFQyLkDYtI', sets: 3, aiSuggestion: { weight: 0, reps: '15-20' } },
    { id: 110, name: 'Pec Deck', muscleGroups: 'Chest • Machine', videoId: '-DZXcuPi4vk', sets: 3, aiSuggestion: { weight: 120, reps: '12-15' } },
  ],
  'Back': [
    { id: 201, name: 'Deadlift', muscleGroups: 'Back • Hamstrings • Barbell', videoId: 'wjsu6ceEkAQ', sets: 5, aiSuggestion: { weight: 315, reps: '5-8' } },
    { id: 202, name: 'Barbell Rows', muscleGroups: 'Back • Biceps • Barbell', videoId: 'paCfxhgW6bI', sets: 4, aiSuggestion: { weight: 155, reps: '8-10' } },
    { id: 203, name: 'Pull-ups', muscleGroups: 'Lats • Biceps • Bodyweight', videoId: 'eGo4IYlbE5g', sets: 4, aiSuggestion: { weight: 0, reps: '8-12' } },
    { id: 204, name: 'Lat Pulldown', muscleGroups: 'Lats • Cable', videoId: 'iKrKgWR9wbY', sets: 3, aiSuggestion: { weight: 140, reps: '10-12' } },
    { id: 205, name: 'Seated Cable Row', muscleGroups: 'Back • Cable', videoId: 'xQNrFHEMhI4', sets: 3, aiSuggestion: { weight: 130, reps: '10-12' } },
    { id: 206, name: 'Dumbbell Rows', muscleGroups: 'Back • Dumbbells', videoId: 'DhewkuU_95s', sets: 3, aiSuggestion: { weight: 70, reps: '10-12' } },
    { id: 207, name: 'T-Bar Rows', muscleGroups: 'Back • Barbell', videoId: 'gJSov9rHIf0', sets: 4, aiSuggestion: { weight: 135, reps: '8-10' } },
    { id: 208, name: 'Chin-ups', muscleGroups: 'Lats • Biceps • Bodyweight', videoId: '1EJ3A3rEtlo', sets: 3, aiSuggestion: { weight: 0, reps: '8-12' } },
    { id: 209, name: 'Straight Arm Pulldown', muscleGroups: 'Lats • Cable', videoId: 'gDtXrJWPdlY', sets: 3, aiSuggestion: { weight: 50, reps: '12-15' } },
  ],
  'Shoulders': [
    { id: 301, name: 'Overhead Press', muscleGroups: 'Shoulders • Triceps • Barbell', videoId: '2yjwXTZQDDI', sets: 4, aiSuggestion: { weight: 115, reps: '8-10' } },
    { id: 302, name: 'Lateral Raises', muscleGroups: 'Side Delts • Dumbbells', videoId: '3VcKaXpzqRo', sets: 4, aiSuggestion: { weight: 25, reps: '12-15' } },
    { id: 303, name: 'Face Pulls', muscleGroups: 'Rear Delts • Cable', videoId: 'rep-qVOkqgk', sets: 3, aiSuggestion: { weight: 40, reps: '15-20' } },
    { id: 304, name: 'Dumbbell Shoulder Press', muscleGroups: 'Shoulders • Dumbbells', videoId: 'FRxZ6wr5bpA', sets: 4, aiSuggestion: { weight: 50, reps: '8-10' } },
    { id: 305, name: 'Arnold Press', muscleGroups: 'Shoulders • Dumbbells', videoId: 'hmnZKRpYaV8', sets: 3, aiSuggestion: { weight: 45, reps: '10-12' } },
    { id: 306, name: 'Reverse Flyes', muscleGroups: 'Rear Delts • Dumbbells', videoId: 'Fgz_FdzDukE', sets: 3, aiSuggestion: { weight: 20, reps: '12-15' } },
    { id: 307, name: 'Cable Lateral Raises', muscleGroups: 'Side Delts • Cable', videoId: 'Fv-eAW1uKDI', sets: 3, aiSuggestion: { weight: 15, reps: '12-15' } },
    { id: 308, name: 'Front Raises', muscleGroups: 'Front Delts • Dumbbells', videoId: '-t7fuZ0KhDA', sets: 3, aiSuggestion: { weight: 25, reps: '12-15' } },
    { id: 309, name: 'Upright Rows', muscleGroups: 'Shoulders • Traps • Barbell', videoId: 'amCU-ziHITM', sets: 3, aiSuggestion: { weight: 65, reps: '10-12' } },
    { id: 310, name: 'Shrugs', muscleGroups: 'Traps • Dumbbells', videoId: '6hNudn7Peco', sets: 3, aiSuggestion: { weight: 70, reps: '12-15' } },
  ],
  'Biceps': [
    { id: 401, name: 'Barbell Curl', muscleGroups: 'Biceps • Barbell', videoId: 'QZEqB6wUPxQ', sets: 4, aiSuggestion: { weight: 75, reps: '10-12' } },
    { id: 402, name: 'Hammer Curls', muscleGroups: 'Biceps • Brachialis • Dumbbells', videoId: 'zC3nLlEvin4', sets: 3, aiSuggestion: { weight: 35, reps: '10-12' } },
    { id: 403, name: 'Incline Dumbbell Curl', muscleGroups: 'Biceps • Dumbbells', videoId: 'UeleXjsE-98', sets: 3, aiSuggestion: { weight: 30, reps: '10-12' } },
    { id: 404, name: 'Preacher Curls', muscleGroups: 'Biceps • Machine', videoId: 'nbcgEmZ0Be4', sets: 3, aiSuggestion: { weight: 55, reps: '10-12' } },
    { id: 405, name: 'Cable Curls', muscleGroups: 'Biceps • Cable', videoId: 'NFzTWp2qpiE', sets: 3, aiSuggestion: { weight: 40, reps: '12-15' } },
    { id: 406, name: 'Concentration Curls', muscleGroups: 'Biceps • Dumbbells', videoId: 'LHDwya1KY8M', sets: 3, aiSuggestion: { weight: 30, reps: '10-12' } },
    { id: 407, name: 'EZ Bar Curl', muscleGroups: 'Biceps • EZ Bar', videoId: 'aDQNzO2JQr4', sets: 3, aiSuggestion: { weight: 65, reps: '10-12' } },
    { id: 408, name: 'Spider Curls', muscleGroups: 'Biceps • Dumbbells', videoId: 'CITtSuda0Fg', sets: 3, aiSuggestion: { weight: 25, reps: '10-12' } },
    { id: 409, name: 'Reverse Curls', muscleGroups: 'Forearms • Biceps • Barbell', videoId: 'nRgxYX2Ve9w', sets: 3, aiSuggestion: { weight: 45, reps: '12-15' } },
  ],
  'Triceps': [
    { id: 501, name: 'Tricep Pushdowns', muscleGroups: 'Triceps • Cable', videoId: '_w-HpW70nSQ', sets: 4, aiSuggestion: { weight: 60, reps: '10-12' } },
    { id: 502, name: 'Skull Crushers', muscleGroups: 'Triceps • EZ Bar', videoId: 'K6MSN4hCDM4', sets: 3, aiSuggestion: { weight: 65, reps: '10-12' } },
    { id: 503, name: 'Overhead Tricep Extension', muscleGroups: 'Triceps • Cable', videoId: 'NRENeEgaIgA', sets: 3, aiSuggestion: { weight: 50, reps: '10-12' } },
    { id: 504, name: 'Close-Grip Bench Press', muscleGroups: 'Triceps • Chest • Barbell', videoId: 'j-NhORwJDb4', sets: 3, aiSuggestion: { weight: 135, reps: '8-10' } },
    { id: 505, name: 'Tricep Kickbacks', muscleGroups: 'Triceps • Dumbbells', videoId: 'BL9CzOQZDrs', sets: 3, aiSuggestion: { weight: 20, reps: '12-15' } },
    { id: 506, name: 'Diamond Push-ups', muscleGroups: 'Triceps • Bodyweight', videoId: 'J0DnG1_S92I', sets: 3, aiSuggestion: { weight: 0, reps: '12-15' } },
    { id: 507, name: 'Rope Pushdowns', muscleGroups: 'Triceps • Cable', videoId: 'LzwgB15UdO8', sets: 3, aiSuggestion: { weight: 45, reps: '12-15' } },
  ],
  'Legs': [
    { id: 601, name: 'Squat', muscleGroups: 'Quads • Glutes • Barbell', videoId: 'R2dMsNhN3DE', sets: 5, aiSuggestion: { weight: 225, reps: '8-10' } },
    { id: 602, name: 'Romanian Deadlift', muscleGroups: 'Hamstrings • Glutes • Barbell', videoId: '_oyxCn2iSjU', sets: 4, aiSuggestion: { weight: 185, reps: '8-10' } },
    { id: 603, name: 'Leg Press', muscleGroups: 'Quads • Glutes • Machine', videoId: 'sEM_zo9w2ss', sets: 4, aiSuggestion: { weight: 360, reps: '10-12' } },
    { id: 604, name: 'Leg Curls', muscleGroups: 'Hamstrings • Machine', videoId: '3BWiLFc8Dbg', sets: 3, aiSuggestion: { weight: 100, reps: '12-15' } },
    { id: 605, name: 'Calf Raises', muscleGroups: 'Calves • Machine', videoId: 'RBslMmWqzzE', sets: 4, aiSuggestion: { weight: 150, reps: '15-20' } },
    { id: 606, name: 'Leg Extensions', muscleGroups: 'Quads • Machine', videoId: '0fl1RRgJ83I', sets: 3, aiSuggestion: { weight: 120, reps: '12-15' } },
    { id: 607, name: 'Bulgarian Split Squats', muscleGroups: 'Quads • Glutes • Dumbbells', videoId: 'uqI3GVwfToU', sets: 3, aiSuggestion: { weight: 50, reps: '10-12' } },
    { id: 608, name: 'Hip Thrusts', muscleGroups: 'Glutes • Barbell', videoId: 'lAnqN0J_p5A', sets: 4, aiSuggestion: { weight: 185, reps: '10-12' } },
    { id: 609, name: 'Lunges', muscleGroups: 'Quads • Glutes • Dumbbells', videoId: 'uRSsOoZG9z8', sets: 3, aiSuggestion: { weight: 40, reps: '10-12' } },
    { id: 610, name: 'Hack Squat', muscleGroups: 'Quads • Machine', videoId: '63tboDKQksc', sets: 4, aiSuggestion: { weight: 180, reps: '10-12' } },
  ],
  'Core': [
    { id: 701, name: 'Cable Crunches', muscleGroups: 'Abs • Cable', videoId: 'AV5PmZJIrrw', sets: 3, aiSuggestion: { weight: 80, reps: '15-20' } },
    { id: 702, name: 'Hanging Leg Raises', muscleGroups: 'Abs • Bodyweight', videoId: 'Pr1ieGZ5atk', sets: 3, aiSuggestion: { weight: 0, reps: '12-15' } },
    { id: 703, name: 'Ab Wheel Rollouts', muscleGroups: 'Abs • Equipment', videoId: 'zpdHUkFus4I', sets: 3, aiSuggestion: { weight: 0, reps: '10-15' } },
    { id: 704, name: 'Plank', muscleGroups: 'Core • Bodyweight', videoId: 'ZyWEXjdAGCQ', sets: 3, aiSuggestion: { weight: 0, reps: '45-60s' } },
    { id: 705, name: 'Russian Twists', muscleGroups: 'Obliques • Dumbbells', videoId: 'wkD8rjkodUI', sets: 3, aiSuggestion: { weight: 25, reps: '20' } },
    { id: 706, name: 'Decline Sit-ups', muscleGroups: 'Abs • Bodyweight', videoId: 'IINnwHwexkg', sets: 3, aiSuggestion: { weight: 0, reps: '15-20' } },
    { id: 707, name: 'Mountain Climbers', muscleGroups: 'Core • Cardio • Bodyweight', videoId: 'OR1eel_5oAY', sets: 3, aiSuggestion: { weight: 0, reps: '30s' } },
    { id: 708, name: 'Dead Bug', muscleGroups: 'Core • Bodyweight', videoId: 'eEhoSeBFoBk', sets: 3, aiSuggestion: { weight: 0, reps: '12-15' } },
    { id: 709, name: 'Kettlebell Windmill', muscleGroups: 'Core • Obliques • Kettlebell', videoId: 'QBz8Y9Yg7rg', sets: 3, aiSuggestion: { weight: 25, reps: '8-10' } },
  ],
  'Kettlebell': [
    { id: 901, name: 'Kettlebell Swings', muscleGroups: 'Glutes • Hamstrings • Core • Kettlebell', videoId: 'mKDIuUbH94Q', sets: 4, aiSuggestion: { weight: 35, reps: '15-20' } },
    { id: 902, name: 'Goblet Squat', muscleGroups: 'Quads • Glutes • Kettlebell', videoId: 'TzU5zkTEkg8', sets: 4, aiSuggestion: { weight: 35, reps: '12-15' } },
    { id: 903, name: 'Turkish Get-Up', muscleGroups: 'Full Body • Core • Kettlebell', videoId: '5kb9Blkrj2w', sets: 3, aiSuggestion: { weight: 25, reps: '3-5' } },
    { id: 904, name: 'Kettlebell Clean & Press', muscleGroups: 'Shoulders • Full Body • Kettlebell', videoId: 'zOxh-4AKpEU', sets: 4, aiSuggestion: { weight: 35, reps: '8-10' } },
    { id: 905, name: 'Kettlebell Snatch', muscleGroups: 'Shoulders • Full Body • Kettlebell', videoId: 'Pm-b2XFeABA', sets: 3, aiSuggestion: { weight: 35, reps: '8-10' } },
    { id: 906, name: 'Kettlebell Row', muscleGroups: 'Back • Biceps • Kettlebell', videoId: 'RIEwOjk2_Zg', sets: 3, aiSuggestion: { weight: 35, reps: '10-12' } },
    { id: 907, name: 'Kettlebell Halo', muscleGroups: 'Shoulders • Core • Kettlebell', videoId: 'g401Bbk5uFo', sets: 3, aiSuggestion: { weight: 25, reps: '10-12' } },
    { id: 908, name: 'Kettlebell Deadlift', muscleGroups: 'Hamstrings • Glutes • Kettlebell', videoId: 'gnQJKNDOvs4', sets: 4, aiSuggestion: { weight: 45, reps: '10-12' } },
  ],
  'Calisthenics': [
    { id: 1001, name: 'Push-ups', muscleGroups: 'Chest • Triceps • Bodyweight', videoId: 'KEFQyLkDYtI', sets: 3, aiSuggestion: { weight: 0, reps: '15-25' } },
    { id: 1002, name: 'Pull-ups', muscleGroups: 'Lats • Biceps • Bodyweight', videoId: 'XB_7En-zf_M', sets: 4, aiSuggestion: { weight: 0, reps: '8-12' } },
    { id: 1003, name: 'Dips', muscleGroups: 'Chest • Triceps • Bodyweight', videoId: 'FG1ENBFsdHU', sets: 3, aiSuggestion: { weight: 0, reps: '10-15' } },
    { id: 1004, name: 'Pistol Squats', muscleGroups: 'Quads • Glutes • Bodyweight', videoId: 'F85WzNX3YPw', sets: 3, aiSuggestion: { weight: 0, reps: '5-8' } },
    { id: 1005, name: 'Burpees', muscleGroups: 'Full Body • Cardio • Bodyweight', videoId: 'TU8QYVW0gDU', sets: 3, aiSuggestion: { weight: 0, reps: '10-15' } },
    { id: 1006, name: 'Pike Push-ups', muscleGroups: 'Shoulders • Triceps • Bodyweight', videoId: 'O7KIrS92Hz0', sets: 3, aiSuggestion: { weight: 0, reps: '10-12' } },
    { id: 1007, name: 'Inverted Rows', muscleGroups: 'Back • Biceps • Bodyweight', videoId: 'XZV9IwluPjw', sets: 3, aiSuggestion: { weight: 0, reps: '10-15' } },
    { id: 1008, name: 'L-Sit Hold', muscleGroups: 'Core • Hip Flexors • Bodyweight', videoId: 'BbAkWxDZKIM', sets: 3, aiSuggestion: { weight: 0, reps: '15-30s' } },
    { id: 1009, name: 'Muscle-ups', muscleGroups: 'Lats • Chest • Bodyweight', videoId: '70y7r0vBddM', sets: 3, aiSuggestion: { weight: 0, reps: '3-5' } },
    { id: 1010, name: 'Handstand Push-ups', muscleGroups: 'Shoulders • Triceps • Bodyweight', videoId: 'A5Px56lA2H4', sets: 3, aiSuggestion: { weight: 0, reps: '5-8' } },
    { id: 1011, name: 'Archer Push-ups', muscleGroups: 'Chest • Triceps • Bodyweight', videoId: 'wJKLatFY-aU', sets: 3, aiSuggestion: { weight: 0, reps: '8-10' } },
    { id: 1012, name: 'Dragon Flags', muscleGroups: 'Core • Bodyweight', videoId: 'pvz7k5gO-DE', sets: 3, aiSuggestion: { weight: 0, reps: '6-8' } },
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
    'upper': ['Chest', 'Back', 'Shoulders', 'Biceps', 'Triceps'],
    'lower': ['Legs'],
    'full': ['Chest', 'Back', 'Shoulders', 'Legs', 'Biceps', 'Triceps', 'Core'],
    'forearms': ['Biceps'],
    'kettlebell': ['Kettlebell'],
    'calisthenics': ['Calisthenics'],
    'bodyweight': ['Calisthenics'],
    'general health': ['Calisthenics', 'Kettlebell', 'Core'],
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
    // Give each muscle group a solid number of exercises
    // 1 group → 6, 2 groups → 4 each, 3+ groups → 3 each
    const take = matchedGroups.size === 1 ? 6 : matchedGroups.size === 2 ? 4 : 3;
    for (const group of matchedGroups) {
      const groupExercises = exerciseLibrary[group] || [];
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
    'upper': ['Chest', 'Back', 'Shoulders', 'Biceps', 'Triceps'],
    'lower': ['Legs'],
    'full': ['Chest', 'Back', 'Shoulders', 'Legs', 'Biceps', 'Triceps', 'Core'],
    'forearms': ['Biceps'],
    'kettlebell': ['Kettlebell'], 'calisthenics': ['Calisthenics'],
    'bodyweight': ['Calisthenics'], 'general health': ['Calisthenics', 'Kettlebell', 'Core'],
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

// Filter exercises based on home gym equipment availability
function filterForHomeGym(exercises: Exercise[], equipment: HomeEquipment): Exercise[] {
  const filtered = exercises.filter(ex => {
    const mg = ex.muscleGroups.toLowerCase();
    // Always filter out machine exercises for home gym
    if (mg.includes('machine')) return false;
    // Check barbell / EZ bar (defensive — equipment fields may be missing)
    if ((mg.includes('barbell') || mg.includes('ez bar')) && !equipment.barbell?.has) return false;
    // Check dumbbells
    if (mg.includes('dumbbell') && !equipment.dumbbells?.has) return false;
    // Check cable
    if (mg.includes('cable') && !equipment.cables) return false;
    // Check kettlebell
    if (mg.includes('kettlebell') && !equipment.kettlebell?.has) return false;
    // Bodyweight, custom, and equipment-less exercises always pass
    return true;
  });

  // If filtering removed ALL exercises, fall back to bodyweight alternatives
  if (filtered.length === 0) {
    // Grab bodyweight exercises from Calisthenics library as fallback
    const bodyweightFallback = (exerciseLibrary['Calisthenics'] || []).slice(0, 4);
    if (bodyweightFallback.length > 0) return bodyweightFallback;
  }

  return filtered;
}

// Auto-save component: fires handleFinishWorkout on mount so user goes straight to share screen
function WorkoutFinishedAutoSave({ onSave }: { onSave: () => void }) {
  const fired = useRef(false);
  useEffect(() => {
    if (!fired.current) {
      fired.current = true;
      onSave();
    }
  }, [onSave]);
  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[60] flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-[#1a1a1a] rounded-3xl p-6 text-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#00ff00] mx-auto mb-4" />
        <p className="text-sm text-gray-400">Saving workout...</p>
      </div>
    </div>
  );
}

export function ActiveWorkoutPage({ onClose, muscleGroup, fewerSets, quickVersion, customBuild, trainingAtHome }: ActiveWorkoutPageProps) {
  const { saveWorkout, saving } = useWorkouts();
  const { profile } = useAuth();
  const { workouts: recentWorkouts } = useWorkoutHistory({ limit: 20 });
  const { data: whoopData } = useWhoopData();
  const { workoutSuggestions, workoutLoading, fetchWorkoutSuggestions, fetchSetUpdate } = useAICoach();
  const startedAt = useRef(new Date().toISOString());
  const userModifiedWeight = useRef(false);
  const liveUpdateActive = useRef(false);
  const aiFetched = useRef(false);
  const [aiNote, setAiNote] = useState<string | null>(null);
  const [liveAiUpdating, setLiveAiUpdating] = useState(false);

  // Cap exercise weight suggestions to available equipment
  const capWeightsForEquipment = (exs: Exercise[], equipment: HomeEquipment): Exercise[] => {
    return exs.map(ex => {
      const mg = ex.muscleGroups.toLowerCase();
      let maxWeight = ex.aiSuggestion.weight;
      if (mg.includes('dumbbell') && equipment.dumbbells?.has) {
        maxWeight = Math.min(maxWeight, equipment.dumbbells.maxWeight);
      } else if ((mg.includes('barbell') || mg.includes('ez bar')) && equipment.barbell?.has) {
        maxWeight = Math.min(maxWeight, equipment.barbell.maxWeight);
      } else if (mg.includes('kettlebell') && equipment.kettlebell?.has) {
        maxWeight = Math.min(maxWeight, equipment.kettlebell.maxWeight);
      }
      if (maxWeight !== ex.aiSuggestion.weight) {
        return { ...ex, aiSuggestion: { ...ex.aiSuggestion, weight: maxWeight } };
      }
      return ex;
    });
  };

  // Compute initial exercises with modifiers applied
  const computeInitialExercises = (): Exercise[] => {
    if (customBuild) return [];
    let exs = muscleGroup ? getExercisesForWorkout(muscleGroup) : getExercisesForWorkout('Full Body');
    // Filter for home gym — always remove machines when at home, and filter by equipment if configured
    if (trainingAtHome) {
      if (profile?.homeEquipment) {
        exs = filterForHomeGym(exs, profile.homeEquipment);
        exs = capWeightsForEquipment(exs, profile.homeEquipment);
      } else {
        // No equipment configured — at minimum filter out machine exercises
        exs = exs.filter(ex => !ex.muscleGroups.toLowerCase().includes('machine'));
      }
    }
    if (quickVersion) {
      exs = exs.slice(0, 4).map(e => ({ ...e, sets: Math.min(e.sets, 3) }));
    } else if (fewerSets) {
      exs = exs.map(e => ({ ...e, sets: Math.min(e.sets, 3) }));
    }
    return exs;
  };

  const initialExercises = computeInitialExercises();
  const [exercises, setExercises] = useState<Exercise[]>(initialExercises);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [currentSet, setCurrentSet] = useState(1);
  const [weight, setWeight] = useState(initialExercises[0]?.aiSuggestion.weight ?? 0);
  const [reps, setReps] = useState(8);
  const [completedSets, setCompletedSets] = useState<number[]>([]);

  // Track all logged set data per exercise: exerciseIndex -> setNumber -> {weight, reps}
  const [loggedData, setLoggedData] = useState<Record<number, Record<number, LoggedSet>>>({});
  const [showEndConfirm, setShowEndConfirm] = useState(false);
  const [workoutFinished, setWorkoutFinished] = useState(false);
  const [savedWorkoutId, setSavedWorkoutId] = useState<string | null>(null);
  const [showSharePrompt, setShowSharePrompt] = useState(false);

  // Settings state
  const [showSettings, setShowSettings] = useState(false);
  const [showVideo, setShowVideo] = useState(true);
  const [logMode, setLogMode] = useState<'set' | 'bulk'>('set');
  const [showSwapModal, setShowSwapModal] = useState(false);
  const [showExerciseDonePrompt, setShowExerciseDonePrompt] = useState(false);
  const [showAddModal, setShowAddModal] = useState(customBuild ? true : false);
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

  const initBulkSets = (exercise?: Exercise) => {
    const ex = exercise || currentExercise;
    if (!ex) return;
    setBulkSets(
      Array.from({ length: ex.sets }, () => ({
        weight: ex.aiSuggestion.weight,
        reps: parseInt(ex.aiSuggestion.reps.split('-')[0]),
      }))
    );
  };

  // Fetch AI suggestions when exercises and history are ready
  useEffect(() => {
    if (aiFetched.current || exercises.length === 0 || customBuild) return;
    aiFetched.current = true;

    // Build per-exercise history from recent workouts
    const exercisePayload = exercises.map(ex => {
      const history: { date: string; sets: { weight: number; reps: number }[] }[] = [];
      for (const w of recentWorkouts) {
        const matchingEx = w.exercises.find(e => e.exerciseName === ex.name);
        if (matchingEx) {
          history.push({
            date: w.startedAt.split('T')[0],
            sets: matchingEx.sets.map(s => ({ weight: s.weightLbs || 0, reps: s.reps || 0 })),
          });
        }
        if (history.length >= 3) break;
      }
      return {
        name: ex.name,
        muscleGroups: ex.muscleGroups,
        sets: ex.sets,
        defaultSuggestion: ex.aiSuggestion,
        history,
      };
    });

    fetchWorkoutSuggestions({
      exercises: exercisePayload,
      userProfile: {
        experience: profile?.experience || null,
        goal: profile?.goal || null,
        weightLbs: profile?.weight || null,
        homeEquipment: trainingAtHome ? (profile?.homeEquipment || null) : null,
      },
      recovery: whoopData?.recovery ? {
        score: whoopData.recovery.score,
        hrv: whoopData.recovery.hrv,
        sleepScore: whoopData.sleep?.sleepScore ?? null,
      } : null,
    });
  }, [exercises.length, recentWorkouts.length]);

  // Apply AI suggestions when they arrive (initial load only — don't overwrite live updates)
  useEffect(() => {
    if (!workoutSuggestions || liveUpdateActive.current) return;
    setExercises(prev => prev.map(ex => {
      const s = workoutSuggestions.find(sg => sg.exerciseName === ex.name);
      if (!s) return ex;
      return { ...ex, aiSuggestion: { weight: s.weight, reps: String(s.reps) }, sets: s.sets };
    }));

    // Update current weight/reps if user hasn't manually changed them
    if (!userModifiedWeight.current) {
      const currentSuggestion = workoutSuggestions.find(s => s.exerciseName === exercises[currentExerciseIndex]?.name);
      if (currentSuggestion) {
        setWeight(currentSuggestion.weight);
        setReps(parseInt(String(currentSuggestion.reps).split('-')[0]) || 8);
        setAiNote(currentSuggestion.note);
      }
    }
  }, [workoutSuggestions]);

  // Update AI note when switching exercises
  useEffect(() => {
    if (!workoutSuggestions || !currentExercise) return;
    const s = workoutSuggestions.find(sg => sg.exerciseName === currentExercise.name);
    setAiNote(s?.note || null);
  }, [currentExerciseIndex, workoutSuggestions]);

  const logSetData = (exerciseIdx: number, setNum: number, setData: LoggedSet) => {
    setLoggedData(prev => ({
      ...prev,
      [exerciseIdx]: {
        ...(prev[exerciseIdx] || {}),
        [setNum]: setData,
      },
    }));
  };

  const advanceToNextExercise = () => {
    if (currentExerciseIndex < exercises.length - 1) {
      const nextExercise = exercises[currentExerciseIndex + 1];
      setCurrentExerciseIndex(currentExerciseIndex + 1);
      setCurrentSet(1);
      setCompletedSets([]);
      setWeight(nextExercise.aiSuggestion.weight);
      setReps(8);
      return nextExercise;
    }
    // Last exercise done — custom build prompts user, preset auto-finishes
    if (customBuild) {
      setShowExerciseDonePrompt(true);
      return null;
    }
    setWorkoutFinished(true);
    return null;
  };

  const handleLogSet = () => {
    const justLogged = { weight, reps };
    logSetData(currentExerciseIndex, currentSet, justLogged);
    const newCompleted = [...completedSets, currentSet];
    setCompletedSets(newCompleted);

    // Build completed sets array from what we already have + what we just logged
    // Don't rely on loggedData state (stale in this closure)
    const allLoggedSets: { weight: number; reps: number }[] = [];
    const existingData = loggedData[currentExerciseIndex] || {};
    for (let s = 1; s < currentSet; s++) {
      const d = existingData[s];
      if (d) allLoggedSets.push({ weight: d.weight, reps: d.reps });
    }
    allLoggedSets.push(justLogged); // the set we JUST logged

    const setsRemaining = currentExercise.sets - allLoggedSets.length;
    const exerciseIdx = currentExerciseIndex;
    const exerciseName = currentExercise.name;

    if (currentSet < currentExercise.sets) {
      setCurrentSet(currentSet + 1);

      // Trigger live AI update for the next set
      setLiveAiUpdating(true);
      liveUpdateActive.current = true;

      fetchSetUpdate({
        exercise: exerciseName,
        completedSets: allLoggedSets,
        setsRemaining,
        goal: profile?.goal || null,
      }).then(update => {
        if (update) {
          const newWeight = typeof update.weight === 'number' ? update.weight : Number(update.weight) || 0;
          const newReps = String(update.reps);

          // Update the AI suggestion box
          setExercises(prev => prev.map((ex, idx) =>
            idx === exerciseIdx
              ? { ...ex, aiSuggestion: { weight: newWeight, reps: newReps } }
              : ex
          ));
          setAiNote(update.note);

          // Auto-apply to the user's input fields so they see the change
          setWeight(newWeight);
          setReps(parseInt(newReps) || reps);
        }
        setLiveAiUpdating(false);
      });
    } else {
      // Last set of this exercise — still fire AI update for context, then advance
      setLiveAiUpdating(true);
      liveUpdateActive.current = true;

      fetchSetUpdate({
        exercise: exerciseName,
        completedSets: allLoggedSets,
        setsRemaining: 0,
        goal: profile?.goal || null,
      }).then(update => {
        if (update) {
          setAiNote(update.note);
        }
        setLiveAiUpdating(false);
      });
      advanceToNextExercise();
    }
  };

  const handleLogAllSets = () => {
    // Save all bulk set data
    bulkSets.forEach((set, idx) => {
      logSetData(currentExerciseIndex, idx + 1, { weight: set.weight, reps: set.reps });
    });

    const nextExercise = advanceToNextExercise();
    if (nextExercise) {
      initBulkSets(nextExercise);
    }
  };

  const handleFinishWorkout = async () => {
    // Dismiss any overlaying dialogs immediately to prevent double-clicks
    setShowEndConfirm(false);
    setWorkoutFinished(false);

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
      const workoutId = await saveWorkout({
        workoutType: muscleGroup || 'Workout',
        startedAt: startedAt.current,
        durationMinutes,
        exercises: exercisesToSave,
      });
      if (workoutId) {
        setSavedWorkoutId(workoutId);
        setShowSharePrompt(true);
      } else {
        onClose();
      }
    } catch (err) {
      console.error('Failed to save workout:', err);
      onClose();
    }
  };

  const handleUseAISuggestion = () => {
    setWeight(currentExercise.aiSuggestion.weight);
    const repRange = currentExercise.aiSuggestion.reps.split('-');
    setReps(parseInt(repRange[0]));
  };

  const handleReduceSets = () => {
    if (!currentExercise || currentExercise.sets <= 1) return;
    const newSets = currentExercise.sets - 1;
    setExercises(prev => prev.map((ex, idx) => idx === currentExerciseIndex ? { ...ex, sets: newSets } : ex));
    if (logMode === 'bulk') setBulkSets(prev => prev.slice(0, newSets));
    if (currentSet > newSets) setCurrentSet(newSets);
    setCompletedSets(prev => prev.filter(s => s <= newSets));
  };

  const handleAddSet = () => {
    if (!currentExercise) return;
    const newSets = currentExercise.sets + 1;
    setExercises(prev => prev.map((ex, idx) => idx === currentExerciseIndex ? { ...ex, sets: newSets } : ex));
    if (logMode === 'bulk') {
      setBulkSets(prev => [...prev, { weight: currentExercise.aiSuggestion.weight, reps: parseInt(currentExercise.aiSuggestion.reps.split('-')[0]) || 8 }]);
    }
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
    const newList = [...exercises, exercise];
    setExercises(newList);
    // If this is the first exercise or current exercise is done, advance to the new one
    const currentDone = exercises.length === 0 || (loggedData[currentExerciseIndex] && Object.keys(loggedData[currentExerciseIndex]).length >= (exercises[currentExerciseIndex]?.sets ?? 0));
    if (currentDone) {
      setCurrentExerciseIndex(newList.length - 1);
      setCurrentSet(1);
      setCompletedSets([]);
      setWeight(exercise.aiSuggestion.weight);
      setReps(parseInt(exercise.aiSuggestion.reps.split('-')[0]) || 8);
      if (logMode === 'bulk') initBulkSets(exercise);
    }
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
    const newList = [...exercises, newExercise];
    setExercises(newList);
    // If current exercise is done, advance to the new one
    const currentDone = exercises.length === 0 || (loggedData[currentExerciseIndex] && Object.keys(loggedData[currentExerciseIndex]).length >= (exercises[currentExerciseIndex]?.sets ?? 0));
    if (currentDone) {
      setCurrentExerciseIndex(newList.length - 1);
      setCurrentSet(1);
      setCompletedSets([]);
      setWeight(newExercise.aiSuggestion.weight);
      setReps(parseInt(newExercise.aiSuggestion.reps.split('-')[0]) || 8);
      if (logMode === 'bulk') initBulkSets(newExercise);
    }
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
    let related = getRelatedExercises(muscleGroup || 'Shoulders/Arms');
    if (trainingAtHome) {
      if (profile?.homeEquipment) {
        related = filterForHomeGym(related, profile.homeEquipment);
      } else {
        related = related.filter(e => !e.muscleGroups.toLowerCase().includes('machine'));
      }
    }
    return related.filter(e => !currentNames.includes(e.name));
  };

  const filteredLibraryExercises = (() => {
    let pool = allExercises;
    if (trainingAtHome) {
      if (profile?.homeEquipment) {
        pool = filterForHomeGym(pool, profile.homeEquipment);
      } else {
        pool = pool.filter(e => !e.muscleGroups.toLowerCase().includes('machine'));
      }
    }
    return pool.filter(e =>
      !exercises.find(ex => ex.name === e.name) &&
      e.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  })();

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
            <h1 className="font-bold text-base">{currentExercise?.name || 'Custom Workout'}</h1>
            <p className="text-[10px] text-gray-500 text-center">{exercises.length > 0 ? `${currentExerciseIndex + 1} of ${exercises.length}` : 'Add exercises to start'}</p>
          </div>

          <button
            onClick={() => setShowSettings(!showSettings)}
            className={`p-2 rounded-xl transition-colors ${showSettings ? 'bg-white/10' : 'hover:bg-white/5'}`}
          >
            <Settings className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-hide pb-4 relative">
          {/* Settings Dropdown — overlay on top of content */}
          {showSettings && (
            <>
              <div className="absolute inset-0 z-10" onClick={() => setShowSettings(false)} />
              <div className="absolute top-0 right-3 left-3 z-20 bg-[#1a1a1a] border border-gray-800 rounded-2xl overflow-hidden shadow-2xl shadow-black/80">
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
                <div className="h-px bg-gray-800 mx-4" />
                <div className="flex items-center gap-3 px-4 py-3">
                  <Dumbbell className="w-4 h-4 text-gray-400" />
                  <span className="text-sm font-medium flex-1 text-left">Sets</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleReduceSets}
                      disabled={!currentExercise || currentExercise.sets <= 1}
                      className="w-7 h-7 bg-gray-800 hover:bg-gray-700 disabled:opacity-30 disabled:hover:bg-gray-800 rounded-lg flex items-center justify-center transition-colors"
                    >
                      <span className="text-sm font-bold text-gray-300">&minus;</span>
                    </button>
                    <span className="text-sm font-bold text-white w-6 text-center">{currentExercise?.sets || 0}</span>
                    <button
                      onClick={handleAddSet}
                      className="w-7 h-7 bg-gray-800 hover:bg-gray-700 rounded-lg flex items-center justify-center transition-colors"
                    >
                      <span className="text-sm font-bold text-gray-300">+</span>
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
          {/* Empty state for custom build */}
          {exercises.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 px-5">
              <Plus className="w-12 h-12 text-gray-600 mb-3" />
              <h2 className="font-bold text-lg mb-1">Build Your Workout</h2>
              <p className="text-sm text-gray-500 text-center mb-4">Add exercises from the library or create custom ones</p>
              <button
                onClick={() => setShowAddModal(true)}
                className="bg-[#00ff00] text-black font-bold px-6 py-3 rounded-2xl text-sm"
              >
                Add Exercise
              </button>
            </div>
          )}

          {/* Video Section */}
          {exercises.length > 0 && showVideo && currentExercise?.videoId && (
            <div className="px-5 pt-3 pb-4">
              <div className="aspect-[16/9] w-full relative overflow-hidden rounded-2xl">
                <iframe
                  key={currentExercise.videoId}
                  src={`https://www.youtube.com/embed/${currentExercise.videoId}?autoplay=0&controls=1&modestbranding=1&rel=0&showinfo=0`}
                  title={`${currentExercise.name} form video`}
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
          {exercises.length > 0 && (!showVideo || !currentExercise?.videoId) && (
            <div className="px-5 pt-3 pb-2">
              <p className="text-xs text-gray-500 text-center">{currentExercise?.muscleGroups}</p>
            </div>
          )}

          {exercises.length > 0 && <div className="px-5 pb-6 space-y-4">
            {/* Set-by-Set Mode */}
            {logMode === 'set' && (
              <>
                {/* Set tracker circles */}
                <div className="flex items-center gap-2.5 justify-center">
                  {Array.from({ length: currentExercise.sets }).map((_, index) => {
                    const setNumber = index + 1;
                    const isCompleted = completedSets.includes(setNumber);
                    const isCurrent = setNumber === currentSet;
                    const nextSetNumber = completedSets.length + 1;
                    const isLocked = !isCompleted && setNumber > nextSetNumber;

                    return (
                      <button
                        key={setNumber}
                        onClick={() => {
                          if (!isCompleted && !isLocked) setCurrentSet(setNumber);
                        }}
                        disabled={isLocked}
                        className={`relative w-11 h-11 rounded-full font-semibold text-sm transition-all ${
                          isCompleted
                            ? 'bg-[#00ff00] text-black scale-105'
                            : isCurrent
                            ? 'bg-white text-black scale-110 ring-2 ring-white/20 ring-offset-2 ring-offset-black'
                            : isLocked
                            ? 'bg-[#1a1a1a] text-gray-700 opacity-40 cursor-not-allowed'
                            : 'bg-[#1a1a1a] text-gray-500 hover:bg-[#252525] hover:text-gray-300'
                        }`}
                      >
                        {isCompleted ? <Check className="w-4 h-4 mx-auto" /> : setNumber}
                      </button>
                    );
                  })}
                </div>

                {/* AI Recommendation */}
                <div className={`bg-[#00ff00]/5 rounded-2xl p-3.5 border transition-all ${liveAiUpdating ? 'border-[#00ff00]/30 animate-pulse' : 'border-[#00ff00]/10'}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-1.5 mb-1.5">
                        {(workoutLoading || liveAiUpdating) ? (
                          <Loader2 className="w-3.5 h-3.5 text-[#00ff00] animate-spin" />
                        ) : (
                          <Sparkles className="w-3.5 h-3.5 text-[#00ff00]" />
                        )}
                        <span className="text-[11px] text-[#00ff00] font-semibold tracking-wide">
                          {workoutLoading ? 'AI ANALYZING...' : liveAiUpdating ? 'AI UPDATING...' : completedSets.length > 0 ? 'AI COACH' : workoutSuggestions ? 'AI PERSONALIZED' : 'AI RECOMMENDS'}
                        </span>
                      </div>
                      <p className="text-xl font-bold">
                        {currentExercise.aiSuggestion.weight === 0 ? 'Bodyweight' : `${currentExercise.aiSuggestion.weight} lbs`} <span className="text-gray-600">&times;</span> {currentExercise.aiSuggestion.reps}
                      </p>
                      {aiNote && <p className="text-[10px] text-gray-500 mt-1">{aiNote}</p>}
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
                    <label className="block text-[11px] text-gray-500 mb-2 font-medium tracking-wide">{currentExercise.aiSuggestion.weight === 0 ? 'ADDED WEIGHT' : 'WEIGHT'}</label>
                    <div className="bg-[#1a1a1a] rounded-2xl p-3">
                      <div className="flex items-center justify-between mb-2">
                        <button
                          onClick={() => { userModifiedWeight.current = true; setWeight(Math.max(0, weight - 5)); }}
                          className="w-9 h-9 bg-[#252525] hover:bg-[#333333] rounded-xl flex items-center justify-center transition-all active:scale-90"
                        >
                          <span className="text-xl font-bold text-gray-400">&minus;</span>
                        </button>
                        <div className="text-center">
                          <span className="text-2xl font-bold">{weight === 0 ? 'BW' : weight}</span>
                          {weight > 0 && <span className="text-xs text-gray-500 ml-1">lbs</span>}
                        </div>
                        <button
                          onClick={() => { userModifiedWeight.current = true; setWeight(weight + 5); }}
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
                {/* AI Recommendation for bulk */}
                <div className="bg-[#00ff00]/5 rounded-2xl p-3.5 border border-[#00ff00]/10">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-1.5 mb-1.5">
                        {workoutLoading ? (
                          <Loader2 className="w-3.5 h-3.5 text-[#00ff00] animate-spin" />
                        ) : (
                          <Sparkles className="w-3.5 h-3.5 text-[#00ff00]" />
                        )}
                        <span className="text-[11px] text-[#00ff00] font-semibold tracking-wide">
                          {workoutLoading ? 'AI ANALYZING...' : workoutSuggestions ? 'AI PERSONALIZED' : 'AI RECOMMENDS'}
                        </span>
                      </div>
                      <p className="text-xl font-bold">
                        {currentExercise.aiSuggestion.weight === 0 ? 'Bodyweight' : `${currentExercise.aiSuggestion.weight} lbs`} <span className="text-gray-600">&times;</span> {currentExercise.aiSuggestion.reps}
                      </p>
                      {aiNote && <p className="text-[10px] text-gray-500 mt-1">{aiNote}</p>}
                    </div>
                    <button
                      onClick={() => {
                        const aiReps = parseInt(currentExercise.aiSuggestion.reps) || 10;
                        const updated = bulkSets.map(() => ({ weight: currentExercise.aiSuggestion.weight, reps: aiReps }));
                        setBulkSets(updated);
                      }}
                      className="px-3.5 py-2 bg-[#00ff00] text-black rounded-xl font-semibold text-xs hover:bg-[#00dd00] transition-all active:scale-95"
                    >
                      Apply All
                    </button>
                  </div>
                </div>

                <div className="bg-[#1a1a1a] rounded-2xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <List className="w-4 h-4 text-[#00ff00]" />
                      <span className="text-xs font-semibold text-[#00ff00]">BULK LOG</span>
                    </div>
                    <span className="text-[10px] text-gray-500">{bulkSets.length} sets</span>
                  </div>

                  <div className="space-y-2.5">
                    {/* Header row */}
                    <div className="grid grid-cols-[32px_1fr_1fr] gap-3 text-[10px] text-gray-500 font-medium tracking-wider px-1">
                      <span></span>
                      <span className="text-center">{currentExercise?.aiSuggestion.weight === 0 ? 'ADDED WT' : 'WEIGHT (lbs)'}</span>
                      <span className="text-center">REPS</span>
                    </div>

                    {bulkSets.map((set, idx) => (
                      <div key={idx} className="grid grid-cols-[32px_1fr_1fr] gap-3 items-center">
                        <div className="w-8 h-8 rounded-full bg-[#252525] flex items-center justify-center">
                          <span className="text-xs font-bold text-gray-400">{idx + 1}</span>
                        </div>
                        <div className="flex items-center bg-[#252525] rounded-xl overflow-hidden">
                          <button
                            onClick={() => { const u = [...bulkSets]; u[idx] = { ...u[idx], weight: Math.max(0, u[idx].weight - 5) }; setBulkSets(u); }}
                            className="px-2.5 py-2.5 text-gray-500 hover:text-white hover:bg-[#333] transition-colors"
                          >
                            <span className="text-sm font-bold">&minus;</span>
                          </button>
                          <input
                            type="number"
                            value={set.weight}
                            onChange={(e) => { const u = [...bulkSets]; u[idx] = { ...u[idx], weight: parseInt(e.target.value) || 0 }; setBulkSets(u); }}
                            className="flex-1 bg-transparent py-2.5 text-sm text-white text-center focus:outline-none min-w-0"
                          />
                          <button
                            onClick={() => { const u = [...bulkSets]; u[idx] = { ...u[idx], weight: u[idx].weight + 5 }; setBulkSets(u); }}
                            className="px-2.5 py-2.5 text-gray-500 hover:text-white hover:bg-[#333] transition-colors"
                          >
                            <span className="text-sm font-bold">+</span>
                          </button>
                        </div>
                        <div className="flex items-center bg-[#252525] rounded-xl overflow-hidden">
                          <button
                            onClick={() => { const u = [...bulkSets]; u[idx] = { ...u[idx], reps: Math.max(1, u[idx].reps - 1) }; setBulkSets(u); }}
                            className="px-2.5 py-2.5 text-gray-500 hover:text-white hover:bg-[#333] transition-colors"
                          >
                            <span className="text-sm font-bold">&minus;</span>
                          </button>
                          <input
                            type="number"
                            value={set.reps}
                            onChange={(e) => { const u = [...bulkSets]; u[idx] = { ...u[idx], reps: parseInt(e.target.value) || 0 }; setBulkSets(u); }}
                            className="flex-1 bg-transparent py-2.5 text-sm text-white text-center focus:outline-none min-w-0"
                          />
                          <button
                            onClick={() => { const u = [...bulkSets]; u[idx] = { ...u[idx], reps: u[idx].reps + 1 }; setBulkSets(u); }}
                            className="px-2.5 py-2.5 text-gray-500 hover:text-white hover:bg-[#333] transition-colors"
                          >
                            <span className="text-sm font-bold">+</span>
                          </button>
                        </div>
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
          </div>}
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
                ? `${Object.keys(loggedData).length} exercise${Object.keys(loggedData).length !== 1 ? 's' : ''} logged. Save and share to your feed?`
                : 'No sets logged yet. Nothing will be saved.'}
            </p>
            <div className="space-y-2">
              {Object.keys(loggedData).length > 0 && (
                <button
                  onClick={handleFinishWorkout}
                  disabled={saving}
                  className="w-full bg-[#00ff00] text-black font-bold py-3 rounded-2xl text-sm hover:bg-[#00dd00] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  {saving ? 'Saving...' : 'Save Workout'}
                </button>
              )}
              <button
                onClick={() => { setShowEndConfirm(false); onClose(); }}
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

      {/* Custom Build — Exercise Done Prompt */}
      {showExerciseDonePrompt && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[60] flex items-end sm:items-center justify-center p-4">
          <div className="w-full max-w-sm bg-gradient-to-b from-[#1a1a1a] to-[#111] rounded-3xl overflow-hidden">
            <div className="p-6 text-center">
              <div className="w-14 h-14 bg-[#00ff00]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-7 h-7 text-[#00ff00]" />
              </div>
              <h2 className="font-bold text-lg mb-1">Exercise Complete</h2>
              <p className="text-sm text-gray-400">
                {Object.keys(loggedData).length} exercise{Object.keys(loggedData).length !== 1 ? 's' : ''} logged so far
              </p>
            </div>
            <div className="px-5 pb-5 space-y-2.5">
              <button
                onClick={() => {
                  setShowExerciseDonePrompt(false);
                  setShowAddModal(true);
                }}
                className="w-full bg-[#00ff00] text-black font-bold py-3.5 rounded-2xl text-sm hover:bg-[#00dd00] transition-all active:scale-[0.97] flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Another Exercise
              </button>
              <button
                onClick={() => {
                  setShowExerciseDonePrompt(false);
                  setWorkoutFinished(true);
                }}
                className="w-full bg-white/5 text-white font-semibold py-3.5 rounded-2xl text-sm hover:bg-white/10 transition-all active:scale-[0.97] flex items-center justify-center gap-2"
              >
                <Dumbbell className="w-4 h-4" />
                Finish Workout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Workout Finished — auto-save and go straight to share screen */}
      {workoutFinished && (
        <WorkoutFinishedAutoSave onSave={handleFinishWorkout} />
      )}

      {/* Share Workout Prompt */}
      {showSharePrompt && savedWorkoutId && (
        <ShareWorkoutPrompt
          workoutId={savedWorkoutId}
          workoutSummary={{
            exerciseCount: Object.keys(loggedData).length,
            durationMinutes: Math.round((new Date().getTime() - new Date(startedAt.current).getTime()) / 60000),
            totalVolume: Object.values(loggedData).reduce((total, sets) =>
              total + Object.values(sets).reduce((sum, s) => sum + (s.weight * s.reps), 0), 0),
          }}
          onDone={onClose}
        />
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
