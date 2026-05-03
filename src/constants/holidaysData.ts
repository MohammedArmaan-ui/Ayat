export interface IslamicHoliday {
  id: string;
  title: string;
  hijriDate: string; // "DD-MM"
  description: string;
  type: 'Major' | 'Significant';
}

export const ISLAMIC_HOLIDAYS: IslamicHoliday[] = [
  {
    id: 'islamic-new-year',
    title: 'Islamic New Year',
    hijriDate: '01-01',
    description: 'Marks the beginning of the Hijri year (1st Muharram).',
    type: 'Significant',
  },
  {
    id: 'ashura',
    title: 'Day of Ashura',
    hijriDate: '10-01',
    description: 'A day of fasting and remembrance. Commemorates the parting of the Red Sea by Prophet Musa (AS) and the martyrdom of Imam Hussain (RA).',
    type: 'Major',
  },
  {
    id: 'mawlid-al-nabi',
    title: 'Mawlid al-Nabi',
    hijriDate: '12-03',
    description: 'Commemorates the birth of Prophet Muhammad (PBUH). Observed on the 12th of Rabi\' al-Awwal.',
    type: 'Significant',
  },
  {
    id: 'isra-wal-miraj',
    title: 'Isra and Mi\'raj',
    hijriDate: '27-07',
    description: 'The miraculous Night Journey and Ascension of Prophet Muhammad (PBUH).',
    type: 'Significant',
  },
  {
    id: 'shab-e-barat',
    title: 'Shab-e-Barat',
    hijriDate: '15-08',
    description: 'The Night of Records or Night of Forgiveness. Observed on the 15th of Sha\'ban.',
    type: 'Significant',
  },
  {
    id: 'ramadan-start',
    title: 'Start of Ramadan',
    hijriDate: '01-09',
    description: 'The beginning of the holy month of fasting, prayer, and reflection.',
    type: 'Major',
  },
  {
    id: 'laylat-al-qadr',
    title: 'Laylat al-Qadr',
    hijriDate: '27-09',
    description: 'The Night of Power, marking the first revelation of the Quran. Generally observed on the 27th night of Ramadan.',
    type: 'Major',
  },
  {
    id: 'eid-al-fitr',
    title: 'Eid al-Fitr',
    hijriDate: '01-10',
    description: 'The Festival of Breaking the Fast, marking the end of Ramadan.',
    type: 'Major',
  },
  {
    id: 'hajj-start',
    title: 'Start of Hajj',
    hijriDate: '08-12',
    description: 'The beginning of the annual Hajj pilgrimage to Mecca.',
    type: 'Significant',
  },
  {
    id: 'day-of-arafah',
    title: 'Day of Arafah',
    hijriDate: '09-12',
    description: 'The second day of Hajj and the most important day of the pilgrimage.',
    type: 'Major',
  },
  {
    id: 'eid-al-adha',
    title: 'Eid al-Adha',
    hijriDate: '10-12',
    description: 'The Festival of Sacrifice, commemorating Prophet Ibrahim\'s willingness to sacrifice his son.',
    type: 'Major',
  },
  {
    id: 'eid-al-ghadir',
    title: 'Eid al-Ghadir',
    hijriDate: '18-12',
    description: 'Significant day marking the declaration at Ghadir Khumm.',
    type: 'Significant',
  },
];
