# prefer-use-effect-event — manual fix checklist

Diagnostics found: **6**.

Estimated human time: 2-3 minutes.

## Per-file fixes

### src/animation/confetti/Particle.tsx

- L103: Your effect re-subscribes whenever "onComplete" changes, even though it's only used inside `setTimeout`.

### src/features/session-runtime/components/SquadSyncIndicator.tsx

- L94: Your effect re-subscribes whenever "handleSquadCompletion" changes, even though it's only used inside `subscribe`.

### src/session/components/SquadSyncIndicator.tsx

- L94: Your effect re-subscribes whenever "handleSquadCompletion" changes, even though it's only used inside `subscribe`.

### src/shared/ui/components/MicroRewardBanner.tsx

- L60: Your effect re-subscribes whenever "onDismiss" changes, even though it's only used inside `setTimeout`.

### src/shared/ui/components/OfflineBanner.tsx

- L80: Your effect re-subscribes whenever "onReappear" changes, even though it's only used inside `setTimeout`.

### src/shared/ui/components/StatusBanner.tsx

- L39: Your effect re-subscribes whenever "onDismiss" changes, even though it's only used inside `setTimeout`.
