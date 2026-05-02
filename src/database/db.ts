import * as SQLite from 'expo-sqlite';

export const db = SQLite.openDatabaseSync('ayat.db');

export const initDatabase = async () => {
  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    
    CREATE TABLE IF NOT EXISTS surah (
      id INTEGER PRIMARY KEY,
      name_arabic TEXT,
      name_transliteration TEXT,
      name_translation TEXT,
      total_ayahs INTEGER,
      revelation_type TEXT
    );

    CREATE TABLE IF NOT EXISTS ayah (
      id INTEGER PRIMARY KEY,
      surah_id INTEGER,
      ayah_number INTEGER,
      text_uthmani TEXT,
      text_indo_pak TEXT,
      juz INTEGER,
      hizb INTEGER,
      rub_el_hizb INTEGER,
      sajdah BOOLEAN,
      FOREIGN KEY(surah_id) REFERENCES surah(id),
      UNIQUE(surah_id, ayah_number)
    );

    CREATE TABLE IF NOT EXISTS translation (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ayah_id INTEGER,
      language TEXT,
      translator TEXT,
      text TEXT,
      FOREIGN KEY(ayah_id) REFERENCES ayah(id)
    );

    CREATE TABLE IF NOT EXISTS bookmark (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ayah_id INTEGER,
      user_note TEXT,
      tag TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      is_favorite BOOLEAN DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS reflection (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ayah_id INTEGER,
      note TEXT,
      action_plan TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS progress (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ayah_id INTEGER,
      status TEXT,
      last_access DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT
    );

    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      email TEXT UNIQUE,
      password TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS prayer_tracking (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT,
      prayer_name TEXT,
      completed BOOLEAN DEFAULT 0,
      UNIQUE(date, prayer_name)
    );
  `);
};
