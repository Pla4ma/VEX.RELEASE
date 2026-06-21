# js-hoist-regexp — manual fix checklist

Diagnostics found: **3**.

Estimated human time: 1-2 minutes.

## Per-file fixes

### src/features/ai-coach/memory/memory-message-templates.ts

- L182: `new RegExp()` rebuilds the pattern on every loop pass.

### src/shared/accessibility/i18n.ts

- L29: `new RegExp()` rebuilds the pattern on every loop pass.

### src/shared/ai/ai-fallback-tiers.ts

- L89: `new RegExp()` rebuilds the pattern on every loop pass.
