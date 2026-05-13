import { z } from "zod";
import { featureFlags } from "../../feature-flags/FeatureFlagEngine";
import { eventBus } from "../../events";


export const ADAPTIVE_DIFFICULTY_CONFIG = {
  // Difficulty ranges (0.0 = easiest, 1.0 = hardest)
  DIFFICULTY_RANGES: {
    BEGINNER: { min: 0.0, max: 0.3, description: 'Learning phase' },
    NOVICE: { min: 0.3, max: 0.5, description: 'Building confidence' },
    INTERMEDIATE: { min: 0.5, max: 0.7, description: 'Balanced challenge' },
    ADVANCED: { min: 0.7, max: 0.85, description: 'Skilled players' },
    EXPERT: { min: 0.85, max: 1.0, description: 'Maximum challenge' },
  },

  // Performance metrics weights
  PERFORMANCE_WEIGHTS: {
    recentPurity: 0.3, // Last 5 sessions purity
    completionRate: 0.25, // Recent boss completion rate
    streakStrength: 0.2, // Current streak vs best
    sessionConsistency: 0.15, // Regular session patterns
    squadPerformance: 0.1, // Squad raid contributions
  },

  // Adjustment parameters
  ADJUSTMENT_SENSITIVITY: 0.1, // How quickly difficulty changes
  MIN_SESSIONS_FOR_ANALYSIS: 5, // Minimum sessions for reliable data
  DIFFICULTY_SMOOTHING: 0.7, // Smooth transitions (0 = instant, 1 = very smooth)

  // Squad balancing
  SQUAD_BALANCING: {
    enabled: true,
    targetWinRate: 0.6, // Aim for 60% win rate
    maxDifficultySpread: 0.2, // Max difference between squad members
    underdogBonus: 0.1, // Bonus for lower-skilled players
  },

  // Predictive adjustments
  PREDICTIVE_ADJUSTMENTS: {
    enabled: true,
    burnoutProtection: true, // Reduce difficulty if burnout detected
    streakProtection: true, // Maintain difficulty during long streaks
    learningCurve: true, // Account for new boss mechanics
  },
} as const;

export const DifficultyLevelSchema = z.enum(['BEGINNER', 'NOVICE', 'INTERMEDIATE', 'ADVANCED', 'EXPERT']);

export const DifficultyFactorSchema = z.object({
  type: z.enum(['boss_health', 'attack_frequency', 'mechanic_complexity', 'time_pressure', 'purity_threshold', 'damage_output']),
  baseValue: z.number(),
  currentValue: z.number(),
  min: z.number(),
  max: z.number(),
  weight: z.number(),
});

export const UserProfileSchema = z.object({
  userId: z.string(),
  profileId: z.string(),

  // Performance metrics
  recentPurity: z.number(),
  completionRate: z.number(),
  streakStrength: z.number(),
  sessionConsistency: z.number(),
  squadPerformance: z.number(),

  // Difficulty history
  currentDifficulty: z.number(),
  difficultyHistory: z.array(
    z.object({
      timestamp: z.number(),
      difficulty: z.number(),
      outcome: z.enum(['victory', 'defeat', 'abandoned']),
      performance: z.number(),
    }),
  ),

  // Learning patterns
  learningRate: z.number(),
  adaptationSpeed: z.number(),
  preferredDifficulty: z.number(),

  // Predictive factors
  burnoutRisk: z.number(),
  frustrationLevel: z.number(),
  engagementTrend: z.enum(['increasing', 'stable', 'decreasing']),

  updatedAt: z.number(),
});

