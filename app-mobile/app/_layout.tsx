import { Slot, useRouter, useSegments } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from '../src/context/AuthContext';
import { ThemeProvider, useTheme } from '../src/context/ThemeContext';
import { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import {
  addNotificationResponseListener,
  configureNotifications,
} from '../src/services/notificationService';

const queryClient = new QueryClient();

function RootNavigation() {
  const { user, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const { colors } = useTheme();

  useEffect(() => {
    void configureNotifications().catch(() => undefined);
    const subscription = addNotificationResponseListener((url) => router.push(url as never));

    return () => subscription.remove();
  }, [router]);

  useEffect(() => {
    if (loading) return;

    const inAuthGroup = segments[0] === '(app)';

    if (!user && inAuthGroup) {
      router.replace('/login');
    } else if (user && !inAuthGroup) {
      router.replace('/(app)');
    }
  }, [user, loading, router, segments]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return <Slot />;
}

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <StatusBar style="auto" />
          <RootNavigation />
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
