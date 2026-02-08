import { X, Sparkles, Calendar, Trophy, Shuffle, Zap, Clock, SkipForward, Edit3, ChevronRight, Home, Save } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useWorkoutTemplates } from '../hooks/useWorkoutTemplates';
import { ActiveWorkoutPage } from './ActiveWorkoutPage';

interface WorkoutStartPageProps {
  onClose: () => void;
  muscleGroup?: string;
  trainingLocation?: string;
}

type EquipmentTag = 'barbell' | 'dumbbells' | 'cable' | 'machine' | 'kettlebell';

interface CelebrityWorkout {
  id: number;
  name: string;
  celebrity: string;
  exercises: number;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  equipment: EquipmentTag[];
}

// ─── Celebrity Workout Database ─────────────────────────────────────────────
// Equipment tags: barbell, dumbbells, cable, machine, kettlebell
// Based on each celebrity's known training style and typical exercises
const celebrityWorkoutsByGroup: Record<string, CelebrityWorkout[]> = {
  Chest: [
    { id: 101, name: "Arnold's Classic Chest Blast", celebrity: 'Arnold Schwarzenegger', exercises: 6, difficulty: 'Advanced', equipment: ['barbell', 'dumbbells', 'cable'] },
    { id: 102, name: "The Rock's Chest Day", celebrity: 'Dwayne Johnson', exercises: 7, difficulty: 'Advanced', equipment: ['barbell', 'dumbbells', 'cable', 'machine'] },
    { id: 103, name: "Hemsworth's Chest & Power", celebrity: 'Chris Hemsworth', exercises: 5, difficulty: 'Intermediate', equipment: ['barbell', 'dumbbells', 'cable', 'machine'] },
    { id: 104, name: "Sam Sulek's Chest Pump", celebrity: 'Sam Sulek', exercises: 6, difficulty: 'Advanced', equipment: ['barbell', 'dumbbells', 'cable', 'machine'] },
    { id: 105, name: "CBum's Classic Chest", celebrity: 'Chris Bumstead', exercises: 5, difficulty: 'Advanced', equipment: ['barbell', 'dumbbells', 'cable', 'machine'] },
    { id: 106, name: "Jay Cutler's Chest Volume", celebrity: 'Jay Cutler', exercises: 7, difficulty: 'Advanced', equipment: ['barbell', 'dumbbells', 'cable', 'machine'] },
    { id: 107, name: "Jeff Nippard's Science Chest", celebrity: 'Jeff Nippard', exercises: 5, difficulty: 'Intermediate', equipment: ['barbell', 'dumbbells', 'cable'] },
    { id: 108, name: "Ashton Hall's Chest Destroyer", celebrity: 'Ashton Hall', exercises: 6, difficulty: 'Advanced', equipment: ['barbell', 'dumbbells', 'cable', 'machine'] },
    { id: 109, name: "David Laid's Aesthetic Chest", celebrity: 'David Laid', exercises: 5, difficulty: 'Intermediate', equipment: ['barbell', 'dumbbells', 'cable'] },
    { id: 110, name: "Mike O'Hearn's Power Chest", celebrity: "Mike O'Hearn", exercises: 6, difficulty: 'Advanced', equipment: ['barbell', 'dumbbells'] },
    { id: 111, name: "Noel Deyzel's Chest Hypertrophy", celebrity: 'Noel Deyzel', exercises: 5, difficulty: 'Intermediate', equipment: ['barbell', 'dumbbells', 'cable', 'machine'] },
    { id: 112, name: "Alex Eubank's Aesthetic Chest", celebrity: 'Alex Eubank', exercises: 5, difficulty: 'Intermediate', equipment: ['barbell', 'dumbbells', 'cable', 'machine'] },
  ],
  Back: [
    { id: 201, name: "Ronnie Coleman's Back Width", celebrity: 'Ronnie Coleman', exercises: 7, difficulty: 'Advanced', equipment: ['barbell', 'dumbbells', 'cable', 'machine'] },
    { id: 202, name: "Arnold's Back Double", celebrity: 'Arnold Schwarzenegger', exercises: 6, difficulty: 'Advanced', equipment: ['barbell', 'dumbbells', 'cable'] },
    { id: 203, name: "CBum's Classic Back", celebrity: 'Chris Bumstead', exercises: 6, difficulty: 'Advanced', equipment: ['barbell', 'dumbbells', 'cable', 'machine'] },
    { id: 204, name: "Dorian Yates' Blood & Guts Back", celebrity: 'Dorian Yates', exercises: 5, difficulty: 'Advanced', equipment: ['barbell', 'dumbbells', 'cable', 'machine'] },
    { id: 205, name: "David Laid's Deadlift Back Day", celebrity: 'David Laid', exercises: 6, difficulty: 'Advanced', equipment: ['barbell', 'dumbbells', 'cable'] },
    { id: 206, name: "Sam Sulek's Back Thickness", celebrity: 'Sam Sulek', exercises: 6, difficulty: 'Advanced', equipment: ['barbell', 'dumbbells', 'cable', 'machine'] },
    { id: 207, name: "Phil Heath's Detail Back", celebrity: 'Phil Heath', exercises: 7, difficulty: 'Advanced', equipment: ['barbell', 'dumbbells', 'cable', 'machine'] },
    { id: 208, name: "Ashton Hall's Athletic Back", celebrity: 'Ashton Hall', exercises: 6, difficulty: 'Advanced', equipment: ['barbell', 'dumbbells', 'cable', 'machine'] },
    { id: 209, name: "Jeff Nippard's Science Back", celebrity: 'Jeff Nippard', exercises: 5, difficulty: 'Intermediate', equipment: ['barbell', 'dumbbells', 'cable'] },
    { id: 210, name: "Larry Wheels' Power Back", celebrity: 'Larry Wheels', exercises: 6, difficulty: 'Advanced', equipment: ['barbell', 'dumbbells', 'cable'] },
    { id: 211, name: "Lexx Little's Back Builder", celebrity: 'Lexx Little', exercises: 6, difficulty: 'Intermediate', equipment: ['dumbbells', 'cable'] },
  ],
  Shoulders: [
    { id: 301, name: "Arnold's Boulder Shoulders", celebrity: 'Arnold Schwarzenegger', exercises: 6, difficulty: 'Advanced', equipment: ['barbell', 'dumbbells', 'cable'] },
    { id: 302, name: "The Rock's Shoulder Blitz", celebrity: 'Dwayne Johnson', exercises: 8, difficulty: 'Advanced', equipment: ['barbell', 'dumbbells', 'cable', 'machine'] },
    { id: 303, name: "CBum's Classic Delts", celebrity: 'Chris Bumstead', exercises: 5, difficulty: 'Advanced', equipment: ['dumbbells', 'cable', 'machine'] },
    { id: 304, name: "Phil Heath's Capped Delts", celebrity: 'Phil Heath', exercises: 6, difficulty: 'Advanced', equipment: ['barbell', 'dumbbells', 'cable', 'machine'] },
    { id: 305, name: "Sam Sulek's Shoulder Session", celebrity: 'Sam Sulek', exercises: 5, difficulty: 'Advanced', equipment: ['dumbbells', 'cable', 'machine'] },
    { id: 306, name: "Jeff Nippard's Science Shoulders", celebrity: 'Jeff Nippard', exercises: 5, difficulty: 'Intermediate', equipment: ['barbell', 'dumbbells', 'cable'] },
    { id: 307, name: "Larry Wheels' OHP Focused", celebrity: 'Larry Wheels', exercises: 5, difficulty: 'Advanced', equipment: ['barbell', 'dumbbells', 'machine'] },
    { id: 308, name: "Ashton Hall's Athletic Shoulders", celebrity: 'Ashton Hall', exercises: 5, difficulty: 'Advanced', equipment: ['dumbbells', 'cable'] },
    { id: 309, name: "Derek MPMD's Shoulder Routine", celebrity: 'Derek (MPMD)', exercises: 5, difficulty: 'Intermediate', equipment: ['dumbbells', 'cable'] },
    { id: 310, name: "Alex Eubank's Delt Caps", celebrity: 'Alex Eubank', exercises: 5, difficulty: 'Intermediate', equipment: ['dumbbells', 'cable', 'machine'] },
  ],
  Biceps: [
    { id: 401, name: "Arnold's 21s Bicep Superset", celebrity: 'Arnold Schwarzenegger', exercises: 5, difficulty: 'Advanced', equipment: ['barbell', 'dumbbells'] },
    { id: 402, name: "CBum's Bicep Pump", celebrity: 'Chris Bumstead', exercises: 4, difficulty: 'Intermediate', equipment: ['barbell', 'dumbbells', 'cable'] },
    { id: 403, name: "Sam Sulek's Curl Marathon", celebrity: 'Sam Sulek', exercises: 5, difficulty: 'Advanced', equipment: ['barbell', 'dumbbells', 'cable', 'machine'] },
    { id: 404, name: "David Laid's Bicep Peak", celebrity: 'David Laid', exercises: 4, difficulty: 'Intermediate', equipment: ['barbell', 'dumbbells'] },
    { id: 405, name: "Ashton Hall's Bicep Blitz", celebrity: 'Ashton Hall', exercises: 5, difficulty: 'Advanced', equipment: ['barbell', 'dumbbells', 'cable'] },
    { id: 406, name: "Alex Eubank's Arm Aesthetics", celebrity: 'Alex Eubank', exercises: 4, difficulty: 'Intermediate', equipment: ['dumbbells', 'cable', 'machine'] },
  ],
  Triceps: [
    { id: 501, name: "Larry Wheels' Tricep Blowout", celebrity: 'Larry Wheels', exercises: 5, difficulty: 'Advanced', equipment: ['barbell', 'dumbbells', 'cable'] },
    { id: 502, name: "The Rock's Tricep Finisher", celebrity: 'Dwayne Johnson', exercises: 4, difficulty: 'Advanced', equipment: ['dumbbells', 'cable', 'machine'] },
    { id: 503, name: "Sam Sulek's Tricep Destroyer", celebrity: 'Sam Sulek', exercises: 5, difficulty: 'Advanced', equipment: ['barbell', 'dumbbells', 'cable'] },
    { id: 504, name: "CBum's Tricep Pump", celebrity: 'Chris Bumstead', exercises: 4, difficulty: 'Advanced', equipment: ['cable', 'dumbbells'] },
    { id: 505, name: "Jeff Nippard's Science Triceps", celebrity: 'Jeff Nippard', exercises: 4, difficulty: 'Intermediate', equipment: ['cable', 'dumbbells'] },
    { id: 506, name: "Noel Deyzel's Tricep Volume", celebrity: 'Noel Deyzel', exercises: 4, difficulty: 'Intermediate', equipment: ['cable', 'dumbbells'] },
  ],
  Arms: [
    { id: 601, name: "Arnold's 21s Arm Day", celebrity: 'Arnold Schwarzenegger', exercises: 6, difficulty: 'Advanced', equipment: ['barbell', 'dumbbells', 'cable'] },
    { id: 602, name: "CBum's Arm Pump", celebrity: 'Chris Bumstead', exercises: 8, difficulty: 'Intermediate', equipment: ['barbell', 'dumbbells', 'cable'] },
    { id: 603, name: "Larry Wheels' Arm Superset", celebrity: 'Larry Wheels', exercises: 6, difficulty: 'Advanced', equipment: ['barbell', 'dumbbells', 'cable'] },
    { id: 604, name: "Sam Sulek's Arm Annihilation", celebrity: 'Sam Sulek', exercises: 7, difficulty: 'Advanced', equipment: ['barbell', 'dumbbells', 'cable', 'machine'] },
    { id: 605, name: "The Rock's Arm Day", celebrity: 'Dwayne Johnson', exercises: 6, difficulty: 'Advanced', equipment: ['barbell', 'dumbbells', 'cable', 'machine'] },
    { id: 606, name: "David Laid's Aesthetic Arms", celebrity: 'David Laid', exercises: 5, difficulty: 'Intermediate', equipment: ['barbell', 'dumbbells', 'cable'] },
    { id: 607, name: "Ashton Hall's Gun Show", celebrity: 'Ashton Hall', exercises: 6, difficulty: 'Advanced', equipment: ['barbell', 'dumbbells', 'cable'] },
    { id: 608, name: "Alex Eubank's Arm Pump", celebrity: 'Alex Eubank', exercises: 5, difficulty: 'Intermediate', equipment: ['dumbbells', 'cable', 'machine'] },
    { id: 609, name: "Noel Deyzel's Arm Volume", celebrity: 'Noel Deyzel', exercises: 6, difficulty: 'Intermediate', equipment: ['barbell', 'dumbbells', 'cable'] },
    { id: 610, name: "Jeff Nippard's Science Arms", celebrity: 'Jeff Nippard', exercises: 6, difficulty: 'Intermediate', equipment: ['barbell', 'dumbbells', 'cable'] },
  ],
  Legs: [
    { id: 701, name: "Tom Platz's Leg Destroyer", celebrity: 'Tom Platz', exercises: 6, difficulty: 'Advanced', equipment: ['barbell', 'machine'] },
    { id: 702, name: "Ronnie Coleman's Leg Day", celebrity: 'Ronnie Coleman', exercises: 7, difficulty: 'Advanced', equipment: ['barbell', 'machine'] },
    { id: 703, name: "The Rock's Leg Workout", celebrity: 'Dwayne Johnson', exercises: 8, difficulty: 'Advanced', equipment: ['barbell', 'dumbbells', 'machine'] },
    { id: 704, name: "Jay Cutler's Quad Dominant", celebrity: 'Jay Cutler', exercises: 7, difficulty: 'Advanced', equipment: ['barbell', 'machine'] },
    { id: 705, name: "CBum's Classic Legs", celebrity: 'Chris Bumstead', exercises: 6, difficulty: 'Advanced', equipment: ['barbell', 'dumbbells', 'machine'] },
    { id: 706, name: "Sam Sulek's Leg Day", celebrity: 'Sam Sulek', exercises: 6, difficulty: 'Advanced', equipment: ['barbell', 'dumbbells', 'machine'] },
    { id: 707, name: "Mike O'Hearn's Power Legs", celebrity: "Mike O'Hearn", exercises: 6, difficulty: 'Advanced', equipment: ['barbell', 'machine'] },
    { id: 708, name: "Ashton Hall's Athletic Legs", celebrity: 'Ashton Hall', exercises: 6, difficulty: 'Advanced', equipment: ['barbell', 'dumbbells', 'machine'] },
    { id: 709, name: "Jeff Nippard's Science Legs", celebrity: 'Jeff Nippard', exercises: 6, difficulty: 'Intermediate', equipment: ['barbell', 'dumbbells', 'machine'] },
    { id: 710, name: "David Laid's Leg Aesthetics", celebrity: 'David Laid', exercises: 5, difficulty: 'Intermediate', equipment: ['barbell', 'dumbbells', 'machine'] },
    { id: 711, name: "Lexx Little's Leg Volume", celebrity: 'Lexx Little', exercises: 6, difficulty: 'Intermediate', equipment: ['barbell', 'dumbbells', 'machine'] },
  ],
  Core: [
    { id: 801, name: "Bruce Lee's Core Routine", celebrity: 'Bruce Lee', exercises: 6, difficulty: 'Intermediate', equipment: [] },
    { id: 802, name: "The Rock's Ab Finisher", celebrity: 'Dwayne Johnson', exercises: 4, difficulty: 'Intermediate', equipment: ['cable'] },
    { id: 803, name: "Ashton Hall's Core Circuit", celebrity: 'Ashton Hall', exercises: 5, difficulty: 'Intermediate', equipment: [] },
    { id: 804, name: "Jeff Nippard's Science Abs", celebrity: 'Jeff Nippard', exercises: 4, difficulty: 'Intermediate', equipment: ['cable'] },
    { id: 805, name: "Chris Hemsworth's Core Strength", celebrity: 'Chris Hemsworth', exercises: 5, difficulty: 'Intermediate', equipment: [] },
    { id: 806, name: "Alex Eubank's Ab Shred", celebrity: 'Alex Eubank', exercises: 4, difficulty: 'Intermediate', equipment: ['machine'] },
  ],
  Push: [
    { id: 901, name: "Arnold's Push Power", celebrity: 'Arnold Schwarzenegger', exercises: 8, difficulty: 'Advanced', equipment: ['barbell', 'dumbbells', 'cable'] },
    { id: 902, name: "Hemsworth's Push Day", celebrity: 'Chris Hemsworth', exercises: 6, difficulty: 'Intermediate', equipment: ['barbell', 'dumbbells', 'cable'] },
    { id: 903, name: "CBum's Push Routine", celebrity: 'Chris Bumstead', exercises: 7, difficulty: 'Advanced', equipment: ['barbell', 'dumbbells', 'cable'] },
    { id: 904, name: "David Laid's Push Day", celebrity: 'David Laid', exercises: 6, difficulty: 'Intermediate', equipment: ['barbell', 'dumbbells', 'cable'] },
    { id: 905, name: "Sam Sulek's Push Session", celebrity: 'Sam Sulek', exercises: 7, difficulty: 'Advanced', equipment: ['barbell', 'dumbbells', 'cable', 'machine'] },
    { id: 906, name: "Jeff Nippard's Science Push", celebrity: 'Jeff Nippard', exercises: 6, difficulty: 'Intermediate', equipment: ['barbell', 'dumbbells', 'cable'] },
    { id: 907, name: "Ashton Hall's Push Power", celebrity: 'Ashton Hall', exercises: 7, difficulty: 'Advanced', equipment: ['barbell', 'dumbbells', 'cable', 'machine'] },
    { id: 908, name: "Alex Eubank's Push Aesthetics", celebrity: 'Alex Eubank', exercises: 6, difficulty: 'Intermediate', equipment: ['barbell', 'dumbbells', 'cable', 'machine'] },
    { id: 909, name: "Lexx Little's Push Pump", celebrity: 'Lexx Little', exercises: 6, difficulty: 'Intermediate', equipment: ['barbell', 'dumbbells', 'cable'] },
    { id: 910, name: "Noel Deyzel's Push Volume", celebrity: 'Noel Deyzel', exercises: 6, difficulty: 'Intermediate', equipment: ['barbell', 'dumbbells', 'cable', 'machine'] },
  ],
  Pull: [
    { id: 1001, name: "Ronnie Coleman's Pull Routine", celebrity: 'Ronnie Coleman', exercises: 7, difficulty: 'Advanced', equipment: ['barbell', 'dumbbells', 'cable', 'machine'] },
    { id: 1002, name: "Dorian Yates' Blood & Guts Pull", celebrity: 'Dorian Yates', exercises: 5, difficulty: 'Advanced', equipment: ['barbell', 'dumbbells', 'cable', 'machine'] },
    { id: 1003, name: "CBum's Pull Day", celebrity: 'Chris Bumstead', exercises: 6, difficulty: 'Advanced', equipment: ['barbell', 'dumbbells', 'cable', 'machine'] },
    { id: 1004, name: "David Laid's Pull Day", celebrity: 'David Laid', exercises: 6, difficulty: 'Intermediate', equipment: ['barbell', 'dumbbells', 'cable'] },
    { id: 1005, name: "Sam Sulek's Pull Session", celebrity: 'Sam Sulek', exercises: 6, difficulty: 'Advanced', equipment: ['barbell', 'dumbbells', 'cable', 'machine'] },
    { id: 1006, name: "Jeff Nippard's Science Pull", celebrity: 'Jeff Nippard', exercises: 6, difficulty: 'Intermediate', equipment: ['barbell', 'dumbbells', 'cable'] },
    { id: 1007, name: "Ashton Hall's Pull Power", celebrity: 'Ashton Hall', exercises: 6, difficulty: 'Advanced', equipment: ['barbell', 'dumbbells', 'cable', 'machine'] },
    { id: 1008, name: "Alex Eubank's Pull Aesthetics", celebrity: 'Alex Eubank', exercises: 5, difficulty: 'Intermediate', equipment: ['dumbbells', 'cable', 'machine'] },
    { id: 1009, name: "Lexx Little's Pull Builder", celebrity: 'Lexx Little', exercises: 6, difficulty: 'Intermediate', equipment: ['barbell', 'dumbbells', 'cable'] },
    { id: 1010, name: "Larry Wheels' Heavy Pull", celebrity: 'Larry Wheels', exercises: 6, difficulty: 'Advanced', equipment: ['barbell', 'dumbbells', 'cable'] },
  ],
  'Upper Body': [
    { id: 1101, name: "Arnold's Upper Body Classic", celebrity: 'Arnold Schwarzenegger', exercises: 8, difficulty: 'Advanced', equipment: ['barbell', 'dumbbells', 'cable'] },
    { id: 1102, name: "The Rock's Upper Body Power", celebrity: 'Dwayne Johnson', exercises: 7, difficulty: 'Advanced', equipment: ['barbell', 'dumbbells', 'cable', 'machine'] },
    { id: 1103, name: "Jeff Nippard's Upper Body", celebrity: 'Jeff Nippard', exercises: 7, difficulty: 'Intermediate', equipment: ['barbell', 'dumbbells', 'cable'] },
    { id: 1104, name: "CBum's Upper Day", celebrity: 'Chris Bumstead', exercises: 7, difficulty: 'Advanced', equipment: ['barbell', 'dumbbells', 'cable', 'machine'] },
    { id: 1105, name: "David Laid's Upper Body", celebrity: 'David Laid', exercises: 6, difficulty: 'Intermediate', equipment: ['barbell', 'dumbbells', 'cable'] },
    { id: 1106, name: "Ashton Hall's Upper Strength", celebrity: 'Ashton Hall', exercises: 7, difficulty: 'Advanced', equipment: ['barbell', 'dumbbells', 'cable', 'machine'] },
    { id: 1107, name: "Sam Sulek's Upper Session", celebrity: 'Sam Sulek', exercises: 7, difficulty: 'Advanced', equipment: ['barbell', 'dumbbells', 'cable', 'machine'] },
    { id: 1108, name: "Hemsworth's Upper Power", celebrity: 'Chris Hemsworth', exercises: 6, difficulty: 'Intermediate', equipment: ['barbell', 'dumbbells', 'cable'] },
  ],
  'Lower Body': [
    { id: 1201, name: "Tom Platz's Leg Destroyer", celebrity: 'Tom Platz', exercises: 6, difficulty: 'Advanced', equipment: ['barbell', 'machine'] },
    { id: 1202, name: "Ronnie Coleman's Lower Body", celebrity: 'Ronnie Coleman', exercises: 7, difficulty: 'Advanced', equipment: ['barbell', 'machine'] },
    { id: 1203, name: "Jeff Nippard's Lower Body", celebrity: 'Jeff Nippard', exercises: 6, difficulty: 'Intermediate', equipment: ['barbell', 'dumbbells', 'machine'] },
    { id: 1204, name: "Ashton Hall's Athletic Lower", celebrity: 'Ashton Hall', exercises: 6, difficulty: 'Advanced', equipment: ['barbell', 'dumbbells'] },
    { id: 1205, name: "CBum's Lower Day", celebrity: 'Chris Bumstead', exercises: 6, difficulty: 'Advanced', equipment: ['barbell', 'dumbbells', 'machine'] },
    { id: 1206, name: "Jay Cutler's Lower Volume", celebrity: 'Jay Cutler', exercises: 7, difficulty: 'Advanced', equipment: ['barbell', 'machine'] },
    { id: 1207, name: "Sam Sulek's Lower Pump", celebrity: 'Sam Sulek', exercises: 6, difficulty: 'Advanced', equipment: ['barbell', 'dumbbells', 'machine'] },
  ],
  'Full Body': [
    { id: 1301, name: "The Rock's Full Body Circuit", celebrity: 'Dwayne Johnson', exercises: 10, difficulty: 'Advanced', equipment: ['barbell', 'dumbbells', 'cable', 'machine'] },
    { id: 1302, name: "Hemsworth's Total Body", celebrity: 'Chris Hemsworth', exercises: 8, difficulty: 'Intermediate', equipment: ['barbell', 'dumbbells', 'cable'] },
    { id: 1303, name: "Jeff Nippard's Full Body", celebrity: 'Jeff Nippard', exercises: 8, difficulty: 'Intermediate', equipment: ['barbell', 'dumbbells', 'cable'] },
    { id: 1304, name: "Ashton Hall's Full Body Burn", celebrity: 'Ashton Hall', exercises: 8, difficulty: 'Advanced', equipment: ['barbell', 'dumbbells', 'cable'] },
    { id: 1305, name: "David Laid's Total Body", celebrity: 'David Laid', exercises: 7, difficulty: 'Intermediate', equipment: ['barbell', 'dumbbells', 'cable'] },
    { id: 1306, name: "Noel Deyzel's Full Body", celebrity: 'Noel Deyzel', exercises: 7, difficulty: 'Intermediate', equipment: ['barbell', 'dumbbells', 'cable', 'machine'] },
    { id: 1307, name: "Mike O'Hearn's Power Full Body", celebrity: "Mike O'Hearn", exercises: 8, difficulty: 'Advanced', equipment: ['barbell', 'dumbbells', 'machine'] },
  ],
  'Shoulders & Arms': [
    { id: 1401, name: "Arnold's Shoulders & Arms", celebrity: 'Arnold Schwarzenegger', exercises: 8, difficulty: 'Advanced', equipment: ['barbell', 'dumbbells', 'cable'] },
    { id: 1402, name: "CBum's Delts & Arms", celebrity: 'Chris Bumstead', exercises: 7, difficulty: 'Advanced', equipment: ['dumbbells', 'cable'] },
    { id: 1403, name: "Sam Sulek's Shoulder & Arm Day", celebrity: 'Sam Sulek', exercises: 7, difficulty: 'Advanced', equipment: ['dumbbells', 'cable', 'machine'] },
    { id: 1404, name: "Ashton Hall's Shoulders & Arms", celebrity: 'Ashton Hall', exercises: 6, difficulty: 'Advanced', equipment: ['dumbbells', 'cable'] },
    { id: 1405, name: "The Rock's Delts & Arms", celebrity: 'Dwayne Johnson', exercises: 8, difficulty: 'Advanced', equipment: ['barbell', 'dumbbells', 'cable', 'machine'] },
    { id: 1406, name: "Jeff Nippard's Shoulders & Arms", celebrity: 'Jeff Nippard', exercises: 6, difficulty: 'Intermediate', equipment: ['barbell', 'dumbbells', 'cable'] },
    { id: 1407, name: "David Laid's Shoulder & Arm Day", celebrity: 'David Laid', exercises: 5, difficulty: 'Intermediate', equipment: ['barbell', 'dumbbells', 'cable'] },
  ],
  'Chest & Back': [
    { id: 1501, name: "Arnold's Chest & Back Superset", celebrity: 'Arnold Schwarzenegger', exercises: 8, difficulty: 'Advanced', equipment: ['barbell', 'dumbbells', 'cable'] },
    { id: 1502, name: "CBum's Chest & Back Day", celebrity: 'Chris Bumstead', exercises: 7, difficulty: 'Advanced', equipment: ['barbell', 'dumbbells', 'cable', 'machine'] },
    { id: 1503, name: "The Rock's Chest & Back", celebrity: 'Dwayne Johnson', exercises: 8, difficulty: 'Advanced', equipment: ['barbell', 'dumbbells', 'cable', 'machine'] },
    { id: 1504, name: "Jeff Nippard's Push-Pull Combo", celebrity: 'Jeff Nippard', exercises: 7, difficulty: 'Intermediate', equipment: ['barbell', 'dumbbells', 'cable'] },
    { id: 1505, name: "Ashton Hall's Chest & Back", celebrity: 'Ashton Hall', exercises: 7, difficulty: 'Advanced', equipment: ['barbell', 'dumbbells', 'cable', 'machine'] },
    { id: 1506, name: "Sam Sulek's Chest & Back Pump", celebrity: 'Sam Sulek', exercises: 7, difficulty: 'Advanced', equipment: ['barbell', 'dumbbells', 'cable', 'machine'] },
    { id: 1507, name: "David Laid's Chest & Back", celebrity: 'David Laid', exercises: 6, difficulty: 'Intermediate', equipment: ['barbell', 'dumbbells', 'cable'] },
  ],
};

