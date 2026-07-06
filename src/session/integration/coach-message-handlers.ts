import { eventBus } from '../../events';
import { getCoachPresenceMessage as getCoachPresenceMessageEnriched } from '../../features/coach-presence/copy-service';
import { buildCoachPresenceContext } from './sessionCoachContext';
import type { CoachMessage } from './coach-config';
import { debug } from './coach-config';

export function buildPresenceMessage(
  type: string,
  context: string,
  priority: CoachMessage['priority'],
  sessionMode: Parameters<typeof buildCoachPresenceContext>[0]['sessionMode'],
  pattern?: Parameters<typeof buildCoachPresenceContext>[0]['pattern'],
): CoachMessage {
  const output = getCoachPresenceMessageEnriched(
    buildCoachPresenceContext({ sessionMode, pattern }),
  );
  return {
    type,
    message: output.message,
    context,
    priority,
    actionButton: output.optionalActionLabel
      ? { label: output.optionalActionLabel, action: output.safeIntent }
      : undefined,
  };
}

export function sendCoachMessage(userId: string, message: CoachMessage): void {
  eventBus.publish('coach:intent', { userId, ...message });
  debug.debug('[Coach]', { userId, ...message, timestamp: Date.now() });
}
