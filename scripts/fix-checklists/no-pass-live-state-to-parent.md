# no-pass-live-state-to-parent — manual fix checklist

Diagnostics found: **1**.

Estimated human time: 1-2 minutes.

## Per-file fixes

### src/shared/ui/PremiumErrorRecovery.tsx

- L118: Pushing state up to a parent from a useEffect costs your users an extra render.
