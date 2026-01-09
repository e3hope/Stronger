import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { useWorkout } from '../context/WorkoutContext';
import { useRouter } from 'expo-router';
import { styles } from './CalendarScreen.styles';

export default function CalendarScreen() {
  const { workouts } = useWorkout();
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState('');

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

  return (
    <View style={styles.container}>
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
            </TouchableOpacity>
          ))
        ) : (
          selectedDate && (
            <Text style={styles.emptyText}>운동 기록이 없습니다.</Text>
          )
        )}
      </ScrollView>
    </View>
  );
}
