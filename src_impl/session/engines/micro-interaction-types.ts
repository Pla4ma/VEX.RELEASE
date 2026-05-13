/**
 * Micro-Interaction Event Types
 *
 * Event payload types for the four active session engines:
 * FlowPulse, CompanionPresence, RestPhaseChallenge, BossAbility.
 * Published through the global eventBus under the [key: string]: unknown index.
 */

import type { CompanionMood } from '../../features/companion/types';

// ── Flow Pulse ────────────────────────────────────────────────────────────────

export type FlowState = 'DEEP_FLOW' | 'FLOW' | 'SHALLOW' | 'DISTRACTED';

export interface FlowPulseEvent {
  sessionId: string;
  userId: string;
  flowState: FlowState;
  previousFlowState: FlowState;
  pulseQuality: number; // 0–1
  purityWindow: number; // 0–100, trailing 30s average
  purityMomentum: number; // -1.0 to 1.0
  timestamp: number;
}

// ── Companion Presence ────────────────────────────────────────────────────────

export type CompanionMessageContext =
  | 'SESSION_START'
  | 'FIRST_MILESTONE'
  | 'MID_SESSION'
  | 'DEEP_FOCUS'
  | 'NEAR_END'
  | 'STRUGGLING'
  | 'RECOVERY'
  | 'PAUSE'
  | 'RESUME';

export interface CompanionMessageEvent {
  sessionId: string;
  userId: string;
  message: string;
  mood: CompanionMood;
  context: CompanionMessageContext;
  canTap: boolean; // Whether user can tap companion for boost
  tapCooldownRemaining: number; // seconds until next tap available
  timestamp: number;
}

export interface CompanionTappedEvent {
  sessionId: string;
  userId: string;
  purityBoost: number; // 0–5 points added to purity
  moodResponse: CompanionMood;
  message: string;
  timestamp: number;
}

// ── Rest Phase Challenge ──────────────────────────────────────────────────────

export type RestChallengeType = 'TAP_TO_BREATHE' | 'QUICK_REFLECTION' | 'GRATITUDE_MOMENT';

export interface RestChallengeAvailableEvent {
  sessionId: string;
  userId: string;
  challengeType: RestChallengeType;
  prompt: string;
  cycleCount: number; // 3 for breathe, 1 for others
  timestamp: number;
}

export interface RestChallengeCompletedEvent {
  sessionId: string;
  userId: string;
  challengeType: RestChallengeType;
  nextPhaseQualityMultiplier: number; // 1.0–1.2
  companionMessage: string;
  timestamp: number;
}

// ── Boss Ability ──────────────────────────────────────────────────────────────

export type BossAbilityType = 'FOCUS_STRIKE' | 'PURITY_SHIELD' | 'COMBO_CHAIN';

export interface BossAbilityState {
  type: BossAbilityType;
  label: string;
  description: string;
  cooldownSeconds: number;
  remainingCooldown: number;
  isAvailable: boolean;
  durationSeconds: number; // how long the effect lasts
}

export interface BossAbilityActivatedEvent {
  sessionId: string;
  userId: string;
  abilityType: BossAbilityType;
  effectMultiplier: number;
  durationSeconds: number;
  message: string;
  timestamp: number;
}

export interface BossAttackEvent {
  sessionId: string;
  userId: string;
  triggerPurity: number; // purity that triggered the attack
  purityDecayRate: number; // how fast purity decays during attack
  durationSeconds: number; // how long the attack lasts
  message: string;
  timestamp: number;
}
