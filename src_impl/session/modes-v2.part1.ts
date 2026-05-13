import { z } from "zod";
import { featureFlags } from "../feature-flags/FeatureFlagEngine";


export const SessionModeV2Schema = z.nativeEnum(SessionModeV2);

export const SESSION_MODE_V2_CONFIG: Record<SessionModeV2, SessionModeV2Config> = {
  [SessionModeV2.FLOW]: {
    name: 'Flow',
    description: 'Standard productivity session with balanced difficulty',
    icon: '🌊',
    color: '#3B82F6', // blue-500

    // Balanced difficulty
    bossHealthMultiplier: 1.0,
    bossAttackFrequency: 2, // 2 attacks per 10 min
    pausePenaltyMultiplier: 1.0,
    purityPassThreshold: 75,

    // Standard rewards
    xpMultiplier: 1.0,
    coinMultiplier: 1.0,
    gemDropChance: 0.05, // 5% chance

    // Moderate restrictions
    allowPauses: true,
    maxPauses: 3,
    minimumDurationMinutes: 15,
    maximumDurationMinutes: 120,

    // Balanced scoring
    scoringWeights: { consistency: 0.35, depth: 0.35, recovery: 0.30 },

    // Steady companion
    companionBehavior: 'focused',
    comebackBonusActive: false,
  },

  [SessionModeV2.CHALLENGE]: {
    name: 'Challenge',
    description: 'No pauses allowed. Harder bosses. Double rewards.',
    icon: '🔥',
    color: '#EF4444', // red-500

    // High difficulty
    bossHealthMultiplier: 1.5,
    bossAttackFrequency: 4, // 4 attacks per 10 min (intense!)
    pausePenaltyMultiplier: 2.0, // Pauses hurt more
    purityPassThreshold: 85,

    // High rewards
    xpMultiplier: 2.0,
    coinMultiplier: 2.0,
    gemDropChance: 0.15, // 15% chance

    // Strict restrictions
    allowPauses: false,
    maxPauses: 0,
    minimumDurationMinutes: 25,
    maximumDurationMinutes: 90,

    // Purity-weighted scoring
    scoringWeights: { consistency: 0.45, depth: 0.45, recovery: 0.10 },

    // Intense companion
    companionBehavior: 'intense',
    comebackBonusActive: false,
  },

  [SessionModeV2.RECOVERY]: {
    name: 'Recovery',
    description: 'Gentle session after a setback. Reduced pressure.',
    icon: '🌱',
    color: '#10B981', // emerald-500

    // Easy difficulty
    bossHealthMultiplier: 0.7,
    bossAttackFrequency: 1, // 1 attack per 10 min
    pausePenaltyMultiplier: 0.5, // Pauses hurt less
    purityPassThreshold: 65,

    // Reduced but boosted rewards (comeback mechanics)
    xpMultiplier: 0.8,
    coinMultiplier: 0.8,
    gemDropChance: 0.02, // 2% chance

    // Forgiving restrictions
    allowPauses: true,
    maxPauses: 5,
    minimumDurationMinutes: 10,
    maximumDurationMinutes: 60,

    // Recovery-weighted scoring
    scoringWeights: { consistency: 0.20, depth: 0.30, recovery: 0.50 },

    // Supportive companion
    companionBehavior: 'gentle',
    comebackBonusActive: true, // Special comeback XP bonus
  },
};

export function resolveSessionModeV2(input: unknown): SessionModeV2 {
  const parsed = SessionModeV2Schema.safeParse(input);
  return parsed.success ? parsed.data : SessionModeV2.FLOW;
}

export function getSessionModeV2Config(mode: unknown): SessionModeV2Config {
  return SESSION_MODE_V2_CONFIG[resolveSessionModeV2(mode)];
}

export function recommendSessionModeV2(
  lastSessionFailed: boolean,
  currentStreak: number,
  averagePurityLast7Days: number
): SessionModeV2 {
  // Default to flow
  let recommended = SessionModeV2.FLOW;

  // Recovery mode if last session failed or low streak
  if (lastSessionFailed || currentStreak < 2) {
    recommended = SessionModeV2.RECOVERY;
  }

  // Challenge mode if performing well
  if (currentStreak >= 7 && averagePurityLast7Days >= 80) {
    recommended = SessionModeV2.CHALLENGE;
  }

  return recommended;
}

export function isModeEligibleV2(
  mode: SessionModeV2,
  userLevel: number,
  hasCompletedTutorial: boolean
): { eligible: boolean; reason?: string } {
  // Everyone can use FLOW
  if (mode === SessionModeV2.FLOW) {
    return { eligible: true };
  }

  // Must complete tutorial for other modes
  if (!hasCompletedTutorial) {
    return { eligible: false, reason: 'Complete tutorial to unlock' };
  }

  // CHALLENGE requires level 5+
  if (mode === SessionModeV2.CHALLENGE && userLevel < 5) {
    return { eligible: false, reason: 'Reach level 5 to unlock Challenge mode' };
  }

  // RECOVERY is always available (for struggling users)
  if (mode === SessionModeV2.RECOVERY) {
    return { eligible: true };
  }

  return { eligible: true };
}

export function migrateOldModeToV2(oldMode: string): SessionModeV2 {
  switch (oldMode) {
    case 'DEEP_WORK':
      return SessionModeV2.CHALLENGE;
    case 'LIGHT_FOCUS':
      return SessionModeV2.FLOW;
    case 'STUDY':
      return SessionModeV2.FLOW;
    case 'CREATIVE':
      return SessionModeV2.FLOW;
    case 'SPRINT':
      return SessionModeV2.CHALLENGE;
    default:
      return SessionModeV2.FLOW;
  }
}