import 'react-native-gesture-handler';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
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
    // 루트 경로('/')도 탭(캘린더)으로 연결되므로 보호되어야 함
    // const inTabsGroup = !segments[0] || segments[0] === '(tabs)';
    
    // Auth group check (login, register)
    const inAuthGroup = segments[0] === 'login' || segments[0] === 'register';

    if (!session && !inAuthGroup) {
      // 세션이 없는데 보호된 경로(탭, 루트 등)에 있으면 로그인으로 이동
      router.replace('/login');
    } else if (session) {
      if (inAuthGroup) {
        // 세션이 있는데 로그인/회원가입 화면에 있으면 캘린더로 이동
        router.replace('/calendar');
      } else if (!segments[0]) {
        // 루트 경로('/')에 있으면 캘린더로 이동
        // app/index.tsx에서도 Redirect를 사용하지만, 여기서도 체크
        router.replace('/calendar');
      }
    }
  }, [session, loading, segments]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#121212' }}>
        <ActivityIndicator size="large" color="#CFFFE5" />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <WorkoutProvider>
        <StatusBar style="light" />
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#121212' } }}>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="login" options={{ headerShown: false }} />
        </Stack>
      </WorkoutProvider>
    </GestureHandlerRootView>
  );
}
