import React from 'react';
import { Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { styles } from './StatsScreen.styles';

export default function StatsScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Text style={styles.text}>통계 화면은 준비 중입니다 🚧</Text>
      <Text style={styles.subtext}>차트 라이브러리 연동 예정</Text>
    </SafeAreaView>
  );
}