export const AdaptiveBossEncounterSchema = z.object({
  id: z.string(),
  bossId: z.string(),
  userId: z.string(),
  squadId: z.string().optional(),

  // Base configuration
  baseDifficulty: z.number(),
  currentDifficulty: z.number(),
  targetDifficulty: z.number(),

  // Active factors
  factors: z.array(DifficultyFactorSchema),

  // Real-time adjustments
  realTimeAdjustments: z.array(
    z.object({
      timestamp: z.number(),
      trigger: z.string(),
      oldDifficulty: z.number(),
      newDifficulty: z.number(),
      reason: z.string(),
    }),
  ),

  // Performance tracking
  currentPerformance: z.number(), // 0-1 during encounter
  predictedOutcome: z.enum(['victory', 'defeat', 'uncertain']).nullable(),

  // Squad context
  squadMembers: z
    .array(
      z.object({
        userId: z.string(),
        difficulty: z.number(),
        role: z.enum(['leader', 'member', 'support']),
      }),
    )
    .optional(),

  createdAt: z.number(),
  updatedAt: z.number(),
});

export class AdaptiveDifficultyService {
  private userProfiles: Map<string, UserProfile> = new Map();
  private activeEncounters: Map<string, AdaptiveBossEncounter> = new Map();
  private difficultyFactors: Map<string, DifficultyFactor[]> = new Map();
  private adjustmentHistory: Map<string, DifficultyAdjustment[]> = new Map();

  /**
   * Check if adaptive difficulty is enabled
   */
  static isEnabled(): boolean {
    return featureFlags.isEnabled('adaptive_difficulty');
  }

  /**
   * Initialize user profile for adaptive difficulty
   */
  async initializeUserProfile(userId: string, initialMetrics?: Partial<PerformanceMetrics>): Promise<UserProfile> {
    const existingProfile = this.userProfiles.get(userId);
    if (existingProfile) {
      return existingProfile;
    }

    const now = Date.now();
    const profile: UserProfile = {
      userId,
      profileId: `profile-${userId}`,

      // Initialize with provided metrics or defaults
      recentPurity: initialMetrics?.sessionPurity || 0.7,
      completionRate: initialMetrics?.completionRate || 0.5,
      streakStrength: this.calculateStreakStrength(initialMetrics?.streakLength || 0),
      sessionConsistency: 0.7, // Default assumption
      squadPerformance: 0.5, // Will be updated with squad data

      // Difficulty tracking
      currentDifficulty: 0.5, // Start at intermediate
      difficultyHistory: [],

      // Learning patterns
      learningRate: 0.1,
      adaptationSpeed: 0.05,
      preferredDifficulty: 0.5,

      // Predictive factors
      burnoutRisk: 0.1,
      frustrationLevel: 0.1,
      engagementTrend: 'stable',

      updatedAt: now,
    };

    this.userProfiles.set(userId, profile);

    // Emit initialization event
    eventBus.publish('adaptive_difficulty:profile_initialized', {
      userId,
      profileId: profile.profileId,
      timestamp: now,
    });

    return profile;
  }

  /**
   * Create adaptive boss encounter
   */
  async createAdaptiveEncounter(input: { bossId: string; userId: string; squadId?: string; baseDifficulty?: number }): Promise<AdaptiveBossEncounter> {
    // Ensure user profile exists
    const profile = await this.initializeUserProfile(input.userId);

    const now = Date.now();
    const encounterId = `adaptive_${input.bossId}_${input.userId}_${now}`;

    // Calculate target difficulty
    const targetDifficulty = await this.calculateOptimalDifficulty(input.userId, input.squadId);

    // Initialize difficulty factors
    const factors = this.initializeDifficultyFactors(targetDifficulty);

    const encounter: AdaptiveBossEncounter = {
      id: encounterId,
      bossId: input.bossId,
      userId: input.userId,
      squadId: input.squadId,
      baseDifficulty: input.baseDifficulty || 0.5,
      currentDifficulty: targetDifficulty,
      targetDifficulty,
      factors,
      realTimeAdjustments: [],
      currentPerformance: 0.5,
      predictedOutcome: null,
      createdAt: now,
      updatedAt: now,
    };

    // Add squad context if applicable
    if (input.squadId) {
      encounter.squadMembers = await this.getSquadDifficultyContext(input.squadId, input.userId);
    }

    this.activeEncounters.set(encounterId, encounter);
    this.adjustmentHistory.set(encounterId, []);

    // Emit encounter creation event
    eventBus.publish('adaptive_difficulty:encounter_created', {
      userId: input.userId,
      encounterId,
      bossId: input.bossId,
      difficulty: targetDifficulty,
      timestamp: Date.now(),
    });

    return encounter;
  }

