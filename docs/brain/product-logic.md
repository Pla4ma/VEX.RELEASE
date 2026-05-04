# Product Logic Reference Document

## Session → XP → Reward Flow

### XP Calculation Formula

```
Base XP = (durationMinutes × baseRate) × qualityMultiplier

Where:
  baseRate = 2 XP per minute
  qualityMultiplier = 0.5 to 2.0 based on session quality

Then apply multipliers:

Total XP = Base XP 
  × Streak Multiplier
  × Squad Multiplier  
  × Boss Multiplier (if active boss)
  × Comeback Multiplier (if recently returned)
  + Boss Damage Bonus
  + Perfect Session Bonus
```

### Step-by-Step Flow

**Step 1: Session Completes**
```typescript
// User taps "Finish" or timer reaches 0
const session = await sessionService.completeSession(sessionId);

// Calculate scores
const qualityScore = calculateQualityScore(session);
const consistencyScore = calculateConsistencyScore(session);
const finalScore = (qualityScore * 0.6) + (consistencyScore * 0.4);

// Calculate base XP
const baseXp = calculateBaseXp(session);
```

**Step 2: Quality Score Calculation**
```typescript
function calculateQualityScore(session: Session): number {
  // 0-100 score based on:
  // - Pause count (fewer = better)
  // - Pause duration (shorter = better)
  // - Completion percentage (100% = best)
  // - Strict mode bonus (2x if strict)
  
  let score = 100;
  
  // Deduct for pauses
  score -= session.pauseCount * 5;
  score -= Math.floor(session.totalPauseSeconds / 30);
  
  // Deduct for early completion
  const completionRate = session.elapsedSeconds / session.config.duration;
  if (completionRate < 0.8) {
    score -= (0.8 - completionRate) * 50;
  }
  
  // Strict mode bonus
  if (session.config.strictMode) {
    score = Math.min(100, score * 1.2);
  }
  
  return Math.max(0, Math.min(100, Math.floor(score)));
}
```

**Step 3: Apply Multipliers**
```typescript
function calculateTotalXp(
  baseXp: number,
  userId: string,
  session: Session
): { total: number; breakdown: XpBreakdown } {
  const breakdown: XpBreakdown = {
    base: baseXp,
    streakBonus: 0,
    squadBonus: 0,
    bossBonus: 0,
    comebackBonus: 0,
    perfectBonus: 0,
    total: baseXp,
  };
  
  // Streak multiplier
  const streak = await streakService.getStreak(userId);
  const streakMultiplier = getStreakMultiplier(streak.currentDays);
  breakdown.streakBonus = Math.floor(baseXp * (streakMultiplier - 1));
  breakdown.total += breakdown.streakBonus;
  
  // Squad multiplier
  const squad = await squadService.getUserSquad(userId);
  if (squad) {
    const squadMultiplier = squad.focusMultiplier;
    breakdown.squadBonus = Math.floor(baseXp * (squadMultiplier - 1));
    breakdown.total += breakdown.squadBonus;
  }
  
  // Boss encounter bonus
  const activeBoss = await bossService.getActiveBossEncounter(userId);
  if (activeBoss && activeBoss.status === 'ACTIVE') {
    const bossBonus = Math.floor(baseXp * 0.25); // 25% bonus during boss
    breakdown.bossBonus = bossBonus;
    breakdown.total += bossBonus;
    
    // Apply damage to boss
    const damage = calculateBossDamage(session, activeBoss);
    await bossService.applyDamage(activeBoss.id, damage, session.id);
  }
  
  // Comeback bonus (if user returned after absence)
  const comebackMultiplier = comebackService.getMultiplier(userId);
  if (comebackMultiplier > 1) {
    breakdown.comebackBonus = Math.floor(baseXp * (comebackMultiplier - 1));
    breakdown.total += breakdown.comebackBonus;
  }
  
  // Perfect session bonus (S grade, no pauses, full duration)
  if (session.qualityScore >= 95 && session.pauseCount === 0) {
    breakdown.perfectBonus = 50;
    breakdown.total += 50;
  }
  
  return { total: breakdown.total, breakdown };
}

// Streak multiplier table
function getStreakMultiplier(streakDays: number): number {
  if (streakDays >= 30) return 2.0;    // 100% bonus
  if (streakDays >= 14) return 1.75;   // 75% bonus
  if (streakDays >= 7) return 1.5;     // 50% bonus
  if (streakDays >= 3) return 1.25;    // 25% bonus
  return 1.0;                          // No bonus
}
```

**Step 4: Progression Update**
```typescript
async function addXpToProgression(
  userId: string, 
  xpAmount: number,
  breakdown: XpBreakdown
): Promise<ProgressionUpdate> {
  const progression = await progressionService.getProgression(userId);
  
  const oldLevel = progression.level;
  let newTotalXp = progression.totalXp + xpAmount;
  let currentLevelXp = progression.xp + xpAmount;
  let newLevel = progression.level;
  let levelsGained = 0;
  
  // Check for level ups
  while (currentLevelXp >= progression.nextLevelThreshold) {
    currentLevelXp -= progression.nextLevelThreshold;
    newLevel++;
    levelsGained++;
    
    // Trigger level up reward
    await rewardService.createLevelUpReward(userId, newLevel);
  }
  
  // Update progression
  await progressionService.updateProgression(userId, {
    level: newLevel,
    xp: currentLevelXp,
    totalXp: newTotalXp,
    nextLevelThreshold: calculateLevelThreshold(newLevel + 1),
    lastLevelUpAt: levelsGained > 0 ? Date.now() : progression.lastLevelUpAt,
  });
  
  return {
    xpGained: xpAmount,
    oldLevel,
    newLevel,
    levelsGained,
    currentLevelXp,
    nextLevelThreshold: calculateLevelThreshold(newLevel + 1),
  };
}
```

**Step 5: Reward Evaluation & Delivery**
```typescript
async function evaluateAndDeliverRewards(
  userId: string,
  session: Session,
  progressionUpdate: ProgressionUpdate
): Promise<Reward[]> {
  const rewards: Reward[] = [];
  
  // 1. Session completion reward (always)
  const sessionReward = await rewardService.createSessionReward(
    userId,
    session,
    progressionUpdate.xpGained
  );
  rewards.push(sessionReward);
  
  // 2. Streak milestone check
  const streak = await streakService.getStreak(userId);
  const milestones = [3, 7, 14, 30, 60, 100];
  if (milestones.includes(streak.currentDays)) {
    const streakReward = await rewardService.createStreakMilestoneReward(
      userId,
      streak.currentDays
    );
    rewards.push(streakReward);
  }
  
  // 3. Level up rewards (if applicable)
  if (progressionUpdate.levelsGained > 0) {
    for (let i = 0; i < progressionUpdate.levelsGained; i++) {
      const level = progressionUpdate.oldLevel + i + 1;
      const levelReward = await rewardService.createLevelUpReward(userId, level);
      rewards.push(levelReward);
    }
  }
  
  // 4. Boss defeat check (handled separately via boss subscription)
  // 5. Achievement unlocks (checked via event handlers)
  
  // Deliver all rewards
  for (const reward of rewards) {
    await rewardService.deliverReward(reward.id);
  }
  
  // Notify user
  await notificationService.sendRewardsNotification(userId, rewards);
  
  return rewards;
}
```

**Step 6: Failure Handling**
```typescript
// If any step fails, the system must:
// 1. Log to Sentry
// 2. Retry up to 3 times with exponential backoff
// 3. If still failing, queue for offline processing
// 4. Never lose the session completion record

async function completeSessionWithRetry(sessionId: string): Promise<void> {
  const maxRetries = 3;
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      await completeSessionFlow(sessionId);
      return; // Success
    } catch (error) {
      lastError = error as Error;
      
      // Log
      Sentry.captureException(error, {
        tags: { 
          feature: 'session-completion',
          attempt: attempt + 1,
        },
      });
      
      // Wait before retry
      if (attempt < maxRetries - 1) {
        await delay(1000 * Math.pow(2, attempt));
      }
    }
  }
  
  // All retries failed - queue for offline
  await offlineQueueService.addEntry({
    type: 'COMPLETE_SESSION',
    payload: { sessionId },
    priority: 1, // High priority
  });
  
  // Notify user
  toast.info('Session saved - will sync when online');
}
```

