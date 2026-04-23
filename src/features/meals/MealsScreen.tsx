import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useMeals } from './MealsContext';
import { styles } from './MealsScreen.styles';
import { Colors } from '../../colors';
import {
  MEAL_TYPES,
  WEEKDAYS,
  MEAL_TYPE_LABEL,
  WEEKDAY_LABEL,
  MealType,
  Weekday,
  MealItem,
  computeMealAchievement,
  MealAchievement,
} from '../../types';

function startOfWeek(d: Date): Date {
  const x = new Date(d);
  const day = x.getDay(); // 0=Sun, 1=Mon, ..., 6=Sat
  const offset = (day + 6) % 7; // 0 when Monday
  x.setDate(x.getDate() - offset);
  x.setHours(0, 0, 0, 0);
  return x;
}

function addDays(d: Date, n: number): Date {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}

function toYMD(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function formatRange(start: Date, end: Date): string {
  const fmt = (d: Date) => `${d.getMonth() + 1}/${d.getDate()}`;
  return `${fmt(start)} – ${fmt(end)}`;
}

interface CellContent {
  items: MealItem[];
  logged: boolean;
  achievement: MealAchievement;
}

export default function MealsScreen() {
  const router = useRouter();
  const { plan, loading, ensurePlan, loadLogs, getLog } = useMeals();
  const [weekStart, setWeekStart] = useState<Date>(() => startOfWeek(new Date()));
  const todayYMD = useMemo(() => toYMD(new Date()), []);

  const weekDates = useMemo(
    () => WEEKDAYS.map((_, i) => addDays(weekStart, i)),
    [weekStart],
  );
  const weekEnd = useMemo(() => addDays(weekStart, 6), [weekStart]);

  useEffect(() => {
    loadLogs(toYMD(weekStart), toYMD(weekEnd));
  }, [weekStart, weekEnd, loadLogs]);

  const goPrevWeek = () => setWeekStart((prev) => addDays(prev, -7));
  const goNextWeek = () => setWeekStart((prev) => addDays(prev, 7));

  const handleEditPlan = async () => {
    try {
      await ensurePlan();
      router.push('/meal-plan/edit');
    } catch (e) {
      console.error(e);
    }
  };

  const handleCellPress = (date: string, mealType: MealType) => {
    router.push(`/meal-log/${date}/${mealType}`);
  };

  const getCellContent = (
    weekday: Weekday,
    date: string,
    mealType: MealType,
  ): CellContent => {
    const log = getLog(date, mealType);
    if (log) {
      return {
        items: log.items,
        logged: true,
        achievement: computeMealAchievement(log.items),
      };
    }
    const templateItems = plan?.plan?.[weekday]?.[mealType] ?? [];
    return {
      items: templateItems,
      logged: false,
      achievement: computeMealAchievement([]),
    };
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="restaurant-outline" size={56} color={Colors.textSecondary} />
      <Text style={styles.emptyTitle}>식단 계획이 없습니다</Text>
      <Text style={styles.emptySubtitle}>
        기본 식단표를 한 번 입력해두면{'\n'}매주 자동으로 반복됩니다.
      </Text>
      <TouchableOpacity style={styles.emptyCta} onPress={handleEditPlan}>
        <Ionicons name="add" size={20} color={Colors.background} />
        <Text style={styles.emptyCtaText}>기본 식단 만들기</Text>
      </TouchableOpacity>
    </View>
  );

  const renderBadge = (cell: CellContent) => {
    if (!cell.logged) return null;
    const { complete, rate, checked, total } = cell.achievement;
    if (complete && rate !== null) {
      return (
        <View style={styles.rateBadge}>
          <Text style={styles.rateBadgeText}>{rate}%</Text>
        </View>
      );
    }
    if (checked > 0 && checked < total) {
      return (
        <View style={styles.progressBadge}>
          <Text style={styles.progressBadgeText}>{checked}/{total}</Text>
        </View>
      );
    }
    return null;
  };

  const renderItemLine = (item: MealItem) => {
    const dotStyle = [
      styles.statusDot,
      item.status === 'ok' && styles.statusDotOk,
      item.status === 'skip' && styles.statusDotSkip,
    ];
    const textStyle = [
      styles.dayCellText,
      item.status === 'skip' && styles.dayCellTextSkip,
    ];
    return (
      <View key={item.id} style={styles.itemLineRow}>
        {item.status ? (
          <View style={dotStyle} />
        ) : (
          <View style={styles.statusDotSpacer} />
        )}
        <Text style={textStyle} numberOfLines={2}>
          {item.text}
        </Text>
      </View>
    );
  };

  const renderGrid = () => (
    <ScrollView style={styles.gridWrapper} showsVerticalScrollIndicator={false}>
      {/* Day header row */}
      <View style={styles.dayHeaderRow}>
        <View style={styles.dayHeaderCorner} />
        {WEEKDAYS.map((wd, i) => {
          const date = weekDates[i];
          const ymd = toYMD(date);
          const isToday = ymd === todayYMD;
          const dayLabelStyle = [
            styles.dayHeaderText,
            wd === 'sun' && styles.dayHeaderSunday,
            wd === 'sat' && styles.dayHeaderSaturday,
            isToday && styles.dayHeaderToday,
          ];
          return (
            <View key={wd} style={styles.dayHeaderCell}>
              <Text style={dayLabelStyle}>{WEEKDAY_LABEL[wd]}</Text>
              <Text style={[styles.dayHeaderDateText, isToday && styles.dayHeaderToday]}>
                {date.getDate()}
              </Text>
            </View>
          );
        })}
      </View>

      {/* Meal type rows */}
      {MEAL_TYPES.map((mealType) => (
        <View key={mealType} style={styles.mealRow}>
          <View style={styles.mealTypeCell}>
            <Text style={styles.mealTypeText}>{MEAL_TYPE_LABEL[mealType]}</Text>
          </View>
          {WEEKDAYS.map((wd, i) => {
            const date = weekDates[i];
            const ymd = toYMD(date);
            const cell = getCellContent(wd, ymd, mealType);
            return (
              <TouchableOpacity
                key={wd}
                style={[styles.dayCell, cell.logged && styles.dayCellLogged]}
                onPress={() => handleCellPress(ymd, mealType)}
                activeOpacity={0.7}
              >
                <View style={styles.dayCellBadgeRow}>{renderBadge(cell)}</View>
                {cell.items.length === 0 ? (
                  <Text style={styles.dayCellEmptyText}>-</Text>
                ) : (
                  cell.items.map(renderItemLine)
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      ))}
    </ScrollView>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>식단</Text>
        <View style={styles.weekNav}>
          <TouchableOpacity style={styles.weekNavButton} onPress={goPrevWeek}>
            <Ionicons name="chevron-back" size={18} color={Colors.text} />
          </TouchableOpacity>
          <Text style={styles.weekRangeText}>{formatRange(weekStart, weekEnd)}</Text>
          <TouchableOpacity style={styles.weekNavButton} onPress={goNextWeek}>
            <Ionicons name="chevron-forward" size={18} color={Colors.text} />
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.editButton} onPress={handleEditPlan}>
          <Ionicons name="pencil" size={18} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      {loading && !plan ? (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : !plan ? (
        renderEmpty()
      ) : (
        renderGrid()
      )}
    </SafeAreaView>
  );
}
