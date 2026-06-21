# async-defer-await — manual fix checklist

Diagnostics found: **5**.

Estimated human time: 2-3 minutes.

## Per-file fixes

### src/features/session-runtime/SessionOrchestrator.ts

- L87: This await blocks the function before an early-return that doesn't use the awaited value, so the skip path waits for nothing.

### src/features/session-runtime/utils/StateMachine.ts

- L115: This await blocks the function before an early-return that doesn't use the awaited value, so the skip path waits for nothing.

### src/features/streaks/streak-repair-quest.ts

- L138: This await blocks the function before an early-return that doesn't use the awaited value, so the skip path waits for nothing.

### src/session/SessionOrchestrator.ts

- L87: This await blocks the function before an early-return that doesn't use the awaited value, so the skip path waits for nothing.

### src/session/utils/StateMachine.ts

- L115: This await blocks the function before an early-return that doesn't use the awaited value, so the skip path waits for nothing.
