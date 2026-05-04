/**
 * Real-time Boss Combat Service
 *
 * Manages live boss combat during focus sessions.
 * Damage happens continuously based on focus quality.
 */

import {
  RealTimeBossEncounter,
  CombatEvent,
  DamageCalculation,
  BossCombatState,
  AttackType,
  calculateBaseDamage,
  calculatePurityMultiplier,
  calculateComboMultiplier,
  determineAttackType,
  getAttackVisuals,
  BOSS_RAGE_THRESHOLD,
  BOSS_NEAR_DEATH_THRESHOLD,
  PURE_STRIKE_THRESHOLD,
  COMBO_THRESHOLD,
} from './types';

export class RealTimeBossService {
  private encounter: RealTimeBossEncounter | null = null;
  private eventListeners: ((event: CombatEvent) => void)[] = [];

  // Tracking state
  private lastPureStrikeTime: number | null = null;
  private currentCombo = 0;
  private pureFocusStartTime: number | null = null;
  private lastAttackTime: number | null = null;
  private totalPureSeconds = 0;
  private rageModeTriggered = false;
  private nearDeathTriggered = false;

  constructor(encounter: RealTimeBossEncounter) {
    this.encounter = { ...encounter };
  }

  /**
   * Process a combat tick - call every few seconds during session
   * Returns true if boss was defeated
   */
  tick(
    elapsedSeconds: number,
    sessionDurationSeconds: number,
    purityScore: number,
    isPaused: boolean
  ): {
    damageDealt: number;
    attackType: AttackType;
    bossDefeated: boolean;
    stateChanged: boolean;
    newState?: BossCombatState;
  } {
    if (!this.encounter || isPaused) {
      return { damageDealt: 0, attackType: 'NORMAL_FOCUS', bossDefeated: false, stateChanged: false };
    }

    const now = Date.now();
    const sessionMinutes = elapsedSeconds / 60;

    // Calculate damage
    const damage = this.calculateDamage(purityScore, sessionMinutes);

    // Determine attack type
    const pureDuration = this.pureFocusStartTime
      ? (now - this.pureFocusStartTime) / 1000
      : 0;
    const healthPercent = this.encounter.currentHealth / this.encounter.maxHealth;

    const attackType = determineAttackType(
      purityScore,
      this.currentCombo,
      pureDuration,
      healthPercent
    );

    // Update combo tracking
    if (purityScore >= PURE_STRIKE_THRESHOLD) {
      if (this.lastPureStrikeTime && (now - this.lastPureStrikeTime) < 10000) {
        this.currentCombo++;
        if (this.currentCombo >= COMBO_THRESHOLD) {
          this.emitEvent({
            type: 'COMBO_BONUS',
            timestamp: now,
            data: { comboCount: this.currentCombo, message: `${this.currentCombo}x COMBO!` },
          });
        }
      } else {
        this.currentCombo = 1;
      }
      this.lastPureStrikeTime = now;

      if (!this.pureFocusStartTime) {
        this.pureFocusStartTime = now;
      }
      this.totalPureSeconds += 1;
    } else {
      this.currentCombo = 0;
      this.pureFocusStartTime = null;
    }

    // Apply damage
    this.encounter.currentHealth = Math.max(0, this.encounter.currentHealth - damage);
    this.encounter.damageDealtThisSession += damage;
    this.encounter.attacksLanded++;
    this.encounter.lastAttackTime = now;
    this.encounter.lastAttackDamage = damage;
    this.encounter.lastAttackType = attackType;
    this.encounter.currentCombo = this.currentCombo;

    if (attackType === 'CRITICAL_FOCUS' || attackType === 'STREAK_COMBO' || attackType === 'FINISHING_BLOW') {
      this.encounter.criticalHits++;
    }

    // Update longest combo
    if (this.currentCombo > this.encounter.longestCombo) {
      this.encounter.longestCombo = this.currentCombo;
    }

    // Update time
    this.encounter.timeRemaining = Math.max(0, this.encounter.timeLimit - elapsedSeconds);

    // Check for combat state changes
    let stateChanged = false;
    let newState: BossCombatState | undefined;
    const newHealthPercent = this.encounter.currentHealth / this.encounter.maxHealth;

    // Rage mode trigger
    if (newHealthPercent <= BOSS_RAGE_THRESHOLD && !this.rageModeTriggered) {
      this.rageModeTriggered = true;
      this.encounter.combatState = 'BOSS_RAGE';
      stateChanged = true;
      newState = 'BOSS_RAGE';
      this.emitEvent({
        type: 'PHASE_CHANGE',
        timestamp: now,
        data: { message: 'BOSS ENRAGED!', healthPercent: newHealthPercent, intensity: 0.8 },
      });
    }

    // Near death trigger
    if (newHealthPercent <= BOSS_NEAR_DEATH_THRESHOLD && !this.nearDeathTriggered) {
      this.nearDeathTriggered = true;
      this.encounter.combatState = 'NEAR_DEATH';
      stateChanged = true;
      newState = 'NEAR_DEATH';
      this.emitEvent({
        type: 'NEAR_DEATH',
        timestamp: now,
        data: { message: 'ALMOST THERE! FINISH IT!', healthPercent: newHealthPercent, intensity: 1 },
      });
    }

    // Emit attack event
    const attackVisuals = getAttackVisuals(attackType);
    this.emitEvent({
      type: 'ATTACK_LANDED',
      timestamp: now,
      data: {
        damage,
        attackType,
        comboCount: this.currentCombo,
        message: attackVisuals.message,
        healthPercent: newHealthPercent,
        intensity: attackVisuals.shakeIntensity,
      },
    });

    // Check victory
    const bossDefeated = this.encounter.currentHealth <= 0;
    if (bossDefeated && this.encounter.combatState !== 'VICTORY') {
      this.encounter.combatState = 'VICTORY';
      stateChanged = true;
      newState = 'VICTORY';
      this.emitEvent({
        type: 'VICTORY',
        timestamp: now,
        data: { message: 'VICTORY! BOSS DEFEATED!', intensity: 1 },
      });
    }

    return {
      damageDealt: damage,
      attackType,
      bossDefeated,
      stateChanged,
      newState,
    };
  }

