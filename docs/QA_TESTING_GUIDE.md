# VEX App - QA Testing Guide

## Phase 24: Regression Testing Procedures

This guide documents the manual testing procedures required for Phase 24 completion.

---

## 24.1 — Full New User Journey

### Test Path
Fresh install → onboarding complete → first session → first boss encounter → first session complete

### Verification Checklist
- [ ] App launches without crash on fresh install
- [ ] Onboarding flow completes without error
- [ ] First session setup screen appears correctly
- [ ] Session timer starts and counts down
- [ ] Grade reveal animation plays after session complete
- [ ] Chest opening animation triggers
- [ ] XP counter animates smoothly
- [ ] Coin/gem rewards animate with AnimatedCounter
- [ ] Home screen shows updated streak (1 day)
- [ ] No console errors during entire flow

### Test Screens
1. `OnboardingFlowScreen.tsx` - First launch
2. `SessionSetupScreen.tsx` - Session configuration
3. `ActiveSessionScreen.tsx` - Timer running
4. `GradeRevealAnimation.tsx` - Post-session grade
5. `ChestRevealAnimation.tsx` - Rewards
6. `SessionCompleteContent.tsx` - Summary

---

## 24.2 — Returning User Journey

### Prerequisites
Test user must have:
- 7+ day streak
- Active boss encounter
- Squad membership
- Active rival

### Test Path
Open app → verify home screen → start session → complete session

### Verification Checklist
- [ ] Home screen loads without skeleton flicker
- [ ] Streak widget shows correct day count with AnimatedCounter
- [ ] Boss health bar displays correct percentage
- [ ] Squad widget shows member activity
- [ ] Rival widget shows current standing
- [ ] All data loads within 2 seconds
- [ ] Session starts with pre-filled preferences
- [ ] Session completion updates all widgets
- [ ] Boss damage applied correctly
- [ ] Streak increments

### Key Components to Verify
- `StreakWidget.tsx` - Animated counter for days
- `BossBattleHUD.tsx` - Health display
- `SquadWidget.tsx` - Member presence
- `RivalWidget.tsx` - Competition status
- `SimpleWalletBadge.tsx` - Animated coins/gems

---

## 24.3 — Streak Break Journey

### Test Path
Force streak break → open app → StreakFuneralScreen → ComebackScreen → complete comeback quest

### Verification Checklist
- [ ] StreakFuneralScreen appears when opening app with broken streak
- [ ] Screen shows previous streak count
- [ ] 💔 emoji displayed prominently
- [ ] "Start Fresh" button works
- [ ] ComebackScreen appears (if eligible)
- [ ] Comeback multiplier displayed
- [ ] Completing session restores streak
- [ ] Toast shows comeback bonus

### Key Screens
- `StreakFuneralScreen.tsx`
- `ComebackScreen.tsx`
- `ComebackQuestCard.tsx`

---

## 24.4 — Boss Defeat Journey

### Test Path
Set boss to 1% health → complete session → BossDefeatedCeremony → verify rewards → verify new boss

### Verification Checklist
- [ ] Boss health at 1% before session
- [ ] Session completion triggers boss defeat
- [ ] BossDefeatedCeremony screen appears
- [ ] Victory animation plays
- [ ] Damage contribution displayed
- [ ] Boss rewards delivered (coins/gems)
- [ ] New boss spawns within timeout period
- [ ] Boss tab shows new encounter

### Key Screens
- `BossDefeatedCeremony.tsx`
- `BossDefeatedScreen.tsx`
- `BossScreen.tsx`

---

## 24.5 — Offline Journey

### Test Path
Airplane mode → start session → complete session → re-enable internet → verify sync

### Verification Checklist
- [ ] Session can be started in airplane mode
- [ ] Timer continues offline
- [ ] Session data saved locally (MMKV)
- [ ] Re-enable internet triggers sync
- [ ] Session appears in history
- [ ] XP/coins awarded after sync
- [ ] Streak updated correctly
- [ ] No duplicate entries

### Key Components
- `SessionOrchestrator.ts` - Offline handling
- `AntiCheatEngine.ts` - Validation after sync

---

## Automated Verification Commands

### TypeScript Check
```bash
npx tsc --noEmit
```

### Lint Check
```bash
npm run lint
```

### Test Coverage
```bash
npm test -- --coverage
```

### E2E Tests (Detox)
```bash
detox test --configuration ios.sim.debug
```

---

## Phase 23 Polish Verification

### Empty States (23.1)
- [ ] EmptyFeed shows boss-specific message
- [ ] EmptyNotifications shows witty copy
- [ ] EmptyRivals shows ghost rivals message
- [ ] EmptyAchievements shows "Yet." copy

### Loading States (23.2)
- [ ] Home screen: "Loading your focus dashboard..."
- [ ] Streak calendar: "Building your flame trail..."
- [ ] Coach: "Your coach is reviewing your patterns..."
- [ ] Never shows generic "Loading..."

### Streak Calendar (23.3)
- [ ] 30-day grid renders
- [ ] Today's cell has pulsing outline
- [ ] Streak days show flame gradient
- [ ] Boss defeat days show 👑
- [ ] Color intensity based on duration

### Animated Counters (23.4)
- [ ] Wallet coins animate on change
- [ ] Wallet gems animate on change
- [ ] Streak days animate on change
- [ ] Longest streak animates
- [ ] 600ms duration for small changes

### Error Messages (23.5)
- [ ] Network: "VEX lost connection..."
- [ ] Session fail: "Boss must have tampered..."
- [ ] Purchase fail: "That purchase didn't go through..."
- [ ] Auth: "Session expired..."

---

## Sign-Off Criteria

Before Phase 24 is marked complete:

1. All 5 journeys tested on real device
2. No crashes in any flow
3. All animations render at 60fps
4. No console.log errors
5. TypeScript errors documented (if any)
6. E2E tests pass
7. Manual QA checklist complete

---

## Testing Notes Template

```
Date: [DATE]
Tester: [NAME]
Device: [MODEL/OS]
Build: [VERSION]

Journey 24.1: [PASS/FAIL]
- Notes: 

Journey 24.2: [PASS/FAIL]
- Notes:

Journey 24.3: [PASS/FAIL]
- Notes:

Journey 24.4: [PASS/FAIL]
- Notes:

Journey 24.5: [PASS/FAIL]
- Notes:

Blockers: [LIST]
```
