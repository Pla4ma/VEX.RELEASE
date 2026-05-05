/**
 * Weekly Boss Raid System
 *
 * Phase 5: Retention Systems
 * Weekend epic boss battles requiring squad coordination
 *
 * Schedule:
 * - Spawns: Friday 6 PM
 * - Active: Friday 6 PM - Sunday 11:59 PM (54 hours)
 * - Shared health pool across all squad members
 * - Global leaderboard for damage dealt
 * - Exclusive rewards for participants
 *
 * FOMO Design:
 * - "Only 12 hours left to defeat KRAKEN!"
 * - Visual countdown in squad screen
 * - Push notifications at 24h, 6h, 1h remaining
 *
 * Dependencies:
 * - features/squads (squad membership)
 * - features/boss-realtime (combat mechanics)
 * - retention/PrimeTimeEventScheduler (scheduling)
 * - feature-flags (gradual rollout)
 */

import { z } from 'zod';
import { featureFlags } from '../../feature-flags/FeatureFlagEngine';
import { eventBus } from '../../events';
import { createDebugger } from '../../utils/debug';

const debug = createDebugger('weekly-raid-system');

// ============================================================================
// Raid Types & Schemas
// ============================================================================

export const RaidStatusSchema = z.enum(['SCHEDULED', 'ACTIVE', 'DEFEATED', 'TIMEOUT', 'PREPARING']);
export type RaidStatus = z.infer<typeof RaidStatusSchema>;

export interface WeeklyRaidBoss {
  id: string;
  name: string;
  title: string;
  description: string;
  avatarUrl: string;
  theme: 'ocean' | 'volcano' | 'forest' | 'sky' | 'shadow';

  // Stats
  baseHealth: number;
  healthScalingPerMember: number;

  // Schedule
  spawnDay: 5; // Friday
  spawnHour: 18; // 6 PM
  despawnDay: 0; // Sunday
  despawnHour: 23;
  despawnMinute: 59;

  // Rewards
  xpReward: number;
  coinReward: number;
  gemReward: number;
  exclusiveRewardId: string; // Exclusive cosmetic/item
}

export interface SquadRaidEncounter {
  id: string;
  bossId: string;
  squadId: string;

  // Health
  maxHealth: number;
  currentHealth: number;

  // Status
  status: RaidStatus;

  // Time
  spawnedAt: number;
  expiresAt: number;
  defeatedAt: number | null;

  // Participants
  memberContributions: RaidMemberContribution[];
  totalDamageDealt: number;

  // Global ranking
  globalRank: number | null;
  topSquads: TopSquadInfo[];

  createdAt: number;
}

export interface RaidMemberContribution {
  userId: string;
  displayName: string;
  avatarUrl: string | null;
  damageDealt: number;
  sessionsContributed: number;
  lastContributionAt: number;
  isMVP: boolean;
}

export interface TopSquadInfo {
  squadId: string;
  squadName: string;
  totalDamage: number;
  memberCount: number;
  rank: number;
}

export interface RaidRewards {
  xp: number;
  coins: number;
  gems: number;
  exclusiveItemId: string | null;
  participationBonus: boolean;
  mvpBonus: boolean;
}

// ============================================================================
// Raid Boss Templates
// ============================================================================

export const WEEKLY_RAID_BOSSES: WeeklyRaidBoss[] = [
  {
    id: 'kraken',
    name: 'Kraken',
    title: 'Terror of the Deep',
    description: 'An ancient sea monster awakens from the abyss. Only coordinated squads can defeat it.',
    avatarUrl: '/bosses/kraken.png',
    theme: 'ocean',
    baseHealth: 50000,
    healthScalingPerMember: 5000,
    spawnDay: 5,
    spawnHour: 18,
    despawnDay: 0,
    despawnHour: 23,
    despawnMinute: 59,
    xpReward: 1000,
    coinReward: 500,
    gemReward: 50,
    exclusiveRewardId: 'kraken_slayer_badge',
  },
  {
    id: 'phoenix',
    name: 'Phoenix',
    title: 'Inferno Reborn',
    description: 'A legendary bird of fire circles the skies. Strike it down before it burns everything.',
    avatarUrl: '/bosses/phoenix.png',
    theme: 'volcano',
    baseHealth: 60000,
    healthScalingPerMember: 6000,
    spawnDay: 5,
    spawnHour: 18,
    despawnDay: 0,
    despawnHour: 23,
    despawnMinute: 59,
    xpReward: 1200,
    coinReward: 600,
    gemReward: 60,
    exclusiveRewardId: 'phoenix_slayer_badge',
  },
  {
    id: 'behemoth',
    name: 'Behemoth',
    title: 'Mountain Walker',
    description: 'A beast older than the mountains itself. Your squad must topple this titan.',
    avatarUrl: '/bosses/behemoth.png',
    theme: 'forest',
    baseHealth: 75000,
    healthScalingPerMember: 7500,
    spawnDay: 5,
    spawnHour: 18,
    despawnDay: 0,
    despawnHour: 23,
    despawnMinute: 59,
    xpReward: 1500,
    coinReward: 750,
    gemReward: 75,
    exclusiveRewardId: 'behemoth_slayer_badge',
  },
];

