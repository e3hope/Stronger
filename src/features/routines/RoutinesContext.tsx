import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { Alert } from 'react-native';
import { Routine } from '../../types';
import { useAuth } from '../auth/AuthContext';
import * as RoutinesApi from '../../api/routines';

interface RoutinesContextType {
  routines: Routine[];
  routineMap: Map<number, Routine>;
  loading: boolean;
  refresh: () => Promise<void>;
  saveRoutine: (routine: Routine, silent?: boolean) => Promise<Routine | undefined>;
  deleteRoutine: (id: number) => Promise<void>;
}

const RoutinesContext = createContext<RoutinesContextType | undefined>(undefined);

export function RoutinesProvider({ children }: { children: React.ReactNode }) {
  const { publicUserId } = useAuth();
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!publicUserId) {
      setRoutines([]);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const data = await RoutinesApi.fetchRoutines(publicUserId);
      setRoutines(data);
    } catch (e) {
      console.error('Error fetching routines:', e);
    } finally {
      setLoading(false);
    }
  }, [publicUserId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const saveRoutine = useCallback<RoutinesContextType['saveRoutine']>(
    async (routine, silent = false) => {
      if (!publicUserId) {
        Alert.alert('Error', '로그인이 필요하거나 사용자 정보를 불러올 수 없습니다.');
        return;
      }

      if (!silent) setLoading(true);
      try {
        const isNew = !routine.id || routine.id < 0;
        if (isNew) {
          const saved = await RoutinesApi.insertRoutine(publicUserId, routine);
          setRoutines(prev => [saved, ...prev]);
          return saved;
        } else {
          await RoutinesApi.updateRoutine(routine);
          setRoutines(prev => prev.map(r => (r.id === routine.id ? routine : r)));
          return routine;
        }
      } catch (e) {
        console.error('Error saving routine:', e);
        if (!silent) Alert.alert('Error', 'Failed to save routine');
        return undefined;
      } finally {
        if (!silent) setLoading(false);
      }
    },
    [publicUserId],
  );

  const deleteRoutine = useCallback<RoutinesContextType['deleteRoutine']>(
    async (id) => {
      if (!publicUserId) {
        Alert.alert('Error', '로그인이 필요합니다.');
        return;
      }

      setLoading(true);
      const prev = routines;
      try {
        await RoutinesApi.unlinkWorkoutLogsForRoutine(id);
        await RoutinesApi.deleteRoutineById(id);
        setRoutines(list => list.filter(r => r.id !== id));
      } catch (e) {
        console.error('Error deleting routine:', e);
        setRoutines(prev);
        Alert.alert(
          'Error',
          'Failed to delete routine: ' +
            (e instanceof Error ? e.message : JSON.stringify(e)),
        );
      } finally {
        setLoading(false);
      }
    },
    [publicUserId, routines],
  );

  const routineMap = useMemo(() => new Map(routines.map(r => [r.id, r])), [routines]);

  const value = useMemo<RoutinesContextType>(
    () => ({ routines, routineMap, loading, refresh, saveRoutine, deleteRoutine }),
    [routines, routineMap, loading, refresh, saveRoutine, deleteRoutine],
  );

  return <RoutinesContext.Provider value={value}>{children}</RoutinesContext.Provider>;
}

export function useRoutines() {
  const ctx = useContext(RoutinesContext);
  if (!ctx) throw new Error('useRoutines must be used within RoutinesProvider');
  return ctx;
}
