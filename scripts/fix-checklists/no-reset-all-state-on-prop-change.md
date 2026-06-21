# no-reset-all-state-on-prop-change — manual fix checklist

Diagnostics found: **3**.

Estimated human time: 1-2 minutes.

## Per-file fixes

### src/features/mastery/components/MasteryCard.tsx

- L30: Your users briefly see stale state when a prop changes because this useEffect clears all state.

### src/features/session-runtime/components/InterruptionWarning.tsx

- L36: Your users briefly see stale state when a prop changes because this useEffect clears all state.

### src/session/components/InterruptionWarning.tsx

- L34: Your users briefly see stale state when a prop changes because this useEffect clears all state.
