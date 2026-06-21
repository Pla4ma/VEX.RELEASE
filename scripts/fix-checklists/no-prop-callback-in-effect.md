# no-prop-callback-in-effect — manual fix checklist

Diagnostics found: **2**.

Estimated human time: 1-2 minutes.

## Per-file fixes

### src/features/content-study/components/YouTubeInput.tsx

- L40: Your parent re-renders on every local state change because this useEffect calls the prop "onValidationChange" just to stay in sync.
- L43: Your parent re-renders on every local state change because this useEffect calls the prop "onValidationChange" just to stay in sync.
