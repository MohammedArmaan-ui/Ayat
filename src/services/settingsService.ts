import { getDb } from '../database/db';

export type AppTheme = 'light' | 'dark' | 'sepia';
export type TranslationLanguage = 'en' | 'bn' | 'ur' | 'tr';

export interface AppSettings {
  theme: AppTheme;
  fontSize: number;
  translationEnabled: boolean;
  transliterationEnabled: boolean;
  wordByWordEnabled: boolean;
  translationLanguage: TranslationLanguage;
  selectedSpeaker: string;
  fontFamily: string;
  locationCity: string;
  locationCountry: string;
  timeFormat: '12h' | '24h';
  isAuthenticated: boolean;
  userName: string;
  lastReadSurah?: number;
  currency: string;
}

const DEFAULT_SETTINGS: AppSettings = {
  theme: 'light',
  fontSize: 24,
  translationEnabled: true,
  transliterationEnabled: true,
  wordByWordEnabled: false,
  translationLanguage: 'en',
  selectedSpeaker: 'ar.alafasy',
  fontFamily: 'System',
  locationCity: 'London',
  locationCountry: 'UK',
  timeFormat: '12h',
  isAuthenticated: false,
  userName: 'Servant of Allah',
  currency: 'USD',
};

export const SettingsService = {
  getSettings: async (): Promise<AppSettings> => {
    try {
      const db = getDb();
      if (!db) return DEFAULT_SETTINGS;
      const rows = await db.getAllAsync<{ key: string, value: string }>('SELECT * FROM settings');
      const settings = { ...DEFAULT_SETTINGS };
      rows.forEach(row => {
        (settings as any)[row.key] = JSON.parse(row.value);
      });
      return settings;
    } catch {
      return DEFAULT_SETTINGS;
    }
  },

  updateSetting: async (key: keyof AppSettings, value: any): Promise<void> => {
    const db = getDb();
    if (!db) return;
    await db.runAsync(
      'INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)',
      [key, JSON.stringify(value)]
    );
  }
};

