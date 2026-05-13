import { z } from "zod";
import { featureFlags } from "../../feature-flags/FeatureFlagEngine";
import { eventBus } from "../../events";


export const CreatureCareActionSchema = z.object({
  id: z.string(),
  creatureId: z.string(),
  userId: z.string(),
  action: z.enum(['FEED', 'PLAY', 'TRAIN', 'GROOM']),
  performedAt: z.number(),
  effect: z.record(z.number()),
  cost: z.record(z.number()),
});

export const CreatureAbilitySchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  stage: CreatureStageSchema,
  effect: z.record(z.unknown()),
  cooldown: z.number(),
  uses: z.number().default(0),
  maxUses: z.number(),
});

export class StreakCreatureService {
  private creatures: Map<string, StreakCreature> = new Map(); // userId -> creature
  private careActions: Map<string, CreatureCareAction[]> = new Map(); // creatureId -> actions
  private abilities: Map<string, CreatureAbility> = new Map(); // abilityId -> ability

  /**
   * Check if streak creature system is enabled
   */
  static isEnabled(): boolean {
    return featureFlags.isEnabled('streak_creature_system');
  }

  /**
   * Initialize creature for a user
   */
  async initializeCreature(userId: string, name?: string): Promise<StreakCreature> {
    // Check if creature already exists
    const existing = this.creatures.get(userId);
    if (existing) {
      return existing;
    }

    const now = Date.now();
    const creature: StreakCreature = {
      id: `creature_${userId}_${now}`,
      userId,
      name: name || this.generateCreatureName(),
      stage: 'EGG',
      level: 1,
      experience: 0,
      evolutionProgress: 0,
      currentStreak: 0,
      bestStreak: 0,
      totalSessions: 0,
      happiness: 50,
      health: 100,
      bond: 0,
      primaryTrait: null,
      secondaryTrait: null,
      abilities: ['potential'],
      unlockedAbilities: ['potential'],
      lastFedAt: null,
      lastPlayedAt: null,
      lastTrainedAt: null,
      lastGroomedAt: null,
      sessionPatterns: {},
      color: CREATURE_CONFIG.EVOLUTION_STAGES.EGG.color,
      accessories: [],
      createdAt: now,
      updatedAt: now,
      lastEvolutionAt: null,
    };

    this.creatures.set(userId, creature);
    this.careActions.set(creature.id, []);

    // Event publishing re-enabled with fixed channel types
    eventBus.publish('creature:adopted', {
      userId,
      creatureId: creature.id,
      name: creature.name,
    });

    return creature;
  }

  /**
   * Update creature based on session completion
   */
  async updateCreatureFromSession(
    userId: string,
    sessionData: {
      duration: number; // minutes
      purity: number;
      mode: string;
      timestamp: number;
      isSquadSession?: boolean;
    },
  ): Promise<void> {
    const creature = this.creatures.get(userId);
    if (!creature) {
      await this.initializeCreature(userId);
      return;
    }

    // Update basic stats
    creature.totalSessions += 1;
    creature.updatedAt = Date.now();

    // Update session patterns
    this.updateSessionPatterns(creature, sessionData);

    // Update streak (would integrate with existing streak system)
    // For now, we'll simulate streak updates
    const streakIncrement = this.calculateStreakIncrement(sessionData);
    creature.currentStreak += streakIncrement;
    creature.bestStreak = Math.max(creature.bestStreak, creature.currentStreak);

    // Update experience
    const experienceGained = this.calculateExperienceGain(creature, sessionData);
    creature.experience = Math.min(CREATURE_CONFIG.MAX_EXPERIENCE, creature.experience + experienceGained);

    // Check for level up
    const experienceNeeded = this.getExperienceNeeded(creature.level);
    if (creature.experience >= experienceNeeded) {
      await this.levelUpCreature(creature);
    }

    // Update happiness based on session quality
    const happinessChange = this.calculateHappinessChange(creature, sessionData);
    creature.happiness = Math.max(0, Math.min(CREATURE_CONFIG.MAX_HAPPINESS, creature.happiness + happinessChange));

    // Check for evolution
    const evolutionResult = await this.checkEvolution(creature);
    if (evolutionResult.evolved) {
      creature.stage = evolutionResult.newStage!;
      creature.lastEvolutionAt = Date.now();

      // Unlock new abilities
      if (evolutionResult.newAbilities) {
        creature.unlockedAbilities.push(...evolutionResult.newAbilities);
        creature.abilities = [...creature.unlockedAbilities];
      }
    }

    // Update personality traits
    this.updatePersonalityTraits(creature);

    // Decay stats over time
    this.decayCreatureStats(creature);

    this.creatures.set(userId, creature);

    // Event publishing re-enabled with fixed channel types
    eventBus.publish('creature:updated', {
      userId,
      creatureId: creature.id,
      stage: creature.stage,
      level: creature.level,
    });
  }

