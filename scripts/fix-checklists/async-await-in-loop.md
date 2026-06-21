# async-await-in-loop — manual fix checklist

Diagnostics found: **75**.

Estimated human time: 19-38 minutes.

## Per-file fixes

### jobs/challenges/daily-refresh.ts

- L60: Async callback in .
- L101: Async callback in .
- L135: Async callback in .

### jobs/challenges/expiry-reminders.ts

- L46: Async callback in .

### jobs/coach/cleanup-query.ts

- L145: Async callback in .

### jobs/coach/reminder-delivery.ts

- L51: Async callback in .
- L91: Async callback in .

### jobs/notifications/batch-send.ts

- L109: This makes the for-loop slow because each await runs one after another, so collect the independent calls & run them together with `await Promise.

### jobs/notifications/re-engagement-check.ts

- L87: This makes the for…of loop slow because each await runs one after another, so collect the independent calls & run them together with `await Promise.

### jobs/notifications/weekly-report.ts

- L87: This makes the for…of loop slow because each await runs one after another, so collect the independent calls & run them together with `await Promise.

### jobs/seasons/finalize-season.ts

- L29: This makes the for…of loop slow because each await runs one after another, so collect the independent calls & run them together with `await Promise.

### jobs/squad-wars/weekly-reset-notifications.ts

- L37: This makes the for…of loop slow because each await runs one after another, so collect the independent calls & run them together with `await Promise.

### jobs/squad-wars/weekly-reset.ts

- L18: This makes the for…of loop slow because each await runs one after another, so collect the independent calls & run them together with `await Promise.
- L97: This makes the for…of loop slow because each await runs one after another, so collect the independent calls & run them together with `await Promise.

### src/api/api-request-handler.ts

- L143: This makes the for-loop slow because each await runs one after another, so collect the independent calls & run them together with `await Promise.

### src/features/achievements/achievement-unlock.ts

- L56: This makes the for…of loop slow because each await runs one after another, so collect the independent calls & run them together with `await Promise.

### src/features/ai-coach/hooks/useOfflineCoach.ts

- L38: This makes the for…of loop slow because each await runs one after another, so collect the independent calls & run them together with `await Promise.

### src/features/ai-coach/intervention/intervention-evaluator.ts

- L41: This makes the for…of loop slow because each await runs one after another, so collect the independent calls & run them together with `await Promise.

### src/features/ai-coach/service/intervention-engine.ts

- L51: This makes the for…of loop slow because each await runs one after another, so collect the independent calls & run them together with `await Promise.

### src/features/ai-coach/session/session-analyzer.ts

- L148: This makes the for…of loop slow because each await runs one after another, so collect the independent calls & run them together with `await Promise.

### src/features/ai-coach/utils/retry-core.ts

- L56: This makes the for-loop slow because each await runs one after another, so collect the independent calls & run them together with `await Promise.

### src/features/analytics/repository/storage-upload.ts

- L104: This makes the for-loop slow because each await runs one after another, so collect the independent calls & run them together with `await Promise.

### src/features/analytics/service/patterns.ts

- L99: This makes the for…of loop slow because each await runs one after another, so collect the independent calls & run them together with `await Promise.

### src/features/analytics/validation/batch.ts

- L30: This makes the for-loop slow because each await runs one after another, so collect the independent calls & run them together with `await Promise.

### src/features/companion/memory-service.ts

- L52: This makes the for…of loop slow because each await runs one after another, so collect the independent calls & run them together with `await Promise.

### src/features/content-study/hooks/helpers.ts

- L45: This makes the for…of loop slow because each await runs one after another, so collect the independent calls & run them together with `await Promise.

### src/features/content-study/persistence/CacheManager.ts

- L82: This makes the for…of loop slow because each await runs one after another, so collect the independent calls & run them together with `await Promise.

### src/features/content-study/persistence/storage-utils.ts

- L56: This makes the for…of loop slow because each await runs one after another, so collect the independent calls & run them together with `await Promise.

### src/features/content-study/retry-strategy.ts

- L58: This makes the for-loop slow because each await runs one after another, so collect the independent calls & run them together with `await Promise.

### src/features/content-study/service.ts

- L176: This makes the for-loop slow because each await runs one after another, so collect the independent calls & run them together with `await Promise.

### src/features/focus-identity/repository-helpers.ts

- L16: This makes the for-loop slow because each await runs one after another, so collect the independent calls & run them together with `await Promise.

### src/features/liveops-config/feature-health.ts

- L75: This makes the for…of loop slow because each await runs one after another, so collect the independent calls & run them together with `await Promise.
- L101: This makes the for…of loop slow because each await runs one after another, so collect the independent calls & run them together with `await Promise.
- L121: This makes the for…of loop slow because each await runs one after another, so collect the independent calls & run them together with `await Promise.

### src/features/notifications/SmartNotificationScheduler-generators.ts

- L165: This makes the for…of loop slow because each await runs one after another, so collect the independent calls & run them together with `await Promise.

### src/features/notifications/SmartNotificationScheduler.ts

- L77: This makes the for…of loop slow because each await runs one after another, so collect the independent calls & run them together with `await Promise.

### src/features/notifications/social-notifications.ts

- L108: This makes the for…of loop slow because each await runs one after another, so collect the independent calls & run them together with `await Promise.
- L135: This makes the for…of loop slow because each await runs one after another, so collect the independent calls & run them together with `await Promise.

### src/features/progression/service-xp-core.ts

- L120: This makes the for-loop slow because each await runs one after another, so collect the independent calls & run them together with `await Promise.

