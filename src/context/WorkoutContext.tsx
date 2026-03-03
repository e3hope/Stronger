import React, { createContext, useContext, useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { Routine, WorkoutLog } from '../types';
import { supabase } from '../lib/supabase';

interface WorkoutContextType {
  routines: Routine[];
  workouts: WorkoutLog[];
  loading: boolean;
  hasMore: boolean;
  saveRoutine: (routine: Routine) => Promise<void>;
  deleteRoutine: (id: number) => Promise<void>;
  addWorkout: (workout: WorkoutLog) => Promise<void>;
  updateWorkoutLog: (workout: WorkoutLog) => Promise<void>;
  deleteWorkoutLog: (id: number) => Promise<void>;
  addPlannedWorkout: (date: string, routineId: number) => Promise<void>;
  refreshData: () => Promise<void>;
  loadMoreWorkouts: () => Promise<void>;
}

const WorkoutContext = createContext<WorkoutContextType | undefined>(undefined);

export function WorkoutProvider({ children }: { children: React.ReactNode }) {
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [workouts, setWorkouts] = useState<WorkoutLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const [publicUserId, setPublicUserId] = useState<number | null>(null);
  const PAGE_SIZE = 20;

  // Helper to fetch logs with pagination
  const fetchLogs = async (userId: number, pageNum: number) => {
    const from = pageNum * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    const { data: logsData, error: logsError } = await supabase
      .from('workout_logs')
      .select('*')
      .order('performed_at', { ascending: false })
      .range(from, to)
      .eq('user_id', userId);

    if (logsError) throw logsError;
    return logsData || [];
  };

  // 데이터 불러오기 (Initial Load / Refresh)
  const fetchData = async () => {
    try {
      setLoading(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setRoutines([]);
        setWorkouts([]);
        setPublicUserId(null);
        setLoading(false);
        return;
      }

      // 0. Ensure public user exists
      let currentPublicUserId: number | null = null;
      // ... (Existing user check logic) ...
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('auth_id', user.id)
        .maybeSingle();

      if (existingUser) {
        currentPublicUserId = existingUser.id;
      } else {
        const { data: newUser } = await supabase
          .from('users')
          .insert({ auth_id: user.id })
          .select('id')
          .single();
        currentPublicUserId = newUser?.id || null;
      }

      setPublicUserId(currentPublicUserId);

      if (!currentPublicUserId) {
        setLoading(false);
        return;
      }

      // 1. Routines 조회 (All at once for now)
      const { data: routinesData, error: routinesError } = await supabase
        .from('routines')
        .select('*')
        .order('created_at', { ascending: false })
        .eq('user_id', currentPublicUserId);

      if (routinesError) throw routinesError;

      const formattedRoutines: Routine[] = (routinesData || []).map(r => ({
        id: r.id,
        user_id: r.user_id,
        name: r.name,
        exercises: r.exercises_detail,
        tags: [],
      }));
      setRoutines(formattedRoutines);

      // 2. Workout Logs 조회 (Page 0)
      const logsData = await fetchLogs(currentPublicUserId, 0);
      
      const formattedLogs = processLogs(logsData, formattedRoutines);
      setWorkouts(formattedLogs);
      setPage(0);
      setHasMore(logsData.length === PAGE_SIZE);

    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMoreWorkouts = async () => {
    if (!hasMore || loading || !publicUserId) return;

    try {
      // Don't set global loading true to avoid full screen spinner, maybe add separate loading state if needed
      // but for infinite scroll, usually we just append.
      
      const nextPage = page + 1;
      const logsData = await fetchLogs(publicUserId, nextPage);
      
      if (logsData.length > 0) {
        const newLogs = processLogs(logsData, routines);
        setWorkouts(prev => [...prev, ...newLogs]);
        setPage(nextPage);
        setHasMore(logsData.length === PAGE_SIZE);
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error('Error loading more workouts:', error);
    }
  };

  const processLogs = (logsData: any[], currentRoutines: Routine[]): WorkoutLog[] => {
    return logsData.map(l => {
      const relatedRoutine = currentRoutines.find(r => r.id === l.routine_id);
      const volume = (l.exercises_log || []).reduce((acc: number, ex: any) => {
        const exVolume = (ex.sets || []).reduce((sAcc: number, set: any) => sAcc + (set.weight * set.reps), 0);
        return acc + exVolume;
      }, 0);

      return {
        id: l.id,
        user_id: l.user_id,
        routine_id: l.routine_id,
        routineName: relatedRoutine ? relatedRoutine.name : '-',
        date: l.performed_at,
        exercises: l.exercises_log,
        duration: 60,
        volume: volume,
        prs: 0,
        memo: l.memo
      };
    });
  };

  useEffect(() => {
    fetchData();
  }, []);

  const saveRoutine = async (routine: Routine) => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !publicUserId) {
        Alert.alert('Error', '로그인이 필요하거나 사용자 정보를 불러올 수 없습니다.');
        setLoading(false);
        return;
      }

      // ID가 0이거나 음수이면 새 루틴으로 간주
      const isNew = !routine.id || routine.id < 0;

      if (isNew) {
        const { error } = await supabase.from('routines').insert({
          user_id: publicUserId, // Use Integer ID
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
      setLoading(false);
    }
  };

  const deleteRoutine = async (id: number) => {
    setLoading(true);
    console.log('[deleteRoutine] called with id:', id, 'publicUserId:', publicUserId);
    // Delete routine from DB
    try {
      if (!publicUserId) {
        Alert.alert('Error', '로그인이 필요합니다.');
        setLoading(false);
        return;
      }

      // 1. 루틴 삭제 전 연관된 운동 로그의 연결 해제 (FK 제약 조건 방지)
      const { error: unlinkError } = await supabase
        .from('workout_logs')
        .update({ routine_id: null })
        .eq('routine_id', id);

      if (unlinkError) {
        console.error('Error unlinking workout logs:', unlinkError);
        throw unlinkError;
      }

      // 2. 루틴 삭제
      const { error, count } = await supabase
        .from('routines')
        .delete({ count: 'exact' })
        .eq('id', id);
        
      console.log('[deleteRoutine] supabase response:', { error, count });

      if (error) throw error;
      
      console.log('[deleteRoutine] fetching data...');
      await fetchData();
      console.log('[deleteRoutine] data fetched');
    } catch (error) {
      console.error('Error deleting routine:', error);
      Alert.alert('Error', 'Failed to delete routine: ' + (error instanceof Error ? error.message : JSON.stringify(error)));
      setLoading(false);
    }
  };

  const addWorkout = async (workout: WorkoutLog) => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !publicUserId) {
        Alert.alert('Error', '로그인이 필요하거나 사용자 정보를 불러올 수 없습니다.');
        setLoading(false);
        return;
      }

      const { error } = await supabase.from('workout_logs').insert({
        user_id: publicUserId, // Use Integer ID
        routine_id: workout.routine_id || null,
        performed_at: workout.date,
        exercises_log: workout.exercises,
        memo: workout.memo
      });

      if (error) throw error;
      await fetchData();
    } catch (error) {
      console.error('Error saving workout:', error);
      Alert.alert('Error', 'Failed to save workout');
      setLoading(false);
    }
  };

  const updateWorkoutLog = async (workout: WorkoutLog) => {
    setLoading(true);
    try {
      if (!publicUserId) {
        Alert.alert('Error', '로그인이 필요합니다.');
        setLoading(false);
        return;
      }

      const { error } = await supabase.from('workout_logs').update({
        performed_at: workout.date,
        exercises_log: workout.exercises,
        updated_at: new Date().toISOString(),
        memo: workout.memo
      }).eq('id', workout.id);

      if (error) throw error;
      await fetchData();
    } catch (error) {
      console.error('Error updating workout:', error);
      Alert.alert('Error', 'Failed to update workout');
      setLoading(false);
    }
  };

  const deleteWorkoutLog = async (id: number) => {
    setLoading(true);
    try {
      if (!publicUserId) {
        Alert.alert('Error', '로그인이 필요합니다.');
        setLoading(false);
        return;
      }

      const { error } = await supabase
        .from('workout_logs')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await fetchData();
    } catch (error) {
      console.error('Error deleting workout log:', error);
      Alert.alert('Error', 'Failed to delete workout log');
      setLoading(false);
    }
  };

  const addPlannedWorkout = async (date: string, routineId: number) => {
    setLoading(true);
    try {
      if (!publicUserId) {
        Alert.alert('Error', '로그인이 필요합니다.');
        setLoading(false);
        return;
      }

      const routine = routines.find(r => r.id === routineId);
      if (!routine) {
        Alert.alert('Error', 'Routine not found');
        setLoading(false);
        return;
      }

      const { error } = await supabase.from('workout_logs').insert({
        user_id: publicUserId,
        routine_id: routineId,
        performed_at: date,
        exercises_log: routine.exercises
      });

      if (error) throw error;
      await fetchData();
    } catch (error) {
      console.error('Error adding planned workout:', error);
      Alert.alert('Error', 'Failed to add planned workout');
      setLoading(false);
    }
  };

  return (
    <WorkoutContext.Provider value={{
      routines,
      workouts,
      loading,
      hasMore,
      saveRoutine,
      deleteRoutine,
      addWorkout,
      updateWorkoutLog,
      deleteWorkoutLog,
      addPlannedWorkout,
      refreshData: fetchData,
      loadMoreWorkouts,
    }}>
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
