import React, { useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useWorkout } from '../context/WorkoutContext';
import { Routine } from '../types';
import { styles } from './RoutineListScreen.styles';

export default function RoutineListScreen() {
  const { routines, refreshData } = useWorkout();
  const router = useRouter();

  useFocusEffect(
    useCallback(() => {
      refreshData();
    }, [])
  );

  const renderItem = ({ item }: { item: Routine }) => (
    <TouchableOpacity 
      style={styles.card}
      onPress={() => router.push(`/routine/${item.id}`)}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.routineName}>{item.name}</Text>
        <Text style={styles.duration}>{item.estimatedDuration} min</Text>
      </View>
      <View style={styles.tags}>
        {item.tags?.map((tag, index) => (
          <View key={index} style={styles.tag}>
            <Text style={styles.tagText}>{tag}</Text>
          </View>
        ))}
      </View>
      <Text style={styles.exerciseCount}>{item.exercises.length} Exercises</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={routines}
        renderItem={renderItem}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <Text style={styles.emptyText}>루틴이 없습니다. 새로운 루틴을 추가해보세요!</Text>
        }
      />

      <View style={styles.fabContainer}>
        <TouchableOpacity 
          style={styles.fab} 
          onPress={() => router.push('/routine/new')}
        >
          <Ionicons name="add" size={24} color="#121212" />
          <Text style={styles.fabText}>New Routine</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
