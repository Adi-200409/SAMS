import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useEffect } from 'react';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import { View, ActivityIndicator } from 'react-native';
import { Colors } from '../constants/theme';

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 60000 },
  },
});

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded) SplashScreen.hideAsync();
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, backgroundColor: Colors.background, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator color={Colors.primary} size="large" />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <StatusBar style="light" backgroundColor={Colors.background} />
        <Stack screenOptions={{ headerShown: false, animation: 'fade' }}>
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="activity/[id]" options={{ animation: 'slide_from_right' }} />
          <Stack.Screen name="club/[id]" options={{ animation: 'slide_from_right' }} />
          <Stack.Screen name="study/pomodoro" options={{ animation: 'slide_from_bottom' }} />
          <Stack.Screen name="study/notes" options={{ animation: 'slide_from_right' }} />
          <Stack.Screen name="study/assignments" options={{ animation: 'slide_from_right' }} />
          <Stack.Screen name="study/doubts" options={{ animation: 'slide_from_right' }} />
          <Stack.Screen name="study/resources" options={{ animation: 'slide_from_right' }} />
          <Stack.Screen name="ai/recommendations" options={{ animation: 'slide_from_right' }} />
          <Stack.Screen name="ai/resume" options={{ animation: 'slide_from_right' }} />
          <Stack.Screen name="ai/mood" options={{ animation: 'slide_from_right' }} />
          <Stack.Screen name="ai/roadmap" options={{ animation: 'slide_from_right' }} />
        </Stack>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
