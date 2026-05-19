import { featureFlags } from '../../feature-flags/FeatureFlagEngine';
import { eventBus } from '../../events';
import {
  StreakCreature, CreatureCareAction, PersonalityTrait,
  CreatureEvolutionResult, CreatureStats, CreatureStage,
  CREATURE_CONFIG, EVOLUTION_REQUIREMENTS,
} from './streak-creature-types';

interface SessionDataInput {
  duration: number;
  purity: number;
  mode: string;
  timestamp: number;
  isSquadSession?: boolean;
}

export class StreakCreatureService {
  private creatures: Map<string, StreakCreature> = new Map();
  private careActions: Map<string, CreatureCareAction[]> = new Map();

  static isEnabled(): boolean {
    return featureFlags.isEnabled('streak_creature_system');
  }

  async initializeCreature(userId: string, name?: string): Promise<StreakCreature> {
    const existing = this.creatures.get(userId);
    if (existing) return existing;

    const now = Date.now();
    const creature: StreakCreature = {
      id: `creature_${userId}_${now}`,
      userId,
      name: name ?? this.generateCreatureName(),
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
    eventBus.publish('creature:adopted', { userId, creatureId: creature.id, name: creature.name });
    return creature;
  }

  async updateCreatureFromSession(userId: string, sessionData: SessionDataInput): Promise<void> {
    let creature = this.creatures.get(userId);
    if (!creature) {
      creature = await this.initializeCreature(userId);
      if (!creature) return;
    }

    creature.totalSessions += 1;
    creature.updatedAt = Date.now();
    this.updateSessionPatterns(creature, sessionData);

    const streakIncrement = this.calculateStreakIncrement(sessionData);
    creature.currentStreak += streakIncrement;
    creature.bestStreak = Math.max(creature.bestStreak, creature.currentStreak);

    const experienceGained = this.calculateExperienceGain(creature, sessionData);
    creature.experience = Math.min(CREATURE_CONFIG.MAX_EXPERIENCE, creature.experience + experienceGained);

    const experienceNeeded = this.getExperienceNeeded(creature.level);
    if (creature.experience >= experienceNeeded) {
      await this.levelUpCreature(creature);
    }

    const happinessChange = this.calculateHappinessChange(sessionData);
    creature.happiness = Math.max(0, Math.min(CREATURE_CONFIG.MAX_HAPPINESS, creature.happiness + happinessChange));

    const evolutionResult = await this.checkEvolution(creature);
    if (evolutionResult.evolved && evolutionResult.newStage) {
      creature.stage = evolutionResult.newStage;
      creature.lastEvolutionAt = Date.now();
      if (evolutionResult.newAbilities) {
        creature.unlockedAbilities.push(...evolutionResult.newAbilities);
        creature.abilities = [...creature.unlockedAbilities];
      }
    }

    this.updatePersonalityTraits(creature);
    this.decayCreatureStats(creature);
    this.creatures.set(userId, creature);
    eventBus.publish('creature:updated', { userId, creatureId: creature.id, stage: creature.stage, level: creature.level });
  }

  async performCareAction(
    userId: string,
    action: 'FEED' | 'PLAY' | 'TRAIN' | 'GROOM',
  ): Promise<{ success: boolean; creature?: StreakCreature; error?: string }> {
    const creature = this.creatures.get(userId);
    if (!creature) return { success: false, error: 'Creature not found' };

    const actionConfig = CREATURE_CONFIG.CARE_ACTIONS[action];
    const now = Date.now();
    const lastActionTime = this.getLastActionTime(creature, action);
    if (lastActionTime && now - lastActionTime < actionConfig.cooldown) {
      const remainingMinutes = Math.ceil((actionConfig.cooldown - (now - lastActionTime)) / (1000 * 60));
      return { success: false, error: `Action available in ${remainingMinutes} minutes` };
    }

    const canAfford = await this.checkCanAfford(userId, actionConfig.cost);
    if (!canAfford) return { success: false, error: 'Insufficient resources' };

    const effect = this.applyCareAction(creature, action);
    await this.deductCost(userId, actionConfig.cost);
    this.setLastActionTime(creature, action, now);

    const careAction: CreatureCareAction = {
      id: `care_${creature.id}_${now}`,
      creatureId: creature.id,
      userId,
      action,
      performedAt: now,
      effect,
      cost: actionConfig.cost,
    };

    const actions = this.careActions.get(creature.id) ?? [];
    actions.push(careAction);
    this.careActions.set(creature.id, actions);
    this.creatures.set(userId, creature);

    eventBus.publish('creature:care_action', { userId, creatureId: creature.id, action: careAction.action, effect: careAction.effect });
    return { success: true, creature };
  }

  getCreatureStats(userId: string): CreatureStats | null {
    const creature = this.creatures.get(userId);
    if (!creature) return null;

    const nextStage = this.getNextStage(creature.stage);
    const reqs = nextStage ? EVOLUTION_REQUIREMENTS[nextStage] : undefined;

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
        stage: nextStage ?? creature.stage,
        progress: creature.evolutionProgress,
        requirements: reqs ?? {},
      },
    };
  }

  getCareHistory(userId: string, limit = 50): CreatureCareAction[] {
    const creature = this.creatures.get(userId);
    if (!creature) return [];
    const actions = this.careActions.get(creature.id) ?? [];
    return actions.sort((a, b) => b.performedAt - a.performedAt).slice(0, limit);
  }

  async setCreatureNickname(userId: string, nickname: string): Promise<{ success: boolean; error?: string }> {
    const creature = this.creatures.get(userId);
    if (!creature) return { success: false, error: 'Creature not found' };
    if (nickname.length > 20) return { success: false, error: 'Nickname too long (max 20 characters)' };
    creature.nickname = nickname;
    creature.updatedAt = Date.now();
    this.creatures.set(userId, creature);
    eventBus.publish('creature:nickname_set', { userId, creatureId: creature.id, nickname });
    return { success: true };
  }

  private generateCreatureName(): string {
    const prefixes = ['Focus', 'Zen', 'Clarity', 'Mindful', 'Calm', 'Bright', 'Smart', 'Wise'];
    const suffixes = ['Spirit', 'Companion', 'Friend', 'Guardian', 'Helper', 'Buddy', 'Pal', 'Mate'];
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)]!;
    const suffix = suffixes[Math.floor(Math.random() * suffixes.length)]!;
    return `${prefix} ${suffix}`;
  }

  private updateSessionPatterns(creature: StreakCreature, session: SessionDataInput): void {
    const hour = new Date(session.timestamp).getHours();
    if (hour >= 5 && hour < 12) {
      creature.sessionPatterns.morning_sessions = (creature.sessionPatterns.morning_sessions ?? 0) + 1;
    } else if (hour >= 20 || hour < 2) {
      creature.sessionPatterns.evening_sessions = (creature.sessionPatterns.evening_sessions ?? 0) + 1;
    }
    if (session.duration >= 60) {
      creature.sessionPatterns.long_sessions = (creature.sessionPatterns.long_sessions ?? 0) + 1;
    }
    creature.sessionPatterns[`mode_${session.mode}`] = (creature.sessionPatterns[`mode_${session.mode}`] ?? 0) + 1;
    if (session.isSquadSession) {
      creature.sessionPatterns.squad_sessions = (creature.sessionPatterns.squad_sessions ?? 0) + 1;
    }
  }

  private calculateStreakIncrement(session: SessionDataInput): number {
    return session.purity >= 70 && session.duration >= 15 ? 1 : 0;
  }

  private calculateExperienceGain(creature: StreakCreature, session: SessionDataInput): number {
    let baseXP = 10;
    baseXP += Math.floor(session.duration / 10) * 5;
    baseXP += Math.floor(session.purity / 10) * 3;
    const multiplier: Record<string, number> = { EGG: 1.0, BABY: 1.2, TEEN: 1.5, ADULT: 1.8, EPIC: 2.0 };
    return Math.floor(baseXP * (multiplier[creature.stage] ?? 1.0));
  }

  private getExperienceNeeded(level: number): number {
    return level * 100;
  }

  private async levelUpCreature(creature: StreakCreature): Promise<void> {
    creature.level += 1;
    creature.experience = 0;
    creature.bond = Math.min(CREATURE_CONFIG.MAX_BOND, creature.bond + 10);
    eventBus.publish('creature:level_up', { creatureId: creature.id, newLevel: creature.level, bond: creature.bond });
  }

  private calculateHappinessChange(session: SessionDataInput): number {
    let change = 0;
    if (session.purity >= 90) change += 5;
    else if (session.purity >= 75) change += 2;
    else if (session.purity < 50) change -= 3;
    if (session.duration >= 60) change += 3;
    return change;
  }

  private async checkEvolution(creature: StreakCreature): Promise<CreatureEvolutionResult> {
    const nextStage = this.getNextStage(creature.stage);
    if (!nextStage) return { evolved: false, message: 'Already at final stage' };

    const reqs = EVOLUTION_REQUIREMENTS[nextStage];
    if (!reqs) return { evolved: false, message: 'No requirements defined' };

    const avgPurity = this.getAveragePurity(creature);
    const meetsRequirements =
      creature.currentStreak >= reqs.streak &&
      creature.totalSessions >= reqs.totalSessions &&
      avgPurity >= reqs.avgPurity;

    if (meetsRequirements) {
      const stageConfig = CREATURE_CONFIG.EVOLUTION_STAGES[nextStage];
      return {
        evolved: true,
        newStage: nextStage,
        newAbilities: [...stageConfig.abilities],
        message: `${creature.name} evolved into ${stageConfig.name}!`,
      };
    }

    creature.evolutionProgress = this.calculateEvolutionProgress(creature, reqs);
    return { evolved: false, message: 'Evolution requirements not met yet' };
  }

  private getNextStage(current: CreatureStage): CreatureStage | null {
    const stages: CreatureStage[] = ['EGG', 'BABY', 'TEEN', 'ADULT', 'EPIC'];
    const idx = stages.indexOf(current);
    return idx < stages.length - 1 ? stages[idx + 1]! : null;
  }

  private calculateEvolutionProgress(
    creature: StreakCreature,
    reqs: { streak: number; totalSessions: number; avgPurity: number },
  ): number {
    const streakProgress = Math.min(100, (creature.currentStreak / reqs.streak) * 40);
    const sessionProgress = Math.min(100, (creature.totalSessions / reqs.totalSessions) * 30);
    const purityProgress = Math.min(100, (this.getAveragePurity(creature) / reqs.avgPurity) * 30);
    return Math.floor((streakProgress + sessionProgress + purityProgress) / 3);
  }

  private getAveragePurity(creature: StreakCreature): number {
    return creature.currentStreak > 10 ? 85 : 75;
  }

  private updatePersonalityTraits(creature: StreakCreature): void {
    if (creature.totalSessions < 5) return;
    const entries = Object.entries(creature.sessionPatterns)
      .sort(([, a], [, b]) => b - a);
    const dominantPattern = entries[0]?.[0];
    if (dominantPattern && !creature.primaryTrait) {
      const trait = this.getTraitFromPattern(dominantPattern);
      if (trait) creature.primaryTrait = trait;
    }
    const secondPattern = entries[1]?.[0];
    if (secondPattern && !creature.secondaryTrait && secondPattern !== dominantPattern) {
      const trait = this.getTraitFromPattern(secondPattern);
      if (trait) creature.secondaryTrait = trait;
    }
  }

  private getTraitFromPattern(pattern: string): PersonalityTrait | null {
    const map: Record<string, PersonalityTrait> = {
      morning_sessions: 'EARLY_BIRD',
      evening_sessions: 'NIGHT_OWL',
      long_sessions: 'INTENSE',
      squad_sessions: 'SOCIAL',
    };
    return map[pattern] ?? null;
  }

  private decayCreatureStats(creature: StreakCreature): void {
    const hoursSince = (Date.now() - creature.updatedAt) / (1000 * 60 * 60);
    if (hoursSince < 24) return;
    creature.happiness = Math.max(0, creature.happiness - Math.floor(hoursSince / 24) * 5);
    creature.health = Math.max(0, creature.health - Math.floor(hoursSince / 48) * 3);
    creature.updatedAt = Date.now();
  }

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

  private getLastActionTime(creature: StreakCreature, action: string): number | null {
    switch (action) {
      case 'FEED': return creature.lastFedAt;
      case 'PLAY': return creature.lastPlayedAt;
      case 'TRAIN': return creature.lastTrainedAt;
      case 'GROOM': return creature.lastGroomedAt;
      default: return null;
    }
  }

  private setLastActionTime(creature: StreakCreature, action: string, time: number): void {
    switch (action) {
      case 'FEED': creature.lastFedAt = time; break;
      case 'PLAY': creature.lastPlayedAt = time; break;
      case 'TRAIN': creature.lastTrainedAt = time; break;
      case 'GROOM': creature.lastGroomedAt = time; break;
    }
  }

  private async checkCanAfford(_userId: string, _cost: Record<string, number>): Promise<boolean> {
    return true;
  }

  private async deductCost(userId: string, cost: Record<string, number>): Promise<void> {
    const currency = Object.keys(cost)[0] ?? 'unknown';
    const amount = Object.values(cost)[0] ?? 0;
    eventBus.publish('economy:currency_spent', {
      userId, currency, amount, description: 'Creature care cost', newBalance: 0,
    });
  }
}

let streakCreatureService: StreakCreatureService | null = null;

export function createStreakCreatureService(): StreakCreatureService {
  return new StreakCreatureService();
}

export function getStreakCreatureService(): StreakCreatureService {
  if (!streakCreatureService) {
    streakCreatureService = new StreakCreatureService();
  }
  return streakCreatureService;
}
