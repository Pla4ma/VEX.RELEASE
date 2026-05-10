# src_impl ESLint Triage

Generated: 2026-05-09

## Command Evidence

Requested command run from `C:\Users\jonat\CascadeProjects\vex-app-old`:

```powershell
npx eslint src_impl --ext .ts,.tsx --quiet -f unix
```

Notes:
- First run timed out after 124 seconds before completing.
- Completed runs exited `1` and printed unix-format failure sets.
- Repeated runs returned different remaining totals while no source files were edited by this triage pass. The counts below use the latest completed exact-command snapshot parsed from unix-format output.

## Total Error Count

721 errors.

## Errors By Rule

| Rule | Count |
|---|---:|
| `@typescript-eslint/no-unused-vars` | 720 |
| `no-new-func` | 1 |

## Top 30 Files By Error Count

| Rank | File | Errors | Lines | Over 200 lines |
|---:|---|---:|---:|---|
| 1 | `src_impl\components\streak\StreakInsuranceModal.tsx` | 14 | 254 | Yes |
| 2 | `src_impl\features\ai-coach\integration-enhanced.ts` | 13 | 4 | No |
| 3 | `src_impl\features\ai-coach\message-generator.ts` | 13 | 537 | Yes |
| 4 | `src_impl\features\ai-coach\service\coach-state-machine.ts` | 13 | 354 | Yes |
| 5 | `src_impl\features\ai-coach\repository-enhanced.ts` | 12 | 2 | No |
| 6 | `src_impl\features\settings\components\SettingsScreen.tsx` | 12 | 137 | No |
| 7 | `src_impl\monetization\PaywallVerification.ts` | 11 | 823 | Yes |
| 8 | `src_impl\features\settings\validation.ts` | 10 | 3 | No |
| 9 | `src_impl\features\squads\persistence.ts` | 9 | 315 | Yes |
| 10 | `src_impl\privacy\PrivacyInventory.ts` | 9 | 552 | Yes |
| 11 | `src_impl\features\ai-coach\integration.ts` | 8 | 369 | Yes |
| 12 | `src_impl\features\items\service.ts` | 8 | 448 | Yes |
| 13 | `src_impl\features\squads\service.ts` | 8 | 738 | Yes |
| 14 | `src_impl\features\streaks\__tests__\streak-system.test.ts` | 8 | 344 | Yes |
| 15 | `src_impl\features\streaks\components\StreakBrokenModal.tsx` | 8 | 319 | Yes |
| 16 | `src_impl\features\focus-identity\FocusScoreDashboard.tsx` | 7 | 396 | Yes |
| 17 | `src_impl\privacy\__tests__\PrivacyInventory.test.ts` | 7 | 465 | Yes |
| 18 | `src_impl\features\ai-coach\service\intervention-engine.ts` | 6 | 345 | Yes |
| 19 | `src_impl\features\ai-coach\services\post-failure-support.ts` | 6 | 338 | Yes |
| 20 | `src_impl\features\analytics\service.ts` | 6 | 20 | No |
| 21 | `src_impl\features\boss\AdaptiveDifficulty.ts` | 6 | 930 | Yes |
| 22 | `src_impl\features\inventory\service.ts` | 6 | 4 | No |
| 23 | `src_impl\features\session\__tests__\session-stakes.test.ts` | 6 | 255 | Yes |
| 24 | `src_impl\features\squads\squad-war-service.ts` | 6 | 65 | No |
| 25 | `src_impl\monetization\__tests__\PaywallVerification.test.ts` | 6 | 691 | Yes |
| 26 | `src_impl\screens\profile\InventoryScreen.tsx` | 6 | 514 | Yes |
| 27 | `src_impl\screens\session\components\ChestRevealAnimationEnhanced.tsx` | 6 | 700 | Yes |
| 28 | `src_impl\session\components\CheckpointCelebration.tsx` | 6 | 339 | Yes |
| 29 | `src_impl\features\ai-coach\PredictiveInterventionEngine.ts` | 5 | 817 | Yes |
| 30 | `src_impl\features\boss\AdaptiveDifficultyEngine.ts` | 5 | 523 | Yes |

## Files Over 200 Lines Among Top Offenders

24 of the top 30 files exceed the 200-line project limit:

