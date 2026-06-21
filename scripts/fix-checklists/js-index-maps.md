# js-index-maps — manual fix checklist

Diagnostics found: **8**.

Estimated human time: 2-4 minutes.

## Per-file fixes

### src/features/achievements/achievement-unlock.ts

- L54: This gets slow as your list grows because array.

### src/features/ai-coach/intervention/PredictiveInterventionEngine.ts

- L108: This gets slow as your list grows because array.
- L115: This gets slow as your list grows because array.

### src/features/ai-coach/message/message-quality-scoring.ts

- L31: This gets slow as your list grows because array.

### src/features/content-study/hooks/helpers.ts

- L52: This gets slow as your list grows because array.

### src/features/onboarding/onboarding-state.ts

- L107: This gets slow as your list grows because array.

### src/features/session-runtime/presets/preset-io.ts

- L41: This gets slow as your list grows because array.

### src/session/presets/preset-io.ts

- L41: This gets slow as your list grows because array.
