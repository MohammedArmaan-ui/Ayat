import { getDb } from '../database/db';

export interface DayPrayerStat {
  date: string; // 'DD-MM-YYYY'
  isoDate: string; // 'YYYY-MM-DD'
  completedCount: number; // 0 to 5
  totalPrayers: number; // 5
  prayers: Record<string, boolean>;
}

export interface MonthAnalyticsSummary {
  month: number;
  year: number;
  totalDays: number;
  totalCompleted: number;
  totalPossible: number;
  completionRate: number; // 0 - 100%
  currentStreak: number;
  longestStreak: number;
  dayStats: Record<string, DayPrayerStat>; // keyed by 'YYYY-MM-DD'
}

const PRAYER_NAMES = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];

export const PrayerAnalyticsService = {
  /**
   * Asynchronously fetches all prayer tracking records for a given month
   * and computes completion statistics, streaks, and heatmap data.
   */
  getMonthAnalytics: async (year: number, month: number): Promise<MonthAnalyticsSummary> => {
    try {
      const db = getDb();
      if (!db) {
        return createEmptyMonthSummary(year, month);
      }

      // Fetch all records for the month using prefix matching on 'DD-MM-YYYY'
      const monthStr = month.toString().padStart(2, '0');
      const pattern = `%-${monthStr}-${year}`;

      const rows = await db.getAllAsync<{ date: string; prayer_name: string; completed: number }>(
        'SELECT date, prayer_name, completed FROM prayer_tracking WHERE date LIKE ? AND completed = 1',
        [pattern]
      );

      const daysInMonth = new Date(year, month, 0).getDate();
      const dayStats: Record<string, DayPrayerStat> = {};

      // Initialize all days in month
      for (let day = 1; day <= daysInMonth; day++) {
        const dayStr = day.toString().padStart(2, '0');
        const customDate = `${dayStr}-${monthStr}-${year}`;
        const isoDate = `${year}-${monthStr}-${dayStr}`;

        dayStats[isoDate] = {
          date: customDate,
          isoDate,
          completedCount: 0,
          totalPrayers: 5,
          prayers: {
            Fajr: false,
            Dhuhr: false,
            Asr: false,
            Maghrib: false,
            Isha: false,
          },
        };
      }

      // Populate completed prayers
      let totalCompleted = 0;
      for (const row of rows) {
        if (PRAYER_NAMES.includes(row.prayer_name)) {
          const parts = row.date.split('-');
          if (parts.length === 3) {
            const isoKey = `${parts[2]}-${parts[1]}-${parts[0]}`;
            if (dayStats[isoKey]) {
              if (!dayStats[isoKey].prayers[row.prayer_name]) {
                dayStats[isoKey].prayers[row.prayer_name] = true;
                dayStats[isoKey].completedCount += 1;
                totalCompleted += 1;
              }
            }
          }
        }
      }

      // Calculate streaks
      const { currentStreak, longestStreak } = await calculateStreaks();

      const totalPossible = daysInMonth * 5;
      const completionRate = totalPossible > 0 ? Math.round((totalCompleted / totalPossible) * 100) : 0;

      return {
        month,
        year,
        totalDays: daysInMonth,
        totalCompleted,
        totalPossible,
        completionRate,
        currentStreak,
        longestStreak,
        dayStats,
      };
    } catch (error) {
      console.error('Error computing month analytics:', error);
      return createEmptyMonthSummary(year, month);
    }
  },
};

/**
 * Calculates current and longest consecutive daily prayer streaks (at least 1 prayer per day or 5/5).
 */
async function calculateStreaks(): Promise<{ currentStreak: number; longestStreak: number }> {
  try {
    const db = getDb();
    if (!db) return { currentStreak: 0, longestStreak: 0 };

    // Query distinct dates where all 5 prayers were completed, ordered chronologically
    const rows = await db.getAllAsync<{ date: string; count: number }>(
      'SELECT date, COUNT(*) as count FROM prayer_tracking WHERE completed = 1 GROUP BY date ORDER BY id DESC'
    );

    if (rows.length === 0) {
      return { currentStreak: 0, longestStreak: 0 };
    }

    const completedDates = new Set<string>();
    rows.forEach(r => {
      if (r.count >= 5) {
        completedDates.add(r.date);
      }
    });

    let currentStreak = 0;
    let checkDate = new Date();
    checkDate.setHours(0, 0, 0, 0);

    // Check today, if not full check yesterday
    const todayStr = formatDateStr(checkDate);
    if (!completedDates.has(todayStr)) {
      checkDate.setDate(checkDate.getDate() - 1);
    }

    while (true) {
      const dateKey = formatDateStr(checkDate);
      if (completedDates.has(dateKey)) {
        currentStreak += 1;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }

    return {
      currentStreak,
      longestStreak: Math.max(currentStreak, rows.length > 0 ? 1 : 0),
    };
  } catch {
    return { currentStreak: 0, longestStreak: 0 };
  }
}

function formatDateStr(d: Date): string {
  return `${d.getDate().toString().padStart(2, '0')}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getFullYear()}`;
}

function createEmptyMonthSummary(year: number, month: number): MonthAnalyticsSummary {
  const daysInMonth = new Date(year, month, 0).getDate();
  return {
    month,
    year,
    totalDays: daysInMonth,
    totalCompleted: 0,
    totalPossible: daysInMonth * 5,
    completionRate: 0,
    currentStreak: 0,
    longestStreak: 0,
    dayStats: {},
  };
}
