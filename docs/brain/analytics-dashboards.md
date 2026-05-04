# PostHog Analytics Dashboards

Phase 8C.3 — Retention cohort setup and dashboard configuration.

## Dashboard URLs

**Production:** https://app.posthog.com/project/[PROJECT_ID]/dashboards

## Dashboard 1: Core Retention (D1, D7, D30)

**Purpose:** Track user retention after first session completion.

### Cohort Definitions

```sql
-- D1 Retention: Users who completed session within 24h of signup
SELECT 
  user_id,
  min(timestamp) as signup_time,
  session_completed_time
FROM events
WHERE event = 'user_signed_up'
  AND user_id IN (
    SELECT user_id FROM events 
    WHERE event = 'session_completed'
      AND timestamp > signup_time
      AND timestamp < signup_time + INTERVAL '24 hours'
  )

-- D7 Retention: Same user returned 7 days later
-- D30 Retention: Same user returned 30 days later
```

### Key Metrics

- **D1 Rate:** % of signups with session_completed within 24h
- **D7 Rate:** % of signups with session_completed on day 7
- **D30 Rate:** % of signups with session_completed on day 30
- **Retention Curve:** Daily retention % from day 0 to day 30

## Dashboard 2: Streak Retention

**Purpose:** Do users who maintain streaks have higher long-term retention?

### Question: What % of users who hit 7-day streak are still active at D30?

```sql
-- Users with 7-day streak
WITH seven_day_streak_users AS (
  SELECT DISTINCT user_id
  FROM events
  WHERE event = 'streak_milestone_reached'
    AND milestone_days >= 7
    AND timestamp < CURRENT_DATE - INTERVAL '30 days'
)

-- What % were still active 30 days after hitting 7-day streak?
SELECT 
  COUNT(DISTINCT CASE WHEN d30.event IS NOT NULL THEN s.user_id END) * 1.0 / 
  COUNT(DISTINCT s.user_id) as retention_rate
FROM seven_day_streak_users s
LEFT JOIN events d30 ON d30.user_id = s.user_id
  AND d30.event = 'session_completed'
  AND d30.timestamp > (
    SELECT timestamp FROM events 
    WHERE user_id = s.user_id 
      AND event = 'streak_milestone_reached' 
      AND milestone_days >= 7
    ORDER BY timestamp DESC
    LIMIT 1
  ) + INTERVAL '30 days'
```

### Key Metrics

- **Streak 7 → D30 Rate:** % active at D30 after hitting 7-day streak
- **Streak 14 → D30 Rate:** % active at D30 after hitting 14-day streak
- **Streak 30 → D60 Rate:** % active at D60 after hitting 30-day streak

## Dashboard 3: Monetization Correlation

**Purpose:** Do VIP users have higher retention than free users?

### Question: Do VIP users have higher D30 retention?

```sql
-- VIP users D30 retention
WITH vip_users AS (
  SELECT DISTINCT user_id, 
    min(timestamp) as subscription_date
  FROM events
  WHERE event IN ('subscription_started', 'vip_subscribed')
    AND timestamp < CURRENT_DATE - INTERVAL '30 days'
)

SELECT 
  'VIP' as user_type,
  COUNT(DISTINCT CASE WHEN d30.event IS NOT NULL THEN v.user_id END) * 1.0 / 
  COUNT(DISTINCT v.user_id) as d30_retention
FROM vip_users v
LEFT JOIN events d30 ON d30.user_id = v.user_id
  AND d30.event = 'session_completed'
  AND d30.timestamp > v.subscription_date + INTERVAL '30 days'

UNION ALL

-- Non-VIP users D30 retention
SELECT 
  'Non-VIP' as user_type,
  COUNT(DISTINCT CASE WHEN d30.event IS NOT NULL THEN f.user_id END) * 1.0 / 
  COUNT(DISTINCT f.user_id) as d30_retention
FROM (
  SELECT user_id, min(timestamp) as signup_date
  FROM events
  WHERE event = 'user_signed_up'
    AND user_id NOT IN (SELECT user_id FROM vip_users)
    AND timestamp < CURRENT_DATE - INTERVAL '30 days'
) f
LEFT JOIN events d30 ON d30.user_id = f.user_id
  AND d30.event = 'session_completed'
  AND d30.timestamp > f.signup_date + INTERVAL '30 days'
```

### Key Metrics

- **VIP D30 Rate:** % of VIP users active at D30
- **Non-VIP D30 Rate:** % of non-VIP users active at D30
- **VIP Lift:** (VIP D30 - Non-VIP D30) / Non-VIP D30
- **Revenue per VIP:** Average revenue from VIP users

## Dashboard 4: Conversion Funnel

**Purpose:** Track users through onboarding → first session → purchase.

### Funnel Steps

1. **onboarding_started**
2. **onboarding_goal_set**
3. **onboarding_first_session_started**
4. **onboarding_first_session_completed**
5. **onboarding_completed**

### SQL for Funnel Analysis

```sql
SELECT 
  step,
  COUNT(DISTINCT user_id) as users,
  COUNT(DISTINCT user_id) * 1.0 / LAG(COUNT(DISTINCT user_id)) OVER (ORDER BY step_num) as conversion_rate
FROM (
  SELECT '1_signup' as step, 1 as step_num, user_id FROM events WHERE event = 'onboarding_started'
  UNION ALL
  SELECT '2_goal_set' as step, 2 as step_num, user_id FROM events WHERE event = 'onboarding_goal_set'
  UNION ALL
  SELECT '3_session_start' as step, 3 as step_num, user_id FROM events WHERE event = 'onboarding_first_session_started'
  UNION ALL
  SELECT '4_session_complete' as step, 4 as step_num, user_id FROM events WHERE event = 'onboarding_first_session_completed'
  UNION ALL
  SELECT '5_onboard_complete' as step, 5 as step_num, user_id FROM events WHERE event = 'onboarding_completed'
) funnel
GROUP BY step, step_num
ORDER BY step_num
```

## Dashboard 5: Purchase Funnel

**Purpose:** Track purchase conversion from paywall view to completion.

### Funnel Steps

1. **paywall_viewed**
2. **package_selected**
3. **purchase_started**
4. **purchase_succeeded**

### Key Metrics

- **Paywall → Select:** % who select a package
- **Select → Start:** % who start purchase flow
- **Start → Success:** % who complete purchase
- **Overall Conversion:** % of paywall views that result in purchase

## Implementation Checklist

- [ ] Create Dashboard 1: Core Retention (D1, D7, D30)
- [ ] Create Dashboard 2: Streak Retention
- [ ] Create Dashboard 3: Monetization Correlation
- [ ] Create Dashboard 4: Conversion Funnel
- [ ] Create Dashboard 5: Purchase Funnel
- [ ] Set up daily email reports for core metrics
- [ ] Configure alerts for retention drops > 10%
- [ ] Share dashboard links with team

## Event Verification

Verify these events are being sent to PostHog:

```javascript
// Core lifecycle
capture('user_signed_up');
capture('session_completed', { duration, xp_earned });
capture('session_abandoned', { duration_elapsed });

// Streak
capture('streak_milestone_reached', { milestone_days });
capture('streak_broken', { previous_streak });
capture('streak_recovered', { days_restored });

// Monetization
capture('paywall_viewed', { source, gem_count });
capture('purchase_started', { product_id, price });
capture('purchase_succeeded', { product_id, revenue });
capture('purchase_failed', { product_id, error_code });
capture('subscription_started', { tier, price, interval });

// Retention
capture('streak_maintained'); // Daily check-in
capture('rival_widget_viewed');
capture('comeback_offer_accepted');
```
