# rn-no-single-element-style-array — manual fix checklist

Diagnostics found: **4**.

Estimated human time: 1-2 minutes.

## Per-file fixes

### src/components/primitives/VexLaunchButton.tsx

- L127: Your users pay for an extra array allocation when "style" wraps a single value for nothing.

### src/features/fab/components/FloatingActionButton.tsx

- L86: Your users pay for an extra array allocation when "style" wraps a single value for nothing.

### src/features/session-start/components/DifficultySelector.tsx

- L125: Your users pay for an extra array allocation when "style" wraps a single value for nothing.

### src/screens/auth/components/VexDevotionalCard.tsx

- L95: Your users pay for an extra array allocation when "style" wraps a single value for nothing.
