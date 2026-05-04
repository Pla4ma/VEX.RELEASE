# Analytics Readiness

## Current Provider

- Product analytics provider: PostHog via `posthog-react-native`.
- Error analytics provider: Sentry via `src/config/sentry.ts`.
- Canonical product analytics entry point: `src/shared/analytics`.
- Backward-compatible legacy entry point: `src/analytics/AnalyticsService.ts`.
- App bootstrap initializes analytics and bridges `eventBus` `analytics:*` events in `src/app/bootstrap.ts`.

Analytics is a no-op when `EXPO_PUBLIC_POSTHOG_KEY` is missing, when `EXPO_PUBLIC_ANALYTICS_DISABLED=true`, or in development unless `EXPO_PUBLIC_ANALYTICS_FORCE_ENABLE=true`.

## Event Names

Canonical event constants live in:

- `src/shared/analytics/analytics-events.ts`
- `src/shared/analytics/product-events.ts`

Core events currently defined or supported:

- `app_opened`
- `onboarding_started`
- `onboarding_goal_set`
- `onboarding_first_session_started`
- `onboarding_first_session_completed`
- `onboarding_completed`
- `session_started`
- `session_paused`
- `session_resumed`
- `session_completed`
- `session_abandoned`
- `xp_gained`
- `level_up`
- `streak_updated`
- `streak_broken`
- `streak_milestone_reached`
- `achievement_unlocked`
- `reward_claimed`
- `paywall_viewed`
- `paywall_dismissed`
- `purchase_started`
- `purchase_completed`
- `purchase_failed`
- `purchase_cancelled`
- `settings_changed`
- `network_status_changed`
- `error_occurred`
- `core_flow_abandoned`

## Privacy Rules

Do not track:

- Email, name, username, phone, address, or free-form user text.
- Notes, messages, descriptions, content bodies, prompts, stack traces, or full error messages.
- Auth tokens, API keys, secrets, JWTs, storage objects, full URLs, file URLs, or raw backend payloads.
- Full Supabase rows, RevenueCat customer objects, notification payloads, or exported data blobs.

Allowed properties should be minimal product facts: source, route, duration, count, tier, level, streak length, boolean outcome, currency type, safe enum-like IDs, and coarse error codes.

## Adding Events Safely

1. Add the event constant to `analytics-events.ts` or `product-events.ts`.
2. Track through `capture(...)`, `useAnalytics()`, or `eventBus.publish('analytics:track', ...)`.
3. Keep properties primitive and non-sensitive.
4. Let `sanitizeAnalyticsProperties` remove unsafe keys before provider delivery.
5. Prefer completion, failure, conversion, retention, and abandonment moments over generic click spam.
6. Add a focused test for new sanitizer behavior or constants when changing analytics plumbing.
