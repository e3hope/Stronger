import { supabase } from './client';
import { Routine } from '../types';

function mapRoutineRow(r: any): Routine {
  return {
    id: r.id,
    user_id: r.user_id,
    name: r.name,
    exercises: r.exercises_detail,
    tags: [],
  };
}

export async function fetchRoutines(userId: number): Promise<Routine[]> {
  const { data, error } = await supabase
    .from('routines')
    .select('*')
    .order('created_at', { ascending: false })
    .eq('user_id', userId);
  if (error) throw error;
  return (data || []).map(mapRoutineRow);
}

export async function insertRoutine(userId: number, routine: Routine): Promise<Routine> {
  const { data, error } = await supabase
    .from('routines')
    .insert({
      user_id: userId,
      name: routine.name,
      exercises_detail: routine.exercises,
    })
    .select()
    .single();
  if (error) throw error;
  return mapRoutineRow(data);
}

export async function updateRoutine(routine: Routine): Promise<void> {
  const { error } = await supabase
    .from('routines')
    .update({
      name: routine.name,
      exercises_detail: routine.exercises,
      updated_at: new Date().toISOString(),
    })
    .eq('id', routine.id);
  if (error) throw error;
}

export async function unlinkWorkoutLogsForRoutine(routineId: number): Promise<void> {
  const { error } = await supabase
    .from('workout_logs')
    .update({ routine_id: null })
    .eq('routine_id', routineId);
  if (error) throw error;
}

export async function deleteRoutineById(id: number): Promise<void> {
  const { error } = await supabase
    .from('routines')
    .delete({ count: 'exact' })
    .eq('id', id);
  if (error) throw error;
}
