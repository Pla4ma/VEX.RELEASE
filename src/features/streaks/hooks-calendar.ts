import { useQuery } from '@tanstack/react-query';
import { streakKeys } from './hooks';

export interface StreakCalendarData {
  month: number;
  year: number;
  days: number[];
  durations: number[]; // minutes per day
  currentStreakDays: number;
  longestStreakInMonth: number;
  bossDefeatDays: number[];
  streakDays: number[];
}

export function useStreakCalendar(
  userId: string | null,
  month: number,
  year: number,
) {
  return useQuery<StreakCalendarData>({
    queryKey: [...streakKeys.byUser(userId || ''), 'calendar', month, year],
    queryFn: async () => {
      if (!userId) {
        throw new Error('User ID required');
      }
      // This would fetch session history and build calendar
      // Extended for Phase 23.3 with duration data and boss defeat tracking
      return {
        month,
        year,
        days: [],
        durations: [],
        currentStreakDays: 0,
        longestStreakInMonth: 0,
        bossDefeatDays: [],
        streakDays: [],
      };
    },
    enabled: !!userId,
  });
}
