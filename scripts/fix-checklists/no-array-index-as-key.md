# no-array-index-as-key — manual fix checklist

Diagnostics found: **44**.

Estimated human time: 11-22 minutes.

## Per-file fixes

### src/components/ui/SkeletonLines.tsx

- L30: Your users can see & submit the wrong data when this list reorders or filters, so use a stable id like `key={item.

### src/features/analytics/components/Heatmap.tsx

- L100: Your users can see & submit the wrong data when this list reorders or filters, so use a stable id like `key={item.

### src/features/content-study/components/PdfUploaderFileCard.tsx

- L140: Your users can see & submit the wrong data when this list reorders or filters, so use a stable id like `key={item.
- L152: Your users can see & submit the wrong data when this list reorders or filters, so use a stable id like `key={item.

### src/features/content-study/components/YouTubeInput.tsx

- L103: Your users can see & submit the wrong data when this list reorders or filters, so use a stable id like `key={item.
- L122: Your users can see & submit the wrong data when this list reorders or filters, so use a stable id like `key={item.

### src/features/content-study/screens/study-plan-helpers.tsx

- L156: Your users can see & submit the wrong data when this list reorders or filters, so use a stable id like `key={item.

### src/features/focus-identity/FocusScoreDashboard-main.tsx

- L96: Your users can see & submit the wrong data when this list reorders or filters, so use a stable id like `key={item.

### src/features/focus-identity/components/ReportCards.tsx

- L77: Your users can see & submit the wrong data when this list reorders or filters, so use a stable id like `key={item.

### src/features/focus-identity/components/ScoreChartSvg.tsx

- L104: Your users can see & submit the wrong data when this list reorders or filters, so use a stable id like `key={item.
- L121: Your users can see & submit the wrong data when this list reorders or filters, so use a stable id like `key={item.

### src/features/home-spine/components/DayCell.tsx

- L114: Your users can see & submit the wrong data when this list reorders or filters, so use a stable id like `key={item.

### src/features/home-spine/components/DayDetailsPopover.tsx

- L82: Your users can see & submit the wrong data when this list reorders or filters, so use a stable id like `key={item.

### src/features/progression/components/level-up-subcomponents.tsx

- L60: Your users can see & submit the wrong data when this list reorders or filters, so use a stable id like `key={item.
- L99: Your users can see & submit the wrong data when this list reorders or filters, so use a stable id like `key={item.

### src/features/session-runtime/components/SessionSummary.tsx

- L107: Your users can see & submit the wrong data when this list reorders or filters, so use a stable id like `key={item.

### src/features/session-runtime/components/SessionValidationFeedback.tsx

- L109: Your users can see & submit the wrong data when this list reorders or filters, so use a stable id like `key={item.
- L145: Your users can see & submit the wrong data when this list reorders or filters, so use a stable id like `key={item.

### src/features/session-start/components/live-focusing/AvatarStack.tsx

- L43: Your users can see & submit the wrong data when this list reorders or filters, so use a stable id like `key={item.

### src/features/streaks/components/streak-calendar.tsx

- L8: Your users can see & submit the wrong data when this list reorders or filters, so use a stable id like `key={item.

### src/icons/components/Icon.tsx

- L151: Your users can see & submit the wrong data when this list reorders or filters, so use a stable id like `key={item.

### src/screens/auth/components/FocusLoopPreview.tsx

- L85: Your users can see & submit the wrong data when this list reorders or filters, so use a stable id like `key={item.

### src/screens/auth/components/PaperGrain.tsx

- L30: Your users can see & submit the wrong data when this list reorders or filters, so use a stable id like `key={item.

### src/screens/auth/components/Starfield.tsx

- L78: Your users can see & submit the wrong data when this list reorders or filters, so use a stable id like `key={item.

### src/screens/auth/components/VexAtmosphere.tsx

- L79: Your users can see & submit the wrong data when this list reorders or filters, so use a stable id like `key={item.
- L132: Your users can see & submit the wrong data when this list reorders or filters, so use a stable id like `key={item.

### src/screens/auth/components/VexDevotionalBackground.tsx

- L87: Your users can see & submit the wrong data when this list reorders or filters, so use a stable id like `key={item.

### src/screens/auth/components/VexEditorialMark.tsx

- L94: Your users can see & submit the wrong data when this list reorders or filters, so use a stable id like `key={item.

### src/screens/auth/components/VexHeroSignature.tsx

- L46: Your users can see & submit the wrong data when this list reorders or filters, so use a stable id like `key={item.
- L170: Your users can see & submit the wrong data when this list reorders or filters, so use a stable id like `key={item.

### src/screens/auth/components/ethereal/GodRays.tsx

- L80: Your users can see & submit the wrong data when this list reorders or filters, so use a stable id like `key={item.

### src/screens/auth/components/ethereal/SkiaParticles.tsx

- L88: Your users can see & submit the wrong data when this list reorders or filters, so use a stable id like `key={item.

### src/screens/auth/components/ethereal/Starfield.tsx

- L54: Your users can see & submit the wrong data when this list reorders or filters, so use a stable id like `key={item.

### src/screens/home/components/HomeMemoryInsight.tsx

- L29: Your users can see & submit the wrong data when this list reorders or filters, so use a stable id like `key={item.

### src/screens/onboarding/components/PersonaCard.tsx

- L117: Your users can see & submit the wrong data when this list reorders or filters, so use a stable id like `key={item.

### src/screens/profile/components/AchievementShowcase.tsx

- L155: Your users can see & submit the wrong data when this list reorders or filters, so use a stable id like `key={item.

### src/screens/search/components/RecentSearches.tsx

- L39: Your users can see & submit the wrong data when this list reorders or filters, so use a stable id like `key={item.

### src/screens/session/components/ActiveSessionHeroSecondary.tsx

- L29: Your users can see & submit the wrong data when this list reorders or filters, so use a stable id like `key={item.

### src/screens/settings/CoachPersonaSelector.tsx

- L78: Your users can see & submit the wrong data when this list reorders or filters, so use a stable id like `key={item.

### src/session/components/SessionSummary.tsx

- L107: Your users can see & submit the wrong data when this list reorders or filters, so use a stable id like `key={item.

### src/session/components/SessionValidationFeedback.tsx

- L109: Your users can see & submit the wrong data when this list reorders or filters, so use a stable id like `key={item.
- L145: Your users can see & submit the wrong data when this list reorders or filters, so use a stable id like `key={item.

### src/shared/ui/components/TransitionWrapper.tsx

- L32: Your users can see & submit the wrong data when this list reorders or filters, so use a stable id like `key={item.

### src/shared/ui/primitives/Skeleton.tsx

- L78: Your users can see & submit the wrong data when this list reorders or filters, so use a stable id like `key={item.
