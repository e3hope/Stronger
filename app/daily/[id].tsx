import React from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import DailyDetailScreen from '../../src/features/workouts/DailyDetailScreen';
import { useWorkouts } from '../../src/features/workouts/WorkoutsContext';

export default function DailyDetailRoute() {
  const { id } = useLocalSearchParams(); // 여기서는 id가 dateString일 수도 있고 workoutId일 수도 있음
  const router = useRouter();
  const { workouts, updateWorkoutLog, deleteWorkoutLog, loading } = useWorkouts();
  
  // id가 workout.id라고 가정하고 찾기
  const workout = workouts.find(w => w.id === Number(id)) || null;

  return (
    <DailyDetailScreen 
      workout={workout} 
      onBack={() => router.back()} 
      onUpdate={updateWorkoutLog}
      onDelete={deleteWorkoutLog}
      loading={loading}
    />
  );
}
