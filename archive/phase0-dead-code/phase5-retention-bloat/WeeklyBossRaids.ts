/**
 * Weekly Boss Raids
 *
 * Phase 5C: Retention - Weekend epic boss raids for squad collaboration
 *
 * Creates large-scale weekend events where squads collaborate to defeat
 * powerful bosses. Features include:
 *
 * - Weekend-long boss encounters (Friday-Sunday)
 * - Squad collaboration and coordination
 * - Progressive boss phases and mechanics
 * - Epic rewards and bragging rights
 * - Leaderboards and achievements
 *
 * Dependencies:
 * - feature-flags (gradual rollout)
 * - events (eventBus for raid updates)
 * - squads (squad participation and coordination)
 * - boss (boss mechanics and health systems)
 * - economy (raid rewards and loot)
 */

import { z } from 'zod';
import { featureFlags } from '../../feature-flags/FeatureFlagEngine';
import { eventBus } from '../../events';

// ============================================================================
// Weekly Boss Raid Constants
// ============================================================================

export const BOSS_RAID_CONFIG = {
  // Raid schedule
  RAID_SCHEDULE: {
    START_DAY: 'friday',
    START_TIME: { hour: 18, minute: 0 }, // 6 PM Friday
    END_DAY: 'sunday',
    END_TIME: { hour: 22, minute: 0 }, // 10 PM Sunday
    TIMEZONE: 'local',
  },

  // Boss types with rotating themes
  BOSS_TYPES: {
    PROCRASTINATION_BEHEMOTH: {
      name: 'Procrastination Behemoth',
      description: 'A massive creature that feeds on delayed tasks',
      difficulty: 'medium',
      health: 100000,
      phases: 3,
      mechanics: ['time_pressure', 'distraction_waves', 'deadline_rush'],
      weaknesses: ['consistency', 'early_completion'],
      rewards: {
        completion: { focusPoints: 500, coins: 1000, gems: 50 },
        top_10: { focusPoints: 1000, coins: 2000, gems: 100 },
        first_place: { focusPoints: 2000, coins: 5000, gems: 250 },
      },
    },
    DISTRACTION_DRAGON: {
      name: 'Distraction Dragon',
      description: 'A winged beast that creates chaos and noise',
      difficulty: 'hard',
      health: 150000,
      phases: 4,
      mechanics: ['noise_barrage', 'social_media_storm', 'notification_swarm'],
      weaknesses: ['deep_focus', 'digital_detox'],
      rewards: {
        completion: { focusPoints: 750, coins: 1500, gems: 75 },
        top_10: { focusPoints: 1500, coins: 3000, gems: 150 },
        first_place: { focusPoints: 3000, coins: 7500, gems: 375 },
      },
    },
    ANXIETY_ABOMINATION: {
      name: 'Anxiety Abomination',
      description: 'A shadowy entity that thrives on stress and worry',
      difficulty: 'extreme',
      health: 200000,
      phases: 5,
      mechanics: ['stress_avalanche', 'panic_attacks', 'overwhelm_field'],
      weaknesses: ['mindfulness', 'breathing_techniques', 'break_strategy'],
      rewards: {
        completion: { focusPoints: 1000, coins: 2000, gems: 100 },
        top_10: { focusPoints: 2000, coins: 4000, gems: 200 },
        first_place: { focusPoints: 4000, coins: 10000, gems: 500 },
      },
    },
  },

  // Participation requirements
  MIN_SQUAD_SIZE: 3,
  MIN_SESSION_DURATION: 20, // minutes
  MIN_PARTICIPATION_RATE: 0.6, // 60% of squad must participate

  // Damage calculations
  BASE_DAMAGE_PER_MINUTE: 10,
  PURITY_DAMAGE_MULTIPLIER: 2.0, // High purity = double damage
  SQUAD_BONUS_MULTIPLIER: 1.5, // Squad sessions = 1.5x damage
  STREAK_DAMAGE_MULTIPLIER: 1.2, // Active streak = 1.2x damage

  // Phase mechanics
  PHASE_THRESHOLDS: [0.75, 0.5, 0.25, 0.1], // HP percentages for phase changes
  MECHANIC_INTENSITY: [1.0, 1.5, 2.0, 2.5, 3.0], // Difficulty scaling

  // Rewards and loot
  PARTICIPATION_THRESHOLD: 1000, // Minimum damage for participation rewards
  CONTRIBUTION_TIERS: [
    { name: 'Bronze Contributor', threshold: 1000, multiplier: 1.0 },
    { name: 'Silver Contributor', threshold: 5000, multiplier: 1.5 },
    { name: 'Gold Contributor', threshold: 15000, multiplier: 2.0 },
    { name: 'Platinum Contributor', threshold: 30000, multiplier: 3.0 },
  ],
} as const;

