/**
 * Squad Tournament System
 *
 * Phase 3C: Social Systems - Weekly squad vs squad tournaments
 *
 * Competitive weekly tournaments where squads compete based on:
 * - Total focus time completed
 * - Average session purity
 * - Squad streak consistency
 * - Help requests resolved
 *
 * Creates weekly social events and bragging rights.
 *
 * Features:
 * - Weekly tournaments with different themes
 * - Leaderboards and rankings
 * - Tournament rewards and bragging rights
 * - Season-based championship system
 *
 * Dependencies:
 * - features/squads/types (Squad, SquadMember)
 * - feature-flags (gradual rollout)
 * - events (eventBus for tournament updates)
 * - analytics (tournament performance tracking)
 */

import { z } from 'zod';
import { featureFlags } from '../../feature-flags/FeatureFlagEngine';
import { eventBus } from '../../events';
import type { Squad, SquadMember } from './types';

// ============================================================================
// Tournament Constants
// ============================================================================

export const TOURNAMENT_CONFIG = {
  // Tournament schedule
  TOURNAMENT_DURATION_WEEKS: 1,
  SEASON_DURATION_WEEKS: 12, // 3 months per season
  REGISTRATION_DAYS: 2,      // Monday-Tuesday registration
  COMPETITION_DAYS: 5,       // Wednesday-Sunday competition
  
  // Tournament types
  TOURNAMENT_TYPES: {
    FOCUS_TIME: 'focus_time',           // Most total focus time
    PURITY_MASTERY: 'purity_mastery',   // Highest average purity
    STREAK_WARRIORS: 'streak_warriors', // Best squad streak
    HELP_HEROES: 'help_heroes',         // Most help given/received
    BOSS_HUNTERS: 'boss_hunters',       // Most boss damage
  },

  // Scoring weights
  SCORING_WEIGHTS: {
    TOTAL_FOCUS_TIME: 0.3,      // 30% weight
    AVERAGE_PURITY: 0.25,        // 25% weight
    SQUAD_STREAK: 0.2,          // 20% weight
    HELP_INTERACTIONS: 0.15,    // 15% weight
    BOSS_PROGRESS: 0.1,          // 10% weight
  },

  // Rewards
  REWARD_TIERS: {
    GOLD: { multiplier: 3.0, focusPoints: 1000, title: 'Tournament Champions' },
    SILVER: { multiplier: 2.0, focusPoints: 500, title: 'Elite Performers' },
    BRONZE: { multiplier: 1.5, focusPoints: 250, title: 'Honorable Mention' },
    PARTICIPANT: { multiplier: 1.0, focusPoints: 100, title: 'Tournament Veterans' },
  },

  // Participation requirements
  MIN_SQUAD_SIZE: 3,
  MIN_ACTIVE_MEMBERS: 2, // Must have at least 2 active members during tournament
  MIN_SESSIONS_PER_MEMBER: 3, // Minimum sessions to qualify

  // Leaderboard limits
  LEADERBOARD_SIZE: 100,
  TOP_SQUADS_DISPLAY: 10,
} as const;

// ============================================================================
// Types & Schemas
// ============================================================================

export const TournamentSchema = z.object({
  id: z.string(),
  seasonId: z.string(),
  name: z.string(),
  description: z.string(),
  type: z.enum(['focus_time', 'purity_mastery', 'streak_warriors', 'help_heroes', 'boss_hunters']),
  
  // Schedule
  registrationStartAt: z.number(),
  registrationEndAt: z.number(),
  competitionStartAt: z.number(),
  competitionEndAt: z.number(),
  resultsAnnouncedAt: z.number(),
  
  // Status
  status: z.enum(['upcoming', 'registration', 'active', 'completed', 'cancelled']).default('upcoming'),
  
  // Participation
  registeredSquads: z.array(z.string()).default([]),
  participatingSquads: z.array(z.string()).default([]),
  maxParticipants: z.number().default(50),
  
  // Results
  results: z.array(z.object({
    squadId: z.string(),
    rank: z.number(),
    score: z.number(),
    metrics: z.record(z.number()),
    rewardTier: z.enum(['gold', 'silver', 'bronze', 'participant']),
  })).default([]),
  
  // Metadata
  rules: z.array(z.string()).default([]),
  prizes: z.array(z.string()).default([]),
  createdAt: z.number(),
});

