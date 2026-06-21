# query-mutation-missing-invalidation — manual fix checklist

Diagnostics found: **8**.

Estimated human time: 2-4 minutes.

## Per-file fixes

### src/features/capture/hooks.ts

- L31: useMutation with no cache update leaves your users looking at stale data after it runs.

### src/features/companion-promise/hooks.ts

- L86: useMutation with no cache update leaves your users looking at stale data after it runs.
- L103: useMutation with no cache update leaves your users looking at stale data after it runs.

### src/features/settings/hooks/useCategoryMutations.ts

- L126: useMutation with no cache update leaves your users looking at stale data after it runs.

### src/shared/hooks/useOfflineAwareMutation.ts

- L12: useMutation with no cache update leaves your users looking at stale data after it runs.

### src/shared/sharing/hooks.ts

- L24: useMutation with no cache update leaves your users looking at stale data after it runs.
- L64: useMutation with no cache update leaves your users looking at stale data after it runs.
- L99: useMutation with no cache update leaves your users looking at stale data after it runs.
