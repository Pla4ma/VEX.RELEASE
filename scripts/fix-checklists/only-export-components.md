# only-export-components — manual fix checklist

Diagnostics found: **112**.

Estimated human time: 28-56 minutes.

## Per-file fixes

### src/errors/ScreenErrorWrapper.tsx

- L15: This file exports non-components, so Fast Refresh can't safely preserve component state.
- L46: This file exports non-components, so Fast Refresh can't safely preserve component state.

### src/features/ai-coach/components/CoachModeSelector.tsx

- L10: This file exports non-components, so Fast Refresh can't safely preserve component state.

### src/features/ai-coach/components/CoachScreen.tsx

- L155: This component is unnamed, so Fast Refresh can't track it and falls back to a full reload.

### src/features/ai-coach/components/session-suggestion-card.tsx

- L13: This file exports non-components, so Fast Refresh can't safely preserve component state.

### src/features/analytics/components/AnalyticsDashboard.helpers.tsx

- L20: This file exports non-components, so Fast Refresh can't safely preserve component state.
- L33: This file exports non-components, so Fast Refresh can't safely preserve component state.
- L40: This file exports non-components, so Fast Refresh can't safely preserve component state.

### src/features/analytics/components/data-export-helpers.tsx

- L17: This file exports non-components, so Fast Refresh can't safely preserve component state.
- L25: This file exports non-components, so Fast Refresh can't safely preserve component state.

### src/features/companion/components/LivingCompanion.tsx

- L199: This file exports non-components, so Fast Refresh can't safely preserve component state.

### src/features/content-study/components/SkeletonCard.tsx

- L1: This file exports non-components, so Fast Refresh can't safely preserve component state.

### src/features/content-study/screens/ContentInputScreen.tsx

- L175: This component is unnamed, so Fast Refresh can't track it and falls back to a full reload.

### src/features/content-study/screens/ContentReviewScreen.tsx

- L194: This component is unnamed, so Fast Refresh can't track it and falls back to a full reload.

### src/features/content-study/screens/StudyLibraryScreen.tsx

- L172: This component is unnamed, so Fast Refresh can't track it and falls back to a full reload.

### src/features/content-study/screens/StudyPlanScreen.tsx

- L199: This component is unnamed, so Fast Refresh can't track it and falls back to a full reload.

### src/features/content-study/screens/study-plan-helpers.tsx

- L24: This file exports non-components, so Fast Refresh can't safely preserve component state.

### src/features/feature-gate/FeatureGate.tsx

- L33: This file exports non-components, so Fast Refresh can't safely preserve component state.

### src/features/focus-identity/FocusScoreDashboard.tsx

- L3: This file exports non-components, so Fast Refresh can't safely preserve component state.
- L3: This file exports non-components, so Fast Refresh can't safely preserve component state.
- L3: This file exports non-components, so Fast Refresh can't safely preserve component state.

### src/features/focus-identity/components/FocusScoreCardStates.tsx

- L160: This file exports non-components, so Fast Refresh can't safely preserve component state.

### src/features/focus-identity/components/focus-score-dashboard.tsx

- L164: This file exports non-components, so Fast Refresh can't safely preserve component state.

### src/features/home-spine/components/GreetingHeaderBadges.tsx

- L96: This file exports non-components, so Fast Refresh can't safely preserve component state.

### src/features/home-spine/components/RecentSessionsList.tsx

- L23: This file exports non-components, so Fast Refresh can't safely preserve component state.
- L23: This file exports non-components, so Fast Refresh can't safely preserve component state.
- L23: This file exports non-components, so Fast Refresh can't safely preserve component state.

### src/features/monthly-report/components/ReportContent.tsx

- L12: This file exports non-components, so Fast Refresh can't safely preserve component state.

### src/features/monthly-report/components/report-content-helpers.tsx

- L6: This file exports non-components, so Fast Refresh can't safely preserve component state.

### src/features/onboarding/components/MotivationCard.tsx

- L20: This file exports non-components, so Fast Refresh can't safely preserve component state.

### src/features/onboarding/components/OnboardingFlow.tsx

- L146: This file exports non-components, so Fast Refresh can't safely preserve component state.

### src/features/progression/first-week-pacing/ModeCard.tsx

- L21: This file exports non-components, so Fast Refresh can't safely preserve component state.

### src/features/session-completion/components/grade-reveal-helpers.tsx

- L12: This file exports non-components, so Fast Refresh can't safely preserve component state.
- L20: This file exports non-components, so Fast Refresh can't safely preserve component state.

### src/features/session-runtime/components/QualityIndicator-helpers.tsx

- L29: This file exports non-components, so Fast Refresh can't safely preserve component state.

### src/icons/components/Icon.tsx

- L163: This file exports non-components, so Fast Refresh can't safely preserve component state.

### src/icons/components/IconButton.tsx

