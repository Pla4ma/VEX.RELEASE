/**
 * CompanionPresenceEngine
 *
 * Brings the companion alive during sessions by sending contextual messages
 * at key moments and enabling the "tap companion" micro-interaction.
 *
 * Key mechanics:
 * - Timed messages at session milestones (start, 25%, 50%, 75%, near end)
 * - Purity-triggered messages (struggling, recovering, deep focus)
 * - Tap-to-boost: user taps companion → +2% purity (60s cooldown)
 * - Phase-aware: different messages during FOCUS vs BREAK
 */

import type {
  CompanionMessageContext,
  CompanionMessageEvent,
  CompanionTappedEvent,
} from './micro-interaction-types';
import type { CompanionMood } from '../../features/companion/types';
import { createDebugger } from '../../utils/debug';

const debug = createDebugger('session:companion');

const TAP_PURITY_BOOST = 2;
const TAP_COOLDOWN_SECONDS = 60;
const MESSAGE_INTERVALS_PERCENT = [0, 10, 25, 50, 75, 90];
const LAST_MESSAGED_SECONDS_COOLDOWN = 45;

const MESSAGES: Record<CompanionMessageContext, string[]> = {
  SESSION_START: [
    "Let's do this together.",
    'I believe in you.',
    'Ready when you are.',
  ],
  FIRST_MILESTONE: [
    '10% in — warming up nicely.',
    'Finding our rhythm…',
    'Steady start.',
  ],
  MID_SESSION: [
    'Halfway there. Keep going.',
    "We're in this together.",
    'Right in the pocket.',
  ],
  DEEP_FOCUS: [
    'You are locked in right now.',
    'Pure focus — I can feel it.',
    'This is the zone.',
  ],
  NEAR_END: [
    'Almost home — finish strong.',
    'Last stretch. You got this.',
    'The finish line is close.',
  ],
  STRUGGLING: [
    "It's okay. Refocus with me.",
    'Take a breath. Reset.',
    'One moment at a time.',
  ],
  RECOVERY: [
    'Back on track — nice recovery.',
    'You bounced back. Respect.',
    'That was a smooth comeback.',
  ],
  PAUSE: [
    'Taking a breather. Smart.',
    'Rest is part of the work.',
    'I will be here when you return.',
  ],
  RESUME: [
    'Welcome back. Let us continue.',
    'Right where we left off.',
    'Recharged and ready.',
  ],
};

const MOOD_FOR_CONTEXT: Record<CompanionMessageContext, CompanionMood> = {
  SESSION_START: 'SLEEPY',
  FIRST_MILESTONE: 'CONTENT',
  MID_SESSION: 'FOCUSED',
  DEEP_FOCUS: 'DETERMINED',
  NEAR_END: 'DETERMINED',
  STRUGGLING: 'STRUGGLING',
  RECOVERY: 'CONTENT',
  PAUSE: 'SLEEPY',
  RESUME: 'CONTENT',
};

export class CompanionPresenceEngine {
  private sessionId: string | null = null;
  private userId: string | null = null;
  private lastTapTime: number = 0;
  private lastMessageTime: number = 0;
  private messagedPercents: Set<number> = new Set();
  private onMessage: ((event: CompanionMessageEvent) => void) | null = null;
  private onTapped: ((event: CompanionTappedEvent) => void) | null = null;

  initialize(sessionId: string, userId: string): void {
    this.sessionId = sessionId;
    this.userId = userId;
    this.lastTapTime = 0;
    this.lastMessageTime = 0;
    this.messagedPercents = new Set();
    debug.info('CompanionPresenceEngine initialized for session %s', sessionId);
  }

  onMessageEvent(callback: (event: CompanionMessageEvent) => void): void {
    this.onMessage = callback;
  }

  onTappedEvent(callback: (event: CompanionTappedEvent) => void): void {
    this.onTapped = callback;
  }

  tick(
    completionPercent: number,
    purityScore: number,
    phase: string,
    isPaused: boolean,
    previousFlowState?: string,
    currentFlowState?: string,
  ): CompanionMessageEvent | null {
    if (!this.sessionId || !this.userId) {return null;}

    const now = Date.now();
    if (now - this.lastMessageTime < LAST_MESSAGED_SECONDS_COOLDOWN * 1000) {
      return null;
    }

    let context: CompanionMessageContext | null = null;

    // Phase-based messages
    if (isPaused) {
      context = 'PAUSE';
    } else if (phase === 'FOCUS') {
      // Milestone-based messages
      for (const pct of MESSAGE_INTERVALS_PERCENT) {
        if (completionPercent >= pct && !this.messagedPercents.has(pct)) {
          this.messagedPercents.add(pct);
          context = pct === 0 ? 'SESSION_START'
            : pct === 10 ? 'FIRST_MILESTONE'
            : pct === 25 || pct === 50 ? 'MID_SESSION'
            : pct >= 75 ? 'NEAR_END'
            : null;
          if (context) {break;}
        }
      }
      // Purity-triggered messages (only if no milestone message)
      if (!context) {
        if (currentFlowState === 'DEEP_FLOW' && previousFlowState !== 'DEEP_FLOW' && purityScore >= 90) {
          context = 'DEEP_FOCUS';
        } else if (currentFlowState === 'DISTRACTED' && purityScore < 50) {
          context = 'STRUGGLING';
        } else if (currentFlowState === 'FLOW' && previousFlowState === 'DISTRACTED') {
          context = 'RECOVERY';
        }
      }
    }

    if (!context) {return null;}

    const messages = MESSAGES[context];
    const message = messages[Math.floor(Math.random() * messages.length)]!;
    const mood = MOOD_FOR_CONTEXT[context];
    this.lastMessageTime = now;

    const event: CompanionMessageEvent = {
      sessionId: this.sessionId,
      userId: this.userId,
      message,
      mood,
      context,
      canTap: this.canTap(),
      tapCooldownRemaining: this.getTapCooldownRemaining(),
      timestamp: now,
    };

    this.onMessage?.(event);
    return event;
  }

  tapCompanion(): CompanionTappedEvent | null {
    if (!this.sessionId || !this.userId || !this.canTap()) {
      return null;
    }

    this.lastTapTime = Date.now();
    const event: CompanionTappedEvent = {
      sessionId: this.sessionId,
      userId: this.userId,
      purityBoost: TAP_PURITY_BOOST,
      moodResponse: 'FOCUSED',
      message: 'Your companion focuses with you!',
      timestamp: Date.now(),
    };

    this.onTapped?.(event);
    return event;
  }

  canTap(): boolean {
    return this.getTapCooldownRemaining() === 0;
  }

  getTapCooldownRemaining(): number {
    if (this.lastTapTime === 0) {return 0;}
    const elapsed = (Date.now() - this.lastTapTime) / 1000;
    return Math.max(0, Math.ceil(TAP_COOLDOWN_SECONDS - elapsed));
  }

  reset(): void {
    this.messagedPercents = new Set();
    this.lastMessageTime = 0;
  }

  destroy(): void {
    this.sessionId = null;
    this.userId = null;
    this.onMessage = null;
    this.onTapped = null;
  }
}
