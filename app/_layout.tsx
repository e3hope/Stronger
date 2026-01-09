import { Stack, useRouter, useSegments } from 'expo-router';
import { WorkoutProvider } from '../src/context/WorkoutContext';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { supabase } from '../src/lib/supabase';
import { View, ActivityIndicator } from 'react-native';

export default function RootLayout() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
  }, []);

  useEffect(() => {
    if (loading) return;

    // 현재 경로가 (tabs) 내부인지 확인
    // login 페이지는 auth 그룹이 아니므로 접근 가능해야 함
    const inTabsGroup = segments[0] === '(tabs)';

    if (!session && inTabsGroup) {
      // 세션이 없는데 탭 화면에 있으면 로그인으로 이동
      router.replace('/login');
    } else if (session && segments[0] === 'login') {
      // 세션이 있는데 로그인 화면에 있으면 탭으로 이동
      router.replace('/(tabs)');
    }
  }, [session, loading, segments]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#121212' }}>
        <ActivityIndicator size="large" color="#2196F3" />
      </View>
    );
  }

  return (
    <WorkoutProvider>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#121212' } }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="login" options={{ headerShown: false }} />
      </Stack>
    </WorkoutProvider>
  );
}
