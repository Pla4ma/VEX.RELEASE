# rendering-usetransition-loading — manual fix checklist

Diagnostics found: **1**.

Estimated human time: 1-2 minutes.

## Per-file fixes

### src/features/session/StudyQuizBreak.tsx

- L26: This adds an extra render because useState for "isLoading" re-renders just for the loading flag, so if it's a state change & not a data fetch, use useTransition instead.
