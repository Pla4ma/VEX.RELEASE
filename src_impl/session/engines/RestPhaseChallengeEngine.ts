/**
 * RestPhaseChallengeEngine
 *
 * Adds active micro-interactions during break phases so rest isn't just
 * dead time. The user gets a mini-challenge that rewards engagement.
 *
 * Key mechanics:
 * - Triggers when session enters SHORT_BREAK or LONG_BREAK
 * - Three challenge types: TAP_TO_BREATHE (3 cycles), QUICK_REFLECTION (1 prompt), GRATITUDE_MOMENT (1 prompt)
 * - Completing grants next-phase quality multiplier (1.0–1.2)
 * - Skipping is allowed with no penalty
 * - One challenge per break phase
 */

import type {
  RestChallengeType,
  RestChallengeAvailableEvent,
  RestChallengeCompletedEvent,
} from './micro-interaction-types';
import { createDebugger } from '../../utils/debug';

const debug = createDebugger('session:rest-challenge');

const REFLECTION_PROMPTS = [
  'What is one thing you have accomplished this session?',
  'What is your next priority after this break?',
  'How is your energy right now?',
];

const GRATITUDE_PROMPTS = [
  'Name one thing you are grateful for right now.',
  'What made you smile today?',
  'Who helped you recently?',
];

export class RestPhaseChallengeEngine {
  private sessionId: string | null = null;
  private userId: string | null = null;
  private currentChallenge: RestChallengeType | null = null;
  private isActive = false;
  private onAvailable: ((event: RestChallengeAvailableEvent) => void) | null = null;
  private onCompleted: ((event: RestChallengeCompletedEvent) => void) | null = null;

  initialize(sessionId: string, userId: string): void {
    this.sessionId = sessionId;
    this.userId = userId;
    this.currentChallenge = null;
    this.isActive = false;
    debug.info('RestPhaseChallengeEngine initialized for session %s', sessionId);
  }

  onAvailableEvent(callback: (event: RestChallengeAvailableEvent) => void): void {
    this.onAvailable = callback;
  }

  onCompletedEvent(callback: (event: RestChallengeCompletedEvent) => void): void {
    this.onCompleted = callback;
  }

  triggerChallenge(phase: string): RestChallengeAvailableEvent | null {
    if (!this.sessionId || !this.userId) {return null;}
    if (phase !== 'SHORT_BREAK' && phase !== 'LONG_BREAK') {return null;}
    if (this.isActive) {return null;}

    this.isActive = true;
    this.currentChallenge = this.pickChallenge();

    let prompt: string;
    let cycleCount: number;

    if (this.currentChallenge === 'TAP_TO_BREATHE') {
      prompt = 'Tap with each breath — inhale, hold, exhale';
      cycleCount = 3;
    } else if (this.currentChallenge === 'QUICK_REFLECTION') {
      prompt = REFLECTION_PROMPTS[Math.floor(Math.random() * REFLECTION_PROMPTS.length)]!;
      cycleCount = 1;
    } else {
      prompt = GRATITUDE_PROMPTS[Math.floor(Math.random() * GRATITUDE_PROMPTS.length)]!;
      cycleCount = 1;
    }

    const event: RestChallengeAvailableEvent = {
      sessionId: this.sessionId,
      userId: this.userId,
      challengeType: this.currentChallenge,
      prompt,
      cycleCount,
      timestamp: Date.now(),
    };

    this.onAvailable?.(event);
    debug.info('Rest challenge triggered: %s', this.currentChallenge);
    return event;
  }

  completeChallenge(): RestChallengeCompletedEvent | null {
    if (!this.sessionId || !this.userId || !this.currentChallenge || !this.isActive) {
      return null;
    }

    const challengeType = this.currentChallenge;
    const nextPhaseQualityMultiplier = 1.1 + (challengeType === 'TAP_TO_BREATHE' ? 0.05 : 0);
    const companionMessages: Record<RestChallengeType, string> = {
      TAP_TO_BREATHE: 'Your companion breathes with you. Centered.',
      QUICK_REFLECTION: 'Your companion nods — clarity earned.',
      GRATITUDE_MOMENT: 'Your companion glows with warmth.',
    };

    const event: RestChallengeCompletedEvent = {
      sessionId: this.sessionId,
      userId: this.userId,
      challengeType,
      nextPhaseQualityMultiplier,
      companionMessage: companionMessages[challengeType],
      timestamp: Date.now(),
    };

    this.currentChallenge = null;
    this.isActive = false;
    this.onCompleted?.(event);
    return event;
  }

  skipChallenge(): void {
    this.currentChallenge = null;
    this.isActive = false;
  }

  getCurrentChallenge(): RestChallengeType | null {
    return this.currentChallenge;
  }

  getIsActive(): boolean {
    return this.isActive;
  }

  destroy(): void {
    this.sessionId = null;
    this.userId = null;
    this.currentChallenge = null;
    this.isActive = false;
    this.onAvailable = null;
    this.onCompleted = null;
  }

  private pickChallenge(): RestChallengeType {
    const roll = Math.random();
    if (roll < 0.5) {return 'TAP_TO_BREATHE';}
    if (roll < 0.8) {return 'QUICK_REFLECTION';}
    return 'GRATITUDE_MOMENT';
  }
}
