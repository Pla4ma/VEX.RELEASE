import { getFirstSessionConfig } from "../service";
import { useOnboardingStore } from "../store";

describe("first win onboarding flow", () => {
  beforeEach(() => {
    useOnboardingStore.getState().resetOnboarding();
  });

  it("keeps the first session immediately reachable after choosing a motivation style", () => {
    const store = useOnboardingStore.getState();

    store.startOnboarding();
    store.setExplicitMotivationStyle("coach_led");

    const config = getFirstSessionConfig();
    const updated = useOnboardingStore.getState();

    expect(updated.explicitMotivationStyle).toBe("coach_led");
    expect(updated.motivationProfile?.primary).toBe("coach_led");
    expect(config).toEqual({
      category: null,
      duration: 600,
      isOnboardingSession: true,
    });
  });
});
