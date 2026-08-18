import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  Modal,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Flame,
  Trophy,
  CheckCircle2,
  Circle,
  Calendar as CalendarIcon,
  TrendingUp,
  Sparkles,
} from 'lucide-react-native';
import { BlurView } from 'expo-blur';

import { Text } from '@/components/Themed';
import { Colors } from '../theme/colors';
import {
  PrayerAnalyticsService,
  MonthAnalyticsSummary,
  DayPrayerStat,
} from '../services/prayerAnalyticsService';
import { PrayerService } from '../services/prayerService';

const { width } = Dimensions.get('window');

interface PrayerAnalyticsModalProps {
  visible: boolean;
  onClose: () => void;
  theme: typeof Colors.light;
  onDataChanged?: () => void;
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const PRAYERS = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];

export const PrayerAnalyticsModal = React.memo<PrayerAnalyticsModalProps>(({
  visible,
  onClose,
  theme,
  onDataChanged,
}) => {
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<MonthAnalyticsSummary | null>(null);
  const [selectedIsoDate, setSelectedIsoDate] = useState<string>(() => {
    const today = new Date();
    const month = (today.getMonth() + 1).toString().padStart(2, '0');
    const day = today.getDate().toString().padStart(2, '0');
    return `${today.getFullYear()}-${month}-${day}`;
  });

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth() + 1;

  const loadMonthData = useCallback(async (y: number, m: number) => {
    setLoading(true);
    try {
      const data = await PrayerAnalyticsService.getMonthAnalytics(y, m);
      setSummary(data);
    } catch (error) {
      console.error('Failed to load prayer month analytics:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (visible) {
      loadMonthData(year, month);
    }
  }, [visible, year, month, loadMonthData]);

  const handlePrevMonth = useCallback(() => {
    setCurrentDate(prev => {
      const newD = new Date(prev);
      newD.setMonth(newD.getMonth() - 1);
      return newD;
    });
  }, []);

  const handleNextMonth = useCallback(() => {
    setCurrentDate(prev => {
      const newD = new Date(prev);
      newD.setMonth(newD.getMonth() + 1);
      return newD;
    });
  }, []);

  // Compute Calendar grid days memoized
  const calendarDays = useMemo(() => {
    const firstDayIndex = new Date(year, month - 1, 1).getDay(); // 0 = Sun
    const totalDays = new Date(year, month, 0).getDate();

    const blanks = Array.from({ length: firstDayIndex }, (_, i) => ({
      key: `blank-${i}`,
      isBlank: true,
      day: 0,
      isoDate: '',
    }));

    const days = Array.from({ length: totalDays }, (_, i) => {
      const dayNum = i + 1;
      const dayStr = dayNum.toString().padStart(2, '0');
      const monthStr = month.toString().padStart(2, '0');
      const isoDate = `${year}-${monthStr}-${dayStr}`;
      return {
        key: `day-${dayNum}`,
        isBlank: false,
        day: dayNum,
        isoDate,
      };
    });

    return [...blanks, ...days];
  }, [year, month]);

  const selectedDayStat: DayPrayerStat | null = useMemo(() => {
    if (!summary || !selectedIsoDate) return null;
    return summary.dayStats[selectedIsoDate] || null;
  }, [summary, selectedIsoDate]);

  const handleTogglePrayer = useCallback(async (prayerName: string) => {
    if (!selectedDayStat) return;
    const isCompleted = !selectedDayStat.prayers[prayerName];

    // Optimistically update local summary state
    setSummary(prev => {
      if (!prev) return prev;
      const currentDay = prev.dayStats[selectedIsoDate];
      if (!currentDay) return prev;

      const newPrayers = { ...currentDay.prayers, [prayerName]: isCompleted };
      const newCompletedCount = Object.values(newPrayers).filter(Boolean).length;
      const countDiff = newCompletedCount - currentDay.completedCount;

      const updatedDayStats = {
        ...prev.dayStats,
        [selectedIsoDate]: {
          ...currentDay,
          prayers: newPrayers,
          completedCount: newCompletedCount,
        },
      };

      const newTotalCompleted = Math.max(0, prev.totalCompleted + countDiff);
      const newRate = prev.totalPossible > 0 ? Math.round((newTotalCompleted / prev.totalPossible) * 100) : 0;

      return {
        ...prev,
        totalCompleted: newTotalCompleted,
        completionRate: newRate,
        dayStats: updatedDayStats,
      };
    });

    try {
      await PrayerService.togglePrayer(selectedDayStat.date, prayerName, isCompleted);
      if (onDataChanged) {
        onDataChanged();
      }
    } catch (err) {
      console.error('Failed to toggle prayer in modal:', err);
    }
  }, [selectedDayStat, selectedIsoDate, onDataChanged]);

  const getHeatmapColor = useCallback((count: number) => {
    if (count === 5) return '#10B981'; // Full Emerald Gold
    if (count >= 3) return '#34D399'; // Medium Emerald
    if (count >= 1) return '#6EE7B7'; // Soft Mint
    return 'transparent'; // Empty
  }, []);

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <BlurView intensity={80} style={StyleSheet.absoluteFill} />
        <View style={[styles.modalContainer, { backgroundColor: theme.background }]}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <View style={styles.headerLeft}>
              <CalendarIcon size={20} color={theme.primary} />
              <Text style={[styles.headerTitle, { color: theme.text }]}>Prayer Analytics</Text>
            </View>
            <TouchableOpacity
              style={[styles.closeButton, { backgroundColor: theme.surface }]}
              onPress={onClose}
            >
              <X size={20} color={theme.text} />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {/* Quick Metrics */}
            <View style={styles.metricsRow}>
              <View style={[styles.metricCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                <View style={[styles.metricIconBox, { backgroundColor: '#F59E0B15' }]}>
                  <Flame size={20} color="#F59E0B" />
                </View>
                <Text style={[styles.metricValue, { color: theme.text }]}>
                  {summary?.currentStreak ?? 0} <Text style={styles.metricUnit}>days</Text>
                </Text>
                <Text style={[styles.metricLabel, { color: theme.textSecondary }]}>Current Streak</Text>
              </View>

              <View style={[styles.metricCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                <View style={[styles.metricIconBox, { backgroundColor: '#10B98115' }]}>
                  <TrendingUp size={20} color="#10B981" />
                </View>
                <Text style={[styles.metricValue, { color: theme.text }]}>
                  {summary?.completionRate ?? 0}%
                </Text>
                <Text style={[styles.metricLabel, { color: theme.textSecondary }]}>Monthly Rate</Text>
              </View>

              <View style={[styles.metricCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                <View style={[styles.metricIconBox, { backgroundColor: '#8B5CF615' }]}>
                  <Trophy size={20} color="#8B5CF6" />
                </View>
                <Text style={[styles.metricValue, { color: theme.text }]}>
                  {summary?.totalCompleted ?? 0}
                </Text>
                <Text style={[styles.metricLabel, { color: theme.textSecondary }]}>Prayers Done</Text>
              </View>
            </View>

            {/* Calendar Controls */}
            <View style={[styles.calendarCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <View style={styles.monthSelector}>
                <TouchableOpacity
                  style={[styles.monthNavButton, { backgroundColor: theme.primary + '15' }]}
                  onPress={handlePrevMonth}
                >
                  <ChevronLeft size={20} color={theme.primary} />
                </TouchableOpacity>

                <Text style={[styles.monthTitle, { color: theme.text }]}>
                  {MONTH_NAMES[month - 1]} {year}
                </Text>

                <TouchableOpacity
                  style={[styles.monthNavButton, { backgroundColor: theme.primary + '15' }]}
                  onPress={handleNextMonth}
                >
                  <ChevronRight size={20} color={theme.primary} />
                </TouchableOpacity>
              </View>

              {/* Heatmap Legend */}
              <View style={styles.legendRow}>
                <Text style={[styles.legendText, { color: theme.textSecondary }]}>0/5</Text>
                <View style={[styles.legendBox, { backgroundColor: theme.border }]} />
                <View style={[styles.legendBox, { backgroundColor: '#6EE7B7' }]} />
                <View style={[styles.legendBox, { backgroundColor: '#34D399' }]} />
                <View style={[styles.legendBox, { backgroundColor: '#10B981' }]} />
                <Text style={[styles.legendText, { color: theme.textSecondary }]}>5/5 Perfect</Text>
              </View>

              {/* Weekday Row */}
              <View style={styles.weekdayRow}>
                {WEEKDAYS.map((w, idx) => (
                  <Text key={idx} style={[styles.weekdayText, { color: theme.textSecondary }]}>
                    {w}
                  </Text>
                ))}
              </View>

              {/* Calendar Days Grid */}
              {loading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="small" color={theme.primary} />
                </View>
              ) : (
                <View style={styles.daysGrid}>
                  {calendarDays.map(item => {
                    if (item.isBlank) {
                      return <View key={item.key} style={styles.dayCellBlank} />;
                    }

                    const stat = summary?.dayStats[item.isoDate];
                    const count = stat ? stat.completedCount : 0;
                    const isSelected = selectedIsoDate === item.isoDate;
                    const heatColor = getHeatmapColor(count);

                    return (
                      <TouchableOpacity
                        key={item.key}
                        style={[
                          styles.dayCell,
                          {
                            backgroundColor: count > 0 ? heatColor : theme.surface,
                            borderColor: isSelected ? theme.primary : theme.border,
                            borderWidth: isSelected ? 2 : 1,
                          },
                        ]}
                        onPress={() => setSelectedIsoDate(item.isoDate)}
                        activeOpacity={0.8}
                      >
                        <Text
                          style={[
                            styles.dayCellText,
                            {
                              color: count > 0 ? '#FFFFFF' : theme.text,
                              fontWeight: isSelected || count > 0 ? '700' : '400',
                            },
                          ]}
                        >
                          {item.day}
                        </Text>
                        {count === 5 && (
                          <View style={styles.goldDot} />
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}
            </View>

            {/* Selected Day Details */}
            {selectedDayStat && (
              <View style={[styles.dayDetailCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                <View style={styles.dayDetailHeader}>
                  <View>
                    <Text style={[styles.dayDetailDate, { color: theme.text }]}>
                      {selectedDayStat.date}
                    </Text>
                    <Text style={[styles.dayDetailScore, { color: theme.primary }]}>
                      {selectedDayStat.completedCount} of 5 Prayers Completed
                    </Text>
                  </View>
                  {selectedDayStat.completedCount === 5 && (
                    <View style={[styles.badgeFull, { backgroundColor: theme.primary + '20' }]}>
                      <Sparkles size={14} color={theme.primary} />
                      <Text style={[styles.badgeFullText, { color: theme.primary }]}>Perfect Day</Text>
                    </View>
                  )}
                </View>

                {/* Prayer List */}
                <View style={styles.prayerListContainer}>
                  {PRAYERS.map(p => {
                    const done = !!selectedDayStat.prayers[p];
                    return (
                      <TouchableOpacity
                        key={p}
                        style={[
                          styles.prayerItemRow,
                          {
                            backgroundColor: done ? theme.primary + '10' : theme.background,
                            borderColor: done ? theme.primary : theme.border,
                          },
                        ]}
                        onPress={() => handleTogglePrayer(p)}
                        activeOpacity={0.8}
                      >
                        <View style={styles.prayerItemLeft}>
                          {done ? (
                            <CheckCircle2 size={20} color={theme.primary} />
                          ) : (
                            <Circle size={20} color={theme.border} />
                          )}
                          <Text
                            style={[
                              styles.prayerItemName,
                              { color: done ? theme.primary : theme.text, fontWeight: done ? '700' : '500' },
                            ]}
                          >
                            {p}
                          </Text>
                        </View>
                        <Text style={[styles.prayerStatusText, { color: done ? theme.primary : theme.textSecondary }]}>
                          {done ? 'Completed' : 'Tap to mark'}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
});

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContainer: {
    height: '90%',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  metricCard: {
    flex: 1,
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
  },
  metricIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  metricValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  metricUnit: {
    fontSize: 11,
    fontWeight: 'normal',
  },
  metricLabel: {
    fontSize: 11,
    marginTop: 2,
    textAlign: 'center',
  },
  calendarCard: {
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
    marginBottom: 20,
  },
  monthSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  monthNavButton: {
    width: 36,
    height: 36,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  monthTitle: {
    fontSize: 17,
    fontWeight: 'bold',
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginBottom: 16,
  },
  legendBox: {
    width: 14,
    height: 14,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 11,
  },
  weekdayRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  weekdayText: {
    width: (width - 40 - 32) / 7,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '600',
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCellBlank: {
    width: (width - 40 - 32) / 7,
    height: 44,
  },
  dayCell: {
    width: (width - 40 - 32) / 7 - 4,
    height: 40,
    margin: 2,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  dayCellText: {
    fontSize: 13,
  },
  goldDot: {
    position: 'absolute',
    bottom: 3,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#F59E0B',
  },
  loadingContainer: {
    height: 180,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayDetailCard: {
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
  },
  dayDetailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  dayDetailDate: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  dayDetailScore: {
    fontSize: 13,
    marginTop: 2,
    fontWeight: '600',
  },
  badgeFull: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeFullText: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  prayerListContainer: {
    gap: 8,
  },
  prayerItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  prayerItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  prayerItemName: {
    fontSize: 14,
  },
  prayerStatusText: {
    fontSize: 12,
  },
});
