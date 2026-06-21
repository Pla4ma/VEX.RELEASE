# exhaustive-deps — manual fix checklist

Diagnostics found: **12**.

Estimated human time: 3-6 minutes.

## Per-file fixes

### archive/economy-chest/hooks/useSessionCompleteChest.ts

- L43: Your cleanup may read the wrong node since the ref `isMountedRef.
- L62: `useEffect` can run with a stale `prepareChest` & show your users old data.
- L93: `useCallback` can run with a stale `rollChest` & show your users old data.

### src/animation/confetti/Particle.tsx

- L96: `useEffect` can run with a stale `SCREEN_HEIGHT` & show your users old data.

### src/events/hooks/useEventBus.ts

- L40: A spread in `useEffect`'s dependency array hides the actual deps, so stale values can slip through.

### src/events/useEventBus.ts

- L22: `useEffect` can run with a stale `options` & show your users old data.

### src/features/session-runtime/hooks/useSessionTimerSubscriptions.ts

- L90: Your cleanup may read the wrong node since the ref `intervalRef.
- L169: Your cleanup may read the wrong node since the ref `intervalRef.

### src/hooks/useApiCore.ts

- L72: Your cleanup may read the wrong node since the ref `isMountedRef.

### src/navigation/components/VexTabBar.tsx

- L29: Your cleanup may read the wrong node since the ref `pulseTimeoutRef.

### src/navigation/hooks/useStreakPulse.ts

- L13: Your cleanup may read the wrong node since the ref `pulseTimeoutRef.

### src/session/hooks/useSessionTimerSubscriptions.ts

- L165: Your cleanup may read the wrong node since the ref `intervalRef.
