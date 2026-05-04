# @ts-nocheck Audit

**Date:** April 27, 2026  
**Total Files:** 59  
**Goal:** Remove all flags and fix underlying TypeScript errors

---

## Priority Screens (Fix First)

| File | Line Count | Reason |
|------|------------|--------|
| `src/screens/home/HomeScreen.tsx` | ~250 | Core home screen - hardcoded values |
| `src/screens/progress/BattlePassScreen.tsx` | 578 | Oversized, needs splitting |
| `src/screens/AICoachScreen.tsx` | ~300 | Coach not wired to generators |
| `src/screens/RivalsScreen.tsx` | ~280 | Rival system needs typing |
| `src/screens/SquadWarsScreen.tsx` | ~260 | Squad war screen |

---

## Full File List (59 files)

### Screens (9 files)
1. `src/screens/AICoachScreen.tsx`
2. `src/screens/home/HomeScreen.tsx`
3. `src/screens/onboarding/components/OnboardingChoosePersona.tsx`
4. `src/screens/onboarding/components/OnboardingPermissions.tsx`
5. `src/screens/profile/InventoryScreen.tsx`
6. `src/screens/progress/BattlePassScreen.tsx`
7. `src/screens/rewards/VaultScreen.tsx`
8. `src/screens/RivalsScreen.tsx`
9. `src/screens/SquadWarsScreen.tsx`

### Features - Achievements (4 files)
10. `src/features/achievements/components/AchievementDetailSheet.tsx`
11. `src/features/achievements/components/AchievementUnlockToast.tsx`
12. `src/features/achievements/service.ts`
13. `src/features/achievements/types.ts`

### Features - AI Coach (4 files)
14. `src/features/ai-coach/components/coach-history-view.tsx`
15. `src/features/ai-coach/hooks-enhanced.ts`
16. `src/features/ai-coach/integration-enhanced.ts`
17. `src/features/ai-coach/services/coach-session-trigger.ts`

### Features - Battle Pass (1 file)
18. `src/features/battle-pass/components/BattlePassTrack.tsx`

### Features - Feed (1 file)
19. `src/features/feed/components/FeedScreen.tsx`

### Features - Home Spine (5 files)
20. `src/features/home-spine/components/RecentSessionsList.tsx`
21. `src/features/home-spine/components/StartSessionButton.tsx`
22. `src/features/home-spine/components/StreakWidget.tsx`
23. `src/features/home-spine/components/WeeklyCalendar.tsx`
24. `src/screens/home/HomeScreen.tsx` (already listed)

### Features - Integration (2 files)
25. `src/features/integration/economy-feed.ts`
26. `src/features/integration/social-feed.ts`

### Features - LiveOps (3 files)
27. `src/features/live-ops/service.ts`
28. `src/features/liveops/service.ts`
29. `src/features/liveops-config/components/ConfigViewer.tsx`
30. `src/features/liveops-config/components/FeatureFlagPanel.tsx`

### Features - Milestones (1 file)
31. `src/features/milestones/service.ts`

### Features - Rewards (1 file)
32. `src/features/rewards/components/DailyLoginModal.tsx`

### Features - Rivals (3 files)
33. `src/features/rivals/components/RivalChallengeCard.tsx`
34. `src/features/rivals/notifications.ts`
35. `src/features/rivals/repository.ts`

### Features - Seasons (1 file)
36. `src/features/seasons/components/SeasonCard.tsx`

### Features - Session Completion (1 file)
37. `src/features/session-completion/components/CriticalHitBanner.tsx`

### Features - Social (1 file)
38. `src/features/social/service.ts`

### Features - Spectacle (3 files)
39. `src/features/spectacle/components/LevelUpOverlay.tsx`
40. `src/features/spectacle/components/RareLootDropCeremony.tsx`
41. `src/features/spectacle/service.ts`

### Features - Squads (1 file)
42. `src/features/squads/index.ts`

### Features - Squad Wars (3 files)
43. `src/features/squad-wars/components/SquadWarScreen.tsx`
44. `src/features/squad-wars/services/war-notifications.ts`
45. `src/features/squad-wars/services/war-rewards.ts`

### Features - Streaks (3 files)
46. `src/features/streaks/components/StreakGamblePrompt.tsx`
47. `src/features/streaks/components/StreakMilestoneModal.tsx`
48. `src/features/streaks/index.ts`

### Session Components (2 files)
49. `src/session/components/SessionValidationFeedback.tsx`
50. `src/session/components/SquadSyncIndicator.tsx`

### Session Integration (1 file)
51. `src/session/integration/SessionCompletionOrchestrator.ts`

### Shared - Analytics (2 files)
52. `src/shared/analytics/advanced-analytics.ts`
53. `src/shared/analytics/analytics-service.ts`

### Shared - Monetization (2 files)
54. `src/shared/monetization/index.ts`
55. `src/shared/monetization/revenuecat-service.ts`

### Shared - UI Components (5 files)
56. `src/shared/ui/components/DataListFlashList.tsx`
57. `src/shared/ui/components/FormField.tsx`
58. `src/shared/ui/components/InteractiveCard.tsx`
59. `src/shared/ui/components/ProgressSteps.tsx`
60. `src/shared/ui/components/TransitionWrapper.tsx`

### Social (1 file)
61. `src/social/SocialServiceEnhanced.ts`

---

## Fix Strategy

### Phase 0A.2: HomeScreen.tsx
- Remove @ts-nocheck
- Fix squadMembersFocusing hardcoded value (create useSquadMembersFocusing hook)
- Fix RecentSessionsList sessions={[]} empty array
- Fix challenge claim reward console.log
- Fix "View All challenges" console.log navigation

### Phase 0A.3: BattlePassScreen.tsx
- Remove @ts-nocheck
- File is 578 lines - split into components
- Fix TypeScript errors