---

## Streak System Rules

### Qualifying Session Definition

A session counts toward streak if:
1. Status is COMPLETED (not ABANDONED or PARTIAL)
2. Duration ≥ 15 minutes (900 seconds)
3. Quality score ≥ 50 (not a terrible session)
4. Occurs within the user's calendar day (timezone-aware)

```typescript
function isQualifyingSession(session: Session): boolean {
  if (session.status !== 'COMPLETED') return false;
  if (session.effectiveDuration < 900) return false; // 15 min
  if (session.qualityScore < 50) return false;
  return true;
}

function getCalendarDay(timestamp: number, timezone: string): string {
  return new Date(timestamp).toLocaleDateString('en-US', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}

async function checkAndIncrementStreak(
  userId: string,
  session: Session
): Promise<StreakResult> {
  const user = await userService.getUser(userId);
  const streak = await streakService.getStreak(userId);
  
  const sessionDay = getCalendarDay(session.completedAt!, user.timezone);
  const lastSessionDay = streak.lastQualifyingSessionAt 
    ? getCalendarDay(streak.lastQualifyingSessionAt, user.timezone)
    : null;
  
  // Already completed today
  if (lastSessionDay === sessionDay) {
    return { action: 'ALREADY_TODAY', streak };
  }
  
  // Check if this maintains streak
  const yesterday = getCalendarDay(Date.now() - 86400000, user.timezone);
  const maintainsStreak = lastSessionDay === yesterday || !lastSessionDay;
  
  if (maintainsStreak) {
    // Increment streak
    const newStreak = await streakService.incrementStreak(userId, session.completedAt!);
    return { action: 'INCREMENTED', streak: newStreak };
  } else {
    // Streak broken - check for shields
    if (streak.shieldsAvailable > 0) {
      return { action: 'SHIELD_AVAILABLE', streak };
    } else {
      // Reset streak
      const newStreak = await streakService.resetStreak(userId);
      return { action: 'RESET', streak: newStreak };
    }
  }
}
```

### Time Window for Maintaining Streak

```typescript
// Streak maintenance window: 24 hours from last qualifying session
// Extended by grace period if shield used: +24 hours

function getStreakDeadline(streak: Streak): number {
  const baseDeadline = streak.lastQualifyingSessionAt! + 86400000; // 24h
  
  if (streak.gracePeriodUsed) {
    return baseDeadline + 86400000; // +24h grace
  }
  
  return baseDeadline;
}

// Daily check (runs at midnight in user's timezone)
async function checkStreaksAtRisk(): Promise<void> {
  const users = await userService.getActiveUsers();
  
  for (const user of users) {
    const streak = await streakService.getStreak(user.id);
    if (streak.currentDays === 0) continue;
    
    const deadline = getStreakDeadline(streak);
    const hoursRemaining = (deadline - Date.now()) / 3600000;
    
    if (hoursRemaining <= 4 && hoursRemaining > 0) {
      // Streak at risk - send reminder
      await notificationService.sendStreakReminder(user.id, hoursRemaining);
    } else if (hoursRemaining <= 0) {
      // Streak expired
      await streakService.breakStreak(user.id);
      await notificationService.sendStreakBroken(user.id, streak.currentDays);
    }
  }
}
```

### What Breaks a Streak

1. **No qualifying session within 24 hours** of last qualifying session
2. **User manually resets** (opt-in feature for fresh start)
3. **Account inactivity > 30 days** (system auto-resets, soft break)

```typescript
async function breakStreak(userId: string, reason: 'TIMEOUT' | 'MANUAL' | 'INACTIVITY'): Promise<Streak> {
  const streak = await streakService.getStreak(userId);
  const brokenDays = streak.currentDays;
  
  // Update streak record
  const updated = await streakService.updateStreak(userId, {
    currentDays: 0,
    gracePeriodUsed: false,
    lastQualifyingSessionAt: null,
  });
  
  // Record break for analytics
  await analyticsService.recordStreakBreak(userId, brokenDays, reason);
  
  // Apply penalty (reduced XP for 24h)
  await penaltyService.applyStreakBreakPenalty(userId);
  
  // Offer comeback mechanics
  await comebackService.offerComeback(userId, brokenDays);
  
  return updated;
}
```

### Streak Multiplier Table

| Streak Days | Multiplier | XP Bonus | Unlocks |
|-------------|------------|----------|---------|
| 0-2 | 1.0x | 0% | - |
| 3-6 | 1.25x | 25% | Streak badge bronze |
| 7-13 | 1.5x | 50% | Profile background, silver badge |
| 14-29 | 1.75x | 75% | Exclusive title, gold badge |
| 30-59 | 2.0x | 100% | Legendary badge, priority support |
| 60-99 | 2.0x + 50 bonus | 100% + flat | Comeback shield auto-refresh |
| 100+ | 2.0x + 100 bonus | 100% + flat | Hall of fame, diamond badge |

### Shield Mechanics

**Earned by:**
- Reaching 30-day streak (grants 1 shield)
- Defeating tier 3+ bosses (grants 1 shield)
- Special events/promotions

**Consumed when:**
- Streak would break (extends deadline by 24h)
- User explicitly uses shield ("Streak Freeze" feature)

```typescript
async function useStreakShield(userId: string): Promise<boolean> {
  const streak = await streakService.getStreak(userId);
  
  if (streak.shieldsAvailable <= 0) {
    return false; // No shields available
  }
  
  if (streak.gracePeriodUsed) {
    return false; // Already used grace period this streak
  }
  
  await streakService.updateStreak(userId, {
    shieldsAvailable: streak.shieldsAvailable - 1,
    gracePeriodUsed: true,
  });
  
  await notificationService.sendShieldUsed(userId);
  return true;
}
```

### Rewards When Streak Broken

When a streak breaks:
1. XP multiplier resets to 1.0x
2. 24-hour "recovery period" with 50% reduced XP gain
3. User offered comeback bonus (next 3 sessions get 2x XP)
4. Streak history preserved in "Longest Streak" stat

---

## Boss System

### Boss Unlock Progression

```typescript
const BOSS_UNLOCK_REQUIREMENTS = {
  1: { level: 3, previousBoss: null },     // Slacker the Procrastinator
  2: { level: 5, previousBoss: 1 },        // Distraction Demon
  3: { level: 8, previousBoss: 2 },        // The Infinite Scroller
  4: { level: 12, previousBoss: 3 },       // Master of Multitasking
  5: { level: 15, previousBoss: 4 },       // The Perfectionist
  6: { level: 20, previousBoss: 5 },       // Burnout Beast (squad only)
} as const;

async function unlockBoss(userId: string, bossId: number): Promise<boolean> {
  const progression = await progressionService.getProgression(userId);
  const requirement = BOSS_UNLOCK_REQUIREMENTS[bossId as keyof typeof BOSS_UNLOCK_REQUIREMENTS];
  
  if (!requirement) return false;
  if (progression.level < requirement.level) return false;
  
  // Check if previous boss defeated
  if (requirement.previousBoss) {
    const previousDefeated = await bossService.hasDefeated(userId, requirement.previousBoss);
    if (!previousDefeated) return false;
  }
  
  // Unlock notification
  await notificationService.sendBossUnlocked(userId, bossId);
  return true;
}
```

### Damage Calculation Per Session

```typescript
function calculateBossDamage(
  session: Session,
  bossEncounter: BossEncounter
): number {
  // Base damage from duration and quality
  let damage = session.effectiveDuration / 60; // 1 damage per minute
  damage *= (session.qualityScore / 100); // Quality multiplier
  
  // Streak bonus
  const streak = streakService.getStreak(session.userId);
  if (streak.currentDays >= 7) {
    damage *= 1.5; // 50% bonus for week+ streak
  }
  
  // Squad bonus
  if (bossEncounter.squadId) {
    const squad = squadService.getSquad(bossEncounter.squadId);
    damage *= squad.focusMultiplier;
  }
  
  // Item bonuses (if user has equipped items)
  const equippedItems = inventoryService.getEquippedItems(session.userId);
  for (const item of equippedItems) {
    if (item.effect === 'BOSS_DAMAGE') {
      damage *= (1 + item.bonusPercent / 100);
    }
  }
  
  // Critical hit (random 10% chance for 2x damage)
  if (Math.random() < 0.1) {
    damage *= 2;
  }
  
  return Math.floor(damage);
}
```

