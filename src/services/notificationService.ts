import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { PrayerService } from './prayerService';
import { SettingsService } from './settingsService';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export const NotificationService = {
  requestPermissions: async () => {
    if (Device.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== 'granted') {
        return false;
      }
      return true;
    }
    return false;
  },

  schedulePrayerNotifications: async () => {
    const hasPermission = await NotificationService.requestPermissions();
    if (!hasPermission) return;

    // Clear existing notifications to avoid duplicates
    await Notifications.cancelAllScheduledNotificationsAsync();

    const settings = await SettingsService.getSettings();
    
    if (!settings.notificationsEnabled) {
      await Notifications.cancelAllScheduledNotificationsAsync();
      return;
    }

    const date = new Date();
    
    // Schedule for the next 3 days
    for (let i = 0; i < 3; i++) {
      const targetDate = new Date();
      targetDate.setDate(date.getDate() + i);
      const dateString = `${targetDate.getDate().toString().padStart(2, '0')}-${(targetDate.getMonth() + 1).toString().padStart(2, '0')}-${targetDate.getFullYear()}`;
      
      const data = await PrayerService.getPrayerTimesByDate(dateString, settings.locationCity, settings.locationCountry);
      if (!data) continue;

      const prayers = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
      for (const prayer of prayers) {
        const timeStr = (data.timings as any)[prayer];
        const [hours, minutes] = timeStr.split(':').map(Number);
        
        const scheduleDate = new Date(targetDate);
        scheduleDate.setHours(hours, minutes, 0, 0);

        // Only schedule if it's in the future
        if (scheduleDate > new Date()) {
          await Notifications.scheduleNotificationAsync({
            content: {
              title: `Prayer Time: ${prayer}`,
              body: `It is time for ${prayer}. "Success is through prayer."`,
              data: { prayer },
              sound: true,
            },
            trigger: { date: scheduleDate } as any,
          });
        }
      }
    }
  },

  setupNotificationChannels: async () => {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#059669',
      });
    }
  },
};
