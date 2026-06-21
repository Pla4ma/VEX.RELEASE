# no-barrel-import — manual fix checklist

Diagnostics found: **32**.

Estimated human time: 8-16 minutes.

## Per-file fixes

### src/app/bootstrap.ts

- L8: This ships extra code in your app bundle & slows startup.

### src/errors/ErrorFallback.tsx

- L3: This ships extra code in your app bundle & slows startup.

### src/features/achievements/service.ts

- L8: This ships extra code in your app bundle & slows startup.

### src/features/analytics/integration-queries.ts

- L2: Importing from an index file pulls in extra code.

### src/features/challenges/components/ChallengeCard.tsx

- L3: This ships extra code in your app bundle & slows startup.

### src/features/challenges/components/ChallengeList.tsx

- L10: This ships extra code in your app bundle & slows startup.

### src/features/companion/components/CompanionMemoryTimeline.tsx

- L5: This ships extra code in your app bundle & slows startup.

### src/features/content-study/components/ContentInputActiveTab.tsx

- L3: This ships extra code in your app bundle & slows startup.

### src/features/mastery/components/MasteryCard.tsx

- L3: This ships extra code in your app bundle & slows startup.

### src/features/mastery/components/MasteryUnlockGate.tsx

- L3: This ships extra code in your app bundle & slows startup.

### src/features/session-runtime/components/SessionValidationFeedback.tsx

- L17: This ships extra code in your app bundle & slows startup.

### src/features/streaks/components/ComebackQuestCard.tsx

- L7: This ships extra code in your app bundle & slows startup.

### src/screens/auth/ResetPasswordScreen.tsx

- L14: This ships extra code in your app bundle & slows startup.

### src/screens/auth/VerifyEmailScreen.tsx

- L14: This ships extra code in your app bundle & slows startup.

### src/screens/companion/CompanionDetailScreen.tsx

- L4: This ships extra code in your app bundle & slows startup.

### src/screens/home/components/MilestoneNode.tsx

- L13: Importing from an index file pulls in extra code.

### src/screens/home/containers/HomeColdStartFallback.tsx

- L7: This ships extra code in your app bundle & slows startup.

### src/screens/onboarding/OnboardingFlowScreen.tsx

- L10: This ships extra code in your app bundle & slows startup.

### src/screens/onboarding/components/SignedOutOnboardingState.tsx

- L3: This ships extra code in your app bundle & slows startup.

### src/screens/profile/MasteryChallengesList.tsx

- L3: This ships extra code in your app bundle & slows startup.

### src/screens/profile/MemoryConsoleScreen.tsx

- L13: This ships extra code in your app bundle & slows startup.

### src/screens/session/components/CompanionGrowthSection.tsx

- L5: This ships extra code in your app bundle & slows startup.

### src/screens/session/components/SessionCompleteFooter.tsx

- L5: This ships extra code in your app bundle & slows startup.

### src/screens/session/components/SessionProgressionCard.tsx

- L3: This ships extra code in your app bundle & slows startup.

### src/screens/session/components/SessionReflectionSheet.tsx

- L4: This ships extra code in your app bundle & slows startup.

### src/screens/session/components/SessionSummaryUnavailable.tsx

- L3: This ships extra code in your app bundle & slows startup.

### src/screens/session/components/StudyProgressPanel.tsx

- L3: This ships extra code in your app bundle & slows startup.

### src/screens/streaks/StreakFuneralScreen.tsx

- L12: This ships extra code in your app bundle & slows startup.

### src/session/components/SessionValidationFeedback.tsx

- L17: This ships extra code in your app bundle & slows startup.

### src/shared/ui/components/ErrorFallback.tsx

- L13: This ships extra code in your app bundle & slows startup.

### src/shared/ui/components/StatusBanner.tsx

- L8: This ships extra code in your app bundle & slows startup.

### src/shared/ui/components/StepIndicator.tsx

- L12: This ships extra code in your app bundle & slows startup.
