import { jest } from '@jest/globals';
import {
  determineOptimalState,
  resolveCoachState,
  transitionState,
  checkAutoTransitions,
  StateTransitionError,
} from '../service/coach-state-machine';
import type { CoachSignals } from '../service/coach-state-machine';
import type { BehaviorProfile, CoachState } from '../schemas';
import * as repository from '../repository';

jest.mock('../repository');

export const mockUserId = '11111111-1111-4111-8111-111111111111';

export function makeProfile(
  overrides: Partial<BehaviorProfile> = {},
): BehaviorProfile {
  return {
    userId: mockUserId,
    signals: [],
    lastUpdated: Date.now(),
    confidenceLevel: 'LOW',
    coldStart: true,
    dataPoints: 0,
    ...overrides,
  };
}

export function makeCoachState(
  overrides: Partial<CoachState> = {},
): CoachState {
  return {
    userId: mockUserId,
    currentState: 'COLD_START',
    previousState: null,
    stateEnteredAt: Date.now(),
    personaId: '00000000-0000-4000-a000-000000000001',
    behaviorProfile: null,
    lastInterventionAt: null,
    interventionsToday: 0,
    muteUntil: null,
    reduceNotifications: false,
    ...overrides,
  };
}

export {
  resolveCoachState,
  determineOptimalState,
  transitionState,
  checkAutoTransitions,
  StateTransitionError,
  repository,
};

export type { CoachSignals };
