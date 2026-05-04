# Cross-System Integration Guide

## Integration Hub

All cross-system integrations are centralized in `src/integration/` and `src/features/*/integration-enhanced.ts`.

### Available Integrations

| Integration | File | Description |
|-------------|------|-------------|
| Season ↔ Rewards | `integration/season-rewards.ts` | Auto-delivers tier rewards, premium retroactive claims, season end distribution |
| Challenge ↔ Progression | `integration/challenge-progression.ts` | Challenge completion → XP, streak milestones → bonus challenges |
| Economy ↔ Seasons | `integration/economy-seasons.ts` | Purchase XP bonuses, premium tracking, currency challenges |
| Social ↔ Competition | `integration/social-competition.ts` | Sessions → leaderboards, squad activities → challenges |
| **AI Coach Enhanced** | `features/ai-coach/integration-enhanced.ts` | Deep cross-system wiring with circuit breakers, retry logic, event-driven architecture |
| **Comprehensive Feature Integration** | `integration/ComprehensiveFeatureIntegration.ts` | Central coordination for session completion → rewards/progression/social/challenges |
| **Economy ↔ Progression** | `integration/EconomyProgressionBridge.ts` | Economy transactions → progression milestones, achievements |
| **Social Activity Router** | `integration/SocialActivityRouter.ts` | Routes all activities to feed/squad/notifications |

### AI Coach Cross-System Integration (NEW)

The AI Coach now has deep integration with all major systems:

```typescript
// From src/features/ai-coach/integration-enhanced.ts

// 1. Sessions → Coach
handleSessionCompletedEnhanced({ userId, duration, qualityScore })
// Triggers: behavior signal processing, streak risk mitigation, milestone messages, comeback tracking

// 2. Streaks → Coach
handleStreakRiskDetectedEnhanced({ userId, currentStreak, hoursRemaining, riskLevel })
// Triggers: state transition to STREAK_AT_RISK, intervention evaluation, priority message generation

handleStreakBrokenEnhanced({ userId, previousStreak, daysInactive })
// Triggers: COMEBACK_MODE activation, POST_FAILURE_SUPPORT messages

// 3. Progression → Coach
handleLevelUpEnhanced({ userId, newLevel, xpGained })
// Triggers: MILESTONE_HYPE messages, difficulty adjustments every 5 levels

// 4. Challenges → Coach
handleChallengeExpiringEnhanced({ userId, challengeId, hoursRemaining, progress })
// Triggers: CHALLENGE_PROMPT messages, intervention evaluation

// 5. Boss → Coach
handleBossTimeoutWarningEnhanced({ userId, bossId, hoursRemaining, healthRemaining })
// Triggers: near-victory prompts, timeout warnings
```

**AI Coach Integration Features:**
- Circuit breakers for all external calls (5 separate breakers)
- Exponential backoff with jitter for retries
- Rate limiting per-endpoint and per-user
- Event-driven architecture with proper error isolation
- Degraded mode when external systems fail
- Comprehensive analytics tracking

### Initialization

```typescript
// In src/app/App.tsx or bootstrap
import { initializeAllIntegrations } from '../integration';

// Initialize on app start
const cleanupIntegrations = initializeAllIntegrations();

// Cleanup on logout/app reset
cleanupIntegrations();
```

### Health Checks

```typescript
import { checkIntegrationHealth } from '../integration';

const health = await checkIntegrationHealth();
console.log(health.status); // 'healthy' | 'degraded' | 'unhealthy'
```

## Event System

All cross-system communication uses the eventBus:

### Published Events

| Event | Payload | Description |
|-------|---------|-------------|
| `season:tier_unlocked` | `{ userId, seasonId, tier }` | User reached new tier |
| `season:premium:purchased` | `{ userId, seasonId, gemsDeducted }` | Premium track purchased |
| `challenge:completed` | `{ userId, challengeId, rewards }` | Challenge finished |
| `session:completed` | `{ userId, sessionId, summary }` | Focus session done |
| `economy:transaction` | `{ userId, type, amount, currency }` | Currency change |

### Integration Pattern

```typescript
// Subscribe to events
const unsubscribe = eventBus.subscribe('event:name', async (payload) => {
  // Handle cross-system action
  await relatedService.doSomething(payload);
});

// Cleanup on unmount/logout
unsubscribe();
```

## Feature Integration Status

### ✅ Fully Integrated

- **Seasons** → Battle Pass (tiers), Challenges (season-specific), Progression (XP), Rewards (delivery)
- **Challenges** → Progression (completion XP), Rewards (reward delivery), Streaks (milestone bonuses)
- **Battle Pass** → Rewards (tier claims), Economy (premium purchase), Seasons (progress sync)
- **Economy** → Seasons (purchase bonuses), Battle Pass (premium), Challenges (reroll costs)

### Event Chains

```
User completes session
    ↓
Session score updates leaderboard
    ↓
Squad progress advances
    ↓
Challenge checks progress
    ↓
XP added to progression
    ↓
Streak potentially increments
    ↓
Analytics tracks engagement
    ↓
AI coach evaluates pattern
```

```
Season tier unlocks
    ↓
Auto-claims free rewards
    ↓
If premium, claims premium rewards
    ↓
Economy tracks value
    ↓
Battle pass advances
    ↓
Events emit for analytics
    ↓
Progression receives bonus XP
```

## Testing Integrations

### Unit Tests

```typescript
// Mock cross-system dependencies
jest.mock('../features/other-service/service');

// Test event emission
eventBus.publish('event:name', payload);
expect(mockedService.method).toHaveBeenCalled();
```

### Integration Tests

See `src/features/seasons/__tests__/integration.test.ts` for examples:
- Cross-system workflows
- Failure rollback scenarios
- Race condition handling
- Event chain verification

## Adding New Integrations

1. Create file in `src/integration/{name}.ts`
2. Export `initialize{Name}Integration(): () => void`
3. Add to `src/integration/index.ts`
4. Call from `initializeAllIntegrations()`
5. Add tests in `src/integration/__tests__/{name}.test.ts`

### Template

```typescript
/**
 * Feature A ↔ Feature B Integration
 */

import { eventBus } from '../events';

export function initializeFeatureAFeatureBIntegration(): () => void {
  const unsub = eventBus.subscribe('featureA:event', async (payload) => {
    // Cross-system action
    await featureBService.handle(payload);
  });

  return () => unsub();
}
```
