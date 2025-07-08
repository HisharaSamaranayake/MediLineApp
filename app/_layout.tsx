import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/useColorScheme';
import { FontSizeProvider } from './FontSizeContext';  // correct relative path

import useNotificationPermission from './notificationPermission'; // ✅ IMPORT HOOK (adjusted path)

import { GestureHandlerRootView } from 'react-native-gesture-handler';  // <-- Import GestureHandlerRootView

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useNotificationPermission(); // ✅ CALL HOOK

  if (!loaded) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>  {/* <-- Wrap everything here */}
      <FontSizeProvider>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="+not-found" />
          </Stack>
          <StatusBar style="auto" />
        </ThemeProvider>
      </FontSizeProvider>
    </GestureHandlerRootView>
  );
}




