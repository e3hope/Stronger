import 'react-native-gesture-handler';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { AuthProvider, useAuth } from '../src/features/auth/AuthContext';
import { RoutinesProvider } from '../src/features/routines/RoutinesContext';
import { WorkoutsProvider } from '../src/features/workouts/WorkoutsContext';

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AuthProvider>
          <RoutinesProvider>
            <WorkoutsProvider>
              <AuthGate />
            </WorkoutsProvider>
          </RoutinesProvider>
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

function AuthGate() {
  const { session, loading } = useAuth();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    if (loading) return;

    // login / register 페이지는 auth 그룹으로 취급
    const inAuthGroup = segments[0] === 'login' || segments[0] === 'register';

    if (!session && !inAuthGroup) {
      router.replace('/login');
    } else if (session) {
      if (inAuthGroup) {
        router.replace('/calendar');
      } else if (!segments[0]) {
        router.replace('/calendar');
      }
    }
  }, [session, loading, segments]);

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#121212',
        }}
      >
        <ActivityIndicator size="large" color="#CFFFE5" />
      </View>
    );
  }

  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#121212' } }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="login" options={{ headerShown: false }} />
      </Stack>
    </>
  );
}
