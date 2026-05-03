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
    id: 'distress-1',
    title: 'Supplication for Distress',
    category: 'General',
    arabic: 'لا إِلَهَ إِلاَّ أَنْتَ سُبْحَانَكَ إِنِّي كُنْتُ مِنَ الظَّالِمِينَ',
    transliteration: 'La ilaha illa Anta, Subhanaka, inni kuntu minaz-zalimin.',
    translation: 'There is no deity except You; exalted are You. Indeed, I have been of the wrongdoers.',
    reference: 'Quran 21:87'
  }
];
