import { db } from '../database/db';
import { Surah, Ayah } from '../models/types';

export const QuranService = {
  getSurahs: async (): Promise<Surah[]> => {
    return await db.getAllAsync<Surah>('SELECT * FROM surah ORDER BY id ASC');
  },

  getAyahsBySurah: async (surahId: number): Promise<Ayah[]> => {
    return await db.getAllAsync<Ayah>(`
      SELECT a.*, t.text as translation 
      FROM ayah a
      LEFT JOIN translation t ON a.id = t.ayah_id AND t.language = 'en'
      WHERE a.surah_id = ?
      ORDER BY a.ayah_number ASC
    `, [surahId]);
  },

  seedInitialData: async () => {
    const surahCount = await db.getFirstAsync<{ count: number }>('SELECT COUNT(*) as count FROM surah');
    if (surahCount?.count === 0) {
      // Seed Al-Fatiha
      await db.runAsync(
        'INSERT INTO surah (id, name_arabic, name_transliteration, name_translation, total_ayahs, revelation_type) VALUES (?, ?, ?, ?, ?, ?)',
        [1, 'الفاتحة', 'Al-Fatiha', 'The Opening', 7, 'Meccan']
      );

      const fatiahAyahs = [
        { num: 1, ar: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ', en: 'In the name of Allah, the Entirely Merciful, the Especially Merciful.' },
        { num: 2, ar: 'الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ', en: '[All] praise is [due] to Allah, Lord of the worlds -' },
        { num: 3, ar: 'الرَّحْمَٰنِ الرَّحِيمِ', en: 'The Entirely Merciful, the Especially Merciful,' },
        { num: 4, ar: 'مَالِكِ يَوْمِ الدِّينِ', en: 'Sovereign of the Day of Recompense.' },
        { num: 5, ar: 'إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ', en: 'It is You we worship and You we instruct for help.' },
        { num: 6, ar: 'اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ', en: 'Guide us to the straight path -' },
        { num: 7, ar: 'صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ', en: 'The path of those upon whom You have bestowed favor, not of those who have evoked [Your] anger or of those who are astray.' },
      ];

      for (const a of fatiahAyahs) {
        const result = await db.runAsync(
          'INSERT INTO ayah (surah_id, ayah_number, text_uthmani, juz, hizb, rub_el_hizb, sajdah) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [1, a.num, a.ar, 1, 1, 1, 0]
        );
        await db.runAsync(
          'INSERT INTO translation (ayah_id, language, translator, text) VALUES (?, ?, ?, ?)',
          [result.lastInsertRowId, 'en', 'Sahih International', a.en]
        );
      }
    }
  },

  toggleBookmark: async (ayahId: number): Promise<boolean> => {
    const existing = await db.getFirstAsync<{ id: number }>('SELECT id FROM bookmark WHERE ayah_id = ?', [ayahId]);
    if (existing) {
      await db.runAsync('DELETE FROM bookmark WHERE ayah_id = ?', [ayahId]);
      return false;
    } else {
      await db.runAsync('INSERT INTO bookmark (ayah_id, is_favorite) VALUES (?, ?)', [ayahId, 1]);
      return true;
    }
  },

  isBookmarked: async (ayahId: number): Promise<boolean> => {
    const result = await db.getFirstAsync<{ id: number }>('SELECT id FROM bookmark WHERE ayah_id = ?', [ayahId]);
    return !!result;
  },

  saveReflection: async (ayahId: number, note: string): Promise<void> => {
    await db.runAsync('INSERT INTO reflection (ayah_id, note) VALUES (?, ?)', [ayahId, note]);
  }
};

