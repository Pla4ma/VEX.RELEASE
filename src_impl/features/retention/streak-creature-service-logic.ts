import { eventBus } from "../../events";
import {
  calculateEvolutionProgress,
  generateCreatureName,
  getAveragePurity,
  getNextStage,
  getTraitFromPattern,
} from "./streak-creature-helpers";
import {
  CREATURE_CONFIG,
  EVOLUTION_REQUIREMENTS,
  type CreatureEvolutionResult,
  type CreatureStats,
  type PersonalityTrait,
  type StreakCreature,
} from "./streak-creature-types";

export function createInitialCreature(
  userId: string,
  now: number,
  name?: string,
): StreakCreature {
  return {
    id: `creature_${userId}_${now}`,
    userId,
    name: name ?? generateCreatureName(),
    stage: "EGG",
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
    abilities: ["potential"],
    unlockedAbilities: ["potential"],
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
}

export function buildCreatureStats(creature: StreakCreature): CreatureStats {
  const nextStage = getNextStage(creature.stage);
  const reqs = nextStage ? EVOLUTION_REQUIREMENTS[nextStage] : undefined;
  const personality = [creature.primaryTrait, creature.secondaryTrait].filter(
    isPersonalityTrait,
  );
  return {
    stage: creature.stage,
    level: creature.level,
    experience: creature.experience,
    happiness: creature.happiness,
    health: creature.health,
    bond: creature.bond,
    abilities: creature.abilities,
    personality,
    nextEvolution: {
      stage: nextStage ?? creature.stage,
      progress: creature.evolutionProgress,
      requirements: reqs ?? {},
    },
  };
}

export function checkCreatureEvolution(
  creature: StreakCreature,
): CreatureEvolutionResult {
  const nextStage = getNextStage(creature.stage);
  if (!nextStage) return { evolved: false, message: "Already at final stage" };
  const reqs = EVOLUTION_REQUIREMENTS[nextStage];
  if (!reqs) return { evolved: false, message: "No requirements defined" };
  const meetsRequirements =
    creature.currentStreak >= reqs.streak &&
    creature.totalSessions >= reqs.totalSessions &&
    getAveragePurity(creature) >= reqs.avgPurity;
  if (!meetsRequirements) {
    creature.evolutionProgress = calculateEvolutionProgress(creature, reqs);
    return { evolved: false, message: "Evolution requirements not met yet" };
  }
  const stageConfig = CREATURE_CONFIG.EVOLUTION_STAGES[nextStage];
  return {
    evolved: true,
    newStage: nextStage,
    newAbilities: [...stageConfig.abilities],
    message: `${creature.name} evolved into ${stageConfig.name}!`,
  };
}

export function updatePersonalityTraits(creature: StreakCreature): void {
  if (creature.totalSessions < 5) return;
  const entries = Object.entries(creature.sessionPatterns).sort(
    ([, a], [, b]) => b - a,
  );
  const dominantPattern = entries[0]?.[0];
  if (dominantPattern && !creature.primaryTrait) {
    creature.primaryTrait = getTraitFromPattern(dominantPattern);
  }
  const secondPattern = entries[1]?.[0];
  if (
    secondPattern &&
    !creature.secondaryTrait &&
    secondPattern !== dominantPattern
  ) {
    creature.secondaryTrait = getTraitFromPattern(secondPattern);
  }
}

export function getLastActionTime(
  creature: StreakCreature,
  action: string,
): number | null {
  if (action === "FEED") return creature.lastFedAt;
  if (action === "PLAY") return creature.lastPlayedAt;
  if (action === "TRAIN") return creature.lastTrainedAt;
  if (action === "GROOM") return creature.lastGroomedAt;
  return null;
}

export function setLastActionTime(
  creature: StreakCreature,
  action: string,
  time: number,
): void {
  if (action === "FEED") creature.lastFedAt = time;
  else if (action === "PLAY") creature.lastPlayedAt = time;
  else if (action === "TRAIN") creature.lastTrainedAt = time;
  else if (action === "GROOM") creature.lastGroomedAt = time;
}

export async function canAffordCreatureCare(
  _userId: string,
  _cost: Record<string, number>,
): Promise<boolean> {
  return true;
}

export async function deductCreatureCareCost(
  userId: string,
  cost: Record<string, number>,
): Promise<void> {
  const currency = Object.keys(cost)[0] ?? "unknown";
  const amount = Object.values(cost)[0] ?? 0;
  eventBus.publish("economy:currency_spent", {
    userId,
    currency,
    amount,
    description: "Creature care cost",
    newBalance: 0,
  });
}

function isPersonalityTrait(
  value: PersonalityTrait | null,
): value is PersonalityTrait {
  return value !== null;
}
