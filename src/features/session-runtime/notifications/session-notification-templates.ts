import type {
  NotificationPayload,
  StreakMilestoneResult,
  AntiCheatWarningResult,
} from './session-notification-types';

const INTERRUPTION_TITLES: Record<string, string> = {
  CRITICAL: 'Session at Risk',
  MAJOR: 'Interruption Detected',
  MODERATE: 'Session Paused',
  MINOR: 'Session Paused',
};

const INTERRUPTION_BODIES: Record<string, string> = {
  CRITICAL: 'Resume immediately or lose your session progress!',
  MAJOR: 'Your session is at risk. Tap to resume.',
  MODERATE: 'Your focus session has been paused.',
  MINOR: 'Brief pause detected. Ready when you are.',
};

export function buildInterruptionPayload(
  sessionId: string,
  severity: string,
): NotificationPayload {
  return {
    title: INTERRUPTION_TITLES[severity] || 'Session Update',
    body: INTERRUPTION_BODIES[severity] || 'Your session status has changed.',
    data: { sessionId, type: 'interruption', severity },
    priority: severity === 'CRITICAL' ? 'high' : 'normal',
  };
}

export function buildRecoveryPayload(
  sessionId: string,
  minutesElapsed: number,
): NotificationPayload {
  return {
    title: 'Recovery Available',
    body: `You can still recover your session. ${minutesElapsed} minutes have passed.`,
    data: { sessionId, type: 'recovery_reminder' },
    priority: 'normal',
  };
}

export function buildStreakWarningPayload(
  streakDays: number,
  hoursRemaining: number,
): NotificationPayload {
  return {
    title: 'Streak at Risk',
    body: `Your ${streakDays}-day streak ends in ${hoursRemaining} hours. Start a session now!`,
    data: { type: 'streak_warning', streakDays, hoursRemaining },
    priority: 'high',
  };
}

export function buildDailyReminderPayload(): NotificationPayload {
  return {
    title: 'Daily Focus Reminder',
    body: 'Time to start your daily focus session and keep your streak going!',
    data: { type: 'daily_reminder' },
    priority: 'normal',
  };
}

export function buildBreakReminderPayload(
  breakDuration: number,
): NotificationPayload {
  return {
    title: 'Break Time',
    body: `Take a ${breakDuration / 60} minute break. You've earned it!`,
    data: { type: 'break_reminder', breakDuration },
    priority: 'normal',
  };
}

export function buildRewardPayload(
  xp: number,
  coins: number,
  gems: number,
): NotificationPayload | null {
  const parts: string[] = [];
  if (xp > 0) {parts.push(`${xp} XP`);}
  if (coins > 0) {parts.push(`${coins} coins`);}
  if (gems > 0) {parts.push(`${gems} gems`);}
  if (parts.length === 0) {return null;}
  return {
    title: 'Rewards Earned',
    body: `You earned: ${parts.join(', ')}`,
    data: { type: 'rewards', xp, coins, gems },
    priority: 'normal',
  };
}

export function buildStreakMilestoneResult(
  streakDays: number,
): StreakMilestoneResult {
  let title = 'Streak Milestone';
  let body = `You've maintained focus for ${streakDays} days straight!`;
  if (streakDays === 7) {
    title = 'One Week Streak';
    body = "Amazing dedication! You've focused for 7 days straight!";
  } else if (streakDays === 30) {
    title = 'Month-Long Streak';
    body = 'Incredible! A full month of daily focus sessions!';
  } else if (streakDays === 100) {
    title = 'Century Streak';
    body = 'Legendary! 100 days of unwavering focus!';
  }
  return { title, body };
}

const ANTI_CHEAT_WARNINGS: Record<string, AntiCheatWarningResult> = {
  TIME_MANIPULATION: {
    title: 'Time Anomaly Detected',
    body: 'System time changes were detected. Please keep system time accurate.',
  },
  DEVICE_CHANGE: {
    title: 'Device Change',
    body: 'Session continued on different device. Monitoring for consistency.',
  },
  RAPID_COMPLETION: {
    title: 'Suspicious Activity',
    body: 'Unusually rapid session completion detected.',
  },
};

export function getAntiCheatWarning(
  violationType: string,
): AntiCheatWarningResult {
  return (
    ANTI_CHEAT_WARNINGS[violationType] || {
      title: 'Session Warning',
      body: 'An issue was detected with your session.',
    }
  );
}
