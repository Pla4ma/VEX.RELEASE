import { createFocusProfile, getFocusProfile, upsertFocusProfile } from "../service";

const mockStore = new Map<string, string>();

jest.mock("react-native-mmkv", () => ({
  MMKV: class MockMMKV {
    getString(key: string): string | undefined {
      return mockStore.get(key);
    }

    set(key: string, value: string | number | boolean): void {
      mockStore.set(key, String(value));
    }

    delete(key: string): void {
      mockStore.delete(key);
    }

    contains(key: string): boolean {
      return mockStore.has(key);
    }

    getAllKeys(): string[] {
      return Array.from(mockStore.keys());
    }
  },
}));

describe("focus profile — comprehensive", () => {
  beforeEach(() => {
    mockStore.clear();
  });

  it("creates profile from study onboarding input", async () => {
    const profile = await createFocusProfile({
      userId: "user-study",
      primaryGoal: "study",
      preferredSessionDurationMinutes: 15,
      preferredSessionMode: "STUDY",
      updatedAt: 1_764_000_000_000,
    });

    expect(profile.laneProfile.primaryLane).toBe("student");
    expect(profile.preferredSessionDurationMinutes).toBe(15);
    expect(profile.preferredSessionMode).toBe("STUDY");
    expect(profile.primaryGoal).toBe("study");
    expect(profile.userId).toBe("user-study");
  });

  it("creates profile from creative onboarding input", async () => {
    const profile = await createFocusProfile({
      userId: "user-creative",
      primaryGoal: "creative",
      preferredSessionDurationMinutes: 45,
      preferredSessionMode: "CREATIVE",
      updatedAt: 1_764_000_000_000,
    });

    expect(profile.laneProfile.primaryLane).toBe("deep_creative");
    expect(profile.preferredSessionDurationMinutes).toBe(45);
    expect(profile.preferredSessionMode).toBe("CREATIVE");
  });

  it("falls back to minimal_normal when no onboarding provided", async () => {
    const profile = await createFocusProfile({
      userId: "anonymous-user",
      updatedAt: 1_764_000_000_000,
    });

    expect(profile.primaryGoal).toBe("focus");
    expect(profile.laneProfile.primaryLane).toBe("minimal_normal");
    expect(profile.preferredSessionDurationMinutes).toBe(25);
    expect(profile.preferredSessionMode).toBe("FOCUS");
  });

  it("sets default notification preferences", async () => {
    const profile = await createFocusProfile({
      userId: "user-notif",
      updatedAt: 1_764_000_000_000,
    });

    expect(profile.notificationPreference).toEqual({
      maxPerDay: 1,
      quietHoursStart: 21,
      quietHoursEnd: 8,
      tone: "quiet",
    });
  });

  it("sets default memory consent values", async () => {
    const profile = await createFocusProfile({
      userId: "user-consent",
      updatedAt: 1_764_000_000_000,
    });

    expect(profile.memoryConsent).toEqual({
      allowBehaviorMemory: true,
      allowImportedContentMemory: false,
      allowSensitiveInference: false,
    });
  });

  it("persists and retrieves profile", async () => {
    const created = await createFocusProfile({
      userId: "user-persist",
      primaryGoal: "work",
      preferredSessionDurationMinutes: 50,
      preferredSessionMode: "DEEP_WORK",
      updatedAt: 1_764_000_000_000,
    });

    const retrieved = await getFocusProfile("user-persist");
    expect(retrieved).toEqual(created);
  });

  it("returns null for non-existent profile", async () => {
    const result = await getFocusProfile("non-existent-user");
    expect(result).toBeNull();
  });

  it("upsert creates new profile when none exists", async () => {
    const profile = await upsertFocusProfile({
      userId: "user-upsert-new",
      primaryGoal: "study",
      updatedAt: 1_764_000_000_000,
    });

    expect(profile.userId).toBe("user-upsert-new");
    expect(profile.primaryGoal).toBe("study");
  });

  it("upsert merges with existing profile", async () => {
    await createFocusProfile({
      userId: "user-upsert-merge",
      primaryGoal: "focus",
      preferredSessionDurationMinutes: 25,
      preferredSessionMode: "FOCUS",
      updatedAt: 1_764_000_000_000,
    });

    const updated = await upsertFocusProfile({
      userId: "user-upsert-merge",
      preferredSessionDurationMinutes: 40,
      updatedAt: 1_764_000_001_000,
    });

    expect(updated.preferredSessionDurationMinutes).toBe(40);
    expect(updated.primaryGoal).toBe("focus");
  });

  it("sets empty arrays for windows and triggers by default", async () => {
    const profile = await createFocusProfile({
      userId: "user-arrays",
      updatedAt: 1_764_000_000_000,
    });

    expect(profile.bestFocusWindows).toEqual([]);
    expect(profile.riskWindows).toEqual([]);
    expect(profile.avoidanceTriggers).toEqual([]);
  });

  it("defaults friction preference to soft", async () => {
    const profile = await createFocusProfile({
      userId: "user-friction",
      updatedAt: 1_764_000_000_000,
    });

    expect(profile.frictionPreference).toBe("soft");
  });
});