export const TournamentParticipationSchema = z.object({
  id: z.string(),
  tournamentId: z.string(),
  squadId: z.string(),
  
  // Registration
  registeredAt: z.number(),
  registeredBy: z.string(),
  
  // Status
  status: z.enum(['registered', 'active', 'disqualified', 'withdrawn']).default('registered'),
  
  // Performance metrics
  metrics: z.record(z.number()).default({}),
  
  // Member participation
  activeMembers: z.array(z.string()).default([]),
  sessionCounts: z.record(z.number()).default({}), // userId -> sessionCount
  
  // Disqualification
  disqualifiedAt: z.number().nullable().default(null),
  disqualificationReason: z.string().nullable().default(null),
  
  updatedAt: z.number(),
});

export const TournamentSeasonSchema = z.object({
  id: z.string(),
  name: z.string(),
  theme: z.string(),
  
  // Schedule
  startsAt: z.number(),
  endsAt: z.number(),
  
  // Tournament tracking
  tournamentIds: z.array(z.string()).default([]),
  currentTournamentId: z.string().nullable().default(null),
  
  // Season standings
  standings: z.array(z.object({
    squadId: z.string(),
    totalPoints: z.number(),
    tournamentWins: z.number(),
    averageRank: z.number(),
    bestFinish: z.enum(['gold', 'silver', 'bronze', 'participant']),
  })).default([]),
  
  // Status
  status: z.enum(['upcoming', 'active', 'completed']).default('upcoming'),
  
  createdAt: z.number(),
});

export type Tournament = z.infer<typeof TournamentSchema>;
export type TournamentParticipation = z.infer<typeof TournamentParticipationSchema>;
export type TournamentSeason = z.infer<typeof TournamentSeasonSchema>;

export interface TournamentScore {
  squadId: string;
  totalScore: number;
  breakdown: {
    focusTimeScore: number;
    purityScore: number;
    streakScore: number;
    helpScore: number;
    bossScore: number;
  };
  rank?: number;
}

export interface TournamentLeaderboard {
  tournament: Tournament;
  leaderboard: TournamentScore[];
  userSquadRanking?: {
    squadId: string;
    rank: number;
    score: number;
    tier: string;
  };
}

// ============================================================================
// Tournament Service
// ============================================================================

export class SquadTournamentService {
  private tournaments: Map<string, Tournament> = new Map();
  private participations: Map<string, TournamentParticipation> = new Map(); // tournamentId_squadId
  private seasons: Map<string, TournamentSeason> = new Map();

  /**
   * Check if tournament system is enabled
   */
  static isEnabled(): boolean {
    return featureFlags.isEnabled('squad_tournaments');
  }

  /**
   * Create a new tournament
   */
  async createTournament(input: {
    seasonId: string;
    name: string;
    description: string;
    type: typeof TOURNAMENT_CONFIG.TOURNAMENT_TYPES[keyof typeof TOURNAMENT_CONFIG.TOURNAMENT_TYPES];
    registrationStartAt: number;
    competitionStartAt: number;
    maxParticipants?: number;
    rules?: string[];
    prizes?: string[];
  }): Promise<Tournament> {
    const now = Date.now();
    const tournament: Tournament = {
      id: `tournament_${now}_${Math.random().toString(36).substr(2, 9)}`,
      seasonId: input.seasonId,
      name: input.name,
      description: input.description,
      type: input.type,
      registrationStartAt: input.registrationStartAt,
      registrationEndAt: input.competitionStartAt - (TOURNAMENT_CONFIG.REGISTRATION_DAYS * 24 * 60 * 60 * 1000),
      competitionStartAt: input.competitionStartAt,
      competitionEndAt: input.competitionStartAt + (TOURNAMENT_CONFIG.COMPETITION_DAYS * 24 * 60 * 60 * 1000),
      resultsAnnouncedAt: input.competitionStartAt + (TOURNAMENT_CONFIG.COMPETITION_DAYS * 24 * 60 * 60 * 1000) + (24 * 60 * 60 * 1000),
      status: 'upcoming',
      registeredSquads: [],
      participatingSquads: [],
      maxParticipants: input.maxParticipants || 50,
      results: [],
      rules: input.rules || [],
      prizes: input.prizes || [],
      createdAt: now,
    };

    this.tournaments.set(tournament.id, tournament);

    // Update season
    const season = this.seasons.get(input.seasonId);
    if (season) {
      season.tournamentIds.push(tournament.id);
      season.currentTournamentId = tournament.id;
      this.seasons.set(input.seasonId, season);
    }

    // Emit event
    eventBus.publish('tournament:created', {
      tournamentId: tournament.id,
      seasonId: input.seasonId,
      type: input.type,
    });

    return tournament;
  }

