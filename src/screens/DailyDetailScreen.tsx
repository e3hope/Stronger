import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, TextInput, Alert, Platform, KeyboardAvoidingView, Pressable, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DraggableFlatList, { ScaleDecorator, RenderItemParams } from 'react-native-draggable-flatlist';
import { WorkoutLog, Exercise } from '../types';
import { styles } from './DailyDetailScreen.styles';
import { Colors } from '../colors';
import WebDraggableList from '../components/WebDraggableList';

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
  // @ts-ignore
  const flatListRef = useRef<DraggableFlatList<Exercise>>(null);
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
      id: Math.random().toString(36).substr(2, 9),
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

  const removeExercise = (id: string) => {
    if (Platform.OS === 'web') {
      // @ts-ignore
      if (window.confirm('해당 운동을 삭제하시겠어요?')) {
        deleteExercise(id);
      }
      return;
    }

    Alert.alert('운동 삭제', '해당 운동을 삭제하시겠어요?', [
      { text: '취소', style: 'cancel' },
      { text: '삭제', style: 'destructive', onPress: () => deleteExercise(id) }
    ]);
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
                id: Math.random().toString(36).substr(2, 9),
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


  const handleDelete = () => {
    if (!workout || !onDelete) return;
    
    const performDelete = async () => {
      await onDelete(workout.id);
      onBack();
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

  const renderExerciseItem = ({ item, drag, isActive }: RenderItemParams<Exercise>) => (
    <ScaleDecorator>
      <View 
        style={[
          styles.exerciseCard, 
          isActive && { 
            borderColor: Colors.primary, 
            borderWidth: 1, 
            elevation: 5, 
            shadowOpacity: 0.3, 
            zIndex: 100,
            ...(Platform.OS === 'web' ? { zIndex: 999 } : {})
          },
          Platform.OS === 'web' && ({ touchAction: 'none' } as any)
        ]}
      >
        <View 
          style={[
            styles.exerciseHeader,
            isActive && { backgroundColor: Colors.blueLight }
          ]}
        >
          <View style={styles.exerciseTitleRow}>
            <TouchableOpacity 
              style={[
                styles.reorderHandle,
                Platform.OS === 'web' && ({ cursor: isActive ? 'grabbing' : 'grab', touchAction: 'none' } as any)
              ]}
              onLongPress={Platform.OS === 'web' ? undefined : drag}
              onPressIn={Platform.OS === 'web' ? drag : undefined}
              delayLongPress={Platform.OS === 'web' ? 0 : 100}
              activeOpacity={0.7}
            >
              <Ionicons
                name="reorder-three"
                size={22}
                color={isActive ? Colors.primary : "#888"}
              />
            </TouchableOpacity>
            <View style={styles.exerciseInfo}>
              <TextInput
                style={styles.exerciseNameInput}
                value={item.name}
                onChangeText={(text) => updateExercise(item.id, { name: text })}
                editable={!isActive}
              />
            </View>
          </View>
          
          <TouchableOpacity onPress={() => removeExercise(item.id)} style={styles.exerciseDeleteButton}>
            <Ionicons name="close" size={18} color="#f44336" />
          </TouchableOpacity>
        </View>

        <View style={styles.setsContainer}>
          <View style={styles.setHeaderRow}>
            <Text style={[styles.setHeaderText, styles.setHeaderTextFixed]}>SET</Text>
            <Text style={[styles.setHeaderText, styles.setHeaderTextFlex]}>KG</Text>
            <Text style={[styles.setHeaderText, styles.setHeaderTextFlex]}>REPS</Text>
            <View style={styles.headerSpacer} />
          </View>
          {item.sets.map((set, idx) => (
            <View key={set.id} style={styles.setRow}>
              <View style={styles.setIndexContainer}>
                {idx === 0 ? (
                  <View style={styles.setControlContainer}>
                    <TouchableOpacity 
                      style={styles.setControlButton}
                      onPress={() => updateSetCount(item.id, Math.max(1, item.sets.length - 1))}
                    >
                      <Ionicons name="remove" size={16} color="white" />
                    </TouchableOpacity>
                    <Text style={styles.setCountText}>1</Text>
                    <TouchableOpacity 
                      style={styles.setControlButton}
                      onPress={() => updateSetCount(item.id, item.sets.length + 1)}
                    >
                      <Ionicons name="add" size={16} color="white" />
                    </TouchableOpacity>
                  </View>
                ) : (
                  <Text style={styles.setNumber}>{idx + 1}</Text>
                )}
              </View>
              <TextInput
                style={[styles.setInput, styles.setInputLayout]} 
                keyboardType="numeric"
                value={set.weight === 0 ? '' : set.weight.toString()}
                placeholder="0"
                placeholderTextColor="#666"
                onChangeText={(text) => handleSetInputChange(item.id, set.id, 'weight', text)}
              />
              <TextInput
                style={[styles.setInput, styles.setInputLayout]} 
                keyboardType="numeric"
                value={set.reps === 0 ? '' : set.reps.toString()}
                placeholder="0"
                placeholderTextColor="#666"
                onChangeText={(text) => handleSetInputChange(item.id, set.id, 'reps', text)}
              />
              <TouchableOpacity  
                style={styles.removeSetButton}
                onPress={() => removeSet(item.id, set.id)}
              >
                {idx !== 0 && <Ionicons name="close" size={20} color="#666" />}
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </View>
    </ScaleDecorator>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.iconButton}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{dateStr}</Text>
        <View style={styles.headerActions}>
          {onDelete && (
            <TouchableOpacity onPress={handleDelete} style={[styles.iconButton, styles.deleteActionButton]}>
              <Ionicons name="trash-outline" size={24} color="#ff4444" />
            </TouchableOpacity>
          )}
          <View style={{ width: 40 }} />
        </View>
      </View>

      {Platform.OS === 'web' ? (
        <WebDraggableList
          data={editedWorkout.exercises}
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
            onDragEnd={({ data }) => setEditedWorkout(prev => ({ ...prev, exercises: data }))}
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
