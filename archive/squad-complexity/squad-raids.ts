/**
 * Squad Raids System - VEX 10/10 Transformation
 *
 * Scheduled cooperative boss battles:
 * - 3x daily time slots (morning/afternoon/evening)
 * - Synchronized session requirement
 * - Shared boss health pool
 * - Raid-exclusive rewards
 * - Failure = boss escapes
 *
 * @phase 4 - Social Dependency
 */

import { z } from 'zod';

// ============================================================================
// Raid Schedule
// ============================================================================

export const RAID_SCHEDULE = {
  MORNING: { hour: 8, minute: 0, name: 'Morning Raid', windowMinutes: 60 },
  AFTERNOON: { hour: 14, minute: 0, name: 'Afternoon Raid', windowMinutes: 60 },
  EVENING: { hour: 20, minute: 0, name: 'Evening Raid', windowMinutes: 60 },
} as const;

export type RaidTimeSlot = keyof typeof RAID_SCHEDULE;

// ============================================================================
// Raid Types
// ============================================================================

export const RaidDifficultySchema = z.enum(['NORMAL', 'HEROIC', 'MYTHIC']);
export type RaidDifficulty = z.infer<typeof RaidDifficultySchema>;

export interface RaidTemplate {
  id: string;
  name: string;
  description: string;
  difficulty: RaidDifficulty;

  // Requirements
  minSquadSize: number;
  maxSquadSize: number;
  minMasteryLevel: number;

  // Boss stats
  baseHealth: number;
  healthPerPlayer: number;
  timeLimitMinutes: number;

  // Mechanics
  mechanics: RaidMechanic[];

  // Rewards
  rewards: RaidReward[];
}

export interface RaidMechanic {
  id: string;
  name: string;
  description: string;
  triggerCondition: 'TIME' | 'HEALTH' | 'SYNERGY';
  triggerValue: number;
  playerImpact: string;
  counterStrategy: string;
}

export interface RaidReward {
  id: string;
  type: 'ITEM' | 'COINS' | 'TOKENS' | 'COSMETIC' | 'TITLE';
  itemId?: string;
  amount?: number;
  rarity: 'RARE' | 'EPIC' | 'LEGENDARY';
  guaranteed: boolean;
  dropChance?: number;
}

// ============================================================================
// Active Raid State
// ============================================================================

export interface SquadRaid {
  id: string;
  templateId: string;
  squadId: string;

  // Schedule
  scheduledFor: number;
  timeSlot: RaidTimeSlot;
  startedAt: number | null;
  endedAt: number | null;

  // Status
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'VICTORY' | 'DEFEAT' | 'CANCELLED';

  // Boss state
  bossHealth: number;
  bossMaxHealth: number;
  bossPhase: 1 | 2 | 3;

  // Participants
  participants: RaidParticipant[];
  minParticipantsRequired: number;

  // Results
  totalDamageDealt: number;
  damageLog: DamageLogEntry[];
}

export interface RaidParticipant {
  userId: string;
  displayName: string;
  avatarUrl?: string;

  // Join status
  joinedAt: number;
  isReady: boolean;
  isPresent: boolean; // Actually started session

  // Session data
  sessionId: string | null;
  sessionStartedAt: number | null;
  sessionEndedAt: number | null;

  // Performance
  damageDealt: number;
  purityScore: number;
  sessionDuration: number;
  completedSession: boolean;

  // Rewards claimed
  rewardsReceived: string[];
}

export interface DamageLogEntry {
  timestamp: number;
  userId: string;
  damage: number;
  source: 'SESSION' | 'SYNERGY' | 'CRITICAL' | 'MECHANIC';
  bossHealthAfter: number;
}

// ============================================================================
// Raid Templates
// ============================================================================

