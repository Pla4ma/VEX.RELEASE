/**
 * Companion Personality Engine
 *
 * Adds unique personality responses to significant user events.
 * The companion reacts with custom animations and dialogue to:
 * - Boss defeats
 * - S-grade sessions
 * - Long streak milestones
 * - Streak breaks
 * - Comeback after absence
 */

import { eventBus } from '../../events/EventBus';
import { createDebugger } from '../../utils/debug';
import type { CompanionState, CompanionMood } from './types';
import { trackPersonalityResponse } from './analytics';

const debug = createDebugger('companion-personality');

export type PersonalityEventType =
  | 'BOSS_DEFEATED'
  | 'S_GRADE_SESSION'
  | 'STREAK_MILESTONE'
  | 'STREAK_BROKEN'
  | 'COMEBACK'
  | 'LEVEL_UP'
  | 'PERFECT_SESSION';

interface PersonalityResponse {
  animation: 'victory' | 'celebration' | 'sympathy' | 'welcome' | 'growth' | 'excited';
  dialogue: string[];
  mood: CompanionMood;
  duration: number;
}

interface ActiveResponse {
  type: PersonalityEventType;
  response: PersonalityResponse;
  timestamp: number;
}

const RESPONSES: Record<PersonalityEventType, PersonalityResponse[]> = {
  BOSS_DEFEATED: [
    {
      animation: 'victory',
      dialogue: ['WE GOT HIM!', 'That was intense! We make a great team.'],
      mood: 'ECSTATIC',
      duration: 4000,
    },
    {
      animation: 'victory',
      dialogue: ['Boss down!', 'Your focus was unstoppable!'],
      mood: 'ECSTATIC',
      duration: 3500,
    },
    {
      animation: 'celebration',
      dialogue: ['Victory!', 'Another challenge conquered.'],
      mood: 'DETERMINED',
      duration: 3000,
    },
  ],

  S_GRADE_SESSION: [
    {
      animation: 'celebration',
      dialogue: ['You were unstoppable today.', 'Pure focus. Pure excellence.'],
      mood: 'ECSTATIC',
      duration: 4000,
    },
    {
      animation: 'growth',
      dialogue: ['S-grade! That is the standard.', 'You are becoming legendary.'],
      mood: 'DETERMINED',
      duration: 3500,
    },
    {
      animation: 'excited',
      dialogue: ['Incredible!', 'I felt that focus from here.'],
      mood: 'ECSTATIC',
      duration: 3000,
    },
  ],

  STREAK_MILESTONE: [
    {
      animation: 'celebration',
      dialogue: ['One week! We are just getting started.'],
      mood: 'ECSTATIC',
      duration: 3500,
    },
    {
      animation: 'growth',
      dialogue: ['14 days. That is not luck. That is discipline.'],
      mood: 'DETERMINED',
      duration: 4000,
    },
    {
      animation: 'celebration',
      dialogue: ['30-day streak!', 'You have built something real.'],
      mood: 'ECSTATIC',
      duration: 4500,
    },
  ],

  STREAK_BROKEN: [
    {
      animation: 'sympathy',
      dialogue: ['It happens.', 'We come back stronger tomorrow.'],
      mood: 'CONTENT',
      duration: 4000,
    },
    {
      animation: 'sympathy',
      dialogue: ['Streak is gone, but skills are not.', 'One session. Reset.'],
      mood: 'CONTENT',
      duration: 3500,
    },
    {
      animation: 'sympathy',
      dialogue: ['I am still here.', 'Ready when you are.'],
      mood: 'SLEEPY',
      duration: 3000,
    },
  ],

  COMEBACK: [
    {
      animation: 'welcome',
      dialogue: ['You came back!', 'That is what matters.'],
      mood: 'CONTENT',
      duration: 3500,
    },
    {
      animation: 'welcome',
      dialogue: ['3 days away feels long.', 'Let us ease back in.'],
      mood: 'CONTENT',
      duration: 4000,
    },
    {
      animation: 'growth',
      dialogue: ['Welcome back.', 'Your focus remembers you.'],
      mood: 'FOCUSED',
      duration: 3500,
    },
  ],

  LEVEL_UP: [
    {
      animation: 'growth',
      dialogue: ['Growing stronger!', 'Feel that energy?'],
      mood: 'DETERMINED',
      duration: 3000,
    },
    {
      animation: 'excited',
      dialogue: ['Level up!', 'We are evolving together.'],
      mood: 'ECSTATIC',
      duration: 3500,
    },
  ],

  PERFECT_SESSION: [
    {
      animation: 'celebration',
      dialogue: ['Perfection.', 'Not a single distraction.'],
      mood: 'ECSTATIC',
      duration: 4000,
    },
    {
      animation: 'growth',
      dialogue: ['Flawless focus.', 'That is the zone.'],
      mood: 'DETERMINED',
      duration: 3500,
    },
  ],
};

