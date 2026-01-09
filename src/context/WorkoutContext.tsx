import React, { createContext, useContext, useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { Routine, WorkoutLog } from '../types';
import { supabase } from '../lib/supabase';

interface WorkoutContextType {
  routines: Routine[];
  workouts: WorkoutLog[];
  loading: boolean;
  saveRoutine: (routine: Routine) => Promise<void>;
  addWorkout: (workout: WorkoutLog) => Promise<void>;
  refreshData: () => Promise<void>;
}

const WorkoutContext = createContext<WorkoutContextType | undefined>(undefined);

export function WorkoutProvider({ children }: { children: React.ReactNode }) {
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [workouts, setWorkouts] = useState<WorkoutLog[]>([]);
  const [loading, setLoading] = useState(true);

  // 데이터 불러오기
  const fetchData = async () => {
    try {
      setLoading(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        // 로그인 안 된 경우 빈 데이터
        setRoutines([]);
        setWorkouts([]);
        setLoading(false);
        return;
      }

      // 1. Routines 조회
      const { data: routinesData, error: routinesError } = await supabase
        .from('routines')
        .select('*')
        .order('created_at', { ascending: false });

      if (routinesError) throw routinesError;

      const formattedRoutines: Routine[] = (routinesData || []).map(r => ({
        id: r.id,
        user_id: r.user_id,
        name: r.name,
        exercises: r.exercises_detail, // JSONB 자동 파싱됨
        tags: [], // UI only
        estimatedDuration: 45 // Default
      }));
      setRoutines(formattedRoutines);

      // 2. Workout Logs 조회
      const { data: logsData, error: logsError } = await supabase
        .from('workout_logs')
        .select('*')
        .order('performed_at', { ascending: false });

      if (logsError) throw logsError;

      const formattedLogs: WorkoutLog[] = (logsData || []).map(l => {
        // 루틴 이름 찾기
        const relatedRoutine = formattedRoutines.find(r => r.id === l.routine_id);
        
        // 볼륨 계산
        const volume = (l.exercises_log || []).reduce((acc: number, ex: any) => {
          const exVolume = (ex.sets || []).reduce((sAcc: number, set: any) => sAcc + (set.weight * set.reps), 0);
          return acc + exVolume;
        }, 0);

        return {
          id: l.id,
          user_id: l.user_id,
          routine_id: l.routine_id,
          routineName: relatedRoutine ? relatedRoutine.name : 'Custom Workout',
          date: l.performed_at,
          exercises: l.exercises_log,
          duration: 60, // Default
          volume: volume,
          prs: 0
        };
      });
      setWorkouts(formattedLogs);

    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const saveRoutine = async (routine: Routine) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        Alert.alert('Error', '로그인이 필요합니다.');
        return;
      }

      // ID가 0이거나 음수이면 새 루틴으로 간주
      const isNew = !routine.id || routine.id < 0 || typeof routine.id === 'string';

      if (isNew) {
        const { error } = await supabase.from('routines').insert({
          user_id: user.id,
          name: routine.name,
          exercises_detail: routine.exercises
        });
        if (error) throw error;
      } else {
        const { error } = await supabase.from('routines').update({
          name: routine.name,
          exercises_detail: routine.exercises,
          updated_at: new Date().toISOString()
        }).eq('id', routine.id);
        if (error) throw error;
      }

      await fetchData();
    } catch (error) {
      console.error('Error saving routine:', error);
      Alert.alert('Error', 'Failed to save routine');
    }
  };

  const addWorkout = async (workout: WorkoutLog) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        Alert.alert('Error', '로그인이 필요합니다.');
        return;
      }

      const { error } = await supabase.from('workout_logs').insert({
        user_id: user.id,
        routine_id: workout.routine_id || null,
        performed_at: workout.date,
        exercises_log: workout.exercises
      });

      if (error) throw error;
      await fetchData();
    } catch (error) {
      console.error('Error saving workout:', error);
      Alert.alert('Error', 'Failed to save workout');
    }
  };

  return (
    <WorkoutContext.Provider value={{ routines, workouts, loading, saveRoutine, addWorkout, refreshData: fetchData }}>
      {children}
    </WorkoutContext.Provider>
  );
}

export function useWorkout() {
  const context = useContext(WorkoutContext);
  if (context === undefined) {
    throw new Error('useWorkout must be used within a WorkoutProvider');
  }
  return context;
}
