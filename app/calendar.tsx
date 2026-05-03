import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, useColorScheme, ActivityIndicator, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');
import { Stack, useRouter } from 'expo-router';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Star, Info } from 'lucide-react-native';

import { Text } from '@/components/Themed';
import { Colors } from '../src/theme/colors';
import { SettingsService, AppSettings } from '../src/services/settingsService';
import { PrayerService, PrayerData } from '../src/services/prayerService';
import { ISLAMIC_HOLIDAYS } from '../src/constants/holidaysData';

export default function CalendarScreen() {
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentHijri, setCurrentHijri] = useState<any>(null);
  const [monthData, setMonthData] = useState<any[]>([]);
  const [viewDate, setViewDate] = useState(new Date());
  const router = useRouter();
  const systemColorScheme = useColorScheme() ?? 'light';

  useEffect(() => {
    loadData(viewDate);
  }, [viewDate]);

  const loadData = async (date: Date) => {
    setLoading(true);
    const s = await SettingsService.getSettings();
    setSettings(s);

    const dateString = `${date.getDate().toString().padStart(2, '0')}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getFullYear()}`;
    const data = await PrayerService.getPrayerTimesByDate(dateString, s.locationCity, s.locationCountry);
    
    if (data) {
      setCurrentHijri(data.hijri);
      const month = await PrayerService.getHijriMonth(
        data.hijri.month.number, 
        parseInt(data.hijri.year), 
        s.locationCity, 
        s.locationCountry
      );
      setMonthData(month);
    }
    setLoading(false);
  };

  const theme = settings ? (Colors as any)[settings.theme] : (Colors as any)[systemColorScheme];

  const changeMonth = (offset: number) => {
    const next = new Date(viewDate);
    next.setMonth(next.getMonth() + offset);
    setViewDate(next);
  };

  const currentMonthHolidays = ISLAMIC_HOLIDAYS.filter(h => {
    if (!currentHijri) return false;
    const [day, month] = h.hijriDate.split('-').map(Number);
    return month === currentHijri.month.number;
  });

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Stack.Screen 
        options={{ 
          title: 'Islamic Calendar',
          headerStyle: { backgroundColor: theme.background },
          headerTintColor: theme.primary,
          headerShadowVisible: false,
        }} 
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Hijri Card */}
        <View style={[styles.calendarCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <View style={styles.calendarHeader}>
            <TouchableOpacity onPress={() => changeMonth(-1)}>
              <ChevronLeft size={24} color={theme.primary} />
            </TouchableOpacity>
            <View style={styles.monthInfo}>
              {loading ? (
                <ActivityIndicator size="small" color={theme.primary} />
              ) : (
                <>
                  <Text style={[styles.hijriMonth, { color: theme.text }]}>
                    {currentHijri?.month.en} {currentHijri?.year} AH
                  </Text>
                  <Text style={[styles.gregorianMonth, { color: theme.primary, fontWeight: '600' }]}>
                    {viewDate.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}
                  </Text>
                </>
              )}
            </View>
            <TouchableOpacity onPress={() => changeMonth(1)}>
              <ChevronRight size={24} color={theme.primary} />
            </TouchableOpacity>
          </View>

          {/* Hijri Grid */}
          <View style={styles.grid}>
            {monthData.map((day, i) => {
              const dayNum = parseInt(day.date.hijri.day);
              const hijriDateStr = `${dayNum.toString().padStart(2, '0')}-${day.date.hijri.month.number.toString().padStart(2, '0')}`;
              const holiday = ISLAMIC_HOLIDAYS.find(h => h.hijriDate === hijriDateStr);
              const isToday = new Date().toDateString() === new Date(day.date.gregorian.date.split('-').reverse().join('-')).toDateString();
              
              return (
                <View 
                  key={i} 
                  style={[
                    styles.gridItem, 
                    holiday && { backgroundColor: theme.primary + '20', borderColor: theme.primary },
                    isToday && { backgroundColor: theme.primary, borderColor: theme.primary }
                  ]}
                >
                  <Text style={[
                    styles.gridDay, 
                    { color: theme.text },
                    holiday && { color: theme.primary, fontWeight: 'bold' },
                    isToday && { color: '#FFF', fontWeight: 'bold' }
                  ]}>
                    {dayNum}
                  </Text>
                  <Text style={[
                    styles.gregorianGridDay, 
                    { color: theme.textSecondary },
                    isToday && { color: 'rgba(255,255,255,0.8)' }
                  ]}>
                    {day.date.gregorian.day}
                  </Text>
                  {holiday && (
                    <View style={[styles.holidayDot, { backgroundColor: theme.primary }]} />
                  )}
                </View>
              );
            })}
          </View>
        </View>

        {/* Upcoming Holidays */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Star size={20} color={theme.primary} />
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Significant Dates</Text>
          </View>

          {currentMonthHolidays.length > 0 ? (
            currentMonthHolidays.map((holiday) => (
              <View key={holiday.id} style={[styles.holidayItem, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                <View style={[styles.holidayIcon, { backgroundColor: holiday.type === 'Major' ? theme.primary + '20' : theme.textSecondary + '10' }]}>
                  <CalendarIcon size={20} color={holiday.type === 'Major' ? theme.primary : theme.textSecondary} />
                </View>
                <View style={styles.holidayInfo}>
                  <Text style={[styles.holidayTitle, { color: theme.text }]}>{holiday.title}</Text>
                  <Text style={[styles.holidayHijri, { color: theme.primary }]}>{holiday.hijriDate} (Hijri)</Text>
                  <Text style={[styles.holidayDesc, { color: theme.textSecondary }]}>{holiday.description}</Text>
                </View>
                {holiday.type === 'Major' && (
                   <View style={[styles.majorBadge, { backgroundColor: theme.primary }]}>
                     <Text style={styles.majorText}>Major</Text>
                   </View>
                )}
              </View>
            ))
          ) : (
            <View style={[styles.emptyCard, { backgroundColor: theme.surface }]}>
              <Info size={32} color={theme.textSecondary} style={{ opacity: 0.5, marginBottom: 12 }} />
              <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
                No major Islamic holidays in this {currentHijri?.month.en || 'month'}.
              </Text>
            </View>
          )}
        </View>

        {/* Calendar Guide */}
        <View style={[styles.guideCard, { backgroundColor: theme.primary + '10' }]}>
          <Text style={[styles.guideTitle, { color: theme.primary }]}>Calendar Note</Text>
          <Text style={[styles.guideText, { color: theme.text }]}>
            Islamic dates are based on the lunar calendar and may vary by 1-2 days depending on the moon sighting in your region.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  calendarCard: {
    padding: 24,
    borderRadius: 24,
    borderWidth: 1,
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  calendarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 20,
  },
  monthInfo: {
    alignItems: 'center',
  },
  hijriMonth: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  gregorianMonth: {
    fontSize: 14,
    marginTop: 2,
  },
  hijriBadge: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
    width: '100%',
  },
  gridItem: {
    width: (width - 40 - (6 * 8)) / 7 - 2, 
    height: (width - 40 - (6 * 8)) / 7 - 2,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  gridDay: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  gregorianGridDay: {
    fontSize: 10,
    marginTop: 2,
  },
  holidayDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    position: 'absolute',
    bottom: 6,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  holidayItem: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 12,
    alignItems: 'center',
  },
  holidayIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  holidayInfo: {
    flex: 1,
  },
  holidayTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  holidayHijri: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 4,
  },
  holidayDesc: {
    fontSize: 13,
    lineHeight: 18,
  },
  majorBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginLeft: 8,
  },
  majorText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  emptyCard: {
    padding: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: '#CCC',
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 14,
  },
  guideCard: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 40,
  },
  guideTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  guideText: {
    fontSize: 14,
    lineHeight: 20,
    opacity: 0.8,
  },
});