// ============================================================================
// Types & Schemas
// ============================================================================

export const BossTypeSchema = z.enum([
  'PROCRASTINATION_BEHEMOTH',
  'DISTRACTION_DRAGON', 
  'ANXIETY_ABOMINATION',
]);

export const RaidPhaseSchema = z.enum(['phase_1', 'phase_2', 'phase_3', 'phase_4', 'phase_5']);

export const WeeklyBossRaidSchema = z.object({
  id: z.string(),
  weekStart: z.string(), // ISO week string
  bossType: BossTypeSchema,
  
  // Schedule
  startTime: z.number(),
  endTime: z.number(),
  timezone: z.string(),
  
  // Status
  status: z.enum(['upcoming', 'active', 'completed', 'failed']).default('upcoming'),
  
  // Boss state
  bossHealth: z.number(),
  maxBossHealth: z.number(),
  currentPhase: RaidPhaseSchema.default('phase_1'),
  phaseHealthThresholds: z.array(z.number()),
  
  // Participation
  participatingSquads: z.array(z.string()).default([]),
  totalDamageDealt: z.number().default(0),
  totalParticipants: z.number().default(0),
  
  // Progress tracking
  damageBySquad: z.record(z.number()).default({}), // squadId -> damage
  damageByUser: z.record(z.number()).default({}), // userId -> damage
  sessionsContributed: z.number().default(0),
  totalFocusTime: z.number().default(0), // minutes
  
  // Results
  defeated: z.boolean().default(false),
  defeatTime: z.number().nullable().default(null),
  finalPhase: RaidPhaseSchema.nullable().default(null),
  
  // Rewards
  rewardsDistributed: z.boolean().default(false),
  leaderboard: z.array(z.object({
    rank: z.number(),
    squadId: z.string(),
    damage: z.number(),
    participants: z.number(),
    contributionTier: z.string(),
    rewards: z.record(z.number()),
  })).default([]),
  
  // Metadata
  createdAt: z.number(),
  updatedAt: z.number(),
});

export const RaidParticipationSchema = z.object({
  id: z.string(),
  raidId: z.string(),
  squadId: z.string(),
  userId: z.string(),
  
  // Participation details
  joinedAt: z.number(),
  sessionsContributed: z.number().default(0),
  totalDamage: z.number().default(0),
  totalFocusTime: z.number().default(0), // minutes
  averagePurity: z.number().default(0),
  
  // Performance
  bestSessionDamage: z.number().default(0),
  longestSession: z.number().default(0), // minutes
  highestPurity: z.number().default(0),
  
  // Status
  status: z.enum(['active', 'completed', 'dropped_out']).default('active'),
  lastActivityAt: z.number(),
  
  // Rewards
  contributionTier: z.string().nullable().default(null),
  rewardsEarned: z.record(z.number()).default({}),
  
  createdAt: z.number(),
  updatedAt: z.number(),
});

export type BossType = z.infer<typeof BossTypeSchema>;
export type RaidPhase = z.infer<typeof RaidPhaseSchema>;
export type WeeklyBossRaid = z.infer<typeof WeeklyBossRaidSchema>;
export type RaidParticipation = z.infer<typeof RaidParticipationSchema>;