### Boss Health Pool & Persistence

```typescript
async function createBossEncounter(
  userId: string,
  bossId: string,
  squadId?: string
): Promise<BossEncounter> {
  const template = await bossService.getTemplate(bossId);
  const user = await userService.getUser(userId);
  const progression = await progressionService.getProgression(userId);
  
  // Scale health based on user level
  const levelMultiplier = 1 + (progression.level * 0.1);
  const maxHealth = Math.floor(template.baseHealth * levelMultiplier);
  
  const encounter: BossEncounter = {
    id: crypto.randomUUID(),
    bossId,
    userId: squadId ? null : userId,
    squadId: squadId || null,
    healthRemaining: maxHealth,
    maxHealth,
    damageDealt: 0,
    status: 'ACTIVE',
    startedAt: Date.now(),
    expiresAt: Date.now() + template.timeLimit,
    defeatedAt: null,
    contributingSessionIds: [],
  };
  
  await bossRepository.createEncounter(encounter);
  
  // Schedule timeout check
  scheduleBossTimeoutCheck(encounter.id, encounter.expiresAt);
  
  return encounter;
}

// Boss health persists across sessions until defeated or timeout
async function applyDamage(
  encounterId: string,
  damage: number,
  sessionId: string
): Promise<BossDamageResult> {
  const encounter = await bossRepository.getEncounter(encounterId);
  
  const newHealth = Math.max(0, encounter.healthRemaining - damage);
  const newDamageDealt = encounter.damageDealt + damage;
  
  const isDefeated = newHealth === 0;
  
  await bossRepository.updateEncounter(encounterId, {
    healthRemaining: newHealth,
    damageDealt: newDamageDealt,
    contributingSessionIds: [...encounter.contributingSessionIds, sessionId],
    status: isDefeated ? 'DEFEATED' : encounter.status,
    defeatedAt: isDefeated ? Date.now() : null,
  });
  
  if (isDefeated) {
    await handleBossDefeat(encounter);
  }
  
  return {
    damageDealt: damage,
    healthRemaining: newHealth,
    maxHealth: encounter.maxHealth,
    isDefeated,
    percentComplete: (newDamageDealt / encounter.maxHealth) * 100,
  };
}
```

### Defeat Rewards

```typescript
async function handleBossDefeat(encounter: BossEncounter): Promise<void> {
  const template = await bossService.getTemplate(encounter.bossId);
  const contributors = await getContributors(encounter.contributingSessionIds);
  
  // Create rewards for all contributors
  for (const userId of contributors) {
    const reward = await rewardService.createBossDefeatReward(
      userId,
      encounter.bossId,
      template.rewardType,
      template.rewardAmount
    );
    await rewardService.deliverReward(reward.id);
  }
  
  // Squad bonus (if applicable)
  if (encounter.squadId) {
    await squadService.addBossDefeat(encounter.squadId, encounter.bossId);
    await squadService.increaseMultiplier(encounter.squadId, 0.1); // +10% multiplier
  }
  
  // Unlock next boss
  const nextBossId = BOSS_UNLOCK_REQUIREMENTS[parseInt(encounter.bossId) + 1 as keyof typeof BOSS_UNLOCK_REQUIREMENTS];
  if (nextBossId) {
    for (const userId of contributors) {
      await unlockBoss(userId, parseInt(encounter.bossId) + 1);
    }
  }
  
  // Send notifications
  await notificationService.sendBossDefeated(encounter, contributors);
  
  // Analytics
  await analyticsService.recordBossDefeat(encounter, contributors);
}
```

### Timeout Penalty

```typescript
async function handleBossTimeout(encounterId: string): Promise<void> {
  const encounter = await bossRepository.getEncounter(encounterId);
  if (encounter.status !== 'ACTIVE') return;
  
  // Mark as timeout
  await bossRepository.updateEncounter(encounterId, {
    status: 'TIMEOUT',
  });
  
  // Penalty: lose 10% of squad multiplier (if squad boss)
  if (encounter.squadId) {
    await squadService.decreaseMultiplier(encounter.squadId, 0.1);
  }
  
  // Penalty: 24h cooldown before can challenge again
  await cooldownService.setBossCooldown(
    encounter.userId || encounter.squadId!,
    encounter.bossId,
    24 * 3600000
  );
  
  // Notify
  await notificationService.sendBossTimeout(encounter);
}
```

### Multi-Player Boss Rules (Squad)

```typescript
async function createSquadBossEncounter(
  squadId: string,
  bossId: string
): Promise<BossEncounter> {
  const squad = await squadService.getSquad(squadId);
  
  // Check all members have unlocked this boss
  for (const member of squad.members) {
    const canFight = await canUserFightBoss(member.userId, bossId);
    if (!canFight) {
      throw new Error(`Member ${member.userId} has not unlocked boss ${bossId}`);
    }
  }
  
  // Health scaled by squad size
  const template = await bossService.getTemplate(bossId);
  const squadMultiplier = 1 + (squad.memberCount * 0.2); // +20% per member
  const maxHealth = Math.floor(template.baseHealth * squadMultiplier);
  
  const encounter = await createBossEncounter(null, bossId, squadId);
  
  // All members notified
  for (const member of squad.members) {
    await notificationService.sendSquadBossStarted(member.userId, squadId, bossId);
  }
  
  return encounter;
}

// Damage from all squad members contributes
// Rewards shared among contributors (not just final hitter)
```

---

## Progression System

### XP Thresholds Per Level

```typescript
// Formula: exponential growth with diminishing returns
function calculateLevelThreshold(level: number): number {
  // Level 1: 100 XP
  // Level 2: 125 XP (+25%)
  // Level 3: 156 XP (+25%)
  // Level 10: 745 XP
  // Level 20: 6,727 XP
  // Level 50: 700,000+ XP
  return Math.floor(100 * Math.pow(1.25, level - 1));
}

// Pre-calculated table for first 20 levels
const LEVEL_THRESHOLDS: Record<number, number> = {
  1: 100, 2: 125, 3: 156, 4: 195, 5: 244,
  6: 305, 7: 381, 8: 476, 9: 595, 10: 744,
  11: 930, 12: 1163, 13: 1454, 14: 1818, 15: 2273,
  16: 2841, 17: 3551, 18: 4439, 19: 5549, 20: 6936,
};

// Total XP to reach level N
function totalXpToLevel(level: number): number {
  let total = 0;
  for (let i = 1; i < level; i++) {
    total += calculateLevelThreshold(i);
  }
  return total;
}

// Examples:
// Level 5: 100 + 125 + 156 + 195 + 244 = 820 total XP
// Level 10: ~4,500 total XP
// Level 20: ~38,000 total XP
// Level 50: ~2.5M total XP
```

### Tier Unlocks

```typescript
const PROGRESSION_TIERS = {
  1: {
    level: 1,
    name: 'Novice',
    unlocks: ['Basic focus timer', 'Daily stats', 'Profile customization'],
  },
  2: {
    level: 3,
    name: 'Apprentice',
    unlocks: ['Boss encounters (Tier 1)', 'Streak tracking', 'Basic shop access'],
  },
  3: {
    level: 5,
    name: 'Disciplined',
    unlocks: ['Squad creation', 'Advanced stats', 'Session presets'],
  },
  4: {
    level: 8,
    name: 'Focused',
    unlocks: ['Boss Tier 2-3', 'AI coach basic', 'Achievement system'],
  },
  5: {
    level: 12,
    name: 'Diligent',
    unlocks: ['Squad challenges', 'Battle pass access', 'Premium cosmetics'],
  },
  6: {
    level: 15,
    name: 'Master',
    unlocks: ['Boss Tier 4-5', 'AI coach advanced', 'Custom themes'],
  },
  7: {
    level: 20,
    name: 'Legend',
    unlocks: ['Boss Tier 6', 'Squad boss raids', 'Hall of Fame eligibility'],
  },
  8: {
    level: 30,
    name: 'Grandmaster',
    unlocks: ['Mentor mode', 'Exclusive titles', 'Beta features'],
  },
} as const;

async function checkUnlocks(userId: string, newLevel: number): Promise<Unlock[]> {
  const unlocks: Unlock[] = [];
  
  for (const [tierLevel, tier] of Object.entries(PROGRESSION_TIERS)) {
    if (parseInt(tierLevel) === newLevel) {
      unlocks.push({
        tier: tier.name,
        level: newLevel,
        features: tier.unlocks,
      });
      
      // Notify user
      await notificationService.sendTierUnlocked(userId, tier);
    }
  }
  
  return unlocks;
}
```

