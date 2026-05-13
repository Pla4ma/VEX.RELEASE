/**
 * Companion Bond System
 *
 * Transforms the companion from a mood face into an emotional anchor.
 * The companion remembers, adapts, and grows a relationship with the user.
 *
 * Bond mechanics:
 * - Bond level: 0-100, increases with positive interactions
 * - Bond effects: higher bond = more expressive companion, better bonuses
 * - Bond decay: very slow (doesn't punish absence harshly)
 * - Memory: companion remembers last 5 significant moments
 * - Trust: built through consistency, recoverable after absence
 */

import { getDefaultStorageAdapter } from '../../persistence/MMKVStorageAdapter';

// ── Types ────────────────────────────────────────────────────────────────────
export type MemoryType =
  | 'FIRST_SESSION'
  | 'LONGEST_FOCUS'
  | 'STREAK_MILESTONE'
  | 'BOSS_DEFEAT'
  | 'PERFECT_SESSION'
  | 'COMEBACK'
  | 'DAILY_RITUAL'
  | 'EVOLUTION'
  | 'DUEL_WIN'
  | 'MISSED_YOU';

const MAX_MEMORIES = 5;
const BOND_DECAY_RATE = 0.5; // per day of absence
const TRUST_DECAY_RATE = 0.3;
const BOND_GAIN_PER_SESSION = 2;
const BOND_GAIN_PER_STREAK_DAY = 1;
const TRUST_GAIN_PER_SESSION = 3;
const TRUST_LOSS_ON_ABSENCE = 5; // per day, capped

// ── Storage ──────────────────────────────────────────────────────────────────

function bondKey(userId: string): string {
  return `companion_bond_${userId}`;
}

export async function loadBond(userId: string): Promise<BondState> {
  const storage = getDefaultStorageAdapter();
  const raw = await storage.getItem(bondKey(userId));
  if (!raw) {
    return {
      level: 0, trust: 0, memories: [],
      lastInteractionAt: Date.now(), totalInteractions: 0,
      longestAbsenceDays: 0, recoveredFromAbsence: false,
    };
  }
  return JSON.parse(raw) as BondState;
}

async function saveBond(userId: string, bond: BondState): Promise<void> {
  const storage = getDefaultStorageAdapter();
  await storage.setItem(bondKey(userId), JSON.stringify(bond));
}

// ── Bond Updates ─────────────────────────────────────────────────────────────

export async function recordSessionBond(userId: string, sessionMinutes: number, quality: number): Promise<BondState> {
  const bond = await loadBond(userId);
  const now = Date.now();
  const daysSinceLast = Math.floor((now - bond.lastInteractionAt) / (1000 * 60 * 60 * 24));

  // Apply decay if absent
  if (daysSinceLast > 1) {
    const decay = Math.min(daysSinceLast * BOND_DECAY_RATE, 20);
    bond.level = Math.max(0, bond.level - decay);
    const trustDecay = Math.min(daysSinceLast * TRUST_DECAY_RATE, 15);
    bond.trust = Math.max(0, bond.trust - trustDecay);
    bond.longestAbsenceDays = Math.max(bond.longestAbsenceDays, daysSinceLast);
  }

  // Recovery bonus: if user came back after absence, give extra bond
  if (daysSinceLast >= 3) {
    bond.recoveredFromAbsence = true;
    bond.level = Math.min(100, bond.level + 5); // Recovery bonus
    addMemory(bond, {
      id: `mem-${now}`,
      type: 'COMEBACK',
      description: `Returned after ${daysSinceLast} days away`,
      timestamp: now,
      emotionalWeight: 0.8,
    });
  }

  // Bond gain from session
  const qualityMultiplier = quality >= 90 ? 1.5 : quality >= 70 ? 1.0 : 0.5;
  bond.level = Math.min(100, bond.level + BOND_GAIN_PER_SESSION * qualityMultiplier);
  bond.trust = Math.min(100, bond.trust + TRUST_GAIN_PER_SESSION);
  bond.lastInteractionAt = now;
  bond.totalInteractions += 1;

  // Add memory for milestones
  if (sessionMinutes >= 45 && quality >= 85) {
    addMemory(bond, {
      id: `mem-${now}`,
      type: 'LONGEST_FOCUS',
      description: `${sessionMinutes}min session with ${quality}% purity`,
      timestamp: now,
      emotionalWeight: 0.7,
    });
  }

  await saveBond(userId, bond);
  return bond;
}

export async function recordStreakBond(userId: string, streakDays: number): Promise<BondState> {
  const bond = await loadBond(userId);
  bond.level = Math.min(100, bond.level + BOND_GAIN_PER_STREAK_DAY);

  if ([7, 14, 30, 60, 100].includes(streakDays)) {
    addMemory(bond, {
      id: `mem-${Date.now()}`,
      type: 'STREAK_MILESTONE',
      description: `${streakDays}-day streak achieved`,
      timestamp: Date.now(),
      emotionalWeight: 0.9,
    });
  }

  await saveBond(userId, bond);
  return bond;
}

export async function recordEvolutionBond(userId: string, newPhase: string): Promise<BondState> {
  const bond = await loadBond(userId);
  bond.level = Math.min(100, bond.level + 10); // Big bond boost on evolution
  bond.trust = Math.min(100, bond.trust + 10);

  addMemory(bond, {
    id: `mem-${Date.now()}`,
    type: 'EVOLUTION',
    description: `Evolved to ${newPhase}`,
    timestamp: Date.now(),
    emotionalWeight: 1.0,
  });

  await saveBond(userId, bond);
  return bond;
}

// ── Bond Queries ─────────────────────────────────────────────────────────────

export function getBondLabel(level: number): string {
  if (level >= 80) return 'Soulbound';
  if (level >= 60) return 'Deeply Bonded';
  if (level >= 40) return 'Trusted Companion';
  if (level >= 20) return 'Growing Friend';
  if (level >= 10) return 'Getting Acquainted';
  return 'New Companion';
}

export function getBondBonus(level: number): { xpBoost: number; coinBoost: number } {
  return {
    xpBoost: Math.floor(level / 20) * 0.05, // 0-25% XP boost
    coinBoost: Math.floor(level / 25) * 0.05, // 0-20% coin boost
  };
}

export function getTrustLabel(trust: number): string {
  if (trust >= 80) return 'Unbreakable Trust';
  if (trust >= 60) return 'Strong Trust';
  if (trust >= 40) return 'Building Trust';
  if (trust >= 20) return 'Cautious Trust';
  return 'New Trust';
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function addMemory(bond: BondState, memory: CompanionMemory): void {
  bond.memories.unshift(memory);
  if (bond.memories.length > MAX_MEMORIES) {
    bond.memories = bond.memories.slice(0, MAX_MEMORIES);
  }
}

export * from "./bond.types";