  /**
   * Perform care action on creature
   */
  async performCareAction(
    userId: string,
    action: 'FEED' | 'PLAY' | 'TRAIN' | 'GROOM',
  ): Promise<{
    success: boolean;
    creature?: StreakCreature;
    error?: string;
  }> {
    const creature = this.creatures.get(userId);
    if (!creature) {
      return { success: false, error: 'Creature not found' };
    }

    const actionConfig = CREATURE_CONFIG.CARE_ACTIONS[action];
    const now = Date.now();

    // Check cooldown
    const lastActionTime = this.getLastActionTime(creature, action);
    if (lastActionTime && now - lastActionTime < actionConfig.cooldown) {
      const remainingMinutes = Math.ceil((actionConfig.cooldown - (now - lastActionTime)) / (1000 * 60));
      return { success: false, error: `Action available in ${remainingMinutes} minutes` };
    }

    // Check if user can afford the cost
    const canAfford = await this.checkCanAfford(userId, actionConfig.cost);
    if (!canAfford) {
      return { success: false, error: 'Insufficient resources' };
    }

    // Apply the action
    const effect = this.applyCareAction(creature, action);

    // Deduct cost
    await this.deductCost(userId, actionConfig.cost);

    // Update last action time
    this.setLastActionTime(creature, action, now);

    // Record action
    const careAction: CreatureCareAction = {
      id: `care_${creature.id}_${now}`,
      creatureId: creature.id,
      userId,
      action,
      performedAt: now,
      effect,
      cost: actionConfig.cost,
    };

    const actions = this.careActions.get(creature.id) || [];
    actions.push(careAction);
    this.careActions.set(creature.id, actions);

    this.creatures.set(userId, creature);

    // Event publishing re-enabled with fixed channel types
    eventBus.publish('creature:care_action', {
      userId,
      creatureId: creature.id,
      action: careAction.action,
      effect: careAction.effect,
    });

    return { success: true, creature };
  }

  /**
   * Get creature stats
   */
  getCreatureStats(userId: string): CreatureStats | null {
    const creature = this.creatures.get(userId);
    if (!creature) {
      return null;
    }

    const currentStageConfig = CREATURE_CONFIG.EVOLUTION_STAGES[creature.stage];
    const nextStage = this.getNextStage(creature.stage);

    return {
      stage: creature.stage,
      level: creature.level,
      experience: creature.experience,
      happiness: creature.happiness,
      health: creature.health,
      bond: creature.bond,
      abilities: creature.abilities,
      personality: [creature.primaryTrait, creature.secondaryTrait].filter(Boolean) as PersonalityTrait[],
      nextEvolution: {
        stage: nextStage || creature.stage,
        progress: creature.evolutionProgress,
        requirements: nextStage && nextStage !== 'EGG' ? (((CREATURE_CONFIG.EVOLUTION_REQUIREMENTS as any)[nextStage] || {}) as Record<string, number>) : {},
      },
    };
  }

