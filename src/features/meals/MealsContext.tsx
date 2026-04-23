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
import { MealPlan, MealLog, MealType, MealItem } from '../../types';
import { useAuth } from '../auth/AuthContext';
import * as MealsApi from '../../api/meals';

interface MealsContextType {
  plan: MealPlan | null;
  /** key = `${date}:${meal_type}` */
  logs: Record<string, MealLog>;
  loading: boolean;
  /** Ensure an active plan exists. Creates an empty one if none. */
  ensurePlan: () => Promise<MealPlan>;
  refreshPlan: () => Promise<void>;
  updatePlan: (plan: MealPlan) => Promise<void>;
  loadLogs: (fromDate: string, toDate: string) => Promise<void>;
  getLog: (date: string, mealType: MealType) => MealLog | undefined;
  saveLog: (
    date: string,
    mealType: MealType,
    items: MealItem[],
    memo?: string | null,
  ) => Promise<void>;
  removeLog: (id: number) => Promise<void>;
}

const MealsContext = createContext<MealsContextType | undefined>(undefined);

const logKey = (date: string, mealType: MealType) => `${date}:${mealType}`;

export function MealsProvider({ children }: { children: React.ReactNode }) {
  const { publicUserId } = useAuth();
  const [plan, setPlan] = useState<MealPlan | null>(null);
  const [logs, setLogs] = useState<Record<string, MealLog>>({});
  const [loading, setLoading] = useState(true);

  // track which date ranges we've already fetched to avoid refetching
  const fetchedRangesRef = useRef<Set<string>>(new Set());

  const refreshPlan = useCallback(async () => {
    if (!publicUserId) {
      setPlan(null);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const p = await MealsApi.fetchActiveMealPlan(publicUserId);
      setPlan(p);
    } catch (e) {
      console.error('Error fetching meal plan:', e);
    } finally {
      setLoading(false);
    }
  }, [publicUserId]);

  useEffect(() => {
    refreshPlan();
    // reset caches when user changes
    setLogs({});
    fetchedRangesRef.current = new Set();
  }, [refreshPlan]);

  const ensurePlan = useCallback<MealsContextType['ensurePlan']>(async () => {
    if (plan) return plan;
    if (!publicUserId) throw new Error('Not authenticated');
    const created = await MealsApi.createDefaultMealPlan(publicUserId);
    setPlan(created);
    return created;
  }, [plan, publicUserId]);

  const updatePlan = useCallback<MealsContextType['updatePlan']>(
    async (next) => {
      const prev = plan;
      setPlan(next); // optimistic
      try {
        await MealsApi.updateMealPlan(next);
      } catch (e) {
        console.error('Error updating meal plan:', e);
        setPlan(prev);
        Alert.alert('Error', '식단 저장에 실패했습니다');
        throw e;
      }
    },
    [plan],
  );

  const loadLogs = useCallback<MealsContextType['loadLogs']>(
    async (fromDate, toDate) => {
      if (!publicUserId) return;
      const rangeKey = `${fromDate}:${toDate}`;
      if (fetchedRangesRef.current.has(rangeKey)) return;
      try {
        const rows = await MealsApi.fetchLogsInRange(publicUserId, fromDate, toDate);
        setLogs((prev) => {
          const next = { ...prev };
          rows.forEach((o) => {
            next[logKey(o.date, o.meal_type)] = o;
          });
          return next;
        });
        fetchedRangesRef.current.add(rangeKey);
      } catch (e) {
        console.error('Error loading meal logs:', e);
      }
    },
    [publicUserId],
  );

  const getLog = useCallback<MealsContextType['getLog']>(
    (date, mealType) => logs[logKey(date, mealType)],
    [logs],
  );

  const saveLog = useCallback<MealsContextType['saveLog']>(
    async (date, mealType, items, memo) => {
      if (!publicUserId) {
        Alert.alert('Error', '로그인이 필요합니다');
        return;
      }
      const key = logKey(date, mealType);
      const prevLog = logs[key];
      try {
        const saved = await MealsApi.upsertLog({
          id: prevLog?.id,
          user_id: publicUserId,
          date,
          meal_type: mealType,
          items,
          memo: memo ?? null,
        });
        setLogs((prev) => ({ ...prev, [key]: saved }));
      } catch (e) {
        console.error('Error saving meal log:', e);
        Alert.alert('Error', '식단 기록 저장에 실패했습니다');
        throw e;
      }
    },
    [publicUserId, logs],
  );

  const removeLog = useCallback<MealsContextType['removeLog']>(
    async (id) => {
      const entries = Object.entries(logs);
      const target = entries.find(([, v]) => v.id === id);
      if (!target) return;
      const [key, prevLog] = target;
      setLogs((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
      try {
        await MealsApi.deleteLogById(id);
      } catch (e) {
        console.error('Error deleting meal log:', e);
        setLogs((prev) => ({ ...prev, [key]: prevLog }));
        Alert.alert('Error', '식단 기록 삭제에 실패했습니다');
        throw e;
      }
    },
    [logs],
  );

  const value = useMemo<MealsContextType>(
    () => ({
      plan,
      logs,
      loading,
      ensurePlan,
      refreshPlan,
      updatePlan,
      loadLogs,
      getLog,
      saveLog,
      removeLog,
    }),
    [
      plan,
      logs,
      loading,
      ensurePlan,
      refreshPlan,
      updatePlan,
      loadLogs,
      getLog,
      saveLog,
      removeLog,
    ],
  );

  return <MealsContext.Provider value={value}>{children}</MealsContext.Provider>;
}

export function useMeals() {
  const ctx = useContext(MealsContext);
  if (!ctx) throw new Error('useMeals must be used within MealsProvider');
  return ctx;
}