  /**
   * Register squad for tournament
   */
  async registerSquad(input: {
    tournamentId: string;
    squadId: string;
    registeredBy: string;
  }): Promise<{ success: boolean; error?: string }> {
    const tournament = this.tournaments.get(input.tournamentId);
    if (!tournament) {
      return { success: false, error: 'Tournament not found' };
    }

    const now = Date.now();

    // Check registration period
    if (now < tournament.registrationStartAt || now > tournament.registrationEndAt) {
      return { success: false, error: 'Registration period closed' };
    }

    // Check if already registered
    if (tournament.registeredSquads.includes(input.squadId)) {
      return { success: false, error: 'Squad already registered' };
    }

    // Check capacity
    if (tournament.registeredSquads.length >= tournament.maxParticipants) {
      return { success: false, error: 'Tournament full' };
    }

    // Check squad eligibility (would normally verify squad size, etc.)
    // For now, we'll assume the check passes

    // Create participation record
    const participation: TournamentParticipation = {
      id: `part_${now}_${Math.random().toString(36).substr(2, 9)}`,
      tournamentId: input.tournamentId,
      squadId: input.squadId,
      registeredAt: now,
      registeredBy: input.registeredBy,
      status: 'registered',
      metrics: {},
      activeMembers: [],
      sessionCounts: {},
      disqualifiedAt: null,
      disqualificationReason: null,
      updatedAt: now,
    };

    // Update tournament
    tournament.registeredSquads.push(input.squadId);
    this.tournaments.set(input.tournamentId, tournament);

    // Store participation
    const participationKey = `${input.tournamentId}_${input.squadId}`;
    this.participations.set(participationKey, participation);

    // Emit event
    eventBus.publish('tournament:squad_registered', {
      tournamentId: input.tournamentId,
      squadId: input.squadId,
      registeredBy: input.registeredBy,
    });

    // Notify squad
    await this.notifySquadRegistration(input.squadId, tournament);

    return { success: true };
  }

  /**
   * Start tournament competition
   */
  async startTournament(tournamentId: string): Promise<{ success: boolean; error?: string }> {
    const tournament = this.tournaments.get(tournamentId);
    if (!tournament) {
      return { success: false, error: 'Tournament not found' };
    }

    const now = Date.now();

    if (now < tournament.competitionStartAt) {
      return { success: false, error: 'Tournament not ready to start' };
    }

    if (tournament.status !== 'registration') {
      return { success: false, error: 'Tournament already started or completed' };
    }

    // Move registered squads to participating
    tournament.participatingSquads = [...tournament.registeredSquads];
    tournament.status = 'active';

    // Update participations
    tournament.participatingSquads.forEach(squadId => {
      const participationKey = `${tournamentId}_${squadId}`;
      const participation = this.participations.get(participationKey);
      if (participation) {
        participation.status = 'active';
        this.participations.set(participationKey, participation);
      }
    });

    this.tournaments.set(tournamentId, tournament);

    // Emit event
    eventBus.publish('tournament:started', {
      tournamentId,
      participatingSquads: tournament.participatingSquads,
    });

    // Notify all participating squads
    await this.notifyTournamentStart(tournament);

    return { success: true };
  }