### Phase 0A.4: AICoachScreen.tsx
- Remove @ts-nocheck
- Wire PersonalQuestGenerator to UI
- Wire intervention-engine to UI

### Phase 0A.5: RivalsScreen.tsx
- Remove @ts-nocheck
- Fix hook typing (useMyRivals, useRivalSuggestions, useActiveChallenges)

### Phase 0A.6: SquadWarsScreen.tsx
- Remove @ts-nocheck
- Fix hook typing (useCurrentSquadWar, useSquadWarStats, useSubscribeToWarDamage)

### Phase 0A.7: Remaining 54 files
- Work through systematically
- Group by feature area
- Run `npx tsc --noEmit` after every 10 files

---

## Progress Tracking

| Sub-phase | Files Fixed | Status |
|-----------|-------------|--------|
| 0A.1 Audit | - | ✅ Done |
| 0A.2 HomeScreen | 1/1 | ✅ Complete |
| 0A.3 BattlePassScreen | 1/1 | ✅ Complete (split from 582 → 152 lines) |
| 0A.4 AICoachScreen | 1/1 | ✅ Complete (9 errors fixed) |
| 0A.5 RivalsScreen | 1/1 | Complete |
| 0A.6 SquadWarsScreen | 1/1 | Complete |
| 0A.7 Remaining | 49/54 | In progress |

## Completed Work

### ✅ HomeScreen.tsx (0A.2)
**Changes made:**
- Removed `@ts-nocheck` flag
- Added `useNavigation` and `Nav` type imports
- Replaced hardcoded `squadMembersFocusing = 0` with `useSquadMembersFocusing()` hook
  - Created new hook in `src/features/squads/hooks.ts`
  - Added `getActiveSquadSessionCount()` and `subscribeToSquadSessions()` in repository
- Replaced `console.log` in `onClaimReward` with `useClaimChallengeReward()` mutation
- Replaced `console.log` in `onViewAll` with proper navigation to 'Challenges' route
- Added 'Challenges' route to `MainStackRoute` and `MainStackParams` in navigation/types.ts
- Fixed `RecentSessionsList` to map from `controller.historyQuery.history` with proper typing
- Fixed `AtRiskBanner` component to accept `number | null` for `hoursRemaining`
- Removed inline `@ts-nocheck` comment from `ComebackQuestCard` onPress handler

**TypeScript errors fixed:** 9 errors eliminated (45 → 36 total)

### ✅ BattlePassScreen.tsx (0A.3)
**Changes made:**
- Split 582-line file into 5 components per AGENTS.md 200-line limit:
  - `BattlePassSeasonHeader.tsx` - Season name and countdown
  - `BattlePassXPProgress.tsx` - Tier progress with animated bar
  - `BattlePassTierCard.tsx` - Individual tier reward card
  - `BattlePassTierTrack.tsx` - Horizontal FlashList track + TrackTabs
  - `BattlePassScreen.tsx` - Main screen shell (reduced to 152 lines)
- Fixed type imports: `useUserBattlePass`, `useBattlePassTiers`, `useClaimTier`
- Fixed `hasPremium` → `isPremium` property name
- Fixed Skeleton import path
- Removed `@ts-nocheck` flag

**Files created:**
- `src/screens/progress/components/BattlePassSeasonHeader.tsx`
- `src/screens/progress/components/BattlePassXPProgress.tsx`
- `src/screens/progress/components/BattlePassTierCard.tsx`
- `src/screens/progress/components/BattlePassTierTrack.tsx`
- `src/screens/progress/components/index.ts`

### AICoachScreen.tsx (0A.4)
**Changes made:**
- Removed `@ts-nocheck` flag
- Added `ErrorState` export to `components/states/index.ts`
- Fixed `ErrorState` props: `message` → `description`, added `title`
- Fixed Skeleton style prop by wrapping in Animated.View
- Fixed `useCoachMessages` to handle nullable userId with `userId ?? ''`
- Fixed `useCoachMessageActions` usage: removed `.mutate`, used `.markRead()` and `.takeAction()`
- Fixed `useUpdateMessageStatus` call: removed status param, use direct hook methods
- Fixed `CoachMessage` type: removed non-existent `type` and `metadata` properties
- Fixed `CoachMessage` to include all required fields: `deliveryMethod`, `status`, `scheduledFor`, `dismissedAt`, `actionTaken`
- Fixed `EmptyState` props: `message` → `body`
- Fixed MessageCategory check: removed invalid `'TIP'` category
- Fixed hook dependency arrays

**Errors fixed:** 9 TypeScript errors eliminated

---

## Definition of Done for Phase 0A

- [ ] Zero files contain `@ts-nocheck`
- [ ] `npx tsc --noEmit` returns exit code 0
- [ ] All 59 previously suppressed files compile cleanly

### RivalsScreen.tsx (0A.5)
**Changes made:**
- Removed `@ts-nocheck` flag.
- Split oversized inline card/section UI into typed feature components:
  - `src/features/rivals/components/RivalCard.tsx`
  - `src/features/rivals/components/SuggestedRivalCard.tsx`
  - `src/features/rivals/components/RivalsSections.tsx`
- Added typed `refetch` support to `RivalsHookResult<T>`.
- Replaced undeclared retry handlers and missing card component references with typed feature-layer components.

**Verification:**
- Filtered typecheck output for `RivalsScreen`/`features/rivals` returned no RivalsScreen errors before broad 0A.7 suppression removal.

### SquadWarsScreen.tsx (0A.6)
**Changes made:**
- Removed `@ts-nocheck` flag during the 0A.7 suppression removal pass.

**Verification:**
- Filtered typecheck output for `src/screens/SquadWarsScreen` returned no errors for the production screen.
