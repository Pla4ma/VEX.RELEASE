# prefer-module-scope-static-value — manual fix checklist

Diagnostics found: **12**.

Estimated human time: 3-6 minutes.

## Per-file fixes

### .agents/skills/remotion-video-creation/rules/assets/charts-bar-chart.tsx

- L125: `data` inside `MyAnimation` uses no local state but is rebuilt every render, so it looks new each time & breaks memoized children.
- L138: `yAxisSteps` inside `MyAnimation` uses no local state but is rebuilt every render, so it looks new each time & breaks memoized children.

### src/features/achievements/hooks-computed.ts

- L86: `rarities` inside `useAchievementStats` uses no local state but is rebuilt every render, so it looks new each time & breaks memoized children.

### src/features/onboarding/components/WelcomeScreen.tsx

- L94: `paths` inside `WelcomeScreen` uses no local state but is rebuilt every render, so it looks new each time & breaks memoized children.

### src/features/session-runtime/components/useComboAnimations.ts

- L62: `milestones` inside `useComboAnimations` uses no local state but is rebuilt every render, so it looks new each time & breaks memoized children.

### src/screens/auth/components/EditorialFieldBlock.tsx

- L36: `errorStyle` inside `EditorialFieldBlock` uses no local state but is rebuilt every render, so it looks new each time & breaks memoized children.

### src/screens/auth/components/ethereal/EtherealAuthButtons.tsx

- L37: `appleSpec` inside `EtherealAuthButtons` uses no local state but is rebuilt every render, so it looks new each time & breaks memoized children.

### src/screens/home/hooks/useHomeData.ts

- L33: `squadMembersFocusing` inside `useHomeData` uses no local state but is rebuilt every render, so it looks new each time & breaks memoized children.

### src/screens/home/hooks/usePowerUserHomeData.ts

- L40: `squadMembersFocusing` inside `usePowerUserHomeData` uses no local state but is rebuilt every render, so it looks new each time & breaks memoized children.

### src/screens/onboarding/components/ethereal/PngMascotStyles.ts

- L88: `sparkleTwoBaseStyle` inside `useMascotAnimatedStyles` uses no local state but is rebuilt every render, so it looks new each time & breaks memoized children.

### src/session/components/useComboAnimations.ts

- L62: `milestones` inside `useComboAnimations` uses no local state but is rebuilt every render, so it looks new each time & breaks memoized children.

### src/shared/ui/components/StepIndicator.tsx

- L55: `sizeConfig` inside `StepIndicator` uses no local state but is rebuilt every render, so it looks new each time & breaks memoized children.
