export interface Surah {
  id: number;
  name_arabic: string;
  name_transliteration: string;
  name_translation: string;
  total_ayahs: number;
  revelation_type: 'Meccan' | 'Medinan';
}

export interface Ayah {
  id: number;
  surah_id: number;
  ayah_number: number;
  text_uthmani: string;
  text_indo_pak?: string;
  juz: number;
  hizb: number;
  rub_el_hizb: number;
  sajdah: boolean;
  translation?: string;
  transliteration?: string;
}

export interface AyahWord {
  id: number;
  ayah_id: number;
  word_position: number;
  word_arabic: string;
  transliteration: string;
  translation: string;
  root_letters?: string;
}

export interface Bookmark {
  id: number;
  ayah_id: number;
  user_note?: string;
  tag?: string;
  created_at: string;
  is_favorite: boolean;
}

export interface Reflection {
  id: number;
  ayah_id: number;
  note: string;
  action_plan?: string;
  created_at: string;
}

export interface Progress {
  id: number;
  ayah_id: number;
  status: 'read' | 'memorized' | 'review';
  last_access: string;
}