export const RAID_TEMPLATES: RaidTemplate[] = [
  {
    id: 'void_incursion',
    name: 'Void Incursion',
    description: 'A rift in reality threatens to consume your squad\'s focus. Close it together.',
    difficulty: 'NORMAL',
    minSquadSize: 3,
    maxSquadSize: 5,
    minMasteryLevel: 10,
    baseHealth: 50000,
    healthPerPlayer: 10000,
    timeLimitMinutes: 30,
    mechanics: [
      {
        id: 'void_regen',
        name: 'Void Regeneration',
        description: 'Boss regenerates if fewer than 3 squad members are active',
        triggerCondition: 'TIME',
        triggerValue: 30, // Every 30 seconds
        playerImpact: 'Requires at least 3 concurrent sessions',
        counterStrategy: 'Coordinate start times within 2 minutes',
      },
    ],
    rewards: [
      { id: 'void_essence', type: 'ITEM', itemId: 'void_essence', amount: 3, rarity: 'RARE', guaranteed: true },
      { id: 'raid_coins', type: 'COINS', amount: 1000, rarity: 'RARE', guaranteed: true },
      { id: 'void_cosmetic', type: 'COSMETIC', itemId: 'void_aura', rarity: 'EPIC', guaranteed: false, dropChance: 0.25 },
    ],
  },
  {
    id: 'titan_siege',
    name: 'Titan Siege',
    description: 'A colossal distraction titan blocks your path. All squad members must bring it down simultaneously.',
    difficulty: 'HEROIC',
    minSquadSize: 4,
    maxSquadSize: 6,
    minMasteryLevel: 20,
    baseHealth: 100000,
    healthPerPlayer: 20000,
    timeLimitMinutes: 45,
    mechanics: [
      {
        id: 'titan_shield',
        name: 'Titan Shield',
        description: 'Boss is immune unless all squad members are in Deep Work mode',
        triggerCondition: 'HEALTH',
        triggerValue: 75,
        playerImpact: 'Requires synchronized Deep Work mode',
        counterStrategy: 'All squad: Start 45-min Deep Work sessions together',
      },
      {
        id: 'titan_rage',
        name: 'Titan Rage',
        description: 'At 25% health, boss damage doubles. Finish quickly!',
        triggerCondition: 'HEALTH',
        triggerValue: 25,
        playerImpact: 'Time pressure increases dramatically',
        counterStrategy: 'Use Sprint mode for burst damage',
      },
    ],
    rewards: [
      { id: 'titan_core', type: 'ITEM', itemId: 'titan_core', rarity: 'EPIC', guaranteed: true },
      { id: 'raid_tokens', type: 'TOKENS', amount: 100, rarity: 'EPIC', guaranteed: true },
      { id: 'siege_title', type: 'TITLE', itemId: 'titan_slayer', rarity: 'LEGENDARY', guaranteed: false, dropChance: 0.1 },
    ],
  },
  {
    id: 'abyssal_convergence',
    name: 'Abyssal Convergence',
    description: 'The ultimate test of squad coordination. Face the Abyss together.',
    difficulty: 'MYTHIC',
    minSquadSize: 5,
    maxSquadSize: 8,
    minMasteryLevel: 30,
    baseHealth: 250000,
    healthPerPlayer: 30000,
    timeLimitMinutes: 60,
    mechanics: [
      {
        id: 'convergence_sync',
        name: 'Synchronization Required',
        description: 'Damage only dealt when 5+ squad members maintain 85%+ purity simultaneously',
        triggerCondition: 'SYNERGY',
        triggerValue: 5,
        playerImpact: 'Requires flawless squad coordination',
        counterStrategy: 'Assign a leader to call timing. All start within 30 seconds.',
      },
      {
        id: 'abyss_consumption',
        name: 'Abyss Consumption',
        description: 'If not defeated in 60 min, ALL squad members lose 1 day of streak',
        triggerCondition: 'TIME',
        triggerValue: 3600,
        playerImpact: 'High stakes - failure punishes everyone',
        counterStrategy: 'Bring consumables. Do not attempt unprepared.',
      },
    ],
    rewards: [
      { id: 'abyss_shard', type: 'ITEM', itemId: 'abyss_shard', rarity: 'LEGENDARY', guaranteed: true },
      { id: 'convergence_chest', type: 'ITEM', itemId: 'legendary_chest', rarity: 'LEGENDARY', guaranteed: true },
      { id: 'mythic_title', type: 'TITLE', itemId: 'abyss_walker', rarity: 'LEGENDARY', guaranteed: true },
      { id: 'exclusive_frame', type: 'COSMETIC', itemId: 'mythic_frame', rarity: 'LEGENDARY', guaranteed: true },
    ],
  },
];

// ============================================================================
// Raid Scheduling
// ============================================================================

export interface UpcomingRaid {
  timeSlot: RaidTimeSlot;
  scheduledFor: number;
  template: RaidTemplate;
  squadParticipation: number; // Number of squad members signed up
  isRegistered: boolean;
}

export function getNextRaidTimes(): Record<RaidTimeSlot, number> {
  const now = new Date();
  const result: Partial<Record<RaidTimeSlot, number>> = {};

  for (const [slot, config] of Object.entries(RAID_SCHEDULE)) {
    const nextTime = new Date(now);
    nextTime.setHours(config.hour, config.minute, 0, 0);

    if (nextTime.getTime() <= now.getTime()) {
      nextTime.setDate(nextTime.getDate() + 1);
    }

    result[slot as RaidTimeSlot] = nextTime.getTime();
  }

  return result as Record<RaidTimeSlot, number>;
}

export function canStartRaid(raid: SquadRaid): boolean {
  const presentCount = raid.participants.filter(p => p.isPresent).length;
  return presentCount >= raid.minParticipantsRequired;
}

