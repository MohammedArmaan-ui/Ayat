import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import 'react-native-reanimated';

import { useColorScheme } from '@/components/useColorScheme';
import { initDatabase } from '../src/database/db';
import { Audio as ExpoAudio } from 'expo-av';
import { QuranService } from '../src/services/quranService';
import { CustomSplashScreen } from '../src/components/CustomSplashScreen';

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
      console.log('Starting setup...');
      try {
        console.log('Initializing database...');
        await initDatabase();
        console.log('Seeding initial data...');
        await QuranService.seedInitialData();
        console.log('Database ready!');
        setDbReady(true);
      } catch (e) {
        console.error('Database setup error:', e);
        setDbReady(true); // Proceed anyway to avoid permanent black screen
      }
    }
    setup();
  }, []);

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded && dbReady) {
      SplashScreen.hideAsync().catch(() => {
        /* ignore */
      });
    }
  }, [loaded, dbReady]);

  if (!loaded || !dbReady) {
    return (
      <View style={{ flex: 1, backgroundColor: '#064E3B', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#ffffff" />
      </View>
    );
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
        <Stack.Screen name="names-of-allah" options={{ title: '99 Names of Allah' }} />
        <Stack.Screen name="adhkar" options={{ title: 'Daily Adhkar' }} />
        <Stack.Screen name="story/[id]" options={{ headerShown: false }} />
      </Stack>
    </ThemeProvider>
  );
}

