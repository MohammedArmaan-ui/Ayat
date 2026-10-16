export interface CharityCause {
  id: string;
  title: string;
  subtitle: string;
  category: 'water' | 'orphans' | 'food' | 'emergency' | 'mosque';
  categoryLabel: string;
  description: string;
  iconName: string;
  targetAmount: number;
  raisedAmount: number;
  donorCount: number;
  hadithQuote: string;
  hadithSource: string;
  suggestedAmounts: number[];
  verifiedPartner: string;
  isUrgent?: boolean;
}

export const CHARITY_CATEGORIES = [
  { id: 'all', label: 'All Causes' },
  { id: 'emergency', label: 'Urgent Relief' },
  { id: 'water', label: 'Water Wells' },
  { id: 'orphans', label: 'Orphan Care' },
  { id: 'food', label: 'Food Packages' },
  { id: 'mosque', label: 'Mosque & Quran' },
];

export const CHARITY_CAUSES: CharityCause[] = [
  {
    id: 'gaza-emergency',
    title: 'Gaza Humanitarian Emergency Relief',
    subtitle: 'Urgent medical care, clean water, tents & infant nutrition.',
    category: 'emergency',
    categoryLabel: 'Urgent Relief',
    description: 'Provide immediate life-saving food parcels, clean drinking water desalination, emergency surgical medical kits, and temporary winterized shelters for displaced families and wounded civilians facing severe crisis.',
    iconName: 'ShieldAlert',
    targetAmount: 250000,
    raisedAmount: 184500,
    donorCount: 3420,
    hadithQuote: '"The believer’s shade on the Day of Resurrection will be their charity."',
    hadithSource: 'Sunan al-Tirmidhi',
    suggestedAmounts: [25, 50, 100, 250, 500],
    verifiedPartner: 'Palestinian Children Relief Fund & Red Crescent',
    isUrgent: true,
  },
  {
    id: 'water-well-africa',
    title: 'Clean Water Well (Sadaqah Jariyah)',
    subtitle: 'Build solar-powered deep boreholes in drought regions.',
    category: 'water',
    categoryLabel: 'Water Wells',
    description: 'Bring clean, safe drinking water to remote villages in East Africa and South Asia. One water well provides continuous, disease-free drinking water for over 500 villagers and their livestock for 15+ years.',
    iconName: 'Droplets',
    targetAmount: 45000,
    raisedAmount: 32800,
    donorCount: 890,
    hadithQuote: '"The best charity is to give water to drink."',
    hadithSource: 'Sunan an-Nasa’i',
    suggestedAmounts: [20, 50, 100, 300, 1000],
    verifiedPartner: 'Drop of Life Foundation & Islamic Relief',
  },
  {
    id: 'orphan-sponsorship',
    title: 'Sponsor an Orphan Child',
    subtitle: 'Complete education, nutritious food, clothes & healthcare.',
    category: 'orphans',
    categoryLabel: 'Orphan Care',
    description: 'Ensure a vulnerable orphaned child receives comprehensive care including balanced nutrition, quality schooling, school supplies, healthcare, psychosocial support, and Eid clothing in a loving family setting.',
    iconName: 'Users',
    targetAmount: 80000,
    raisedAmount: 61400,
    donorCount: 1240,
    hadithQuote: '"I and the one who looks after an orphan will be like this in Paradise," showing his two fingers.',
    hadithSource: 'Sahih al-Bukhari',
    suggestedAmounts: [35, 70, 150, 420, 840],
    verifiedPartner: 'Global Orphan Care Network',
  },
  {
    id: 'food-baskets',
    title: 'Feed Hungry Families (Food Rations)',
    subtitle: 'Wholesome monthly staples: flour, rice, oil, lentils & dates.',
    category: 'food',
    categoryLabel: 'Food Packages',
    description: 'Combat acute malnutrition among destitute families and elderly widows by providing a 30-day comprehensive food basket packed with rice, flour, oil, legumes, sugar, milk, and dates.',
    iconName: 'Utensils',
    targetAmount: 50000,
    raisedAmount: 41200,
    donorCount: 970,
    hadithQuote: '"Worship the Most Merciful, feed the hungry, and spread peace; you will enter Paradise in safety."',
    hadithSource: 'Sunan al-Tirmidhi',
    suggestedAmounts: [15, 30, 60, 120, 250],
    verifiedPartner: 'World Food Relief Program',
  },
  {
    id: 'mosque-construction',
    title: 'Village Mosque & Community Center',
    subtitle: 'Build a blessed house of Allah for prayer and children learning.',
    category: 'mosque',
    categoryLabel: 'Mosque & Quran',
    description: 'Construct a permanent brick-and-mortar masjid in rural communities with wudu facilities, solar lighting, and a Quranic madrasah where daily prayers, Jumu’ah, and Islamic education take place.',
    iconName: 'Building',
    targetAmount: 120000,
    raisedAmount: 89500,
    donorCount: 1650,
    hadithQuote: '"Whoever builds a mosque for Allah, Allah will build for them a house like it in Paradise."',
    hadithSource: 'Sahih Muslim',
    suggestedAmounts: [50, 100, 250, 500, 1500],
    verifiedPartner: 'Masjid Builders Trust',
  },
  {
    id: 'quran-distribution',
    title: 'Holy Quran Printing & Distribution',
    subtitle: 'Print authentic Mushafs for madrasahs and new Muslims.',
    category: 'mosque',
    categoryLabel: 'Mosque & Quran',
    description: 'Print high-quality Arabic Mushafs, braille Qurans, and translated copies to be distributed free to remote villages, youth madrasahs, and new converts eager to learn the Book of Allah.',
    iconName: 'Sparkles',
    targetAmount: 30000,
    raisedAmount: 23900,
    donorCount: 620,
    hadithQuote: '"The best of you are those who learn the Quran and teach it."',
    hadithSource: 'Sahih al-Bukhari',
    suggestedAmounts: [10, 25, 50, 100, 200],
    verifiedPartner: 'Quranic Heritage Foundation',
  },
];
