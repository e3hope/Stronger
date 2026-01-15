import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, StatusBar, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../src/lib/supabase';

export default function HomeScreen() {
  const router = useRouter();

  const handleLogout = () => {
    Alert.alert('로그아웃', '정말 로그아웃 하시겠습니까?', [
      { text: '취소', style: 'cancel' },
      {
        text: '로그아웃',
        style: 'destructive',
        onPress: async () => {
          const { error } = await supabase.auth.signOut();
          if (error) console.error('Sign out error:', error);
          router.replace('/login');
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#121212" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Stronger</Text>
        <TouchableOpacity onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={24} color="white" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* Welcome Section */}
        <View style={styles.section}>
          <Text style={styles.greeting}>어서오세요, 득근님 💪</Text>
          <Text style={styles.subGreeting}>오늘도 한계를 돌파해볼까요?</Text>
        </View>

        {/* Action Button */}
        <TouchableOpacity style={styles.startButton}>
          <Text style={styles.startButtonText}>오늘 운동 시작하기</Text>
        </TouchableOpacity>

        {/* Dashboard Cards */}
        <View style={styles.statsContainer}>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>이번 주 운동</Text>
            <Text style={styles.cardValue}>3회</Text>
          </View>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>볼륨 (Total)</Text>
            <Text style={styles.cardValue}>12,400kg</Text>
          </View>
        </View>

        {/* Calendar Button */}
        <TouchableOpacity 
          style={styles.calendarButton}
          onPress={() => router.push('/calendar')}
        >
          <Text style={styles.calendarButtonText}>달력 보기 📅</Text>
        </TouchableOpacity>

        {/* Recent Activity */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>최근 기록</Text>
          {[1, 2].map((item) => (
            <View key={item} style={styles.historyCard}>
              <View>
                <Text style={styles.historyTitle}>가슴 & 삼두</Text>
                <Text style={styles.historyDate}>2025. 12. 18</Text>
              </View>
              <Text style={styles.historyVolume}>4,500kg</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10, // Reduced from 50
    paddingBottom: 20,
    backgroundColor: '#1E1E1E',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 30,
  },
  greeting: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 5,
  },
  subGreeting: {
    fontSize: 16,
    color: '#aaaaaa',
  },
  startButton: {
    backgroundColor: '#2196F3',
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 30,
    shadowColor: '#2196F3',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  calendarButton: {
    backgroundColor: '#333',
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 30,
    borderWidth: 1,
    borderColor: '#444',
  },
  calendarButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  startButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  card: {
    backgroundColor: '#1E1E1E',
    width: '48%',
    padding: 20,
    borderRadius: 12,
  },
  cardTitle: {
    color: '#aaaaaa',
    fontSize: 14,
    marginBottom: 8,
  },
  cardValue: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 15,
  },
  historyCard: {
    backgroundColor: '#1E1E1E',
    padding: 20,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  historyTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  historyDate: {
    color: '#666666',
    fontSize: 14,
  },
  historyVolume: {
    color: '#2196F3',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
