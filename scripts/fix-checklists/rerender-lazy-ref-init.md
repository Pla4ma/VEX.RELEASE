# rerender-lazy-ref-init — manual fix checklist

Diagnostics found: **19**.

Estimated human time: 5-10 minutes.

## Per-file fixes

### src/analytics/hooks/useAnalytics.ts

- L29: useRef(new Set()) rebuilds this value on every render & throws it away.

### src/features/session-runtime/components/SquadSyncIndicator.tsx

- L44: useRef(new Set()) rebuilds this value on every render & throws it away.
- L45: useRef(new Set()) rebuilds this value on every render & throws it away.

### src/features/session-runtime/hooks/useSession.ts

- L28: useRef(getSessionOrchestrator()) rebuilds this value on every render & throws it away.
- L30: useRef(createSessionActions()) rebuilds this value on every render & throws it away.

### src/features/session-runtime/hooks/useSessionHistory.ts

- L7: useRef(getSessionOrchestrator()) rebuilds this value on every render & throws it away.

### src/features/session-runtime/hooks/useSessionPresets.ts

- L5: useRef(getSessionOrchestrator()) rebuilds this value on every render & throws it away.

### src/features/session-runtime/hooks/useSessionStats.ts

- L9: useRef(getSessionOrchestrator()) rebuilds this value on every render & throws it away.

### src/screens/home/hooks/useHomeAnalyticsEffects.ts

- L23: useRef(new Set()) rebuilds this value on every render & throws it away.

### src/screens/session/hooks/useActiveSessionDisplay.ts

- L53: useRef(now()) rebuilds this value on every render & throws it away.

### src/screens/session/hooks/useCompanionSession.ts

- L29: useRef(new Set()) rebuilds this value on every render & throws it away.

### src/session/components/SquadSyncIndicator.tsx

- L44: useRef(new Set()) rebuilds this value on every render & throws it away.
- L45: useRef(new Set()) rebuilds this value on every render & throws it away.

### src/session/hooks/useSession.ts

- L28: useRef(getSessionOrchestrator()) rebuilds this value on every render & throws it away.
- L30: useRef(createSessionActions()) rebuilds this value on every render & throws it away.

### src/session/hooks/useSessionHistory.ts

- L7: useRef(getSessionOrchestrator()) rebuilds this value on every render & throws it away.

### src/session/hooks/useSessionPresets.ts

- L5: useRef(getSessionOrchestrator()) rebuilds this value on every render & throws it away.

### src/session/hooks/useSessionStats.ts

- L9: useRef(getSessionOrchestrator()) rebuilds this value on every render & throws it away.

### src/shared/ui/PremiumPullToRefresh-main.tsx

- L76: useRef(create()) rebuilds this value on every render & throws it away.