export interface RaidSession {
  userId: string;
  squadId: string;
  raidId: string;
  sessionId: string;
  startTime: number;
  endTime: number;
  duration: number; // minutes
  purity: number;
  damage: number;
  phase: RaidPhase;
  mechanics: string[];
}

export interface RaidLeaderboard {
  raid: WeeklyBossRaid;
  squadRankings: Array<{
    rank: number;
    squadId: string;
    damage: number;
    damagePercent: number;
    participants: number;
    contributionTier: string;
    rewards: Record<string, number>;
  }>;
  userRanking?: {
    rank: number;
    squadId: string;
    damage: number;
    contributionTier: string;
    rewards: Record<string, number>;
  };
}

// ============================================================================
// Weekly Boss Raids Service
// ============================================================================

export class WeeklyBossRaidsService {
  private raids: Map<string, WeeklyBossRaid> = new Map(); // weekStart -> raid
  private participations: Map<string, RaidParticipation> = new Map(); // raidId_squadId_userId
  private sessions: Map<string, RaidSession> = new Map(); // sessionId -> session

  /**
   * Check if weekly boss raids are enabled
   */
  static isEnabled(): boolean {
    return featureFlags.isEnabled('weekly_boss_raids');
  }

  /**
   * Initialize the service and schedule raids
   */
  async initialize(): Promise<void> {
    if (!WeeklyBossRaidsService.isEnabled()) {
      return;
    }

    // Create current week's raid if needed
    await this.ensureCurrentWeekRaid();
    
    // Set up monitoring loop
    this.startRaidMonitoringLoop();
  }

  /**
   * Get current or upcoming raid
   */
  getCurrentRaid(): WeeklyBossRaid | null {
    const now = Date.now();
    
    for (const raid of this.raids.values()) {
      if (now >= raid.startTime && now <= raid.endTime) {
        return raid;
      }
    }
    
    // Return upcoming raid if no active raid
    for (const raid of this.raids.values()) {
      if (raid.status === 'upcoming' && raid.startTime > now) {
        return raid;
      }
    }
    
    return null;
  }

  /**
   * Join a raid with squad
   */
  async joinRaid(raidId: string, squadId: string, userId: string): Promise<{
    success: boolean;
    error?: string;
  }> {
    const raid = this.raids.get(raidId);
    if (!raid) {
      return { success: false, error: 'Raid not found' };
    }

    const now = Date.now();

    // Check if raid is active
    if (raid.status !== 'active' || now < raid.startTime || now > raid.endTime) {
      return { success: false, error: 'Raid is not currently active' };
    }

    // Check if squad is already participating
    if (raid.participatingSquads.includes(squadId)) {
      // Check if user is already participating
      const participationKey = `${raidId}_${squadId}_${userId}`;
      if (this.participations.has(participationKey)) {
        return { success: false, error: 'Already participating in this raid' };
      }
    } else {
      // Add squad to participating squads
      raid.participatingSquads.push(squadId);
      this.raids.set(raidId, raid);
    }

    // Create participation record
    const participation: RaidParticipation = {
      id: `raid_part_${raidId}_${squadId}_${userId}_${now}`,
      raidId,
      squadId,
      userId,
      joinedAt: now,
      sessionsContributed: 0,
      totalDamage: 0,
      totalFocusTime: 0,
      averagePurity: 0,
      bestSessionDamage: 0,
      longestSession: 0,
      highestPurity: 0,
      status: 'active',
      lastActivityAt: now,
      contributionTier: null,
      rewardsEarned: {},
      createdAt: now,
      updatedAt: now,
    };

    this.participations.set(`${raidId}_${squadId}_${userId}`, participation);

    // Update raid stats
    raid.totalParticipants += 1;
    this.raids.set(raidId, raid);

    // Emit event
    eventBus.publish('raid:joined', {
      raidId,
      squadId,
      userId,
      bossType: raid.bossType,
    });

    return { success: true };
  }

