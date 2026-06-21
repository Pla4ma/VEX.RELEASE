# no-chain-state-updates — manual fix checklist

Diagnostics found: **11**.

Estimated human time: 3-6 minutes.

## Per-file fixes

### src/features/ai-coach/components/CoachSessionBanner.tsx

- L79: Chaining state updates triggers an extra render each step.
- L83: Chaining state updates triggers an extra render each step.

### src/features/ai-coach/components/useCoachChat.ts

- L74: Chaining state updates triggers an extra render each step.

### src/features/focus-identity/components/MonthlyFocusReport.tsx

- L61: Chaining state updates triggers an extra render each step.

### src/screens/session/hooks/useCompanionSession.ts

- L111: Chaining state updates triggers an extra render each step.
- L120: Chaining state updates triggers an extra render each step.
- L126: Chaining state updates triggers an extra render each step.
- L133: Chaining state updates triggers an extra render each step.
- L148: Chaining state updates triggers an extra render each step.
- L155: Chaining state updates triggers an extra render each step.

### src/screens/session/hooks/useStudyQuizBreak.ts

- L43: Chaining state updates triggers an extra render each step.
