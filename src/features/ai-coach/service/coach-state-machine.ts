import {
  type CoachUserState,
  type CoachState,
  type BehaviorProfile,
  CoachUserStateSchema,
} from '../schemas';
import * as repository from '../repository';
import { withRetry, RetryableError } from '../utils/retry';

interface StateConfig {
  onEntry?: (state: CoachState, previousState: CoachUserState | null) => Promise<void>;
  onExit?: (state: CoachState, nextState: CoachUserState) => Promise<void>;
  allowedTransitions: CoachUserState[];
  maxDurationHours?: number;
  requiredDataPoints?: number;
}

const STATE_CONFIG: Record<CoachUserState, StateConfig> = {
  COLD_START: {
    allowedTransitions: ['LOW_CONFIDENCE', 'STREAK_AT_RISK'],
    requiredDataPoints: 0,
  },
  LOW_CONFIDENCE: {
    allowedTransitions: ['HIGH_CONFIDENCE', 'STREAK_AT_RISK', 'COLD_START'],
    requiredDataPoints: 5,
    maxDurationHours: 168,
  },
  HIGH_CONFIDENCE: {
    allowedTransitions: ['STREAK_AT_RISK', 'COMEBACK_MODE', 'OVERLOAD_PROTECTION', 'MUTED_MODE'],
    requiredDataPoints: 20,
  },
  STREAK_AT_RISK: {
    allowedTransitions: ['HIGH_CONFIDENCE', 'POST_FAILURE_SUPPORT', 'MUTED_MODE'],
    maxDurationHours: 48,
  },
  COMEBACK_MODE: {
    onEntry: async (state) => {
      await ensureComebackPlan(state.userId);
    },
    allowedTransitions: ['HIGH_CONFIDENCE', 'POST_FAILURE_SUPPORT', 'MUTED_MODE'],
    maxDurationHours: 168,
  },
  POST_FAILURE_SUPPORT: {
    onEntry: async (state) => {
      await sendPostFailureSupport(state.userId);
    },
    allowedTransitions: ['COMEBACK_MODE', 'LOW_CONFIDENCE', 'MUTED_MODE'],
    maxDurationHours: 72,
  },
  MILESTONE_HYPE: {
    onEntry: async (state) => {
      await sendMilestoneCelebration(state.userId, state);
    },
    allowedTransitions: ['HIGH_CONFIDENCE', 'STREAK_AT_RISK'],
    maxDurationHours: 24,
  },
  OVERLOAD_PROTECTION: {
    onEntry: async (state) => {
      await reduceNotifications(state.userId);
    },
    onExit: async (state) => {
      await restoreNotifications(state.userId);
    },
    allowedTransitions: ['HIGH_CONFIDENCE', 'MUTED_MODE'],
    maxDurationHours: 24,
  },
  MUTED_MODE: {
    onEntry: async (state) => {
      await muteAllNotifications(state.userId);
    },
    onExit: async (state) => {
      await restoreNotifications(state.userId);
    },
    allowedTransitions: ['HIGH_CONFIDENCE', 'LOW_CONFIDENCE'],
    maxDurationHours: 168,
  },
};

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
  if (signals.isMuted) return 'MUTED_MODE';
  if (signals.sessionOverload) return 'OVERLOAD_PROTECTION';
  if (signals.comebackActive) return 'COMEBACK_MODE';
  if (signals.streakIsAtRisk) return 'STREAK_AT_RISK';
  if (signals.streakRecentlyBroken && signals.daysSinceBreak < 3) return 'POST_FAILURE_SUPPORT';
  if (signals.hasUncelebratedMilestone) return 'MILESTONE_HYPE';
  if (signals.isColdStart) return 'COLD_START';
  if (
    signals.profileConfidence === 'HIGH' &&
    signals.dataPoints >= 20
  ) {
    return 'HIGH_CONFIDENCE';
  }
  if (signals.dataPoints >= 5) return 'LOW_CONFIDENCE';
  return 'COLD_START';
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
    isMuted: !!(
      currentState?.reduceNotifications || currentState?.muteUntil
    ),
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
      getCurrentStateSafe(userId),
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

export async function transitionState(
  userId: string,
  newState: CoachUserState,
  context?: Record<string, unknown>,
  force: boolean = false,
): Promise<CoachState> {
  const currentState = await getCurrentStateSafe(userId);
  const previousStateValue = currentState.currentState;

  if (!force && !isValidTransition(previousStateValue, newState)) {
    throw new StateTransitionError(
      `Invalid transition: ${previousStateValue} -> ${newState}`,
      previousStateValue,
      newState,
    );
  }

  const currentConfig = STATE_CONFIG[previousStateValue];
  if (currentConfig?.onExit) {
    await withRetry(
      () => currentConfig.onExit!(currentState, newState),
      { maxAttempts: 3 },
      'state-exit-action',
    );
  }

  const newStateRecord: CoachState = {
    ...currentState,
    currentState: newState,
    previousState: previousStateValue,
    stateEnteredAt: Date.now(),
  };

  await withRetry(
    () => repository.upsertCoachState(newStateRecord),
    { maxAttempts: 3 },
    'persist-state',
  );

  const newConfig = STATE_CONFIG[newState];
  if (newConfig?.onEntry) {
    await withRetry(
      () => newConfig.onEntry!(newStateRecord, previousStateValue),
      { maxAttempts: 3 },
      'state-entry-action',
    );
  }

  emitStateChangedEvent(userId, previousStateValue, newState, context);
  return newStateRecord;
}