- L104: This file exports non-components, so Fast Refresh can't safely preserve component state.

### src/navigation/root-stack-feature-routes.tsx

- L14: This component is not exported, so Fast Refresh skips it and local edits can full-reload.
- L17: This component is not exported, so Fast Refresh skips it and local edits can full-reload.
- L18: This component is not exported, so Fast Refresh skips it and local edits can full-reload.
- L21: This component is not exported, so Fast Refresh skips it and local edits can full-reload.
- L24: This component is not exported, so Fast Refresh skips it and local edits can full-reload.
- L27: This component is not exported, so Fast Refresh skips it and local edits can full-reload.
- L30: This component is not exported, so Fast Refresh skips it and local edits can full-reload.
- L33: This component is not exported, so Fast Refresh skips it and local edits can full-reload.

### src/screens/ComebackScreen.tsx

- L118: This component is unnamed, so Fast Refresh can't track it and falls back to a full reload.

### src/screens/analytics/AnalyticsScreen.tsx

- L102: This component is unnamed, so Fast Refresh can't track it and falls back to a full reload.

### src/screens/auth/ForgotPasswordScreen.tsx

- L137: This component is unnamed, so Fast Refresh can't track it and falls back to a full reload.

### src/screens/auth/LoginScreen.tsx

- L166: This component is unnamed, so Fast Refresh can't track it and falls back to a full reload.

### src/screens/auth/RegisterScreen.tsx

- L185: This component is unnamed, so Fast Refresh can't track it and falls back to a full reload.

### src/screens/auth/ResetPasswordScreen.tsx

- L173: This component is unnamed, so Fast Refresh can't track it and falls back to a full reload.

### src/screens/auth/VerifyEmailScreen.tsx

- L200: This component is unnamed, so Fast Refresh can't track it and falls back to a full reload.

### src/screens/auth/components/LoopStep.tsx

- L12: This file exports non-components, so Fast Refresh can't safely preserve component state.

### src/screens/boss/BossScreen.tsx

- L143: This component is unnamed, so Fast Refresh can't track it and falls back to a full reload.

### src/screens/boss/BossScreenSections.tsx

- L9: This file exports non-components, so Fast Refresh can't safely preserve component state.
- L10: This file exports non-components, so Fast Refresh can't safely preserve component state.
- L11: This file exports non-components, so Fast Refresh can't safely preserve component state.

### src/screens/boss/boss-screen-helpers.tsx

- L26: This file exports non-components, so Fast Refresh can't safely preserve component state.
- L33: This file exports non-components, so Fast Refresh can't safely preserve component state.
- L43: This file exports non-components, so Fast Refresh can't safely preserve component state.

### src/screens/challenges/ChallengesScreen.tsx

- L77: This component is unnamed, so Fast Refresh can't track it and falls back to a full reload.

### src/screens/companion/CompanionDetailScreen.tsx

- L123: This component is unnamed, so Fast Refresh can't track it and falls back to a full reload.

### src/screens/home/FocusScreen.tsx

- L98: This component is unnamed, so Fast Refresh can't track it and falls back to a full reload.

### src/screens/home/HomeHero.helpers.tsx

- L15: This file exports non-components, so Fast Refresh can't safely preserve component state.

### src/screens/home/HomeHero.tsx

- L21: This file exports non-components, so Fast Refresh can't safely preserve component state.

### src/screens/home/HomeScreen.tsx

- L8: This file exports non-components, so Fast Refresh can't safely preserve component state.

### src/screens/home/HomeScreenVisuals.tsx

- L1: This file exports non-components, so Fast Refresh can't safely preserve component state.

### src/screens/notifications/NotificationsScreen.tsx

- L159: This component is unnamed, so Fast Refresh can't track it and falls back to a full reload.

### src/screens/onboarding/OnboardingFlowScreen.tsx

- L132: This component is unnamed, so Fast Refresh can't track it and falls back to a full reload.

### src/screens/onboarding/components/LaneChoiceStep.tsx

- L21: This file exports non-components, so Fast Refresh can't safely preserve component state.

### src/screens/onboarding/components/OnboardingPermissions.helpers.tsx

- L19: This file exports non-components, so Fast Refresh can't safely preserve component state.

### src/screens/onboarding/components/OnboardingProgressIndicator.tsx

- L14: This file exports non-components, so Fast Refresh can't safely preserve component state.

### src/screens/paywall/PaywallScreen.tsx

- L20: This file exports non-components, so Fast Refresh can't safely preserve component state.

### src/screens/plan/PlanScreen.tsx

- L28: This file exports non-components, so Fast Refresh can't safely preserve component state.

### src/screens/profile/AchievementSearchFilter.tsx

- L19: This file exports non-components, so Fast Refresh can't safely preserve component state.

### src/screens/profile/AchievementsScreen.tsx

- L149: This component is unnamed, so Fast Refresh can't track it and falls back to a full reload.

