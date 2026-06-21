# no-cascading-set-state — manual fix checklist

Diagnostics found: **6**.

Estimated human time: 2-3 minutes.

## Per-file fixes

### src/features/ai-coach/components/CoachInterventionBanner.tsx

- L40: 3 setState calls in one useEffect redraw your screen each time they run together.

### src/features/session/StudyQuizBreak.tsx

- L29: 5 setState calls in one useEffect redraw your screen each time they run together.

### src/hooks/useReducedMotion.ts

- L65: 3 setState calls in one useEffect redraw your screen each time they run together.

### src/screens/session/hooks/useCompanionSession.ts

- L103: 3 setState calls in one useEffect redraw your screen each time they run together.

### src/screens/session/hooks/useSessionPurity.ts

- L58: 4 setState calls in one useEffect redraw your screen each time they run together.

### src/screens/session/hooks/useSessionSetupState.ts

- L68: 8 setState calls in one useEffect redraw your screen each time they run together.