  /**
   * Update encounter performance in real-time
   */
  async updateEncounterPerformance(
    encounterId: string,
    performance: number,
    context?: {
      sessionTime: number;
      purity: number;
      mistakes: number;
      progress: number;
    },
  ): Promise<{
    adjusted: boolean;
    newDifficulty?: number;
    adjustment?: DifficultyAdjustment;
  }> {
    const encounter = this.activeEncounters.get(encounterId);
    if (!encounter) {
      return { adjusted: false };
    }

    const oldDifficulty = encounter.currentDifficulty;
    encounter.currentPerformance = performance;
    encounter.updatedAt = Date.now();

    // Check if adjustment is needed
    const adjustmentNeeded = this.shouldAdjustDifficulty(encounter, performance, context);

    if (adjustmentNeeded.shouldAdjust) {
      const newDifficulty = this.calculateRealTimeAdjustment(encounter, performance, adjustmentNeeded.reason);

      // Apply smoothing
      const smoothedDifficulty = this.smoothDifficultyTransition(oldDifficulty, newDifficulty, ADAPTIVE_DIFFICULTY_CONFIG.DIFFICULTY_SMOOTHING);

      encounter.currentDifficulty = smoothedDifficulty;

      // Record adjustment
      const adjustment: DifficultyAdjustment = {
        encounterId,
        timestamp: Date.now(),
        trigger: 'real_time',
        adjustment: smoothedDifficulty - oldDifficulty,
        reason: adjustmentNeeded.reason,
        factors: adjustmentNeeded.factors,
      };

      const history = this.adjustmentHistory.get(encounterId) || [];
      history.push(adjustment);
      this.adjustmentHistory.set(encounterId, history);

      encounter.realTimeAdjustments.push({
        timestamp: adjustment.timestamp,
        trigger: adjustment.trigger,
        oldDifficulty,
        newDifficulty: smoothedDifficulty,
        reason: adjustment.reason,
      });

      // Update encounter factors
      this.updateEncounterFactors(encounter, smoothedDifficulty);

      // Emit adjustment event
      eventBus.publish('adaptive_difficulty:real_time_adjustment', {
        userId: encounter.userId,
        encounterId,
        adjustment: smoothedDifficulty - oldDifficulty,
        reason: adjustment.reason,
        timestamp: Date.now(),
      });

      this.activeEncounters.set(encounterId, encounter);

      return {
        adjusted: true,
        newDifficulty: smoothedDifficulty,
        adjustment,
      };
    }

    return { adjusted: false };
  }

  /**
   * Complete encounter and update user profile
   */
  async completeEncounter(encounterId: string, outcome: 'victory' | 'defeat' | 'abandoned', finalPerformance: number): Promise<void> {
    const encounter = this.activeEncounters.get(encounterId);
    if (!encounter) {
      return;
    }

    const profile = this.userProfiles.get(encounter.userId);
    if (!profile) {
      return;
    }

    // Update difficulty history
    profile.difficultyHistory.push({
      timestamp: Date.now(),
      difficulty: encounter.currentDifficulty,
      outcome,
      performance: finalPerformance,
    });

    // Keep only last 20 encounters
    if (profile.difficultyHistory.length > 20) {
      profile.difficultyHistory = profile.difficultyHistory.slice(-20);
    }

    // Update learning patterns
    this.updateLearningPatterns(profile, encounter, outcome, finalPerformance);

    // Calculate new preferred difficulty
    profile.preferredDifficulty = this.calculatePreferredDifficulty(profile);

    // Update predictive factors
    this.updatePredictiveFactors(profile, encounter, outcome);

    profile.updatedAt = Date.now();
    this.userProfiles.set(encounter.userId, profile);

    // Remove from active encounters
    this.activeEncounters.delete(encounterId);

    // Emit completion event
    eventBus.publish('adaptive_difficulty:encounter_completed', {
      userId: encounter.userId,
      encounterId,
      bossId: encounter.bossId,
      finalDifficulty: encounter.currentDifficulty,
      timestamp: Date.now(),
    });
  }

