import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useMeals } from './MealsContext';
import { styles } from './MealPlanEditor.styles';
import {
  Weekday,
  MealType,
  MealItem,
  MealPlan,
  WEEKDAYS,
  WEEKDAY_LABEL,
  MEAL_TYPES,
  MEAL_TYPE_LABEL,
} from '../../types';
import { tempId } from '../../shared/utils/id';
import { Colors } from '../../colors';

export default function MealPlanEditor() {
  const router = useRouter();
  const { plan, updatePlan } = useMeals();
  const [draft, setDraft] = useState<MealPlan | null>(plan);
  const [selectedDay, setSelectedDay] = useState<Weekday>('mon');
  const lastSavedRef = useRef<string>(JSON.stringify(plan?.plan ?? {}));

  // keep draft synced when plan resolves after first render
  useEffect(() => {
    if (!draft && plan) {
      setDraft(plan);
      lastSavedRef.current = JSON.stringify(plan.plan);
    }
  }, [plan, draft]);

  // auto-save (1s debounce) — mirrors DailyDetailScreen pattern
  useEffect(() => {
    if (!draft) return;
    const now = JSON.stringify(draft.plan);
    if (now === lastSavedRef.current) return;
    const t = setTimeout(async () => {
      try {
        await updatePlan(draft);
        lastSavedRef.current = now;
      } catch {
        // Context already surfaced an Alert; keep draft for retry
      }
    }, 1000);
    return () => clearTimeout(t);
  }, [draft, updatePlan]);

  if (!draft) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  const setItems = (day: Weekday, mealType: MealType, items: MealItem[]) => {
    setDraft((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        plan: {
          ...prev.plan,
          [day]: {
            ...prev.plan[day],
            [mealType]: items,
          },
        },
      };
    });
  };

  const addItem = (day: Weekday, mealType: MealType) => {
    const items = draft.plan[day][mealType];
    setItems(day, mealType, [...items, { id: tempId(), text: '' }]);
  };

  const removeItem = (day: Weekday, mealType: MealType, itemId: string) => {
    const items = draft.plan[day][mealType].filter((i) => i.id !== itemId);
    setItems(day, mealType, items);
  };

  const updateItemText = (
    day: Weekday,
    mealType: MealType,
    itemId: string,
    text: string,
  ) => {
    const items = draft.plan[day][mealType].map((i) =>
      i.id === itemId ? { ...i, text } : i,
    );
    setItems(day, mealType, items);
  };

  const copyDayToWeekdays = (fromDay: Weekday) => {
    setDraft((prev) => {
      if (!prev) return prev;
      const source = prev.plan[fromDay];
      const targets: Weekday[] = ['mon', 'tue', 'wed', 'thu', 'fri'];
      const nextPlan = { ...prev.plan };
      targets.forEach((d) => {
        const cloned = {
          breakfast: source.breakfast.map((i) => ({ id: tempId(), text: i.text })),
          lunch: source.lunch.map((i) => ({ id: tempId(), text: i.text })),
          snack: source.snack.map((i) => ({ id: tempId(), text: i.text })),
          dinner: source.dinner.map((i) => ({ id: tempId(), text: i.text })),
        };
        nextPlan[d] = cloned;
      });
      return { ...prev, plan: nextPlan };
    });
  };

  const close = () => router.back();

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={close} style={styles.headerIconButton}>
          <Ionicons name="close" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>기본 식단 편집</Text>
        <TouchableOpacity onPress={close} style={styles.headerDoneButton}>
          <Text style={styles.headerDoneText}>완료</Text>
        </TouchableOpacity>
      </View>

      {/* Weekday selector */}
      <View style={styles.daySelector}>
        {WEEKDAYS.map((d) => (
          <TouchableOpacity
            key={d}
            style={[styles.dayButton, selectedDay === d && styles.dayButtonActive]}
            onPress={() => setSelectedDay(d)}
          >
            <Text
              style={[
                styles.dayButtonText,
                selectedDay === d && styles.dayButtonTextActive,
              ]}
            >
              {WEEKDAY_LABEL[d]}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        style={styles.body}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Copy to weekdays action */}
        {selectedDay !== 'sat' && selectedDay !== 'sun' && (
          <TouchableOpacity
            style={styles.copyButton}
            onPress={() => copyDayToWeekdays(selectedDay)}
          >
            <Ionicons name="copy-outline" size={16} color={Colors.primary} />
            <Text style={styles.copyButtonText}>
              {WEEKDAY_LABEL[selectedDay]}요일 식단을 평일(월~금)에 복사
            </Text>
          </TouchableOpacity>
        )}

        {MEAL_TYPES.map((mealType) => {
          const items = draft.plan[selectedDay][mealType];
          return (
            <View key={mealType} style={styles.section}>
              <Text style={styles.sectionTitle}>{MEAL_TYPE_LABEL[mealType]}</Text>
              {items.length === 0 && (
                <Text style={styles.sectionEmpty}>항목이 없습니다</Text>
              )}
              {items.map((item) => (
                <View key={item.id} style={styles.itemRow}>
                  <TextInput
                    style={styles.itemInput}
                    value={item.text}
                    placeholder="예: 단백이 치즈맛 1개"
                    placeholderTextColor={Colors.textSecondary}
                    onChangeText={(text) =>
                      updateItemText(selectedDay, mealType, item.id, text)
                    }
                  />
                  <TouchableOpacity
                    onPress={() => removeItem(selectedDay, mealType, item.id)}
                    style={styles.itemRemove}
                  >
                    <Ionicons name="close" size={18} color={Colors.danger} />
                  </TouchableOpacity>
                </View>
              ))}
              <TouchableOpacity
                style={styles.addItemButton}
                onPress={() => addItem(selectedDay, mealType)}
              >
                <Ionicons name="add" size={16} color={Colors.primary} />
                <Text style={styles.addItemText}>항목 추가</Text>
              </TouchableOpacity>
            </View>
          );
        })}

        <View style={styles.footerSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}