  /**
   * Get creature care history
   */
  getCareHistory(userId: string, limit = 50): CreatureCareAction[] {
    const creature = this.creatures.get(userId);
    if (!creature) {
      return [];
    }

    const actions = this.careActions.get(creature.id) || [];
    return actions.sort((a, b) => b.performedAt - a.performedAt).slice(0, limit);
  }

  /**
   * Set creature nickname
   */
  async setCreatureNickname(userId: string, nickname: string): Promise<{ success: boolean; error?: string }> {
    const creature = this.creatures.get(userId);
    if (!creature) {
      return { success: false, error: 'Creature not found' };
    }

    if (nickname.length > 20) {
      return { success: false, error: 'Nickname too long (max 20 characters)' };
    }

    creature.nickname = nickname;
    creature.updatedAt = Date.now();
    this.creatures.set(userId, creature);

    // Event publishing re-enabled with fixed channel types
    eventBus.publish('creature:nickname_set', {
      userId,
      creatureId: creature.id,
      nickname: creature.nickname,
    });

    return { success: true };
  }

  // ============================================================================
  // Private Helper Methods
  // ============================================================================

  /**
   * Generate random creature name
   */
  private generateCreatureName(): string {
    const prefixes = ['Focus', 'Zen', 'Clarity', 'Mindful', 'Calm', 'Bright', 'Smart', 'Wise'];
    const suffixes = ['Spirit', 'Companion', 'Friend', 'Guardian', 'Helper', 'Buddy', 'Pal', 'Mate'];

    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];

