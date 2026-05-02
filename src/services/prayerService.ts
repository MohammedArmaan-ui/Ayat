import { db } from '../database/db';

export interface PrayerTimings {
  Fajr: string;
  Sunrise: string;
  Dhuhr: string;
  Asr: string;
  Maghrib: string;
  Isha: string;
  Imsak: string;
  Midnight: string;
}

export const PrayerService = {
  getPrayerTimes: async (city: string = 'London', country: string = 'UK'): Promise<PrayerTimings | null> => {
    const finalCity = city || 'London';
    const finalCountry = country || 'UK';
    try {
      const response = await fetch(`https://api.aladhan.com/v1/timingsByCity?city=${encodeURIComponent(finalCity)}&country=${encodeURIComponent(finalCountry)}&method=2`);
      const json = await response.json();
      if (json.code === 200) {
        return json.data.timings;
      }
    } catch (e) {
      console.error('Failed to fetch prayer times:', e);
    }
    return null;
  },

  getPrayerTimesByDate: async (dateString: string, city: string = 'London', country: string = 'UK'): Promise<PrayerTimings | null> => {
    const finalCity = city || 'London';
    const finalCountry = country || 'UK';
    try {
      const response = await fetch(`https://api.aladhan.com/v1/timingsByCity/${dateString}?city=${encodeURIComponent(finalCity)}&country=${encodeURIComponent(finalCountry)}&method=2`);
      const json = await response.json();
      if (json.code === 200) {
        return json.data.timings;
      }
    } catch (e) {
      console.error('Failed to fetch prayer times for date:', e);
    }
    return null;
  },

  getTrackedPrayers: async (date: string): Promise<Record<string, boolean>> => {
    try {
      const rows = await db.getAllAsync<{ prayer_name: string, completed: number }>('SELECT prayer_name, completed FROM prayer_tracking WHERE date = ?', [date]);
      const result: Record<string, boolean> = {};
      rows.forEach(r => {
        result[r.prayer_name] = r.completed === 1;
      });
      return result;
    } catch (e) {
      console.error('Failed to fetch tracked prayers:', e);
      return {};
    }
  },

  togglePrayer: async (date: string, prayer_name: string, completed: boolean): Promise<void> => {
    try {
      await db.runAsync(
        'INSERT INTO prayer_tracking (date, prayer_name, completed) VALUES (?, ?, ?) ON CONFLICT(date, prayer_name) DO UPDATE SET completed = ?',
        [date, prayer_name, completed ? 1 : 0, completed ? 1 : 0]
      );
    } catch (e) {
      console.error('Failed to toggle prayer tracking:', e);
    }
  }
};
