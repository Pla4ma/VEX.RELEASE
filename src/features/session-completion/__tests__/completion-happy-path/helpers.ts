import { SessionMode } from '../../../../session/modes';
import {
  buildCompletionPersonalization,
  buildCompletionPersonalizationResult,
} from '../../completion-personalization';
import { createSessionSummary, SESSION_ID } from '../ledger-test-utils';
import type { Lane } from '../../../lane-engine/types';

export { buildCompletionPersonalization, buildCompletionPersonalizationResult };
export { createSessionSummary, SESSION_ID };
export { SessionMode };
export type { Lane };

export const LANES: Lane[] = [
  'student',
  'game_like',
  'deep_creative',
  'minimal_normal',
];

export const CLEAN_QUESTIONS: Record<Lane, number> = {
  student: 1,
  game_like: 1,
  deep_creative: 1,
  minimal_normal: 1,
};
