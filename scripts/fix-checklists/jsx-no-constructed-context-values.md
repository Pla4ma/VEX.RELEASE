# jsx-no-constructed-context-values — manual fix checklist

Diagnostics found: **1**.

Estimated human time: 1-2 minutes.

## Per-file fixes

### src/shared/ui/components/ToastProvider.tsx

- L72: Every reader of this context redraws on each render because you build its `value` inline.
