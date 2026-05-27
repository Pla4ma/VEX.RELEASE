import { z } from "zod";
import { createDebugger } from "../../utils/debug";
const debug = createDebugger("ai-coach:context");
export const ContextSnapshotSchema = z.object({
  userId: z.string(),
  capturedAt: z.number(),
  sessionContext: z.object({
    activeSession: z.boolean(),
    sessionId: z.string().optional(),
    mode: z.string().optional(),
    duration: z.number().optional(),
    quality: z.number().optional(),
  }),
  streakContext: z.object({
    currentStreak: z.number(),
    streakAtRisk: z.boolean(),
    hoursSinceLastSession: z.number(),
    streakRecord: z.number(),
  }),
  progressContext: z.object({
    currentLevel: z.number(),
    xpThisWeek: z.number(),
    sessionsThisWeek: z.number(),
    averageSessionQuality: z.number(),
  }),
  bossContext: z.object({
    activeBoss: z.boolean(),
    bossId: z.string().optional(),
    bossHealth: z.number().optional(),
    timeRemaining: z.number().optional(),
  }),
  socialContext: z.object({
    hasSquad: z.boolean(),
    squadWarActive: z.boolean(),
    pendingInvites: z.number(),
    friendsOnline: z.number(),
  }),
  temporalContext: z.object({
    hourOfDay: z.number(),
    dayOfWeek: z.number(),
    isWeekend: z.boolean(),
    daysSinceJoin: z.number(),
  }),
  behaviorContext: z.object({
    preferredTimeOfDay: z.enum(["morning", "afternoon", "evening", "night"]),
    typicalSessionDuration: z.number(),
    responseToCoach: z.enum(["high", "medium", "low"]),
    lastCoachMessageAt: z.number().optional(),
  }),
});
export type ContextSnapshot = z.infer<typeof ContextSnapshotSchema>;
export async function generateContextSnapshot(
  userId: string,
): Promise<ContextSnapshot> {
  const now = Date.now();
  const hour = new Date(now).getHours();
  const dayOfWeek = new Date(now).getDay();
  const snapshot: ContextSnapshot = {
    userId,
    capturedAt: now,
    sessionContext: { activeSession: false, duration: 25, quality: 85 },
    streakContext: {
      currentStreak: 5,
      streakAtRisk: false,
      hoursSinceLastSession: 18,
      streakRecord: 12,
    },
    progressContext: {
      currentLevel: 7,
      xpThisWeek: 1250,
      sessionsThisWeek: 8,
      averageSessionQuality: 82,
    },
    bossContext: {
      activeBoss: true,
      bossId: "boss-123",
      bossHealth: 65,
      timeRemaining: 48 * 60 * 60 * 1000,
    },
    socialContext: {
      hasSquad: true,
      squadWarActive: true,
      pendingInvites: 1,
      friendsOnline: 3,
    },
    temporalContext: {
      hourOfDay: hour,
      dayOfWeek,
      isWeekend: dayOfWeek === 0 || dayOfWeek === 6,
      daysSinceJoin: 45,
    },
    behaviorContext: {
      preferredTimeOfDay: getPreferredTime(hour),
      typicalSessionDuration: 25,
      responseToCoach: "medium",
      lastCoachMessageAt: now - 24 * 60 * 60 * 1000,
    },
  };
  debug.info("Generated context snapshot for user %s", userId);
  return ContextSnapshotSchema.parse(snapshot);
}
function getPreferredTime(
  hour: number,
): "morning" | "afternoon" | "evening" | "night" {
  if (hour >= 5 && hour < 12) {
    return "morning";
  }
  if (hour >= 12 && hour < 17) {
    return "afternoon";
  }
  if (hour >= 17 && hour < 22) {
    return "evening";
  }
  return "night";
}
export function determineInterventionPriority(
  snapshot: ContextSnapshot,
): "critical" | "high" | "medium" | "low" {
  if (snapshot.streakContext.streakAtRisk) {
    return "critical";
  }
  if (
    snapshot.bossContext.activeBoss &&
    snapshot.bossContext.timeRemaining &&
    snapshot.bossContext.timeRemaining < 24 * 60 * 60 * 1000
  ) {
    return "high";
  }
  if (snapshot.streakContext.hoursSinceLastSession > 20) {
    return "medium";
  }
  return "low";
}
export function generateCoachPrompt(snapshot: ContextSnapshot): string {
  const priority = determineInterventionPriority(snapshot);
  const basePrompt = `You are VEX AI Coach. User context:
- Streak: ${snapshot.streakContext.currentStreak} days (${snapshot.streakContext.streakAtRisk ? "AT RISK" : "stable"})
- Level: ${snapshot.progressContext.currentLevel}
- Sessions this week: ${snapshot.progressContext.sessionsThisWeek}
- Active boss: ${snapshot.bossContext.activeBoss ? "YES" : "NO"}
- Time: ${snapshot.temporalContext.hourOfDay}:00 (${snapshot.temporalContext.isWeekend ? "weekend" : "weekday"})
- Preferred time: ${snapshot.behaviorContext.preferredTimeOfDay}
- Response rate: ${snapshot.behaviorContext.responseToCoach}`;
  if (priority === "critical") {
    return `${basePrompt}\n\nPRIORITY: CRITICAL - User's streak is at risk. Send urgent motivational message.`;
  }
  if (priority === "high") {
    return `${basePrompt}\n\nPRIORITY: HIGH - Boss battle ending soon. Encourage session to defeat boss.`;
  }
  return `${basePrompt}\n\nPRIORITY: ${priority.toUpperCase()} - Provide supportive, personalized coaching.`;
}
export function shouldCoachIntervene(
  snapshot: ContextSnapshot,
  lastInterventionAt: number,
): boolean {
  const hoursSinceLast =
    (snapshot.capturedAt - lastInterventionAt) / (60 * 60 * 1000);
  if (hoursSinceLast < 4) {
    return false;
  }
  if (snapshot.streakContext.streakAtRisk) {
    return true;
  }
  if (
    snapshot.bossContext.activeBoss &&
    snapshot.bossContext.timeRemaining &&
    snapshot.bossContext.timeRemaining < 12 * 60 * 60 * 1000
  ) {
    return true;
  }
  if (
    snapshot.temporalContext.hourOfDay === 9 &&
    !snapshot.sessionContext.activeSession
  ) {
    return true;
  }
  return false;
}
export function getContextHash(snapshot: ContextSnapshot): string {
  const key = `${snapshot.userId}:${snapshot.capturedAt}:${snapshot.streakContext.currentStreak}`;
  return `ctx-${Buffer.from(key).toString("base64").slice(0, 16)}`;
}
