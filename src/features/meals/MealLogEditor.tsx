import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useMeals } from './MealsContext';
import { styles } from './MealLogEditor.styles';
import {
  MealType,
  MealItem,
  MealStatus,
  Weekday,
  MEAL_TYPE_LABEL,
  WEEKDAY_LABEL,
  computeMealAchievement,
} from '../../types';
import { tempId } from '../../shared/utils/id';
import { confirm } from '../../shared/utils/confirm';
import { Colors } from '../../colors';

function weekdayFromDate(dateStr: string): Weekday {
  const d = new Date(dateStr + 'T00:00:00');
  const day = d.getDay(); // 0=Sun..6=Sat
  const map: Weekday[] = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
  return map[day];
}

function formatDate(dateStr: string): string {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T00:00:00');
  const wd = weekdayFromDate(dateStr);
  return `${d.getMonth() + 1}월 ${d.getDate()}일 (${WEEKDAY_LABEL[wd]})`;
}

export default function MealLogEditor() {
  const router = useRouter();
  const params = useLocalSearchParams<{ date: string; type: string }>();
  const dateStr = (params.date ?? '') as string;
  const mealType = (params.type ?? 'breakfast') as MealType;

  const { plan, getLog, saveLog, removeLog } = useMeals();

  // Initial items = existing log OR template copy
  // (snapshot once on mount to avoid fighting with live context updates)
  const initial = useMemo<{ items: MealItem[]; memo: string }>(() => {
    const existing = getLog(dateStr, mealType);
    if (existing) {
      return { items: existing.items, memo: existing.memo ?? '' };
    }
    const wd = weekdayFromDate(dateStr);
    const templateItems = plan?.plan?.[wd]?.[mealType] ?? [];
    return {
      items: templateItems.map((i) => ({
        id: tempId(),
        text: i.text,
        status: null,
      })),
      memo: '',
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [items, setItems] = useState<MealItem[]>(initial.items);
  const [memo, setMemo] = useState<string>(initial.memo);
  const lastSavedRef = useRef<string>(JSON.stringify(initial));
  const deletedRef = useRef(false);

  // auto-save 1s debounce (skip if user chose "reset to template")
  useEffect(() => {
    if (deletedRef.current) return;
    const current = JSON.stringify({ items, memo });
    if (current === lastSavedRef.current) return;
    const t = setTimeout(async () => {
      try {
        await saveLog(dateStr, mealType, items, memo.trim() ? memo : null);
        lastSavedRef.current = current;
      } catch {
        // Context already surfaced an Alert; keep local state for retry
      }
    }, 1000);
    return () => clearTimeout(t);
  }, [items, memo, dateStr, mealType, saveLog]);

  const close = () => router.back();

  const handleResetToTemplate = async () => {
    const ok = await confirm({
      title: '기본값으로 되돌리기',
      message: '이 끼니의 기록을 지우고 기본 식단으로 되돌립니다.',
      confirmLabel: '되돌리기',
      destructive: true,
    });
    if (!ok) return;
    deletedRef.current = true;
    const existing = getLog(dateStr, mealType);
    if (existing) {
      try {
        await removeLog(existing.id);
      } catch {
        // ignore (Alert already shown)
      }
    }
    close();
  };

  const addItem = () =>
    setItems((prev) => [...prev, { id: tempId(), text: '', status: null }]);
  const removeItemAt = (id: string) =>
    setItems((prev) => prev.filter((i) => i.id !== id));
  const updateItem = (id: string, text: string) =>
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, text } : i)));
  /** Toggle status: same value again → null (uncheck). */
  const toggleStatus = (id: string, value: MealStatus) =>
    setItems((prev) =>
      prev.map((i) =>
        i.id === id ? { ...i, status: i.status === value ? null : value } : i,
      ),
    );

  const achievement = useMemo(() => computeMealAchievement(items), [items]);
  const hasExisting = Boolean(getLog(dateStr, mealType));

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={close} style={styles.headerIconButton}>
          <Ionicons name="close" size={24} color={Colors.text} />
        </TouchableOpacity>
        <View style={styles.headerTitleWrapper}>
          <Text style={styles.headerTitle}>{MEAL_TYPE_LABEL[mealType]}</Text>
          <Text style={styles.headerSubtitle}>{formatDate(dateStr)}</Text>
        </View>
        <TouchableOpacity onPress={close} style={styles.headerDoneButton}>
          <Text style={styles.headerDoneText}>완료</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.body}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.sectionTitle}>항목</Text>
        {items.length === 0 && (
          <Text style={styles.sectionEmpty}>항목이 없습니다</Text>
        )}
        {items.map((item) => {
          const isOk = item.status === 'ok';
          const isSkip = item.status === 'skip';
          return (
            <View key={item.id} style={styles.itemRow}>
              <TextInput
                style={styles.itemInput}
                value={item.text}
                placeholder="예: 단백이 치즈맛 1개"
                placeholderTextColor={Colors.textSecondary}
                onChangeText={(text) => updateItem(item.id, text)}
              />
              <View style={styles.statusToggleGroup}>
                <TouchableOpacity
                  style={[styles.statusButton, isOk && styles.statusButtonOkActive]}
                  onPress={() => toggleStatus(item.id, 'ok')}
                >
                  <Text
                    style={[
                      styles.statusButtonText,
                      isOk && styles.statusButtonTextOkActive,
                    ]}
                  >
                    O
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.statusButton, isSkip && styles.statusButtonSkipActive]}
                  onPress={() => toggleStatus(item.id, 'skip')}
                >
                  <Text
                    style={[
                      styles.statusButtonText,
                      isSkip && styles.statusButtonTextSkipActive,
                    ]}
                  >
                    X
                  </Text>
                </TouchableOpacity>
              </View>
              <TouchableOpacity
                onPress={() => removeItemAt(item.id)}
                style={styles.itemRemove}
              >
                <Ionicons name="close" size={18} color={Colors.danger} />
              </TouchableOpacity>
            </View>
          );
        })}
        <TouchableOpacity style={styles.addItemButton} onPress={addItem}>
          <Ionicons name="add" size={16} color={Colors.primary} />
          <Text style={styles.addItemText}>항목 추가</Text>
        </TouchableOpacity>

        {items.length > 0 && (
          <View
            style={[
              styles.achievementCard,
              achievement.complete && styles.achievementCardComplete,
            ]}
          >
            <Text style={styles.achievementTitle}>달성률</Text>
            <View style={styles.achievementRow}>
              {achievement.complete && achievement.rate !== null ? (
                <>
                  <Text style={styles.achievementRate}>{achievement.rate}%</Text>
                  <Text style={styles.achievementDetail}>
                    O {achievement.ok} / 전체 {achievement.total}
                  </Text>
                </>
              ) : (
                <>
                  <Text style={styles.achievementProgress}>
                    {achievement.checked} / {achievement.total} 체크됨
                  </Text>
                  <Text style={styles.achievementDetail}>
                    모두 체크하면 달성률이 표시됩니다
                  </Text>
                </>
              )}
            </View>
          </View>
        )}

        <Text style={styles.sectionTitle}>메모</Text>
        <TextInput
          style={styles.memoInput}
          multiline
          placeholder="메모를 입력하세요 (선택)"
          placeholderTextColor={Colors.textSecondary}
          value={memo}
          onChangeText={setMemo}
        />

        {hasExisting && (
          <TouchableOpacity style={styles.resetButton} onPress={handleResetToTemplate}>
            <Ionicons name="refresh" size={16} color={Colors.danger} />
            <Text style={styles.resetButtonText}>기본값으로 되돌리기</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
