import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Modal, FlatList, Alert, Platform } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { useWorkout } from '../context/WorkoutContext';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { styles } from './CalendarScreen.styles';
import { supabase } from '../lib/supabase';
import { Colors } from '../colors';

export default function CalendarScreen() {
  const { workouts, routines, addPlannedWorkout } = useWorkout();
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());

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
    await addPlannedWorkout(selectedDate, routineId);
    setModalVisible(false);
  };

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth() + 1;
  const currentMonthString = `${year}-${String(month).padStart(2, '0')}-01`;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Stronger</Text>
        <TouchableOpacity onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={24} color="white" />
        </TouchableOpacity>
      </View>

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
          
          let textColor = '#d9e1e8'; // Default
          if (isDisabled) {
            textColor = '#2d4150';
          } else {
            if (day === 0) textColor = '#ff4444'; // Sun
            else if (day === 6) textColor = '#448AFF'; // Sat
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
          dayTextColor: '#d9e1e8',
          textDisabledColor: '#2d4150',
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
              <Text style={styles.routineName}>{workout.routineName}</Text>
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
    </View>
  );
}