    return `${prefix} ${suffix}`;
  }

  /**
   * Update session patterns for personality detection
   */
  private updateSessionPatterns(creature: StreakCreature, sessionData: DynamicValue): void {
    const hour = new Date(sessionData.timestamp).getHours();

    // Time patterns
    if (hour >= 5 && hour < 12) {
      creature.sessionPatterns.morning_sessions = (creature.sessionPatterns.morning_sessions || 0) + 1;
    } else if (hour >= 20 || hour < 2) {
      creature.sessionPatterns.evening_sessions = (creature.sessionPatterns.evening_sessions || 0) + 1;
    }

    // Session length patterns
    if (sessionData.duration >= 60) {
      creature.sessionPatterns.long_sessions = (creature.sessionPatterns.long_sessions || 0) + 1;
    }

    // Mode variety
    creature.sessionPatterns[`mode_${sessionData.mode}`] = (creature.sessionPatterns[`mode_${sessionData.mode}`] || 0) + 1;

    // Squad sessions
    if (sessionData.isSquadSession) {
      creature.sessionPatterns.squad_sessions = (creature.sessionPatterns.squad_sessions || 0) + 1;
    }
  }

  /**
   * Calculate streak increment from session
   */
  private calculateStreakIncrement(sessionData: DynamicValue): number {
    // Basic streak logic - would integrate with actual streak system
    if (sessionData.purity >= 70 && sessionData.duration >= 15) {
      return 1;
    }
    return 0;
  }

  /**
   * Calculate experience gain from session
   */
  private calculateExperienceGain(creature: StreakCreature, sessionData: DynamicValue): number {
    let baseXP = 10;

    // Duration bonus
    baseXP += Math.floor(sessionData.duration / 10) * 5;

    // Purity bonus
    baseXP += Math.floor(sessionData.purity / 10) * 3;

    // Stage multiplier
    const stageMultiplier = {
      EGG: 1.0,
      BABY: 1.2,
      TEEN: 1.5,
      ADULT: 1.8,
      EPIC: 2.0,
    };

    return Math.floor(baseXP * (stageMultiplier[creature.stage] || 1.0));
  }

  /**
   * Get experience needed for next level
   */
  private getExperienceNeeded(level: number): number {
    return level * 100; // Simple linear progression
  }

  /**
   * Level up creature
   */
  private async levelUpCreature(creature: StreakCreature): Promise<void> {
    creature.level += 1;
    creature.experience = 0;
    creature.bond = Math.min(CREATURE_CONFIG.MAX_BOND, creature.bond + 10);

    // Event publishing re-enabled with fixed channel types
    eventBus.publish('creature:level_up', {
      creatureId: creature.id,
      newLevel: creature.level,
      bond: creature.bond,
    });
  }

  /**
   * Calculate happiness change from session
   */
  private calculateHappinessChange(creature: StreakCreature, sessionData: DynamicValue): number {
    let change = 0;

    // High purity sessions make creature happy
    if (sessionData.purity >= 90) {
      change += 5;
    } else if (sessionData.purity >= 75) {
      change += 2;
    } else if (sessionData.purity < 50) {
      change -= 3;
    }

    // Long sessions
    if (sessionData.duration >= 60) {
      change += 3;
    }

    return change;
  }

  /**
   * Check if creature can evolve
   */
  private async checkEvolution(creature: StreakCreature): Promise<CreatureEvolutionResult> {
    const currentStage = creature.stage;
    const nextStage = this.getNextStage(currentStage);

    if (!nextStage) {
      return { evolved: false, message: 'Already at final stage' };
    }

    const requirements = nextStage !== 'EGG' ? (CREATURE_CONFIG.EVOLUTION_REQUIREMENTS as any)[nextStage] : { streak: 0, totalSessions: 0, avgPurity: 0 };
    const meetsRequirements = creature.currentStreak >= requirements.streak && creature.totalSessions >= requirements.totalSessions && this.getAveragePurity(creature) >= requirements.avgPurity;

    if (meetsRequirements) {
      const stageConfig = CREATURE_CONFIG.EVOLUTION_STAGES[nextStage];
      return {
        evolved: true,
        newStage: nextStage,
        newAbilities: stageConfig.abilities as unknown as string[],
        message: `${creature.name} evolved into ${stageConfig.name}!`,
      };
    }

    // Update evolution progress
    creature.evolutionProgress = this.calculateEvolutionProgress(creature, requirements);

    return { evolved: false, message: 'Evolution requirements not met yet' };
  }

  /**
   * Get next evolution stage
   */
  private getNextStage(currentStage: CreatureStage): CreatureStage | null {
    const stages: CreatureStage[] = ['EGG', 'BABY', 'TEEN', 'ADULT', 'EPIC'];
    const currentIndex = stages.indexOf(currentStage);
    return currentIndex < stages.length - 1 ? stages[currentIndex + 1] : null;
  }

  /**
   * Calculate evolution progress (0-100)
   */
  private calculateEvolutionProgress(creature: StreakCreature, requirements: DynamicValue): number {
    const streakProgress = Math.min(100, (creature.currentStreak / requirements.streak) * 40);
    const sessionProgress = Math.min(100, (creature.totalSessions / requirements.totalSessions) * 30);
    const purityProgress = Math.min(100, (this.getAveragePurity(creature) / requirements.avgPurity) * 30);

    return Math.floor((streakProgress + sessionProgress + purityProgress) / 3);
  }

  /**
   * Get average session purity
   */
  private getAveragePurity(creature: StreakCreature): number {
    // This would calculate from actual session history
    // For now, return a reasonable default
    return creature.currentStreak > 10 ? 85 : 75;
  }

  /**
   * Update personality traits based on patterns
   */
  private updatePersonalityTraits(creature: StreakCreature): void {
    const patterns = creature.sessionPatterns;
    const totalSessions = creature.totalSessions;

    if (totalSessions < 5) {
      return;
    } // Need enough data

    // Find dominant patterns
    const patternEntries = Object.entries(patterns);
    patternEntries.sort((a, b) => b[1] - a[1]);

    // Set primary trait based on most common pattern
    const dominantPattern = patternEntries[0]?.[0];
    if (dominantPattern && !creature.primaryTrait) {
      const trait = this.getTraitFromPattern(dominantPattern);
      if (trait) {
        creature.primaryTrait = trait;
      }
    }

    // Set secondary trait based on second most common pattern
    const secondPattern = patternEntries[1]?.[0];
    if (secondPattern && !creature.secondaryTrait && secondPattern !== dominantPattern) {
      const trait = this.getTraitFromPattern(secondPattern);
      if (trait) {
        creature.secondaryTrait = trait;
      }
    }
  }

  /**
   * Get personality trait from session pattern
   */
  private getTraitFromPattern(pattern: string): PersonalityTrait | null {
    const traitMap: Record<string, PersonalityTrait> = {
      morning_sessions: 'EARLY_BIRD',
      evening_sessions: 'NIGHT_OWL',
      long_sessions: 'INTENSE',
      squad_sessions: 'SOCIAL',
    };

    return traitMap[pattern] || null;
  }

  /**
   * Decay creature stats over time
   */
  private decayCreatureStats(creature: StreakCreature): void {
    const now = Date.now();
    const hoursSinceUpdate = (now - creature.updatedAt) / (1000 * 60 * 60);

    if (hoursSinceUpdate < 24) {
      return;
    } // Only decay after 24 hours

    // Happiness decay
    const happinessDecay = Math.floor(hoursSinceUpdate / 24) * 5;
    creature.happiness = Math.max(0, creature.happiness - happinessDecay);

    // Health decay (slower)
    const healthDecay = Math.floor(hoursSinceUpdate / 48) * 3;
    creature.health = Math.max(0, creature.health - healthDecay);

    creature.updatedAt = now;
  }

  /**
   * Apply care action effects
   */
  private applyCareAction(creature: StreakCreature, action: string): Record<string, number> {
    const effects: Record<string, number> = {};

    switch (action) {
      case 'FEED':
        creature.happiness = Math.min(CREATURE_CONFIG.MAX_HAPPINESS, creature.happiness + 20);
        effects.happiness = 20;
        break;
      case 'PLAY':
        creature.bond = Math.min(CREATURE_CONFIG.MAX_BOND, creature.bond + 15);
        effects.bond = 15;
        break;
      case 'TRAIN':
        creature.experience = Math.min(CREATURE_CONFIG.MAX_EXPERIENCE, creature.experience + 30);
        effects.experience = 30;
        break;
      case 'GROOM':
        creature.health = Math.min(CREATURE_CONFIG.MAX_HEALTH, creature.health + 25);
        effects.health = 25;
        break;
    }

    return effects;
  }

  /**
   * Get last action time for cooldown check
   */
  private getLastActionTime(creature: StreakCreature, action: string): number | null {
    switch (action) {
      case 'FEED':
        return creature.lastFedAt;
      case 'PLAY':
        return creature.lastPlayedAt;
      case 'TRAIN':
        return creature.lastTrainedAt;
      case 'GROOM':
        return creature.lastGroomedAt;
      default:
        return null;
    }
  }

  /**
   * Set last action time
   */
  private setLastActionTime(creature: StreakCreature, action: string, time: number): void {
    switch (action) {
      case 'FEED':
        creature.lastFedAt = time;
        break;
      case 'PLAY':
        creature.lastPlayedAt = time;
        break;
      case 'TRAIN':
        creature.lastTrainedAt = time;
        break;
      case 'GROOM':
        creature.lastGroomedAt = time;
        break;
    }
  }

  /**
   * Check if user can afford action cost
   */
  private async checkCanAfford(userId: string, cost: Record<string, number>): Promise<boolean> {
    // This would integrate with economy service
    // For now, assume user can afford
    return true;
  }

  /**
   * Deduct cost from user resources
   */
  private async deductCost(userId: string, cost: Record<string, number>): Promise<void> {
    // This would integrate with economy service
    // For now, just emit an event
    eventBus.publish('economy:currency_spent', {
      userId,
      currency: Object.keys(cost)[0] as string,
      amount: Object.values(cost)[0],
      description: 'Creature care cost',
      newBalance: 0,
    });
  }
}