// ============================================================================
// Weekly Raid Service
// ============================================================================

export class WeeklyRaidSystem {
  private activeRaids: Map<string, SquadRaidEncounter> = new Map(); // squadId_raidId -> encounter
  private checkInterval: ReturnType<typeof setInterval> | null = null;

  /**
   * Check if weekly raids are enabled
   */
  static isEnabled(): boolean {
    return featureFlags.isEnabled('weekly_boss_raids');
  }

  /**
   * Start the raid scheduler
   */
  start(): void {
    if (!WeeklyRaidSystem.isEnabled()) {
      debug.info('Disabled via feature flag');
      return;
    }

    // Check every 5 minutes
    this.checkInterval = setInterval(() => {
      this.checkRaidSchedule();
    }, 300000);

    // Initial check
    this.checkRaidSchedule();

    debug.info('Started');
  }

  /**
   * Stop the scheduler
   */
  stop(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }

  /**
   * Get or create raid encounter for a squad
   */
  getOrCreateRaid(squadId: string, memberCount: number): SquadRaidEncounter | null {
    if (!WeeklyRaidSystem.isEnabled()) return null;

    const boss = this.getCurrentWeekBoss();
    if (!boss) return null;

    const raidId = `${squadId}_${boss.id}_${this.getWeekKey()}`;
    let encounter = this.activeRaids.get(raidId);

    if (!encounter) {
      encounter = this.createRaidEncounter(boss, squadId, memberCount);
      this.activeRaids.set(raidId, encounter);
    }

    return encounter;
  }

  /**
   * Contribute damage to the raid
   */
  contributeDamage(
    squadId: string,
    userId: string,
    userName: string,
    avatarUrl: string | null,
    damage: number
  ): {
    success: boolean;
    damageApplied: number;
    isMVP: boolean;
    bossDefeated: boolean;
    timeRemaining: number;
  } {
    const encounter = this.getOrCreateRaid(squadId, 0);
    if (!encounter || encounter.status !== 'ACTIVE') {
      return {
        success: false,
        damageApplied: 0,
        isMVP: false,
        bossDefeated: false,
        timeRemaining: 0,
      };
    }

    // Apply damage
    encounter.currentHealth = Math.max(0, encounter.currentHealth - damage);
    encounter.totalDamageDealt += damage;

    // Update or create member contribution
    let contribution = encounter.memberContributions.find(c => c.userId === userId);
    if (!contribution) {
      contribution = {
        userId,
        displayName: userName,
        avatarUrl,
        damageDealt: 0,
        sessionsContributed: 0,
        lastContributionAt: Date.now(),
        isMVP: false,
      };
      encounter.memberContributions.push(contribution);
    }

    contribution.damageDealt += damage;
    contribution.sessionsContributed++;
    contribution.lastContributionAt = Date.now();

    // Recalculate MVP
    this.recalculateMVP(encounter);

    // Check for defeat
    const bossDefeated = encounter.currentHealth <= 0;
    if (bossDefeated && encounter.status !== 'DEFEATED') {
      this.defeatBoss(encounter);
    }

    // Emit contribution event
    eventBus.publish('raid:damage_contributed', {
      squadId,
      userId,
      damage,
      totalDamage: encounter.totalDamageDealt,
      healthRemaining: encounter.currentHealth,
    });

    return {
      success: true,
      damageApplied: damage,
      isMVP: contribution.isMVP,
      bossDefeated,
      timeRemaining: encounter.expiresAt - Date.now(),
    };
  }

