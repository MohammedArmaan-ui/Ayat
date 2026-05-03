export interface IslamicHoliday {
  id: string;
  title: string;
  hijriDate: string; // "DD-MM"
  description: string;
  type: 'Major' | 'Significant';
}

export const ISLAMIC_HOLIDAYS: IslamicHoliday[] = [
  {
    id: 'ramadan-start',
    title: 'Start of Ramadan',
    hijriDate: '01-09',
    description: 'The beginning of the holy month of fasting.',
    type: 'Major',
  },
  {
    id: 'laylat-al-qadr',
    title: 'Laylat al-Qadr',
    hijriDate: '27-09',
    description: 'The Night of Power, better than a thousand months.',
    type: 'Major',
  },
  {
    id: 'eid-al-fitr',
    title: 'Eid al-Fitr',
    hijriDate: '01-10',
    description: 'Festival of Breaking the Fast.',
    type: 'Major',
  },
  {
    id: 'hajj-start',
    title: 'Start of Hajj',
    hijriDate: '08-12',
    description: 'The beginning of the annual pilgrimage to Mecca.',
    type: 'Significant',
  },
  {
    id: 'day-of-arafah',
    title: 'Day of Arafah',
    hijriDate: '09-12',
    description: 'The most important day of Hajj.',
    type: 'Major',
  },
  {
    id: 'eid-al-adha',
    title: 'Eid al-Adha',
    hijriDate: '10-12',
    description: 'Festival of Sacrifice.',
    type: 'Major',
  },
  {
    id: 'islamic-new-year',
    title: 'Islamic New Year',
    hijriDate: '01-01',
    description: 'The beginning of the new Hijri year (1st Muharram).',
    type: 'Significant',
  },
  {
    id: 'ashura',
    title: 'Ashura',
    hijriDate: '10-01',
    description: 'A day of fasting and remembrance.',
    type: 'Significant',
  },
  {
    id: 'mawlid-al-nabi',
    title: 'Mawlid al-Nabi',
    hijriDate: '12-03',
    description: 'The birth of Prophet Muhammad (PBUH).',
    type: 'Significant',
  },
  {
    id: 'isra-wal-miraj',
    title: 'Isra and Mi\'raj',
    hijriDate: '27-07',
    description: 'The Night Journey and Ascension of the Prophet (PBUH).',
    type: 'Significant',
  },
];
