import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Alert } from 'react-native';
import { Routine, WorkoutLog } from '../../types';
import { useAuth } from '../auth/AuthContext';
import { useRoutines } from '../routines/RoutinesContext';
import * as LogsApi from '../../api/workoutLogs';

interface WorkoutsContextType {
  workouts: WorkoutLog[];
  loading: boolean;
  hasMore: boolean;
  refresh: () => Promise<void>;
  loadMore: () => Promise<void>;
  addWorkout: (workout: WorkoutLog) => Promise<void>;
  updateWorkoutLog: (workout: WorkoutLog, silent?: boolean) => Promise<void>;
  deleteWorkoutLog: (id: number) => Promise<void>;
  addPlannedWorkout: (date: string, routineId: number) => Promise<void>;
}

const WorkoutsContext = createContext<WorkoutsContextType | undefined>(undefined);

const sortDesc = (list: WorkoutLog[]) =>
  [...list].sort((a, b) => (b.date || '').localeCompare(a.date || ''));

const computeVolume = (exercisesLog: any): number =>
  (exercisesLog || []).reduce((acc: number, ex: any) => {
    const exVolume = (ex.sets || []).reduce(
      (sAcc: number, s: any) => sAcc + (Number(s.weight) || 0) * (Number(s.reps) || 0),
      0,
    );
    return acc + exVolume;
  }, 0);

const toLog = (raw: any, routineMap: Map<number, Routine>): WorkoutLog => {
  const related = raw.routine_id != null ? routineMap.get(raw.routine_id) : undefined;
  return {
    id: raw.id,
    user_id: raw.user_id,
    routine_id: raw.routine_id,
    routineName: related ? related.name : '-',
    date: raw.performed_at,
    exercises: raw.exercises_log,
    duration: 60,
    volume: computeVolume(raw.exercises_log),
    prs: 0,
    memo: raw.memo,
  };
};

