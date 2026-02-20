import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert, Modal, FlatList, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Routine, Exercise } from '../types';
import { styles } from './RoutineDetailScreen.styles';
import { Colors } from '../colors';

interface RoutineDetailScreenProps {
  routine: Routine | null;
  onSave: (r: Routine) => void;
  onBack: () => void;
}

export default function RoutineDetailScreen({ routine, onSave, onBack }: RoutineDetailScreenProps) {
  const [name, setName] = useState(routine?.name || '');
  const [exercises, setExercises] = useState<Exercise[]>(routine?.exercises || []);
  
  // State for set count dropdown (modal) - removed as we use buttons now
  const [reorderSelectedId, setReorderSelectedId] = useState<string | null>(null);

  const handleAddExercise = () => {
    const newEx: Exercise = {
      id: Math.random().toString(36).substr(2, 9),
      name: 'New Exercise',
      category: 'General',
      type: 'Compound',
      sets: [{ id: 's1', weight: 0, reps: 0 }]
    };
    setExercises([...exercises, newEx]);
  };

  const deleteExercise = (id: string) => {
    setExercises(prev => prev.filter(ex => ex.id !== id));
    setReorderSelectedId(prev => (prev === id ? null : prev));
  };

  const removeExercise = (id: string) => {
    if (Platform.OS === 'web') {
      // @ts-ignore: confirm exists on web
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
              id: Math.random().toString(36).substr(2, 9),
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

  const syncSetValues = (exId: string) => {
    setExercises(exercises.map(ex => {
      if (ex.id === exId) {
        if (ex.sets.length === 0) return ex;
        
        // Use the first set as the source
        const sourceSet = ex.sets[0];
        
        return {
          ...ex,
          sets: ex.sets.map((s, index) => {
            // Skip the first set (it's the source)
            if (index === 0) return s;
            return { ...s, weight: sourceSet.weight, reps: sourceSet.reps };
          })
        };
      }
      return ex;
    }));
  };

  const moveExercise = (id: string, direction: 'up' | 'down') => {
    const index = exercises.findIndex(e => e.id === id);
    if (index === -1) return;
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === exercises.length - 1) return;

    const newExercises = [...exercises];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    // Swap
    [newExercises[index], newExercises[targetIndex]] = [newExercises[targetIndex], newExercises[index]];
    setExercises(newExercises);
  };

  const handleSave = () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter a routine name');
      return;
    }
    // @ts-ignore: ID is number but using temp string for new routine logic in context
    onSave({
      id: routine?.id || -1, // -1 means new routine
      name,
      exercises,
      tags: [],
    });
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.iconButton}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Routine Details</Text>
        <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
          <Text style={styles.saveButtonText}>Save</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* Routine Name Section */}
        <View style={styles.section}>
          <Text style={styles.label}>Routine Name</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Leg Day Blast"
            placeholderTextColor="#666"
            value={name}
            onChangeText={setName}
          />
        </View>

        <View style={styles.divider} />

        {/* Exercises List */}
        <View style={styles.section}>
          <Text style={styles.label}>Exercise List ({exercises.length})</Text>
          {exercises.map((ex, index) => (
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
                      editable={reorderSelectedId !== ex.id} // Disable editing name while reordering
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
                      style={[styles.moveButton, { opacity: index === exercises.length - 1 ? 0.3 : 1 }]}
                      disabled={index === exercises.length - 1}
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

          {exercises.length === 0 && (
            <TouchableOpacity style={styles.emptyStateButton} onPress={handleAddExercise}>
              <Ionicons name="fitness" size={40} color="#666" />
              <Text style={styles.emptyStateText}>Add your first exercise</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.footerSpacer} /> 
      </ScrollView>

      {/* Floating Action Button for Add Exercise */}
      <View style={styles.fabContainer}>
        <TouchableOpacity style={styles.fab} onPress={handleAddExercise}>
          <Ionicons name="add" size={24} color="#121212" />
          <Text style={styles.fabText}>Add Exercise</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
