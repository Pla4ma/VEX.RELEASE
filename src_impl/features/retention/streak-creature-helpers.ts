import {
  CREATURE_CONFIG,
  type CreatureStage,
  type PersonalityTrait,
  type StreakCreature,
} from "./streak-creature-types";

export interface CreatureSessionDataInput {
  duration: number;
  purity: number;
  mode: string;
  timestamp: number;
  isSquadSession?: boolean;
}

export function generateCreatureName(): string {
  const prefixes = ["Focus", "Zen", "Clarity", "Mindful", "Calm", "Bright", "Smart", "Wise"];
  const suffixes = ["Spirit", "Companion", "Friend", "Guardian", "Helper", "Buddy", "Pal", "Mate"];
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)] ?? "Focus";
  const suffix = suffixes[Math.floor(Math.random() * suffixes.length)] ?? "Spirit";
  return `${prefix} ${suffix}`;
}

export function updateSessionPatterns(
  creature: StreakCreature,
  session: CreatureSessionDataInput,
): void {
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

export function calculateStreakIncrement(session: CreatureSessionDataInput): number {
  return session.purity >= 70 && session.duration >= 15 ? 1 : 0;
}

export function calculateExperienceGain(
  creature: StreakCreature,
  session: CreatureSessionDataInput,
): number {
  let baseXP = 10;
  baseXP += Math.floor(session.duration / 10) * 5;
  baseXP += Math.floor(session.purity / 10) * 3;
  const multiplier: Record<CreatureStage, number> = {
    EGG: 1,
    BABY: 1.2,
    TEEN: 1.5,
    ADULT: 1.8,
    EPIC: 2,
  };
  return Math.floor(baseXP * multiplier[creature.stage]);
}

export function getExperienceNeeded(level: number): number {
  return level * 100;
}

export function calculateHappinessChange(session: CreatureSessionDataInput): number {
  let change = 0;
  if (session.purity >= 90) change += 5;
  else if (session.purity >= 75) change += 2;
  else if (session.purity < 50) change -= 3;
  if (session.duration >= 60) change += 3;
  return change;
}

export function getNextStage(current: CreatureStage): CreatureStage | null {
  const stages: CreatureStage[] = ["EGG", "BABY", "TEEN", "ADULT", "EPIC"];
  const idx = stages.indexOf(current);
  return idx < stages.length - 1 ? stages[idx + 1] ?? null : null;
}

export function getAveragePurity(creature: StreakCreature): number {
  return creature.currentStreak > 10 ? 85 : 75;
}

export function calculateEvolutionProgress(
  creature: StreakCreature,
  reqs: { streak: number; totalSessions: number; avgPurity: number },
): number {
  const streakProgress = Math.min(100, (creature.currentStreak / reqs.streak) * 40);
  const sessionProgress = Math.min(100, (creature.totalSessions / reqs.totalSessions) * 30);
  const purityProgress = Math.min(100, (getAveragePurity(creature) / reqs.avgPurity) * 30);
  return Math.floor((streakProgress + sessionProgress + purityProgress) / 3);
}

export function getTraitFromPattern(pattern: string): PersonalityTrait | null {
  const map: Record<string, PersonalityTrait> = {
    morning_sessions: "EARLY_BIRD",
    evening_sessions: "NIGHT_OWL",
    long_sessions: "INTENSE",
    squad_sessions: "SOCIAL",
  };
  return map[pattern] ?? null;
}

export function decayCreatureStats(creature: StreakCreature): void {
  const hoursSince = (Date.now() - creature.updatedAt) / (1000 * 60 * 60);
  if (hoursSince < 24) return;
  creature.happiness = Math.max(0, creature.happiness - Math.floor(hoursSince / 24) * 5);
  creature.health = Math.max(0, creature.health - Math.floor(hoursSince / 48) * 3);
  creature.updatedAt = Date.now();
}

export function applyCareAction(creature: StreakCreature, action: string): Record<string, number> {
  const effects: Record<string, number> = {};
  if (action === "FEED") {
    creature.happiness = Math.min(CREATURE_CONFIG.MAX_HAPPINESS, creature.happiness + 20);
    effects.happiness = 20;
  } else if (action === "PLAY") {
    creature.bond = Math.min(CREATURE_CONFIG.MAX_BOND, creature.bond + 15);
    effects.bond = 15;
  } else if (action === "TRAIN") {
    creature.experience = Math.min(CREATURE_CONFIG.MAX_EXPERIENCE, creature.experience + 30);
    effects.experience = 30;
  } else if (action === "GROOM") {
    creature.health = Math.min(CREATURE_CONFIG.MAX_HEALTH, creature.health + 25);
    effects.health = 25;
  }
  return effects;
}
