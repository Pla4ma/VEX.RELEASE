/**
 * BossAbilityEngine
 *
 * Adds active decision-making to boss sessions. Replaces passive
 * "watch health bar drain" with strategic ability usage that rewards
 * timing and awareness.
 *
 * Key mechanics:
 * - Three ability types: Focus Strike (2x damage for next tick),
 *   Purity Shield (blocks one interruption penalty), Combo Chain
 *   (escalating damage for consecutive pure ticks)
 * - Each ability has a cooldown and duration
 * - Boss "attacks" when purity drops below threshold — triggers
 *   accelerated purity decay that the user must recover from
 * - Only active when a boss encounter is attached
 */

import type {
  BossAbilityType,
  BossAbilityState,
  BossAbilityActivatedEvent,
  BossAttackEvent,
} from './micro-interaction-types';
import { createDebugger } from '../../utils/debug';

const debug = createDebugger('session:boss-ability');

const BOSS_ATTACK_PURITY_THRESHOLD = 40;
const BOSS_ATTACK_DECAY_RATE = 0.3;
const BOSS_ATTACK_DURATION = 30;
const BOSS_ATTACK_COOLDOWN = 120;

interface AbilityConfig {
  label: string;
  description: string;
  cooldownSeconds: number;
  durationSeconds: number;
  effectMultiplier: number;
}

const ABILITY_CONFIGS: Record<BossAbilityType, AbilityConfig> = {
  FOCUS_STRIKE: {
    label: 'Focus Strike',
    description: '2x damage for next purity tick',
    cooldownSeconds: 45,
    durationSeconds: 3,
    effectMultiplier: 2.0,
  },
  PURITY_SHIELD: {
    label: 'Purity Shield',
    description: 'Blocks one interruption penalty',
    cooldownSeconds: 90,
    durationSeconds: 15,
    effectMultiplier: 1.0,
  },
  COMBO_CHAIN: {
    label: 'Combo Chain',
    description: 'Escalating damage for 5 pure ticks',
    cooldownSeconds: 60,
    durationSeconds: 5,
    effectMultiplier: 1.5,
  },
};

export class BossAbilityEngine {
  private sessionId: string | null = null;
  private userId: string | null = null;
  private bossActive = false;
  private abilityCooldowns: Record<BossAbilityType, number> = {
    FOCUS_STRIKE: 0,
    PURITY_SHIELD: 0,
    COMBO_CHAIN: 0,
  };
  private activeEffects: Map<BossAbilityType, { endsAt: number }> = new Map();
  private bossAttackEndsAt = 0;
  private lastBossAttackAt = 0;
  private onAbilityActivated: ((event: BossAbilityActivatedEvent) => void) | null = null;
  private onBossAttack: ((event: BossAttackEvent) => void) | null = null;

  initialize(sessionId: string, userId: string, bossActive: boolean): void {
    this.sessionId = sessionId;
    this.userId = userId;
    this.bossActive = bossActive;
    this.abilityCooldowns = { FOCUS_STRIKE: 0, PURITY_SHIELD: 0, COMBO_CHAIN: 0 };
    this.activeEffects.clear();
    this.bossAttackEndsAt = 0;
    this.lastBossAttackAt = 0;
    debug.info('BossAbilityEngine initialized (boss: %s)', bossActive);
  }

  onAbilityActivatedEvent(callback: (event: BossAbilityActivatedEvent) => void): void {
    this.onAbilityActivated = callback;
  }

  onBossAttackEvent(callback: (event: BossAttackEvent) => void): void {
    this.onBossAttack = callback;
  }

  setBossActive(active: boolean): void {
    this.bossActive = active;
    if (!active) {
      this.activeEffects.clear();
      this.bossAttackEndsAt = 0;
    }
  }