  /**
   * Update squad performance metrics during tournament
   */
  async updateSquadMetrics(input: {
    tournamentId: string;
    squadId: string;
    userId: string;
    metrics: {
      focusTime?: number;
      purity?: number;
      streakDays?: number;
      helpGiven?: number;
      helpReceived?: number;
      bossDamage?: number;
    };
  }): Promise<void> {
    const participationKey = `${input.tournamentId}_${input.squadId}`;
    const participation = this.participations.get(participationKey);
    
    if (!participation || participation.status !== 'active') {
      return;
    }

    // Update active members
    if (!participation.activeMembers.includes(input.userId)) {
      participation.activeMembers.push(input.userId);
    }

    // Update session counts
    participation.sessionCounts[input.userId] = (participation.sessionCounts[input.userId] || 0) + 1;

    // Update metrics (aggregate across all members)
    Object.entries(input.metrics).forEach(([key, value]) => {
      if (value !== undefined) {
        participation.metrics[key] = (participation.metrics[key] || 0) + value;
      }
    });

    participation.updatedAt = Date.now();
    this.participations.set(participationKey, participation);

    // Emit event for real-time updates
    eventBus.publish('tournament:metrics_updated', {
      tournamentId: input.tournamentId,
      squadId: input.squadId,
      userId: input.userId,
      metrics: input.metrics,
    });
  }

  /**
   * Complete tournament and calculate results
   */
  async completeTournament(tournamentId: string): Promise<{ success: boolean; results?: Tournament['results']; error?: string }> {
    const tournament = this.tournaments.get(tournamentId);
    if (!tournament) {
      return { success: false, error: 'Tournament not found' };
    }

    const now = Date.now();

    if (now < tournament.competitionEndAt) {
      return { success: false, error: 'Tournament not yet ended' };
    }

    if (tournament.status !== 'active') {
      return { success: false, error: 'Tournament already completed' };
    }

    // Calculate scores for all participating squads
    const scores = await this.calculateTournamentScores(tournament);

    // Sort by score and assign ranks
    scores.sort((a, b) => b.totalScore - a.totalScore);
    scores.forEach((score, index) => {
      score.rank = index + 1;
    });

    // Generate results with reward tiers
    const results = scores.map((score, index) => {
      let rewardTier: 'gold' | 'silver' | 'bronze' | 'participant';
      
      if (index === 0) rewardTier = 'gold';
      else if (index === 1) rewardTier = 'silver';
      else if (index === 2) rewardTier = 'bronze';
      else rewardTier = 'participant';

      return {
        squadId: score.squadId,
        rank: score.rank!,
        score: score.totalScore,
        metrics: score.breakdown,
        rewardTier,
      };
    });

    // Update tournament
    tournament.results = results;
    tournament.status = 'completed';
    this.tournaments.set(tournamentId, tournament);

    // Update season standings
    await this.updateSeasonStandings(tournament.seasonId, results);

    // Emit event
    eventBus.publish('tournament:completed', {
      tournamentId,
      results,
    });

    // Notify participants
    await this.notifyTournamentResults(tournament, results);

    return { success: true, results };
  }

  /**
   * Get tournament leaderboard
   */
  getTournamentLeaderboard(tournamentId: string, userSquadId?: string): TournamentLeaderboard | null {
    const tournament = this.tournaments.get(tournamentId);
    if (!tournament) {
      return null;
    }

    // Get current scores if tournament is active
    let leaderboard: TournamentScore[] = [];
    
    if (tournament.status === 'active') {
      leaderboard = this.getCurrentTournamentScores(tournamentId);
    } else if (tournament.status === 'completed') {
      leaderboard = tournament.results.map(result => ({
        squadId: result.squadId,
        totalScore: result.score,
        breakdown: result.metrics as any,
        rank: result.rank,
      }));
    }

    // Find user's squad ranking if provided
    let userSquadRanking;
    if (userSquadId) {
      const userScore = leaderboard.find(score => score.squadId === userSquadId);
      if (userScore) {
        const rank = userScore.rank || (leaderboard.findIndex(s => s.squadId === userSquadId) + 1);
        const tier = this.getRewardTier(rank);
        userSquadRanking = {
          squadId: userSquadId,
          rank,
          score: userScore.totalScore,
          tier: tier.title,
        };
      }
    }

    return {
      tournament,
      leaderboard,
      userSquadRanking,
    };
  }

  /**
   * Get upcoming tournaments
   */
  getUpcomingTournaments(limit = 5): Tournament[] {
    const now = Date.now();
    return Array.from(this.tournaments.values())
      .filter(t => t.status === 'upcoming' || t.status === 'registration')
      .filter(t => t.registrationStartAt > now || (t.registrationStartAt <= now && t.registrationEndAt > now))
      .sort((a, b) => a.registrationStartAt - b.registrationStartAt)
      .slice(0, limit);
  }

