import { eventBus } from '../../events';
import type { AccountDeletionResult } from './schemas';

export const AccountDeletionEvents = {
  COMPLETED: 'account-deletion:completed',
} as const;

export function emitAccountDeletionCompleted(
  result: AccountDeletionResult,
): void {
  eventBus.emit(AccountDeletionEvents.COMPLETED, {
    result,
    timestamp: Date.now(),
  });
}
