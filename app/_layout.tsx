import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import 'react-native-reanimated';

import { useColorScheme } from '@/components/useColorScheme';
import { initDatabase } from '../src/database/db';
import { Audio as ExpoAudio } from 'expo-av';
import { QuranService } from '../src/services/quranService';
import { CustomSplashScreen } from '../src/components/CustomSplashScreen';
import { NotificationService } from '../src/services/notificationService';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  initialRouteName: 'index',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [dbReady, setDbReady] = useState(false);
  const [isSplashFinished, setIsSplashFinished] = useState(false);
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });

  useEffect(() => {
    async function setupAudio() {
      try {
        await ExpoAudio.setAudioModeAsync({
          playsInSilentModeIOS: true,
          staysActiveInBackground: true,
          playThroughEarpieceAndroid: false,
        });
      } catch (e) {
        console.error('Audio setup error:', e);
      }
    }
    setupAudio();
  }, []);

  useEffect(() => {
    async function setup() {
      try {
        await initDatabase();
        await QuranService.seedInitialData();
        await NotificationService.setupNotificationChannels();
        await NotificationService.schedulePrayerNotifications();
        setDbReady(true);
      } catch (e) {
        console.error('Database setup error:', e);
        setDbReady(true); // Proceed anyway for now
      }
    }
    setup();
  }, []);

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded || !dbReady) {
    return null;
  }

  if (!isSplashFinished) {
    return (
      <CustomSplashScreen onFinish={() => setIsSplashFinished(true)} />
    );
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="login" options={{ headerShown: false, animation: 'fade' }} />
        <Stack.Screen name="signup" options={{ headerShown: false, animation: 'fade' }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false, animation: 'fade' }} />
        <Stack.Screen name="search" options={{ presentation: 'modal', title: 'Search Ayah' }} />
        <Stack.Screen name="calendar" options={{ title: 'Islamic Calendar' }} />
        <Stack.Screen name="story/[id]" options={{ headerShown: false }} />
      </Stack>
    </ThemeProvider>
  );
}

