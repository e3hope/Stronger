
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
  memo?: string;
}

export interface User {
  id: number; // Serial
  auth_id: string; // UUID
  language_setting: string;
  created_at: string;
  updated_at: string;
}

export interface Routine {
  id: number; // Integer (Serial)
  user_id?: number; // Integer FK
  name: string;
  exercises: Exercise[]; // Mapped from exercises_detail (JSONB)
  tags?: string[]; // UI only
}

export interface WorkoutLog {
  id: number; // Integer (Serial)
  user_id?: number; // Integer FK
  routine_id?: number | null; // Integer FK
  routineName?: string; // UI convenience
  date: string; // performed_at
  exercises: Exercise[]; // Mapped from exercises_log (JSONB)
  
  // UI only (Calculated)
  duration?: number; // minutes
  volume?: number; // kg
  prs?: number;
  memo?: string;
}

// Alias for backward compatibility during refactor
export type WorkoutSession = WorkoutLog;

// ===== Meal planning =====

export type MealType = 'breakfast' | 'lunch' | 'snack' | 'dinner';
export type Weekday = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';

export const MEAL_TYPES: MealType[] = ['breakfast', 'lunch', 'snack', 'dinner'];
export const WEEKDAYS: Weekday[] = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];

export const MEAL_TYPE_LABEL: Record<MealType, string> = {
  breakfast: '아침',
  lunch: '점심',
  snack: '간식',
  dinner: '저녁',
};

export const WEEKDAY_LABEL: Record<Weekday, string> = {
  mon: '월', tue: '화', wed: '수', thu: '목',
  fri: '금', sat: '토', sun: '일',
};

export type MealStatus = 'ok' | 'skip';

export interface MealItem {
  id: string;                        // client-side tempId
  text: string;
  status?: MealStatus | null;        // 'ok' | 'skip' | null(=미체크)
}

export interface MealDayPlan {
  breakfast: MealItem[];
  lunch: MealItem[];
  snack: MealItem[];
  dinner: MealItem[];
}

export type MealWeekPlan = Record<Weekday, MealDayPlan>;

export interface MealPlan {
  id: number;
  user_id: number;
  name: string;
  plan: MealWeekPlan;
  is_active: boolean;
}

export interface MealLog {
  id: number;
  user_id: number;
  date: string;       // YYYY-MM-DD
  meal_type: MealType;
  items: MealItem[];
  memo?: string | null;
}

export interface MealAchievement {
  total: number;       // 항목 총 개수
  checked: number;     // 체크된 개수 (ok + skip)
  ok: number;          // O 개수
  complete: boolean;   // 모두 체크 완료 여부
  rate: number | null; // 완료 시에만 숫자 (0~100), 미완료면 null
}

export function computeMealAchievement(items: MealItem[]): MealAchievement {
  const total = items.length;
  const checked = items.filter(
    (i) => i.status === 'ok' || i.status === 'skip',
  ).length;
  const ok = items.filter((i) => i.status === 'ok').length;
  const complete = total > 0 && checked === total;
  const rate = complete ? Math.round((ok / total) * 100) : null;
  return { total, checked, ok, complete, rate };
}

export const emptyDayPlan = (): MealDayPlan => ({
  breakfast: [], lunch: [], snack: [], dinner: [],
});

export const emptyWeekPlan = (): MealWeekPlan => ({
  mon: emptyDayPlan(), tue: emptyDayPlan(), wed: emptyDayPlan(),
  thu: emptyDayPlan(), fri: emptyDayPlan(), sat: emptyDayPlan(),
  sun: emptyDayPlan(),
});