  /**
   * Contribute to raid through a focus session
   */
  async contributeToRaid(sessionData: {
    raidId: string;
    squadId: string;
    userId: string;
    sessionId: string;
    duration: number; // minutes
    purity: number;
    isSquadSession: boolean;
  }): Promise<{
    success: boolean;
    damage?: number;
    phase?: RaidPhase;
    mechanics?: string[];
    error?: string;
  }> {
    const raid = this.raids.get(sessionData.raidId);
    if (!raid) {
      return { success: false, error: 'Raid not found' };
    }

    const now = Date.now();

    // Check if raid is active
    if (raid.status !== 'active' || now > raid.endTime) {
      return { success: false, error: 'Raid is not active' };
    }

    // Check minimum session duration
    if (sessionData.duration < BOSS_RAID_CONFIG.MIN_SESSION_DURATION) {
      return { success: false, error: 'Session too short for raid contribution' };
    }

    // Get participation record
    const participationKey = `${sessionData.raidId}_${sessionData.squadId}_${sessionData.userId}`;
    const participation = this.participations.get(participationKey);
    
    if (!participation || participation.status !== 'active') {
      return { success: false, error: 'Not participating in this raid' };
    }

    // Calculate damage
    const damage = this.calculateSessionDamage(sessionData, raid);
    
    // Determine current phase and mechanics
    const currentPhase = this.getCurrentPhase(raid);
    const mechanics = this.getActiveMechanics(raid, currentPhase);

    // Create raid session
    const raidSession: RaidSession = {
      userId: sessionData.userId,
      squadId: sessionData.squadId,
      raidId: sessionData.raidId,
      sessionId: sessionData.sessionId,
      startTime: now - (sessionData.duration * 60 * 1000),
      endTime: now,
      duration: sessionData.duration,
      purity: sessionData.purity,
      damage,
      phase: currentPhase,
      mechanics,
    };

    this.sessions.set(sessionData.sessionId, raidSession);

    // Update participation
    participation.sessionsContributed += 1;
    participation.totalDamage += damage;
    participation.totalFocusTime += sessionData.duration;
    participation.averagePurity = ((participation.averagePurity * (participation.sessionsContributed - 1)) + sessionData.purity) / participation.sessionsContributed;
    participation.bestSessionDamage = Math.max(participation.bestSessionDamage, damage);
    participation.longestSession = Math.max(participation.longestSession, sessionData.duration);
    participation.highestPurity = Math.max(participation.highestPurity, sessionData.purity);
    participation.lastActivityAt = now;
    participation.updatedAt = now;

    this.participations.set(participationKey, participation);

    // Update raid
    raid.damageByUser[sessionData.userId] = (raid.damageByUser[sessionData.userId] || 0) + damage;
    raid.damageBySquad[sessionData.squadId] = (raid.damageBySquad[sessionData.squadId] || 0) + damage;
    raid.totalDamageDealt += damage;
    raid.sessionsContributed += 1;
    raid.totalFocusTime += sessionData.duration;

    // Check for phase change
    const previousPhase = raid.currentPhase;
    raid.currentPhase = currentPhase;
    
    // Check for raid completion
    if (raid.totalDamageDealt >= raid.maxBossHealth && !raid.defeated) {
      await this.completeRaid(raid);
    }

    this.raids.set(sessionData.raidId, raid);

    // Emit events
    eventBus.publish('raid:session_completed', {
      raidId: sessionData.raidId,
      squadId: sessionData.squadId,
      userId: sessionData.userId,
      damage,
      phase: currentPhase,
      mechanics,
      totalRaidDamage: raid.totalDamageDealt,
      bossHealthRemaining: Math.max(0, raid.maxBossHealth - raid.totalDamageDealt),
    });

    if (previousPhase !== currentPhase) {
      eventBus.publish('raid:phase_changed', {
        raidId: sessionData.raidId,
        newPhase: currentPhase,
        previousPhase,
        mechanics,
      });
    }

    return {
      success: true,
      damage,
      phase: currentPhase,
      mechanics,
    };
  }

