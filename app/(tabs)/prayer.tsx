import React, { useEffect, useState, useCallback } from 'react';
import { StyleSheet, View, ScrollView, useColorScheme, ActivityIndicator, RefreshControl } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { Clock, MapPin, ChevronRight } from 'lucide-react-native';

import { Text } from '@/components/Themed';
import { Colors } from '../../src/theme/colors';
import { SettingsService, AppSettings } from '../../src/services/settingsService';
import { PrayerService, PrayerTimings } from '../../src/services/prayerService';

export default function PrayerScreen() {
  const [timings, setTimings] = useState<PrayerTimings | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const systemColorScheme = useColorScheme() ?? 'light';

  const theme = settings ? (Colors as any)[settings.theme] : (Colors as any)[systemColorScheme];

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const loadData = async () => {
    const s = await SettingsService.getSettings();
    setSettings(s);
    const data = await PrayerService.getPrayerTimes(s.locationCity, s.locationCountry);
    setTimings(data);

    setLoading(false);
    setRefreshing(false);
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  if (loading) {
    return (
      <View style={[styles.centered, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  const prayerIcons: any = {
    Fajr: '🌅',
    Sunrise: '☀️',
    Dhuhr: '🕛',
    Asr: '🕒',
    Maghrib: '🌇',
    Isha: '🌙',
  };

  const prayers = ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];

  const getNextPrayer = () => {
    if (!timings) return { name: '--', time: '--:--', countdown: 'Loading...' };
    const now = currentTime;
    const currentTotalMinutes = now.getHours() * 60 + now.getMinutes();

    for (const p of prayers) {
      if (p === 'Sunrise') continue;
      const [h, m] = (timings as any)[p].split(':').map(Number);
      const prayerTotalMinutes = h * 60 + m;
      
      if (prayerTotalMinutes > currentTotalMinutes) {
        const diff = prayerTotalMinutes - currentTotalMinutes;
        const diffH = Math.floor(diff / 60);
        const diffM = diff % 60;
        const countdown = `Starts in ${diffH > 0 ? `${diffH}h ` : ''}${diffM}m`;
        return { name: p, time: formatTime((timings as any)[p]), countdown };
      }
    }
    
    // If all prayers passed, next one is Fajr tomorrow
    const [fh, fm] = timings.Fajr.split(':').map(Number);
    const fajrTotalMinutes = fh * 60 + fm;
    const diff = (24 * 60 - currentTotalMinutes) + fajrTotalMinutes;
    const diffH = Math.floor(diff / 60);
    const diffM = diff % 60;
    const countdown = `Starts in ${diffH > 0 ? `${diffH}h ` : ''}${diffM}m`;
    
    return { name: 'Fajr', time: formatTime(timings.Fajr), countdown };
  };

  const formatTime = (time: string) => {
    if (!time || !settings) return '--:--';
    if (settings.timeFormat === '24h') return time;
    
    const [hours, minutes] = time.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
  };

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: theme.background }]}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.primary} />}
    >
      <View style={styles.header}>
        <View style={styles.locationContainer}>
          <MapPin size={18} color={theme.primary} />
          <Text style={[styles.locationText, { color: theme.textSecondary }]}>
            {settings?.locationCity}, {settings?.locationCountry}
          </Text>
        </View>
        <Text style={[styles.dateText, { color: theme.text }]}>
          {new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}
        </Text>
      </View>

      <View style={[styles.mainCard, { backgroundColor: theme.primary }]}>
        <Text style={styles.nextPrayerLabel}>Next Prayer</Text>
        <Text style={styles.nextPrayerName}>{getNextPrayer().name}</Text>
        <Text style={styles.nextPrayerTime}>{getNextPrayer().time}</Text>
        <View style={styles.countdownContainer}>
          <Clock size={16} color="#FFF" style={{ opacity: 0.8 }} />
          <Text style={styles.countdownText}>{getNextPrayer().countdown}</Text>
        </View>
      </View>

      <View style={styles.prayerList}>
        {prayers.map((prayer) => (
          <View 
            key={prayer} 
            style={[styles.prayerRow, { backgroundColor: theme.surface, borderColor: theme.border }]}
          >
            <View style={styles.prayerInfo}>
              <Text style={styles.prayerIcon}>{prayerIcons[prayer]}</Text>
              <Text style={[styles.prayerName, { color: theme.text }]}>{prayer}</Text>
            </View>
            <View style={styles.timeInfo}>
              <Text style={[styles.prayerTime, { color: theme.primary }]}>
                {timings ? formatTime((timings as any)[prayer]) : '--:--'}
              </Text>
              <ChevronRight size={18} color={theme.border} />
            </View>
          </View>
        ))}
      </View>

      <View style={[styles.infoSection, { backgroundColor: theme.surface + '80' }]}>
        <Text style={[styles.infoTitle, { color: theme.primary }]}>Qibla Direction</Text>
        <Text style={[styles.infoText, { color: theme.textSecondary }]}>
          The Qibla is currently 119° SE from your location.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: 24,
    paddingBottom: 12,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  locationText: {
    fontSize: 14,
    marginLeft: 4,
    fontWeight: '500',
  },
  dateText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  mainCard: {
    margin: 20,
    marginTop: 8,
    borderRadius: 24,
    padding: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
  nextPrayerLabel: {
    color: '#FFF',
    fontSize: 14,
    opacity: 0.8,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  nextPrayerName: {
    color: '#FFF',
    fontSize: 36,
    fontWeight: 'bold',
    marginVertical: 4,
  },
  nextPrayerTime: {
    color: '#FFF',
    fontSize: 18,
    opacity: 0.9,
  },
  countdownContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  countdownText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 6,
  },
  prayerList: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  prayerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 18,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 12,
  },
  prayerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  prayerIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  prayerName: {
    fontSize: 16,
    fontWeight: '600',
  },
  timeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  prayerTime: {
    fontSize: 16,
    fontWeight: '700',
    marginRight: 8,
  },
  infoSection: {
    margin: 20,
    padding: 20,
    borderRadius: 16,
    marginBottom: 40,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    lineHeight: 20,
  },
});
