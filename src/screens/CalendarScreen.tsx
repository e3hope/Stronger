import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Modal, FlatList, Alert, Platform, ActivityIndicator } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { useWorkout } from '../context/WorkoutContext';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { styles } from './CalendarScreen.styles';
import { supabase } from '../lib/supabase';
import { Colors } from '../colors';

export default function CalendarScreen() {
  const { workouts, routines, addPlannedWorkout, deleteWorkoutLog, loadMoreWorkouts, hasMore, loading } = useWorkout();
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');

  const changeMonth = (increment: number) => {
    const newDate = new Date(currentMonth);
    newDate.setMonth(newDate.getMonth() + increment);
    setCurrentMonth(newDate);
  };

  const performLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        Alert.alert('로그아웃 오류', error.message);
      }
      // Force navigation to login
      router.replace('/login');
    } catch (err) {
      console.error('Logout error:', err);
      router.replace('/login');
    }
  };

  const handleLogout = () => {
    if (Platform.OS === 'web') {
      // @ts-ignore
      if (window.confirm('정말 로그아웃 하시겠습니까?')) {
        performLogout();
      }
    } else {
      Alert.alert('로그아웃', '정말 로그아웃 하시겠습니까?', [
        { text: '취소', style: 'cancel' },
        {
          text: '로그아웃',
          style: 'destructive',
          onPress: performLogout,
        },
      ]);
    }
  };
  
  const handleDeleteWorkout = async (id: number) => {
    const performDelete = async () => {
      await deleteWorkoutLog(id);
    };

    if (Platform.OS === 'web') {
      // @ts-ignore
      if (window.confirm('이 운동 기록을 삭제하시겠습니까?')) {
        performDelete();
      }
    } else {
      Alert.alert('기록 삭제', '이 운동 기록을 삭제하시겠습니까?', [
        { text: '취소', style: 'cancel' },
        { text: '삭제', style: 'destructive', onPress: performDelete }
      ]);
    }
  };

  // Merge workouts into markedDates
  const markedDates: any = {};

  workouts.forEach(workout => {
    const date = workout.date.split('T')[0];
    markedDates[date] = { 
      marked: true, 
      dotColor: Colors.primary 
    };
  });

  if (selectedDate) {
    markedDates[selectedDate] = { 
      ...markedDates[selectedDate], 
      selected: true, 
      selectedColor: Colors.primary 
    };
  }

  const selectedWorkouts = workouts.filter(
    w => w.date.split('T')[0] === selectedDate
  );

  const handleAddRoutine = () => {
    if (routines.length === 0) {
      if (Platform.OS === 'web') {
        // @ts-ignore
        if (window.confirm('저장된 루틴이 없습니다. 루틴을 추가하시겠습니까?')) {
          router.push('/routines');
        }
      } else {
        Alert.alert(
          '루틴 없음',
          '저장된 루틴이 없습니다.\n루틴을 추가하시겠습니까?',
          [
            { text: '취소', style: 'cancel' },
            {
              text: '이동',
              onPress: () => router.push('/routines'),
            },
          ]
        );
      }
      return;
    }
    setModalVisible(true);
  };

  const selectRoutine = async (routineId: number) => {
    setModalVisible(false);
    await addPlannedWorkout(selectedDate, routineId);
  };

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth() + 1;
  const currentMonthString = `${year}-${String(month).padStart(2, '0')}-01`;

  return (
    <View style={viewMode === 'list' ? styles.containerListMode : styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Stronger</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={() => setViewMode(prev => prev === 'calendar' ? 'list' : 'calendar')}>
            <Ionicons name={viewMode === 'calendar' ? "list" : "calendar"} size={24} color="white" />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      {viewMode === 'calendar' ? (
        <>
          <Calendar
            current={currentMonthString}
            onDayPress={(day: any) => setSelectedDate(day.dateString)}
            onMonthChange={(month: any) => {
              setCurrentMonth(new Date(month.dateString));
            }}
            markedDates={markedDates}
            dayComponent={({date, state, marking}: any) => {
              if (!date) return <View />;
              
              const jsDate = new Date(date.year, date.month - 1, date.day);
              const day = jsDate.getDay();
              const isSelected = state === 'selected' || (marking && marking.selected);
              const isToday = state === 'today';
              const hasWorkout = marking && marking.marked;
              const isDisabled = state === 'disabled';
              
              let textColor = Colors.calendarTextDefault; // Default
              if (isDisabled) {
                textColor = Colors.calendarTextDisabled;
              } else {
                if (day === 0) textColor = Colors.danger; // Sun
                else if (day === 6) textColor = Colors.calendarSaturday; // Sat
              }
              
              if (isToday) textColor = Colors.primary;
              if (isSelected) textColor = 'white';

              return (
                <TouchableOpacity 
                  onPress={() => setSelectedDate(date.dateString)} 
                  style={{alignItems: 'center', justifyContent: 'center', width: 32, height: 32}}
                >
                  <View style={[
                    {width: 30, height: 30, alignItems: 'center', justifyContent: 'center', borderRadius: 15},
                    isSelected && {backgroundColor: Colors.primary}
                  ]}>
                    <Text style={{color: textColor, fontWeight: isToday ? 'bold' : 'normal'}}>{date.day}</Text>
                  </View>
                  {hasWorkout && !isSelected && (
                    <View style={{width: 4, height: 4, borderRadius: 2, backgroundColor: Colors.primary, marginTop: 2}} />
                  )}
                  {hasWorkout && isSelected && (
                    <View style={{width: 4, height: 4, borderRadius: 2, backgroundColor: 'white', marginTop: 2}} />
                  )}
                </TouchableOpacity>
              );
            }}
            theme={{
              backgroundColor: '#121212',
              calendarBackground: '#121212',
              textSectionTitleColor: '#b6c1cd',
              selectedDayBackgroundColor: Colors.primary,
              selectedDayTextColor: '#ffffff',
              todayTextColor: Colors.primary,
              dayTextColor: Colors.calendarTextDefault,
              textDisabledColor: Colors.calendarTextDisabled,
              dotColor: Colors.primary,
              selectedDotColor: '#ffffff',
              arrowColor: 'white',
              monthTextColor: 'white',
              indicatorColor: 'white',
            }}
          />
          
          <ScrollView style={styles.workoutList}>
            <Text style={styles.dateTitle}>
              {selectedDate ? selectedDate : '날짜를 선택하세요'}
            </Text>
            
            {selectedWorkouts.length > 0 ? (
              selectedWorkouts.map(workout => (
                <TouchableOpacity 
                  key={workout.id} 
                  style={styles.workoutCard}
                  onPress={() => {
                    router.push(`/daily/${workout.id}`);
                  }}
                >
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Text style={styles.routineName}>{workout.routineName}</Text>
                    <TouchableOpacity 
                      onPress={(e) => {
                        e.stopPropagation();
                        handleDeleteWorkout(workout.id);
                      }}
                      style={{ padding: 4, marginTop: -4, marginRight: -4 }}
                    >
                      <Ionicons name="trash-outline" size={20} color="#ff4444" />
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.workoutStats}>
                    Volume: {workout.volume}kg • PRs: {workout.prs}
                  </Text>
                  {workout.memo ? (
                    <Text style={styles.memoText} numberOfLines={2}>
                      {workout.memo}
                    </Text>
                  ) : null}
                </TouchableOpacity>
              ))
            ) : (
              selectedDate && (
                <Text style={styles.emptyText}>운동 기록이 없습니다.</Text>
              )
            )}

            {selectedDate ? (
              <TouchableOpacity style={styles.addButton} onPress={handleAddRoutine}>
                <Ionicons name="add-circle" size={24} color="white" />
                <Text style={styles.addButtonText}>루틴 추가하기</Text>
              </TouchableOpacity>
            ) : null}
          </ScrollView>
        </>
      ) : (
        <>
          <FlatList
            data={[...workouts].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())}
            keyExtractor={item => item.id.toString()}
            contentContainerStyle={styles.listContainer}
            onEndReached={loadMoreWorkouts}
            onEndReachedThreshold={0.5}
            renderItem={({ item }) => {
              const dateObj = new Date(item.date);
              const year = dateObj.getFullYear();
              const month = dateObj.getMonth() + 1;
              const day = dateObj.getDate();
              const days = ['일', '월', '화', '수', '목', '금', '토'];
              const weekDay = days[dateObj.getDay()];
              const dateStr = `${year}. ${month}. ${day} (${weekDay})`;
              
              return (
                <TouchableOpacity 
                  style={styles.listCard}
                  onPress={() => router.push(`/daily/${item.id}`)}
                >
                  <View style={styles.listCardHeader}>
                    <Text style={styles.listDate}>
                      {dateStr}
                    </Text>
                  </View>
                  
                  <Text style={styles.listTitle}>{item.routineName || 'No Routine Name'}</Text>
                  
                  <View style={styles.listContent}>
                    {item.exercises.map((ex, idx) => (
                      <View key={idx} style={styles.listExerciseRow}>
                        <View style={styles.bulletPoint} />
                        <View style={{flex: 1}}>
                          <Text style={styles.listExerciseText}>
                            <Text style={styles.boldText}>{ex.name}</Text>
                            {ex.sets.length > 0 && <Text style={{color: Colors.textSecondary}}> {ex.sets.length}sets</Text>}
                          </Text>
                          <Text style={[styles.listExerciseText, { marginTop: 2 }]}>
                            {ex.sets.map(s => `${s.weight}kg ${s.reps}회`).join(' * ')}
                          </Text>
                        </View>
                      </View>
                    ))}
                  </View>

                  {item.memo ? (
                    <>
                      <View style={styles.divider} />
                      <Text style={styles.listMemo} numberOfLines={2}>
                        "{item.memo}"
                      </Text>
                    </>
                  ) : null}
                </TouchableOpacity>
              );
            }}
            ListEmptyComponent={
              <Text style={styles.emptyText}>저장된 운동 기록이 없습니다.</Text>
            }
          />
          
          <TouchableOpacity style={styles.fab} onPress={handleAddRoutine}>
            <Ionicons name="add" size={30} color="#000" />
          </TouchableOpacity>
        </>
      )}

      {/* Routine Selection Modal */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>루틴 선택</Text>
            <FlatList
              data={routines}
              keyExtractor={item => item.id.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity 
                  style={styles.modalItem}
                  onPress={() => selectRoutine(item.id)}
                >
                  <Text style={styles.modalItemText}>{item.name}</Text>
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>닫기</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Loading Overlay */}
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      )}
    </View>
  );
}
