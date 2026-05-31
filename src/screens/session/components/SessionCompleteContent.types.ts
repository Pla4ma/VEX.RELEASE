import type { SessionCompletionConsequences } from '../../../features/session-completion/story-consequence-service';
import type { SessionSummary } from '../../../session/types';
import type { Lane } from '../../../features/lane-engine/types';
import { SessionMode } from '../../../session/modes';

export const SESSION_MODE_TO_LANE: Record<string, Lane> = {
  [SessionMode.STUDY]: 'student',
  [SessionMode.LIGHT_FOCUS]: 'game_like',
  [SessionMode.DEEP_WORK]: 'deep_creative',
  [SessionMode.CREATIVE]: 'minimal_normal',
};

export type SessionCompleteContentProps = {
  sessionId: string;
  summary: SessionSummary;
  consequences?: SessionCompletionConsequences;
};
