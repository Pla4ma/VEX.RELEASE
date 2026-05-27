import { clearSentryUser } from "../../config/sentry";
import {
  getDefaultStorageAdapter,
  getMMKVStorageAdapter,
  getSecureStorage,
  SecureStorageKeys,
} from "../../persistence";
import { revenueCatService } from "../../shared/monetization/revenuecat-service";
import {
  AccountDeletionInputSchema,
  AccountDeletionResultSchema,
  type AccountDeletionInput,
  type AccountDeletionResult,
} from "./schemas";
import {
  captureAccountDeletionError,
  trackAccountDeletionCompleted,
  trackAccountDeletionStarted,
} from "./analytics";
import { emitAccountDeletionCompleted } from "./events";
import { deleteCurrentUser, signOutCurrentSession } from "./repository";

export class AccountDeletionServiceError extends Error {
  constructor(
    public operation: string,
    public cause: unknown,
  ) {
    super(
      `Account deletion failed during ${operation}: ${cause instanceof Error ? cause.message : String(cause)}`,
    );
    this.name = "AccountDeletionServiceError";
  }
}

export async function deleteAccount(
  input: AccountDeletionInput,
): Promise<AccountDeletionResult> {
  const validated = AccountDeletionInputSchema.parse(input);
  trackAccountDeletionStarted(validated.userId);
  try {
    await deleteCurrentUser();
    const [monetizationSignedOut, secureStorageCleared, localStorageCleared] =
      await Promise.all([
        signOutMonetization(),
        clearSecureStorage(),
        clearLocalStorage(),
      ]);
    await signOutCurrentSession().catch((error: unknown) => {
      captureAccountDeletionError(error, "signOutCurrentSession");
    });
    clearSentryUser();
    const result = AccountDeletionResultSchema.parse({
      userId: validated.userId,
      deletedAt: Date.now(),
      localStorageCleared,
      secureStorageCleared,
      monetizationSignedOut,
    });
    trackAccountDeletionCompleted(validated.userId);
    emitAccountDeletionCompleted(result);
    return result;
  } catch (error) {
    captureAccountDeletionError(error, "deleteAccount");
    throw new AccountDeletionServiceError("deleteAccount", error);
  }
}

async function signOutMonetization(): Promise<boolean> {
  try {
    await revenueCatService.clearUserId();
    return true;
  } catch (error) {
    captureAccountDeletionError(error, "signOutMonetization");
    return false;
  }
}

async function clearSecureStorage(): Promise<boolean> {
  const storage = getSecureStorage();
  await Promise.all(
    Object.values(SecureStorageKeys).map((key) => storage.removeItem(key)),
  );
  return true;
}

async function clearLocalStorage(): Promise<boolean> {
  await getDefaultStorageAdapter().clear();
  await getMMKVStorageAdapter().removeItem("auth-storage");
  return true;
}
