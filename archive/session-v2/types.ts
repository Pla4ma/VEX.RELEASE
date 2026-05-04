/**
 * Session V2 Types
 * 
 * Type definitions for the combat-first session architecture.
 */

import { z } from 'zod';
import type { SessionState, SessionConfig, BossEncounter, CombatAbility, BossPhase, BossAttackPattern } from '../../types/consolidated';

// ============================================================================
// Combat-First Session Types
// ============================================================================

export interface SessionV2State extends SessionState {
  // Combat-specific additions
  combatState: CombatSessionState;
  userResources: UserResources;
  combatHistory: CombatAction[];
  
  // Active combat mechanics
  currentEncounter?: BossEncounter;
  activeAbilities: CombatAbility[];
  abilityCooldowns: Record<string, number>;
  
  // Dodge mechanics
  dodgeAttempts: number;
  successfulDodges: number;
  dodgeStreak: number;
  
  // Combo system
  comboCount: number;
  lastActionTime: number;
  comboMultiplier: number;
  
  // Missing properties from SessionState
  id: string;
  userId: string;
  status: 'active' | 'paused' | 'completed' | 'failed';
  startedAt: number;
  completedAt?: number;
  updatedAt: number;
  isDirty: boolean;
  
  // Progress tracking
  completionPercentage: number;
  elapsedTime: number;
  totalDuration: number;
  remainingTime: number;
  effectiveTime: number;
  
  // Performance metrics
  baseScore: number;
  finalScore: number;
  timeBonus: number;
  streakBonus: number;
  grade: string;
  focusQuality: number;
  interruptions: number;
  recoveryAttempts: number;
}

export interface CombatSessionState {
  phase: 'PREPARING' | 'COMBAT_ACTIVE' | 'BOSS_RAGE' | 'NEAR_DEATH' | 'VICTORY' | 'DEFEAT';
  currentAttack?: BossAttackPattern;
  attackStartTime?: number;
  attackDuration: number;
  
  // User interaction tracking
  abilitiesUsed: number;
  damageDealt: number;
  energyConsumed: number;
  
  // Combat flow
  isPlayerTurn: boolean;
  nextActionAvailableAt: number;
}

export interface UserResources {
  focusEnergy: number;
  maxFocusEnergy: number;
  energyRegenRate: number;
  
  // Ability-specific resources
  specialCharges: Record<string, number>;
}

export interface CombatAction {
  id: string;
  timestamp: number;
  type: 'ABILITY_USED' | 'DODGE_ATTEMPT' | 'DODGE_SUCCESS' | 'DODGE_FAILED' | 'COMBO_TRIGGERED';
  data: {
    abilityId?: string;
    damage?: number;
    energyCost?: number;
    attackPattern?: BossAttackPattern;
    comboBonus?: number;
  };
}

// ============================================================================
// Combat System Types
// ============================================================================

export interface CombatAbilityConfig extends CombatAbility {
  // Enhanced ability properties for V2
  unlockLevel?: number;
  comboStarter?: boolean;
  comboFinisher?: boolean;
  specialEffect?: CombatEffect;
  
  // Visual/audio properties
  animationDuration: number;
  soundEffect?: string;
  particleEffect?: string;
}

export interface CombatEffect {
  type: 'DAMAGE_BOOST' | 'ENERGY_REGEN' | 'SHIELD' | 'STUN' | 'HEAL';
  value: number;
  duration: number;
  target: 'BOSS' | 'PLAYER';
}

export interface AttackPatternConfig {
  pattern: BossAttackPattern;
  name: string;
  description: string;
  duration: number;
  damage: number;
  
  // Dodge mechanics
  dodgeCondition: DodgeCondition;
  dodgeWindow: number; // Time window to successfully dodge
  difficulty: 1 | 2 | 3 | 4 | 5;
  
  // Visual/audio
  warningMessage: string;
  warningDuration: number;
  animationType: 'WAVE' | 'BEAM' | 'BLAST' | 'TRAP' | 'TEMPEST';
}

export interface DodgeCondition {
  type: 'MAINTAIN_PURITY' | 'NO_PAUSE' | 'NO_BACKGROUND' | 'TAP_TIMING' | 'PATTERN_MATCH';
  threshold?: number; // For purity-based dodges
  window?: number; // For timing-based dodges
  pattern?: string[]; // For pattern-based dodges
}

// ============================================================================
// Tutorial System Types
// ============================================================================

export interface CombatTutorial {
  id: string;
  name: string;
  description: string;
  
  // Tutorial progression
  steps: TutorialStep[];
  currentStep: number;
  isCompleted: boolean;
  
  // Conditions
  requiredLevel?: number;
  requiredAbilities?: string[];
  
  // Rewards
  completionReward: {
    xp: number;
    coins: number;
    unlockAbility?: string;
  };
}

export interface TutorialStep {
  id: string;
  title: string;
  instruction: string;
  
