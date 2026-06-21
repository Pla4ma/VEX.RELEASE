# no-many-boolean-props — manual fix checklist

Diagnostics found: **5**.

Estimated human time: 2-3 minutes.

## Per-file fixes

### src/features/content-study/components/TaskCard.tsx

- L23: Component "TaskCard" takes 4 on/off props (isCompleted, isActive, isLocked…), which is hard to combine & test.

### src/features/session-runtime/components/ComboMeterOverlays.tsx

- L34: Component "ComboMeterOverlays" takes 4 on/off props (showMilestone, showComboBroken, isPaused…), which is hard to combine & test.

### src/screens/home/components/HomeSecondaryRail.tsx

- L44: Component "HomeSecondaryRail" takes 5 on/off props (canShowSecondarySystems, hasActiveRecommendation, isFirstRun…), which is hard to combine & test.

### src/session/components/ComboMeterOverlays.tsx

- L34: Component "ComboMeterOverlays" takes 4 on/off props (showMilestone, showComboBroken, isPaused…), which is hard to combine & test.

### src/shared/ui/state-components/state-wrapper.tsx

- L8: Component "StateWrapper" takes 4 on/off props (isLoading, isError, isEmpty…), which is hard to combine & test.
