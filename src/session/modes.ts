import { z } from 'zod';

export enum SessionMode {
  DEEP_WORK = 'DEEP_WORK',
  CHALLENGE = 'CHALLENGE', // Formerly DEEP_WORK - High intensity, high reward
  LIGHT_FOCUS = 'LIGHT_FOCUS',
  FLOW = 'FLOW', // Formerly LIGHT_FOCUS - Gentle, sustainable focus
  STUDY = 'STUDY',
  CREATIVE = 'CREATIVE',
  SPRINT = 'SPRINT',
  RECOVERY = 'RECOVERY', // Formerly SPRINT - Short comeback sessions
  STARTER = 'STARTER', // First-time user sessions - easy and encouraging
}

export const SessionModeSchema = z.nativeEnum(SessionMode);

export type CompanionModeBehavior =
  | 'intense'
  | 'gentle'
  | 'expressive'
  | 'energetic'
  | 'supportive';

export type SessionModeConfig = {
  blockerIntensityMultiplier: number;
  companionBehavior: CompanionModeBehavior;
  minimumQualifyingDurationSeconds: number;
  pausePenaltyMultiplier: number;
  purityPassThreshold: number;
  scoringWeights: {
    consistency: number;
    depth: number;
    recovery: number;
  };
  xpMultiplier: number;
};

export const SESSION_MODE_CONFIG: Record<SessionMode, SessionModeConfig> = {
  [SessionMode.DEEP_WORK]: {
    blockerIntensityMultiplier: 1.5,
    companionBehavior: 'intense',
    minimumQualifyingDurationSeconds: 45 * 60,
    pausePenaltyMultiplier: 1.3,
    purityPassThreshold: 85,
    scoringWeights: { consistency: 0.45, depth: 0.4, recovery: 0.15 },
    xpMultiplier: 1.2,
  },
  [SessionMode.CHALLENGE]: {
    blockerIntensityMultiplier: 1.5,
    companionBehavior: 'intense',
    minimumQualifyingDurationSeconds: 45 * 60,
    pausePenaltyMultiplier: 1.3,
    purityPassThreshold: 85,
    scoringWeights: { consistency: 0.45, depth: 0.4, recovery: 0.15 },
    xpMultiplier: 1.2,
  },
  [SessionMode.FLOW]: {
    blockerIntensityMultiplier: 0.75,
    companionBehavior: 'gentle',
    minimumQualifyingDurationSeconds: 15 * 60,
    pausePenaltyMultiplier: 0.5,
    purityPassThreshold: 70,
    scoringWeights: { consistency: 0.25, depth: 0.35, recovery: 0.4 },
    xpMultiplier: 1,
  },
  [SessionMode.LIGHT_FOCUS]: {
    blockerIntensityMultiplier: 0.75,
    companionBehavior: 'gentle',
    minimumQualifyingDurationSeconds: 15 * 60,
    pausePenaltyMultiplier: 0.5,
    purityPassThreshold: 70,
    scoringWeights: { consistency: 0.25, depth: 0.35, recovery: 0.4 },
    xpMultiplier: 1,
  },
  [SessionMode.STUDY]: {
    blockerIntensityMultiplier: 1,
    companionBehavior: 'supportive',
    minimumQualifyingDurationSeconds: 20 * 60,
    pausePenaltyMultiplier: 0.7,
    purityPassThreshold: 75,
    scoringWeights: { consistency: 0.35, depth: 0.35, recovery: 0.3 },
    xpMultiplier: 1.1,
  },
  [SessionMode.CREATIVE]: {
    blockerIntensityMultiplier: 1,
    companionBehavior: 'expressive',
    minimumQualifyingDurationSeconds: 20 * 60,
    pausePenaltyMultiplier: 0.5,
    purityPassThreshold: 65,
    scoringWeights: { consistency: 0.2, depth: 0.45, recovery: 0.35 },
    xpMultiplier: 1.05,
  },
  [SessionMode.SPRINT]: {
    blockerIntensityMultiplier: 0.8,
    companionBehavior: 'energetic',
    minimumQualifyingDurationSeconds: 10 * 60,
    pausePenaltyMultiplier: 0.3,
    purityPassThreshold: 60,
    scoringWeights: { consistency: 0.3, depth: 0.2, recovery: 0.5 },
    xpMultiplier: 0.9,
  },
  [SessionMode.RECOVERY]: {
    blockerIntensityMultiplier: 0.8,
    companionBehavior: 'supportive',
    minimumQualifyingDurationSeconds: 10 * 60,
    pausePenaltyMultiplier: 0.3,
    purityPassThreshold: 60,
    scoringWeights: { consistency: 0.3, depth: 0.2, recovery: 0.5 },
    xpMultiplier: 0.9,
  },
  [SessionMode.STARTER]: {
    blockerIntensityMultiplier: 0.5,
    companionBehavior: 'supportive',
    minimumQualifyingDurationSeconds: 5 * 60,
    pausePenaltyMultiplier: 0.1,
    purityPassThreshold: 50,
    scoringWeights: { consistency: 0.2, depth: 0.1, recovery: 0.7 },
    xpMultiplier: 1.0,
  },
};

export function resolveSessionMode(input: unknown): SessionMode {
  const parsed = SessionModeSchema.safeParse(input);
  return parsed.success ? parsed.data : SessionMode.FLOW;
}

export function getSessionModeConfig(mode: unknown): SessionModeConfig {
  return SESSION_MODE_CONFIG[resolveSessionMode(mode)];
}

export function getRecoveryChainMultiplier(chainCount: number): number {
  const clampedChain = Math.max(1, Math.min(4, Math.floor(chainCount)));
  return 1 + (clampedChain - 1) * 0.05;
}

export function getSprintChainMultiplier(chainCount: number): number {
  return getRecoveryChainMultiplier(chainCount);
}
