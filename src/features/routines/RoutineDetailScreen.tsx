import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, TextInput, Alert, Platform, KeyboardAvoidingView, Pressable } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import DraggableFlatList, { ScaleDecorator, RenderItemParams } from 'react-native-draggable-flatlist';
import { Routine, Exercise } from '../../types';
import { styles } from './RoutineDetailScreen.styles';
import { Colors } from '../../colors';
import WebDraggableList from '../../shared/components/WebDraggableList';
import ExerciseEditor from '../../shared/components/ExerciseEditor';
import { confirm } from '../../shared/utils/confirm';
import { tempId } from '../../shared/utils/id';

interface RoutineDetailScreenProps {
  routine: Routine | null;
  onSave: (r: Routine) => Promise<Routine | void | undefined>;
  onBack: () => void;
}

export default function RoutineDetailScreen({ routine, onSave, onBack }: RoutineDetailScreenProps) {
  const insets = useSafeAreaInsets();
  const [name, setName] = useState(routine?.name || '');
  const [exercises, setExercises] = useState<Exercise[]>(routine?.exercises || []);
  
  const isMounted = useRef(false);
  const lastSavedState = useRef(JSON.stringify({ name: routine?.name || '', exercises: routine?.exercises || [] }));
  // DraggableFlatList는 제네릭 forwardRef 컴포넌트 — ref 타입 명시가 복잡하여 any로 수용.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const flatListRef = useRef<any>(null);

  useEffect(() => {
    if (routine) {
      if (routine.id !== (JSON.parse(lastSavedState.current).id || -1)) {
          // If ID changed, we might want to sync, but usually we just want to track the new ID
      }
    }
  }, [routine]);

  // Handle auto-save
  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true;
      return;
    }

    const currentState = JSON.stringify({ name, exercises });
    if (currentState === lastSavedState.current) return;

    const timer = setTimeout(async () => {
      if (!name.trim()) return;

      const routineToSave = {
        id: routine?.id || -1,
        name,
        exercises,
        tags: [],
      };

      await onSave(routineToSave);
      lastSavedState.current = JSON.stringify({ name, exercises });
    }, 1000);

    return () => clearTimeout(timer);
  }, [name, exercises, routine?.id, onSave]);

  const handleAddExercise = () => {
    const newEx: Exercise = {
      id: tempId(),
      name: 'New Exercise',
      category: 'General',
      type: 'Compound',
      sets: [{ id: 's1', weight: 0, reps: 0 }]
    };
    setExercises([...exercises, newEx]);
  };

  const deleteExercise = (id: string) => {
    setExercises(prev => prev.filter(ex => ex.id !== id));
  };

  const removeExercise = async (id: string) => {
    const ok = await confirm({
      title: '운동 삭제',
      message: '해당 운동을 삭제하시겠어요?',
      confirmLabel: '삭제',
      destructive: true,
    });
    if (ok) deleteExercise(id);
  };

  const updateExercise = (id: string, updates: Partial<Exercise>) => {
    setExercises(exercises.map(ex => ex.id === id ? { ...ex, ...updates } : ex));
  };

  const removeSet = (exId: string, setId: string) => {
    setExercises(exercises.map(ex => {
      if (ex.id === exId) {
        return {
          ...ex,
          sets: ex.sets.filter(s => s.id !== setId)
        };
      }
      return ex;
    }));
  };

  const updateSet = (exId: string, setId: string, updates: any) => {
    setExercises(exercises.map(ex => {
      if (ex.id === exId) {
        return {
          ...ex,
          sets: ex.sets.map(s => s.id === setId ? { ...s, ...updates } : s)
        };
      }
      return ex;
    }));
  };

  const handleSetInputChange = (exId: string, setId: string, field: 'weight' | 'reps', text: string) => {
    // Allow empty string to let user clear the input
    if (text === '') {
      updateSet(exId, setId, { [field]: 0 });
      return;
    }
    
    const val = Number(text);
    if (!isNaN(val)) {
      updateSet(exId, setId, { [field]: val });
    }
  };

  const updateSetCount = (exId: string, count: number) => {
    if (isNaN(count) || count < 0) return;
    
    setExercises(exercises.map(ex => {
      if (ex.id === exId) {
        const currentCount = ex.sets.length;
        let newSets = [...ex.sets];
        
        if (count > currentCount) {
          // Add sets
          for (let i = 0; i < count - currentCount; i++) {
            const lastSet = newSets.length > 0 ? newSets[newSets.length - 1] : { weight: 0, reps: 0 };
            newSets.push({
              id: tempId(),
              weight: lastSet.weight,
              reps: lastSet.reps
            });
          }
        } else if (count < currentCount) {
          // Remove sets from the end
          newSets = newSets.slice(0, count);
        }
        
        return { ...ex, sets: newSets };
      }
      return ex;
    }));
  };

  const handleManualSave = async () => {
    if (!name.trim()) {
      Alert.alert('오류', '루틴 이름을 입력해주세요.');
      return;
    }

    const routineToSave = {
      id: routine?.id || -1,
      name,
      exercises,
      tags: [],
    };

    await onSave(routineToSave);
    lastSavedState.current = JSON.stringify({ name, exercises });
    
    if (Platform.OS !== 'web') {
      Alert.alert('저장 완료', '루틴이 저장되었습니다.', [{ text: '확인' }]);
    }
  };

  const renderHeader = () => (
    <View style={styles.section}>
      <Text style={styles.label}>Routine Name</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g. Leg Day Blast"
        placeholderTextColor="#666"
        value={name}
        onChangeText={setName}
      />
      <View style={styles.divider} />
      <Text style={styles.label}>Exercise List ({exercises.length})</Text>
    </View>
  );

  const renderExerciseItem = ({ item, drag, isActive }: RenderItemParams<Exercise>) => {
    const dragHandle = (
      <TouchableOpacity
        style={[
          styles.reorderHandle,
          Platform.OS === 'web' && ({ cursor: isActive ? 'grabbing' : 'grab', touchAction: 'none' } as any),
        ]}
        onLongPress={Platform.OS === 'web' ? undefined : drag}
        onPressIn={Platform.OS === 'web' ? drag : undefined}
        delayLongPress={Platform.OS === 'web' ? 0 : 100}
        activeOpacity={0.7}
      >
        <Ionicons
          name="reorder-three"
          size={22}
          color={isActive ? Colors.primary : '#888'}
        />
      </TouchableOpacity>
    );

    return (
      <ScaleDecorator>
        <ExerciseEditor
          item={item}
          isActive={isActive}
          dragHandle={dragHandle}
          styles={styles}
          updateExercise={updateExercise}
          removeExercise={removeExercise}
          handleSetInputChange={handleSetInputChange}
          updateSetCount={updateSetCount}
          removeSet={removeSet}
        />
      </ScaleDecorator>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.iconButton}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{routine?.id ? 'Edit Routine' : 'New Routine'}</Text>
        <TouchableOpacity onPress={handleManualSave} style={styles.saveButton}>
          <Text style={styles.saveButtonText}>Save</Text>
        </TouchableOpacity>
      </View>

      {Platform.OS === 'web' ? (
        <WebDraggableList
          data={exercises}
          styles={styles}
          onDragEnd={(data) => setExercises(data)}
          updateExercise={updateExercise}
          removeExercise={removeExercise}
          handleSetInputChange={handleSetInputChange}
          updateSetCount={updateSetCount}
          removeSet={removeSet}
          ListHeaderComponent={renderHeader()}
          ListEmptyComponent={
            <View style={{ marginTop: 20 }}>
              <TouchableOpacity style={styles.emptyStateButton} onPress={handleAddExercise}>
                <Ionicons name="fitness" size={40} color="#666" />
                <Text style={styles.emptyStateText}>Add your first exercise</Text>
              </TouchableOpacity>
            </View>
          }
        />
      ) : (
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardAvoiding}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
        >
          <DraggableFlatList
            ref={flatListRef}
            data={exercises}
            onDragEnd={({ data }: { data: Exercise[] }) => setExercises(data)}
            keyExtractor={(item) => item.id}
            renderItem={renderExerciseItem}
            ListHeaderComponent={renderHeader()}
            ListEmptyComponent={
              <View style={{ marginTop: 20 }}>
                <TouchableOpacity style={styles.emptyStateButton} onPress={handleAddExercise}>
                  <Ionicons name="fitness" size={40} color="#666" />
                  <Text style={styles.emptyStateText}>Add your first exercise</Text>
                </TouchableOpacity>
              </View>
            }
            contentContainerStyle={{ 
              padding: 16, 
              paddingBottom: 350 
            }}
            keyboardShouldPersistTaps="always"
          />
        </KeyboardAvoidingView>
      )}

      {/* Floating Action Button for Add Exercise */}
      <View style={[styles.fabContainer, { bottom: 24 + insets.bottom }]}>
        <TouchableOpacity style={styles.fab} onPress={handleAddExercise}>
          <Ionicons name="add" size={24} color="#121212" />
          <Text style={styles.fabText}>Add Exercise</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
