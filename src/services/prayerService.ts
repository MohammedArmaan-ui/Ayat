
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
  }
};
