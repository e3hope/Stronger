import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { WorkoutLog } from '../types';
import { styles } from './DailyDetailScreen.styles';

interface DailyDetailScreenProps {
  workout: WorkoutLog | null;
  onBack: () => void;
}

export default function DailyDetailScreen({ workout, onBack }: DailyDetailScreenProps) {
  if (!workout) return null;

  const dateStr = new Date(workout.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  // Mock data removed

  return (
    <View style={styles.container}>
      {/* Header */}
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
        <TouchableOpacity style={styles.iconButton}>
          <Ionicons name="calendar" size={24} color="#2196F3" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>VOLUME</Text>
            <Text style={styles.statValue}>
              {workout.volume ? (
                <>
                  {workout.volume.toLocaleString()} <Text style={styles.statUnit}>kg</Text>
                </>
              ) : (
                <Text style={styles.statValue}>-</Text>
              )}
            </Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>SETS</Text>
            <Text style={styles.statValue}>
              {workout.exercises.reduce((acc, ex) => acc + (ex.sets?.length || 0), 0)}
            </Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>DURATION</Text>
            <Text style={styles.statValue}>
              {workout.duration ? (
                <>
                  {workout.duration} <Text style={styles.statUnit}>m</Text>
                </>
              ) : (
                <Text style={styles.statValue}>-</Text>
              )}
            </Text>
          </View>
        </View>

        {/* Table Header */}
        <View style={styles.tableHeader}>
          <Text style={styles.tableHeaderTitle}>EXERCISE</Text>
          <View style={styles.tableHeaderStats}>
            <Text style={styles.tableHeaderStat}>SETS</Text>
            <Text style={styles.tableHeaderStat}>WEIGHT</Text>
            <Text style={styles.tableHeaderStat}>REPS</Text>
          </View>
        </View>

        {/* Exercise List */}
        <View style={styles.exerciseList}>
          {workout.exercises.map((item, i) => (
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
              
              {/* Sets List */}
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
