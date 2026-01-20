import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Modal, FlatList, Alert, Platform } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { useWorkout } from '../context/WorkoutContext';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { styles } from './CalendarScreen.styles';
import { supabase } from '../lib/supabase';

export default function CalendarScreen() {
  const { workouts, routines, addPlannedWorkout } = useWorkout();
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState('');
  const [modalVisible, setModalVisible] = useState(false);

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

  const markedDates = workouts.reduce((acc, workout) => {
    const date = workout.date.split('T')[0];
    acc[date] = { marked: true, dotColor: '#2196F3' };
    return acc;
  }, {} as any);

  if (selectedDate) {
    markedDates[selectedDate] = { 
      ...markedDates[selectedDate], 
      selected: true, 
      selectedColor: '#2196F3' 
    };
  }

  const selectedWorkouts = workouts.filter(
    w => w.date.split('T')[0] === selectedDate
  );

  const handleAddRoutine = () => {
    setModalVisible(true);
  };

  const selectRoutine = async (routineId: number) => {
    await addPlannedWorkout(selectedDate, routineId);
    setModalVisible(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Stronger</Text>
        <TouchableOpacity onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={24} color="white" />
        </TouchableOpacity>
      </View>
      <Calendar
        onDayPress={(day: any) => setSelectedDate(day.dateString)}
        markedDates={markedDates}
        theme={{
          backgroundColor: '#121212',
          calendarBackground: '#121212',
          textSectionTitleColor: '#b6c1cd',
          selectedDayBackgroundColor: '#2196F3',
          selectedDayTextColor: '#ffffff',
          todayTextColor: '#2196F3',
          dayTextColor: '#d9e1e8',
          textDisabledColor: '#2d4150',
          dotColor: '#2196F3',
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
