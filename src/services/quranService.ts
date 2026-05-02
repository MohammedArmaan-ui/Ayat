import { db } from '../database/db';
import { Surah, Ayah } from '../models/types';
import { SURAH_DATA } from '../constants/surahData';

export const QuranService = {
  getSurahs: async (): Promise<Surah[]> => {
    return await db.getAllAsync<Surah>('SELECT * FROM surah ORDER BY id ASC');
  },

  getAyahsBySurah: async (surahId: number): Promise<Ayah[]> => {
    const existing = await db.getAllAsync<Ayah>(
      `SELECT a.*, 
              t.text as translation,
              tl.text as transliteration
       FROM ayah a 
       LEFT JOIN translation t ON a.id = t.ayah_id AND t.language = 'en'
       LEFT JOIN translation tl ON a.id = tl.ayah_id AND tl.language = 'en-tl'
       WHERE a.surah_id = ? 
       ORDER BY a.ayah_number ASC`,
      [surahId]
    );

    if (existing.length > 0) {
      return existing;
    }

    // If no ayahs, fetch from API (AlQuran.cloud)
    try {
      const response = await fetch(`https://api.alquran.cloud/v1/surah/${surahId}/editions/quran-uthmani,en.sahih,en.transliteration`);
      const json = await response.json();
      
      if (json.code === 200) {
        const arabicEdition = json.data[0];
        const translationEdition = json.data[1];
        const transliterationEdition = json.data[2];

        // Clear any partial/stale data for this surah before inserting fresh API data
        await db.runAsync('DELETE FROM translation WHERE ayah_id IN (SELECT id FROM ayah WHERE surah_id = ?)', [surahId]);
        await db.runAsync('DELETE FROM ayah WHERE surah_id = ?', [surahId]);

        for (let i = 0; i < arabicEdition.ayahs.length; i++) {
          const ar = arabicEdition.ayahs[i];
          const tr = translationEdition.ayahs[i];
          const tl = transliterationEdition.ayahs[i];

          const result = await db.runAsync(
            'INSERT INTO ayah (surah_id, ayah_number, text_uthmani, juz, hizb, rub_el_hizb, sajdah) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [surahId, ar.numberInSurah, ar.text, ar.juz, ar.hizbQuarter, ar.rubElHizb || 0, ar.sajdah ? 1 : 0]
          );
          
          await db.runAsync(
            'INSERT INTO translation (ayah_id, language, translator, text) VALUES (?, ?, ?, ?)',
            [result.lastInsertRowId, 'en', 'Sahih International', tr.text]
          );

          await db.runAsync(
            'INSERT INTO translation (ayah_id, language, translator, text) VALUES (?, ?, ?, ?)',
            [result.lastInsertRowId, 'en-tl', 'Transliteration', tl.text]
          );
        }

        // Return the newly cached data
        return await db.getAllAsync<Ayah>(
          `SELECT a.*, 
                  t.text as translation,
                  tl.text as transliteration
           FROM ayah a 
           LEFT JOIN translation t ON a.id = t.ayah_id AND t.language = 'en'
           LEFT JOIN translation tl ON a.id = tl.ayah_id AND tl.language = 'en-tl'
           WHERE a.surah_id = ? 
           ORDER BY a.ayah_number ASC`,
          [surahId]
        );
      }
    } catch (e) {
      console.error('Failed to fetch ayahs:', e);
    }

    return [];
  },

  seedInitialData: async () => {
    // Check if Fatihah is doubled or if we are missing surahs
    const fatihahCount = await db.getFirstAsync<{ count: number }>('SELECT COUNT(*) as count FROM ayah WHERE surah_id = 1');
    const surahCount = await db.getFirstAsync<{ count: number }>('SELECT COUNT(*) as count FROM surah');
    
    if ((surahCount && surahCount.count < 114) || (fatihahCount && fatihahCount.count > 7)) {
      await db.withTransactionAsync(async () => {
        // Clear all to ensure integrity
        await db.runAsync('DELETE FROM translation');
        await db.runAsync('DELETE FROM ayah');
        await db.runAsync('DELETE FROM surah');
        await db.runAsync('DELETE FROM bookmark'); // Reset bookmarks if data is corrupt
        
        for (const s of SURAH_DATA) {
          await db.runAsync(
            'INSERT INTO surah (id, name_arabic, name_transliteration, name_translation, total_ayahs, revelation_type) VALUES (?, ?, ?, ?, ?, ?)',
            [s.number, s.arabic_name, s.transliteration, s.english_translation, s.ayah_count, s.revelation]
          );
        }

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
      });
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
