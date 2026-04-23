import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, TextInput, Alert, Platform, KeyboardAvoidingView, Pressable, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DraggableFlatList, { ScaleDecorator, RenderItemParams } from 'react-native-draggable-flatlist';
import { WorkoutLog, Exercise } from '../../types';
import { styles } from './DailyDetailScreen.styles';
import { Colors } from '../../colors';
import WebDraggableList from '../../shared/components/WebDraggableList';
import ExerciseEditor from '../../shared/components/ExerciseEditor';
import { confirm } from '../../shared/utils/confirm';
import { tempId } from '../../shared/utils/id';

interface DailyDetailScreenProps {
  workout: WorkoutLog | null;
  onBack: () => void;
  onUpdate?: (workout: WorkoutLog, silent?: boolean) => Promise<void>;
  onDelete?: (id: number) => Promise<void>;
  loading?: boolean;
}

export default function DailyDetailScreen({ workout, onBack, onUpdate, onDelete, loading }: DailyDetailScreenProps) {
  if (!workout) return null;

  const [editedWorkout, setEditedWorkout] = useState<WorkoutLog>(workout);
  const memoInputRef = useRef<TextInput>(null);
  // DraggableFlatList는 제네릭 forwardRef 컴포넌트 — ref 타입 명시가 복잡하여 any로 수용.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const flatListRef = useRef<any>(null);
  const memoLayoutY = useRef<number>(0);
  
  const isMounted = useRef(false);
  const lastSavedState = useRef(JSON.stringify(workout));

  useEffect(() => {
    if (workout) {
      if (workout.id !== editedWorkout.id) {
          setEditedWorkout(workout);
          lastSavedState.current = JSON.stringify(workout);
      }
    }
  }, [workout]);

  // Auto-save
  useEffect(() => {
      if (!isMounted.current) {
          isMounted.current = true;
          return;
      }
      
      const currentState = JSON.stringify(editedWorkout);
      if (currentState === lastSavedState.current) return;

      const timer = setTimeout(async () => {
          if (onUpdate) {
              await onUpdate(editedWorkout, true);
              lastSavedState.current = currentState;
          }
      }, 1000);

      return () => clearTimeout(timer);
  }, [editedWorkout, onUpdate]);


  const dateObj = new Date(editedWorkout.date);
  const year = dateObj.getFullYear();
  const month = dateObj.getMonth() + 1;
  const day = dateObj.getDate();
  const days = ['일', '월', '화', '수', '목', '금', '토'];
  const weekDay = days[dateObj.getDay()];
  const dateStr = `${year}. ${month}. ${day} (${weekDay})`;

  // --- Editing Logic ---

  const handleAddExercise = () => {
    const newEx: Exercise = {
      id: tempId(),
      name: 'New Exercise',
      category: 'General',
      type: 'Compound',
      sets: [{ id: 's1', weight: 0, reps: 0 }]
    };
    setEditedWorkout(prev => ({
      ...prev,
      exercises: [...prev.exercises, newEx]
    }));
  };

  const deleteExercise = (id: string) => {
    setEditedWorkout(prev => ({
      ...prev,
      exercises: prev.exercises.filter(ex => ex.id !== id)
    }));
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
    setEditedWorkout(prev => ({
      ...prev,
      exercises: prev.exercises.map(ex => ex.id === id ? { ...ex, ...updates } : ex)
    }));
  };

  const removeSet = (exId: string, setId: string) => {
    setEditedWorkout(prev => ({
      ...prev,
      exercises: prev.exercises.map(ex => {
        if (ex.id === exId) {
          return {
            ...ex,
            sets: ex.sets.filter(s => s.id !== setId)
          };
        }
        return ex;
      })
    }));
  };

  const updateSet = (exId: string, setId: string, updates: any) => {
    setEditedWorkout(prev => ({
      ...prev,
      exercises: prev.exercises.map(ex => {
        if (ex.id === exId) {
          return {
            ...ex,
            sets: ex.sets.map(s => s.id === setId ? { ...s, ...updates } : s)
          };
        }
        return ex;
      })
    }));
  };

  const handleSetInputChange = (exId: string, setId: string, field: 'weight' | 'reps', text: string) => {
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
    
    setEditedWorkout(prev => ({
      ...prev,
      exercises: prev.exercises.map(ex => {
        if (ex.id === exId) {
          const currentCount = ex.sets.length;
          let newSets = [...ex.sets];
          
          if (count > currentCount) {
            for (let i = 0; i < count - currentCount; i++) {
              const lastSet = newSets.length > 0 ? newSets[newSets.length - 1] : { weight: 0, reps: 0 };
              newSets.push({
                id: tempId(),
                weight: lastSet.weight,
                reps: lastSet.reps
              });
            }
          } else if (count < currentCount) {
            newSets = newSets.slice(0, count);
          }
          
          return { ...ex, sets: newSets };
        }
        return ex;
      })
    }));
  };


  const handleDelete = async () => {
    if (!workout || !onDelete) return;
    const ok = await confirm({
      title: '기록 삭제',
      message: '이 운동 기록을 삭제하시겠습니까?',
      confirmLabel: '삭제',
      destructive: true,
    });
    if (ok) {
      await onDelete(workout.id);
      onBack();
    }
  };

  const handleManualSave = async () => {
    if (onUpdate) {
      await onUpdate(editedWorkout, false); // false = not silent, might show success message/feedback depending on onUpdate implementation
      lastSavedState.current = JSON.stringify(editedWorkout);
      if (Platform.OS !== 'web') {
        Alert.alert('저장 완료', '기록이 저장되었습니다.', [{ text: '확인' }]);
      }
    }
  };

  const renderHeader = () => (
    <Pressable 
      style={styles.memoSection} 
      onPress={() => memoInputRef.current?.focus()}
      onLayout={(event) => {
        memoLayoutY.current = event.nativeEvent.layout.y;
      }}
    >
      <Text style={styles.memoTitle}>MEMO</Text>
      <TextInput
        ref={memoInputRef}
        style={styles.memoInput}
        multiline
        placeholder="Write your workout notes here..."
        placeholderTextColor="#666"
        value={editedWorkout.memo || ''}
        onChangeText={(text) => setEditedWorkout(prev => ({ ...prev, memo: text }))}
        onFocus={() => {
          flatListRef.current?.scrollToOffset({ offset: Math.max(0, memoLayoutY.current - 20), animated: true });
        }}
      />
    </Pressable>
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
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.iconButton}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{dateStr}</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={handleManualSave} style={styles.saveButton}>
            <Text style={styles.saveButtonText}>Save</Text>
          </TouchableOpacity>
          {onDelete && (
            <TouchableOpacity onPress={handleDelete} style={[styles.iconButton, styles.deleteActionButton]}>
              <Ionicons name="trash-outline" size={24} color="#ff4444" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {Platform.OS === 'web' ? (
        <WebDraggableList
          data={editedWorkout.exercises}
          styles={styles}
          onDragEnd={(data) => setEditedWorkout(prev => ({ ...prev, exercises: data }))}
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
            data={editedWorkout.exercises}
            onDragEnd={({ data }: { data: Exercise[] }) => setEditedWorkout(prev => ({ ...prev, exercises: data }))}
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

      <View style={styles.fabContainer}>
        <TouchableOpacity style={styles.fab} onPress={handleAddExercise}>
          <Ionicons name="add" size={24} color="#121212" />
          <Text style={styles.fabText}>Add Exercise</Text>
        </TouchableOpacity>
      </View>

      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      )}
    </View>
  );
}
