# no-event-handler — manual fix checklist

Diagnostics found: **78**.

Estimated human time: 20-39 minutes.

## Per-file fixes

### src/components/overlays/useModalAnimation.ts

- L110: Faking an event handler with a prop plus a useEffect costs an extra render & runs late.

### src/components/premium/PremiumBadge.tsx

- L50: Faking an event handler with a prop plus a useEffect costs an extra render & runs late.
- L50: Faking an event handler with a prop plus a useEffect costs an extra render & runs late.

### src/components/primitives/VexMotionSurface.tsx

- L73: Faking an event handler with a prop plus a useEffect costs an extra render & runs late.

### src/features/ai-coach/components/CoachSessionBanner.tsx

- L69: Faking an event handler with a prop plus a useEffect costs an extra render & runs late.
- L76: Faking an event handler with state plus a useEffect costs an extra render & runs late.
- L82: Faking an event handler with state plus a useEffect costs an extra render & runs late.

### src/features/ai-coach/components/useCoachChat.ts

- L51: Faking an event handler with state plus a useEffect costs an extra render & runs late.

### src/features/companion/components/RiveCompanion.tsx

- L83: Faking an event handler with a prop plus a useEffect costs an extra render & runs late.

### src/features/content-study/components/ExtractionProgress.tsx

- L60: Faking an event handler with a prop plus a useEffect costs an extra render & runs late.

### src/features/content-study/components/YouTubeInput.tsx

- L39: Faking an event handler with a prop plus a useEffect costs an extra render & runs late.

### src/features/content-study/hooks/useContentReview.ts

- L18: Faking an event handler with a prop plus a useEffect costs an extra render & runs late.

### src/features/focus-identity/components/FocusScoreCard.tsx

- L40: Faking an event handler with a prop plus a useEffect costs an extra render & runs late.
- L58: Faking an event handler with a prop plus a useEffect costs an extra render & runs late.

### src/features/focus-identity/components/MonthlyFocusReport.tsx

- L44: Faking an event handler with a prop plus a useEffect costs an extra render & runs late.
- L54: Faking an event handler with state plus a useEffect costs an extra render & runs late.
- L70: Faking an event handler with a prop plus a useEffect costs an extra render & runs late.

### src/features/session-runtime/components/BossDamagePreview.styles.tsx

- L52: Faking an event handler with a prop plus a useEffect costs an extra render & runs late.

### src/features/session-runtime/components/InterruptionWarning.tsx

- L37: Faking an event handler with a prop plus a useEffect costs an extra render & runs late.

### src/features/session-runtime/components/QualityIndicator-helpers.tsx

- L138: Faking an event handler with a prop plus a useEffect costs an extra render & runs late.

### src/features/session-runtime/components/SquadMemberIndicator.tsx

- L40: Faking an event handler with a prop plus a useEffect costs an extra render & runs late.
- L55: Faking an event handler with a prop plus a useEffect costs an extra render & runs late.

### src/features/session-runtime/components/SquadSyncIndicator.tsx

- L124: Faking an event handler with a prop plus a useEffect costs an extra render & runs late.

### src/features/session-runtime/hooks/useSessionTimerSubscriptions.ts

- L88: Faking an event handler with a prop plus a useEffect costs an extra render & runs late.

### src/features/session-start/components/live-focusing/helpers.ts

- L16: Faking an event handler with a prop plus a useEffect costs an extra render & runs late.

### src/features/session-start/hooks/useAdaptiveDifficulty.ts

- L63: Faking an event handler with a prop plus a useEffect costs an extra render & runs late.
- L71: Faking an event handler with a prop plus a useEffect costs an extra render & runs late.
- L75: Faking an event handler with a prop plus a useEffect costs an extra render & runs late.
- L84: Faking an event handler with state plus a useEffect costs an extra render & runs late.
- L88: Faking an event handler with state plus a useEffect costs an extra render & runs late.
- L93: Faking an event handler with a prop plus a useEffect costs an extra render & runs late.

### src/features/session/components/first-session-overlay/HighlightRing.tsx

- L25: Faking an event handler with a prop plus a useEffect costs an extra render & runs late.

### src/features/streaks/components/streak-calendar-day-cell.tsx

- L68: Faking an event handler with a prop plus a useEffect costs an extra render & runs late.

### src/hooks/useApiCore.ts

- L61: Faking an event handler with a prop plus a useEffect costs an extra render & runs late.

### src/hooks/usePaginatedApi.ts

- L55: Faking an event handler with a prop plus a useEffect costs an extra render & runs late.

### src/navigation/hooks/useStreakFuneralNavigation.ts

- L130: Faking an event handler with a prop plus a useEffect costs an extra render & runs late.
- L130: Faking an event handler with a prop plus a useEffect costs an extra render & runs late.
- L130: Faking an event handler with a prop plus a useEffect costs an extra render & runs late.