### src/features/reward-ledger/service.ts

- L122: This makes the for…of loop slow because each await runs one after another, so collect the independent calls & run them together with `await Promise.

### src/features/session-completion/offline-sync-service.ts

- L68: This makes the for…of loop slow because each await runs one after another, so collect the independent calls & run them together with `await Promise.
- L157: This makes the for…of loop slow because each await runs one after another, so collect the independent calls & run them together with `await Promise.

### src/features/session-runtime/orchestrators/SessionLifecycle.ts

- L19: This makes the for-loop slow because each await runs one after another, so collect the independent calls & run them together with `await Promise.

### src/features/session-runtime/presets/preset-io.ts

- L45: This makes the for…of loop slow because each await runs one after another, so collect the independent calls & run them together with `await Promise.

### src/features/session-runtime/utils/RetryStrategy.ts

- L44: This makes the while-loop slow because each await runs one after another, so collect the independent calls & run them together with `await Promise.

### src/features/session-runtime/utils/StateMachine.ts

- L70: This makes the for…of loop slow because each await runs one after another, so collect the independent calls & run them together with `await Promise.
- L165: This makes the for…of loop slow because each await runs one after another, so collect the independent calls & run them together with `await Promise.

### src/features/session-start/repository.ts

- L134: This makes the for-loop slow because each await runs one after another, so collect the independent calls & run them together with `await Promise.

### src/features/session/repository/stakes-stats.ts

- L104: This makes the for…of loop slow because each await runs one after another, so collect the independent calls & run them together with `await Promise.

### src/features/settings/repository-sync.ts

- L95: This makes the for…of loop slow because each await runs one after another, so collect the independent calls & run them together with `await Promise.

### src/features/settings/repository.ts

- L121: This makes the for…of loop slow because each await runs one after another, so collect the independent calls & run them together with `await Promise.

### src/features/settings/settings-sync.ts

- L63: This makes the for…of loop slow because each await runs one after another, so collect the independent calls & run them together with `await Promise.

### src/features/streaks/repository/streak-repository-batch.ts

- L17: This makes the for…of loop slow because each await runs one after another, so collect the independent calls & run them together with `await Promise.

### src/features/streaks/repository/streak-repository.ts

- L174: This makes the for…of loop slow because each await runs one after another, so collect the independent calls & run them together with `await Promise.

### src/features/streaks/streak-repair-lifecycle.ts

- L96: This makes the for…of loop slow because each await runs one after another, so collect the independent calls & run them together with `await Promise.

### src/features/streaks/streak-risk-monitor.ts

- L135: This makes the for…of loop slow because each await runs one after another, so collect the independent calls & run them together with `await Promise.
- L154: This makes the for…of loop slow because each await runs one after another, so collect the independent calls & run them together with `await Promise.

### src/lib/offline/queue.ts

- L162: This makes the for…of loop slow because each await runs one after another, so collect the independent calls & run them together with `await Promise.

### src/lib/repository/batch-operations.ts

- L56: This makes the for…of loop slow because each await runs one after another, so collect the independent calls & run them together with `await Promise.

### src/lib/repository/retry.ts

- L40: This makes the for-loop slow because each await runs one after another, so collect the independent calls & run them together with `await Promise.

### src/network/RequestQueue.ts

- L120: This makes the while-loop slow because each await runs one after another, so collect the independent calls & run them together with `await Promise.

### src/persistence/MMKVProvider.ts

- L56: This makes the for…of loop slow because each await runs one after another, so collect the independent calls & run them together with `await Promise.
- L64: This makes the for…of loop slow because each await runs one after another, so collect the independent calls & run them together with `await Promise.

### src/persistence/MMKVStorageAdapter.ts

- L103: This makes the for…of loop slow because each await runs one after another, so collect the independent calls & run them together with `await Promise.

### src/persistence/PersistenceService.ts

- L152: This makes the for…of loop slow because each await runs one after another, so collect the independent calls & run them together with `await Promise.

### src/screens/home/components/Day0ActionSheet.tsx

- L73: This makes the for…of loop slow because each await runs one after another, so collect the independent calls & run them together with `await Promise.

### src/services/realtime.ts

- L187: This makes the for…of loop slow because each await runs one after another, so collect the independent calls & run them together with `await Promise.

### src/session/orchestrators/SessionLifecycle.ts

- L19: This makes the for-loop slow because each await runs one after another, so collect the independent calls & run them together with `await Promise.

### src/session/presets/preset-io.ts

- L45: This makes the for…of loop slow because each await runs one after another, so collect the independent calls & run them together with `await Promise.

### src/session/utils/RetryStrategy.ts

- L44: This makes the while-loop slow because each await runs one after another, so collect the independent calls & run them together with `await Promise.

### src/session/utils/StateMachine.ts

- L70: This makes the for…of loop slow because each await runs one after another, so collect the independent calls & run them together with `await Promise.
- L165: This makes the for…of loop slow because each await runs one after another, so collect the independent calls & run them together with `await Promise.

### src/shared/hardening/retry.ts

- L36: This makes the for-loop slow because each await runs one after another, so collect the independent calls & run them together with `await Promise.

### src/shared/monetization/revenuecat-service.ts

- L103: This makes the while-loop slow because each await runs one after another, so collect the independent calls & run them together with `await Promise.

### src/utils/haptics-types.ts

- L67: This makes the for-loop slow because each await runs one after another, so collect the independent calls & run them together with `await Promise.
