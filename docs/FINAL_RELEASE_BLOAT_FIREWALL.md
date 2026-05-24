# Final Release Bloat Firewall

AI agents must read this file before touching any feature gate, route, Home
card, notification filter, session completion, Coach recommendation, or
FeatureAvailability rule.

## Rule

No feature may sit in a vague middle state where it is hidden in UI but still
routes, queries, subscribes, notifies, mutates, appears in completion, or
confuses AI agents.

## Bloat Firewall Checklist

For every ARCHIVED_OR_DEACTIVATED feature, verify all 14 gates:

1. Must not register routes.
2. Must not render Home cards.
3. Must not show notification filters.
4. Must not appear in session completion cards.
5. Must not appear in premium copy.
6. Must not appear in App Store metadata.
7. Must not run active queries (no useQuery, no supabase calls).
8. Must not subscribe to EventBus or Supabase realtime channels.
9. Must not mutate session rewards.
10. Must not affect loading state.
11. Must not appear in onboarding.
12. Must not appear in active session UI.
13. Must not appear in completion sequence.
14. Must not appear in Coach recommendations.

## Progressive Unlock Firewall

For every PROGRESSIVELY_UNLOCKED_ACTIVE feature, verify:

1. FeatureAvailability gates exist and are active.
2. No queries run before unlock.
3. No subscriptions run before unlock.
4. No notifications schedule before unlock.
5. No route entry points exist before unlock.
6. No Home loading delay from locked feature.
7. Feature is production-ready before reveal.
8. Tests prove all of the above.

## Firewall Audit Commands

Run these to audit bloat compliance:

```bash
# Check archived features have no active routes
rg -l "(shop|inventory|battle.pass|wager|squad|guild|leaderboard|wallet.*screen)" src/navigation/types.ts

# Check archived features have no event subscriptions
rg -l "subscribe.*(shop|inventory|battle|wager|squad|guild|leaderboard)" src/ --glob '!*.test.*'

# Check archived features have no Home cards
rg -l "(shop|inventory|battle.pass|wager|squad)" src/screens/home/

# Check archived features have no notification filters
rg -l "(shop|inventory|battle.pass|wager|squad)" src/features/notifications/
```

## Known Risks

Features listed as ARCHIVED_OR_DEACTIVATED may still have code in src/.
The files exist for reference but runtime access must be gated. Physical
deletion deferred to a separate cleanup pass after confirming no remaining
imports or runtime paths depend on them.

## Gate Implementation

Use FeatureAvailability from `src/features/liveops-config/feature-access.ts`
as the single source of truth. All archived features must return `false`
from `isFeatureAvailable()` and must not have `featureKey` entries in the
active feature map.

For navigation gates, use the notification routing core in
`src/navigation/notification-routing-core.ts` to block archived routes.
