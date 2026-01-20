import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { WorkoutLog, Exercise } from '../types';
import { styles } from './DailyDetailScreen.styles';

interface DailyDetailScreenProps {
  workout: WorkoutLog | null;
  onBack: () => void;
  onUpdate?: (workout: WorkoutLog) => Promise<void>;
}

export default function DailyDetailScreen({ workout, onBack, onUpdate }: DailyDetailScreenProps) {
  if (!workout) return null;

  const [isEditing, setIsEditing] = useState(false);
  const [editedWorkout, setEditedWorkout] = useState<WorkoutLog>(workout);
  const [reorderSelectedId, setReorderSelectedId] = useState<string | null>(null);

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
      setIsEditing(false);
    }
  };

  // --- Render ---

  if (isEditing) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setIsEditing(false)} style={styles.iconButton}>
            <Text style={{ color: 'white' }}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Workout</Text>
          <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
            <Text style={styles.saveButtonText}>Save</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content}>
          <View style={styles.section}>
            {/* Memo Section */}
            <View style={styles.memoSection}>
              <Text style={styles.memoTitle}>MEMO</Text>
              <TextInput
                style={styles.memoInput}
                multiline
                placeholder="Write your workout notes here..."
                placeholderTextColor="#666"
                value={editedWorkout.memo || ''}
                onChangeText={(text) => setEditedWorkout(prev => ({ ...prev, memo: text }))}
              />
            </View>

            {editedWorkout.exercises.map((ex, index) => (
              <View 
                key={ex.id} 
                style={[
                  styles.exerciseCard, 
                  reorderSelectedId === ex.id && { borderColor: '#2196F3', borderWidth: 1 }
                ]}
              >
                <View 
                  style={[
                    styles.exerciseHeader,
                    reorderSelectedId === ex.id && { backgroundColor: 'rgba(33, 150, 243, 0.1)' }
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
                        color={reorderSelectedId === ex.id ? "#2196F3" : "#888"}
                      />
                    </TouchableOpacity>
                    <View style={styles.exerciseInfo}>
                      <TextInput
                        style={styles.exerciseNameInput}
                        value={ex.name}
                        onChangeText={(text) => updateExercise(ex.id, { name: text })}
                        editable={reorderSelectedId !== ex.id}
                      />
                      <Text style={styles.exerciseType}>{ex.category} · {ex.type}</Text>
                    </View>
                  </View>
                  
                  {reorderSelectedId === ex.id ? (
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                      <TouchableOpacity 
                        onPress={() => moveExercise(ex.id, 'up')} 
                        style={{ padding: 8, opacity: index === 0 ? 0.3 : 1 }}
                        disabled={index === 0}
                      >
                        <Ionicons name="arrow-up" size={20} color="#2196F3" />
                      </TouchableOpacity>
                      <TouchableOpacity 
                        onPress={() => moveExercise(ex.id, 'down')} 
                        style={{ padding: 8, opacity: index === editedWorkout.exercises.length - 1 ? 0.3 : 1 }}
                        disabled={index === editedWorkout.exercises.length - 1}
                      >
                        <Ionicons name="arrow-down" size={20} color="#2196F3" />
                      </TouchableOpacity>
                      <TouchableOpacity 
                        onPress={() => setReorderSelectedId(null)} 
                        style={{ padding: 6, backgroundColor: '#2196F3', borderRadius: 4, marginLeft: 4 }}
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
                    <Text style={[styles.setHeaderText, { width: 100 }]}>SET</Text>
                    <Text style={[styles.setHeaderText, { flex: 1 }]}>KG</Text>
                    <Text style={[styles.setHeaderText, { flex: 1 }]}>REPS</Text>
                    <View style={{ width: 30 }} />
                  </View>
                  {ex.sets.map((set, idx) => (
                    <View key={set.id} style={styles.setRow}>
                      <View style={{ width: 100, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                        {idx === 0 ? (
                          <View style={styles.setControlContainer}>
                            <TouchableOpacity 
                              style={styles.setControlButton}
                              onPress={() => updateSetCount(ex.id, Math.max(1, ex.sets.length - 1))}
                            >
                              <Ionicons name="remove" size={16} color="white" />
                            </TouchableOpacity>
                            <Text style={styles.setCountText}>{ex.sets.length}</Text>
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
                        style={[styles.setInput, { flex: 1, marginLeft: 8 }]} 
                        keyboardType="numeric"
                        value={set.weight === 0 ? '' : set.weight.toString()}
                        placeholder="0"
                        placeholderTextColor="#666"
                        onChangeText={(text) => handleSetInputChange(ex.id, set.id, 'weight', text)}
                      />
                      <TextInput
                        style={[styles.setInput, { flex: 1, marginLeft: 8 }]} 
                        keyboardType="numeric"
                        value={set.reps === 0 ? '' : set.reps.toString()}
                        placeholder="0"
                        placeholderTextColor="#666"
                        onChangeText={(text) => handleSetInputChange(ex.id, set.id, 'reps', text)}
                      />
                      <TouchableOpacity  
                        style={{ width: 30, alignItems: 'flex-end' }}
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
          <View style={{ height: 100 }} />
        </ScrollView>

        <View style={styles.fabContainer}>
          <TouchableOpacity style={styles.fab} onPress={handleAddExercise}>
            <Ionicons name="add" size={24} color="#121212" />
            <Text style={styles.fabText}>Add Exercise</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Read-only View
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.iconButton}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <View style={styles.dateSelector}>
          <TouchableOpacity>
            <Ionicons name="chevron-back" size={24} color="#666" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{dateStr}, Today</Text>
          <TouchableOpacity>
            <Ionicons name="chevron-forward" size={24} color="#666" />
          </TouchableOpacity>
        </View>
        <TouchableOpacity onPress={() => setIsEditing(true)} style={styles.iconButton}>
          <Text style={{ color: '#2196F3', fontWeight: 'bold' }}>Edit</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>VOLUME</Text>
            <Text style={styles.statValue}>
              {editedWorkout.volume ? (
                <>
                  {editedWorkout.volume.toLocaleString()} <Text style={styles.statUnit}>kg</Text>
                </>
              ) : (
                <Text style={styles.statValue}>-</Text>
              )}
            </Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>SETS</Text>
            <Text style={styles.statValue}>
              {editedWorkout.exercises.reduce((acc, ex) => acc + (ex.sets?.length || 0), 0)}
            </Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>DURATION</Text>
            <Text style={styles.statValue}>
              {editedWorkout.duration ? (
                <>
                  {editedWorkout.duration} <Text style={styles.statUnit}>m</Text>
                </>
              ) : (
                <Text style={styles.statValue}>-</Text>
              )}
            </Text>
          </View>
        </View>

        {/* Memo Display */}
        <View style={[styles.memoSection, { marginHorizontal: 16 }]}>
          <Text style={styles.memoTitle}>MEMO</Text>
          <Text style={[styles.memoText, !editedWorkout.memo && { color: '#666', fontStyle: 'italic' }]}>
            {editedWorkout.memo || 'No memo available.'}
          </Text>
        </View>

        <View style={styles.tableHeader}>
          <Text style={styles.tableHeaderTitle}>EXERCISE</Text>
          <View style={styles.tableHeaderStats}>
            <Text style={styles.tableHeaderStat}>SETS</Text>
            <Text style={styles.tableHeaderStat}>WEIGHT</Text>
            <Text style={styles.tableHeaderStat}>REPS</Text>
          </View>
        </View>

        <View style={styles.exerciseList}>
          {editedWorkout.exercises.map((item, i) => (
            <View key={i} style={styles.exerciseCard}>
              <View style={styles.exerciseInfo}>
                <View style={styles.exerciseIcon}>
                  <Ionicons name="fitness" size={24} color="#2196F3" />
                </View>
                <View style={styles.exerciseText}>
                  <Text style={styles.exerciseName}>{item.name}</Text>
                  <Text style={styles.exerciseMeta}>{item.category || 'General'} • {item.type || 'Exercise'}</Text>
                </View>
              </View>
              
              <View style={styles.setListContainer}>
                {item.sets && item.sets.map((set, j) => (
                  <View key={j} style={styles.setRow}>
                    <View style={styles.setIndexBox}>
                      <Text style={styles.setIndexText}>{j + 1}</Text>
                    </View>
                    <View style={styles.setValueBox}>
                      <Text style={styles.setValueText}>{set.weight} <Text style={styles.setValueLabel}>kg</Text></Text>
                    </View>
                    <View style={styles.setValueBox}>
                      <Text style={styles.setValueText}>{set.reps} <Text style={styles.setValueLabel}>reps</Text></Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
