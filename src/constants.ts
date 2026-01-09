import { Routine, WorkoutSession } from './types';

export const INITIAL_ROUTINES: Routine[] = [
  {
    id: '1',
    name: 'Chest & Triceps',
    tags: ['Chest', 'Triceps', 'Strength'],
    estimatedDuration: 50,
    exercises: [
      {
        id: 'e1',
        name: 'Bench Press',
        category: 'Chest',
        type: 'Compound',
        sets: [
          { id: 's1', weight: 80, reps: 10 },
          { id: 's2', weight: 80, reps: 8 },
        ]
      }
    ]
  },
  {
    id: '2',
    name: 'Leg Day Focus',
    tags: ['Legs', 'Heavy'],
    estimatedDuration: 60,
    exercises: []
  },
  {
    id: '3',
    name: 'Cardio Blast',
    tags: ['Cardio', 'Endurance'],
    estimatedDuration: 40,
    exercises: []
  }
];

export const INITIAL_WORKOUTS: WorkoutSession[] = [
  {
    id: 'w1',
    date: '2023-10-12T10:00:00Z',
    routineName: 'Chest & Triceps',
    duration: 45,
    volume: 4200,
    prs: 1,
    exercises: []
  },
  {
    id: 'w2',
    date: '2023-10-03T09:00:00Z',
    routineName: 'Lower Body',
    duration: 55,
    volume: 3800,
    prs: 2,
    exercises: []
  }
];
