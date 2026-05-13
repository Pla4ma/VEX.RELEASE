import { SessionSetupNavigationParamsSchema, SessionStartHeroSchema, SessionStartSummarySchema, SessionStakeSchema, type SessionSetupNavigationParams, type SessionStartHero, type SessionStartSummary, type SessionStake } from './schemas';
import { fetchActiveEncounter, fetchBossTemplate } from '../boss/repository';
import { fetchStreak } from '../streaks/repository';
import { fetchActiveChallengeDetails } from '../challenges/repository';
// import { getCurrentRival, fetchRivalBaselineStats } from '../rivals/repository';
import { fetchWallet } from '../economy/repository';

/*
Dependencies: session setup screen state, session start flow, typed navigation params
Consumers: SessionSetup screen, future session start entry points
Integration: Boss, Streaks, Challenges, Rivals, Economy systems via eventBus
*/
// ============================================================================
// Session Stake Service (Phase 2)
// ============================================================================

interface BossDamageEstimate {
  min: number;
  max: number;
}

function calculateBossDamageEstimate(durationSeconds: number, _mode: string, streakDays: number): BossDamageEstimate {
  // Base damage: 1 per minute, with quality estimate of 0.8-1.0
  const baseDamage = Math.floor(durationSeconds / 60);
  const streakMultiplier = streakDays >= 7 ? 1.5 : 1.0;

  // 10% critical hit chance doubles the max
  const min = Math.floor(baseDamage * 0.8 * streakMultiplier);
  const max = Math.floor(baseDamage * 1.0 * streakMultiplier * (Math.random() < 0.1 ? 2 : 1));

  return { min, max };
}

function calculateStreakRisk(streak: { currentDays: number; shieldsAvailable: number; lastQualifyingSessionAt: number | null; timezone: string }): 'SAFE' | 'AT_RISK' | 'CRITICAL' {
  if (streak.currentDays === 0) {
    return 'SAFE';
  }

  const lastSession = streak.lastQualifyingSessionAt;
  if (!lastSession) {
    return 'SAFE';
  }

  const now = Date.now();
  const deadline = lastSession + 24 * 60 * 60 * 1000; // 24 hours
  const hoursRemaining = Math.floor((deadline - now) / (1000 * 60 * 60));

  if (hoursRemaining <= 0) {
    return streak.shieldsAvailable > 0 ? 'AT_RISK' : 'CRITICAL';
  }
  if (hoursRemaining <= 4) {
    return 'CRITICAL';
  }
  if (hoursRemaining <= 12) {
    return 'AT_RISK';
  }
  return 'SAFE';
}

function calculateHoursRemaining(streak: { lastQualifyingSessionAt: number | null }): number | undefined {
  if (!streak.lastQualifyingSessionAt) {
    return undefined;
  }

  const deadline = streak.lastQualifyingSessionAt + 24 * 60 * 60 * 1000;
  const hoursRemaining = Math.floor((deadline - Date.now()) / (1000 * 60 * 60));
  return hoursRemaining > 0 ? hoursRemaining : undefined;
}

function estimateChallengeProgress(challenge: { targetValue: number; currentValue: number }, durationSeconds: number): number {
  // Estimate progress based on duration (e.g., 1 point per 10 minutes)
  return Math.floor(durationSeconds / 600);
}

function calculateOfflineLimitations(): string[] {
  // Return offline limitations based on network state
  return [];
}

function calculateWagerOptions(
  wallet: { coins: number; gems: number } | null,
  streak: { currentDays: number; shieldsAvailable: number } | null,
  bossEncounter: { bountyAvailable: boolean } | null,
): Array<{
  id: string;
  cost: number;
  potentialReward: number;
  eligible: boolean;
  reasonIfIneligible?: string;
}> {
  const wagers = [];

  // Streak insurance wager
  if (streak && streak.currentDays >= 3) {
    const eligible = wallet !== null && wallet.coins >= 100;
    wagers.push({
      id: 'streak-insurance',
      cost: 100,
      potentialReward: streak.currentDays * 10,
      eligible,
      reasonIfIneligible: eligible ? undefined : 'Not enough coins',
    });
  }

  // Boss bounty wager
  if (bossEncounter?.bountyAvailable) {
    const eligible = wallet !== null && wallet.coins >= 50;
    wagers.push({
      id: 'boss-bounty',
      cost: 50,
      potentialReward: 100,
      eligible,
      reasonIfIneligible: eligible ? undefined : 'Not enough coins',
    });
  }

  return wagers;
}

export * from "./service.types";
export * from "./service.types";
export * from "./service.part1";