  /**
   * Get current encounter state
   */
  getEncounter(): RealTimeBossEncounter | null {
    return this.encounter ? { ...this.encounter } : null;
  }

  /**
   * Subscribe to combat events
   */
  onEvent(callback: (event: CombatEvent) => void): () => void {
    this.eventListeners.push(callback);
    return () => {
      const index = this.eventListeners.indexOf(callback);
      if (index > -1) {this.eventListeners.splice(index, 1);}
    };
  }

  /**
   * Calculate final rewards based on combat performance
   */
  calculateFinalRewards(): {
    xp: number;
    coins: number;
    gems: number;
    bonusReward: boolean;
  } {
    if (!this.encounter) {return { xp: 0, coins: 0, gems: 0, bonusReward: false };}

    const baseXp = this.encounter.xpReward;
    const baseCoins = this.encounter.coinReward;
    const baseGems = this.encounter.gemReward;

    // Performance multipliers
    const speedBonus = this.encounter.timeRemaining > (this.encounter.timeLimit * 0.3) ? 1.5 : 1;
    const comboBonus = Math.min(2, 1 + this.encounter.longestCombo * 0.1);
    const criticalBonus = Math.min(2, 1 + this.encounter.criticalHits * 0.05);

    const totalMultiplier = speedBonus * comboBonus * criticalBonus;
    const bonusReward = totalMultiplier > 2;

    return {
      xp: Math.floor(baseXp * totalMultiplier),
      coins: Math.floor(baseCoins * totalMultiplier),
      gems: Math.floor(baseGems * (bonusReward ? 2 : 1)),
      bonusReward,
    };
  }

  private calculateDamage(purityScore: number, sessionMinutes: number): number {
    const baseDamage = calculateBaseDamage(sessionMinutes);
    const purityMultiplier = calculatePurityMultiplier(purityScore);
    const comboMultiplier = calculateComboMultiplier(this.currentCombo);

    // Add some randomness for excitement
    const variance = 0.9 + Math.random() * 0.2; // 0.9 - 1.1

    return Math.floor(baseDamage * purityMultiplier * comboMultiplier * variance);
  }

  private emitEvent(event: CombatEvent): void {
    this.eventListeners.forEach(callback => callback(event));
  }
}

// Factory for creating encounters
export function createBossEncounter(
  bossId: string,
  bossName: string,
  bossAvatar: string,
  userId: string,
  sessionId: string,
  sessionDurationMinutes: number,
  userLevel: number
): RealTimeBossEncounter {
  // Scale boss health based on session duration and user level
  const baseHealth = 1000;
  const durationMultiplier = Math.sqrt(sessionDurationMinutes) / 5;
  const levelMultiplier = 1 + (userLevel * 0.05);

  const maxHealth = Math.floor(baseHealth * durationMultiplier * levelMultiplier);

  // Calculate rewards
  const baseXp = 50 * sessionDurationMinutes;
  const baseCoins = 10 * sessionDurationMinutes;
  const baseGems = Math.floor(sessionDurationMinutes / 10); // 1 gem per 10 min

  return {
    id: `encounter_${Date.now()}_${userId}`,
    bossId,
    userId,
    bossName,
    bossAvatar,
    maxHealth,
    currentHealth: maxHealth,
    combatState: 'ENCOUNTER_START',
    damageDealtThisSession: 0,
    attacksLanded: 0,
    criticalHits: 0,
    longestCombo: 0,
    currentCombo: 0,
    sessionId,
    sessionStartTime: Date.now(),
    sessionDuration: sessionDurationMinutes * 60,
    timeLimit: sessionDurationMinutes * 60 + 300, // 5 min grace
    timeRemaining: sessionDurationMinutes * 60 + 300,
    lastAttackTime: null,
    lastAttackDamage: 0,
    lastAttackType: null,
    bossIsFlashing: false,
    bossIsShaking: false,
    xpReward: baseXp,
    coinReward: baseCoins,
    gemReward: baseGems,
    createdAt: Date.now(),
  };
}
