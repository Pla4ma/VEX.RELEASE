# no-derived-state — manual fix checklist

Diagnostics found: **36**.

Estimated human time: 9-18 minutes.

## Per-file fixes

### src/features/ai-coach/components/CoachInterventionBanner.tsx

- L75: Storing "isDismissed" in state when you can derive it from other values costs an extra render.

### src/features/ai-coach/components/CoachSessionBanner.tsx

- L79: Storing "currentMessageIndex" in state when you can derive it from other values costs an extra render.

### src/features/ai-coach/hooks/useCoachRecommendation.ts

- L149: Storing "behaviorProfile" in state when you can derive it from other values costs an extra render.

### src/features/ai-coach/hooks/useOfflineCoach.ts

- L86: Storing "isProcessing" in state when you can derive it from other values costs an extra render.

### src/features/content-study/hooks/useContentReview.ts

- L31: Storing "state" in state when you can derive it from other values costs an extra render.

### src/features/mastery/components/MasteryCard.tsx

- L31: Storing "cardState" in state when you can derive it from other values costs an extra render.

### src/features/notifications/SmartNotificationScheduler.ts

- L142: Storing "isLoading" in state when you can derive it from other values costs an extra render.

### src/features/session-runtime/components/InterruptionWarning.tsx

- L38: Storing "remainingSeconds" in state when you can derive it from other values costs an extra render.

### src/features/session-runtime/hooks/useSessionHistory.ts

- L28: Storing "isLoading" in state when you can derive it from other values costs an extra render.

### src/features/session-runtime/hooks/useSessionStats.ts

- L36: Storing "isLoading" in state when you can derive it from other values costs an extra render.

### src/features/session-start/hooks/useAdaptiveDifficulty.ts

- L65: Storing "dismissedAt" in state when you can derive it from other values costs an extra render.

### src/hooks/useApiCore.ts

- L181: Storing "state" in state when you can derive it from other values costs an extra render.

### src/hooks/usePaginatedApi.ts

- L56: Storing "hasMore" in state when you can derive it from other values costs an extra render.

### src/screens/companion/CompanionDetailScreen.tsx

- L39: "loadState" is only set here from other values, so storing it costs an extra render.

### src/screens/home/hooks/useHomeCompanion.ts

- L42: Storing "status" in state when you can derive it from other values costs an extra render.

### src/screens/profile/CompanionScreen.tsx

- L81: "loadState" is only set here from other values, so storing it costs an extra render.

### src/screens/profile/useMasteryState.ts

- L53: Storing "state" in state when you can derive it from other values costs an extra render.

### src/screens/session/components/CompanionGrowthSection.tsx

- L54: Storing "loadState" in state when you can derive it from other values costs an extra render.

### src/screens/session/hooks/useCompanionSession.ts

- L111: Storing "state" in state when you can derive it from other values costs an extra render.
- L120: Storing "eventLabel" in state when you can derive it from other values costs an extra render.

### src/screens/session/hooks/useSessionMastery.ts

- L31: Storing "masteryState" in state when you can derive it from other values costs an extra render.

### src/screens/session/hooks/useSessionSetupState.ts

- L74: Storing "selectedPreset" in state when you can derive it from other values costs an extra render.
- L75: Storing "selectedCategory" in state when you can derive it from other values costs an extra render.
- L79: Storing "selectedThemeId" in state when you can derive it from other values costs an extra render.
- L82: Storing "draftGoal" in state when you can derive it from other values costs an extra render.
- L87: Storing "selectedPreset" in state when you can derive it from other values costs an extra render.
- L88: Storing "selectedCategory" in state when you can derive it from other values costs an extra render.
- L89: Storing "customDuration" in state when you can derive it from other values costs an extra render.
- L92: Storing "selectedSessionMode" in state when you can derive it from other values costs an extra render.

### src/screens/session/hooks/useStudyQuizBreak.ts

- L43: Storing "quizBreakKey" in state when you can derive it from other values costs an extra render.

### src/session/components/InterruptionWarning.tsx

- L36: Storing "remainingSeconds" in state when you can derive it from other values costs an extra render.

### src/session/hooks/useSessionHistory.ts

- L28: Storing "isLoading" in state when you can derive it from other values costs an extra render.

### src/session/hooks/useSessionStats.ts

- L36: Storing "isLoading" in state when you can derive it from other values costs an extra render.

### src/shared/ui/PremiumErrorRecovery.tsx

- L118: Storing "isRetrying" in state when you can derive it from other values costs an extra render.

### src/shared/ui/PremiumPullToRefresh-main.tsx

- L48: Storing "refreshState" in state when you can derive it from other values costs an extra render.

### src/shared/ui/components/AnimatedCounter.tsx

- L92: Storing "displayValue" in state when you can derive it from other values costs an extra render.
