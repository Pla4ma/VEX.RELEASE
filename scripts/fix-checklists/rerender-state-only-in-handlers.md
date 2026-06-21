# rerender-state-only-in-handlers — manual fix checklist

Diagnostics found: **16**.

Estimated human time: 4-8 minutes.

## Per-file fixes

### src/features/fab/components/FloatingActionButton.tsx

- L34: Each update to "isOpen" redraws your component for nothing because this useState is set but never shown on screen.

### src/features/focus-identity/components/MonthlyFocusReport.tsx

- L45: Each update to "hasPublishedView" redraws your component for nothing because this useState is set but never shown on screen.

### src/features/onboarding/components/FocusTimeScreen.tsx

- L94: Each update to "isAdvancing" redraws your component for nothing because this useState is set but never shown on screen.

### src/features/onboarding/components/GoalScreen.tsx

- L118: Each update to "isAdvancing" redraws your component for nothing because this useState is set but never shown on screen.

### src/features/onboarding/components/MotivationScreen.tsx

- L19: Each update to "isAdvancing" redraws your component for nothing because this useState is set but never shown on screen.

### src/features/onboarding/components/NameAndGoalScreen.tsx

- L43: Each update to "isAdvancing" redraws your component for nothing because this useState is set but never shown on screen.

### src/features/progression/components/level-up-overlay.tsx

- L35: Each update to "prevIsVisible" redraws your component for nothing because this useState is set but never shown on screen.

### src/features/progression/components/xp-progress-bar.tsx

- L64: Each update to "prevProgressPercent" redraws your component for nothing because this useState is set but never shown on screen.
- L65: Each update to "hideTimer" redraws your component for nothing because this useState is set but never shown on screen.

### src/features/progression/first-week-pacing/DeeperModePrompt.tsx

- L22: Each update to "isAdvancing" redraws your component for nothing because this useState is set but never shown on screen.

### src/features/session-runtime/components/CheckpointCelebration.tsx

- L53: Each update to "lastCheckpoint" redraws your component for nothing because this useState is set but never shown on screen.

### src/navigation/RootNavigator.tsx

- L49: Each update to "isNavigationReady" redraws your component for nothing because this useState is set but never shown on screen.

### src/session/components/CheckpointCelebration.tsx

- L53: Each update to "lastCheckpoint" redraws your component for nothing because this useState is set but never shown on screen.

### src/shared/monetization/components/ContextualPaywallBanner.tsx

- L34: Each update to "canShow" redraws your component for nothing because this useState is set but never shown on screen.

### src/shared/ui/components/OfflineBanner.tsx

- L36: Each update to "dismissTimer" redraws your component for nothing because this useState is set but never shown on screen.

### src/shared/ui/components/TabBar.tsx

- L26: Each update to "tabLayouts" redraws your component for nothing because this useState is set but never shown on screen.
