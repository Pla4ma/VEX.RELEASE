# Gamification Transformation Guide

**Phase 3: Gamification Simplification**  
Transforming competitive game mechanics into productivity-aligned features.

---

## Summary of Changes

| Old Feature | New Feature | Key Changes |
|-------------|-------------|-------------|
| **Boss** → | **Milestones** | Combat → Achievement metaphors |
| **Battle Pass** → | **Season Journey** | 100+ tiers → 20-30 milestones |
| **Squads** → | **Study Circles** | Real-time → Async only |
| **Rivals** → | **Study Buddies** | Competitive → Non-competitive |

---

## 1. Boss → Milestones

### Terminology Mapping

| Old Term | New Term | Notes |
|----------|----------|-------|
| `Boss` | `Milestone` | Achievement target |
| `BossEncounter` | `MilestoneProgress` | Tracking completion |
| `Defeat` | `Complete` | Achievement language |
| `Damage` | `Progress` | Progress toward goal |
| `Health` | `Threshold` | Target to reach |
| `Combat` | `Achievement` | Non-violent metaphor |
| `Critical Hit` | `Bonus Progress` | Extra achievement |

### Type Changes

```typescript
// OLD
export type BossEncounterStatus = 'ACTIVE' | 'DEFEATED' | 'TIMEOUT' | 'ABANDONED';
export type BossRewardType = 'XP' | 'COINS' | 'GEMS' | 'ITEM' | 'COSMETIC' | 'STREAK_SHIELD';

// NEW (in milestones/types.ts)
export type MilestoneCategory = 'PROGRESSION' | 'STREAK' | 'SESSION' | 'CHALLENGE' | 'SOCIAL';
export type MilestoneType = 'LEVEL' | 'XP_TOTAL' | 'STREAK_DAYS' | 'SESSIONS_COMPLETED' | 'FOCUS_TIME' | 'CHALLENGES_COMPLETED' | 'DAYS_ACTIVE' | 'ACHIEVEMENTS_UNLOCKED';
```

### Migration Steps

1. **Database**: Update `boss_encounters` table → `milestone_progress`
2. **API Endpoints**: Rename `/boss/*` → `/milestones/*`
3. **UI Components**: Replace combat visuals with achievement visuals
4. **Copy**: Replace all "defeat", "attack", "combat" language

---

## 2. Battle Pass → Season Journey

### Key Simplifications

| Aspect | Old (Battle Pass) | New (Season Journey) |
|--------|-------------------|---------------------|
| Tiers | 100+ | 20-30 |
| Tracks | Free + Premium | Single track for all |
| Grind | Heavy XP requirements | Meaningful milestones |
| FOMO | High pressure | Relaxed progression |

### Type Changes

```typescript
// OLD
export interface BattlePassTier {
  tierNumber: number; // 1-100+
  freeRewardId: string | null;
  premiumRewardId: string | null; // Separate premium track
}

export interface UserBattlePass {
  currentTier: number;
  isPremium: boolean; // Paywall
  claimedFreeTiers: number[];
  claimedPremiumTiers: number[];
}

// NEW (in season-journey/types.ts)
export interface JourneyMilestone {
  milestoneNumber: number; // 1-30
  rewardId: string | null; // Everyone gets same reward
  name: string; // Named milestone
  description: string;
}

export interface UserJourney {
  currentMilestone: number;
  claimedMilestones: number[]; // Single array
}
```

### Data Migration

```typescript
// Map old tiers to new milestones
const TIER_TO_MILESTONE_MAP: Record<number, number> = {
  1: 1,   5: 2,   10: 3,
  15: 4,  20: 5,  25: 6,
  30: 7,  40: 8,  50: 9,
  60: 10, 70: 11, 80: 12,
  90: 13, 100: 14,
  // ... etc
};

// Combine free + premium rewards
function migrateRewards(oldTier: BattlePassTier): JourneyMilestone {
  return {
    milestoneNumber: TIER_TO_MILESTONE_MAP[oldTier.tierNumber],
    rewardId: oldTier.freeRewardId || oldTier.premiumRewardId,
    // Premium rewards become milestone rewards
  };
}
```

---

## 3. Squads → Study Circles

### Key Changes

| Feature | Old (Squads) | New (Study Circles) |
|---------|--------------|---------------------|
| Real-time | Shared sessions | Async updates only |
| Size | Large groups | 3-8 people |
| Bosses | Group combat | Shared weekly goals |
| Multipliers | Complex math | Simple contribution |
| Leaderboard | Rankings | Mutual support |

### Removed Features

- ❌ Real-time shared sessions
- ❌ Boss encounters
- ❌ Live combat
- ❌ Complex multipliers
- ❌ Synergy levels
- ❌ Rankings/leaderboards

