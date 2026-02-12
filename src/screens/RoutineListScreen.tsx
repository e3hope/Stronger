import React, { useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert, Platform } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useWorkout } from '../context/WorkoutContext';
import { Routine } from '../types';
import { styles } from './RoutineListScreen.styles';
import { Colors } from '../colors';

export default function RoutineListScreen() {
  const { routines, refreshData, deleteRoutine } = useWorkout();
  const router = useRouter();

  useFocusEffect(
    useCallback(() => {
      refreshData();
    }, [])
  );

  const handleDelete = async (id: number) => {
    if (Platform.OS === 'web') {
      // @ts-ignore
      if (window.confirm('정말 이 루틴을 삭제하시겠습니까?')) {
        await deleteRoutine(id);
      }
    } else {
      Alert.alert('루틴 삭제', '정말 이 루틴을 삭제하시겠습니까?', [
        { text: '취소', style: 'cancel' },
        { text: '삭제', style: 'destructive', onPress: async () => await deleteRoutine(id) }
      ]);
    }
  };

  const renderItem = ({ item }: { item: Routine }) => (
    <TouchableOpacity 
      style={styles.card}
      onPress={() => router.push(`/routine/${item.id}`)}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.routineName}>{item.name}</Text>
        <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.deleteButton}>
          <Ionicons name="trash-outline" size={20} color={Colors.danger} />
        </TouchableOpacity>
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
          <Ionicons name="add" size={24} color={Colors.background} />
          <Text style={styles.fabText}>New Routine</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
