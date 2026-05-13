import { getDefaultStorageAdapter } from "../../persistence/MMKVStorageAdapter";


export async function loadIdentity(userId: string): Promise<IdentityProfile> {
  const storage = getDefaultStorageAdapter();
  const raw = await storage.getItem(profileKey(userId));
  if (!raw) {
    return {
      userId, totalSessions: 0, totalFocusMinutes: 0, longestStreak: 0,
      currentStreak: 0, bestSessionQuality: 0, favoriteTimeOfDay: null,
      averageSessionMinutes: 0, identityLevel: 'newcomer', lastIdentityShiftAt: null,
      weeklyMinutes: 0, weeklySessions: 0, weekStartDate: getWeekStartDate(),
    };
  }
  return JSON.parse(raw) as IdentityProfile;
}

export async function recordSessionIdentity(
  userId: string,
  sessionMinutes: number,
  quality: number,
): Promise<IdentityReflection[]> {
  const profile = await loadIdentity(userId);
  const now = Date.now();
  const reflections: IdentityReflection[] = [];

  // Update stats
  profile.totalSessions += 1;
  profile.totalFocusMinutes += sessionMinutes;
  profile.bestSessionQuality = Math.max(profile.bestSessionQuality, quality);
  profile.averageSessionMinutes = Math.floor(profile.totalFocusMinutes / profile.totalSessions);

  // Track time of day
  const hour = new Date().getHours();
  profile.favoriteTimeOfDay = getTimeOfDayLabel(hour);

  // Weekly tracking
  const currentWeekStart = getWeekStartDate();
  if (profile.weekStartDate !== currentWeekStart) {
    profile.weekStartDate = currentWeekStart;
    profile.weeklyMinutes = 0;
    profile.weeklySessions = 0;
  }
  profile.weeklyMinutes += sessionMinutes;
  profile.weeklySessions += 1;

  // Check for identity level shift
  const newLevel = calculateIdentityLevel(profile);
  if (newLevel !== profile.identityLevel) {
    profile.identityLevel = newLevel;
    profile.lastIdentityShiftAt = now;
    reflections.push({
      type: 'IDENTITY_SHIFT',
      message: IDENTITY_SHIFT_MESSAGES[newLevel],
      identityLevel: newLevel,
      timestamp: now,
    });
  }

  // Pattern reflections (every 10 sessions)
  if (profile.totalSessions % 10 === 0 && profile.totalSessions > 0) {
    reflections.push({
      type: 'PATTERN',
      message: generatePatternReflection(profile),
      identityLevel: profile.identityLevel,
      timestamp: now,
    });
  }

  // Weekly summary (every 7 sessions in a week)
  if (profile.weeklySessions % 7 === 0 && profile.weeklySessions > 0) {
    reflections.push({
      type: 'WEEKLY',
      message: generateWeeklyReflection(profile),
      identityLevel: profile.identityLevel,
      timestamp: now,
    });
  }

  await saveIdentity(userId, profile);
  return reflections;
}

export async function recordStreakIdentity(
  userId: string,
  streakDays: number,
): Promise<IdentityReflection | null> {
  const profile = await loadIdentity(userId);
  profile.currentStreak = streakDays;
  profile.longestStreak = Math.max(profile.longestStreak, streakDays);
  await saveIdentity(userId, profile);

  if ([7, 14, 30, 60, 100, 365].includes(streakDays)) {
    return {
      type: 'MILESTONE',
      message: getStreakMilestoneMessage(streakDays),
      identityLevel: profile.identityLevel,
      timestamp: Date.now(),
    };
  }
  return null;
}

export function getIdentityLabel(level: IdentityLevel): string {
  return IDENTITY_LABELS[level];
}

export function getIdentitySummary(profile: IdentityProfile): string {
  const hours = Math.floor(profile.totalFocusMinutes / 60);
  const label = IDENTITY_LABELS[profile.identityLevel];
  return `${label} — ${hours}h focused across ${profile.totalSessions} sessions`;
}