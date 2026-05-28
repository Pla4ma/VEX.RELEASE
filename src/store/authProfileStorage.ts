import { UserSchema } from "../features/auth/schemas";
import {
  getSecureStorage,
  SecureStorageKeys,
} from "../persistence/SecureStorage";
import type { User } from "../types/models";
import { createDebugger } from "../utils/debug";

const debug = createDebugger("store:auth-profile");

export async function saveUserProfile(user: User): Promise<void> {
  const secureStorage = getSecureStorage();
  await secureStorage.setItem(
    SecureStorageKeys.USER_PROFILE,
    JSON.stringify(user),
  );
}

export async function loadUserProfile(): Promise<User | null> {
  const secureStorage = getSecureStorage();
  const rawProfile = await secureStorage.getItem(SecureStorageKeys.USER_PROFILE);
  if (!rawProfile) {
    return null;
  }
  try {
    const parsedJson: unknown = JSON.parse(rawProfile);
    const parsedProfile = UserSchema.safeParse(parsedJson);
    return parsedProfile.success ? parsedProfile.data : null;
  } catch (error) {
    debug.warn("[AuthProfileStorage] Failed to parse stored user profile", error);
    return null;
  }
}

export async function removeUserProfile(): Promise<void> {
  const secureStorage = getSecureStorage();
  await secureStorage.removeItem(SecureStorageKeys.USER_PROFILE);
}
