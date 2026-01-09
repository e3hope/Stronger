import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Routine, Exercise } from '../types';
import { styles } from './RoutineDetailScreen.styles';

interface RoutineDetailScreenProps {
  routine: Routine | null;
  onSave: (r: Routine) => void;
  onBack: () => void;
}

export default function RoutineDetailScreen({ routine, onSave, onBack }: RoutineDetailScreenProps) {
  const [name, setName] = useState(routine?.name || '');
  const [exercises, setExercises] = useState<Exercise[]>(routine?.exercises || []);
  const [tags, setTags] = useState<string[]>(routine?.tags || []);

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

  const updateExercise = (id: string, updates: Partial<Exercise>) => {
    setExercises(exercises.map(ex => ex.id === id ? { ...ex, ...updates } : ex));
  };

  const addSet = (exId: string) => {
    setExercises(exercises.map(ex => {
      if (ex.id === exId) {
        return {
          ...ex,
          sets: [...ex.sets, { id: Math.random().toString(36).substr(2, 9), weight: 0, reps: 0 }]
        };
      }
      return ex;
    }));
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
      tags,
      estimatedDuration: 45
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
          <View style={styles.tagContainer}>
            {tags.map((tag, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
            <TouchableOpacity style={styles.addTagButton}>
              <Ionicons name="add" size={20} color="#666" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.divider} />

        {/* Exercises List */}
        <View style={styles.section}>
          <Text style={styles.label}>Exercise List ({exercises.length})</Text>
          {exercises.map((ex) => (
            <View key={ex.id} style={styles.exerciseCard}>
              <View style={styles.exerciseHeader}>
                <View style={styles.exerciseTitleRow}>
                  <Ionicons name="menu" size={24} color="#666" />
                  <View style={styles.exerciseInfo}>
                    <TextInput
                      style={styles.exerciseNameInput}
                      value={ex.name}
                      onChangeText={(text) => updateExercise(ex.id, { name: text })}
                    />
                    <Text style={styles.exerciseType}>{ex.category} · {ex.type}</Text>
                  </View>
                </View>
                <TouchableOpacity>
                  <Ionicons name="ellipsis-vertical" size={20} color="#666" />
                </TouchableOpacity>
              </View>

              <View style={styles.setsContainer}>
                <View style={styles.setHeaderRow}>
                  <Text style={[styles.setHeaderText, { width: 30 }]}>SET</Text>
                  <Text style={[styles.setHeaderText, { flex: 1 }]}>KG</Text>
                  <Text style={[styles.setHeaderText, { flex: 1 }]}>REPS</Text>
                  <View style={{ width: 30 }} />
                </View>
                {ex.sets.map((set, idx) => (
                  <View key={set.id} style={styles.setRow}>
                    <Text style={[styles.setNumber, { width: 30 }]}>{idx + 1}</Text>
                    <TextInput
                      style={[styles.setInput, { flex: 1 }]}
                      keyboardType="numeric"
                      value={set.weight.toString()}
                      onChangeText={(text) => updateSet(ex.id, set.id, { weight: Number(text) })}
                    />
                    <TextInput
                      style={[styles.setInput, { flex: 1, marginLeft: 10 }]}
                      keyboardType="numeric"
                      value={set.reps.toString()}
                      onChangeText={(text) => updateSet(ex.id, set.id, { reps: Number(text) })}
                    />
                    <TouchableOpacity 
                      style={{ width: 30, alignItems: 'flex-end' }}
                      onPress={() => removeSet(ex.id, set.id)}
                    >
                      <Ionicons name="close" size={20} color="#666" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>

              <TouchableOpacity 
                style={styles.addSetButton}
                onPress={() => addSet(ex.id)}
              >
                <Ionicons name="add" size={18} color="#2196F3" />
                <Text style={styles.addSetText}>Add Set</Text>
              </TouchableOpacity>
            </View>
          ))}

          {exercises.length === 0 && (
            <TouchableOpacity style={styles.emptyStateButton} onPress={handleAddExercise}>
              <Ionicons name="fitness" size={40} color="#666" />
              <Text style={styles.emptyStateText}>Add your first exercise</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={{ height: 100 }} /> 
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