- `src_impl\components\streak\StreakInsuranceModal.tsx` - 254 lines
- `src_impl\features\ai-coach\message-generator.ts` - 537 lines
- `src_impl\features\ai-coach\service\coach-state-machine.ts` - 354 lines
- `src_impl\monetization\PaywallVerification.ts` - 823 lines
- `src_impl\features\squads\persistence.ts` - 315 lines
- `src_impl\privacy\PrivacyInventory.ts` - 552 lines
- `src_impl\features\ai-coach\integration.ts` - 369 lines
- `src_impl\features\items\service.ts` - 448 lines
- `src_impl\features\squads\service.ts` - 738 lines
- `src_impl\features\streaks\__tests__\streak-system.test.ts` - 344 lines
- `src_impl\features\streaks\components\StreakBrokenModal.tsx` - 319 lines
- `src_impl\features\focus-identity\FocusScoreDashboard.tsx` - 396 lines
- `src_impl\privacy\__tests__\PrivacyInventory.test.ts` - 465 lines
- `src_impl\features\ai-coach\service\intervention-engine.ts` - 345 lines
- `src_impl\features\ai-coach\services\post-failure-support.ts` - 338 lines
- `src_impl\features\boss\AdaptiveDifficulty.ts` - 930 lines
- `src_impl\features\session\__tests__\session-stakes.test.ts` - 255 lines
- `src_impl\monetization\__tests__\PaywallVerification.test.ts` - 691 lines
- `src_impl\screens\profile\InventoryScreen.tsx` - 514 lines
- `src_impl\screens\session\components\ChestRevealAnimationEnhanced.tsx` - 700 lines
- `src_impl\session\components\CheckpointCelebration.tsx` - 339 lines
- `src_impl\features\ai-coach\PredictiveInterventionEngine.ts` - 817 lines
- `src_impl\features\boss\AdaptiveDifficultyEngine.ts` - 523 lines

## Safe Mechanical Fixes

These are likely mechanical when the symbol is truly unused:

- Remove unused imports, including unused React Native imports such as `View`, `StyleSheet`, `Pressable`, `Platform`, and unused Reanimated imports.
- Remove unused type imports when they do not support exported API documentation or public type signatures.
- Rename intentionally unused callback parameters, destructured array elements, and rest parameters to `_name` where the call signature requires them.
- Remove unused local constants where there is no side effect and no downstream reference.
- Remove unused test helpers, unused test imports such as `beforeEach` or `afterEach`, and unused local variables in tests when assertions do not need them.

Run command for mechanical-only batches:

```powershell
npx eslint <owned-files> --quiet -f unix
```

Then run the broader target after the batch:

```powershell
npx eslint src_impl --ext .ts,.tsx --quiet -f unix
```

## Risky Behavior Fixes

These need code review instead of blind deletion:

- `src_impl\screens\session\components\SessionGradeCard.tsx` has the only `no-new-func` error. Replacing `Function` may change runtime behavior and should be handled as a behavior fix with tests.
- Unused variables named like domain values, event payloads, repository results, or integration objects may indicate incomplete behavior, missing event emission, missing assertions, or partially wired flows.
- Unused props in UI components may indicate lost UI affordances or parent contracts. Prefer either wiring the prop or deliberately renaming it to `_prop` only when the public signature is required.
- Unused values in service and integration files may indicate missing analytics, Sentry breadcrumbs, EventBus emissions, persistence, or validation.
- Any fix in files over 200 lines should consider whether touching the file requires splitting before or during the behavioral fix phase.

## Proposed Parallel Batches

Each batch has non-overlapping file ownership. Batches should not run `eslint --fix`, should not add suppressions, and should not edit files outside their ownership list.

### Batch 1 - AI Coach Core

Ownership:
- `src_impl\features\ai-coach\CoachMemory.ts`
- `src_impl\features\ai-coach\PersonalQuestGenerator.ts`
- `src_impl\features\ai-coach\PredictiveInterventionEngine.ts`
- `src_impl\features\ai-coach\integration.ts`
- `src_impl\features\ai-coach\integration-enhanced.ts`
- `src_impl\features\ai-coach\intervention-service.ts`
- `src_impl\features\ai-coach\message-generator.ts`
- `src_impl\features\ai-coach\repository-enhanced.ts`
- `src_impl\features\ai-coach\service\coach-state-machine.ts`
- `src_impl\features\ai-coach\service\intervention-engine.ts`
- `src_impl\features\ai-coach\services\post-failure-support.ts`

Command:

```powershell
npx eslint src_impl/features/ai-coach --ext .ts,.tsx --quiet -f unix
```

### Batch 2 - AI Coach Tests And Components

Ownership:
- `src_impl\features\ai-coach\__tests__\*.ts`
- `src_impl\features\ai-coach\__tests__\*.tsx`
- `src_impl\features\ai-coach\components\**\*.tsx`
- `src_impl\features\ai-coach\hooks-realtime.ts`

Command:

```powershell
npx eslint src_impl/features/ai-coach/__tests__ src_impl/features/ai-coach/components src_impl/features/ai-coach/hooks-realtime.ts --ext .ts,.tsx --quiet -f unix
```

### Batch 3 - Streaks