  /**
   * Get user's current difficulty recommendation
   */
  async getDifficultyRecommendation(
    userId: string,
    bossId?: string,
    squadId?: string,
  ): Promise<{
    recommendedDifficulty: number;
    difficultyLevel: DifficultyLevel;
    confidence: number;
    factors: Array<{
      factor: string;
      influence: number;
      value: number;
    }>;
    reasoning: string[];
  }> {
    const profile = this.userProfiles.get(userId);
    if (!profile) {
      await this.initializeUserProfile(userId);
      return this.getDifficultyRecommendation(userId, bossId, squadId);
    }

    const optimalDifficulty = await this.calculateOptimalDifficulty(userId, squadId);
    const difficultyLevel = this.getDifficultyLevel(optimalDifficulty);

    // Analyze contributing factors
    const factors = this.analyzeDifficultyFactors(profile);

    // Generate reasoning
    const reasoning = this.generateDifficultyReasoning(profile, factors, optimalDifficulty);

    // Calculate confidence based on data quality
    const confidence = this.calculateRecommendationConfidence(profile);

    return {
      recommendedDifficulty: optimalDifficulty,
      difficultyLevel,
      confidence,
      factors,
      reasoning,
    };
  }

  // ============================================================================
  // Private Helper Methods
  // ============================================================================

  /**
   * Calculate optimal difficulty for user
   */
  private async calculateOptimalDifficulty(userId: string, squadId?: string): Promise<number> {
    const profile = this.userProfiles.get(userId);
    if (!profile) {
      return 0.5;
    }

    // Base calculation from performance metrics
    let difficulty = 0;

    // Recent purity (higher purity = higher difficulty)
    difficulty += profile.recentPurity * ADAPTIVE_DIFFICULTY_CONFIG.PERFORMANCE_WEIGHTS.recentPurity;

    // Completion rate (higher completion = higher difficulty)
    difficulty += profile.completionRate * ADAPTIVE_DIFFICULTY_CONFIG.PERFORMANCE_WEIGHTS.completionRate;

    // Streak strength (strong streak = higher difficulty)
    difficulty += profile.streakStrength * ADAPTIVE_DIFFICULTY_CONFIG.PERFORMANCE_WEIGHTS.streakStrength;

    // Session consistency (more consistent = higher difficulty)
    difficulty += profile.sessionConsistency * ADAPTIVE_DIFFICULTY_CONFIG.PERFORMANCE_WEIGHTS.sessionConsistency;

    // Squad performance (if applicable)
    if (squadId) {
      difficulty += profile.squadPerformance * ADAPTIVE_DIFFICULTY_CONFIG.PERFORMANCE_WEIGHTS.squadPerformance;
    }

    // Apply predictive adjustments
    if (ADAPTIVE_DIFFICULTY_CONFIG.PREDICTIVE_ADJUSTMENTS.burnoutProtection && profile.burnoutRisk > 0.7) {
      difficulty *= 0.8; // Reduce difficulty if burnout risk is high
    }

    if (ADAPTIVE_DIFFICULTY_CONFIG.PREDICTIVE_ADJUSTMENTS.streakProtection && profile.streakStrength > 0.9) {
      difficulty *= 1.1; // Slightly increase difficulty for strong streaks
    }

    // Squad balancing
    if (squadId && ADAPTIVE_DIFFICULTY_CONFIG.SQUAD_BALANCING.enabled) {
      difficulty = await this.applySquadBalancing(userId, squadId, difficulty);
    }

    // Ensure within valid range
    return Math.max(0.0, Math.min(1.0, difficulty));
  }

