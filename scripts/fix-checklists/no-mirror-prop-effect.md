# no-mirror-prop-effect — manual fix checklist

Diagnostics found: **1**.

Estimated human time: 1-2 minutes.

## Per-file fixes

### src/features/mastery/components/MasteryCard.tsx

- L30: Your screen shows the old value first because useState "cardState" copies prop "state" through this effect.
