import React from 'react';
import { View, Text } from 'react-native';
import { styles } from './StatsScreen.styles';

export default function StatsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>통계 화면은 준비 중입니다 🚧</Text>
      <Text style={styles.subtext}>차트 라이브러리 연동 예정</Text>
    </View>
  );
}