### Content Gating

```typescript
function canAccessFeature(
  userLevel: number,
  featureId: string
): { allowed: boolean; requiredLevel?: number } {
  const featureGates: Record<string, number> = {
    'boss-battles': 3,
    'squads': 5,
    'ai-coach': 8,
    'squad-challenges': 12,
    'advanced-stats': 10,
    'custom-themes': 15,
    'mentor-mode': 30,
  };
  
  const requiredLevel = featureGates[featureId];
  if (!requiredLevel) return { allowed: true };
  
  return {
    allowed: userLevel >= requiredLevel,
    requiredLevel,
  };
}

// Shop item gating
async function getShopItemsForUser(userId: string): Promise<ShopItem[]> {
  const progression = await progressionService.getProgression(userId);
  const allItems = await shopService.getAllItems();
  
  return allItems.filter(item => {
    if (!item.minLevel) return true;
    return progression.level >= item.minLevel;
  });
}
```

### Battle Pass Progression

```typescript
// Runs parallel to core progression
interface BattlePass {
  seasonId: string;
  userId: string;
  tier: number;        // 1-100
  tierXp: number;      // XP in current tier
  isPremium: boolean;  // Purchased premium track?
  claimedRewards: string[]; // IDs of claimed rewards
}

// Each tier requires 1000 XP
const TIER_XP_REQUIREMENT = 1000;

async function addBattlePassXp(userId: string, xpAmount: number): Promise<void> {
  const battlePass = await battlePassService.getCurrent(userId);
  
  let newTier = battlePass.tier;
  let newTierXp = battlePass.tierXp + xpAmount;
  
  // Check for tier ups
  while (newTierXp >= TIER_XP_REQUIREMENT && newTier < 100) {
    newTierXp -= TIER_XP_REQUIREMENT;
    newTier++;
    
    // Unlock tier rewards
    await unlockBattlePassTier(userId, battlePass.seasonId, newTier);
  }
  
  await battlePassService.update(userId, {
    tier: newTier,
    tierXp: newTierXp,
  });
}

// XP sources for battle pass (same as core XP)
// But caps at 10,000 XP per day to prevent grinding
const DAILY_BATTLE_PASS_XP_CAP = 10000;
```

### Squad Progression

```typescript
// Squad has separate progression track
interface SquadProgression {
  squadId: string;
  level: number;           // Squad level
  totalFocusTime: number; // Aggregate seconds
  completedSessions: number;
  
  // Squad bonuses
  focusMultiplier: number; // Affects all members
  maxMembers: number;      // Increases with level
}

// Squad XP from member activity
async function addSquadXp(
  squadId: string,
  session: Session
): Promise<void> {
  const squad = await squadService.getSquad(squadId);
  
  // Squad gets "XP" based on member session quality
  const squadXp = Math.floor(session.effectiveDuration / 60) * (session.qualityScore / 100);
  
  const newTotalSessions = squad.completedSessions + 1;
  const newTotalFocusTime = squad.totalFocusTime + session.effectiveDuration;
  
  // Level up every 100 squad sessions
  const newLevel = Math.floor(newTotalSessions / 100) + 1;
  
  // Recalculate multiplier
  const newMultiplier = 1 + (newLevel * 0.05); // +5% per level
  
  await squadService.updateProgression(squadId, {
    level: newLevel,
    totalFocusTime: newTotalFocusTime,
    completedSessions: newTotalSessions,
    focusMultiplier: Math.min(newMultiplier, 2.0), // Cap at 2x
  });
}
```

---

## Reward Trigger System

### 1. Session Completion Reward

**Triggers:** Every completed session (status = COMPLETED)

**What it can award:**
- XP (always)
- Coins (base 10 + duration bonus)
- Small chance of Gems (1% for 1-3 gems)
- Chance of Streak Shield (0.5%)

**Cooldown:** None (every session)

**Duplicate prevention:** N/A (every session unique)

**Failure handling:** Queued for retry; XP never lost

```typescript
async function createSessionReward(
  userId: string,
  session: Session,
  totalXp: number
): Promise<Reward> {
  // Always award XP
  const rewards: RewardItem[] = [
    { type: 'XP', amount: totalXp },
  ];
  
  // Coins: base 10 + 1 per minute
  const coinAmount = 10 + Math.floor(session.effectiveDuration / 60);
  rewards.push({ type: 'COINS', amount: coinAmount });
  
  // Gem drop (1% chance, weighted by quality)
  const gemChance = 0.01 * (session.qualityScore / 100);
  if (Math.random() < gemChance) {
    rewards.push({ type: 'GEMS', amount: Math.floor(Math.random() * 3) + 1 });
  }
  
  // Shield drop (0.5% chance, only if streak < 30)
  const streak = await streakService.getStreak(userId);
  if (streak.currentDays < 30 && Math.random() < 0.005) {
    rewards.push({ type: 'STREAK_SHIELD', amount: 1 });
  }
  
  return rewardService.create({
    userId,
    type: 'COMPOSITE',
    items: rewards,
    triggerType: 'SESSION_COMPLETE',
    triggerId: session.id,
  });
}
```

### 2. Streak Milestone Reward

**Triggers:** Streak reaches specific days (3, 7, 14, 30, 60, 100)

**What it can award:**
- Large coin bonus (100-1000)
- Gems (5-50)
- Exclusive cosmetics (titles, badges, backgrounds)
- Streak shields (1-3)
- XP boost items

