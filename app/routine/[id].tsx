import React from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import RoutineDetailScreen from '../../src/features/routines/RoutineDetailScreen';
import { useRoutines } from '../../src/features/routines/RoutinesContext';
import { Routine } from '../../src/types';

export default function RoutineDetailRoute() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { routines, saveRoutine } = useRoutines();
  
  // 새 루틴(id='new')인 경우 null 전달, 아니면 id로 찾기
  const routine = id === 'new' 
    ? null 
    : routines.find(r => r.id === Number(id)) || null;

  const handleSave = async (updatedRoutine: Routine) => {
    // Auto-save silently
    const saved = await saveRoutine(updatedRoutine, true);
    
    // If it was a new routine, redirect to the real ID so future saves are updates
    if (id === 'new' && saved?.id) {
      router.setParams({ id: saved.id.toString() });
    }
  };

  return (
    <RoutineDetailScreen 
      routine={routine} 
      onSave={handleSave} 
      onBack={() => router.back()} 
    />
  );
}
