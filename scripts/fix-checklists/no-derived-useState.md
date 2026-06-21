# no-derived-useState — manual fix checklist

Diagnostics found: **7**.

Estimated human time: 21-56 minutes.

## Per-file fixes

### src/features/ai-coach/components/primitives/error-state.tsx

- L44: Your users see a stale value when prop "retryAttempts" changes because useState copies it once.

### src/features/mastery/components/MasteryCard.tsx

- L28: Your users see a stale value when prop "state" changes because useState copies it once.

### src/features/progression/components/level-up-overlay.tsx

- L35: Your users see a stale value when prop "isVisible" changes because useState copies it once.

### src/features/session-runtime/components/InterruptionWarning.tsx

- L31: Your users see a stale value when prop "countdownSeconds" changes because useState copies it once.

### src/session/components/InterruptionWarning.tsx

- L30: Your users see a stale value when prop "countdownSeconds" changes because useState copies it once.

### src/shared/ui/components/AnimatedCounter.tsx

- L73: Your users see a stale value when prop "value" changes because useState copies it once.

### src/shared/ui/components/TransitionWrapper.tsx

- L55: Your users see a stale value when prop "visible" changes because useState copies it once.
