import { MMKVStorageAdapter } from "../../persistence/MMKVStorageAdapter";

const MAX_NOTIFICATIONS_PER_DAY = 2;
const notificationLimitStorage = new MMKVStorageAdapter("notification-limits");
const DEFAULT_QUIET_START_HOUR = 22;
const DEFAULT_QUIET_END_HOUR = 8;

export function isQuietHours(
  userTimezone: string = "UTC",
  quietStart: number = DEFAULT_QUIET_START_HOUR,
  quietEnd: number = DEFAULT_QUIET_END_HOUR,
): boolean {
  const now = new Date();
  const userTime = new Date(
    now.toLocaleString("en-US", { timeZone: userTimezone }),
  );
  const hour = userTime.getHours();
  if (quietStart <= quietEnd) {
    return hour >= quietStart && hour < quietEnd;
  }
  return hour >= quietStart || hour < quietEnd;
}

export function getNextNotificationWindow(
  userTimezone: string = "UTC",
  quietEnd: number = DEFAULT_QUIET_END_HOUR,
): Date {
  const now = new Date();
  const userTime = new Date(
    now.toLocaleString("en-US", { timeZone: userTimezone }),
  );
  const nextWindow = new Date(userTime);
  nextWindow.setHours(quietEnd, 0, 0, 0);
  if (userTime.getHours() >= quietEnd) {
    nextWindow.setDate(nextWindow.getDate() + 1);
  }
  return nextWindow;
}

export function checkDailyNotificationLimit(userId: string): {
  canSend: boolean;
  remaining: number;
} {
  const key = `notifications:${userId}:${new Date().toDateString()}`;
  const raw = notificationLimitStorage.getItemSync(key);
  const count = raw ? Number.parseInt(raw, 10) : 0;
  const safeCount = Number.isFinite(count) ? count : 0;
  return {
    canSend: safeCount < MAX_NOTIFICATIONS_PER_DAY,
    remaining: Math.max(0, MAX_NOTIFICATIONS_PER_DAY - safeCount),
  };
}

export function recordNotificationSent(userId: string): void {
  const key = `notifications:${userId}:${new Date().toDateString()}`;
  const raw = notificationLimitStorage.getItemSync(key);
  const count = raw ? Number.parseInt(raw, 10) : 0;
  const safeCount = Number.isFinite(count) ? count : 0;
  notificationLimitStorage.setItemSync(key, String(safeCount + 1));
}

export function createRivalSessionNotification(
  rivalName: string,
  sessionMinutes: number,
  currentDiff: number,
): { title: string; body: string } {
  const diffText =
    currentDiff === 0
      ? "You're tied now!"
      : currentDiff > 0
        ? `Still ahead by ${currentDiff} min`
        : `${Math.abs(currentDiff)} min behind`;
  return {
    title: `${rivalName} just focused for ${sessionMinutes} min`,
    body: `${diffText} — start a session to stay in the lead!`,
  };
}

export function createSquadNudgeNotification(
  nudgerName: string,
  squadName: string,
  squadStreak: number,
): { title: string; body: string } {
  return {
    title: `⚡ ${nudgerName} nudged you!`,
    body: `From ${squadName}: Your squad's ${squadStreak}-day streak depends on you. Start a quick session?`,
  };
}

export function createSquadMilestoneNotification(
  squadName: string,
  milestoneDays: number,
  bonusXp: number,
): { title: string; body: string } {
  return {
    title: `🔥 ${squadName} Milestone!`,
    body: `Your squad hit a ${milestoneDays}-day streak! You all earned a ${bonusXp} XP bonus!`,
  };
}

export function createFeedReactionNotification(
  reactorName: string,
  reactionEmoji: string,
  postTitle: string,
): { title: string; body: string } {
  return {
    title: `${reactorName} reacted ${reactionEmoji}`,
    body: `To your post: "${postTitle.substring(0, 50)}${postTitle.length > 50 ? "..." : ""}"`,
  };
}