### src/screens/profile/CompanionScreen.tsx

- L171: This component is unnamed, so Fast Refresh can't track it and falls back to a full reload.

### src/screens/profile/MasteryScreen.tsx

- L161: This component is unnamed, so Fast Refresh can't track it and falls back to a full reload.

### src/screens/profile/MasteryTechniqueGrid.tsx

- L10: This file exports non-components, so Fast Refresh can't safely preserve component state.

### src/screens/profile/MemoryConsoleScreen.tsx

- L194: This component is unnamed, so Fast Refresh can't track it and falls back to a full reload.

### src/screens/profile/ProfileScreen.tsx

- L147: This component is unnamed, so Fast Refresh can't track it and falls back to a full reload.

### src/screens/profile/components/AchievementShowcaseCard.tsx

- L26: This file exports non-components, so Fast Refresh can't safely preserve component state.

### src/screens/profile/components/CompanionScreenSupport.tsx

- L17: This file exports non-components, so Fast Refresh can't safely preserve component state.
- L26: This file exports non-components, so Fast Refresh can't safely preserve component state.
- L35: This file exports non-components, so Fast Refresh can't safely preserve component state.

### src/screens/profile/components/CosmeticCategorySelector.tsx

- L12: This file exports non-components, so Fast Refresh can't safely preserve component state.

### src/screens/profile/components/CosmeticPreviewCard.tsx

- L31: This file exports non-components, so Fast Refresh can't safely preserve component state.
- L39: This file exports non-components, so Fast Refresh can't safely preserve component state.

### src/screens/progress/ProgressScreen.tsx

- L181: This component is unnamed, so Fast Refresh can't track it and falls back to a full reload.

### src/screens/rewards/VaultScreen.tsx

- L40: This component is unnamed, so Fast Refresh can't track it and falls back to a full reload.

### src/screens/search/SearchScreen.tsx

- L137: This component is unnamed, so Fast Refresh can't track it and falls back to a full reload.

### src/screens/session/ActiveSessionScreen.tsx

- L20: This file exports non-components, so Fast Refresh can't safely preserve component state.

### src/screens/session/SessionCompleteScreen.tsx

- L15: This file exports non-components, so Fast Refresh can't safely preserve component state.

### src/screens/session/SessionHistoryScreen.tsx

- L51: This component is not exported, so Fast Refresh skips it and local edits can full-reload.
- L145: This component is unnamed, so Fast Refresh can't track it and falls back to a full reload.

### src/screens/session/SessionSetupScreen.tsx

- L95: This file exports non-components, so Fast Refresh can't safely preserve component state.

### src/screens/session/components/MetricRow.tsx

- L10: This file exports non-components, so Fast Refresh can't safely preserve component state.

### src/screens/settings/AccountSettingsScreen.tsx

- L77: This component is unnamed, so Fast Refresh can't track it and falls back to a full reload.

### src/screens/settings/AppearanceSettingsScreen.tsx

- L159: This component is unnamed, so Fast Refresh can't track it and falls back to a full reload.

### src/screens/settings/CoachSettingsScreen.tsx

- L190: This component is unnamed, so Fast Refresh can't track it and falls back to a full reload.

### src/screens/settings/DataExportScreen.tsx

- L10: This file exports non-components, so Fast Refresh can't safely preserve component state.

### src/screens/settings/LaneModeSettingsScreen.tsx

- L45: This file exports non-components, so Fast Refresh can't safely preserve component state.

### src/screens/settings/NotificationSettingsScreen.tsx

- L160: This component is unnamed, so Fast Refresh can't track it and falls back to a full reload.

### src/screens/settings/PrivacySettingsScreen.tsx

- L194: This component is unnamed, so Fast Refresh can't track it and falls back to a full reload.

### src/screens/settings/SettingsScreen.tsx

- L31: This file exports non-components, so Fast Refresh can't safely preserve component state.

### src/screens/streaks/StreakFuneralScreen.tsx

- L166: This component is unnamed, so Fast Refresh can't track it and falls back to a full reload.

### src/session/components/QualityIndicator-helpers.tsx

- L28: This file exports non-components, so Fast Refresh can't safely preserve component state.

### src/shared/ui/PremiumPullToRefresh.tsx

- L1: This file exports non-components, so Fast Refresh can't safely preserve component state.
- L3: This file exports non-components, so Fast Refresh can't safely preserve component state.

### src/shared/ui/components/ScreenErrorBoundary.tsx

- L100: This file exports non-components, so Fast Refresh can't safely preserve component state.

### src/shared/ui/components/StatusFeedback.tsx

- L12: This file exports non-components, so Fast Refresh can't safely preserve component state.

### src/shared/ui/liquid-glass/LiquidGlassHeader.tsx

- L8: This file exports non-components, so Fast Refresh can't safely preserve component state.
