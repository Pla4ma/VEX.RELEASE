import { OnboardingRepository } from "../OnboardingRepository";
import type { OnboardingState } from "../../schemas";

const mockStore = new Map<string, string>();

jest.mock("react-native-mmkv", () => ({
  MMKV: class MockMMKV {
    getString(key: string): string | undefined {
      return mockStore.get(key);
    }

    set(key: string, value: string): void {
      mockStore.set(key, value);
    }

    delete(key: string): void {
      mockStore.delete(key);
    }

    contains(key: string): boolean {
      return mockStore.has(key);
    }
  },
}));

jest.mock("../../../../utils/silent-failure", () => ({
  captureSilentFailure: jest.fn(),
}));

describe("OnboardingRepository persistence", () => {
  const state: OnboardingState = {
    isOnboarded: false,
    currentStep: 2,
    goal: "WORK",
    focusDuration: 25,
    displayName: "Vex",
    startedAt: 1000,
    completedAt: null,
  };

  beforeEach(() => {
    mockStore.clear();
  });

  it("validates and restores onboarding state from primary storage", async () => {
    const repository = new OnboardingRepository();

    await repository.saveOnboardingState("user-1", state);

    await expect(repository.getOnboardingState("user-1")).resolves.toEqual(
      state,
    );
  });

  it("repairs primary onboarding state from backup when primary is corrupted", async () => {
    const repository = new OnboardingRepository();
    await repository.saveOnboardingState("user-2", state);
    mockStore.set("onboarding:state:user-2", "{broken");

    await expect(repository.getOnboardingState("user-2")).resolves.toEqual(
      state,
    );
    expect(mockStore.get("onboarding:state:user-2")).toBe(
      JSON.stringify(state),
    );
  });

  it("returns null instead of malformed persisted state", async () => {
    mockStore.set(
      "onboarding:state:user-3",
      JSON.stringify({ currentStep: 99 }),
    );

    await expect(
      new OnboardingRepository().getOnboardingState("user-3"),
    ).resolves.toBeNull();
  });
});