  /**
   * Get raid status for a squad
   */
  getRaidStatus(squadId: string): {
    hasActiveRaid: boolean;
    encounter: SquadRaidEncounter | null;
    timeRemaining: number;
    healthPercent: number;
    userContribution: RaidMemberContribution | null;
    globalRank: number | null;
  } {
    const encounter = this.getOrCreateRaid(squadId, 0);

    if (!encounter) {
      return {
        hasActiveRaid: false,
        encounter: null,
        timeRemaining: 0,
        healthPercent: 0,
        userContribution: null,
        globalRank: null,
      };
    }

    const now = Date.now();
    const timeRemaining = Math.max(0, encounter.expiresAt - now);
    const healthPercent = (encounter.currentHealth / encounter.maxHealth) * 100;

    return {
      hasActiveRaid: encounter.status === 'ACTIVE',
      encounter,
      timeRemaining,
      healthPercent,
      userContribution: null, // Would be populated with actual user data
      globalRank: encounter.globalRank,
    };
  }

  /**
   * Get FOMO countdown message
   */
  getFOMOMessage(squadId: string): string | null {
    const status = this.getRaidStatus(squadId);
    if (!status.hasActiveRaid) return null;

    const hoursRemaining = Math.floor(status.timeRemaining / (1000 * 60 * 60));

    if (hoursRemaining <= 1) {
      const minutesRemaining = Math.floor(status.timeRemaining / (1000 * 60));
      return `⚠️ Only ${minutesRemaining} minutes left to defeat the boss!`;
    }

    if (hoursRemaining <= 6) {
      return `⏰ ${hoursRemaining} hours remaining! Don't let the boss escape!`;
    }

    if (hoursRemaining <= 24) {
      return `${hoursRemaining} hours left to claim victory!`;
    }

    return null;
  }

  /**
   * Claim raid rewards
   */
  claimRewards(squadId: string, userId: string): RaidRewards | null {
    const encounter = this.getOrCreateRaid(squadId, 0);
    if (!encounter || encounter.status !== 'DEFEATED') return null;

    const boss = WEEKLY_RAID_BOSSES.find(b => b.id === encounter.bossId);
    if (!boss) return null;

    const contribution = encounter.memberContributions.find(c => c.userId === userId);
    if (!contribution) return null;

    const isMVP = contribution.isMVP;
    const participationBonus = contribution.damageDealt > 1000;

    return {
      xp: boss.xpReward * (isMVP ? 2 : 1),
      coins: boss.coinReward * (isMVP ? 2 : 1),
      gems: boss.gemReward * (isMVP ? 2 : 1),
      exclusiveItemId: participationBonus ? boss.exclusiveRewardId : null,
      participationBonus,
      mvpBonus: isMVP,
    };
  }

  // ============================================================================
  // Private Methods
  // ============================================================================

  private checkRaidSchedule(): void {
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0 = Sunday, 5 = Friday
    const hour = now.getHours();

    // Spawn raids on Friday at 6 PM
    const shouldSpawn = dayOfWeek === 5 && hour >= 18;
    const shouldDespawn = dayOfWeek === 0 && hour >= 23;

    // Update all active raids
    for (const [key, encounter] of this.activeRaids) {
      if (encounter.status === 'SCHEDULED' && shouldSpawn) {
        this.activateRaid(encounter);
      }

      if (encounter.status === 'ACTIVE' && shouldDespawn) {
        this.timeoutRaid(encounter);
      }

      // Send FOMO notifications
      this.sendFOMONotifications(encounter);
    }
  }

  private getCurrentWeekBoss(): WeeklyRaidBoss | null {
    // Rotate through bosses weekly
    const weekNumber = this.getWeekNumber();
    const index = weekNumber % WEEKLY_RAID_BOSSES.length;
    return WEEKLY_RAID_BOSSES[index];
  }

  private createRaidEncounter(boss: WeeklyRaidBoss, squadId: string, memberCount: number): SquadRaidEncounter {
    const now = new Date();

    // Calculate health based on squad size
    const maxHealth = boss.baseHealth + (boss.healthScalingPerMember * Math.max(1, memberCount));

    // Calculate spawn/despawn times
    const spawnedAt = new Date();
    spawnedAt.setHours(boss.spawnHour, 0, 0, 0);

    const expiresAt = new Date();
    // Set to next Sunday if we're past Friday
    if (now.getDay() > 5) {
      expiresAt.setDate(expiresAt.getDate() + (7 - now.getDay()));
    }
    expiresAt.setHours(boss.despawnHour, boss.despawnMinute, 0, 0);

    return {
      id: `${squadId}_${boss.id}_${this.getWeekKey()}`,
      bossId: boss.id,
      squadId,
      maxHealth,
      currentHealth: maxHealth,
      status: 'SCHEDULED',
      spawnedAt: spawnedAt.getTime(),
      expiresAt: expiresAt.getTime(),
      defeatedAt: null,
      memberContributions: [],
      totalDamageDealt: 0,
      globalRank: null,
      topSquads: [],
      createdAt: Date.now(),
    };
  }

