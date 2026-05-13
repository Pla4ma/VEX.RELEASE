import { eventBus } from "../../events";
import * as Sentry from "@sentry/react-native";
import { z } from "zod";


export function selectAttackPattern(currentPhase: BossPhase, userLevel: number): BossAttackPattern {
  const patterns = Object.keys(ATTACK_PATTERNS) as BossAttackPattern[];

  // Weight patterns based on phase
  let weights: number[];
  switch (currentPhase) {
    case 'CALM':
      weights = [0.5, 0.2, 0.2, 0.1, 0.0]; // Easier patterns
      break;
    case 'AGITATED':
      weights = [0.3, 0.3, 0.2, 0.2, 0.0];
      break;
    case 'ENRAGED':
      weights = [0.1, 0.3, 0.2, 0.3, 0.1];
      break;
    case 'DESPERATE':
      weights = [0.0, 0.2, 0.2, 0.3, 0.3]; // Hardest patterns
      break;
  }

  // Weighted random selection
  const totalWeight = weights.reduce((a, b) => a + b, 0);
  let random = Math.random() * totalWeight;

  for (let i = 0; i < patterns.length; i++) {
    random -= weights[i];
    if (random <= 0) {
      return patterns[i];
    }
  }

  return patterns[0];
}

export function executeCombatAbility(encounter: ActiveEncounter, abilityId: string, userStreakDays: number, now: number = Date.now()): CombatActionResult {
  const ability = encounter.availableAbilities.find((a) => a.id === abilityId);

  if (!ability) {
    return {
      success: false,
      damageDealt: 0,
      energyConsumed: 0,
      bossHealthRemaining: encounter.bossCurrentHealth,
      newPhase: encounter.currentPhase,
      comboBonus: 0,
      message: 'Ability not available',
    };
  }

  // Check cooldown
  const cooldownEnds = encounter.abilityCooldowns[abilityId] || 0;
  if (now < cooldownEnds) {
    return {
      success: false,
      damageDealt: 0,
      energyConsumed: 0,
      bossHealthRemaining: encounter.bossCurrentHealth,
      newPhase: encounter.currentPhase,
      comboBonus: 0,
      message: 'Ability on cooldown',
    };
  }

  // Check energy
  if (encounter.userCurrentFocusEnergy < ability.focusEnergyCost) {
    return {
      success: false,
      damageDealt: 0,
      energyConsumed: 0,
      bossHealthRemaining: encounter.bossCurrentHealth,
      newPhase: encounter.currentPhase,
      comboBonus: 0,
      message: 'Not enough Focus Energy!',
    };
  }

  // Check requirements
  if (userStreakDays < ability.requiresStreak) {
    return {
      success: false,
      damageDealt: 0,
      energyConsumed: 0,
      bossHealthRemaining: encounter.bossCurrentHealth,
      newPhase: encounter.currentPhase,
      comboBonus: 0,
      message: `Requires ${ability.requiresStreak} day streak`,
    };
  }

  // Calculate damage with phase multiplier
  const phaseMultiplier = getPhaseMultiplier(encounter.currentPhase);
  const damageDealt = Math.floor(ability.baseDamage * phaseMultiplier);

  // Apply damage
  const newHealth = Math.max(0, encounter.bossCurrentHealth - damageDealt);
  const newPhase = calculateBossPhase(newHealth, encounter.bossMaxHealth, now - encounter.encounterStartedAt, encounter.expiresAt - encounter.encounterStartedAt);

  // Update cooldown
  const updatedCooldowns = {
    ...encounter.abilityCooldowns,
    [abilityId]: now + ability.cooldownSeconds * 1000,
  };

  // Calculate combo (multiple hits in succession)
  const timeSinceLastAction = encounter.lastUserActionAt ? now - encounter.lastUserActionAt : Infinity;
  const comboBonus = timeSinceLastAction < 10000 ? 0.2 : 0; // 20% bonus for <10s between actions

  // Publish event
  eventBus.publish('boss:ability_used', {
    userId: encounter.userId,
    encounterId: encounter.id,
    abilityId,
    damageDealt,
    newHealth,
    comboBonus,
  });

  return {
    success: true,
    damageDealt,
    energyConsumed: ability.focusEnergyCost,
    bossHealthRemaining: newHealth,
    newPhase,
    comboBonus,
    message: `${ability.name} dealt ${damageDealt} damage!`,
  };
}

export function resolveAttackPattern(
  encounter: ActiveEncounter,
  userCompletedSprint: boolean,
  userDidNotPause: boolean,
  now: number = Date.now(),
): {
  hit: boolean;
  damageTaken: number;
  dodged: boolean;
  message: string;
} {
  if (!encounter.currentAttackPattern) {
    return { hit: false, damageTaken: 0, dodged: false, message: '' };
  }

  const pattern = ATTACK_PATTERNS[encounter.currentAttackPattern];

  // Check if pattern duration expired
  const patternElapsed = encounter.attackPatternStartedAt ? now - encounter.attackPatternStartedAt : 0;

  if (patternElapsed < pattern.durationMs) {
    return { hit: false, damageTaken: 0, dodged: false, message: pattern.description };
  }

  // Determine if user dodged based on mechanic
  let dodged = false;
  switch (encounter.currentAttackPattern) {
    case 'DISTRACTION_WAVE':
      dodged = userCompletedSprint;
      break;
    case 'PROCRASTINATION_BEAM':
      dodged = userDidNotPause;
      break;
    // Add other pattern logic...
    default:
      dodged = Math.random() > 0.5; // Fallback
  }

  if (dodged) {
    return {
      hit: false,
      damageTaken: 0,
      dodged: true,
      message: `Dodged ${pattern.name}!`,
    };
  }

  return {
    hit: true,
    damageTaken: pattern.damageOnHit,
    dodged: false,
    message: `Hit by ${pattern.name}! -${pattern.damageOnHit} Focus Energy`,
  };
}