// ============================================================================
// Damage Calculation
// ============================================================================

export function calculateRaidDamage(
  participant: RaidParticipant,
  raidDifficulty: RaidDifficulty,
  squadSynergy: number // 0-1 based on how synchronized sessions are
): number {
  if (!participant.completedSession) {
    return 0;
  }

  // Base damage from session
  let damage = participant.sessionDuration * 0.5;

  // Purity multiplier
  damage *= (0.5 + participant.purityScore / 100);

  // Difficulty multiplier
  const difficultyMultipliers: Record<RaidDifficulty, number> = {
    NORMAL: 1,
    HEROIC: 1.5,
    MYTHIC: 2,
  };
  damage *= difficultyMultipliers[raidDifficulty];

  // Squad synergy bonus (up to 50% bonus for perfect sync)
  damage *= (1 + squadSynergy * 0.5);

  return Math.floor(damage);
}

export function calculateSquadSynergy(participants: RaidParticipant[]): number {
  // Calculate how synchronized the squad's sessions are
  const activeParticipants = participants.filter(p => p.sessionStartedAt);
  if (activeParticipants.length < 2) {
    return 0;
  }

  const startTimes = activeParticipants.map(p => p.sessionStartedAt!).sort();
  const timeSpread = startTimes[startTimes.length - 1]! - startTimes[0]!;

  // Less than 2 minutes spread = perfect synergy (1.0)
  // More than 10 minutes spread = no synergy (0.0)
  const maxSpread = 10 * 60 * 1000; // 10 minutes in ms
  return Math.max(0, 1 - timeSpread / maxSpread);
}

// ============================================================================
// Raid Rewards Distribution
// ============================================================================

export interface RaidRewardDistribution {
  participantId: string;
  rewards: Array<{ rewardId: string; received: boolean }>;
  bonusXp: number;
  bonusCoins: number;
}

export function distributeRaidRewards(
  raid: SquadRaid,
  template: RaidTemplate
): RaidRewardDistribution[] {
  const presentParticipants = raid.participants.filter(p => p.isPresent);
  const totalDamage = raid.totalDamageDealt;

  return presentParticipants.map(p => {
    // Calculate damage share
    const damageShare = p.damageDealt / totalDamage;

    // Determine which rewards this participant gets
    const rewards = template.rewards.map(r => {
      if (r.guaranteed) {
        return { rewardId: r.id, received: true };
      }
      // Non-guaranteed drops based on damage share (more damage = higher chance)
      const dropChance = (r.dropChance || 0) * (0.5 + damageShare);
      return { rewardId: r.id, received: Math.random() < dropChance };
    });

    // Bonus XP based on performance
    const bonusXp = Math.floor(p.damageDealt / 100);
    const bonusCoins = Math.floor(p.damageDealt / 50);

    return {
      participantId: p.userId,
      rewards,
      bonusXp,
      bonusCoins,
    };
  });
}

// ============================================================================
// Raid Factory Functions
// ============================================================================

export function createScheduledRaid(
  templateId: string,
  squadId: string,
  timeSlot: RaidTimeSlot,
  scheduledFor: number
): SquadRaid {
  const template = RAID_TEMPLATES.find(t => t.id === templateId);
  if (!template) {
    throw new Error(`Raid template not found: ${templateId}`);
  }

  // Calculate health based on squad size (estimate)
  const estimatedSquadSize = Math.floor((template.minSquadSize + template.maxSquadSize) / 2);
  const maxHealth = template.baseHealth + template.healthPerPlayer * estimatedSquadSize;

  return {
    id: `raid_${Date.now()}_${squadId}`,
    templateId,
    squadId,
    scheduledFor,
    timeSlot,
    startedAt: null,
    endedAt: null,
    status: 'SCHEDULED',
    bossHealth: maxHealth,
    bossMaxHealth: maxHealth,
    bossPhase: 1,
    participants: [],
    minParticipantsRequired: template.minSquadSize,
    totalDamageDealt: 0,
    damageLog: [],
  };
}

export function addParticipantToRaid(
  raid: SquadRaid,
  userId: string,
  displayName: string,
  avatarUrl?: string
): SquadRaid {
  if (raid.participants.length >= RAID_TEMPLATES.find(t => t.id === raid.templateId)?.maxSquadSize!) {
    throw new Error('Raid is full');
  }

  const participant: RaidParticipant = {
    userId,
    displayName,
    avatarUrl,
    joinedAt: Date.now(),
    isReady: false,
    isPresent: false,
    sessionId: null,
    sessionStartedAt: null,
    sessionEndedAt: null,
    damageDealt: 0,
    purityScore: 0,
    sessionDuration: 0,
    completedSession: false,
    rewardsReceived: [],
  };

  return {
    ...raid,
    participants: [...raid.participants, participant],
  };
}