### New Features

- ✅ Weekly shared goals
- ✅ Async activity feed
- ✅ Simple contribution tracking
- ✅ Accountability check-ins

### Type Changes

```typescript
// OLD
export interface Squad {
  activeBossId: string | null;
  bossHealthRemaining: number | null;
  focusMultiplier: number;
  synergyLevel: number;
}

// NEW (in study-circles/types.ts)
export interface StudyCircle {
  weeklyGoalMinutes: number;
  currentWeekProgress: number;
  // No bosses, no multipliers, no complex stats
}
```

---

## 4. Rivals → Study Buddies

### Philosophy Change

| Aspect | Old (Rivals) | New (Study Buddies) |
|--------|--------------|---------------------|
| Relationship | Competitive | Supportive |
| Goal | Win/Lose | Mutual success |
| Communication | Taunts | Encouragements |
| Stakes | Penalties | Shared goals |
| Leaderboard | Rankings | Side-by-side progress |

### Terminology Mapping

| Old Term | New Term |
|----------|----------|
| `Rival` | `Buddy` |
| `Taunt` | `Encouragement` |
| `Win/Lose` | `Both complete` |
| `Stakes` | `Shared goal` |
| `Damage` | `Progress` |
| `Leaderboard` | `Mutual stats` |

### Type Changes

```typescript
// OLD
export interface Rival {
  rivalryType: 'competitive' | 'tournament';
  stakes: RivalStakes; // Winner takes all
  metrics: RivalryMetrics; // Winner/loser tracking
}

export type RivalActivityType = 'DAMAGE_DEALT' | 'VICTORY' | 'DEFEAT';

// NEW (in study-buddies/types.ts)
export interface StudyBuddy {
  sharedGoal: SharedGoal; // Both work toward same goal
  mutualStats: MutualStats; // No winner/loser
}

export type BuddyActivityType =
  | 'SESSION_COMPLETED'
  | 'GOAL_PROGRESS'
  | 'GOAL_COMPLETED'
  | 'ENCOURAGEMENT_SENT';
```

### Encouragement System

Replace taunts with supportive messages:

```typescript
// OLD (taunts)
"I'm crushing you!"
"You're falling behind!"

// NEW (encouragements)
"Great job on your session!"
"Keep going, you've got this!"
"Almost at your streak goal!"
```

---

## Implementation Checklist

### Database Migration

- [ ] Rename `boss_encounters` → `milestone_progress`
- [ ] Rename `battle_pass_tiers` → `journey_milestones`
- [ ] Rename `squads` → `study_circles`
- [ ] Rename `rivals` → `study_buddies`
- [ ] Update foreign key references
- [ ] Migrate user progress data

### API Migration

- [ ] Rename endpoints `/boss/*` → `/milestones/*`
- [ ] Rename endpoints `/battle-pass/*` → `/season-journey/*`
- [ ] Rename endpoints `/squads/*` → `/study-circles/*`
- [ ] Rename endpoints `/rivals/*` → `/study-buddies/*`

### Frontend Migration

- [ ] Update all imports
- [ ] Rename components
- [ ] Replace combat visuals
- [ ] Update copy/text
- [ ] Remove competitive elements

### Tests

- [ ] Update test files
- [ ] Remove boss combat tests
- [ ] Add milestone completion tests
- [ ] Update mock data

---

## File Mapping

| Old File | New File | Status |
|----------|----------|--------|
| `features/boss/types.ts` | `features/milestones/types.ts` | ✅ Updated |
| `features/battle-pass/types.ts` | `features/season-journey/types.ts` | ✅ Created |
| `features/squads/types.ts` | `features/study-circles/types.ts` | ✅ Created |
| `features/rivals/types.ts` | `features/study-buddies/types.ts` | ✅ Created |

---

## Migration Phases

### Phase 1: Types & Interfaces
✅ Create new type definitions  
✅ Define terminology mappings  
✅ Document changes

### Phase 2: Database Schema
⏳ Create migration scripts  
⏳ Update table names  
⏳ Migrate existing data

### Phase 3: API Layer
⏳ Update endpoints  
⏳ Rename route handlers  
⏳ Update documentation

### Phase 4: Frontend
⏳ Update component imports  
⏳ Replace combat UI  
⏳ Update user-facing copy

### Phase 5: Cleanup
⏳ Archive old boss files  
⏳ Remove unused components  
⏳ Update tests

---

## Notes

- **Backward Compatibility**: Maintain old APIs during transition
- **User Communication**: Announce changes before deployment
- **Data Preservation**: All user progress is preserved
- **Feature Flags**: Use flags to toggle old/new features during rollout
