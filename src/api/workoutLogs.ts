import { supabase } from './client';
import { WorkoutLog } from '../types';

export const WORKOUT_LOGS_PAGE_SIZE = 20;

export async function fetchWorkoutLogs(userId: number, pageNum: number) {
  const from = pageNum * WORKOUT_LOGS_PAGE_SIZE;
  const to = from + WORKOUT_LOGS_PAGE_SIZE - 1;
  const { data, error } = await supabase
    .from('workout_logs')
    .select('*')
    .order('performed_at', { ascending: false })
    .range(from, to)
    .eq('user_id', userId);
  if (error) throw error;
  return data || [];
}

export interface InsertWorkoutLogInput {
  routine_id: number | null;
  performed_at: string;
  exercises_log: any;
  memo?: string;
}

export async function insertWorkoutLog(userId: number, input: InsertWorkoutLogInput) {
  const { data, error } = await supabase
    .from('workout_logs')
    .insert({
      user_id: userId,
      routine_id: input.routine_id,
      performed_at: input.performed_at,
      exercises_log: input.exercises_log,
      memo: input.memo,
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateWorkoutLogRow(log: WorkoutLog): Promise<void> {
  const { error } = await supabase
    .from('workout_logs')
    .update({
      performed_at: log.date,
      exercises_log: log.exercises,
      updated_at: new Date().toISOString(),
      memo: log.memo,
    })
    .eq('id', log.id);
  if (error) throw error;
}

export async function deleteWorkoutLogById(id: number): Promise<void> {
  const { error } = await supabase.from('workout_logs').delete().eq('id', id);
  if (error) throw error;
}
