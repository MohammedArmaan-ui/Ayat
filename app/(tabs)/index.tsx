import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, useColorScheme, Image, Dimensions, Animated } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Clock, BookOpen, Calculator, RefreshCw, Book, ChevronRight, Heart, Bell, Settings } from 'lucide-react-native';
import { BlurView } from 'expo-blur';

import { Text } from '@/components/Themed';
import { Colors } from '../../src/theme/colors';
import { SettingsService, AppSettings } from '../../src/services/settingsService';
import { PrayerService, PrayerData } from '../../src/services/prayerService';
import { AuthService } from '../../src/services/authService';
import { DUAS } from '../../src/constants/duasData';
import { SURAH_DATA } from '../../src/constants/surahData';
import { STORIES } from '../../src/constants/storiesData';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [timings, setTimings] = useState<PrayerTimings | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [hijriDate, setHijriDate] = useState<any>(null);
  const [dailyDua, setDailyDua] = useState(DUAS[0]);
  const [dailyStory, setDailyStory] = useState(STORIES[0]);
  const [fadeAnim] = useState(new Animated.Value(0));
  
  const systemColorScheme = useColorScheme() ?? 'light';
  const theme = settings ? (Colors as any)[settings.theme] : (Colors as any)[systemColorScheme];
  const router = useRouter();

  const [userName, setUserName] = useState('Servant of Allah');

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();

    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const loadData = async () => {
    const s = await SettingsService.getSettings();
    setSettings(s);
    
    if (s.userName) {
      setUserName(s.userName.split(' ')[0]);
    }

    const date = new Date();
    const dateString = `${date.getDate().toString().padStart(2, '0')}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getFullYear()}`;
    const data = await PrayerService.getPrayerTimesByDate(dateString, s.locationCity, s.locationCountry);
    if (data) {
      setTimings(data);
      setHijriDate(data.hijri);
    }

    // Pick a random dua and story for the day (using date as seed)
    const dayOfYear = Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / 86400000);
    setDailyDua(DUAS[dayOfYear % DUAS.length]);
    setDailyStory(STORIES[dayOfYear % STORIES.length]);
  };

  const getNextPrayer = () => {
    if (!timings) return { name: '--', time: '--:--' };
    const now = currentTime;
    const currentTotalMinutes = now.getHours() * 60 + now.getMinutes();
    const prayers = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];

    for (const p of prayers) {
      const [h, m] = (timings.timings as any)[p].split(':').map(Number);
      if (h * 60 + m > currentTotalMinutes) {
        return { name: p, time: formatTime((timings.timings as any)[p]) };
      }
    }
    return { name: 'Fajr', time: formatTime(timings.timings.Fajr) };
  };

  const formatTime = (time: string) => {
    if (!time || !settings) return '--:--';
    if (settings.timeFormat === '24h') return time;
    const [hours, minutes] = time.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    return `${hours % 12 || 12}:${minutes.toString().padStart(2, '0')} ${period}`;
  };

  const QuickLink = ({ icon: Icon, title, route }: any) => (
    <TouchableOpacity 
      style={[styles.quickLink, { backgroundColor: theme.surface }]}
      onPress={() => router.push(route)}
    >
      <View style={[styles.linkIcon, { backgroundColor: theme.primary + '10' }]}>
        <Icon size={24} color={theme.primary} />
      </View>
      <Text style={[styles.linkTitle, { color: theme.text }]}>{title}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Animated.View style={[styles.header, { opacity: fadeAnim }]}>
          <View>
            <Text style={[styles.greeting, { color: theme.text }]}>As-salamu alaykum,</Text>
            <Text style={[styles.userName, { color: theme.primary }]}>{userName}</Text>
            {hijriDate && (
              <Text style={[styles.hijriDate, { color: theme.textSecondary }]}>
                {hijriDate.day} {hijriDate.month.en} {hijriDate.year} AH
              </Text>
            )}
          </View>
          <TouchableOpacity style={[styles.profileButton, { backgroundColor: theme.surface }]}>
            <Bell size={24} color={theme.text} />
          </TouchableOpacity>
        </Animated.View>

        {/* Prayer Highlights */}
        <TouchableOpacity 
          style={[styles.prayerCard, { backgroundColor: theme.primary }]}
          onPress={() => router.push('/(tabs)/prayer')}
        >
          <View style={styles.prayerInfo}>
            <Text style={styles.nextPrayerLabel}>Next Prayer</Text>
            <Text style={styles.nextPrayerName}>{getNextPrayer().name}</Text>
            <Text style={styles.nextPrayerTime}>{getNextPrayer().time}</Text>
          </View>
          <View style={styles.prayerGraphic}>
             <Clock size={80} color="rgba(255,255,255,0.2)" />
          </View>
        </TouchableOpacity>

        {/* Continue Reading Card */}
        {settings?.lastReadSurah && (
          <TouchableOpacity 
            style={[styles.continueCard, { backgroundColor: theme.surface, borderColor: theme.border }]}
            onPress={() => router.push({ pathname: '/(tabs)/reader', params: { surahId: settings.lastReadSurah } })}
          >
            <View style={[styles.linkIcon, { backgroundColor: theme.accent + '15' }]}>
              <BookOpen size={24} color={theme.accent} />
            </View>
            <View style={styles.continueContent}>
              <Text style={[styles.continueLabel, { color: theme.textSecondary }]}>Continue Reading</Text>
              <Text style={[styles.continueSurah, { color: theme.text }]}>
                Surah {SURAH_DATA.find(s => s.number === settings.lastReadSurah)?.transliteration || 'Quran'}
              </Text>
            </View>
            <ChevronRight size={20} color={theme.border} />
          </TouchableOpacity>
        )}

        {/* Daily Dua Section */}
        <View style={[styles.section, { marginTop: 24 }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Dua of the Day</Text>
          <View style={[styles.duaCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Text style={[styles.duaArabic, { color: theme.primary }]}>{dailyDua.arabic}</Text>
            <Text style={[styles.duaTranslation, { color: theme.textSecondary }]}>{dailyDua.translation}</Text>
            <View style={styles.duaFooter}>
              <Text style={[styles.duaRef, { color: theme.primary }]}>{dailyDua.reference}</Text>
              <TouchableOpacity>
                <Heart size={20} color={theme.primary} />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Quick Access */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Quick Access</Text>
          <View style={styles.quickLinksGrid}>
            <QuickLink icon={BookOpen} title="Reader" route="/(tabs)/reader" />
            <QuickLink icon={RefreshCw} title="Tasbih" route="/(tabs)/tasbih" />
            <QuickLink icon={Calculator} title="Zakat" route="/(tabs)/zakat" />
            <QuickLink icon={Book} title="Stories" route="/(tabs)/stories" />
            <QuickLink icon={Settings} title="Settings" route="/(tabs)/settings" />
          </View>
        </View>

        {/* Featured Story */}
        <TouchableOpacity 
          style={[styles.featuredCard, { backgroundColor: theme.surface }]}
          onPress={() => router.push(`/story/${dailyStory.id}` as any)}
        >
          <Image 
            source={{ uri: `https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=800&q=80&sig=${dailyStory.id}` }} 
            style={styles.featuredImage}
          />
          <View style={styles.featuredOverlay}>
            <View style={[styles.categoryBadge, { backgroundColor: theme.primary + '30' }]}>
              <Text style={[styles.categoryText, { color: '#FFF' }]}>Daily Story</Text>
            </View>
            <Text style={styles.featuredTitle}>{dailyStory.title}</Text>
            <View style={styles.featuredMeta}>
              <ChevronRight size={18} color="#FFF" />
            </View>
          </View>
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    paddingTop: 60,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  greeting: {
    fontSize: 16,
    fontWeight: '500',
  },
  userName: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  hijriDate: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 4,
  },
  profileButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  prayerCard: {
    borderRadius: 24,
    padding: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 8,
  },
  continueCard: {
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
  },
  continueContent: {
    flex: 1,
    marginLeft: 12,
  },
  continueLabel: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  continueSurah: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  prayerInfo: {
    flex: 1,
  },
  nextPrayerLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  nextPrayerName: {
    color: '#FFF',
    fontSize: 32,
    fontWeight: 'bold',
    marginVertical: 4,
  },
  nextPrayerTime: {
    color: '#FFF',
    fontSize: 18,
    opacity: 0.9,
  },
  prayerGraphic: {
    opacity: 0.5,
  },
  section: {
    marginTop: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  duaCard: {
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  duaArabic: {
    fontSize: 22,
    textAlign: 'center',
    lineHeight: 38,
    marginBottom: 16,
    fontFamily: 'System',
  },
  duaTranslation: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 22,
    fontStyle: 'italic',
  },
  duaFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  duaRef: {
    fontSize: 12,
    fontWeight: '600',
  },
  quickLinksGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  quickLink: {
    width: (width - 48 - 24) / 3,
    aspectRatio: 1,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 1,
  },
  linkIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  linkTitle: {
    fontSize: 12,
    fontWeight: '600',
  },
  featuredCard: {
    marginTop: 32,
    borderRadius: 24,
    height: 200,
    overflow: 'hidden',
    position: 'relative',
    marginBottom: 40,
  },
  featuredImage: {
    width: '100%',
    height: '100%',
  },
  featuredOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
  },
  blur: {
    ...StyleSheet.absoluteFillObject,
  },
  featuredContent: {
    padding: 20,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  featuredTag: {
    color: '#10B981',
    fontSize: 10,
    fontWeight: '900',
    marginBottom: 4,
  },
  featuredTitle: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  featuredSubtitle: {
    color: '#F3F4F6',
    fontSize: 12,
    opacity: 0.8,
  },
});