**Cooldown:** Once per milestone (can't get day-7 reward twice)

**Duplicate prevention:** Unique constraint on (userId, milestone)

```typescript
const MILESTONE_REWARDS: Record<number, RewardItem[]> = {
  3: [
    { type: 'COINS', amount: 100 },
    { type: 'TITLE', itemId: 'streak-3-title' },
  ],
  7: [
    { type: 'COINS', amount: 250 },
    { type: 'GEMS', amount: 10 },
    { type: 'COSMETIC', itemId: 'streak-7-badge' },
  ],
  14: [
    { type: 'COINS', amount: 500 },
    { type: 'GEMS', amount: 25 },
    { type: 'COSMETIC', itemId: 'streak-14-background' },
    { type: 'STREAK_SHIELD', amount: 1 },
  ],
  30: [
    { type: 'COINS', amount: 1000 },
    { type: 'GEMS', amount: 50 },
    { type: 'TITLE', itemId: 'streak-30-title' },
    { type: 'STREAK_SHIELD', amount: 2 },
    { type: 'ITEM', itemId: 'xp-boost-30' },
  ],
  60: [
    { type: 'COINS', amount: 2000 },
    { type: 'GEMS', amount: 100 },
    { type: 'COSMETIC', itemId: 'streak-60-aura' },
    { type: 'STREAK_SHIELD', amount: 3 },
  ],
  100: [
    { type: 'COINS', amount: 5000 },
    { type: 'GEMS', amount: 250 },
    { type: 'TITLE', itemId: 'streak-100-legendary' },
    { type: 'COSMETIC', itemId: 'streak-100-legendary-frame' },
    { type: 'STREAK_SHIELD', amount: 5 },
  ],
};

async function createStreakMilestoneReward(
  userId: string,
  milestone: number
): Promise<Reward | null> {
  // Check if already claimed this milestone
  const existing = await rewardRepository.findByTrigger(
    userId,
    'STREAK_MILESTONE',
    milestone.toString()
  );
  if (existing) return null;
  
  const items = MILESTONE_REWARDS[milestone];
  if (!items) return null;
  
  return rewardService.create({
    userId,
    type: 'COMPOSITE',
    items,
    triggerType: 'STREAK_MILESTONE',
    triggerId: milestone.toString(),
  });
}
```

### 3. Boss Defeat Reward

**Triggers:** Boss health reaches 0

**What it can award:**
- Large XP (1000-5000)
- Gems (10-100)
- Exclusive boss-themed cosmetics
- Currency multipliers (temporary)
- Next boss unlock

**Cooldown:** Once per boss tier per user

**Duplicate prevention:** Can only defeat each boss once (until reset system)

### 4. Level-Up Reward

**Triggers:** User levels up

**What it can award:**
- XP boost (flat amount)
- Coins (level × 10)
- Gems (every 5 levels)
- Tier unlocks (features, not items)

**Cooldown:** Every level (no duplicate prevention needed)

### 5. Squad Challenge Reward

**Triggers:** Squad completes weekly challenge

**What it can award:**
- Squad XP (increases squad level)
- Shared pool of coins (split among active members)
- Squad-exclusive cosmetics
- Temporary squad-wide multipliers

**Cooldown:** Weekly reset (Monday 00:00 UTC)

### 6. Comeback Reward

**Triggers:** First qualifying session after streak break + 3+ days inactive

**What it can award:**
- Reduced XP floor (50% XP gain for 24h, not penalty)
- Free streak shield
- "Welcome back" coin bonus (100)
- AI coach encouragement (cosmetic)

**Cooldown:** Once per comeback event

```typescript
async function createComebackReward(userId: string): Promise<Reward> {
  return rewardService.create({
    userId,
    type: 'COMPOSITE',
    items: [
      { type: 'COINS', amount: 100 },
      { type: 'STREAK_SHIELD', amount: 1 },
      { type: 'ITEM', itemId: 'comeback-xp-boost' },
    ],
    triggerType: 'COMEBACK',
    expiresAt: Date.now() + 7 * 86400000, // 7 days to claim
  });
}
```

### 7. Daily Login Reward

**Triggers:** First app open each calendar day

**What it can award:**
- Coins (increasing by day, resets after 7 days)
- Small gem chance (day 7 guaranteed small amount)
- Random item (day 3, 7)

**Cooldown:** Calendar day (resets at midnight user timezone)

```typescript
const DAILY_LOGIN_TABLE: Record<number, RewardItem[]> = {
  1: [{ type: 'COINS', amount: 10 }],
  2: [{ type: 'COINS', amount: 15 }],
  3: [{ type: 'COINS', amount: 20 }, { type: 'ITEM', itemId: 'random-consumable' }],
  4: [{ type: 'COINS', amount: 25 }],
  5: [{ type: 'COINS', amount: 30 }],
  6: [{ type: 'COINS', amount: 35 }],
  7: [
    { type: 'COINS', amount: 50 },
    { type: 'GEMS', amount: 5 },
    { type: 'ITEM', itemId: 'weekly-chest' },
  ],
};
```

---

## Failure + Penalty Logic

### Streak Break Penalty

**Applies when:** Streak breaks (no qualifying session within window)

**Penalty:**
1. XP multiplier resets to 1.0x (immediate)
2. 24-hour "recovery period" with 50% XP penalty (next 3 sessions get 0.5x)
3. No other penalties (intentionally gentle to encourage return)

**Communication:**
- Push notification: "🔥 Your X-day streak ended. Start fresh today!"
- In-app modal: Shows broken streak, offers comeback button

**Reversible:** No, but comeback mechanics provide bonuses

```typescript
async function applyStreakBreakPenalty(userId: string): Promise<void> {
  // Set 24h reduced XP flag
  await penaltyService.setPenalty(userId, 'STREAK_BREAK', {
    xpMultiplier: 0.5,
    expiresAt: Date.now() + 24 * 3600000,
    sessionCount: 3, // Or 24h, whichever first
  });
  
  // Log for analytics
  await analyticsService.recordPenalty(userId, 'STREAK_BREAK');
}
```

### Boss Timeout Penalty

**Applies when:** Boss not defeated before expiresAt

**Penalty:**
1. 10% reduction in squad multiplier (if squad boss)
2. 24-hour cooldown before can challenge same boss again
3. No currency loss (intentionally - boss is hard enough)

**Communication:**
- Notification: "Boss escaped! Your squad lost some momentum."

**Reversible:** No, but can re-challenge after cooldown

### Squad Abandonment Penalty

**Applies when:** User leaves squad mid-challenge or goes inactive > 14 days

**Penalty:**
1. Loss of squad multiplier (immediate)
2. If founder leaves without transferring ownership, squad disbands
3. No personal currency penalty

**Communication:**
- Notification to remaining members
- 7-day grace period to reclaim founder status

### What Is NEVER Penalized

These are explicitly non-penalized to reduce user anxiety:

1. **Going offline** - Offline queue handles all writes
2. **App crash** - Session state recovered on restart
3. **Force quit** - Treated same as normal exit (session pauses)
4. **Taking breaks** - Pausing is encouraged, not penalized
5. **Short sessions** - Below qualifying threshold, just no streak credit
6. **Low quality sessions** - Bad score, just no bonuses

```typescript
// Explicitly allowed without penalty
const NON_PENALIZED_EVENTS = [
  'APP_CRASH',
  'FORCE_QUIT',
  'OFFLINE',
  'PAUSE_SESSION',
  'ABANDON_SHORT_SESSION', // < 15 min
  'LOW_QUALITY_SESSION',   // Score < 50
] as const;
```

### Penalty Communication

All penalties are communicated via:
1. In-app toast/notification at time of penalty
2. Explanation of why in modal
3. Path to recovery ("Start new streak", "Re-challenge boss")
4. Never shame language ("You lost" → "Your streak ended")

---

## Comeback Mechanics

### Streak Shield

**How earned:**
- Reach 30-day streak (grants 1)
- Defeat tier 3+ boss (grants 1)
- Special events/promotions (rare)
- Shop purchase (premium)

**How consumed:**
- Automatically if streak would break (extends deadline 24h)
- Manually via "Freeze Streak" button (user choice)

**Rules:**
- Max 3 shields held at once
- Only 1 shield can be used per streak break
- Shields expire after 30 days of holding (encourage use)

### Reduced XP Floor (Return Bonus)

When user returns after 3+ days inactive:
- First 3 sessions get 2x XP (instead of 0.5x penalty)
- Applies even if streak broke during absence
- Lasts 24h or 3 sessions, whichever first

```typescript
function getXpMultiplierForReturningUser(
  daysInactive: number,
  sessionsSinceReturn: number,
  hoursSinceReturn: number
): number {
  if (daysInactive < 3) return 1.0; // Normal user
  
  // Comeback bonus window
  if (sessionsSinceReturn < 3 && hoursSinceReturn < 24) {
    return 2.0; // Double XP
  }
  
  return 1.0; // Back to normal
}
```

### Boss Health Preservation

Bosses do NOT reset if user goes inactive:
- Boss encounter persists until timeout or defeat
- User can resume fighting anytime before expiresAt
- Health, damage dealt, all preserved
- Encourages return to finish what they started

### Re-engagement Reward Trigger

After 7 days inactive:
- Push notification: "Your squad misses you! Come back for a 2x XP boost."
- First session awards comeback reward (coins + shield + boost item)
- AI coach sends personalized message referencing their last session

```typescript
async function checkReEngagement(userId: string): Promise<void> {
  const user = await userService.getUser(userId);
  const daysInactive = (Date.now() - user.lastActiveAt) / 86400000;
  
  if (daysInactive >= 7) {
    // Send re-engagement notification
    await notificationService.scheduleComebackNotification(userId, daysInactive);
    
    // Prepare comeback reward
    await rewardService.stageComebackReward(userId);
  }
}
```

### AI Coach in Comeback Flows

When user returns:
1. AI coach acknowledges absence: "Welcome back! Ready to refocus?"
2. Suggests shorter session: "Start with 15 minutes to ease back in"
3. References previous achievements: "You had a 12-day streak before. Let's beat that!"
4. No guilt, only encouragement

---

## Economy Rules

### Currency Types

| Currency | Source | Uses | Premium? |
|----------|--------|------|----------|
| **Coins** | Sessions, streaks, bosses, rewards | Shop items, minor upgrades | No |
| **Gems** | Rare drops, bosses, purchases | Premium items, instant unlocks | Yes (can buy) |
| **XP** | Sessions (primary), rewards | Progression only (not spendable) | No |

### Wallet Transaction Rules

**Atomic Writes:**
All wallet changes use Supabase RPC to ensure atomicity:

```sql
-- Database function for atomic coin spend
CREATE OR REPLACE FUNCTION spend_coins(
  p_user_id UUID,
  p_amount INTEGER,
  p_source_type TEXT,
  p_source_id UUID
) RETURNS BOOLEAN AS $$
DECLARE
  v_current_balance INTEGER;
BEGIN
  -- Lock row
  SELECT coins INTO v_current_balance
  FROM wallets
  WHERE user_id = p_user_id
  FOR UPDATE;
  
  -- Check balance
  IF v_current_balance < p_amount THEN
    RETURN FALSE;
  END IF;
  
  -- Update balance
  UPDATE wallets
  SET 
    coins = coins - p_amount,
    total_coins_spent = total_coins_spent + p_amount,
    updated_at = NOW()
  WHERE user_id = p_user_id;
  
  -- Record transaction
  INSERT INTO wallet_transactions (
    wallet_id, user_id, type, currency, amount,
    balance_before, balance_after, source_type, source_id
  )
  SELECT 
    id, p_user_id, 'SPEND', 'COINS', p_amount,
    v_current_balance, v_current_balance - p_amount,
    p_source_type, p_source_id
  FROM wallets
  WHERE user_id = p_user_id;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;
```

**No Negative Balance:**
- Database constraint: `coins >= 0`, `gems >= 0`
- App validation: Check balance before any spend attempt
- Graceful failure: Show "insufficient funds" UI, don't crash

### Shop Rules

**Purchaseable:**
- Cosmetics (themes, badges, titles)
- Consumables (XP boosts, streak shields)
- Some progression accelerators (XP bundles)

**Must Be Earned (Not Purchasable):**
- Level progression (must earn XP)
- Boss defeat rewards (must defeat boss)
- Streak milestone cosmetics (must maintain streak)
- Legendary titles (must achieve feats)

```typescript
const SHOP_CATEGORIES = {
  COSMETICS: { 
    purchasable: true,
    currencies: ['COINS', 'GEMS'],
  },
  CONSUMABLES: {
    purchasable: true,
    currencies: ['COINS', 'GEMS'],
    limits: { 'xp-boost': 5 }, // Max 5 held
  },
  PROGRESSION: {
    purchasable: false, // Must earn
    note: 'XP bundles available for gems, but limited per week',
    weeklyLimit: 3,
  },
  EXCLUSIVE: {
    purchasable: false, // Earned only
    examples: ['Boss Slayer Title', '100-Day Streak Badge'],
  },
};
```

**Inventory Integration:**
- Purchased items go to inventory
- Consumables can be used from inventory
- Cosmetics auto-applied or selectable from profile
- Inventory has max slots (expandable with premium)

### Anti-Abuse Rules

**Rate Limits:**
```typescript
const RATE_LIMITS = {
  // Max purchases per hour
  SHOP_PURCHASES: { count: 10, window: 3600000 },
  
  // Max sessions per day (prevent botting)
  SESSIONS_PER_DAY: { count: 20, window: 86400000 },
  
  // Max XP per day (prevent grinding)
  XP_PER_DAY: { count: 50000, window: 86400000 },
  
  // Max gem purchases per week
  GEM_PURCHASES: { count: 1000, window: 604800000 },
};
```

**Duplicate Claim Prevention:**
- Unique constraints on (userId, rewardType, triggerId)
- Idempotency keys for all reward creation
- Daily login tracked by calendar day, not timestamp

**Suspicious Activity Detection:**
```typescript
async function detectSuspiciousActivity(userId: string): Promise<boolean> {
  const recentSessions = await sessionService.getRecentSessions(userId, 24);
  
  // Flag: > 20 sessions in 24h
  if (recentSessions.length > 20) return true;
  
  // Flag: Sessions < 1 minute (bot behavior)
  const shortSessions = recentSessions.filter(s => s.duration < 60);
  if (shortSessions.length > 10) return true;
  
  // Flag: Impossible XP gain
  const xpGain = await progressionService.getRecentXpGain(userId, 24);
  if (xpGain > 100000) return true; // > 100k XP in 24h impossible legitimately
  
  return false;
}

// On detection: Flag account for review, freeze reward accrual
```

**Account Recovery:**
- All transactions logged (wallet_transactions table)
- Admin tools to refund mistaken purchases
- No rollback of earned rewards (prevent exploit)
- Premium purchases tied to app store receipts for dispute resolution

---

## Phase 4 — Items, Inventory & Crafting System (COMPLETED)

### Item System Overview

**Item Types:**
```typescript
type ItemType = 
  | 'CONSUMABLE'  // One-time use (potions, boosts)
  | 'EQUIPMENT'   // Equippable with stats (weapons, armor)
  | 'COSMETIC'    // Visual customization (skins, badges)
  | 'CRAFTING'    // Ingredients for recipes
  | 'COLLECTIBLE'; // Achievement items (trophies)
```

**Rarity Tiers:**
| Tier | Color | Drop Rate | Power Level |
|------|-------|-----------|-------------|
| COMMON | Gray | 60% | Base |
| UNCOMMON | Green | 25% | +10% |
| RARE | Blue | 10% | +25% |
| EPIC | Purple | 4% | +50% |
| LEGENDARY | Orange | 1% | +100% |

### Item Effects System

**Consumable Effects:**
```typescript
interface ItemEffect {
  type: 'XP_BOOST' | 'STREAK_SHIELD' | 'BOSS_DAMAGE' | 'COOLDOWN_REDUCTION';
  value: number;           // Percent or flat value
  duration: number;        // Seconds
}
```

**Example Items:**
| Name | Type | Rarity | Effect |
|------|------|--------|--------|
| Focus Potion | CONSUMABLE | UNCOMMON | XP_BOOST +25% for 30min |
| Streak Shield | CONSUMABLE | RARE | Prevents streak break, 24h duration |
| Boss Slayer Sword | EQUIPMENT | EPIC | BOSS_DAMAGE +50% when equipped |
| Legendary Focus Crown | EQUIPMENT | LEGENDARY | XP_BOOST +100%, COOLDOWN_REDUCTION -25% |

### Inventory System

**Inventory Rules:**
- Max 100 slots base (expandable to 500 with premium)
- Stackable items: max 99 per slot (CONSUMABLES, CRAFTING)
- Non-stackable: 1 per slot (EQUIPMENT, COSMETICS)
- Equipment can be equipped/unequipped
- Consumables can be used directly from inventory

**Inventory Operations:**
```typescript
// Add item (from purchase/craft/reward)
await inventoryService.addItem(userId, itemDefinitionId, quantity);

// Use consumable
await inventoryService.useItem(userId, inventoryItemId);

// Equip equipment
await inventoryService.equipItem(userId, inventoryItemId, slot);

// Destroy item (refund partial coins)
await inventoryService.destroyItem(userId, inventoryItemId);
```

### Crafting System

**Crafting Flow:**
```
1. Select Recipe
   ├─ Check: Recipe unlocked?
   ├─ Check: Station available?
   └─ Check: Ingredients owned?

2. Start Crafting
   ├─ Consume ingredients atomically
   ├─ Lock station for duration
   └─ Create CraftingJob (status: CRAFTING)

3. Wait/Accelerate
   ├─ Real-time countdown
   ├─ Can accelerate with gems (instant complete)
   └─ Can cancel (partial ingredient refund)

4. Complete
   ├─ Roll success rate
   ├─ If success: Create output item
   ├─ If failure: Create scraps (if recipe allows)
   └─ Job status: COMPLETED or FAILED

5. Claim
   ├─ User claims result
   ├─ Items added to inventory
   └─ Job status: CLAIMED
```

**Crafting Stations:**
| Station | Type | Recipes | Unlock Level |
|---------|------|---------|--------------|
| Workbench | WORKBENCH | Basic items | 1 (default) |
| Alchemy Lab | ALCHEMY_LAB | Potions, elixirs | 5 |
| Forge | FORGE | Weapons, armor | 10 |
| Enchantment Table | ENCHANTMENT_TABLE | Magical gear | 15 |
| Kitchen | KITCHEN | Food buffs | 3 |

**Station Upgrade Path:**
```typescript
// Each station levels 1-10
// Upgrades cost gems, provide:
// - Faster crafting (efficiency bonus)
// - Higher success rate
// - Access to higher-tier recipes

const upgradeBenefits = {
  efficiency: 1.0 + (level * 0.1),      // 1.0 → 2.0 (2x faster)
  successBonus: level * 0.025,          // 0% → 25% bonus
};
```

### Recipe System

**Recipe Structure:**
```typescript
interface CraftingRecipe {
  id: string;
  name: string;
  ingredients: {
    itemDefinitionId: string;
    quantity: number;
    consumeOnFailure: boolean;  // Keep if craft fails?
  }[];
  output: {
    itemDefinitionId: string;
    quantity: number;
  };
  requiredStation: StationType;
  requiredStationLevel: number;
  userLevelRequired: number;
  baseSuccessRate: number;      // 0.0 - 1.0
  craftingTime: number;         // Seconds
}
```

**Success Rate Formula:**
```
Final Success % = Base Rate 
  + Station Success Bonus
  + User Level Bonus (0.5% per level above required)
  + Streak Bonus (0.1% per day of streak)

Max: 95% (never 100%, keeps risk element)
```

**Failure Outcomes:**
| Outcome | Description | Recipe Config |
|---------|-------------|---------------|
| NOTHING | All ingredients lost | consumeOnFailure: true |
| PARTIAL | 50% ingredients returned | consumeOnFailure: false |
| SCRAP | Get scrap item worth 25% value | scrapOutput defined |

### Shop Integration

**Item Purchase Flow:**
```
User browses Shop
  ↓
Selects ShopItem
  ↓
Check: Price affordable?
Check: Purchase limits not exceeded?
Check: Level/achievement requirements met?
  ↓
Purchase
  ├─ Deduct currency (atomic)
  ├─ Create InventoryItem
  ├─ Create WalletTransaction
  └─ Fire analytics event
```

**Shop Categories:**
- **Featured:** Curated selection, rotates daily
- **Consumables:** Potions, boosts, shields
- **Equipment:** Weapons, armor, accessories
- **Cosmetics:** Skins, badges, titles
- **Crafting:** Rare ingredients, recipe scrolls
- **Limited:** Time-limited offers, seasonal

### RevenueCat Integration

**Premium Currency Flow:**
```
User taps "Buy Gems"
  ↓
Show RevenueCat paywall
  ↓
Purchase complete (Apple/Google)
  ↓
RevenueCat webhook → Backend
  ↓
Backend credits gems to wallet
  ↓
Client receives confirmation
```

**IAP Products:**
| Product | Gems | Price | Bonus |
|---------|------|-------|-------|
| Gem Pouch | 100 | $0.99 | - |
| Gem Bag | 550 | $4.99 | +10% |
| Gem Chest | 1,200 | $9.99 | +20% |
| Gem Hoard | 3,500 | $24.99 | +40% |
| Gem Mountain | 8,000 | $49.99 | +60% |

**Security:**
- All purchases validated server-side via RevenueCat
- Receipts stored for dispute resolution
- Idempotency prevents double-crediting
- Grace period for pending transactions

---

## Phase 3 — Progression System Details (COMPLETED)

### XP Multiplier System

**Base Rate:** 2 XP per minute of focused time

**Multiplier Stack:**
```
Total XP = Base XP
  × Streak Multiplier (1.0x - 2.0x)
  × Squad Multiplier (1.0x - 1.5x)
  × Boss Multiplier (1.1x if boss active)
  × Comeback Multiplier (1.5x - 2.0x)
  + Perfect Session Bonus (+50 XP)
```

**Streak Multiplier Tiers:**
| Days | Multiplier | Visual Indicator |
|------|------------|------------------|
| 0-2 | 1.0x | 🔥 |
| 3-6 | 1.25x | 🔥🔥 |
| 7-13 | 1.5x | 🔥🔥🔥 |
| 14-29 | 1.75x | 🔥🔥🔥🔥 |
| 30+ | 2.0x | 🔥🔥🔥🔥🔥 |

### Boss Battle Mechanics

**Health Scaling Formula:**
```
Scaled Health = Base Health × (1 + (UserLevel - 1) × 0.1) × (1 + (SquadSize - 1) × 0.2)
```

**Damage Calculation:**
```
Base Damage = (Session Duration Minutes) × Quality Multiplier
Quality Multiplier = 0.5 + (Quality Score / 200)

With Bonuses:
- Streak Bonus: +10% per 7 days (max 50%)
- Squad Bonus: +5% per squad member (max 25%)
- Item Bonus: Based on equipped weapon

Total Damage = Base Damage × (1 + StreakBonus + SquadBonus + ItemBonus)
```

**Boss Lifecycle:**
1. **AVAILABLE**: Can be fought if level requirement met and not on cooldown
2. **ACTIVE**: Encounter created, 24-hour timer started
3. **DAMAGE**: Each session contributes damage based on quality
4. **DEFEATED**: Health reaches 0, rewards distributed to all contributors
5. **TIMEOUT**: 24h expires without defeat, consolation rewards given

**Cooldown System:**
- 7-day cooldown after defeat
- Progress bar shows remaining time
- VIP pass can reduce cooldown by 50%

### Streak System

**Qualifying Session Requirements:**
- Minimum 15 minutes duration
- Minimum 50 quality score
- Must complete within user's timezone day

**Streak States:**
- **ACTIVE**: Streak maintained, today's session done
- **AT_RISK**: >24h since last session, <48h remaining
- **GRACE_PERIOD**: Shield consumed, 24h extension granted
- **BROKEN**: >48h passed, streak reset to 0

**Risk Level Calculation:**
```
Hours Since Last = (Now - LastSessionAt) / (1000 × 60 × 60)

NONE: <18 hours
LOW: 18-24 hours
MEDIUM: 24-30 hours
HIGH: 30-40 hours
CRITICAL: 40-48 hours (shield auto-trigger if available)
```

**Milestone Rewards:**
| Days | Reward Type | Amount |
|------|-------------|--------|
| 3 | COINS | 100 |
| 7 | COINS | 250 |
| 14 | GEMS | 25 |
| 30 | STREAK_SHIELD | 1 |
| 60 | GEMS | 100 |
| 100 | GEMS | 250 |
| 180 | GEMS | 500 |
| 365 | GEMS + LEGENDARY_BADGE | 1000 + Badge |

### Rewards System

**Reward Types:**
- **XP**: Immediate application to progression
- **COINS**: Soft currency for shop purchases
- **GEMS**: Hard currency for premium items
- **ITEMS**: Consumables (boosts, shields) or cosmetics
- **TITLES**: Profile display badges
- **STREAK_SHIELD**: Protects streak from breaking

**Claim Lifecycle:**
```
PENDING (created)
  ↓
CLAIMED → Delivered to wallet/inventory/progression
  ↓
EXPIRED → Auto-archived after expiry date
  ↓
FAILED → Logged for manual retry (delivery error)
```

**Duplicate Prevention:**
- Unique constraint: (userId, rewardType, triggerId)
- Idempotency key on all reward creation
- Daily login tracked by calendar day

### Gamified Visual Feedback

**Level Up Celebration:**
- Full-screen overlay with confetti animation
- Tier title display (Novice → Apprentice → Adept → Expert → Master → Grand Master)
- Reward badges with staggered reveal animation
- New unlock announcements

**Post-Session Reward Flow:**
1. Session complete → Calculations run
2. XP bar animates filling
3. Streak flame updates (if applicable)
4. Chest opening animation (if rewards earned)
5. Level up overlay (if threshold reached)

**Boss Battle Feedback:**
- Damage numbers float up on each hit
- Combo counter for consecutive high-quality sessions
- Health bar shakes on critical hits
- Victory screen with contributor list

**Streak Visualization:**
- Flame chain shows each day as animated node
- Milestone stars appear on day 3, 7, 14, 30, etc.
- Risk indicator pulses when streak is endangered
- Next milestone countdown with reward preview

---

## Phase 4 — LiveOps Retention Engine

### Season System

**Season Lifecycle:**
```
PRESEASON (preview available, no progress)
  ↓ startAt reached
ACTIVE (full progression, XP counts)
  ↓ 7 days before endAt
ALMOST_ENDING (urgency notifications)
  ↓ endAt reached
ENDED (grace period, claim rewards)
  ↓ 7 days after end
ARCHIVED (historical data only)
```

**Tier Progression Formula:**
```
XP to Next Tier = xpPerTier (default: 1000)
Total Season XP = sum of all XP earned during season
Current Tier = floor(totalSeasonXp / xpPerTier)
Tier XP = totalSeasonXp % xpPerTier (remainder)
```

**Season XP Sources:**
| Source | XP Amount | Notes |
|--------|-----------|-------|
| Session Complete | Base XP × 1.0 | Standard XP from session |
| Challenge Complete | Challenge reward XP | Varies by difficulty |
| Boss Damage | Damage dealt × 0.5 | Bonus for boss contribution |
| Premium Purchase | 500 XP flat | One-time bonus |
| Milestone Reach | Tier × 10 | Bonus at each tier |

**Premium Track Benefits:**
- Access to premium rewards on all tiers (retroactive)
- +10% XP bonus on all activities
- Exclusive cosmetic items
- Early access to next season preview

**Retroactive Claiming:**
When user purchases premium mid-season:
1. Calculate all tiers reached so far
2. For each tier, grant premium reward if not already claimed
3. Deliver rewards to wallet/inventory
4. Fire analytics events

### Battle Pass System

**Tier Structure:**
- 50 tiers per season (default)
- Each tier requires 1000 XP
- Free track: reward every 5 tiers
- Premium track: reward every tier
- Major milestones at 10, 25, 50 (special rewards)

**Reward Distribution:**
```
Free Track Rewards:
- Tier 5: 100 COINS
- Tier 10: Premium Avatar Frame (MAJOR)
- Tier 15: 150 COINS
- Tier 20: Streak Shield × 2
- Tier 25: 250 COINS + Title "Season Warrior" (MAJOR)
- Tier 30: 200 COINS
- Tier 35: 50 GEMS
- Tier 40: 250 COINS
- Tier 45: Booster Pack × 3
- Tier 50: Legendary Badge (MAJOR)

Premium Track Rewards (Additional):
- Every tier: 25% more COINS than free
- Every tier: Cosmetic items
- Tier 50: Exclusive Legendary Skin
```

**Tier Claiming:**
```typescript
// User taps claim on tier
const result = await battlePassService.claimTier({
  userId,
  seasonId,
  tierNumber: 5,
  track: 'FREE' // or 'PREMIUM'
});

// Rewards delivered immediately
// Animation plays
// Analytics tracked
```

**Batch Claiming:**
- User can claim all available tiers at once
- Transaction-safe (all succeed or none)
- Rewards delivered in batch
- Single animation sequence

### Challenges System

**Challenge Types:**
| Type | Frequency | Duration | Reward Scale |
|------|-----------|----------|--------------|
| DAILY | Every day | 24 hours | Small (50-100 COINS) |
| WEEKLY | Every week | 7 days | Medium (200-500 COINS) |
| EVENT | Special events | Varies | Large (500+ COINS, GEMS) |
| STREAK_BONUS | Streak milestones | One-time | Special (GEMS, items) |

**Challenge Categories:**
- **FOCUS_TIME**: Total focus minutes
- **SESSION_COUNT**: Number of sessions completed
- **STREAK**: Maintain streak for X days
- **BOSS_DAMAGE**: Deal X damage to bosses
- **SOCIAL**: Complete squad activities

**Challenge Generation Algorithm:**
```typescript
function generateChallenge(userId, seasonId, type) {
  const userLevel = getUserLevel(userId);
  const isPremium = getPremiumStatus(userId, seasonId);
  
  // Target value scales with user level
  const baseTarget = type === 'DAILY' ? 30 : 150; // minutes
  const targetValue = baseTarget + (userLevel * 2);
  
  // Reward scales with difficulty
  const baseReward = type === 'DAILY' ? 50 : 200;
  const rewardAmount = baseReward * (isPremium ? 1.25 : 1.0);
  
  return {
    targetValue,
    rewardAmount,
    expiresAt: type === 'DAILY' ? endOfDay() : endOfWeek()
  };
}
```

**Reroll System:**
- Free reroll: 1 per day (resets at midnight UTC)
- Paid reroll: 10 GEMS each
- Reroll generates new challenge of same type
- Old challenge marked as REROLLED
- Reroll count tracked for analytics

**Challenge Progression:**
```
ASSIGNED (user receives challenge)
  ↓ user completes requirement
COMPLETED (ready to claim)
  ↓ user taps claim
CLAIMED (rewards delivered)
  ↓ expiresAt reached without completion
EXPIRED (cannot claim, challenge ends)
  ↓ user rerolls
REROLLED (replaced with new challenge)
```

### LiveOps Config System

**Feature Flag Rollout:**
```typescript
function isFeatureEnabled(featureKey, userId) {
  const config = getLiveOpsConfig();
  const feature = config.features[featureKey];
  
  if (!feature.enabled) return false;
  
  // Percentage rollout
  const userHash = hash(userId + featureKey);
  const userPercent = userHash % 100;
  
  return userPercent < feature.rolloutPercentage;
}
```

**A/B Test Assignment:**
```typescript
function getABTestVariant(testId, userId) {
  const test = config.abTests[testId];
  if (!test.enabled) return 'control';
  
  // Hash user to variant
  const hash = hash(userId + testId);
  const bucket = hash % 100;
  
  // Find variant by weight
  let cumulativeWeight = 0;
  for (const variant of test.variants) {
    cumulativeWeight += variant.weight;
    if (bucket < cumulativeWeight) return variant.id;
  }
  
  return 'control'; // Fallback
}
```

**Config Sync Strategy:**
- Fetch config on app start
- Cache locally with 5-minute TTL
- Background refresh every 30 minutes
- Manual refresh on user action (pull-to-refresh)
- Config version checked server-side

**Maintenance Mode:**
```typescript
if (config.maintenance.enabled) {
  // Show maintenance screen
  // Disable non-essential features
  // Allow essential: login, offline sessions
  // Show estimated end time
}
```

### Cross-System Integration Flows

**Season + Battle Pass + Challenges Integration:**
```
User joins season
  ↓
UserSeasonProgress created (tier 0)
  ↓
BattlePass tiers populated
  ↓
Daily challenges assigned (season-specific)
  ↓
User completes session
  ↓
XP added to season (100 XP)
  ↓
Tier 0 → Tier 1 (reached 1000 XP)
  ↓
Auto-claim tier 1 free reward
  ↓
If premium: also claim tier 1 premium
  ↓
Challenge progress updated
  ↓
Analytics events fired
```

**Challenge + Progression + Rewards Integration:**
```
UserChallenge completed
  ↓
Status: COMPLETED
  ↓
User claims reward
  ↓
Challenge reward delivered:
  - COINS → Wallet
  - XP → Progression
  - ITEM → Inventory
  - GEMS → Wallet
  ↓
Challenge status: CLAIMED
  ↓
Progression XP may trigger level up
  ↓
Level up triggers reward
  ↓
Streak milestone may trigger bonus challenge
```

**Economy + Seasons Integration:**
```
User purchases premium (499 GEMS)
  ↓
GEMS deducted from Wallet
  ↓
UserSeasonProgress.isPremium = true
  ↓
Retroactive tier claiming (all tiers so far)
  ↓
Bonus 500 XP added to season
  ↓
Premium achievement unlocked
  ↓
Analytics: premium conversion tracked
```

### Visual Feedback

**Season Card:**
- Progress bar showing tier advancement
- Countdown to season end
- Premium badge (if purchased)
- Current tier with reward preview
- Tap to see full tier track

**Battle Pass Track:**
- Horizontal scroll of all tiers
- Claimed tiers: checkmark + glow
- Available tiers: pulse animation
- Locked tiers: dimmed
- Major milestones: special styling

**Challenge List:**
- Progress bars for each challenge
- Time remaining countdown
- Reroll button (with gem cost if used)
- Claim button for completed challenges
- Difficulty indicator (color coded)

**LiveOps Config UI:**
- Feature flag toggle list
- Rollout percentage slider
- A/B test variant distribution
- Maintenance mode status
- Config version and last sync time
