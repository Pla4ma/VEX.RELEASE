# rerender-lazy-state-init — manual fix checklist

Diagnostics found: **6**.

Estimated human time: 2-3 minutes.

## Per-file fixes

### src/features/session/hooks/useSessionTimer.ts

- L12: useState(now()) re-runs now() on every render & throws the result away.

### src/network/useNetInfo.ts

- L33: useState(getCurrentState()) re-runs getCurrentState() on every render & throws the result away.

### src/screens/boss/BossScreen.tsx

- L95: useState(nextResetLabel()) re-runs nextResetLabel() on every render & throws the result away.

### src/screens/onboarding/hooks/useOnboardingFlow.ts

- L36: useState(clampStep()) re-runs clampStep() on every render & throws the result away.

### src/screens/profile/useProfileData.ts

- L54: useState(makeMastery()) re-runs makeMastery() on every render & throws the result away.

### src/screens/session/hooks/useSessionSetupState.ts

- L58: useState(shouldOpenCustomizationByDefault()) re-runs shouldOpenCustomizationByDefault() on every render & throws the result away.
