import React from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import RoutineDetailScreen from '../../src/screens/RoutineDetailScreen';
import { useWorkout } from '../../src/context/WorkoutContext';
import { Routine } from '../../src/types';

export default function RoutineDetailRoute() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { routines, saveRoutine } = useWorkout();
  
  // 새 루틴(id='new')인 경우 null 전달, 아니면 id로 찾기
  const routine = id === 'new' 
    ? null 
    : routines.find(r => r.id === id) || null;

  const handleSave = (updatedRoutine: Routine) => {
    saveRoutine(updatedRoutine);
    router.back();
  };

  return (
    <RoutineDetailScreen 
      routine={routine} 
      onSave={handleSave} 
      onBack={() => router.back()} 
    />
  );
}