  /**
   * Initialize difficulty factors for encounter
   */
  private initializeDifficultyFactors(baseDifficulty: number): DifficultyFactor[] {
    return [
      {
        type: 'boss_health',
        baseValue: 1000,
        currentValue: 1000 * (1 + baseDifficulty),
        min: 500,
        max: 2000,
        weight: 0.3,
      },
      {
        type: 'attack_frequency',
        baseValue: 1.0,
        currentValue: 1.0 + baseDifficulty * 0.5,
        min: 0.5,
        max: 2.0,
        weight: 0.2,
      },
      {
        type: 'mechanic_complexity',
        baseValue: 1,
        currentValue: Math.ceil(1 + baseDifficulty * 2),
        min: 1,
        max: 3,
        weight: 0.25,
      },
      {
        type: 'time_pressure',
        baseValue: 300, // 5 minutes base
        currentValue: 300 * (1 - baseDifficulty * 0.3),
        min: 180, // 3 minutes
        max: 420, // 7 minutes
        weight: 0.15,
      },
      {
        type: 'purity_threshold',
        baseValue: 70,
        currentValue: 70 + baseDifficulty * 20,
        min: 60,
        max: 90,
        weight: 0.1,
      },
    ];
  }

  /**
   * Check if difficulty adjustment is needed
   */
  private shouldAdjustDifficulty(encounter: AdaptiveBossEncounter, performance: number, context?: DynamicValue): { shouldAdjust: boolean; reason: string; factors: string[] } {
    const factors: string[] = [];

    // Struggling (performance too low)
    if (performance < 0.3) {
      factors.push('low_performance');
      return { shouldAdjust: true, reason: 'User struggling - reducing difficulty', factors };
    }

    // Too easy (performance too high)
    if (performance > 0.85) {
      factors.push('high_performance');
      return { shouldAdjust: true, reason: 'User finding it too easy - increasing difficulty', factors };
    }

    // Frustration detection (multiple mistakes, low purity)
    if (context && context.mistakes > 5 && context.purity < 60) {
      factors.push('frustration_detected');
      return { shouldAdjust: true, reason: 'Frustration detected - reducing difficulty', factors };
    }

    // Engagement drop (slow progress, low session time)
    if (context && context.progress < 0.2 && context.sessionTime < 10) {
      factors.push('engagement_drop');
      return { shouldAdjust: true, reason: 'Engagement dropping - adjusting difficulty', factors };
    }

    return { shouldAdjust: false, reason: '', factors: [] };
  }

  /**
   * Calculate real-time difficulty adjustment
   */
  private calculateRealTimeAdjustment(encounter: AdaptiveBossEncounter, performance: number, reason: string): number {
    let adjustment = 0;

    switch (reason) {
      case 'User struggling - reducing difficulty':
        adjustment = -ADAPTIVE_DIFFICULTY_CONFIG.ADJUSTMENT_SENSITIVITY;
        break;
      case 'User finding it too easy - increasing difficulty':
        adjustment = ADAPTIVE_DIFFICULTY_CONFIG.ADJUSTMENT_SENSITIVITY;
        break;
      case 'Frustration detected - reducing difficulty':
        adjustment = -ADAPTIVE_DIFFICULTY_CONFIG.ADJUSTMENT_SENSITIVITY * 1.5;
        break;
      case 'Engagement dropping - adjusting difficulty':
        adjustment = -ADAPTIVE_DIFFICULTY_CONFIG.ADJUSTMENT_SENSITIVITY * 0.5;
        break;
      default:
        adjustment = 0;
    }

    return encounter.currentDifficulty + adjustment;
  }

  /**
   * Apply smoothing to difficulty transitions
   */
  private smoothDifficultyTransition(from: number, to: number, smoothing: number): number {
    return from + (to - from) * (1 - smoothing);
  }

  /**
   * Update encounter factors based on new difficulty
   */
  private updateEncounterFactors(encounter: AdaptiveBossEncounter, difficulty: number): void {
    encounter.factors = encounter.factors.map((factor) => ({
      ...factor,
      currentValue: this.calculateFactorValue(factor, difficulty),
    }));
  }

