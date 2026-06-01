/**
 * Notification Settings — group definitions
 *
 * Static data describing notification category groups and their items.
 */

export interface NotificationGroupItem {
  id: string;
  icon: string;
  title: string;
  description: string;
}

export interface NotificationGroup {
  title: string;
  items: NotificationGroupItem[];
}

export const notificationGroups: NotificationGroup[] = [
  {
    title: 'Streaks & Progress',
    items: [
      {
        id: 'streakReminders',
        icon: 'flame',
        title: 'Streak Reminders',
        description: 'Get reminded before your streak resets',
      },
      {
        id: 'weeklyReport',
        icon: 'bar-chart',
        title: 'Weekly Report',
        description: 'Summary of your focus stats every Sunday',
      },
      {
        id: 'achievementUnlocks',
        icon: 'trophy',
        title: 'Achievement Unlocks',
        description: 'When you earn a new achievement',
      },
    ],
  },
  {
    title: 'Battles & Social',
    items: [
      {
        id: 'bossAlerts',
        icon: 'sword',
        title: 'Boss Alerts',
        description: 'When a new boss appears or is about to escape',
      },
      {
        id: 'squadNotifications',
        icon: 'users',
        title: 'Squad Updates',
        description: 'Squad challenges, messages, and invites',
      },
      {
        id: 'rivalNotifications',
        icon: 'crosshair',
        title: 'Rival Activity',
        description: 'When rivals complete a session or pass you',
      },
    ],
  },
  {
    title: 'Sessions & Coach',
    items: [
      {
        id: 'sessionReminders',
        icon: 'clock',
        title: 'Session Reminders',
        description: 'Reminders to complete your daily session',
      },
      {
        id: 'coachMessages',
        icon: 'message-circle',
        title: 'Coach Messages',
        description: 'Tips and encouragement from your AI Coach',
      },
      {
        id: 'dailyChallenge',
        icon: 'target',
        title: 'Daily Challenge',
        description: 'New challenges available each day',
      },
    ],
  },
];