Ownership:
- `src_impl\components\streak\StreakInsuranceModal.tsx`
- `src_impl\features\streaks\**\*.ts`
- `src_impl\features\streaks\**\*.tsx`
- `src_impl\screens\streaks\**\*.tsx`

Command:

```powershell
npx eslint src_impl/components/streak src_impl/features/streaks src_impl/screens/streaks --ext .ts,.tsx --quiet -f unix
```

### Batch 4 - Session Runtime

Ownership:
- `src_impl\session\**\*.ts`
- `src_impl\session\**\*.tsx`

Command:

```powershell
npx eslint src_impl/session --ext .ts,.tsx --quiet -f unix
```

### Batch 5 - Session Screens

Ownership:
- `src_impl\screens\session\**\*.tsx`
- `src_impl\features\session\**\*.ts`
- `src_impl\features\session\**\*.tsx`
- `src_impl\features\session-start\**\*.ts`
- `src_impl\features\session-start\**\*.tsx`

Command:

```powershell
npx eslint src_impl/screens/session src_impl/features/session src_impl/features/session-start --ext .ts,.tsx --quiet -f unix
```

### Batch 6 - Squads And Social

Ownership:
- `src_impl\features\squads\**\*.ts`
- `src_impl\features\squads\**\*.tsx`
- `src_impl\features\social\**\*.ts`
- `src_impl\features\social\**\*.tsx`

Command:

```powershell
npx eslint src_impl/features/squads src_impl/features/social --ext .ts,.tsx --quiet -f unix
```

### Batch 7 - Privacy, Settings, And Monetization

Ownership:
- `src_impl\privacy\**\*.ts`
- `src_impl\privacy\**\*.tsx`
- `src_impl\features\settings\**\*.ts`
- `src_impl\features\settings\**\*.tsx`
- `src_impl\screens\settings\**\*.tsx`
- `src_impl\monetization\**\*.ts`
- `src_impl\monetization\**\*.tsx`

Command:

```powershell
npx eslint src_impl/privacy src_impl/features/settings src_impl/screens/settings src_impl/monetization --ext .ts,.tsx --quiet -f unix
```

### Batch 8 - Boss, Challenges, Economy, Inventory, Shop

Ownership:
- `src_impl\features\boss\**\*.ts`
- `src_impl\features\boss\**\*.tsx`
- `src_impl\features\boss-realtime\**\*.ts`
- `src_impl\features\boss-realtime\**\*.tsx`
- `src_impl\features\challenges\**\*.ts`
- `src_impl\features\challenges\**\*.tsx`
- `src_impl\features\items\**\*.ts`
- `src_impl\features\items\**\*.tsx`
- `src_impl\features\inventory\**\*.ts`
- `src_impl\features\inventory\**\*.tsx`
- `src_impl\features\shop\**\*.ts`
- `src_impl\features\shop\**\*.tsx`

Command:

```powershell
npx eslint src_impl/features/boss src_impl/features/boss-realtime src_impl/features/challenges src_impl/features/items src_impl/features/inventory src_impl/features/shop --ext .ts,.tsx --quiet -f unix
```

### Batch 9 - Shared App Shell, Screens, Constants, Errors, Events, Services

Ownership:
- `src_impl\components\states\**\*.tsx`
- `src_impl\components\ui\**\*.tsx`
- `src_impl\constants\**\*.ts`
- `src_impl\errors\**\*.ts`
- `src_impl\errors\**\*.tsx`
- `src_impl\events\**\*.ts`
- `src_impl\features\__tests__\*.ts`
- `src_impl\features\achievements\**\*.ts`
- `src_impl\features\achievements\**\*.tsx`
- `src_impl\features\analytics\**\*.ts`
- `src_impl\features\focus-identity\**\*.tsx`
- `src_impl\screens\profile\**\*.tsx`
- `src_impl\screens\progress\**\*.tsx`
- `src_impl\screens\rewards\**\*.tsx`
- `src_impl\services\**\*.ts`
- `src_impl\shared\analytics\**\*.ts`

Command:

```powershell
npx eslint src_impl/components/states src_impl/components/ui src_impl/constants src_impl/errors src_impl/events src_impl/features/__tests__ src_impl/features/achievements src_impl/features/analytics src_impl/features/focus-identity src_impl/screens/profile src_impl/screens/progress src_impl/screens/rewards src_impl/services src_impl/shared/analytics --ext .ts,.tsx --quiet -f unix
```

### Batch 10 - Risky `no-new-func`

Ownership:
- `src_impl\screens\session\components\SessionGradeCard.tsx`

Command:

```powershell
npx eslint src_impl/screens/session/components/SessionGradeCard.tsx --quiet -f unix
```

This batch should also run the nearest tests for session grade behavior if available before claiming completion.

## Final Verification Command

After all batches are merged:

```powershell
npx eslint src_impl --ext .ts,.tsx --quiet -f unix
```
