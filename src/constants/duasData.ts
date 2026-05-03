export interface Dua {
  id: string;
  title: string;
  arabic: string;
  transliteration: string;
  translation: string;
  reference: string;
  category?: 'Morning' | 'Evening' | 'General';
}

export const DUAS: Dua[] = [
  {
    id: 'morning-1',
    title: 'Morning Supplication',
    category: 'Morning',
    arabic: 'اللّهُـمَّ بِكَ أَصْـبَحْنا وَبِكَ أَمْسَـينا، وَبِكَ نَحْـيا وَبِكَ نَمُـوتُ وَإِلَـيْكَ النُّـشور.',
    transliteration: 'Allahumma bika asbahna, wa bika amsayna, wa bika nahya, wa bika namut, wa ilaykan-nushur.',
    translation: 'O Allah, by You we enter the morning and by You we enter the evening, by You we live and by You we die, and to You is the Final Return.',
    reference: 'Abu Dawud, Tirmidhi'
  },
  {
    id: 'morning-2',
    title: 'Sayyidul Istighfar',
    category: 'Morning',
    arabic: 'اللَّهُمَّ أَنْتَ رَبِّي لا إِلَهَ إِلا أَنْتَ ، خَلَقْتَنِي وَأَنَا عَبْدُكَ ، وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ ، أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ ، أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ ، وَأَبُوءُ لَكَ بِذَنْبِي فَاغْفِرْ لِي فَإِنَّهُ لا يَغْفِرُ الذُّنُوبَ إِلا أَنْتَ .',
    transliteration: 'Allahumma Anta Rabbi, la ilaha illa Anta, khalaqtani wa ana abduka, wa ana ala ahdika wa wa’dika mastata’tu, a’udhu bika min sharri ma sana’tu, abu’u laka bini’matika alayya, wa abu’u bidhanbi faghfir li, fa-innahu la yaghfirudh-dhunuba illa Anta.',
    translation: 'O Allah, You are my Lord, there is no God but You. You created me and I am Your slave, and I am faithful to my covenant and my promise as much as I can. I seek refuge in You from the evil of what I have done. I acknowledge before You all the blessings You have bestowed upon me, and I confess to You all my sins. So grant me forgiveness, for nobody can forgive sins except You.',
    reference: 'Sahih Al-Bukhari'
  },
  {
    id: 'morning-3',
    title: 'Universal Praise',
    category: 'Morning',
    arabic: 'أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ ، وَالْحَمْدُ لِلَّهِ ، لا إِلَهَ إِلا اللَّهُ وَحْدَهُ لا شَرِيكَ لَهُ ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ .',
    transliteration: 'Asbahna wa asbahal-mulku lillahi walhamdu lillahi, la ilaha illallahu wahdahu la sharika lahu, lahul-mulku wa lahul-hamdu wa huwa ala kulli shay’in qadir.',
    translation: 'We have reached the morning and at this very time unto Allah belongs all sovereignty, and all praise is for Allah. None has the right to be worshipped but Allah alone, Who has no partner. His is the dominion and His is the praise, and He is Able to do all things.',
    reference: 'Sahih Muslim'
  },
  {
    id: 'morning-4',
    title: 'Beneficial Knowledge',
    category: 'Morning',
    arabic: 'اللَّهُمَّ إِنِّي أَسْأَلُكَ عِلْمًا نَافِعًا ، وَرِزْقًا طَيِّبًا ، وَعَمَلا مُتَقَبَّلا .',
    transliteration: 'Allahumma inni as’aluka ‘ilman nafi’an, wa rizqan tayyiban, wa ‘amalan mutaqabbalan.',
    translation: 'O Allah, I ask You for knowledge that is of benefit, a good provision, and deeds that will be accepted.',
    reference: 'Ibn Majah'
  },
  {
    id: 'morning-5',
    title: 'Seeking Protection',
    category: 'Morning',
    arabic: 'اللَّهُمَّ عافِني في بَدَني، اللَّهُمَّ عافِني في سَمْعي، اللَّهُمَّ عافِني في بَصَري، لا إلهَ إلاّ أَنْتَ.',
    transliteration: 'Allahumma ‘afini fi badani, Allahumma ‘afini fi sam’i, Allahumma ‘afini fi basari, la ilaha illa Anta.',
    translation: 'O Allah, make me healthy in my body. O Allah, make me healthy in my hearing. O Allah, make me healthy in my sight. There is no deity except You.',
    reference: 'Abu Dawud'
  },
  {
    id: 'morning-6',
    title: 'Glorification (100x)',
    category: 'Morning',
    arabic: 'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ .',
    transliteration: 'Subhanallahi wa bihamdihi.',
    translation: 'How perfect Allah is and I praise Him.',
    reference: 'Sahih Muslim'
  },
  {
    id: 'evening-1',
    title: 'Evening Supplication',
    category: 'Evening',
    arabic: 'اللّهُـمَّ بِكَ أَمْسَـينا وَبِكَ أَصْـبَحْنا، وَبِكَ نَحْـيا وَبِكَ نَمُـوتُ وَإِلَـيْكَ المَصـير.',
    transliteration: 'Allahumma bika amsayna, wa bika asbahna, wa bika nahya, wa bika namut, wa ilaykal-masir.',
    translation: 'O Allah, by You we enter the evening and by You we enter the morning, by You we live and by You we die, and to You is the Final Return.',
    reference: 'Abu Dawud, Tirmidhi'
  },
  {
    id: 'evening-2',
    title: 'Protection from Harm',
    category: 'Evening',
    arabic: 'بِسْمِ اللهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الْأَرْضِ وَلَا فِي السَّمَاءِ وَهُوَ السَّمِيعُ الْعَلِيمُ',
    transliteration: 'Bismillahil-ladhi la yadurru ma\'as-mihi shay\'un fil-ardi wa la fis-sama\'i wa Huwas-Sami\'ul-Alim.',
    translation: 'In the Name of Allah, Who with His Name nothing can cause harm in the earth nor in the heavens, and He is the All-Hearing, the All-Knowing.',
    reference: 'Abu Dawud, Tirmidhi'
  },
  {
    id: 'evening-3',
    title: 'Seeking Refuge',
    category: 'Evening',
    arabic: 'أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ .',
    transliteration: 'A’udhu bi kalimatillahi-t-tammati min sharri ma khalaq.',
    translation: 'I seek refuge in Allah’s perfect words from the evil of what He has created.',
    reference: 'Sahih Muslim'
  },
  {
    id: 'evening-4',
    title: 'Contentment with Islam',
    category: 'Evening',
    arabic: 'رَضِيتُ بِاللَّهِ رَبًّا ، وَبِالإِسْلامِ دِينًا ، وَبِمُحَمَّدٍ صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ نَبِيًّا .',
    transliteration: 'Raditu billahi Rabban, wa bil-Islami dinan, wa bi Muhammadin (sallallahu ‘alayhi wa sallam) Nabiyyan.',
    translation: 'I have become pleased with Allah as my Lord, with Islam as my religion and with Muhammad (PBUH) as my Prophet.',
    reference: 'Abu Dawud'
  },
  {
    id: 'evening-5',
    title: 'Protection from Debts',
    category: 'Evening',
    arabic: 'اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْهَمِّ وَالْحَزَنِ ، وَالْعَجْزِ وَالْكَسَلِ ، وَالْبُخْلِ وَالْجُبْنِ ، وَضَلَعِ الدَّيْنِ وَغَلَبَةِ الرِّجَالِ .',
    transliteration: 'Allahumma inni a’udhu bika minal-hammi wal-hazan, wal-ajzi wal-kasal, wal-bukhli wal-jubn, wa dala’id-dayni wa ghalabatir-rijal.',
    translation: 'O Allah, I seek refuge in You from anxiety and sorrow, from inability and laziness, from miserliness and cowardice, from the burden of debt and from being overpowered by men.',
    reference: 'Sahih Al-Bukhari'
  },
  {
    id: 'evening-6',
    title: 'Universal Evening Praise',
    category: 'Evening',
    arabic: 'أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ ، وَالْحَمْدُ لِلَّهِ ، لا إِلَهَ إِلا اللَّهُ وَحْدَهُ لا شَرِيكَ لَهُ ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ .',
    transliteration: 'Amsayna wa amsal-mulku lillahi walhamdu lillahi, la ilaha illallahu wahdahu la sharika lahu, lahul-mulku wa lahul-hamdu wa huwa ala kulli shay’in qadir.',
    translation: 'We have reached the evening and at this very time unto Allah belongs all sovereignty, and all praise is for Allah. None has the right to be worshipped but Allah alone, Who has no partner. His is the dominion and His is the praise, and He is Able to do all things.',
    reference: 'Sahih Muslim'
  },
  {
    id: 'distress-1',
    title: 'Supplication for Distress',
    category: 'General',
    arabic: 'لا إِلَهَ إِلاَّ أَنْتَ سُبْحَانَكَ إِنِّي كُنْتُ مِنَ الظَّالِمِينَ',
    transliteration: 'La ilaha illa Anta, Subhanaka, inni kuntu minaz-zalimin.',
    translation: 'There is no deity except You; exalted are You. Indeed, I have been of the wrongdoers.',
    reference: 'Quran 21:87'
  }
];
