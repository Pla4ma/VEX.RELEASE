import {
  type CoachUserState,
  type CoachState,
  type BehaviorProfile,
} from '../schemas';
import * as repository from '../repository';

export interface CoachSignals {
  comebackActive: boolean;
  streakIsAtRisk: boolean;
  streakRecentlyBroken: boolean;
  daysSinceBreak: number;
  hasUncelebratedMilestone: boolean;
  sessionOverload: boolean;
  isMuted: boolean;
  isColdStart: boolean;
  profileConfidence: 'LOW' | 'MEDIUM' | 'HIGH';
  dataPoints: number;
}

export function resolveCoachState(signals: CoachSignals): CoachUserState {
  if (signals.isMuted) {return 'MUTED_MODE';}
  if (signals.sessionOverload) {return 'OVERLOAD_PROTECTION';}
  if (signals.comebackActive) {return 'COMEBACK_MODE';}
  if (signals.streakIsAtRisk) {return 'STREAK_AT_RISK';}
  if (signals.streakRecentlyBroken && signals.daysSinceBreak < 3)
    {return 'POST_FAILURE_SUPPORT';}
  if (signals.hasUncelebratedMilestone) {return 'MILESTONE_HYPE';}
  if (signals.isColdStart) {return 'COLD_START';}
  if (signals.profileConfidence === 'HIGH' && signals.dataPoints >= 20) {
    return 'HIGH_CONFIDENCE';
  }
  if (signals.dataPoints >= 5) {return 'LOW_CONFIDENCE';}
  return 'COLD_START';
}

interface StreakStatus {
  isAtRisk: boolean;
  riskLevel: 'NONE' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  wasRecentlyBroken: boolean;
  daysSinceBreak: number;
  recentMilestone: boolean;
  milestoneCelebrated: boolean;
}

interface SessionMetrics {
  sessionsToday: number;
  sessionsThisWeek: number;
  averageSessionQuality: number;
}

function buildCoachSignals(
  profile: BehaviorProfile | null,
  currentState: CoachState | null,
  streakStatus: StreakStatus,
  sessionMetrics: SessionMetrics,
  comebackPlan: { status: string } | null,
): CoachSignals {
  return {
    comebackActive: comebackPlan?.status === 'ACTIVE',
    streakIsAtRisk: streakStatus.isAtRisk,
    streakRecentlyBroken: streakStatus.wasRecentlyBroken,
    daysSinceBreak: streakStatus.daysSinceBreak,
    hasUncelebratedMilestone:
      !!streakStatus.recentMilestone && !streakStatus.milestoneCelebrated,
    sessionOverload: sessionMetrics.sessionsToday >= 5,
    isMuted: !!(currentState?.reduceNotifications || currentState?.muteUntil),
    isColdStart: !profile || profile.coldStart,
    profileConfidence: profile?.confidenceLevel ?? 'LOW',
    dataPoints: profile?.dataPoints ?? 0,
  };
}

export async function determineOptimalState(
  userId: string,
  profile: BehaviorProfile | null,
): Promise<CoachUserState> {
  const [currentState, streakStatus, recentSessions, comebackPlan] =
    await Promise.all([
      repository.fetchCoachState(userId),
      fetchStreakStatus(userId, profile),
      fetchRecentSessionMetrics(userId, 7),
      repository.fetchActiveComebackPlan(userId),
    ]);

  const signals = buildCoachSignals(
    profile,
    currentState,
    streakStatus,
    recentSessions,
    comebackPlan,
  );

  return resolveCoachState(signals);
}

async function fetchStreakStatus(
  userId: string,
  profile: BehaviorProfile | null,
): Promise<StreakStatus> {
  if (!profile || profile.signals.length === 0) {
    return {
      isAtRisk: false,
      riskLevel: 'NONE',
      wasRecentlyBroken: false,
      daysSinceBreak: 0,
      recentMilestone: false,
      milestoneCelebrated: false,
    };
  }

  const streakSignal = profile.signals.find(
    (s) => s.signalType === 'STREAK_MAINTENANCE_RATE',
  );
  const consistencySignal = profile.signals.find(
    (s) => s.signalType === 'CONSISTENCY_SCORE',
  );

  const streakValue = streakSignal?.value ?? 1;
  const consistencyValue = consistencySignal?.value ?? 1;

  const isAtRisk = streakValue < 0.6 || consistencyValue < 0.4;
  const wasRecentlyBroken = streakValue < 0.3;
  const daysSinceBreak = wasRecentlyBroken ? 1 : 0;
  const recentMilestone = streakValue >= 0.9;

  let riskLevel: StreakStatus['riskLevel'] = 'NONE';
  if (isAtRisk) {
    if (streakValue < 0.2) {riskLevel = 'CRITICAL';}
    else if (streakValue < 0.4) {riskLevel = 'HIGH';}
    else if (streakValue < 0.5) {riskLevel = 'MEDIUM';}
    else {riskLevel = 'LOW';}
  }

  return {
    isAtRisk,
    riskLevel,
    wasRecentlyBroken,
    daysSinceBreak,
    recentMilestone,
    milestoneCelebrated: false,
  };
}

async function fetchRecentSessionMetrics(
  userId: string,
  _days: number,
): Promise<SessionMetrics> {
  try {
    const behaviorProfile = await repository.fetchBehaviorProfile(userId);
    if (!behaviorProfile)
      {return { sessionsToday: 0, sessionsThisWeek: 0, averageSessionQuality: 75 };}

    const qualitySignals = behaviorProfile.signals.filter(
      (s) => s.signalType === 'SESSION_QUALITY_TREND',
    );
    const averageSessionQuality =
      qualitySignals.length > 0
        ? Math.round(
            (qualitySignals.reduce((sum, s) => sum + s.value, 0) /
              qualitySignals.length) *
              100,
          )
        : 75;

    return {
      sessionsToday: 0,
      sessionsThisWeek: behaviorProfile.dataPoints,
      averageSessionQuality,
    };
  } catch (error: unknown) {
    return { sessionsToday: 0, sessionsThisWeek: 0, averageSessionQuality: 75 };
  }
}