  /**
   * Calculate factor value based on difficulty
   */
  private calculateFactorValue(factor: DifficultyFactor, difficulty: number): number {
    const range = factor.max - factor.min;
    const difficultyOffset = range * difficulty;

    switch (factor.type) {
      case 'boss_health':
        return factor.baseValue * (1 + difficulty);
      case 'attack_frequency':
        return factor.baseValue + difficulty * 0.5;
      case 'mechanic_complexity':
        return Math.ceil(factor.baseValue + difficulty * 2);
      case 'time_pressure':
        return factor.baseValue * (1 - difficulty * 0.3);
      case 'purity_threshold':
        return factor.baseValue + difficulty * 20;
      default:
        return factor.baseValue + difficultyOffset;
    }
  }

  /**
   * Get squad difficulty context
   */
  private async getSquadDifficultyContext(squadId: string, currentUserId: string): Promise<any[]> {
    // This would integrate with squad service to get other members' difficulties
    // For now, return mock data
    return [
      {
        userId: currentUserId,
        difficulty: 0.5,
        role: 'leader',
      },
    ];
  }

  /**
   * Apply squad balancing to difficulty
   */
  private async applySquadBalancing(userId: string, squadId: string, difficulty: number): Promise<number> {
    // This would integrate with squad service to balance team difficulty
    // For now, return unmodified difficulty
    return difficulty;
  }

  /**
   * Calculate streak strength
   */
  private calculateStreakStrength(streakLength: number): number {
    // Normalize streak length to 0-1 range
    // Assuming 30-day streak is maximum strength
    return Math.min(1.0, streakLength / 30);
  }

  /**
   * Update learning patterns based on encounter results
   */
  private updateLearningPatterns(profile: UserProfile, encounter: AdaptiveBossEncounter, outcome: string, performance: number): void {
    // Update learning rate based on performance improvement
    const recentEncounters = profile.difficultyHistory.slice(-5);
    if (recentEncounters.length >= 2) {
      const recentPerformance = recentEncounters.slice(-2).map((e) => e.performance);
      const improvement = recentPerformance[1] - recentPerformance[0];

      if (improvement > 0.1) {
        profile.learningRate = Math.min(0.3, profile.learningRate + 0.02);
      } else if (improvement < -0.1) {
        profile.learningRate = Math.max(0.05, profile.learningRate - 0.01);
      }
    }

    // Update adaptation speed
    profile.adaptationSpeed = profile.learningRate * 0.5;
  }

  /**
   * Calculate preferred difficulty from history
   */
  private calculatePreferredDifficulty(profile: UserProfile): number {
    if (profile.difficultyHistory.length === 0) {
      return 0.5;
    }

    // Weight recent successful encounters more heavily
    const successfulEncounters = profile.difficultyHistory.filter((e) => e.outcome === 'victory').slice(-10);

    if (successfulEncounters.length === 0) {
      return 0.5;
    }

    const totalWeight = successfulEncounters.reduce((sum, encounter, index) => {
      const weight = (index + 1) / successfulEncounters.length; // Newer = higher weight
      return sum + encounter.difficulty * weight;
    }, 0);

    const totalWeights = successfulEncounters.reduce((sum, _, index) => {
      return sum + (index + 1) / successfulEncounters.length;
    }, 0);

    return totalWeight / totalWeights;
  }

  /**
   * Update predictive factors
   */
  private updatePredictiveFactors(profile: UserProfile, encounter: AdaptiveBossEncounter, outcome: string): void {
    // Update burnout risk
    if (outcome === 'defeat' && encounter.currentDifficulty > 0.7) {
      profile.burnoutRisk = Math.min(1.0, profile.burnoutRisk + 0.1);
    } else if (outcome === 'victory') {
      profile.burnoutRisk = Math.max(0.0, profile.burnoutRisk - 0.05);
    }

    // Update frustration level
    if (outcome === 'defeat' && encounter.currentPerformance < 0.3) {
      profile.frustrationLevel = Math.min(1.0, profile.frustrationLevel + 0.15);
    } else if (outcome === 'victory') {
      profile.frustrationLevel = Math.max(0.0, profile.frustrationLevel - 0.1);
    }

    // Update engagement trend
    const recentOutcomes = profile.difficultyHistory.slice(-5).map((e) => e.outcome);
    const recentWinRate = recentOutcomes.filter((o) => o === 'victory').length / recentOutcomes.length;

    if (recentWinRate > 0.7) {
      profile.engagementTrend = 'increasing';
    } else if (recentWinRate < 0.3) {
      profile.engagementTrend = 'decreasing';
    } else {
      profile.engagementTrend = 'stable';
    }
  }

