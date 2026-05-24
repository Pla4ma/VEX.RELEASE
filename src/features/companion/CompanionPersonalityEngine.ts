import { eventBus } from '../../events/EventBus';
import { createDebugger } from '../../utils/debug';
import { getAvailabilityFor } from '../liveops-config/feature-access-store';
import { trackPersonalityResponse } from './analytics';
import type { PersonalityEventType, ActiveResponse, CompanionPersonalityState } from './personality-responses';
import { RESPONSES } from './personality-responses';

const debug = createDebugger('companion-personality');
const FEATURE_KEY = 'companion_detail' as const;

export type { PersonalityEventType, ActiveResponse, CompanionPersonalityState };

class CompanionPersonalityEngine {
  private state: CompanionPersonalityState = {
    currentResponse: null,
    responseHistory: [],
    isAnimating: false,
  };

  private listeners: Set<(state: CompanionPersonalityState) => void> = new Set();
  private unsubscribeFunctions: Array<() => void> = [];

  initialize(): void {
    const availability = getAvailabilityFor(FEATURE_KEY);
    if (!availability.canSubscribeToEvents) {
      debug.info('CompanionPersonalityEngine skipped — feature not available');
      return;
    }
    this.unsubscribeFunctions = [
      eventBus.subscribe('boss:defeated', this.wrapHandler(this.handleBossDefeated.bind(this))),
      eventBus.subscribe('session:completed', this.wrapHandler(this.handleSessionCompleted.bind(this))),
      eventBus.subscribe('streak:milestone', this.wrapHandler(this.handleStreakMilestone.bind(this))),
      eventBus.subscribe('streak:broken', this.wrapHandler(this.handleStreakBroken.bind(this))),
      eventBus.subscribe('coach:comeback_detected', this.wrapHandler(this.handleUserReturned.bind(this))),
      eventBus.subscribe('progression:level_up', this.wrapHandler(this.handleLevelUp.bind(this))),
    ];
  }

  private wrapHandler<T>(handler: (event: T) => void): (event: T) => void {
    return (event: T) => {
      try { handler(event); } catch (error) {
        debug.error('Error handling event', error instanceof Error ? error : new Error(String(error)));
      }
    };
  }

  cleanup(): void {
    this.unsubscribeFunctions.forEach((unsub) => unsub());
    this.unsubscribeFunctions = [];
  }

  private notifyListeners(): void {
    this.listeners.forEach((listener) => listener(this.state));
  }

  subscribe(listener: (state: CompanionPersonalityState) => void): () => void {
    this.listeners.add(listener);
    listener(this.state);
    return () => { this.listeners.delete(listener); };
  }

  private triggerResponse(
    type: PersonalityEventType,
    userId: string,
    customDialogue?: string[],
  ): void {
    const responses = RESPONSES[type];
    if (!responses || responses.length === 0) return;
    const response = responses[Math.floor(Math.random() * responses.length)];
    if (!response) return;
    const activeResponse: ActiveResponse = {
      type,
      response: customDialogue ? { ...response, dialogue: customDialogue } : response,
      timestamp: Date.now(),
    };
    this.state = {
      ...this.state,
      currentResponse: activeResponse,
      responseHistory: [...this.state.responseHistory, activeResponse].slice(-20),
      isAnimating: true,
    };
    trackPersonalityResponse(userId, type, response.animation, response.dialogue.length);
    this.notifyListeners();
    setTimeout(() => {
      this.state = { ...this.state, currentResponse: null, isAnimating: false };
      this.notifyListeners();
    }, response.duration);
  }

  private handleBossDefeated(event: unknown): void {
    const payload = event as { bossName?: string; userId: string };
    const customDialogue = payload.bossName
      ? [`${payload.bossName} is down!`, 'Your focus was unstoppable!']
      : undefined;
    this.triggerResponse('BOSS_DEFEATED', payload.userId, customDialogue);
  }

  private handleSessionCompleted(event: unknown): void {
    const payload = event as { grade?: string; purity?: number; userId: string };
    if (payload.grade === 'S') {
      this.triggerResponse('S_GRADE_SESSION', payload.userId);
    } else if (payload.purity !== undefined && payload.purity >= 95) {
      this.triggerResponse('PERFECT_SESSION', payload.userId);
    }
  }

  private handleStreakMilestone(event: unknown): void {
    const payload = event as { days: number; userId: string };
    if (payload.days === 7 || payload.days === 14 || payload.days === 30) {
      const customDialogue =
        payload.days === 7 ? ['One week! We are just getting started.']
        : payload.days === 14 ? ['14 days. That is not luck. That is discipline.']
        : ['30-day streak!', 'You have built something real.'];
      this.triggerResponse('STREAK_MILESTONE', payload.userId, customDialogue);
    }
  }

  private handleStreakBroken(event: unknown): void {
    const payload = event as { previousStreak: number; userId: string };
    const customDialogue = payload.previousStreak >= 7
      ? [`${payload.previousStreak}-day streak ends.`, 'But your skills do not. Reset with me.']
      : undefined;
    this.triggerResponse('STREAK_BROKEN', payload.userId, customDialogue);
  }

  private handleUserReturned(event: unknown): void {
    const payload = event as { daysAbsent: number; userId: string };
    if (payload.daysAbsent >= 3) {
      const customDialogue = payload.daysAbsent >= 7
        ? ['Been a while.', 'But you are here now. That is enough.']
        : ['You came back!', 'That is what matters.'];
      this.triggerResponse('COMEBACK', payload.userId, customDialogue);
    }
  }

  private handleLevelUp(event: unknown): void {
    const payload = event as { newLevel: number; userId: string };
    this.triggerResponse('LEVEL_UP', payload.userId, [`Level ${payload.newLevel}!`, 'Growing stronger together.']);
  }

  getState(): CompanionPersonalityState {
    return { ...this.state };
  }

  clearCurrentResponse(): void {
    this.state = { ...this.state, currentResponse: null, isAnimating: false };
    this.notifyListeners();
  }
}

let instance: CompanionPersonalityEngine | null = null;

export function getCompanionPersonalityEngine(): CompanionPersonalityEngine {
  if (!instance) instance = new CompanionPersonalityEngine();
  return instance;
}

export function resetCompanionPersonalityEngine(): void {
  if (instance) instance.cleanup();
  instance = null;
}
