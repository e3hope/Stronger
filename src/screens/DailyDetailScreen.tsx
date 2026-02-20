import React, { useState, useEffect, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert, Platform, KeyboardAvoidingView, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { WorkoutLog, Exercise } from '../types';
import { styles } from './DailyDetailScreen.styles';
import { Colors } from '../colors';

interface DailyDetailScreenProps {
  workout: WorkoutLog | null;
  onBack: () => void;
  onUpdate?: (workout: WorkoutLog) => Promise<void>;
  onDelete?: (id: number) => Promise<void>;
}

export default function DailyDetailScreen({ workout, onBack, onUpdate, onDelete }: DailyDetailScreenProps) {
  if (!workout) return null;

  const [editedWorkout, setEditedWorkout] = useState<WorkoutLog>(workout);
  const [reorderSelectedId, setReorderSelectedId] = useState<string | null>(null);
  const memoInputRef = useRef<TextInput>(null);
  const scrollViewRef = useRef<ScrollView>(null);
  const memoLayoutY = useRef<number>(0);

  useEffect(() => {
    if (workout) {
      setEditedWorkout(workout);
    }
  }, [workout]);

  const dateStr = new Date(editedWorkout.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

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
    setReorderSelectedId(prev => (prev === id ? null : prev));
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

  const moveExercise = (id: string, direction: 'up' | 'down') => {
    const index = editedWorkout.exercises.findIndex(e => e.id === id);
    if (index === -1) return;
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === editedWorkout.exercises.length - 1) return;

    const newExercises = [...editedWorkout.exercises];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    [newExercises[index], newExercises[targetIndex]] = [newExercises[targetIndex], newExercises[index]];
    setEditedWorkout(prev => ({ ...prev, exercises: newExercises }));
  };

  const handleSave = async () => {
    if (onUpdate) {
      await onUpdate(editedWorkout);
      onBack();
    }
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
          <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
            <Text style={styles.saveButtonText}>Save</Text>
          </TouchableOpacity>
        </View>
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoiding}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
      <ScrollView 
        ref={scrollViewRef}
        style={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.section}>
          {/* Memo Section */}
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
                // 약간의 여유를 두고 스크롤 이동
                scrollViewRef.current?.scrollTo({ y: Math.max(0, memoLayoutY.current - 20), animated: true });
              }}
            />
          </Pressable>

          {editedWorkout.exercises.map((ex, index) => (
            <View 
              key={ex.id} 
              style={[
                styles.exerciseCard, 
                reorderSelectedId === ex.id && { borderColor: Colors.primary, borderWidth: 1 }
              ]}
            >
              <View 
                style={[
                  styles.exerciseHeader,
                  reorderSelectedId === ex.id && { backgroundColor: Colors.blueLight }
                ]}
              >
                <View style={styles.exerciseTitleRow}>
                  <TouchableOpacity 
                    style={styles.reorderHandle}
                    onPress={() => setReorderSelectedId(prev => prev === ex.id ? null : ex.id)}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name={reorderSelectedId === ex.id ? "swap-vertical" : "reorder-three"}
                      size={22}
                      color={reorderSelectedId === ex.id ? Colors.primary : "#888"}
                    />
                  </TouchableOpacity>
                  <View style={styles.exerciseInfo}>
                    <TextInput
                      style={styles.exerciseNameInput}
                      value={ex.name}
                      onChangeText={(text) => updateExercise(ex.id, { name: text })}
                      editable={reorderSelectedId !== ex.id}
                    />
                                      </View>
                </View>
                
                {reorderSelectedId === ex.id ? (
                  <View style={styles.reorderActions}>
                    <TouchableOpacity 
                      onPress={() => moveExercise(ex.id, 'up')} 
                      style={[styles.moveButton, { opacity: index === 0 ? 0.3 : 1 }]}
                      disabled={index === 0}
                    >
                      <Ionicons name="arrow-up" size={20} color={Colors.primary} />
                    </TouchableOpacity>
                    <TouchableOpacity 
                      onPress={() => moveExercise(ex.id, 'down')} 
                      style={[styles.moveButton, { opacity: index === editedWorkout.exercises.length - 1 ? 0.3 : 1 }]}
                      disabled={index === editedWorkout.exercises.length - 1}
                    >
                      <Ionicons name="arrow-down" size={20} color={Colors.primary} />
                    </TouchableOpacity>
                    <TouchableOpacity 
                      onPress={() => setReorderSelectedId(null)} 
                      style={styles.confirmButton}
                    >
                      <Ionicons name="checkmark" size={16} color="white" />
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity onPress={() => removeExercise(ex.id)} style={styles.exerciseDeleteButton}>
                    <Ionicons name="close" size={18} color="#f44336" />
                  </TouchableOpacity>
                )}
              </View>


              <View style={styles.setsContainer}>
                <View style={styles.setHeaderRow}>
                  <Text style={[styles.setHeaderText, styles.setHeaderTextFixed]}>SET</Text>
                  <Text style={[styles.setHeaderText, styles.setHeaderTextFlex]}>KG</Text>
                  <Text style={[styles.setHeaderText, styles.setHeaderTextFlex]}>REPS</Text>
                  <View style={styles.headerSpacer} />
                </View>
                {ex.sets.map((set, idx) => (
                  <View key={set.id} style={styles.setRow}>
                    <View style={styles.setIndexContainer}>
                      {idx === 0 ? (
                        <View style={styles.setControlContainer}>
                          <TouchableOpacity 
                            style={styles.setControlButton}
                            onPress={() => updateSetCount(ex.id, Math.max(1, ex.sets.length - 1))}
                          >
                            <Ionicons name="remove" size={16} color="white" />
                          </TouchableOpacity>
                          <Text style={styles.setCountText}>1</Text>
                          <TouchableOpacity 
                            style={styles.setControlButton}
                            onPress={() => updateSetCount(ex.id, ex.sets.length + 1)}
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
                      onChangeText={(text) => handleSetInputChange(ex.id, set.id, 'weight', text)}
                    />
                    <TextInput
                      style={[styles.setInput, styles.setInputLayout]} 
                      keyboardType="numeric"
                      value={set.reps === 0 ? '' : set.reps.toString()}
                      placeholder="0"
                      placeholderTextColor="#666"
                      onChangeText={(text) => handleSetInputChange(ex.id, set.id, 'reps', text)}
                    />
                    <TouchableOpacity  
                      style={styles.removeSetButton}
                      onPress={() => removeSet(ex.id, set.id)}
                    >
                      {idx !== 0 && <Ionicons name="close" size={20} color="#666" />}
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            </View>
          ))}

          {editedWorkout.exercises.length === 0 && (
            <TouchableOpacity style={styles.emptyStateButton} onPress={handleAddExercise}>
              <Ionicons name="fitness" size={40} color="#666" />
              <Text style={styles.emptyStateText}>Add your first exercise</Text>
            </TouchableOpacity>
          )}
        </View>
        <View style={styles.footerSpacer} />
      </ScrollView>
      </KeyboardAvoidingView>

      <View style={styles.fabContainer}>
        <TouchableOpacity style={styles.fab} onPress={handleAddExercise}>
          <Ionicons name="add" size={24} color="#121212" />
          <Text style={styles.fabText}>Add Exercise</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
