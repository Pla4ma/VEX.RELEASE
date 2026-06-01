import { eventBus } from '../../events/EventBus';
import { createDebugger } from '../../utils/debug';
import { getAvailabilityFor } from '../liveops-config/feature-access-store';
import { trackPersonalityResponse } from './analytics';
import type {
  PersonalityEventType,
  ActiveResponse,
  CompanionPersonalityState,
} from './personality-responses';
import { RESPONSES } from './personality-responses';
import {
  handleBossDefeated,
  handleSessionCompleted,
  handleStreakMilestone,
  handleStreakBroken,
  handleUserReturned,
  handleLevelUp,
  type TriggerFn,
} from './companion-event-handlers';

const debug = createDebugger('companion-personality');
const FEATURE_KEY = 'companion_detail' as const;

export type { PersonalityEventType, ActiveResponse, CompanionPersonalityState };

class CompanionPersonalityEngine {
  private state: CompanionPersonalityState = {
    currentResponse: null,
    responseHistory: [],
    isAnimating: false,
  };

  private listeners: Set<(state: CompanionPersonalityState) => void> =
    new Set();
  private unsubscribeFunctions: Array<() => void> = [];

  initialize(): void {
    const availability = getAvailabilityFor(FEATURE_KEY);
    if (!availability.canSubscribeToEvents) {
      debug.info('CompanionPersonalityEngine skipped — feature not available');
      return;
    }
    this.unsubscribeFunctions = [
      eventBus.subscribe(
        'boss:defeated',
        this.wrapHandler((e) => handleBossDefeated(this.trigger, e)),
      ),
      eventBus.subscribe(
        'session:completed',
        this.wrapHandler((e) => handleSessionCompleted(this.trigger, e)),
      ),
      eventBus.subscribe(
        'streak:milestone',
        this.wrapHandler((e) => handleStreakMilestone(this.trigger, e)),
      ),
      eventBus.subscribe(
        'streak:broken',
        this.wrapHandler((e) => handleStreakBroken(this.trigger, e)),
      ),
      eventBus.subscribe(
        'coach:comeback_detected',
        this.wrapHandler((e) => handleUserReturned(this.trigger, e)),
      ),
      eventBus.subscribe(
        'progression:level_up',
        this.wrapHandler((e) => handleLevelUp(this.trigger, e)),
      ),
    ];
  }

  private wrapHandler<T>(handler: (event: T) => void): (event: T) => void {
    return (event: T) => {
      try {
        handler(event);
      } catch (error) {
        debug.error(
          'Error handling event',
          error instanceof Error ? error : new Error(String(error)),
        );
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

  private trigger: TriggerFn = (type, userId, customDialogue) => {
    const responses = RESPONSES[type];
    if (!responses || responses.length === 0) {return;}
    const response = responses[Math.floor(Math.random() * responses.length)];
    if (!response) {return;}
    const activeResponse: ActiveResponse = {
      type,
      response: customDialogue
        ? { ...response, dialogue: customDialogue }
        : response,
      timestamp: Date.now(),
    };
    this.state = {
      ...this.state,
      currentResponse: activeResponse,
      responseHistory: [...this.state.responseHistory, activeResponse].slice(
        -20,
      ),
      isAnimating: true,
    };
    trackPersonalityResponse(
      userId,
      type,
      response.animation,
      response.dialogue.length,
    );
    this.notifyListeners();
    setTimeout(() => {
      this.state = { ...this.state, currentResponse: null, isAnimating: false };
      this.notifyListeners();
    }, response.duration);
  };

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
  if (!instance) {instance = new CompanionPersonalityEngine();}
  return instance;
}

export function resetCompanionPersonalityEngine(): void {
  if (instance) {instance.cleanup();}
  instance = null;
}
