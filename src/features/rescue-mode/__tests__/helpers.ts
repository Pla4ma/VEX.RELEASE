import {
  createRescuePlan,
  buildRescueCompletionMemory,
  buildRescueCompletionRecord,
  generateRescueReflection,
  isRescueEligible,
  shouldSendRescuePush,
  buildRescuePushPayload,
} from '../service';
import type { RescuePlan } from '../schemas';

export function makePlan(overrides?: Partial<RescuePlan>): RescuePlan {
  return createRescuePlan({
    userId: 'u1',
    lane: 'student',
    reason: 'unclear',
    createdAt: 100,
    ...overrides,
  });
}

export {
  createRescuePlan,
  buildRescueCompletionMemory,
  buildRescueCompletionRecord,
  generateRescueReflection,
  isRescueEligible,
  shouldSendRescuePush,
  buildRescuePushPayload,
};
