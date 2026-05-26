import type { CalculateDamageInput } from './schemas';

const PERFECTIONIST_ID = 'boss-perfectionist';
const DOOMSCROLLER_ID = 'boss-doomscroller';
const MONDAY_DEMON_ID = 'boss-monday-demon';
const BURNOUT_BEAST_ID = 'boss-burnout-beast';
const MIDNIGHT_PROCRASTINATOR_ID = 'boss-midnight-procrastinator';

function getSessionHour(input: CalculateDamageInput): number {
  return input.currentHour ?? new Date().getHours();
}

function getSessionDay(input: CalculateDamageInput): number {
  return input.currentDay ?? new Date().getDay();
}

function applyDoomscrollerPenalty(damage: number, backgroundEvents: number): number {
  if (backgroundEvents <= 0) {
    return damage;
  }

  const penaltyMultiplier = Math.max(0.25, 1 - backgroundEvents * 0.25);
  return Math.floor(damage * penaltyMultiplier);
}

export function applyBossDamageRules(
  baseDamage: number,
  input: CalculateDamageInput,
): number {
  if (!input.bossId) {
    return baseDamage;
  }

  if (input.bossId === PERFECTIONIST_ID && input.sessionQuality < 95) {
    return 0;
  }

  if (input.bossId === BURNOUT_BEAST_ID && input.squadMultiplier < 2) {
    return 0;
  }

  let adjustedDamage = baseDamage;

  if (input.bossId === DOOMSCROLLER_ID) {
    adjustedDamage = applyDoomscrollerPenalty(
      adjustedDamage,
      input.backgroundEvents ?? 0,
    );
  }

  if (input.bossId === MONDAY_DEMON_ID && getSessionDay(input) === 1) {
    adjustedDamage *= getSessionHour(input) < 12 ? 1.5 : 1.1;
  }

  if (input.bossId === MIDNIGHT_PROCRASTINATOR_ID) {
    const hour = getSessionHour(input);
    if (hour >= 22 || hour < 2) {
      adjustedDamage *= 1.3;
    }
  }

  return Math.max(1, Math.round(adjustedDamage));
}