  /**
   * Get raid leaderboard
   */
  getRaidLeaderboard(raidId: string, userId?: string): RaidLeaderboard | null {
    const raid = this.raids.get(raidId);
    if (!raid) return null;

    // Calculate squad rankings
    const squadRankings = Object.entries(raid.damageBySquad)
      .map(([squadId, damage]) => {
        const damagePercent = (damage / raid.maxBossHealth) * 100;
        const contributionTier = this.getContributionTier(damage);
        const rewards = this.calculateSquadRewards(damage, contributionTier, raid.defeated);

        return {
          rank: 0, // Will be set after sorting
          squadId,
          damage,
          damagePercent,
          participants: this.getSquadParticipantCount(raidId, squadId),
          contributionTier,
          rewards,
        };
      })
      .sort((a, b) => b.damage - a.damage)
      .map((item, index) => ({ ...item, rank: index + 1 }));

    // Find user's ranking
    let userRanking;
    if (userId) {
      const userParticipation = Array.from(this.participations.values())
        .find(p => p.raidId === raidId && p.userId === userId);
      
      if (userParticipation) {
        const squadRanking = squadRankings.find(r => r.squadId === userParticipation.squadId);
        if (squadRanking) {
          userRanking = {
            rank: squadRanking.rank,
            squadId: squadRanking.squadId,
            damage: userParticipation.totalDamage,
            contributionTier: userParticipation.contributionTier || 'Bronze Contributor',
            rewards: userParticipation.rewardsEarned,
          };
        }
      }
    }

    return {
      raid,
      squadRankings,
      userRanking,
    };
  }

  /**
   * Get user's raid history
   */
  getUserRaidHistory(userId: string, limit = 20): Array<{
    raid: WeeklyBossRaid;
    participation: RaidParticipation;
    squadRanking?: { rank: number; damage: number; tier: string };
  }> {
    const history: Array<{
      raid: WeeklyBossRaid;
      participation: RaidParticipation;
      squadRanking?: { rank: number; damage: number; tier: string };
    }> = [];

    this.participations.forEach((participation) => {
      if (participation.userId === userId) {
        const raid = this.raids.get(participation.raidId);
        if (raid) {
          const squadRanking = this.getSquadRanking(raid.id, participation.squadId);
          history.push({ raid, participation, squadRanking });
        }
      }
    });

    return history
      .sort((a, b) => b.participation.createdAt - a.participation.createdAt)
      .slice(0, limit);
  }

  // ============================================================================
  // Private Helper Methods
  // ============================================================================

  /**
   * Ensure current week has a raid
   */
  private async ensureCurrentWeekRaid(): Promise<void> {
    const now = new Date();
    const weekStart = this.getWeekStart(now);
    const weekKey = weekStart.toISOString().split('T')[0]; // YYYY-MM-DD format

    if (!this.raids.has(weekKey)) {
      await this.createWeeklyRaid(weekKey, weekStart);
    }
  }

