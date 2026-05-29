import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { z } from "zod";
import { getMMKVStorageAdapter } from "../../persistence/MMKVStorageAdapter";

export const UserPreferencesSchema = z.object({
  streakReminders: z.boolean().default(true),
  bossAlerts: z.boolean().default(true),
  squadNotifications: z.boolean().default(true),
  rivalNotifications: z.boolean().default(true),
  coachMessages: z.boolean().default(true),
  achievementUnlocks: z.boolean().default(true),
  soundEffects: z.boolean().default(true),
  haptics: z.boolean().default(true),
  analyticsEnabled: z.boolean().default(true),
});

export type UserPreferences = z.infer<typeof UserPreferencesSchema>;

interface SettingsState extends UserPreferences {
  setPreference: <K extends keyof UserPreferences>(
    key: K,
    value: UserPreferences[K],
  ) => void;
}

export const useSettingsStore = create<SettingsState>()(
  immer(
    persist(
      (set) => ({
        ...UserPreferencesSchema.parse({}),
        setPreference: (key, value) =>
          set((state) => {
            state[key] = value;
          }),
      }),
      {
        name: "user-settings",
        storage: createJSONStorage(() => getMMKVStorageAdapter()),
      },
    ),
  ),
);
