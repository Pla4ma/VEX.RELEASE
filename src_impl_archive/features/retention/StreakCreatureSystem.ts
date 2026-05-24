import { eventBus } from "../../events";
import { featureFlags } from "../../feature-flags/FeatureFlagEngine";
import {
  applyCareAction,
  calculateExperienceGain,
  calculateHappinessChange,
  calculateStreakIncrement,
  decayCreatureStats,
  getExperienceNeeded,
  updateSessionPatterns,
  type CreatureSessionDataInput,
} from "./streak-creature-helpers";
import {
  CREATURE_CONFIG,
  type CreatureCareAction,
  type CreatureStats,
  type StreakCreature,
} from "./streak-creature-types";
import {
  buildCreatureStats,
  canAffordCreatureCare,
  checkCreatureEvolution,
  createInitialCreature,
  deductCreatureCareCost,
  getLastActionTime,
  setLastActionTime,
  updatePersonalityTraits,
} from "./streak-creature-service-logic";
export class StreakCreatureService {
  private creatures: Map<string, StreakCreature> = new Map();
  private careActions: Map<string, CreatureCareAction[]> = new Map();
  static isEnabled(): boolean {
    return featureFlags.isEnabled("streak_creature_system");
  }
  async initializeCreature(
    userId: string,
    name?: string,
  ): Promise<StreakCreature> {
    const existing = this.creatures.get(userId);
    if (existing) return existing;
    const now = Date.now();
    const creature = createInitialCreature(userId, now, name);
    this.creatures.set(userId, creature);
    this.careActions.set(creature.id, []);
    eventBus.publish("creature:adopted", {
      userId,
      creatureId: creature.id,
      name: creature.name,
    });
    return creature;
  }
  async updateCreatureFromSession(
    userId: string,
    sessionData: CreatureSessionDataInput,
  ): Promise<void> {
    const creature =
      this.creatures.get(userId) ?? (await this.initializeCreature(userId));
    creature.totalSessions += 1;
    creature.updatedAt = Date.now();
    updateSessionPatterns(creature, sessionData);
    creature.currentStreak += calculateStreakIncrement(sessionData);
    creature.bestStreak = Math.max(creature.bestStreak, creature.currentStreak);
    creature.experience = Math.min(
      CREATURE_CONFIG.MAX_EXPERIENCE,
      creature.experience + calculateExperienceGain(creature, sessionData),
    );
    if (creature.experience >= getExperienceNeeded(creature.level)) {
      await this.levelUpCreature(creature);
    }
    creature.happiness = Math.max(
      0,
      Math.min(
        CREATURE_CONFIG.MAX_HAPPINESS,
        creature.happiness + calculateHappinessChange(sessionData),
      ),
    );
    await this.applyEvolutionIfReady(creature);
    updatePersonalityTraits(creature);
    decayCreatureStats(creature);
    this.creatures.set(userId, creature);
    eventBus.publish("creature:updated", {
      userId,
      creatureId: creature.id,
      stage: creature.stage,
      level: creature.level,
    });
  }
  async performCareAction(
    userId: string,
    action: "FEED" | "PLAY" | "TRAIN" | "GROOM",
  ): Promise<{ success: boolean; creature?: StreakCreature; error?: string }> {
    const creature = this.creatures.get(userId);
    if (!creature) return { success: false, error: "Creature not found" };
    const actionConfig = CREATURE_CONFIG.CARE_ACTIONS[action];
    const now = Date.now();
    const lastActionTime = getLastActionTime(creature, action);
    if (lastActionTime && now - lastActionTime < actionConfig.cooldown) {
      const remaining = Math.ceil(
        (actionConfig.cooldown - (now - lastActionTime)) / (1000 * 60),
      );
      return {
        success: false,
        error: `Action available in ${remaining} minutes`,
      };
    }
    if (!(await canAffordCreatureCare(userId, actionConfig.cost))) {
      return { success: false, error: "Insufficient resources" };
    }
    const effect = applyCareAction(creature, action);
    await deductCreatureCareCost(userId, actionConfig.cost);
    setLastActionTime(creature, action, now);
    const careAction = {
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
    eventBus.publish("creature:care_action", {
      userId,
      creatureId: creature.id,
      action: careAction.action,
      effect,
    });
    return { success: true, creature };
  }
  getCreatureStats(userId: string): CreatureStats | null {
    const creature = this.creatures.get(userId);
    if (!creature) return null;
    return buildCreatureStats(creature);
  }
  getCareHistory(userId: string, limit = 50): CreatureCareAction[] {
    const creature = this.creatures.get(userId);
    if (!creature) return [];
    const actions = this.careActions.get(creature.id) ?? [];
    return actions
      .sort((a, b) => b.performedAt - a.performedAt)
      .slice(0, limit);
  }
  async setCreatureNickname(
    userId: string,
    nickname: string,
  ): Promise<{ success: boolean; error?: string }> {
    const creature = this.creatures.get(userId);
    if (!creature) return { success: false, error: "Creature not found" };
    if (nickname.length > 20)
      return { success: false, error: "Nickname too long (max 20 characters)" };
    creature.nickname = nickname;
    creature.updatedAt = Date.now();
    this.creatures.set(userId, creature);
    eventBus.publish("creature:nickname_set", {
      userId,
      creatureId: creature.id,
      nickname,
    });
    return { success: true };
  }
  private async levelUpCreature(creature: StreakCreature): Promise<void> {
    creature.level += 1;
    creature.experience = 0;
    creature.bond = Math.min(CREATURE_CONFIG.MAX_BOND, creature.bond + 10);
    eventBus.publish("creature:level_up", {
      creatureId: creature.id,
      newLevel: creature.level,
      bond: creature.bond,
    });
  }
  private async applyEvolutionIfReady(creature: StreakCreature): Promise<void> {
    const evolutionResult = checkCreatureEvolution(creature);
    if (!evolutionResult.evolved || !evolutionResult.newStage) return;
    creature.stage = evolutionResult.newStage;
    creature.lastEvolutionAt = Date.now();
    if (evolutionResult.newAbilities) {
      creature.unlockedAbilities.push(...evolutionResult.newAbilities);
      creature.abilities = [...creature.unlockedAbilities];
    }
  }
}
export {
  createStreakCreatureService,
  getStreakCreatureService,
} from "./streak-creature-service-singleton";