export async function checkAutoTransitions(
  userId: string,
): Promise<CoachState | null> {
  const state = await getCurrentStateSafe(userId);
  const config = STATE_CONFIG[state.currentState];

  if (!config.maxDurationHours) return null;

  const hoursInState =
    (Date.now() - state.stateEnteredAt) / (1000 * 60 * 60);
  if (hoursInState > config.maxDurationHours) {
    const profile = await repository.fetchBehaviorProfile(userId);
    const nextState = await determineOptimalState(userId, profile);
    if (nextState !== state.currentState) {
      return transitionState(userId, nextState, { autoTransition: true });
    }
  }

  return null;
}

function isValidTransition(from: CoachUserState, to: CoachUserState): boolean {
  if (from === to) return true;
  const config = STATE_CONFIG[from];
  return config.allowedTransitions.includes(to);
}

async function getCurrentStateSafe(userId: string): Promise<CoachState> {
  const state = await repository.fetchCoachState(userId);
  if (state) return state;

  const defaultState: CoachState = {
    userId,
    currentState: 'COLD_START',
    previousState: null,
    stateEnteredAt: Date.now(),
    personaId: '00000000-0000-4000-a000-000000000001',
    behaviorProfile: null,
    lastInterventionAt: null,
    interventionsToday: 0,
    muteUntil: null,
    reduceNotifications: false,
  };

  return repository.upsertCoachState(defaultState);
}

interface StreakStatus {
  isAtRisk: boolean;
  riskLevel: 'NONE' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  wasRecentlyBroken: boolean;
  daysSinceBreak: number;
  recentMilestone: boolean;
  milestoneCelebrated: boolean;
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
    if (streakValue < 0.2) riskLevel = 'CRITICAL';
    else if (streakValue < 0.4) riskLevel = 'HIGH';
    else if (streakValue < 0.5) riskLevel = 'MEDIUM';
    else riskLevel = 'LOW';
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

interface SessionMetrics {
  sessionsToday: number;
  sessionsThisWeek: number;
  averageQuality: number;
}

async function fetchRecentSessionMetrics(
  userId: string,
  days: number,
): Promise<SessionMetrics> {
  try {
    const behaviorProfile = await repository.fetchBehaviorProfile(userId);
    if (!behaviorProfile) return { sessionsToday: 0, sessionsThisWeek: 0, averageQuality: 75 };

    const qualitySignals = behaviorProfile.signals.filter(
      (s) => s.signalType === 'SESSION_QUALITY_TREND',
    );
    const averageQuality =
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
      averageQuality,
    };
  } catch {
    return { sessionsToday: 0, sessionsThisWeek: 0, averageQuality: 75 };
  }
}

async function ensureComebackPlan(userId: string): Promise<void> {
  const existing = await repository.fetchActiveComebackPlan(userId);
  if (!existing) {
    // Comeback plan creation delegated to comeback service
  }
}

async function sendPostFailureSupport(userId: string): Promise<void> {
  // Delegated to intervention engine
}

async function sendMilestoneCelebration(
  userId: string,
  state: CoachState,
): Promise<void> {
  // Delegated to intervention engine
}

async function reduceNotifications(userId: string): Promise<void> {
  await repository.upsertCoachState({
    ...(await getCurrentStateSafe(userId)),
    reduceNotifications: true,
  });
}

async function restoreNotifications(userId: string): Promise<void> {
  await repository.upsertCoachState({
    ...(await getCurrentStateSafe(userId)),
    reduceNotifications: false,
    muteUntil: null,
  });
}

async function muteAllNotifications(userId: string): Promise<void> {
  await repository.upsertCoachState({
    ...(await getCurrentStateSafe(userId)),
    reduceNotifications: true,
    muteUntil: Date.now() + 7 * 24 * 60 * 60 * 1000,
  });
}

function emitStateChangedEvent(
  userId: string,
  previousState: CoachUserState | null,
  newState: CoachUserState,
  context?: Record<string, unknown>,
): void {
  // Delegated to event bus - wired at integration layer
}

export class StateTransitionError extends Error {
  constructor(
    message: string,
    public fromState: CoachUserState,
    public toState: CoachUserState,
  ) {
    super(message);
    this.name = 'StateTransitionError';
  }
}

export class StateMachineError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'StateMachineError';
  }
}