### src/screens/auth/components/AnimatedLetter.tsx

- L29: Faking an event handler with a prop plus a useEffect costs an extra render & runs late.

### src/screens/auth/components/HoloCard.tsx

- L48: Faking an event handler with a prop plus a useEffect costs an extra render & runs late.

### src/screens/auth/components/LoopStep.tsx

- L32: Faking an event handler with a prop plus a useEffect costs an extra render & runs late.

### src/screens/onboarding/components/ethereal/MascotSpeechBubble.tsx

- L36: Faking an event handler with a prop plus a useEffect costs an extra render & runs late.

### src/screens/onboarding/hooks/useOnboardingFlow.ts

- L36: Faking an event handler with a prop plus a useEffect costs an extra render & runs late.
- L75: Faking an event handler with state plus a useEffect costs an extra render & runs late.
- L75: Faking an event handler with state plus a useEffect costs an extra render & runs late.

### src/screens/session/components/SessionCompleteContent.tsx

- L40: Faking an event handler with a prop plus a useEffect costs an extra render & runs late.
- L40: Faking an event handler with a prop plus a useEffect costs an extra render & runs late.
- L90: Faking an event handler with a prop plus a useEffect costs an extra render & runs late.

### src/screens/session/hooks/useCompanionSession.ts

- L24: Faking an event handler with a prop plus a useEffect costs an extra render & runs late.

### src/screens/session/hooks/useSessionPurity.ts

- L56: Faking an event handler with a prop plus a useEffect costs an extra render & runs late.
- L56: Faking an event handler with state plus a useEffect costs an extra render & runs late.

### src/screens/session/hooks/useSessionSetupState.ts

- L69: Faking an event handler with a prop plus a useEffect costs an extra render & runs late.

### src/session/components/BossDamagePreview.styles.tsx

- L50: Faking an event handler with a prop plus a useEffect costs an extra render & runs late.

### src/session/components/InterruptionWarning.tsx

- L35: Faking an event handler with a prop plus a useEffect costs an extra render & runs late.

### src/session/components/QualityIndicator-helpers.tsx

- L137: Faking an event handler with a prop plus a useEffect costs an extra render & runs late.

### src/session/components/SquadMemberIndicator.tsx

- L51: Faking an event handler with a prop plus a useEffect costs an extra render & runs late.

### src/session/components/SquadSyncIndicator.tsx

- L124: Faking an event handler with a prop plus a useEffect costs an extra render & runs late.

### src/session/hooks/useSessionTimerSubscriptions.ts

- L88: Faking an event handler with a prop plus a useEffect costs an extra render & runs late.

### src/shared/analytics/use-analytics-tracking.ts

- L32: Faking an event handler with a prop plus a useEffect costs an extra render & runs late.
- L39: Faking an event handler with a prop plus a useEffect costs an extra render & runs late.
- L65: Faking an event handler with a prop plus a useEffect costs an extra render & runs late.
- L65: Faking an event handler with a prop plus a useEffect costs an extra render & runs late.

### src/shared/ui/PremiumErrorRecovery.tsx

- L117: Faking an event handler with a prop plus a useEffect costs an extra render & runs late.
- L117: Faking an event handler with a prop plus a useEffect costs an extra render & runs late.
- L117: Faking an event handler with state plus a useEffect costs an extra render & runs late.

### src/shared/ui/PremiumPullToRefresh-main.tsx

- L47: Faking an event handler with a prop plus a useEffect costs an extra render & runs late.

### src/shared/ui/components/AnimatedCounter.hooks.ts

- L17: Faking an event handler with a prop plus a useEffect costs an extra render & runs late.

### src/shared/ui/components/AnimatedCounter.tsx

- L74: Faking an event handler with a prop plus a useEffect costs an extra render & runs late.
- L81: Faking an event handler with a prop plus a useEffect costs an extra render & runs late.

### src/shared/ui/components/StatusBanner.tsx

- L44: Faking an event handler with a prop plus a useEffect costs an extra render & runs late.

### src/shared/ui/components/TabBar.tsx

- L33: Faking an event handler with state plus a useEffect costs an extra render & runs late.
- L33: Faking an event handler with a prop plus a useEffect costs an extra render & runs late.

### src/shared/ui/components/transition-config.ts

- L79: Faking an event handler with a prop plus a useEffect costs an extra render & runs late.

### src/shared/ui/primitives/Skeleton.tsx

- L39: Faking an event handler with a prop plus a useEffect costs an extra render & runs late.

### src/shared/ui/state-components/animations.ts

- L16: Faking an event handler with a prop plus a useEffect costs an extra render & runs late.

### src/theme/ThemeContext.tsx

- L52: Faking an event handler with a prop plus a useEffect costs an extra render & runs late.
- L65: Faking an event handler with a prop plus a useEffect costs an extra render & runs late.
- L115: Faking an event handler with state plus a useEffect costs an extra render & runs late.
