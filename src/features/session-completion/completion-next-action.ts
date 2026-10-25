import type { SessionSummary } from '../../session/types';
import { captureSilentFailure } from '../../utils/silent-failure';
import { buildPostSessionNextAction } from './post-session-next-action';
import type { PostSessionNextAction } from './schemas';

export function resolveCompletionNextAction(
  summary: SessionSummary,
): PostSessionNextAction | null {
  try {
    return buildPostSessionNextAction({ summary });
  } catch (error: unknown) {
    captureSilentFailure(error, {
      feature: 'session-completion',
      operation: 'next-action',
      type: 'ui',
    });
    return null;
  }
}