  private activateRaid(encounter: SquadRaidEncounter): void {
    encounter.status = 'ACTIVE';

    eventBus.publish('raid:activated', {
      squadId: encounter.squadId,
      bossId: encounter.bossId,
      maxHealth: encounter.maxHealth,
      expiresAt: encounter.expiresAt,
    });

    // Send activation notification to all squad members
    eventBus.publish('notification:send_squad', {
      squadId: encounter.squadId,
      title: 'Weekly Raid is LIVE!',
      body: 'The boss has appeared! Coordinate with your squad to defeat it!',
      data: { type: 'RAID_ACTIVATED', encounterId: encounter.id },
    });
  }

  private defeatBoss(encounter: SquadRaidEncounter): void {
    encounter.status = 'DEFEATED';
    encounter.defeatedAt = Date.now();

    const boss = WEEKLY_RAID_BOSSES.find(b => b.id === encounter.bossId);

    eventBus.publish('raid:defeated', {
      squadId: encounter.squadId,
      bossId: encounter.bossId,
      totalDamage: encounter.totalDamageDealt,
      mvpUserId: encounter.memberContributions.find(c => c.isMVP)?.userId,
    });

    // Send victory notification
    eventBus.publish('notification:send_squad', {
      squadId: encounter.squadId,
      title: 'BOSS DEFEATED! 🎉',
      body: `Your squad defeated ${boss?.name}! Claim your rewards now!`,
      data: { type: 'RAID_DEFEATED', encounterId: encounter.id },
    });
  }

  private timeoutRaid(encounter: SquadRaidEncounter): void {
    if (encounter.status === 'DEFEATED') return;

    encounter.status = 'TIMEOUT';

    eventBus.publish('raid:timeout', {
      squadId: encounter.squadId,
      bossId: encounter.bossId,
      healthRemaining: encounter.currentHealth,
      healthPercent: (encounter.currentHealth / encounter.maxHealth) * 100,
    });

    // Send timeout notification
    eventBus.publish('notification:send_squad', {
      squadId: encounter.squadId,
      title: 'Raid Ended',
      body: 'The boss escaped this week. Try again next weekend!',
      data: { type: 'RAID_TIMEOUT', encounterId: encounter.id },
    });
  }

  private recalculateMVP(encounter: SquadRaidEncounter): void {
    // Reset all MVP flags
    encounter.memberContributions.forEach(c => c.isMVP = false);

    // Find top contributor
    const top = encounter.memberContributions.reduce((max, current) =>
      current.damageDealt > max.damageDealt ? current : max,
      encounter.memberContributions[0]
    );

    if (top) {
      top.isMVP = true;
    }
  }

  private sendFOMONotifications(encounter: SquadRaidEncounter): void {
    if (encounter.status !== 'ACTIVE') return;

    const timeRemaining = encounter.expiresAt - Date.now();
    const hoursRemaining = Math.floor(timeRemaining / (1000 * 60 * 60));

    // Send at 24h, 6h, and 1h remaining
    const notificationHours = [24, 6, 1];
    const lastWindow = Math.floor((timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (notificationHours.includes(lastWindow)) {
      const boss = WEEKLY_RAID_BOSSES.find(b => b.id === encounter.bossId);
      const healthPercent = Math.floor((encounter.currentHealth / encounter.maxHealth) * 100);

      eventBus.publish('notification:send_squad', {
        squadId: encounter.squadId,
        title: `${hoursRemaining}h Left to Defeat ${boss?.name}!`,
        body: `Boss at ${healthPercent}% health. Your squad needs you!`,
        data: { type: 'RAID_FOMO', encounterId: encounter.id, hoursRemaining },
      });
    }
  }

  private getWeekKey(): string {
    const now = new Date();
    const year = now.getFullYear();
    const week = this.getWeekNumber();
    return `${year}-W${week}`;
  }

  private getWeekNumber(): number {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 1);
    const diff = now.getTime() - start.getTime();
    const oneWeek = 1000 * 60 * 60 * 24 * 7;
    return Math.floor(diff / oneWeek) + 1;
  }
}

// ============================================================================
// Factory & Singleton
// ============================================================================

let raidSystem: WeeklyRaidSystem | null = null;

export function getWeeklyRaidSystem(): WeeklyRaidSystem {
  if (!raidSystem) {
    raidSystem = new WeeklyRaidSystem();
  }
  return raidSystem;
}
