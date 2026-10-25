import { clearSentryUser } from '../../config/sentry';
import {
  getDefaultStorageAdapter,
  getMMKVStorageAdapter,
} from '../../persistence/MMKVStorageAdapter';
import { getSecureStorage, SecureStorageKeys } from '../../persistence/SecureStorage';
import { revenueCatService } from '../../shared/monetization/revenuecat-service';
import {
  AccountDeletionInputSchema,
  AccountDeletionResultSchema,
  type AccountDeletionInput,
  type AccountDeletionResult,
} from './schemas';
import {
  captureAccountDeletionError,
  trackAccountDeletionCompleted,
  trackAccountDeletionStarted,
} from './analytics';
import { emitAccountDeletionCompleted } from './events';
import { deleteCurrentUser, signOutCurrentSession } from './repository';

export class AccountDeletionServiceError extends Error {
  constructor(
    public operation: string,
    public cause: unknown,
  ) {
    super(
      `Account deletion failed during ${operation}: ${cause instanceof Error ? cause.message : String(cause)}`,
    );
    this.name = 'AccountDeletionServiceError';
  }
}

export async function deleteAccount(
  input: AccountDeletionInput,
): Promise<AccountDeletionResult> {
  const validated = AccountDeletionInputSchema.parse(input);
  trackAccountDeletionStarted(validated.userId);
  try {
    await deleteCurrentUser();

    const monetizationSignedOut = await signOutMonetization();
    const secureStorageCleared = await clearSecureStorage();
    const localStorageCleared = await clearLocalStorage();
    let sessionSignedOut = true;
    try {
      await signOutCurrentSession();
    } catch (error: unknown) {
      safelyCaptureAccountDeletionError(error, 'signOutCurrentSession');
      sessionSignedOut = false;
    }
    let sentryIdentityCleared = true;
    try {
      clearSentryUser();
    } catch (error: unknown) {
      safelyCaptureAccountDeletionError(error, 'clearSentryUser');
      sentryIdentityCleared = false;
    }

    const result = AccountDeletionResultSchema.parse({
      userId: validated.userId,
      deletedAt: Date.now(),
      localStorageCleared,
      secureStorageCleared,
      sessionSignedOut,
      monetizationSignedOut,
      sentryIdentityCleared,
    });
    try {
      trackAccountDeletionCompleted(validated.userId);
    } catch (error: unknown) {
      safelyCaptureAccountDeletionError(error, 'trackAccountDeletionCompleted');
    }
    try {
      emitAccountDeletionCompleted(result);
    } catch (error: unknown) {
      safelyCaptureAccountDeletionError(error, 'emitAccountDeletionCompleted');
    }
    return result;
  } catch (error) {
    safelyCaptureAccountDeletionError(error, 'deleteAccount');
    throw new AccountDeletionServiceError('deleteAccount', error);
  }
}
 
async function signOutMonetization(): Promise<boolean> {
  try {
    await revenueCatService.clearUserId();
    return true;
  } catch (error) {
    safelyCaptureAccountDeletionError(error, 'signOutMonetization');
    return false;
  }
}

async function clearSecureStorage(): Promise<boolean> {
  try {
    const storage = getSecureStorage();
    await Promise.all(
      Object.values(SecureStorageKeys).map((key) => storage.removeItem(key)),
    );
    return true;
  } catch (error) {
    safelyCaptureAccountDeletionError(error, 'clearSecureStorage');
    return false;
  }
}

async function clearLocalStorage(): Promise<boolean> {
  let cleared = true;
  try {
    await getDefaultStorageAdapter().clear();
  } catch (error) {
    safelyCaptureAccountDeletionError(error, 'clearDefaultStorage');
    cleared = false;
  }
  try {
    await getMMKVStorageAdapter().removeItem('auth-storage');
  } catch (error) {
    safelyCaptureAccountDeletionError(error, 'clearAuthStorage');
    cleared = false;
  }
  return cleared;
}
function safelyCaptureAccountDeletionError(error: unknown, operation: string): void {
  try {
    captureAccountDeletionError(error, operation);
  } catch {
    // Telemetry must not change the result of account deletion.
  }
}

