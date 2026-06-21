# server-sequential-independent-await — manual fix checklist

Diagnostics found: **13**.

Estimated human time: 4-7 minutes.

## Per-file fixes

### jobs/coach/reminder-delivery-query.ts

- L62: This await doesn't use the previous result, so your users wait twice as long for nothing.

### src/features/ai-coach/analytics-detail/performance-summary.ts

- L30: This await doesn't use the previous result, so your users wait twice as long for nothing.

### src/features/ai-coach/intervention/intervention-evaluator.ts

- L32: This await doesn't use the previous result, so your users wait twice as long for nothing.

### src/features/ai-coach/policy/priority-policy.ts

- L29: This await doesn't use the previous result, so your users wait twice as long for nothing.

### src/features/ai-coach/session/offline-queue.ts

- L57: This await doesn't use the previous result, so your users wait twice as long for nothing.

### src/features/analytics/repository/storage.ts

- L52: This await doesn't use the previous result, so your users wait twice as long for nothing.

### src/features/challenges/basic-challenges-operations.ts

- L72: This await doesn't use the previous result, so your users wait twice as long for nothing.
- L108: This await doesn't use the previous result, so your users wait twice as long for nothing.

### src/features/companion/profile-service.ts

- L123: This await doesn't use the previous result, so your users wait twice as long for nothing.

### src/features/session-runtime/repository/SessionRepository.ts

- L188: This await doesn't use the previous result, so your users wait twice as long for nothing.

### src/features/streaks/streak-repair-lifecycle.ts

- L54: This await doesn't use the previous result, so your users wait twice as long for nothing.

### src/persistence/StorageManager.ts

- L164: This await doesn't use the previous result, so your users wait twice as long for nothing.

### src/session/repository/SessionRepository.ts

- L188: This await doesn't use the previous result, so your users wait twice as long for nothing.
