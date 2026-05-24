# AI Agent Rules For VEX

AI agents must read this file, `docs/VEX_FINAL_RELEASE_SCOPE.md`, and
`docs/ARCHIVED_FEATURES_DO_NOT_REVIVE.md` before editing app behavior.

## Source Of Truth

src/ is the canonical implementation. src_impl_archive/ is archived historical
code only — do not edit, import, or target it. All production code, tests,
lint, and typecheck commands must target src/.

## Product Identity

VEX is a personalized Study + Focus execution OS. The app should feel shaped
around the user, but it must stay quiet, useful, and honest. The final release
promise is: start focused work, complete it, see progress, get one next action,
and return tomorrow.

## Architecture Rules

- Data flow is Component -> Hook -> Service -> Repository -> Supabase.
- Zod schemas own types.
- FeatureAvailability gates routes, queries, notifications, event subscriptions,
  entry points, and backend work.
- Files stay under 200 lines.
- Do not introduce new libraries without explicit user instruction.
- Do not use `any`, `console.log`, `@ts-ignore`, `@ts-nocheck`,
  `StyleSheet.create`, `FlatList`, `Animated` from react-native, or raw fetch.

## Home Rules

- One primary CTA.
- One Coach Presence surface.
- At most one early spotlight.
- No feature museum.
- No archived systems.
- No route to unavailable features.
- Calm/study users get subtle momentum, not game pressure.
- Game-like/intense users may see boss health or damage only when available.

## Coach Presence Rules

CoachPresence is one conceptual system:

- AI Coach is the intelligence layer.
- Companion is the visual coach.
- Reflection is the completion voice.
- Next action is a safe intent.

Coach copy must follow motivation style and avoid generic motivational cliches.
Coach output must not return raw route names.

## Session Completion Rules

- Core save, XP, streak, rewards, and progression are owned by the completion
  ledger and services.
- UI must never grant core rewards.
- Duplicate completion events are idempotent.
- Optional feature effects cannot block completion.
- Optional failures must be logged and surfaced as degraded.
- Completion sequence is confirmation, Coach Presence reflection, progress,
  one relevant optional effect, next action.

## Premium Honesty Rules

Free must include the basic execution loop. Premium may include deeper Coach
Memory, advanced Study/Deep Work OS, progress intelligence, visual identity,
and premium session modes.

Do not show premium if billing is fake or unavailable. Do not use cheap upgrade
copy. Use language like:

- Let VEX learn your rhythm deeply.
- Turn your sessions into a full execution system.
- Unlock deeper coach memory and progress intelligence.

## Archived Features

Do not reintroduce these unless the user directly requests them:

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

## Verification Rules

Before claiming success, run relevant tests and `npm run typecheck`. If a check
fails, report the actual failure and keep fixing it.
