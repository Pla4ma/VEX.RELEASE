# async-parallel — manual fix checklist

Diagnostics found: **11**.

Estimated human time: 3-6 minutes.

## Per-file fixes

### src/features/account-deletion/service.ts

- L40: These 3 sequential await statements run one after another even though they look independent, so the page waits longer than it needs to.

### src/features/ai-coach/session/comeback-manager.ts

- L105: These 3 sequential await statements run one after another even though they look independent, so the page waits longer than it needs to.

### src/features/ai-coach/session/session-analyzer.ts

- L79: These 3 sequential await statements run one after another even though they look independent, so the page waits longer than it needs to.

### src/features/analytics/service/exports.ts

- L75: These 3 sequential await statements run one after another even though they look independent, so the page waits longer than it needs to.
- L127: These 4 sequential await statements run one after another even though they look independent, so the page waits longer than it needs to.

### src/features/companion-promise/hooks.ts

- L77: These 3 sequential await statements run one after another even though they look independent, so the page waits longer than it needs to.

### src/features/rescue-mode/completion-integration.ts

- L42: These 3 sequential await statements run one after another even though they look independent, so the page waits longer than it needs to.

### src/features/session-runtime/SessionPersistence.ts

- L60: These 4 sequential await statements run one after another even though they look independent, so the page waits longer than it needs to.

### src/screens/session/hooks/useFirstSessionStart.ts

- L100: These 3 sequential await statements run one after another even though they look independent, so the page waits longer than it needs to.

### src/session/SessionPersistence.ts

- L60: These 4 sequential await statements run one after another even though they look independent, so the page waits longer than it needs to.

### src/store/authSessionActions.ts

- L29: These 3 sequential await statements run one after another even though they look independent, so the page waits longer than it needs to.
