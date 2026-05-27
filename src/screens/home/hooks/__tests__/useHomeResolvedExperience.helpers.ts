export interface SessionEntry {
  status?: string;
  duration?: number;
  effectiveDuration?: number;
  mode?: string;
  startTime?: number;
  focusQuality?: number;
  config?: { sessionMode?: string; studyPlanId?: string };
}

export function resolvePrimaryGoal(goal: string | null): string {
  switch (goal) {
    case "STUDY":
      return "study";
    case "WORK":
      return "work";
    case "CREATIVE":
      return "creative";
    case "LEARNING":
      return "learning";
    case "PERSONAL":
      return "personal";
    default:
      return "focus";
  }
}

export function computeCompletedDurations(sessions: SessionEntry[]): number[] {
  return sessions
    .map((s) => s.effectiveDuration ?? s.duration ?? 0)
    .filter((d) => d > 0);
}

export function computePreferredMode(
  sessions: SessionEntry[],
): string | null {
  const recent = sessions.slice(-10);
  if (recent.length === 0) return null;
  const modeCounts = new Map<string, number>();
  for (const s of recent) {
    const mode = s.mode ?? s.config?.sessionMode;
    if (mode) {
      modeCounts.set(mode, (modeCounts.get(mode) ?? 0) + 1);
    }
  }
  if (modeCounts.size === 0) return null;
  const entries = Array.from(modeCounts.entries()).sort((a, b) => b[1] - a[1]);
  return entries[0]?.[0] ?? null;
}

export function computeStudyUsageRatio(
  completedSessions: SessionEntry[],
  totalCompleted: number,
): number {
  if (totalCompleted === 0 || completedSessions.length === 0) return 0;
  const studySessions = completedSessions.filter(
    (s) =>
      s.mode === "STUDY" ||
      s.config?.sessionMode === "STUDY" ||
      Boolean(s.config?.studyPlanId),
  );
  return Math.min(1, studySessions.length / totalCompleted);
}

export function computeBestTimeOfDay(
  sessions: SessionEntry[],
): string | null {
  const qualitySessions = sessions.filter(
    (s) =>
      typeof s.focusQuality === "number" && typeof s.startTime === "number",
  );
  if (qualitySessions.length < 3) return null;

  qualitySessions.sort(
    (a, b) => (b.focusQuality ?? 0) - (a.focusQuality ?? 0),
  );
  const top = qualitySessions.slice(0, Math.min(3, qualitySessions.length));
  const avgHour =
    top.reduce((sum, s) => {
      const date = new Date((s.startTime ?? 0) * 1000);
      return sum + date.getHours();
    }, 0) / top.length;

  const hour = Math.round(avgHour);
  if (hour < 6) return "early_morning";
  if (hour < 12) return "morning";
  if (hour < 17) return "afternoon";
  if (hour < 21) return "evening";
  return "night";
}

export function computeBossEngagement(
  hasActiveBoss: boolean,
  encounters?: number,
): "none" | "low" | "medium" | "high" {
  if (!hasActiveBoss) return "none";
  const encounterCount = encounters ?? 0;
  if (encounterCount >= 3) return "high";
  if (encounterCount >= 1) return "medium";
  return "low";
}

export function computeCoachInteractions(
  hasPrimaryRecommendation: boolean,
  acceptedCount?: number,
): number {
  let count = 0;
  if (hasPrimaryRecommendation) count += 1;
  count += acceptedCount ?? 0;
  return count;
}
