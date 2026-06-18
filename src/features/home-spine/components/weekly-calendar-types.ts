/** Reactive day cell width — pass `useWindowDimensions().width` for auto-update on rotation. */
export const getDayWidth = (screenWidth: number): number => (screenWidth - 40) / 7;

export type DayStatus = 'completed' | 'partial' | 'upcoming' | 'missed';
export type EventType =
  | 'squad_war'
  | 'double_xp'
  | 'challenge_expires'
  | 'season_ends'
  | 'boss_rush';

export interface DayData {
  date: Date;
  status: DayStatus;
  sessionsCompleted: number;
  events: EventType[];
  challengeExpiring?: string;
}

export interface WeeklyCalendarProps {
  days: DayData[];
  selectedDay: Date;
  onDaySelect: (day: Date) => void;
  currentStreak: number;
}

export const EVENT_ICONS: Record<EventType, string> = {
  squad_war: '',
  double_xp: '',
  challenge_expires: '',
  season_ends: '',
  boss_rush: '',
};

export const EVENT_LABELS: Record<EventType, string> = {
  squad_war: 'Squad War',
  double_xp: 'Double XP',
  challenge_expires: 'Challenge Ends',
  season_ends: 'Season Ends',
  boss_rush: 'Boss Rush',
};
