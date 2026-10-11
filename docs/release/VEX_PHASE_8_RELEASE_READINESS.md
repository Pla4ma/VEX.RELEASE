# VEX Phase 8 Release Readiness

Status: engineering gate open. This document records required evidence; it is not a release approval.

## Local verification gate

Run from the repository root:

```bash
npm run typecheck
npm run lint -- --quiet
npm run check:line-limit
npm run check:banned-patterns
npm run check:no-ts-nocheck
npm run check:select-star
npm run test:core
npm run test:e2e:web
```

`npm run verify:core` is the authoritative combined command. A green result requires every child command to exit zero. Do not convert missing native artifacts or stale E2E discovery into skips.

## Supabase staging gate

1. Create or unpause a dedicated staging project.
2. Apply reviewed migrations, including:
   - `202608260001_reconcile_core_progression_contract.sql`
   - `202608260002_remove_dev_bypass_user.sql`
3. Verify the clean-database path and the already-migrated path.
4. Regenerate `src/types/supabase.ts` with `npm run types:supabase`.
5. Verify RLS, RPC signatures, execution permissions, unique idempotency indexes, and authenticated-subject checks.
6. Run concurrent completion replay from two authenticated staging clients.
7. Confirm exactly one completion ledger, session record, streak mutation, XP mutation, and reward receipt.

No production or staging migration is considered applied merely because a SQL file exists in this repository.

## Required device matrix

| Surface | Device or runtime | Required evidence |
|---|---|---|
| iOS compact | iPhone SE 3 simulator and physical device | Fresh install, onboarding, session, completion, Home return, dark mode, reduced motion, safe-area layout |
| iOS current | One supported iOS 26 simulator | Auth, notifications, deep links, account switch, settings persistence |
| Android large | Samsung S26 Ultra or equivalent API/device | Same core flow plus large-text and notification permission checks |
| Android emulator | Release-like emulator image | Offline completion, reconnect replay, process restart recovery |
| Web diagnostic | 390px viewport | Login form, no horizontal overflow, keyboard/form layout; secondary only |

## Manual flow checklist

- Fresh install → sign in → user-scoped onboarding.
- Logout with the network unavailable.
- Remote sign-out failure still clears local identity and query cache.
- Account A onboarding does not appear for account B.
- First session starts and persists periodic state.
- App background/foreground restores the actual elapsed session state.
- Completion online produces a durable receipt.
- Completion offline queues one canonical replay entry.
- Reconnect replays the same idempotency key exactly once.
- Restart during completion recovers only the authenticated user’s ledger.
- Session 0/1/3/5/7/10/12/18/20/40 unlock truth table matches Home, navigation, notification, and query behavior.
- AI available, slow, unavailable, quota-exhausted, and malformed-response states remain honest and actionable.
- Coach action buttons navigate to valid typed destinations or are not rendered.
- Settings toggles survive reload and are scoped to the authenticated user.
- Notification opens to valid destinations; locked or disabled features fall back safely.
- No content is hidden behind the tab bar at compact widths.
- VoiceOver/TalkBack labels, roles, hints, and touch targets are verified.

## Production build gate

- `APP_ENV=production` and `EXPO_PUBLIC_ENVIRONMENT=production` are set by the production EAS profile.
- Production builds contain no development bypass UI, sentinel user, or development credentials.
- RevenueCat offerings and entitlements are verified before enabling premium entry points.
- Supabase service-role, database, and AI provider secrets remain server-side.
- Sentry release/version metadata is present and work-content payloads are excluded.
- Privacy policy, terms, support URLs, notification behavior, and account deletion are reachable and tested.
- iOS SDK and Android target requirements are checked against the current store submission requirements before upload.

## Evidence record

- `npm run typecheck`, `npm run lint -- --quiet`, line-limit, banned-pattern, suppression, and select-star guards pass.
- Full lint has zero errors and 345 warnings; warnings are non-blocking but remain a cleanup queue.
- Core Jest passes 231 suites with 7 skipped suites and 1,882 passing tests.
- Chromium web E2E passes all 16 current auth-boundary tests. Firefox is installed and available; WebKit remains blocked by missing host package `libavif16`.
- Edge Function validation is wired through `npm run check:edge-functions` but is blocked locally because Deno is not installed.
- Remote EAS secret validation requires an authenticated EAS CLI session.
- Supabase migrations remain unapplied and require staging approval plus generated-type refresh.
