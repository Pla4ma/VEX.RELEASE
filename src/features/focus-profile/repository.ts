import { storage } from "../../store/mmkv-storage";
import { FocusProfileSchema, type FocusProfile } from "./schemas";

const KEY_PREFIX = "focus-profile:";

function keyFor(userId: string): string {
  return `${KEY_PREFIX}${userId}`;
}

export async function getStoredFocusProfile(
  userId: string,
): Promise<FocusProfile | null> {
  const raw = storage.getString(keyFor(userId));
  if (!raw) return null;
  return FocusProfileSchema.parse(JSON.parse(raw));
}

export async function upsertStoredFocusProfile(
  profile: FocusProfile,
): Promise<FocusProfile> {
  const parsed = FocusProfileSchema.parse(profile);
  storage.set(keyFor(parsed.userId), JSON.stringify(parsed));
  return parsed;
}