export interface CompanionPersonalityState {
  currentResponse: ActiveResponse | null;
  responseHistory: ActiveResponse[];
  isAnimating: boolean;
}

class CompanionPersonalityEngine {
  private state: CompanionPersonalityState = {
    currentResponse: null,
    responseHistory: [],
    isAnimating: false,
  };

  private listeners: Set<(state: CompanionPersonalityState) => void> = new Set();
  private unsubscribeFunctions: Array<() => void> = [];

  initialize(): void {
    // Subscribe to events from EventBus
    // Note: Event names match those defined in event-definitions.ts
    this.unsubscribeFunctions = [
      eventBus.subscribe('boss:defeated', this.wrapHandler(this.handleBossDefeated.bind(this))),
      eventBus.subscribe('session:completed', this.wrapHandler(this.handleSessionCompleted.bind(this))),
      eventBus.subscribe('streak:milestone', this.wrapHandler(this.handleStreakMilestone.bind(this))),
      eventBus.subscribe('streak:broken', this.wrapHandler(this.handleStreakBroken.bind(this))),
      eventBus.subscribe('coach:comeback_detected', this.wrapHandler(this.handleUserReturned.bind(this))),
      eventBus.subscribe('progression:level_up', this.wrapHandler(this.handleLevelUp.bind(this))),
    ];
  }

  /**
   * Wrap event handler with error catching
   */
  private wrapHandler<T>(handler: (event: T) => void): (event: T) => void {
    return (event: T) => {
      try {
        handler(event);
      } catch (error) {
        debug.error(
          'Error handling event',
          error instanceof Error ? error : new Error(String(error))
        );
        // Silently fail - personality responses are not critical
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
    return () => {
      this.listeners.delete(listener);
    };
  }

  private triggerResponse(type: PersonalityEventType, userId: string, customDialogue?: string[]): void {
    const responses = RESPONSES[type];
    if (!responses || responses.length === 0) {
      return;
    }

    const response = responses[Math.floor(Math.random() * responses.length)];
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

    // Track analytics
    trackPersonalityResponse(
      userId,
      type,
      response.animation,
      response.dialogue.length
    );

    this.notifyListeners();

    setTimeout(() => {
      this.state = {
        ...this.state,
        currentResponse: null,
        isAnimating: false,
      };
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
    } else if (payload.purity && payload.purity >= 95) {
      this.triggerResponse('PERFECT_SESSION', payload.userId);
    }
  }

  private handleStreakMilestone(event: unknown): void {
    const payload = event as { days: number; userId: string };

    if (payload.days === 7 || payload.days === 14 || payload.days === 30) {
      const customDialogue =
        payload.days === 7
          ? ['One week! We are just getting started.']
          : payload.days === 14
            ? ['14 days. That is not luck. That is discipline.']
            : ['30-day streak!', 'You have built something real.'];
      this.triggerResponse('STREAK_MILESTONE', payload.userId, customDialogue);
    }
  }

  private handleStreakBroken(event: unknown): void {
    const payload = event as { previousStreak: number; userId: string };

    const customDialogue =
      payload.previousStreak >= 7
        ? [
            `${payload.previousStreak}-day streak ends.`,
            'But your skills do not. Reset with me.',
          ]
        : undefined;
    this.triggerResponse('STREAK_BROKEN', payload.userId, customDialogue);
  }

  private handleUserReturned(event: unknown): void {
    const payload = event as { daysAbsent: number; userId: string };

    if (payload.daysAbsent >= 3) {
      const customDialogue =
        payload.daysAbsent >= 7
          ? ['Been a while.', 'But you are here now. That is enough.']
          : ['You came back!', 'That is what matters.'];
      this.triggerResponse('COMEBACK', payload.userId, customDialogue);
    }
  }

  private handleLevelUp(event: unknown): void {
    const payload = event as { newLevel: number; userId: string };
    const customDialogue = [`Level ${payload.newLevel}!`, 'Growing stronger together.'];
    this.triggerResponse('LEVEL_UP', payload.userId, customDialogue);
  }

  getState(): CompanionPersonalityState {
    return { ...this.state };
  }

  clearCurrentResponse(): void {
    this.state = {
      ...this.state,
      currentResponse: null,
      isAnimating: false,
    };
    this.notifyListeners();
  }
}

let instance: CompanionPersonalityEngine | null = null;

export function getCompanionPersonalityEngine(): CompanionPersonalityEngine {
  if (!instance) {
    instance = new CompanionPersonalityEngine();
  }
  return instance;
}

export function resetCompanionPersonalityEngine(): void {
  if (instance) {
    instance.cleanup();
  }
  instance = null;
}