  /**
   * Get active tournaments
   */
  getActiveTournaments(): Tournament[] {
    const now = Date.now();
    return Array.from(this.tournaments.values())
      .filter(t => t.status === 'active')
      .filter(t => t.competitionStartAt <= now && t.competitionEndAt > now);
  }

  /**
   * Get squad tournament history
   */
  getSquadTournamentHistory(squadId: string): Array<{
    tournament: Tournament;
    participation: TournamentParticipation;
    result?: Tournament['results'][0];
  }> {
    const history: Array<{
      tournament: Tournament;
      participation: TournamentParticipation;
      result?: Tournament['results'][0];
    }> = [];

    this.participations.forEach((participation, key) => {
      if (participation.squadId === squadId) {
        const tournament = this.tournaments.get(participation.tournamentId);
        if (tournament) {
          const result = tournament.results.find(r => r.squadId === squadId);
          history.push({ tournament, participation, result });
        }
      }
    });

    return history.sort((a, b) => b.tournament.createdAt - a.tournament.createdAt);
  }

  // ============================================================================
  // Private Helper Methods
  // ============================================================================

  /**
   * Calculate tournament scores for all participating squads
   */
  private async calculateTournamentScores(tournament: Tournament): Promise<TournamentScore[]> {
    const scores: TournamentScore[] = [];

    for (const squadId of tournament.participatingSquads) {
      const participationKey = `${tournament.id}_${squadId}`;
      const participation = this.participations.get(participationKey);
      
      if (!participation || participation.status !== 'active') {
        continue;
      }

      const score = this.calculateSquadScore(participation.metrics, tournament.type);
      scores.push(score);
    }

    return scores;
  }

  /**
   * Calculate score for a single squad
   */
  private calculateSquadScore(metrics: Record<string, number>, tournamentType: Tournament['type']): TournamentScore {
    const weights = TOURNAMENT_CONFIG.SCORING_WEIGHTS;

    // Normalize metrics (would typically involve more sophisticated normalization)
    const focusTimeScore = (metrics.totalFocusTime || 0) * weights.TOTAL_FOCUS_TIME;
    const purityScore = (metrics.averagePurity || 0) * 100 * weights.AVERAGE_PURITY;
    const streakScore = (metrics.squadStreak || 0) * 10 * weights.SQUAD_STREAK;
    const helpScore = ((metrics.helpGiven || 0) + (metrics.helpReceived || 0)) * 5 * weights.HELP_INTERACTIONS;
    const bossScore = (metrics.bossDamage || 0) * 0.01 * weights.BOSS_PROGRESS;

    // Apply tournament type bonus
    let typeBonus = 1;
    switch (tournamentType) {
      case 'focus_time':
        typeBonus = 1.5;
        break;
      case 'purity_mastery':
        typeBonus = 1.5;
        break;
      case 'streak_warriors':
        typeBonus = 1.5;
        break;
      case 'help_heroes':
        typeBonus = 1.5;
        break;
      case 'boss_hunters':
        typeBonus = 1.5;
        break;
    }

    const totalScore = (focusTimeScore + purityScore + streakScore + helpScore + bossScore) * typeBonus;

    return {
      squadId: '', // Will be set by caller
      totalScore: Math.round(totalScore),
      breakdown: {
        focusTimeScore: Math.round(focusTimeScore),
        purityScore: Math.round(purityScore),
        streakScore: Math.round(streakScore),
        helpScore: Math.round(helpScore),
        bossScore: Math.round(bossScore),
      },
    };
  }

  /**
   * Get current tournament scores (for active tournaments)
   */
  private getCurrentTournamentScores(tournamentId: string): TournamentScore[] {
    const scores: TournamentScore[] = [];
    const tournament = this.tournaments.get(tournamentId);
    
    if (!tournament) return scores;

    tournament.participatingSquads.forEach(squadId => {
      const participationKey = `${tournamentId}_${squadId}`;
      const participation = this.participations.get(participationKey);
      
      if (participation && participation.status === 'active') {
        const score = this.calculateSquadScore(participation.metrics, tournament.type);
        score.squadId = squadId;
        scores.push(score);
      }
    });

    return scores.sort((a, b) => b.totalScore - a.totalScore);
  }