  /**
   * Create a new weekly raid
   */
  private async createWeeklyRaid(weekKey: string, weekStart: Date): Promise<void> {
    // Rotate boss types
    const bossTypes: BossType[] = ['PROCRASTINATION_BEHEMOTH', 'DISTRACTION_DRAGON', 'ANXIETY_ABOMINATION'];
    const weekNumber = Math.floor(weekStart.getTime() / (7 * 24 * 60 * 60 * 1000));
    const bossType = bossTypes[weekNumber % bossTypes.length];

    const bossConfig = BOSS_RAID_CONFIG.BOSS_TYPES[bossType];
    const schedule = BOSS_RAID_CONFIG.RAID_SCHEDULE;

    // Calculate raid timing
    const startTime = new Date(weekStart);
    const startDayIndex = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'].indexOf(schedule.START_DAY);
    startTime.setDate(startTime.getDate() + (startDayIndex - startTime.getDay() + 7) % 7);
    startTime.setHours(schedule.START_TIME.hour, schedule.START_TIME.minute, 0, 0);

    const endTime = new Date(startTime);
    const endDayIndex = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'].indexOf(schedule.END_DAY);
    endTime.setDate(endTime.getDate() + (endDayIndex - endTime.getDay() + 7) % 7);
    endTime.setHours(schedule.END_TIME.hour, schedule.END_TIME.minute, 0, 0);

    const raid: WeeklyBossRaid = {
      id: `raid_${weekKey}`,
      weekStart: weekKey,
      bossType,
      startTime: startTime.getTime(),
      endTime: endTime.getTime(),
      timezone: schedule.TIMEZONE,
      status: 'upcoming',
      bossHealth: bossConfig.health,
      maxBossHealth: bossConfig.health,
      currentPhase: 'phase_1',
      phaseHealthThresholds: BOSS_RAID_CONFIG.PHASE_THRESHOLDS.map(threshold => bossConfig.health * threshold),
      participatingSquads: [],
      totalDamageDealt: 0,
      totalParticipants: 0,
      damageBySquad: {},
      damageByUser: {},
      sessionsContributed: 0,
      totalFocusTime: 0,
      defeated: false,
      defeatTime: null,
      finalPhase: null,
      rewardsDistributed: false,
      leaderboard: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    this.raids.set(weekKey, raid);

    // Emit event
    eventBus.publish('raid:created', {
      raidId: raid.id,
      weekStart: weekKey,
      bossType,
      startTime: raid.startTime,
      endTime: raid.endTime,
    });
  }

  /**
   * Start raid monitoring loop
   */
  private startRaidMonitoringLoop(): void {
    // Check every minute for raid status changes
    setInterval(() => {
      this.checkRaidStatuses();
    }, 60 * 1000);
  }

  /**
   * Check and update raid statuses
   */
  private checkRaidStatuses(): void {
    const now = Date.now();

    this.raids.forEach((raid) => {
      // Start raid if time has come
      if (raid.status === 'upcoming' && now >= raid.startTime && now <= raid.endTime) {
        raid.status = 'active';
        this.raids.set(raid.id, raid);

        eventBus.publish('raid:started', {
          raidId: raid.id,
          bossType: raid.bossType,
          endTime: raid.endTime,
        });
      }

      // End raid if time has passed
      if (raid.status === 'active' && now > raid.endTime && !raid.defeated) {
        this.endRaid(raid);
      }
    });

    // Ensure next week's raid exists
    this.ensureCurrentWeekRaid();
  }

  /**
   * Calculate session damage
   */
  private calculateSessionDamage(sessionData: any, raid: WeeklyBossRaid): number {
    let damage = sessionData.duration * BOSS_RAID_CONFIG.BASE_DAMAGE_PER_MINUTE;

    // Purity multiplier
    if (sessionData.purity >= 90) {
      damage *= BOSS_RAID_CONFIG.PURITY_DAMAGE_MULTIPLIER;
    } else if (sessionData.purity >= 75) {
      damage *= 1.5;
    }

    // Squad session bonus
    if (sessionData.isSquadSession) {
      damage *= BOSS_RAID_CONFIG.SQUAD_BONUS_MULTIPLIER;
    }

    // Phase difficulty modifier
    const phaseIntensity = BOSS_RAID_CONFIG.MECHANIC_INTENSITY[this.getPhaseIndex(raid.currentPhase)];
    damage *= phaseIntensity;

    return Math.round(damage);
  }

  /**
   * Get current raid phase based on health
   */
  private getCurrentPhase(raid: WeeklyBossRaid): RaidPhase {
    const healthPercent = (raid.bossHealth - raid.totalDamageDealt) / raid.bossHealth;
    
    if (healthPercent <= BOSS_RAID_CONFIG.PHASE_THRESHOLDS[3]) return 'phase_5';
    if (healthPercent <= BOSS_RAID_CONFIG.PHASE_THRESHOLDS[2]) return 'phase_4';
    if (healthPercent <= BOSS_RAID_CONFIG.PHASE_THRESHOLDS[1]) return 'phase_3';
    if (healthPercent <= BOSS_RAID_CONFIG.PHASE_THRESHOLDS[0]) return 'phase_2';
    return 'phase_1';
  }

  /**
   * Get phase index for intensity calculation
   */
  private getPhaseIndex(phase: RaidPhase): number {
    const phases: RaidPhase[] = ['phase_1', 'phase_2', 'phase_3', 'phase_4', 'phase_5'];
    return phases.indexOf(phase);
  }

  /**
   * Get active mechanics for current phase
   */
  private getActiveMechanics(raid: WeeklyBossRaid, phase: RaidPhase): string[] {
    const bossConfig = BOSS_RAID_CONFIG.BOSS_TYPES[raid.bossType];
    const phaseIndex = this.getPhaseIndex(phase);
    
    // Return mechanics up to current phase
    return bossConfig.mechanics.slice(0, phaseIndex + 1);
  }

  /**
   * Complete raid successfully
   */
  private async completeRaid(raid: WeeklyBossRaid): Promise<void> {
    raid.defeated = true;
    raid.defeatTime = Date.now();
    raid.finalPhase = raid.currentPhase;
    raid.status = 'completed';

    // Calculate and distribute rewards
    await this.distributeRewards(raid);

    // Generate leaderboard
    this.generateLeaderboard(raid);

    this.raids.set(raid.id, raid);

    eventBus.publish('raid:defeated', {
      raidId: raid.id,
      bossType: raid.bossType,
      defeatTime: raid.defeatTime,
      totalDamage: raid.totalDamageDealt,
      participants: raid.totalParticipants,
    });
  }

  /**
   * End raid (time expired)
   */
  private endRaid(raid: WeeklyBossRaid): void {
    raid.status = raid.defeated ? 'completed' : 'failed';
    
    if (!raid.defeated) {
      // Partial rewards for participation
      this.distributePartialRewards(raid);
    }

    this.generateLeaderboard(raid);
    this.raids.set(raid.id, raid);

    eventBus.publish('raid:ended', {
      raidId: raid.id,
      bossType: raid.bossType,
      defeated: raid.defeated,
      totalDamage: raid.totalDamageDealt,
    });
  }

  /**
   * Get contribution tier based on damage
   */
  private getContributionTier(damage: number): string {
    for (const tier of [...BOSS_RAID_CONFIG.CONTRIBUTION_TIERS].reverse()) {
      if (damage >= tier.threshold) {
        return tier.name;
      }
    }
    return 'Bronze Contributor';
  }

  /**
   * Calculate squad rewards
   */
  private calculateSquadRewards(damage: number, tier: string, defeated: boolean): Record<string, number> {
    const bossConfig = BOSS_RAID_CONFIG.BOSS_TYPES[this.getCurrentRaid()?.bossType || 'PROCRASTINATION_BEHEMOTH'];
    const tierConfig = BOSS_RAID_CONFIG.CONTRIBUTION_TIERS.find(t => t.name === tier);
    
    if (!tierConfig) return {};

    let baseRewards = defeated ? bossConfig.rewards.completion : {};
    let multiplier = tierConfig.multiplier;

    return Object.fromEntries(
      Object.entries(baseRewards).map(([currency, amount]) => [
        currency,
        Math.floor(amount * multiplier)
      ])
    );
  }

  /**
   * Get squad participant count
   */
  private getSquadParticipantCount(raidId: string, squadId: string): number {
    let count = 0;
    this.participations.forEach((participation) => {
      if (participation.raidId === raidId && participation.squadId === squadId) {
        count++;
      }
    });
    return count;
  }

  /**
   * Get squad ranking
   */
  private getSquadRanking(raidId: string, squadId: string): { rank: number; damage: number; tier: string } | null {
    const raid = this.raids.get(raidId);
    if (!raid) return null;

    const damage = raid.damageBySquad[squadId] || 0;
    const tier = this.getContributionTier(damage);

    // Calculate rank
    const squadDamages = Object.values(raid.damageBySquad).sort((a, b) => b - a);
    const rank = squadDamages.indexOf(damage) + 1;

    return { rank, damage, tier };
  }

  /**
   * Distribute rewards to participants
   */
  private async distributeRewards(raid: WeeklyBossRaid): Promise<void> {
    const bossConfig = BOSS_RAID_CONFIG.BOSS_TYPES[raid.bossType];

    this.participations.forEach((participation) => {
      const tier = this.getContributionTier(participation.totalDamage);
      const tierConfig = BOSS_RAID_CONFIG.CONTRIBUTION_TIERS.find(t => t.name === tier);
      
      if (tierConfig && participation.totalDamage >= BOSS_RAID_CONFIG.PARTICIPATION_THRESHOLD) {
        // Calculate rewards
        let rewards = { ...bossConfig.rewards.completion };
        
        // Apply tier multiplier
        Object.keys(rewards).forEach(currency => {
          rewards[currency] = Math.floor((rewards[currency] as number) * tierConfig.multiplier);
        });

        // Add top 10 / first place bonuses
        const squadRanking = this.getSquadRanking(raid.id, participation.squadId);
        if (squadRanking) {
          if (squadRanking.rank === 1) {
            Object.keys(bossConfig.rewards.first_place).forEach(currency => {
              rewards[currency] = (rewards[currency] || 0) + (bossConfig.rewards.first_place[currency] as number);
            });
          } else if (squadRanking.rank <= 10) {
            Object.keys(bossConfig.rewards.top_10).forEach(currency => {
              rewards[currency] = (rewards[currency] || 0) + (bossConfig.rewards.top_10[currency] as number);
            });
          }
        }

        participation.contributionTier = tier;
        participation.rewardsEarned = rewards;
        this.participations.set(`${raid.id}_${participation.squadId}_${participation.userId}`, participation);

        // Emit reward event
        eventBus.publish('raid:rewards_earned', {
          raidId: raid.id,
          userId: participation.userId,
          squadId: participation.squadId,
          tier,
          rewards,
        });
      }
    });

    raid.rewardsDistributed = true;
  }

  /**
   * Distribute partial rewards for failed raids
   */
  private distributePartialRewards(raid: WeeklyBossRaid): void {
    // Reduced rewards for participation in failed raids
    this.participations.forEach((participation) => {
      if (participation.totalDamage >= BOSS_RAID_CONFIG.PARTICIPATION_THRESHOLD) {
        const partialRewards = {
          focusPoints: Math.floor(participation.totalDamage / 100),
          coins: Math.floor(participation.totalDamage / 50),
        };

        participation.rewardsEarned = partialRewards;
        this.participations.set(`${raid.id}_${participation.squadId}_${participation.userId}`, participation);
      }
    });
  }

  /**
   * Generate final leaderboard
   */
  private generateLeaderboard(raid: WeeklyBossRaid): void {
    const leaderboard = Object.entries(raid.damageBySquad)
      .map(([squadId, damage]) => {
        const tier = this.getContributionTier(damage);
        const rewards = this.calculateSquadRewards(damage, tier, raid.defeated);
        const participants = this.getSquadParticipantCount(raid.id, squadId);

        return {
          rank: 0,
          squadId,
          damage,
          participants,
          contributionTier: tier,
          rewards,
        };
      })
      .sort((a, b) => b.damage - a.damage)
      .map((item, index) => ({ ...item, rank: index + 1 }));

    raid.leaderboard = leaderboard;
  }

  /**
   * Get week start date
   */
  private getWeekStart(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
    return new Date(d.setDate(diff));
  }
}

// ============================================================================
// Factory & Exports
// ============================================================================

export function createWeeklyBossRaidsService(): WeeklyBossRaidsService {
  return new WeeklyBossRaidsService();
}

// Singleton instance
let weeklyBossRaidsService: WeeklyBossRaidsService | null = null;

export function getWeeklyBossRaidsService(): WeeklyBossRaidsService {
  if (!weeklyBossRaidsService) {
    weeklyBossRaidsService = new WeeklyBossRaidsService();
  }
  return weeklyBossRaidsService;
}