  // Step type and configuration
  type: 'ABILITY_INTRO' | 'DODGE_TRAINING' | 'COMBO_PRACTICE' | 'BOSS_PHASE_INTRO';
  config: {
    abilityId?: string;
    attackPattern?: BossAttackPattern;
    targetCombo?: number;
    duration?: number;
  };
  
  // Completion conditions
  completionConditions: TutorialCondition[];
  isCompleted: boolean;
  
  // UI hints
  highlightElements?: string[];
  overlayText?: string;
}

export interface TutorialCondition {
  type: 'ABILITY_USED' | 'DODGE_SUCCESS' | 'COMBO_ACHIEVED' | 'TIME_ELAPSED';
  value: number;
  operator: '=' | '>' | '<' | '>=' | '<=';
}

// ============================================================================
// Feature Flag Types
// ============================================================================

export interface SessionV2FeatureFlags {
  combatV2Enabled: boolean;
  tutorialSystemEnabled: boolean;
  advancedAbilitiesEnabled: boolean;
  comboSystemEnabled: boolean;
  dodgeMechanicsEnabled: boolean;
}

// ============================================================================
// Event Types
// ============================================================================

export interface SessionV2Events {
  // Combat events
  'combat:ability_used': {
    sessionId: string;
    userId: string;
    abilityId: string;
    damage: number;
    energyCost: number;
    comboCount: number;
  };
  
  'combat:dodge_attempted': {
    sessionId: string;
    userId: string;
    attackPattern: BossAttackPattern;
    success: boolean;
    timing: number;
  };
  
  'combat:phase_changed': {
    sessionId: string;
    userId: string;
    newPhase: BossPhase;
    previousPhase: BossPhase;
    healthPercent: number;
  };
  
  'combat:combo_triggered': {
    sessionId: string;
    userId: string;
    comboCount: number;
    multiplier: number;
    bonusDamage: number;
  };
  
  'combat:victory': {
    sessionId: string;
    userId: string;
    bossId: string;
    totalDamage: number;
    combatTime: number;
    grade: string;
  };
  
  'combat:defeat': {
    sessionId: string;
    userId: string;
    bossId: string;
    damageDealt: number;
    reason: 'TIMEOUT' | 'ENERGY_DEPLETED' | 'TOO_MUCH_DAMAGE';
  };
  
  // Tutorial events
  'tutorial:step_completed': {
    userId: string;
    tutorialId: string;
    stepId: string;
    timeSpent: number;
  };
  
  'tutorial:completed': {
    userId: string;
    tutorialId: string;
    totalTime: number;
    rewardsEarned: unknown;
  };
}

// ============================================================================
// Validation Schemas
// ============================================================================

export const SessionV2StateSchema = SessionState.extend({
  combatState: z.object({
    phase: z.enum(['PREPARING', 'COMBAT_ACTIVE', 'BOSS_RAGE', 'NEAR_DEATH', 'VICTORY', 'DEFEAT']),
    currentAttack: z.enum(['DISTRACTION_WAVE', 'PROCRASTINATION_BEAM', 'NOTIFICATION_BLAST', 'SOCIAL_MEDIA_TRAP', 'MULTITASKING_TEMPEST']).optional(),
    attackStartTime: z.number().optional(),
    attackDuration: z.number(),
    abilitiesUsed: z.number(),
    damageDealt: z.number(),
    energyConsumed: z.number(),
    isPlayerTurn: z.boolean(),
    nextActionAvailableAt: z.number(),
  }),
  userResources: z.object({
    focusEnergy: z.number(),
    maxFocusEnergy: z.number(),
    energyRegenRate: z.number(),
    specialCharges: z.record(z.number()),
  }),
  combatHistory: z.array(z.object({
    id: z.string(),
    timestamp: z.number(),
    type: z.enum(['ABILITY_USED', 'DODGE_ATTEMPT', 'DODGE_SUCCESS', 'DODGE_FAILED', 'COMBO_TRIGGERED']),
    data: z.object({
      abilityId: z.string().optional(),
      damage: z.number().optional(),
      energyCost: z.number().optional(),
      attackPattern: z.enum(['DISTRACTION_WAVE', 'PROCRASTINATION_BEAM', 'NOTIFICATION_BLAST', 'SOCIAL_MEDIA_TRAP', 'MULTITASKING_TEMPEST']).optional(),
      comboBonus: z.number().optional(),
    }),
  })),
  currentEncounter: z.any().optional(), // BossEncounter type
  activeAbilities: z.array(z.any()), // CombatAbility type
  abilityCooldowns: z.record(z.number()),
  dodgeAttempts: z.number(),
  successfulDodges: z.number(),
  dodgeStreak: z.number(),
  comboCount: z.number(),
  lastActionTime: z.number(),
  comboMultiplier: z.number(),
});

export type ValidatedSessionV2State = z.infer<typeof SessionV2StateSchema>;