  /**
   * Get difficulty level from numeric value
   */
  private getDifficultyLevel(difficulty: number): DifficultyLevel {
    for (const [level, config] of Object.entries(ADAPTIVE_DIFFICULTY_CONFIG.DIFFICULTY_RANGES)) {
      if (difficulty >= config.min && difficulty <= config.max) {
        return level as DifficultyLevel;
      }
    }
    return 'INTERMEDIATE';
  }

  /**
   * Analyze difficulty contributing factors
   */
  private analyzeDifficultyFactors(profile: UserProfile): Array<{
    factor: string;
    influence: number;
    value: number;
  }> {
    return [
      {
        factor: 'recent_purity',
        influence: ADAPTIVE_DIFFICULTY_CONFIG.PERFORMANCE_WEIGHTS.recentPurity,
        value: profile.recentPurity,
      },
      {
        factor: 'completion_rate',
        influence: ADAPTIVE_DIFFICULTY_CONFIG.PERFORMANCE_WEIGHTS.completionRate,
        value: profile.completionRate,
      },
      {
        factor: 'streak_strength',
        influence: ADAPTIVE_DIFFICULTY_CONFIG.PERFORMANCE_WEIGHTS.streakStrength,
        value: profile.streakStrength,
      },
      {
        factor: 'session_consistency',
        influence: ADAPTIVE_DIFFICULTY_CONFIG.PERFORMANCE_WEIGHTS.sessionConsistency,
        value: profile.sessionConsistency,
      },
      {
        factor: 'squad_performance',
        influence: ADAPTIVE_DIFFICULTY_CONFIG.PERFORMANCE_WEIGHTS.squadPerformance,
        value: profile.squadPerformance,
      },
    ];
  }

  /**
   * Generate difficulty reasoning
   */
  private generateDifficultyReasoning(profile: UserProfile, factors: DynamicValue[], recommendedDifficulty: number): string[] {
    const reasoning: string[] = [];

    // High purity reasoning
    if (profile.recentPurity > 0.8) {
      reasoning.push('High session purity suggests you can handle increased challenge');
    } else if (profile.recentPurity < 0.6) {
      reasoning.push('Lower session purity indicates need for gentler difficulty');
    }

    // Completion rate reasoning
    if (profile.completionRate > 0.8) {
      reasoning.push('Strong completion rate shows consistent performance');
    } else if (profile.completionRate < 0.5) {
      reasoning.push('Lower completion rate suggests need for more accessible challenges');
    }

    // Streak reasoning
    if (profile.streakStrength > 0.8) {
      reasoning.push('Strong streak indicates readiness for advanced challenges');
    }

    // Learning pattern reasoning
    if (profile.learningRate > 0.2) {
      reasoning.push('Fast learning rate detected - can handle progressive difficulty');
    }

    // Burnout protection
    if (profile.burnoutRisk > 0.6) {
      reasoning.push('Burnout risk detected - difficulty adjusted for sustainability');
    }

    return reasoning;
  }

  /**
   * Calculate recommendation confidence
   */
  private calculateRecommendationConfidence(profile: UserProfile): number {
    let confidence = 0.5; // Base confidence

    // More data = higher confidence
    const dataPoints = profile.difficultyHistory.length;
    confidence += Math.min(0.3, dataPoints * 0.02);

    // Consistent performance = higher confidence
    if (profile.sessionConsistency > 0.8) {
      confidence += 0.1;
    }

    // Strong learning patterns = higher confidence
    if (profile.learningRate > 0.15) {
      confidence += 0.1;
    }

    return Math.min(1.0, confidence);
  }
}