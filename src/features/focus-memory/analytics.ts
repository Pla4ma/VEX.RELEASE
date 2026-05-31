import { addBreadcrumb } from '../../config/sentry';
import type { FocusMemory } from './schemas';

export function trackFocusMemoryChanged(
  memory: FocusMemory,
  action: string,
): void {
  addBreadcrumb('Focus memory changed', 'focus-memory', {
    action,
    type: memory.type,
    accepted: memory.accepted,
  });
}
