import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, TextInput, Alert, Platform, KeyboardAvoidingView, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DraggableFlatList, { ScaleDecorator, RenderItemParams } from 'react-native-draggable-flatlist';
import { Routine, Exercise } from '../types';
import { styles } from './RoutineDetailScreen.styles';
import { Colors } from '../colors';
import WebDraggableList from '../components/WebDraggableList';

interface RoutineDetailScreenProps {
  routine: Routine | null;
  onSave: (r: Routine) => Promise<Routine | void | undefined>;
  onBack: () => void;
}

export default function RoutineDetailScreen({ routine, onSave, onBack }: RoutineDetailScreenProps) {
  const [name, setName] = useState(routine?.name || '');
  const [exercises, setExercises] = useState<Exercise[]>(routine?.exercises || []);
  
  const isMounted = useRef(false);
  const lastSavedState = useRef(JSON.stringify({ name: routine?.name || '', exercises: routine?.exercises || [] }));
  // @ts-ignore
  const flatListRef = useRef<DraggableFlatList<Exercise>>(null);

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
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.iconButton}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Routine Details</Text>
        {/* Auto-save enabled, no manual save button needed */}
        <View style={{ width: 40 }} /> 
      </View>

      {Platform.OS === 'web' ? (
        <WebDraggableList
          data={exercises}
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
            onDragEnd={({ data }) => setExercises(data)}
            keyExtractor={(item) => item.id}
            renderItem={renderExerciseItem}
            ListHeaderComponent={renderHeader}
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
              paddingBottom: 100 
            }}
            keyboardShouldPersistTaps="handled"
          />
        </KeyboardAvoidingView>
      )}

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