export function WorkoutsProvider({ children }: { children: React.ReactNode }) {
  const { publicUserId } = useAuth();
  const { routineMap } = useRoutines();
  const [workouts, setWorkouts] = useState<WorkoutLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);

  const routineMapRef = useRef(routineMap);
  useEffect(() => {
    routineMapRef.current = routineMap;
  }, [routineMap]);

  // 루틴 이름 변경 / 루틴 삭제를 기존 workouts에 반영
  useEffect(() => {
    setWorkouts(prev => {
      let mutated = false;
      const next = prev.map(w => {
        if (w.routine_id == null) return w;
        const r = routineMap.get(w.routine_id);
        if (!r) {
          if (w.routineName !== '-' || w.routine_id !== null) {
            mutated = true;
            return { ...w, routine_id: null, routineName: '-' };
          }
          return w;
        }
        if (w.routineName !== r.name) {
          mutated = true;
          return { ...w, routineName: r.name };
        }
        return w;
      });
      return mutated ? next : prev;
    });
  }, [routineMap]);

  const refresh = useCallback(async () => {
    if (!publicUserId) {
      setWorkouts([]);
      setHasMore(false);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const data = await LogsApi.fetchWorkoutLogs(publicUserId, 0);
      setWorkouts(data.map(l => toLog(l, routineMapRef.current)));
      setPage(0);
      setHasMore(data.length === LogsApi.WORKOUT_LOGS_PAGE_SIZE);
    } catch (e) {
      console.error('Error fetching workouts:', e);
    } finally {
      setLoading(false);
    }
  }, [publicUserId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const loadMore = useCallback(async () => {
    if (!hasMore || loading || !publicUserId) return;
    try {
      const nextPage = page + 1;
      const data = await LogsApi.fetchWorkoutLogs(publicUserId, nextPage);
      if (data.length > 0) {
        const newLogs = data.map(l => toLog(l, routineMapRef.current));
        setWorkouts(prev => [...prev, ...newLogs]);
        setPage(nextPage);
        setHasMore(data.length === LogsApi.WORKOUT_LOGS_PAGE_SIZE);
      } else {
        setHasMore(false);
      }
    } catch (e) {
      console.error('Error loading more workouts:', e);
    }
  }, [hasMore, loading, publicUserId, page]);

  const addWorkout = useCallback<WorkoutsContextType['addWorkout']>(
    async (workout) => {
      if (!publicUserId) {
        Alert.alert('Error', '로그인이 필요하거나 사용자 정보를 불러올 수 없습니다.');
        return;
      }
      setLoading(true);
      try {
        const row = await LogsApi.insertWorkoutLog(publicUserId, {
          routine_id: workout.routine_id || null,
          performed_at: workout.date,
          exercises_log: workout.exercises,
          memo: workout.memo,
        });
        if (row) {
          const newLog = toLog(row, routineMapRef.current);
          setWorkouts(prev => sortDesc([newLog, ...prev]));
        }
      } catch (e) {
        console.error('Error saving workout:', e);
        Alert.alert('Error', 'Failed to save workout');
      } finally {
        setLoading(false);
      }
    },
    [publicUserId],
  );

  const updateWorkoutLog = useCallback<WorkoutsContextType['updateWorkoutLog']>(
    async (workout, silent = false) => {
      if (!publicUserId) {
        Alert.alert('Error', '로그인이 필요합니다.');
        return;
      }
      if (!silent) setLoading(true);
      const prevList = workouts;
      try {
        await LogsApi.updateWorkoutLogRow(workout);
        setWorkouts(prev =>
          sortDesc(prev.map(w => (w.id === workout.id ? { ...w, ...workout } : w))),
        );
      } catch (e) {
        console.error('Error updating workout:', e);
        setWorkouts(prevList);
        if (!silent) Alert.alert('Error', 'Failed to update workout');
      } finally {
        if (!silent) setLoading(false);
      }
    },
    [publicUserId, workouts],
  );

  const deleteWorkoutLog = useCallback<WorkoutsContextType['deleteWorkoutLog']>(
    async (id) => {
      if (!publicUserId) {
        Alert.alert('Error', '로그인이 필요합니다.');
        return;
      }
      setLoading(true);
      const prevList = workouts;
      try {
        await LogsApi.deleteWorkoutLogById(id);
        setWorkouts(prev => prev.filter(w => w.id !== id));
      } catch (e) {
        console.error('Error deleting workout log:', e);
        setWorkouts(prevList);
        Alert.alert('Error', 'Failed to delete workout log');
      } finally {
        setLoading(false);
      }
    },
    [publicUserId, workouts],
  );

  const addPlannedWorkout = useCallback<WorkoutsContextType['addPlannedWorkout']>(
    async (date, routineId) => {
      if (!publicUserId) {
        Alert.alert('Error', '로그인이 필요합니다.');
        return;
      }
      const routine = routineMapRef.current.get(routineId);
      if (!routine) {
        Alert.alert('Error', 'Routine not found');
        return;
      }
      setLoading(true);
      try {
        let targetDate = date;
        if (!targetDate) {
          const now = new Date();
          const year = now.getFullYear();
          const month = String(now.getMonth() + 1).padStart(2, '0');
          const day = String(now.getDate()).padStart(2, '0');
          targetDate = `${year}-${month}-${day}`;
        }
        const row = await LogsApi.insertWorkoutLog(publicUserId, {
          routine_id: routineId,
          performed_at: targetDate,
          exercises_log: routine.exercises,
        });
        if (row) {
          const newLog = toLog(row, routineMapRef.current);
          setWorkouts(prev => sortDesc([newLog, ...prev]));
        }
      } catch (e) {
        console.error('Error adding planned workout:', e);
        Alert.alert('Error', 'Failed to add planned workout');
      } finally {
        setLoading(false);
      }
    },
    [publicUserId],
  );

  const value = useMemo<WorkoutsContextType>(
    () => ({
      workouts,
      loading,
      hasMore,
      refresh,
      loadMore,
      addWorkout,
      updateWorkoutLog,
      deleteWorkoutLog,
      addPlannedWorkout,
    }),
    [
      workouts,
      loading,
      hasMore,
      refresh,
      loadMore,
      addWorkout,
      updateWorkoutLog,
      deleteWorkoutLog,
      addPlannedWorkout,
    ],
  );

  return <WorkoutsContext.Provider value={value}>{children}</WorkoutsContext.Provider>;
}

export function useWorkouts() {
  const ctx = useContext(WorkoutsContext);
  if (!ctx) throw new Error('useWorkouts must be used within WorkoutsProvider');
  return ctx;
}