// ─── Match celebrity workouts to muscle group via keywords ───────────────────
function getCelebrityWorkouts(muscleGroup?: string): CelebrityWorkout[] {
  if (!muscleGroup) return celebrityWorkoutsByGroup['Full Body'];
  const lower = muscleGroup.toLowerCase();

  // Direct match first (e.g. "Chest", "Push", "Shoulders & Arms")
  for (const key of Object.keys(celebrityWorkoutsByGroup)) {
    if (lower === key.toLowerCase()) return celebrityWorkoutsByGroup[key];
  }

  // Keyword matching for compound names
  const keywordMap: Record<string, string> = {
    'chest': 'Chest', 'back': 'Back', 'shoulders': 'Shoulders', 'shoulder': 'Shoulders',
    'biceps': 'Biceps', 'bicep': 'Biceps', 'triceps': 'Triceps', 'tricep': 'Triceps',
    'arms': 'Arms', 'arm': 'Arms', 'legs': 'Legs', 'leg': 'Legs',
    'quads': 'Legs', 'hamstrings': 'Legs', 'glutes': 'Legs', 'calves': 'Legs',
    'core': 'Core', 'abs': 'Core',
    'push': 'Push', 'pull': 'Pull',
    'upper': 'Upper Body', 'lower': 'Lower Body', 'full': 'Full Body',
  };

  const matched = new Set<string>();
  for (const [keyword, group] of Object.entries(keywordMap)) {
    if (lower.includes(keyword)) matched.add(group);
  }

  // For multi-muscle custom workouts (e.g. "Abs & Shoulders & Legs"),
  // only show celebrity workouts if there's an exact group match.
  // Don't show single-muscle celebrity workouts that only cover part of the combo.
  if (matched.size > 1) return [];

  // Single muscle group — show celebrity workouts for that group
  const results: CelebrityWorkout[] = [];
  for (const group of matched) {
    results.push(...(celebrityWorkoutsByGroup[group] || []));
  }

  if (results.length > 0) return results;
  return celebrityWorkoutsByGroup['Full Body'];
}

