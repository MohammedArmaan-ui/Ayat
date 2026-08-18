import React, { useEffect, useState, useCallback } from 'react';
import { StyleSheet, View, ScrollView, useColorScheme, ActivityIndicator, RefreshControl, TouchableOpacity } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { Clock, MapPin, ChevronRight, CheckCircle2, Circle, Calendar as CalendarIcon } from 'lucide-react-native';

import { Text } from '@/components/Themed';
import { Colors } from '../../src/theme/colors';
import { SettingsService, AppSettings } from '../../src/services/settingsService';
import { PrayerService, PrayerData } from '../../src/services/prayerService';
import { PrayerAnalyticsModal } from '../../src/components/PrayerAnalyticsModal';

export default function PrayerScreen() {
  const [timings, setTimings] = useState<PrayerData | null>(null);
  const [trackedPrayers, setTrackedPrayers] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [dates, setDates] = useState<Date[]>([]);
  const [analyticsVisible, setAnalyticsVisible] = useState(false);
  
  const systemColorScheme = useColorScheme() ?? 'light';
  const theme = settings ? (Colors as any)[settings.theme] : (Colors as any)[systemColorScheme];

  useEffect(() => {
    // Generate dates: 2 days back (-2, -1), today (0), and next 4 days (1, 2, 3, 4)
    const generatedDates = [];
    for (let i = -2; i <= 4; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      generatedDates.push(d);
    }
    setDates(generatedDates);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData(selectedDate);
    }, [selectedDate])
  );

  const loadData = async (date: Date) => {
    setLoading(true);
    const s = await SettingsService.getSettings();
    setSettings(s);
    
    // Format date as DD-MM-YYYY
    const dateString = `${date.getDate().toString().padStart(2, '0')}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getFullYear()}`;
    
    const data = await PrayerService.getPrayerTimesByDate(dateString, s.locationCity, s.locationCountry);
    setTimings(data);
    
    const tracked = await PrayerService.getTrackedPrayers(dateString);
    setTrackedPrayers(tracked);

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
    loadData(selectedDate);
  };

  const handleTogglePrayer = async (prayerName: string) => {
    const isCompleted = !trackedPrayers[prayerName];
    const dateString = `${selectedDate.getDate().toString().padStart(2, '0')}-${(selectedDate.getMonth() + 1).toString().padStart(2, '0')}-${selectedDate.getFullYear()}`;
    
    setTrackedPrayers(prev => ({ ...prev, [prayerName]: isCompleted }));
    await PrayerService.togglePrayer(dateString, prayerName, isCompleted);
  };

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
      const [h, m] = (timings.timings as any)[p].split(':').map(Number);
      const prayerTotalMinutes = h * 60 + m;
      
      if (prayerTotalMinutes > currentTotalMinutes) {
        const diff = prayerTotalMinutes - currentTotalMinutes;
        const diffH = Math.floor(diff / 60);
        const diffM = diff % 60;
        const countdown = `Starts in ${diffH > 0 ? `${diffH}h ` : ''}${diffM}m`;
        return { name: p, time: formatTime((timings.timings as any)[p]), countdown };
      }
    }
    
    const [fh, fm] = timings.timings.Fajr.split(':').map(Number);
    const fajrTotalMinutes = fh * 60 + fm;
    const diff = (24 * 60 - currentTotalMinutes) + fajrTotalMinutes;
    const diffH = Math.floor(diff / 60);
    const diffM = diff % 60;
    const countdown = `Starts in ${diffH > 0 ? `${diffH}h ` : ''}${diffM}m`;
    
    return { name: 'Fajr', time: formatTime(timings.timings.Fajr), countdown };
  };

  const formatTime = (time: string) => {
    if (!time || !settings) return '--:--';
    if (settings.timeFormat === '24h') return time;
    
    const [hours, minutes] = time.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
  };

  const canTogglePrayer = (prayerName: string) => {
    if (prayerName === 'Sunrise') return false;
    if (!timings) return false;

    const targetDate = new Date(selectedDate);
    targetDate.setHours(0, 0, 0, 0);
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (targetDate.getTime() < today.getTime()) return true;
    if (targetDate.getTime() > today.getTime()) return false;

    const currentTotalMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();
    const timeStr = (timings.timings as any)[prayerName];
    if (!timeStr) return false;
    
    const [h, m] = timeStr.split(':').map(Number);
    const prayerTotalMinutes = h * 60 + m;
    
    return currentTotalMinutes >= prayerTotalMinutes;
  };

  const isToday = selectedDate.toDateString() === new Date().toDateString();

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: theme.background }]}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.primary} />}
    >
      <View style={styles.header}>
        <View style={styles.headerTopRow}>
          <View style={styles.locationContainer}>
            <MapPin size={18} color={theme.primary} />
            <Text style={[styles.locationText, { color: theme.textSecondary }]}>
              {settings?.locationCity}, {settings?.locationCountry}
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.analyticsButton, { backgroundColor: theme.primary + '15', borderColor: theme.primary + '30' }]}
            onPress={() => setAnalyticsVisible(true)}
            activeOpacity={0.8}
          >
            <CalendarIcon size={14} color={theme.primary} />
            <Text style={[styles.analyticsButtonText, { color: theme.primary }]}>Analytics</Text>
          </TouchableOpacity>
        </View>

        <Text style={[styles.dateText, { color: theme.text }]}>
          {selectedDate.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}
        </Text>
        {timings?.hijri && (
          <Text style={[styles.hijriText, { color: theme.primary }]}>
            {timings.hijri.day} {timings.hijri.month.en} {timings.hijri.year} AH
          </Text>
        )}
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dateScroll} contentContainerStyle={styles.dateScrollContent}>
        {dates.map((d, index) => {
          const isSelected = d.getDate() === selectedDate.getDate() && d.getMonth() === selectedDate.getMonth();
          
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const checkDate = new Date(d);
          checkDate.setHours(0, 0, 0, 0);
          const diffDays = Math.round((checkDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

          let label = d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric' });
          if (diffDays === 0) label = 'Today';
          else if (diffDays === -1) label = 'Yesterday';
          else if (diffDays === -2) label = '2 Days Ago';
          else if (diffDays === 1) label = 'Tomorrow';

          return (
            <TouchableOpacity 
              key={index} 
              onPress={() => setSelectedDate(d)}
              style={[
                styles.dateChip, 
                { 
                  backgroundColor: isSelected ? theme.primary : theme.surface,
                  borderColor: isSelected ? theme.primary : theme.border
                }
              ]}
            >
              <Text style={{ color: isSelected ? '#FFF' : theme.text, fontWeight: isSelected ? 'bold' : 'normal' }}>
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {isToday && (
        <View style={[styles.mainCard, { backgroundColor: theme.primary }]}>
          <Text style={styles.nextPrayerLabel}>Next Prayer</Text>
          <Text style={styles.nextPrayerName}>{getNextPrayer().name}</Text>
          <Text style={styles.nextPrayerTime}>{getNextPrayer().time}</Text>
          <View style={styles.countdownContainer}>
            <Clock size={16} color="#FFF" style={{ opacity: 0.8 }} />
            <Text style={styles.countdownText}>{getNextPrayer().countdown}</Text>
          </View>
        </View>
      )}

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      ) : (
        <View style={[styles.prayerList, !isToday && { marginTop: 24 }]}>
          {prayers.map((prayer) => {
            const isClickable = canTogglePrayer(prayer);
            return (
            <TouchableOpacity 
              key={prayer} 
              activeOpacity={isClickable ? 0.8 : 1}
              onPress={() => {
                if (isClickable) {
                  handleTogglePrayer(prayer);
                }
              }}
              style={[
                styles.prayerRow, 
                { 
                  backgroundColor: theme.surface, 
                  borderColor: theme.border,
                  opacity: prayer === 'Sunrise' ? 0.7 : 1
                }
              ]}
            >
              <View style={styles.prayerInfo}>
                <Text style={styles.prayerIcon}>{prayerIcons[prayer]}</Text>
                <Text style={[styles.prayerName, { color: theme.text }]}>{prayer}</Text>
              </View>
              <View style={styles.timeInfo}>
                <Text style={[styles.prayerTime, { color: theme.primary, marginRight: prayer === 'Sunrise' ? 0 : 16 }]}>
                  {timings ? formatTime((timings.timings as any)[prayer]) : '--:--'}
                </Text>
                {prayer !== 'Sunrise' && (
                  trackedPrayers[prayer] ? (
                    <CheckCircle2 size={24} color={theme.primary} />
                  ) : (
                    <View style={{ opacity: isClickable ? 1 : 0.3 }}>
                      <Circle size={24} color={theme.border} />
                    </View>
                  )
                )}
              </View>
            </TouchableOpacity>
          )})}
        </View>
      )}

      <View style={[styles.infoSection, { backgroundColor: theme.surface + '80' }]}>
        <Text style={[styles.infoTitle, { color: theme.primary }]}>Qibla Direction</Text>
        <Text style={[styles.infoText, { color: theme.textSecondary }]}>
          The Qibla is currently 119° SE from your location.
        </Text>
      </View>

      <PrayerAnalyticsModal
        visible={analyticsVisible}
        onClose={() => setAnalyticsVisible(false)}
        theme={theme}
        onDataChanged={() => loadData(selectedDate)}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    padding: 24,
    paddingBottom: 12,
  },
  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  analyticsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  analyticsButtonText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
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
  hijriText: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 2,
  },
  dateScroll: {
    maxHeight: 50,
    marginBottom: 10,
  },
  dateScrollContent: {
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  dateChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 10,
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
