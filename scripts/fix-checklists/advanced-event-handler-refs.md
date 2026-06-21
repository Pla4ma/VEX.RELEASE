# advanced-event-handler-refs — manual fix checklist

Diagnostics found: **1**.

Estimated human time: 1-2 minutes.

## Per-file fixes

### src/features/challenges/hooks/challengeMutations.ts

- L108: useEffect re-adds the "handleChallengeCompleted" listener every time the handler changes.