// ─── Shuffle helper ─────────────────────────────────────────────────────────
function shuffleArray<T>(arr: T[]): T[] {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// ─── Component ──────────────────────────────────────────────────────────────
type WorkoutSelection = 'ai' | 'standard' | number | `template-${string}`; // number = celebrity workout id

export function WorkoutStartPage({ onClose, muscleGroup, trainingLocation }: WorkoutStartPageProps) {
  const { profile } = useAuth();
  const { templates, loading: templatesLoading, fetchTemplates, deleteTemplate } = useWorkoutTemplates();
  // Only show home gym mode if actually training at home (not when at a different gym)
  const isTrainingAtHome = trainingLocation === 'Home Gym' || (trainingLocation === profile?.gym && profile?.isHomeGym);
  const hasHomeEquipment = isTrainingAtHome && !!profile?.homeEquipment;
  const isHomeGym = isTrainingAtHome; // always treat as home gym when location is home

  // Filter celebrity workouts based on available equipment
  const rawCelebrityWorkouts = getCelebrityWorkouts(muscleGroup);
  const allCelebrityWorkouts = isHomeGym
    ? rawCelebrityWorkouts.filter(w => {
        const eq = profile?.homeEquipment;
        return w.equipment.every(tag => {
          if (tag === 'machine') return false; // machines never available at home
          if (!eq) return true; // no equipment configured — only filter machines
          if (tag === 'barbell') return eq.barbell.has;
          if (tag === 'dumbbells') return eq.dumbbells.has;
          if (tag === 'cable') return eq.cables;
          if (tag === 'kettlebell') return eq.kettlebell.has;
          return true;
        });
      })
    : rawCelebrityWorkouts;
  const [displayedWorkouts, setDisplayedWorkouts] = useState<CelebrityWorkout[]>(allCelebrityWorkouts.slice(0, 3));
  const [activeWorkout, setActiveWorkout] = useState(false);
  const [selectedTemplateExercises, setSelectedTemplateExercises] = useState<{ name: string; sets: number }[] | undefined>(undefined);

  useEffect(() => { fetchTemplates(muscleGroup); }, [muscleGroup]);

  // Selection state — pick ONE workout type
  const [selected, setSelected] = useState<WorkoutSelection>('ai');
  // Modifier toggles — combinable with any selection
  const [fewerSets, setFewerSets] = useState(false);
  const [quickVersion, setQuickVersion] = useState(false);
  const [customBuild, setCustomBuild] = useState(false);

  const handleShuffle = () => {
    const shuffled = shuffleArray(allCelebrityWorkouts);
    setDisplayedWorkouts(shuffled.slice(0, 3));
  };

  const handleSelect = (sel: WorkoutSelection) => {
    setSelected(sel === selected ? 'standard' : sel);
    // If selecting a workout, turn off custom build
    if (sel !== 'standard') setCustomBuild(false);
    // Track template exercises for selected template
    if (typeof sel === 'string' && sel.startsWith('template-')) {
      const t = templates.find(t => `template-${t.id}` === sel);
      setSelectedTemplateExercises(t?.exercises);
    } else {
      setSelectedTemplateExercises(undefined);
    }
  };

  const toggleFewerSets = () => {
    setFewerSets(!fewerSets);
    if (!fewerSets) setQuickVersion(false); // mutually exclusive
  };

  const toggleQuickVersion = () => {
    setQuickVersion(!quickVersion);
    if (!quickVersion) setFewerSets(false); // mutually exclusive
  };

  const toggleCustomBuild = () => {
    setCustomBuild(!customBuild);
    if (!customBuild) {
      setFewerSets(false);
      setQuickVersion(false);
    }
  };

  const startWorkout = () => setActiveWorkout(true);

  // Build summary label for the Start button
  const getStartLabel = () => {
    const parts: string[] = [];
    if (customBuild) return 'Start Custom Build';
    if (typeof selected === 'string' && selected.startsWith('template-')) {
      const t = templates.find(t => `template-${t.id}` === selected);
      if (t) return `Start: ${t.name}`;
    }
    if (typeof selected === 'number') {
      const celeb = allCelebrityWorkouts.find(w => w.id === selected);
      if (celeb) parts.push(celeb.name);
    }
    if (quickVersion) parts.push('Quick');
    else if (fewerSets) parts.push('Fewer Sets');
    if (parts.length > 0) return `Start: ${parts.join(' + ')}`;
    return 'Start Workout';
  };

  if (activeWorkout) {
    return (
      <ActiveWorkoutPage
        onClose={onClose}
        muscleGroup={muscleGroup}
        fewerSets={fewerSets}
        quickVersion={quickVersion}
        customBuild={customBuild}
        trainingAtHome={!!isHomeGym}
        templateExercises={selectedTemplateExercises}
      />
    );
  }

  return (
    <div className="fixed inset-0 bg-black z-50 overflow-y-auto pb-28">
      <div className="sticky top-0 bg-black/95 backdrop-blur-sm border-b border-gray-800 px-4 py-4 flex items-center justify-between z-10">
        <h1 className="text-xl font-bold">{muscleGroup}</h1>
        <button onClick={onClose} className="p-2 hover:bg-gray-800 rounded-full transition-colors"><X className="w-5 h-5 text-gray-400" /></button>
      </div>

      <div className="px-4 py-4 space-y-4">
        {/* Home Gym Notice */}
        {isHomeGym && (
          <div className="flex items-center gap-2.5 bg-[#00ff00]/5 border border-[#00ff00]/20 rounded-xl px-4 py-3">
            <Home className="w-4 h-4 text-[#00ff00] shrink-0" />
            <p className="text-xs text-gray-300">
              <span className="font-semibold text-[#00ff00]">Home Gym Mode</span> — Exercises will be filtered to match your available equipment.
            </p>
          </div>
        )}

        {/* Workout Templates */}
        <div className="space-y-3">
          <button
            onClick={() => handleSelect('ai')}
            className={`w-full rounded-2xl p-4 flex items-center gap-4 transition-all ${
              selected === 'ai'
                ? 'bg-gradient-to-br from-green-900/40 to-emerald-900/40 border-2 border-[#00ff00] ring-1 ring-[#00ff00]/30'
                : 'bg-[#1a1a1a] hover:bg-[#252525] border-2 border-transparent'
            }`}
          >
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${selected === 'ai' ? 'bg-[#00ff00]' : 'bg-[#252525]'}`}>
              <Sparkles className={`w-6 h-6 ${selected === 'ai' ? 'text-black' : 'text-[#00ff00]'}`} />
            </div>
            <div className="flex-1 text-left">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-bold">AI-Powered</h3>
                <span className="px-2 py-0.5 bg-[#00ff00] text-black text-[10px] font-bold rounded-full">RECOMMENDED</span>
              </div>
              <p className="text-sm text-gray-400">Personalized to your history and goals</p>
            </div>
            {selected === 'ai' && <div className="w-6 h-6 bg-[#00ff00] rounded-full flex items-center justify-center"><span className="text-black text-xs font-bold">✓</span></div>}
          </button>

          <button
            onClick={() => handleSelect('standard')}
            className={`w-full rounded-2xl p-4 flex items-center gap-4 transition-all ${
              selected === 'standard'
                ? 'bg-[#1a1a1a] border-2 border-[#00ff00] ring-1 ring-[#00ff00]/30'
                : 'bg-[#1a1a1a] hover:bg-[#252525] border-2 border-transparent'
            }`}
          >
            <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-[#252525]">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1 text-left">
              <h3 className="font-bold">Standard {muscleGroup || 'Workout'}</h3>
              <p className="text-sm text-gray-400">6 exercises</p>
            </div>
            {selected === 'standard' && <div className="w-6 h-6 bg-[#00ff00] rounded-full flex items-center justify-center"><span className="text-black text-xs font-bold">✓</span></div>}
          </button>
        </div>

        {/* Saved Workout Templates */}
        {templates.length > 0 && (
          <div>
            <h2 className="text-sm font-bold text-gray-400 mb-3">Your Saved Workouts</h2>
            <div className="space-y-2">
              {templates.map((template) => {
                const isSelected = selected === `template-${template.id}`;
                return (
                  <div key={template.id} className="relative">
                    <button
                      onClick={() => handleSelect(`template-${template.id}`)}
                      className={`w-full rounded-xl p-4 flex items-center gap-4 transition-all ${
                        isSelected
                          ? 'bg-[#1a1a1a] border-2 border-[#00ff00] ring-1 ring-[#00ff00]/30'
                          : 'bg-[#1a1a1a] hover:bg-[#252525] border-2 border-transparent'
                      }`}
                    >
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isSelected ? 'bg-gradient-to-br from-[#00ff00] to-[#00cc00]' : 'bg-[#252525]'}`}>
                        <Save className={`w-6 h-6 ${isSelected ? 'text-black' : 'text-[#00ff00]'}`} />
                      </div>
                      <div className="flex-1 text-left">
                        <h3 className="font-bold text-sm mb-1">{template.name}</h3>
                        <p className="text-xs text-gray-400">{template.exercises.length} exercises</p>
                      </div>
                      {isSelected && <div className="w-6 h-6 bg-[#00ff00] rounded-full flex items-center justify-center"><span className="text-black text-xs font-bold">✓</span></div>}
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); deleteTemplate(template.id); }}
                      className="absolute top-2 right-2 p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                    >
                      <X className="w-3.5 h-3.5 text-gray-600 hover:text-red-400" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Celebrity Workouts — only show when available for this muscle group */}
        {allCelebrityWorkouts.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-gray-400">Celebrity Workouts</h2>
            <button onClick={handleShuffle} className="flex items-center gap-1.5 text-[#00ff00] text-sm font-semibold hover:opacity-80 transition-opacity active:scale-95">
              <Shuffle className="w-4 h-4" /><span>Shuffle</span>
            </button>
          </div>
          <div className="space-y-2">
            {displayedWorkouts.map((workout) => {
              const isSelected = selected === workout.id;
              return (
                <button
                  key={workout.id}
                  onClick={() => handleSelect(workout.id)}
                  className={`w-full rounded-xl p-4 flex items-center gap-4 transition-all ${
                    isSelected
                      ? 'bg-[#1a1a1a] border-2 border-[#00ff00] ring-1 ring-[#00ff00]/30'
                      : 'bg-[#1a1a1a] hover:bg-[#252525] border-2 border-transparent'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isSelected ? 'bg-gradient-to-br from-[#00ff00] to-[#00cc00]' : 'bg-gradient-to-br from-yellow-500 to-orange-500'}`}>
                    <Trophy className={`w-6 h-6 ${isSelected ? 'text-black' : 'text-white'}`} />
                  </div>
                  <div className="flex-1 text-left">
                    <h3 className="font-bold text-sm mb-1">{workout.name}</h3>
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <span>{workout.celebrity}</span><span>•</span><span>{workout.exercises} exercises</span><span>•</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${workout.difficulty === 'Advanced' ? 'bg-red-500/20 text-red-400' : workout.difficulty === 'Intermediate' ? 'bg-blue-500/20 text-blue-400' : 'bg-green-500/20 text-green-400'}`}>{workout.difficulty}</span>
                    </div>
                  </div>
                  {isSelected && <div className="w-6 h-6 bg-[#00ff00] rounded-full flex items-center justify-center"><span className="text-black text-xs font-bold">✓</span></div>}
                </button>
              );
            })}
          </div>
          <p className="text-xs text-gray-500 mt-2 ml-1">
            {allCelebrityWorkouts.length} celebrity workout{allCelebrityWorkouts.length !== 1 ? 's' : ''} available
            {isHomeGym && allCelebrityWorkouts.length < rawCelebrityWorkouts.length && (
              <span className="text-gray-600"> ({rawCelebrityWorkouts.length - allCelebrityWorkouts.length} filtered — need more equipment)</span>
            )}
          </p>
        </div>
        )}

        {/* Modifiers */}
        <div>
          <h2 className="text-sm font-bold text-gray-400 mb-3">Modifiers</h2>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={toggleFewerSets}
              className={`rounded-xl p-4 flex flex-col items-start transition-all ${
                fewerSets
                  ? 'bg-[#00ff00]/10 border-2 border-[#00ff00] ring-1 ring-[#00ff00]/20'
                  : 'bg-[#1a1a1a] hover:bg-[#252525] border-2 border-transparent'
              }`}
            >
              <Zap className={`w-5 h-5 mb-2 ${fewerSets ? 'text-[#00ff00]' : 'text-gray-400'}`} />
              <h3 className={`font-bold text-sm mb-0.5 ${fewerSets ? 'text-[#00ff00]' : ''}`}>Fewer Sets</h3>
              <p className="text-xs text-gray-400">3 sets each</p>
            </button>

            <button
              onClick={toggleQuickVersion}
              className={`rounded-xl p-4 flex flex-col items-start transition-all ${
                quickVersion
                  ? 'bg-[#00ff00]/10 border-2 border-[#00ff00] ring-1 ring-[#00ff00]/20'
                  : 'bg-[#1a1a1a] hover:bg-[#252525] border-2 border-transparent'
              }`}
            >
              <Clock className={`w-5 h-5 mb-2 ${quickVersion ? 'text-[#00ff00]' : 'text-gray-400'}`} />
              <h3 className={`font-bold text-sm mb-0.5 ${quickVersion ? 'text-[#00ff00]' : ''}`}>Quick Version</h3>
              <p className="text-xs text-gray-400">4 exercises, 30 min</p>
            </button>

            <button
              onClick={onClose}
              className="bg-[#1a1a1a] rounded-xl p-4 flex flex-col items-start hover:bg-[#252525] transition-all border-2 border-transparent"
            >
              <SkipForward className="w-5 h-5 text-gray-400 mb-2" />
              <h3 className="font-bold text-sm mb-0.5">Skip Today</h3>
              <p className="text-xs text-gray-400">Mark rest</p>
            </button>

            <button
              onClick={toggleCustomBuild}
              className={`rounded-xl p-4 flex flex-col items-start transition-all ${
                customBuild
                  ? 'bg-[#00ff00]/10 border-2 border-[#00ff00] ring-1 ring-[#00ff00]/20'
                  : 'bg-[#1a1a1a] hover:bg-[#252525] border-2 border-transparent'
              }`}
            >
              <Edit3 className={`w-5 h-5 mb-2 ${customBuild ? 'text-[#00ff00]' : 'text-gray-400'}`} />
              <h3 className={`font-bold text-sm mb-0.5 ${customBuild ? 'text-[#00ff00]' : ''}`}>Custom Build</h3>
              <p className="text-xs text-gray-400">Pick your exercises</p>
            </button>
          </div>
        </div>
      </div>

      {/* Fixed Start Button */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black via-black to-transparent pt-8">
        <button
          className="w-full bg-[#00ff00] text-black font-bold py-4 rounded-2xl text-base hover:bg-[#00dd00] transition-all active:scale-[0.98]"
          onClick={startWorkout}
        >
          {getStartLabel()}
        </button>
      </div>
    </div>
  );
}
