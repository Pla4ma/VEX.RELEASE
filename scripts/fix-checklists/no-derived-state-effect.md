# no-derived-state-effect — manual fix checklist

Diagnostics found: **2**.

Estimated human time: 1-2 minutes.

## Per-file fixes

### src/features/mastery/components/MasteryCard.tsx

- L30: You pay an extra render for state you can derive from other values.

### src/screens/onboarding/components/ethereal/VexMascotGuide.tsx

- L68: Your users briefly see stale state on every prop change.
