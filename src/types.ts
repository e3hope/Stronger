
export interface Set {
  id: string;
  weight: number;
  reps: number;
}

export interface Exercise {
  id: string;
  name: string;
  category: string;
  type: string; // 'Compound', 'Isolation', etc.
  sets: Set[];
}

export interface User {
  id: string;
  language_setting: string;
  created_at: string;
  updated_at: string;
}

export interface Routine {
  id: number; // Integer (Serial)
  user_id?: string; // UUID
  name: string;
  exercises: Exercise[]; // Mapped from exercises_detail (JSONB)
  tags?: string[]; // UI only
  estimatedDuration?: number; // UI only
}

export interface WorkoutLog {
  id: number; // Integer (Serial)
  user_id?: string; // UUID
  routine_id?: number | null; // Integer FK
  routineName?: string; // UI convenience
  date: string; // performed_at
  exercises: Exercise[]; // Mapped from exercises_log (JSONB)
  
  // UI only (Calculated)
  duration?: number; // minutes
  volume?: number; // kg
  prs?: number;
}

// Alias for backward compatibility during refactor
export type WorkoutSession = WorkoutLog;
