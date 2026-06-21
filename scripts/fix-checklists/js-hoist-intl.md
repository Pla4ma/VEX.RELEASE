# js-hoist-intl — manual fix checklist

Diagnostics found: **3**.

Estimated human time: 1-2 minutes.

## Per-file fixes

### src/features/ai-coach/utils/timezone-core.ts

- L16: This is slow because new Intl.

### src/features/companion-promise/service-helpers.ts

- L9: This is slow because new Intl.

### src/features/notifications/retention-strategy-config.ts

- L10: This is slow because new Intl.
