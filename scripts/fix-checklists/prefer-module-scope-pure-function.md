# prefer-module-scope-pure-function — manual fix checklist

Diagnostics found: **3**.

Estimated human time: 1-2 minutes.

## Per-file fixes

### src/features/companion/components/CompanionMemoryTimeline.tsx

- L36: `renderItem` inside `CompanionMemoryTimeline` uses no local state but is rebuilt on every render, so it wastes work & breaks memoized children.

### src/features/progression/components/xp-progress-bar.tsx

- L84: `getTierColor` inside `XpProgressBar` uses no local state but is rebuilt on every render, so it wastes work & breaks memoized children.

### src/features/session-recommendation/components/SessionRecommendationCard.tsx

- L45: `getSessionModeIcon` inside `SessionRecommendationCard` uses no local state but is rebuilt on every render, so it wastes work & breaks memoized children.