  /**
   * Get reward tier for rank
   */
  private getRewardTier(rank: number): typeof TOURNAMENT_CONFIG.REWARD_TIERS[keyof typeof TOURNAMENT_CONFIG.REWARD_TIERS] {
    if (rank === 1) return TOURNAMENT_CONFIG.REWARD_TIERS.GOLD;
    if (rank === 2) return TOURNAMENT_CONFIG.REWARD_TIERS.SILVER;
    if (rank === 3) return TOURNAMENT_CONFIG.REWARD_TIERS.BRONZE;
    return TOURNAMENT_CONFIG.REWARD_TIERS.PARTICIPANT;
  }

  /**
   * Update season standings
   */
  private async updateSeasonStandings(seasonId: string, results: Tournament['results']): Promise<void> {
    const season = this.seasons.get(seasonId);
    if (!season) return;

    results.forEach(result => {
      const existingStanding = season.standings.find(s => s.squadId === result.squadId);
      
      if (existingStanding) {
        existingStanding.totalPoints += result.score;
        existingStanding.averageRank = (existingStanding.averageRank + result.rank) / 2;
        if (result.rank === 1) existingStanding.tournamentWins += 1;
        if (result.rank <= 3) {
          existingStanding.bestFinish = result.rewardTier as any;
        }
      } else {
        season.standings.push({
          squadId: result.squadId,
          totalPoints: result.score,
          tournamentWins: result.rank === 1 ? 1 : 0,
          averageRank: result.rank,
          bestFinish: result.rewardTier as any,
        });
      }
    });

    // Sort standings
    season.standings.sort((a, b) => b.totalPoints - a.totalPoints);
    this.seasons.set(seasonId, season);
  }

  /**
   * Notify squad about successful registration
   */
  private async notifySquadRegistration(squadId: string, tournament: Tournament): Promise<void> {
    eventBus.publish('notification:send', {
      type: 'TOURNAMENT_REGISTERED',
      squadId,
      title: 'Tournament Registration Confirmed! 🏆',
      body: `Your squad is registered for ${tournament.name}`,
      data: {
        tournamentId: tournament.id,
        tournamentName: tournament.name,
        competitionStart: tournament.competitionStartAt,
      },
    });
  }

  /**
   * Notify squads about tournament start
   */
  private async notifyTournamentStart(tournament: Tournament): Promise<void> {
    tournament.participatingSquads.forEach(squadId => {
      eventBus.publish('notification:send', {
        type: 'TOURNAMENT_STARTED',
        squadId,
        title: 'Tournament Has Begun! ⚔️',
        body: `${tournament.name} competition starts now!`,
        data: {
          tournamentId: tournament.id,
          tournamentName: tournament.name,
          endsAt: tournament.competitionEndAt,
        },
        priority: 'high',
      });
    });
  }

  /**
   * Notify squads about tournament results
   */
  private async notifyTournamentResults(tournament: Tournament, results: Tournament['results']): Promise<void> {
    results.forEach(result => {
      const tier = TOURNAMENT_CONFIG.REWARD_TIERS[result.rewardTier.toUpperCase() as keyof typeof TOURNAMENT_CONFIG.REWARD_TIERS];
      
      eventBus.publish('notification:send', {
        type: 'TOURNAMENT_COMPLETED',
        squadId: result.squadId,
        title: `Tournament Results: Rank #${result.rank}! 🏅`,
        body: `Your squad finished ${result.rewardTier} in ${tournament.name}`,
        data: {
          tournamentId: tournament.id,
          tournamentName: tournament.name,
          rank: result.rank,
          tier: result.rewardTier,
          rewards: tier,
        },
        priority: 'high',
      });
    });
  }
}

// ============================================================================
// Factory & Exports
// ============================================================================

export function createSquadTournamentService(): SquadTournamentService {
  return new SquadTournamentService();
}

// Singleton instance
let tournamentService: SquadTournamentService | null = null;

export function getSquadTournamentService(): SquadTournamentService {
  if (!tournamentService) {
    tournamentService = new SquadTournamentService();
  }
  return tournamentService;
}
