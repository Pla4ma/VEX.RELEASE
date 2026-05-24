# VEX Final Release Scope

AI agents must read this file before editing Home, navigation, onboarding,
session completion, premium, notifications, Coach Presence, Study/Deep Work,
Boss, or feature availability.

## Product Identity

VEX is a personalized Study + Focus execution OS. The final release is a
personal execution loop, not a social game, economy, or feature museum.

Primary loop:

1. Onboarding selects goal and motivation style.
2. Home adapts around one primary action.
3. User starts a focus, study, or deep-work session.
4. User completes the session.
5. Coach Presence reflects, progress updates, and one next action appears.
6. User has a clear reason to return tomorrow.

## Final Release Includes

- Onboarding and motivation style selection.
- Adaptive Home with one primary CTA.
- Focus session start and completion.
- Session completion ledger, streak, XP, and basic progress.
- Basic Coach Presence.
- Basic companion visual as the visual coach.
- Study OS / Deep Work / Learning / Project Focus entry.
- Subtle boss or momentum visual when relevant.
- Basic settings, privacy, delete/export account paths.
- Sentry-backed error capture.
- RevenueCat-backed premium only when live billing is configured.

## Final Release Excludes

These systems are archived/deactivated. Do not revive unless the user directly asks for that exact system by name:

- shop
- inventory
- battle pass
- wagers
- rivals
- squads/social
- leaderboards
- premium currency
- advanced economy
- guilds
- community boss
- seasonal/liveops systems

## Progressive Unlocking

- Day 0: no full boss screen, no social, no shop, no economy, no premium hard sell.
- First session complete: show proof, Coach Presence, progress, and next action.
- Sessions 2-4: show rhythm and one small future preview.
- Sessions 5-7: show a relevant path, not a wall of locked systems.
- Power users: deeper systems may appear only through FeatureAvailability.

FeatureAvailability is mandatory for routes, queries, notifications, entry
points, event subscriptions, and background work.

## Home Density Rules

- Home has one primary CTA.
- Early Home has at most one spotlight.
- Home must never route to unavailable features.
- Coach and companion appear as one Coach Presence surface.
- Boss is subtle for calm/study users and visible only for game-like/intense or
  later-stage users.
- Study language adapts by primary goal:
  Study OS, Deep Work Plan, Learning OS, Project Focus Path, or Growth Path.

## Completion Source Of Truth

- Core completion mutation happens once through the session-completion ledger.
- UI display must not grant XP, rewards, currency, streaks, or boss damage.
- Duplicate completion events must not duplicate rewards.
- Optional feature effects run only when FeatureAvailability allows event
  subscription.
- Optional failures are logged and shown as degraded, but completion still
  succeeds when core save succeeds.

## Premium Honesty

Free VEX must include starting sessions, completing sessions, basic progress,
basic Coach Presence, basic companion visual, and basic Study/Deep Work entry.

Premium sells deeper personalization:

- Deep Coach Memory.
- Advanced Study / Deep Work OS.
- Personal Progress Intelligence.
- Visual identity.
- Premium session modes.

Never show fake billing, fake premium, fake plans, premium currency, or cheap
"upgrade now" copy. If billing is not live, hide premium or show a clear
unavailable state.

## Archived Feature Runtime Rules

Every archived/deactivated feature must be fully inert at runtime:
- Must not register routes.
- Must not render Home cards.
- Must not trigger notifications.
- Must not appear in session completion.
- Must not run active queries or subscriptions.
- Must not affect loading state.
- Must not appear in onboarding or Coach recommendations.
