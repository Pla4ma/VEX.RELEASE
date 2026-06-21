# no-initialize-state — manual fix checklist

Diagnostics found: **3**.

Estimated human time: 1-2 minutes.

## Per-file fixes

### src/features/ai-coach/hooks/useOfflineCoach.ts

- L26: Your users see an extra render with empty "pendingCount" because a useEffect sets its starting value.

### src/features/onboarding/hooks/useOnboardingResumeState.ts

- L73: Your users see an extra render with empty "state" because a useEffect sets its starting value.
- L74: Your users see an extra render with empty "isVisible" because a useEffect sets its starting value.
