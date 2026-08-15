# VEX Visual Redesign Plan

## Goal
Every user-facing screen in the 4 main tabs (Home, Focus, Progress, Profile)
plus the key flows (Session, Auth, Onboarding, Paywall, Settings) gets
redesigned to a top aesthetic — beautiful AND functional, with all UI states
covered (loading, error, empty, offline, optimistic).

## Phase 1 — Shared Design Layer (`src/shared/ui/vex/`)
Build once, use everywhere. Each piece covers all required UI states.

- VexScreen — screen shell with gradient mesh, header slot, scroll slot, floating CTA slot
- VexHeroCard — large hero card with eyebrow + headline + asset + CTA
- VexStatTile — single metric with label + value + delta
- VexStatRow — horizontal stats strip
- VexListItem — row with leading icon/asset + title + subtitle + trailing chevron
- VexSectionHeader — eyebrow + title + optional action link
- VexEmptyState — illustrated empty with one CTA
- VexErrorState — error in VEX voice with retry
- VexOfflineState — degraded banner
- VexLoadingSkeleton — skeleton matching real layout
- VexAnimatedNumber — Reanimated counter for stat tiles
- VexProgressRing — animated SVG ring (reusable in many screens)
- VexGradientMesh — page background pattern

## Phase 2 — 4 Main Tabs (top-tier)

### Home tab (`src/screens/home/`)
- HomeHeroSection — full-bleed glass hero with greeting, headline, goal ring, mascot, action chips
- HomeActionDock — Coach / Progress glass pills (already glass — just polish spacing)
- HomeDailyCards — AI Coach card with rich mascot art
- HomeContinueCard — last session resume
- HomeMetricsRow — streak / minutes today
- HomeSecondaryRail — content study rail
- HomeUnlockPath — onboarding unlock tracker
- HomeDayZeroLaunchpad — first session launch
- Day0ActionSheet — Create / Study / Quest capture sheet (already polished)
- HomeQuickSheet — quick-action slide-up
- HomeSubTabs — sub-navigation

### Focus tab (`src/screens/home/FocusScreen.tsx`)
- FocusScreen — mode picker (Light Focus / Deep Work / Sprint / Study / Recovery) with mint chips
- FocusModeCardView — single mode card
- FocusScoreHomeWidget — score visualization
- HomeFocusScore — full score card

### Progress tab (`src/screens/progress/`)
- ProgressScreen — tabbed Overview / Plan view
- ProgressHeader — date + notifications + monthly report
- ProgressStatCards — focus score, completion %, streak stats
- BaselineSignalCard — first-time baseline
- BattlePassSeasonHeader — season banner
- BattlePassXPProgress — XP progression
- GoalChip — single goal chip
- StudyOSCard — study plan card
- PlanWorkspace — today / week / projects / study

### Profile tab (`src/screens/profile/`)
- ProfileScreen — Stats / Mastery / Activity tabs
- ProfileHeader — avatar + name + level + XP + actions row
- ProfileStatsTab — stats grid + mastery + personal bests
- ProfileAchievementsTab — achievement showcase
- ProfileActivityTab — recent session history
- ProfileMasterySheet — bottom sheet with technique grid
- AchievementsScreen — full achievements list
- MasteryScreen — mastery techniques
- MasteryHeader
- MasteryTechniqueGrid
- MasteryChallengesList
- AchievementCategorySection
- AchievementProgressBar
- AchievementSearchFilter
- MemoryConsoleScreen
- PersonalBestCard
- CosmeticEquippingSheet
- CosmeticCategorySelector
- CosmeticPreviewCard

## Phase 3 — Key Flows (polish)

### Session
- SessionSetupScreen — preset picker
- ActiveSessionScreen — already redone, verify
- SessionCompleteScreen — completion celebration
- SessionHistoryScreen — past session list
- SessionQuickStartCard
- SessionReflectionSheet — reflection capture

### Auth (`src/screens/auth/`)
- LoginScreen — login form
- RegisterScreen — sign-up form
- ForgotPasswordScreen
- ResetPasswordScreen
- VerifyEmailScreen

### Onboarding (`src/screens/onboarding/`)
- OnboardingFlowScreen
- OnboardingWelcome
- OnboardingSetName
- OnboardingChooseGoal
- OnboardingChooseElement
- LaneChoiceStep
- MotivationStyleStep
- OnboardingPermissions
- RevealStep

### Paywall (`src/screens/paywall/`)
- PaywallScreen
- PaywallHero
- PaywallPlans
- PaywallFeatureList
- PaywallFooterActions
- PaywallStates

### Settings (`src/screens/settings/`)
- SettingsScreen
- AppearanceSettingsScreen
- PrivacySettingsScreen
- NotificationSettingsScreen
- CoachSettingsScreen
- AccountSettingsScreen
- DataExportScreen
- LaneModeSettingsScreen
- SettingsProfileRow
- ColorSchemeToggle
- ThemePicker
- CoachToneSelector / CoachPersonaSelector / CoachFrequencySelector

### Content Study (`src/features/content-study/screens/`)
- ContentInputScreen
- ContentReviewScreen
- StudyLibraryScreen
- StudyPlanScreen

## Phase 4 — Other (light polish if time)
- AnalyticsScreen, BossScreen, ChallengesScreen
- NotificationsScreen, SearchScreen, VaultScreen
- MonthlyFocusReportScreen
- CompanionDetailScreen, ComebackScreen, StreakFuneralScreen
- AchievementToastProvider

## Constraints (per AGENTS.md)
- 200-line file limit
- Zod-inferred types only
- Repository/service/hook/component split per feature
- GlassScreen + design tokens only, no hardcoded hex
- Every data-driven screen has loading + error + empty + offline + optimistic states
- Animations via Reanimated 4.5.1, no `Animated` from react-native
- Accessibility labels on every interactive element
- useReducedMotion() before any animation
- aria/touchTarget min 44x44
- TypeScript strict
- Verify `npx tsc --noEmit` after every phase
