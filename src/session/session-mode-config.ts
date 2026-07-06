import { SessionMode } from './mode-constants';

export type CompanionModeBehavior =
  | 'intense'
  | 'gentle'
  | 'expressive'
  | 'energetic'
  | 'supportive'
  | 'silent';

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
  isSessionLess: boolean;
  description: string;
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
    isSessionLess: false,
    description: 'High intensity — for hard, uninterrupted work',
  },
  [SessionMode.CHALLENGE]: {
    blockerIntensityMultiplier: 1.5,
    companionBehavior: 'intense',
    minimumQualifyingDurationSeconds: 45 * 60,
    pausePenaltyMultiplier: 1.3,
    purityPassThreshold: 85,
    scoringWeights: { consistency: 0.45, depth: 0.4, recovery: 0.15 },
    xpMultiplier: 1.2,
    isSessionLess: false,
    description: 'Alias for Deep Work — deprecated',
  },
  [SessionMode.LIGHT_FOCUS]: {
    blockerIntensityMultiplier: 0.75,
    companionBehavior: 'gentle',
    minimumQualifyingDurationSeconds: 15 * 60,
    pausePenaltyMultiplier: 0.5,
    purityPassThreshold: 70,
    scoringWeights: { consistency: 0.25, depth: 0.35, recovery: 0.4 },
    xpMultiplier: 1,
    isSessionLess: false,
    description: 'Steady, low-pressure — protect a single thread',
  },
  [SessionMode.FLOW]: {
    blockerIntensityMultiplier: 0.75,
    companionBehavior: 'gentle',
    minimumQualifyingDurationSeconds: 15 * 60,
    pausePenaltyMultiplier: 0.5,
    purityPassThreshold: 70,
    scoringWeights: { consistency: 0.25, depth: 0.35, recovery: 0.4 },
    xpMultiplier: 1,
    isSessionLess: false,
    description: 'Alias for Light Focus — deprecated',
  },
  [SessionMode.STUDY]: {
    blockerIntensityMultiplier: 1,
    companionBehavior: 'supportive',
    minimumQualifyingDurationSeconds: 20 * 60,
    pausePenaltyMultiplier: 0.7,
    purityPassThreshold: 75,
    scoringWeights: { consistency: 0.35, depth: 0.35, recovery: 0.3 },
    xpMultiplier: 1.1,
    isSessionLess: false,
    description: 'Named study blocks with recall and review built in',
  },
  [SessionMode.CREATIVE]: {
    blockerIntensityMultiplier: 1,
    companionBehavior: 'expressive',
    minimumQualifyingDurationSeconds: 20 * 60,
    pausePenaltyMultiplier: 0.5,
    purityPassThreshold: 65,
    scoringWeights: { consistency: 0.2, depth: 0.45, recovery: 0.35 },
    xpMultiplier: 1.05,
    isSessionLess: false,
    description: 'Open-ended creative flow — no pressure, no timers',
  },
  [SessionMode.SPRINT]: {
    blockerIntensityMultiplier: 0.8,
    companionBehavior: 'energetic',
    minimumQualifyingDurationSeconds: 10 * 60,
    pausePenaltyMultiplier: 0.3,
    purityPassThreshold: 60,
    scoringWeights: { consistency: 0.3, depth: 0.2, recovery: 0.5 },
    xpMultiplier: 0.9,
    isSessionLess: false,
    description: 'Short blocks — chain them for momentum',
  },
  [SessionMode.RECOVERY]: {
    blockerIntensityMultiplier: 0.8,
    companionBehavior: 'supportive',
    minimumQualifyingDurationSeconds: 10 * 60,
    pausePenaltyMultiplier: 0.3,
    purityPassThreshold: 60,
    scoringWeights: { consistency: 0.3, depth: 0.2, recovery: 0.5 },
    xpMultiplier: 0.9,
    isSessionLess: false,
    description: 'Alias for Sprint — deprecated',
  },
  [SessionMode.STARTER]: {
    blockerIntensityMultiplier: 0.5,
    companionBehavior: 'supportive',
    minimumQualifyingDurationSeconds: 5 * 60,
    pausePenaltyMultiplier: 0.1,
    purityPassThreshold: 50,
    scoringWeights: { consistency: 0.2, depth: 0.1, recovery: 0.7 },
    xpMultiplier: 1.0,
    isSessionLess: false,
    description: 'First-time user sessions — easy and encouraging',
  },
  [SessionMode.PLAN]: {
    blockerIntensityMultiplier: 0,
    companionBehavior: 'silent',
    minimumQualifyingDurationSeconds: 0,
    pausePenaltyMultiplier: 0,
    purityPassThreshold: 0,
    scoringWeights: { consistency: 0, depth: 0, recovery: 0 },
    xpMultiplier: 0,
    isSessionLess: true,
    description: 'Plan your week, projects, and study blocks without a timer',
  },
  [SessionMode.REVIEW]: {
    blockerIntensityMultiplier: 0,
    companionBehavior: 'silent',
    minimumQualifyingDurationSeconds: 0,
    pausePenaltyMultiplier: 0,
    purityPassThreshold: 0,
    scoringWeights: { consistency: 0, depth: 0, recovery: 0 },
    xpMultiplier: 0,
    isSessionLess: true,
    description: 'Review your progress, insights, and weekly intelligence',
  },
  [SessionMode.CAPTURE]: {
    blockerIntensityMultiplier: 0,
    companionBehavior: 'silent',
    minimumQualifyingDurationSeconds: 0,
    pausePenaltyMultiplier: 0,
    purityPassThreshold: 0,
    scoringWeights: { consistency: 0, depth: 0, recovery: 0 },
    xpMultiplier: 0,
    isSessionLess: true,
    description: 'Quick capture — voice, photo, link, or brain dump',
  },
  [SessionMode.HABIT]: {
    blockerIntensityMultiplier: 0,
    companionBehavior: 'gentle',
    minimumQualifyingDurationSeconds: 0,
    pausePenaltyMultiplier: 0,
    purityPassThreshold: 0,
    scoringWeights: { consistency: 0, depth: 0, recovery: 0 },
    xpMultiplier: 0,
    isSessionLess: true,
    description: 'Track habits, routines, and micro-commitments',
  },
};
