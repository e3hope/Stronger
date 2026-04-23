import { supabase } from './client';
import {
  MealPlan,
  MealLog,
  MealType,
  MealItem,
  emptyWeekPlan,
  MealWeekPlan,
} from '../types';

function mapPlanRow(r: any): MealPlan {
  return {
    id: r.id,
    user_id: r.user_id,
    name: r.name,
    plan: (r.plan && Object.keys(r.plan).length ? r.plan : emptyWeekPlan()) as MealWeekPlan,
    is_active: r.is_active,
  };
}

function mapLogRow(r: any): MealLog {
  return {
    id: r.id,
    user_id: r.user_id,
    date: r.date,
    meal_type: r.meal_type as MealType,
    items: (r.items as MealItem[]) ?? [],
    memo: r.memo,
  };
}

export async function fetchActiveMealPlan(userId: number): Promise<MealPlan | null> {
  const { data, error } = await supabase
    .from('meal_plans')
    .select('*')
    .eq('user_id', userId)
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data ? mapPlanRow(data) : null;
}

export async function createDefaultMealPlan(userId: number): Promise<MealPlan> {
  const { data, error } = await supabase
    .from('meal_plans')
    .insert({
      user_id: userId,
      name: '내 식단',
      plan: emptyWeekPlan(),
      is_active: true,
    })
    .select()
    .single();
  if (error) throw error;
  return mapPlanRow(data);
}

export async function updateMealPlan(plan: MealPlan): Promise<void> {
  const { error } = await supabase
    .from('meal_plans')
    .update({
      name: plan.name,
      plan: plan.plan,
      is_active: plan.is_active,
      updated_at: new Date().toISOString(),
    })
    .eq('id', plan.id);
  if (error) throw error;
}

export async function fetchLogsInRange(
  userId: number,
  fromDate: string,
  toDate: string,
): Promise<MealLog[]> {
  const { data, error } = await supabase
    .from('meal_logs')
    .select('*')
    .eq('user_id', userId)
    .gte('date', fromDate)
    .lte('date', toDate);
  if (error) throw error;
  return (data ?? []).map(mapLogRow);
}

export interface UpsertLogInput {
  id?: number;
  user_id: number;
  date: string;
  meal_type: MealType;
  items: MealItem[];
  memo?: string | null;
}

/**
 * Upsert by (user_id, date, meal_type) unique constraint.
 * If no matching row exists, inserts a new one.
 */
export async function upsertLog(input: UpsertLogInput): Promise<MealLog> {
  const { data, error } = await supabase
    .from('meal_logs')
    .upsert(
      {
        user_id: input.user_id,
        date: input.date,
        meal_type: input.meal_type,
        items: input.items,
        memo: input.memo ?? null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,date,meal_type' },
    )
    .select()
    .single();
  if (error) throw error;
  return mapLogRow(data);
}

export async function deleteLogById(id: number): Promise<void> {
  const { error } = await supabase.from('meal_logs').delete().eq('id', id);
  if (error) throw error;
}
