import { getDb } from '../database/db';
import { PrayerService } from './prayerService';

export type UzzaMood = 'Thriving' | 'Content' | 'Tired' | 'Struggling' | 'Exhausted' | 'Collapsed';

export interface PrayerPauseSettings {
  salahFocusEnabled: boolean;
  brickModeEnabled: boolean;
  unlockMode: 'honor' | 'proof';
  screenTimeMinutes: number;
  appOpens: number;
  focusMinutesToday: number;
}

export const DEFAULT_PAUSE_SETTINGS: PrayerPauseSettings = {
  salahFocusEnabled: true,
  brickModeEnabled: false,
  unlockMode: 'honor',
  screenTimeMinutes: 102, // 1h 42m
  appOpens: 8,
  focusMinutesToday: 45,
};

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
   * Calculates Uzza's health score (0% to 100%) and mood based on completed prayers and screen time.
   */
  calculateVitality(prayersCompleted: number, screenTimeMins: number): { vitality: number; mood: UzzaMood } {
    // 5 prayers = up to 80 points (16 points per prayer)
    const prayerPoints = Math.min(5, Math.max(0, prayersCompleted)) * 16;
    
    // Low screen time bonus = up to 20 points
    // <= 60 mins = 20 pts, 120 mins = 14 pts, 180 mins = 8 pts, > 240 mins = 2 pts
    let screenBonus = 20;
    if (screenTimeMins > 240) screenBonus = 2;
    else if (screenTimeMins > 180) screenBonus = 8;
    else if (screenTimeMins > 120) screenBonus = 14;
    else if (screenTimeMins > 60) screenBonus = 18;

    const total = Math.min(100, Math.max(5, prayerPoints + screenBonus));

    return {
      vitality: total,
      mood: this.getMoodForVitality(total),
    };
  },

  /**
   * Maps a numerical vitality percentage to Uzza's character state.
   */
  getMoodForVitality(vitality: number): UzzaMood {
    if (vitality >= 90) return 'Thriving';
    if (vitality >= 70) return 'Content';
    if (vitality >= 50) return 'Tired';
    if (vitality >= 30) return 'Struggling';
    if (vitality >= 10) return 'Exhausted';
    return 'Collapsed';
  },

  /**
   * Returns a friendly Islamic motivational quote for each mood state.
   */
  getMoodQuote(mood: UzzaMood): { title: string; subtitle: string } {
    switch (mood) {
      case 'Thriving':
        return {
          title: 'Uzza is Thriving & Purring! 🌸',
          subtitle: 'MashaAllah! Your prayers are on time and your digital focus is strong.',
        };
      case 'Content':
        return {
          title: 'Uzza is Content & Peaceful 🌿',
          subtitle: 'Good balance today. Keep up your dhikr and stay mindful of the next Salah.',
        };
      case 'Tired':
        return {
          title: 'Uzza feels a bit sleepy 🥱',
          subtitle: 'Screen time is creeping up. Take a deep breath and prepare for the next prayer.',
        };
      case 'Struggling':
        return {
          title: 'Uzza is struggling with screen time 🍂',
          subtitle: 'Put the phone down, make fresh Wudu, and recharge your soul.',
        };
      case 'Exhausted':
        return {
          title: 'Uzza is exhausted 🥀',
          subtitle: 'Heavy scrolling drains spiritual energy. Pray your missed Salah to revive her.',
        };
      case 'Collapsed':
        return {
          title: 'Uzza has collapsed 💔',
          subtitle: 'Urgent pause needed! Lock your apps and turn your heart back to Allah.',
        };
    }
  },
};
