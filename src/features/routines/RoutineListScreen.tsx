import React, { useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useRoutines } from './RoutinesContext';
import { Routine } from '../../types';
import { styles } from './RoutineListScreen.styles';
import { Colors } from '../../colors';
import { confirm } from '../../shared/utils/confirm';

export default function RoutineListScreen() {
  const { routines, refresh, deleteRoutine } = useRoutines();
  const router = useRouter();

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh])
  );

  const handleDelete = async (id: number) => {
    const ok = await confirm({
      title: '루틴 삭제',
      message: '정말 이 루틴을 삭제하시겠습니까?',
      confirmLabel: '삭제',
      destructive: true,
    });
    if (ok) await deleteRoutine(id);
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
    <SafeAreaView style={styles.container} edges={['top']}>
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
    </SafeAreaView>
  );
}
