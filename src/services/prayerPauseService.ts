import { getDb } from '../database/db';
import { PrayerService, PrayerData } from './prayerService';

export type UzzaMood = 'Thriving' | 'Content' | 'Peaceful' | 'Reminding' | 'Sad' | 'Angry';

export interface PrayerPauseSettings {
  salahFocusEnabled: boolean;
  brickModeEnabled: boolean;
  unlockMode: 'honor' | 'proof';
  screenTimeMinutes: number;
  appOpens: number;
  focusMinutesToday: number;
}

export interface SalahEvaluation {
  mood: UzzaMood;
  vitality: number;
  currentPrayerDue: string | null;
  missedPrayers: string[];
  completedPrayers: string[];
  totalCompleted: number;
  title: string;
  subtitle: string;
  themeColor: string;
}

export const DEFAULT_PAUSE_SETTINGS: PrayerPauseSettings = {
  salahFocusEnabled: true,
  brickModeEnabled: false,
  unlockMode: 'honor',
  screenTimeMinutes: 102,
  appOpens: 8,
  focusMinutesToday: 45,
};

function parseTimeToMinutes(t: string | undefined): number {
  if (!t) return 0;
  const clean = t.split(' ')[0];
  const [h, m] = clean.split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
}

export const PrayerPauseService = {
  /**
   * Initializes SQLite table for Prayer Pause settings.
   */
  async initTable(): Promise<void> {
    try {
      const db = getDb();
      if (!db) return;
      await db.execAsync(`
        CREATE TABLE IF NOT EXISTS prayer_pause_settings (
          id INTEGER PRIMARY KEY DEFAULT 1,
          salah_focus INTEGER DEFAULT 1,
          brick_mode INTEGER DEFAULT 0,
          unlock_mode TEXT DEFAULT 'honor',
          screen_time_mins INTEGER DEFAULT 102,
          app_opens INTEGER DEFAULT 8,
          focus_mins INTEGER DEFAULT 45
        );
      `);
    } catch (e) {
      console.error('[PrayerPauseService] Failed to init table:', e);
    }
  },

  /**
   * Loads current Prayer Pause settings.
   */
  async getSettings(): Promise<PrayerPauseSettings> {
    try {
      await this.initTable();
      const db = getDb();
      if (!db) return DEFAULT_PAUSE_SETTINGS;
      const row = await db.getFirstAsync<any>(
        'SELECT * FROM prayer_pause_settings WHERE id = 1'
      );
      if (!row) {
        await db.runAsync(
          'INSERT OR IGNORE INTO prayer_pause_settings (id, salah_focus, brick_mode, unlock_mode, screen_time_mins, app_opens, focus_mins) VALUES (1, 1, 0, ?, 102, 8, 45)',
          [DEFAULT_PAUSE_SETTINGS.unlockMode]
        );
        return DEFAULT_PAUSE_SETTINGS;
      }
      return {
        salahFocusEnabled: row.salah_focus === 1,
        brickModeEnabled: row.brick_mode === 1,
        unlockMode: row.unlock_mode || 'honor',
        screenTimeMinutes: row.screen_time_mins ?? 102,
        appOpens: row.app_opens ?? 8,
        focusMinutesToday: row.focus_mins ?? 45,
      };
    } catch {
      return DEFAULT_PAUSE_SETTINGS;
    }
  },

  /**
   * Updates settings.
   */
  async updateSettings(partial: Partial<PrayerPauseSettings>): Promise<void> {
    try {
      await this.initTable();
      const db = getDb();
      if (!db) return;
      const current = await this.getSettings();
      const updated = { ...current, ...partial };
      await db.runAsync(
        `INSERT INTO prayer_pause_settings (id, salah_focus, brick_mode, unlock_mode, screen_time_mins, app_opens, focus_mins)
         VALUES (1, ?, ?, ?, ?, ?, ?)
         ON CONFLICT(id) DO UPDATE SET
           salah_focus = excluded.salah_focus,
           brick_mode = excluded.brick_mode,
           unlock_mode = excluded.unlock_mode,
           screen_time_mins = excluded.screen_time_mins,
           app_opens = excluded.app_opens,
           focus_mins = excluded.focus_mins`,
        [
          updated.salahFocusEnabled ? 1 : 0,
          updated.brickModeEnabled ? 1 : 0,
          updated.unlockMode,
          updated.screenTimeMinutes,
          updated.appOpens,
          updated.focusMinutesToday,
        ]
      );
    } catch (e) {
      console.error('[PrayerPauseService] Failed to update settings:', e);
    }
  },

  /**
   * Evaluates Uzza's emotion and vitality dynamically based on how the user prays their Salah!
   */
  evaluateSalahStatus(
    timings: PrayerData['timings'] | null,
    trackedPrayers: Record<string, boolean>,
    now: Date = new Date()
  ): SalahEvaluation {
    const currentMins = now.getHours() * 60 + now.getMinutes();

    // Default fallback times if timings are still loading
    const defaultTimings = {
      Fajr: '05:15',
      Sunrise: '06:30',
      Dhuhr: '12:30',
      Asr: '15:45',
      Maghrib: '18:15',
      Isha: '19:45',
    };

    const t = timings || defaultTimings;
    const fajr = parseTimeToMinutes(t.Fajr);
    const sunrise = parseTimeToMinutes(t.Sunrise);
    const dhuhr = parseTimeToMinutes(t.Dhuhr);
    const asr = parseTimeToMinutes(t.Asr);
    const maghrib = parseTimeToMinutes(t.Maghrib);
    const isha = parseTimeToMinutes(t.Isha);

    const prayers = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
    const completedPrayers = prayers.filter(p => !!trackedPrayers[p]);
    const totalCompleted = completedPrayers.length;

    const missedPrayers: string[] = [];
    let currentPrayerDue: string | null = null;
    let minutesRemainingInWindow = 999;

    // 1. Check Fajr
    if (currentMins >= fajr) {
      if (currentMins < sunrise) {
        if (!trackedPrayers['Fajr']) {
          currentPrayerDue = 'Fajr';
          minutesRemainingInWindow = sunrise - currentMins;
        }
      } else {
        if (!trackedPrayers['Fajr']) missedPrayers.push('Fajr');
      }
    }

    // 2. Check Dhuhr
    if (currentMins >= dhuhr) {
      if (currentMins < asr) {
        if (!trackedPrayers['Dhuhr']) {
          currentPrayerDue = 'Dhuhr';
          minutesRemainingInWindow = asr - currentMins;
        }
      } else {
        if (!trackedPrayers['Dhuhr']) missedPrayers.push('Dhuhr');
      }
    }

    // 3. Check Asr
    if (currentMins >= asr) {
      if (currentMins < maghrib) {
        if (!trackedPrayers['Asr']) {
          currentPrayerDue = 'Asr';
          minutesRemainingInWindow = maghrib - currentMins;
        }
      } else {
        if (!trackedPrayers['Asr']) missedPrayers.push('Asr');
      }
    }

    // 4. Check Maghrib
    if (currentMins >= maghrib) {
      if (currentMins < isha) {
        if (!trackedPrayers['Maghrib']) {
          currentPrayerDue = 'Maghrib';
          minutesRemainingInWindow = isha - currentMins;
        }
      } else {
        if (!trackedPrayers['Maghrib']) missedPrayers.push('Maghrib');
      }
    }

    // 5. Check Isha
    if (currentMins >= isha) {
      if (!trackedPrayers['Isha']) {
        currentPrayerDue = 'Isha';
        minutesRemainingInWindow = (24 * 60) - currentMins;
      }
    }

    // -------------------------------------------------------------
    // DETERMINE UZZA'S EMOTION BASED ON USER'S SALAH PERFORMANCE:
    // -------------------------------------------------------------

    // SCENARIO 1: Missed a prayer -> ANGRY / HISSING 😾
    if (missedPrayers.length > 0) {
      const vitality = Math.max(8, 40 - missedPrayers.length * 15);
      const names = missedPrayers.join(', ');
      return {
        mood: 'Angry',
        vitality,
        currentPrayerDue,
        missedPrayers,
        completedPrayers,
        totalCompleted,
        title: `Uzza is Upset! ${names} was missed ⚡`,
        subtitle: `Never abandon your Salah. Make Qada immediately and seek Allah's forgiveness.`,
        themeColor: '#EF4444',
      };
    }

    // SCENARIO 2: Current prayer is due and running out of time -> SAD / STRUGGLING 😿
    if (currentPrayerDue && minutesRemainingInWindow <= 35) {
      return {
        mood: 'Sad',
        vitality: 32,
        currentPrayerDue,
        missedPrayers,
        completedPrayers,
        totalCompleted,
        title: `${currentPrayerDue} is ending soon! 😿`,
        subtitle: `Only ${minutesRemainingInWindow}m left! Put the phone down and stand before Allah.`,
        themeColor: '#F59E0B',
      };
    }

    // SCENARIO 3: Current prayer is due right now -> REMINDING / PLEADING 🥺
    if (currentPrayerDue) {
      return {
        mood: 'Reminding',
        vitality: 58,
        currentPrayerDue,
        missedPrayers,
        completedPrayers,
        totalCompleted,
        title: `Hayya 'ala-s-Salah! It's time for ${currentPrayerDue} 🥺`,
        subtitle: `Uzza is looking up pleadingly. Perform Wudu and offer your prayer on time.`,
        themeColor: '#D97706',
      };
    }

    // SCENARIO 4: All 5 prayers of the day completed -> THRIVING / OVERJOYED 🌸
    if (totalCompleted === 5) {
      return {
        mood: 'Thriving',
        vitality: 100,
        currentPrayerDue: null,
        missedPrayers,
        completedPrayers,
        totalCompleted,
        title: `All 5 Prayers Completed! MashaAllah 🌸`,
        subtitle: `Uzza is thriving, purring, and overjoyed! Your spiritual light is shining bright.`,
        themeColor: '#10B981',
      };
    }

    // SCENARIO 5: All due prayers so far are prayed -> CONTENT or PEACEFUL
    // If night or late between prayers: Peaceful (curled asleep)
    // If during the active day: Content (sitting upright, purring)
    const isLateNight = currentMins > 22 * 60 || currentMins < fajr;
    if (isLateNight || totalCompleted >= 3) {
      return {
        mood: 'Peaceful',
        vitality: Math.min(95, 60 + totalCompleted * 8),
        currentPrayerDue: null,
        missedPrayers,
        completedPrayers,
        totalCompleted,
        title: `At Peace in the Remembrance of Allah 🌙`,
        subtitle: `All current prayers are prayed. Uzza is curled up resting peacefully.`,
        themeColor: '#3B82F6',
      };
    }

    return {
      mood: 'Content',
      vitality: Math.min(90, 50 + totalCompleted * 10),
      currentPrayerDue: null,
      missedPrayers,
      completedPrayers,
      totalCompleted,
      title: `On-Time & Purring Contentedly 🌿`,
      subtitle: `Alhamdulillah! You prayed on time. Uzza is happy and purring at your side.`,
      themeColor: '#10B981',
    };
  },

  /**
   * Returns metadata for manual testing or preview.
   */
  getMoodQuote(mood: UzzaMood): { title: string; subtitle: string } {
    switch (mood) {
      case 'Thriving':
        return {
          title: 'Uzza is Thriving & Overjoyed! 🌸',
          subtitle: 'MashaAllah! All your prayers are fulfilled and on time.',
        };
      case 'Content':
        return {
          title: 'Uzza is Content & Purring 🌿',
          subtitle: 'You offered your prayer on time. Heart at peace.',
        };
      case 'Peaceful':
        return {
          title: 'Uzza is Resting Peacefully 🌙',
          subtitle: 'Cozy and relaxed between prayers in remembrance of Allah.',
        };
      case 'Reminding':
        return {
          title: 'Hayya \'ala-s-Salah! Prayer is Due 🥺',
          subtitle: 'Uzza is looking up pleadingly — take your prayer pause now.',
        };
      case 'Sad':
        return {
          title: 'Uzza is Getting Sad & Worried 😿',
          subtitle: 'Prayer time is slipping away! Please do not delay your Salah.',
        };
      case 'Angry':
        return {
          title: 'Uzza is Upset & Hissing! ⚡',
          subtitle: 'A prayer was missed! Turn to Allah and make Qada immediately.',
        };
    }
  },
};
