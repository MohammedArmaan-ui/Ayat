import React, { useEffect, useState } from 'react';
import { Redirect } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';
import { SettingsService } from '../src/services/settingsService';
import { AuthService } from '../src/services/authService';
import { NotificationService } from '../src/services/notificationService';

export default function Index() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    checkAuth();
    // Safety fallback: if auth resolution takes more than 1 second, proceed to prevent blank/frozen screen
    const timer = setTimeout(() => {
      setIsAuthenticated(prev => (prev === null ? false : prev));
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const checkAuth = async () => {
    try {
      const settings = await SettingsService.getSettings();
      setIsAuthenticated(settings.isAuthenticated);

      // Notify admin email of user entering Ayat
      const user = await AuthService.getFirstUser().catch(() => null);
      NotificationService.trackAppEntry({
        name: user?.name || settings.userName,
        email: user?.email,
      }).catch(() => {});
    } catch {
      setIsAuthenticated(false);
      NotificationService.trackAppEntry(null).catch(() => {});
    }
  };

  if (isAuthenticated === null) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#059669" />
      </View>
    );
  }

  if (isAuthenticated) {
    return <Redirect href="/(tabs)" />;
  } else {
    return <Redirect href="/login" />;
  }
}
