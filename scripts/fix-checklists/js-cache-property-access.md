# js-cache-property-access — manual fix checklist

Diagnostics found: **4**.

Estimated human time: 1-2 minutes.

## Per-file fixes

### src/events/ChallengeManager.ts

- L62: This slows the loop because challenge.

### src/features/content-study/hooks/helpers.ts

- L66: This slows the loop because generation.

### src/features/home-spine/priority-context.ts

- L54: This slows the loop because item.

### src/features/personalization/behavior-summarizer.ts

- L64: This slows the loop because signal.