  tick(purityScore: number): { bossAttackActive: boolean; purityDecayRate: number } | null {
    if (!this.sessionId || !this.userId || !this.bossActive) {return null;}
    const now = Date.now();

    // Expire finished effects
    for (const [type, effect] of this.activeEffects) {
      if (now >= effect.endsAt) {
        this.activeEffects.delete(type);
      }
    }

    // Boss attack check
    let bossAttackActive = false;
    let purityDecayRate = 0;
    if (now < this.bossAttackEndsAt) {
      bossAttackActive = true;
      purityDecayRate = BOSS_ATTACK_DECAY_RATE;
    } else if (
      purityScore < BOSS_ATTACK_PURITY_THRESHOLD &&
      now - this.lastBossAttackAt > BOSS_ATTACK_COOLDOWN * 1000
    ) {
      this.bossAttackEndsAt = now + BOSS_ATTACK_DURATION * 1000;
      this.lastBossAttackAt = now;
      bossAttackActive = true;
      purityDecayRate = BOSS_ATTACK_DECAY_RATE;

      const event: BossAttackEvent = {
        sessionId: this.sessionId,
        userId: this.userId,
        triggerPurity: purityScore,
        purityDecayRate: BOSS_ATTACK_DECAY_RATE,
        durationSeconds: BOSS_ATTACK_DURATION,
        message: 'The boss strikes! Regain your focus!',
        timestamp: now,
      };
      this.onBossAttack?.(event);
    }

    return { bossAttackActive, purityDecayRate };
  }

  activateAbility(abilityType: BossAbilityType): BossAbilityActivatedEvent | null {
    if (!this.sessionId || !this.userId || !this.bossActive) {
      return null;
    }
    if (this.abilityCooldowns[abilityType] > 0) {
      return null;
    }

    const config = ABILITY_CONFIGS[abilityType];
    this.abilityCooldowns[abilityType] = config.cooldownSeconds;

    if (abilityType === 'PURITY_SHIELD') {
      this.activeEffects.set(abilityType, {
        endsAt: Date.now() + config.durationSeconds * 1000,
      });
    }

    const event: BossAbilityActivatedEvent = {
      sessionId: this.sessionId,
      userId: this.userId,
      abilityType,
      effectMultiplier: config.effectMultiplier,
      durationSeconds: config.durationSeconds,
      message: `${config.label} activated!`,
      timestamp: Date.now(),
    };

    this.onAbilityActivated?.(event);
    return event;
  }

  getAbilityStates(): BossAbilityState[] {
    return (Object.keys(ABILITY_CONFIGS) as BossAbilityType[]).map((type) => {
      const config = ABILITY_CONFIGS[type];
      return {
        type,
        label: config.label,
        description: config.description,
        cooldownSeconds: config.cooldownSeconds,
        remainingCooldown: Math.max(0, this.abilityCooldowns[type]),
        isAvailable: this.bossActive && this.abilityCooldowns[type] <= 0,
        durationSeconds: config.durationSeconds,
      };
    });
  }

  isEffectActive(abilityType: BossAbilityType): boolean {
    if (!this.activeEffects.has(abilityType)) {return false;}
    const effect = this.activeEffects.get(abilityType)!;
    return Date.now() < effect.endsAt;
  }

  getDamageMultiplier(): number {
    let multiplier = 1.0;
    if (this.isEffectActive('FOCUS_STRIKE')) {
      multiplier *= ABILITY_CONFIGS.FOCUS_STRIKE.effectMultiplier;
    }
    if (this.isEffectActive('COMBO_CHAIN')) {
      multiplier *= ABILITY_CONFIGS.COMBO_CHAIN.effectMultiplier;
    }
    return multiplier;
  }

  isShieldActive(): boolean {
    return this.isEffectActive('PURITY_SHIELD');
  }

  isBossAttacking(): boolean {
    return Date.now() < this.bossAttackEndsAt;
  }

  getBossAttackPurityDecay(): number {
    return this.isBossAttacking() ? BOSS_ATTACK_DECAY_RATE : 0;
  }

  destroy(): void {
    this.sessionId = null;
    this.userId = null;
    this.activeEffects.clear();
    this.bossAttackEndsAt = 0;
    this.onAbilityActivated = null;
    this.onBossAttack = null;
  }
}

export * from "./BossAbilityEngine.types";
export * from "./BossAbilityEngine.types";
