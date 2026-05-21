# VEX Adaptive Home, Completion, Premium, and Public v1

Date: 2026-05-21

## Central Model

Source of truth: `src_impl/features/personalization`.

Required profile fields:
- `primaryGoal`
- `motivationStyle`
- `preferredTone`
- `gamificationIntensity`
- `studyLayerName`
- `coachMode`
- `defaultSessionMode`
- `defaultSessionDuration`
- `userStage`
- `featureIntensityMap`

Resolver:
- `resolveVexExperience(userProfile, behaviorStats, featureAvailability)`
- Components consume the resolved experience, not raw profile fields.
- Home currently enters through `buildHomeExperienceModel`, which now delegates to the resolver.

## Boss Intensity

Levels:
- `subtle`: tiny top visual, momentum copy, no battle or damage language.
- `standard`: compact progress indicator after progress exists.
- `game-like`: health, session damage, missions tied only to focus/study execution.
- `intense`: stronger language and optional deeper route, still focus-first.

Placement rules:
- Day 0: no boss query or route. Optional tiny teaser only for game-like users.
- Calm/student: top tiny visual only.
- Game-like/intense: compact Home card after completed sessions.
- Full boss route: only when feature availability permits navigation.

Systems disabled:
- Shop
- Inventory
- Premium currency
- Battle pass
- Wagers
- Rivals
- Squads
- Leaderboards
- Advanced economy

Copy:
- Subtle: "A quiet momentum marker reflects the focus you have already earned."
- Game-like: "Your focus sessions push the creature back, one block at a time."

## Completion

Sequence:
1. `core_saved`
2. `coach_companion_reflection`
3. `streak_progress`
4. `study_progress` only for study/deep-work context
5. `boss_effect` only for session-damage boss contexts
6. `quiet_xp`
7. `next_action`

Rules:
- Core mutation remains in the completion orchestrator/service.
- Optional systems never block completion.
- XP is quiet and display-only.
- Boss effect waits until after reflection/progress.
- End with one next action.

Fallback:
- If optional data is unavailable, completion still saves and returns the next action.

Duplicate reward prevention test plan:
- Keep idempotency tests around `completion-orchestrator`.
- Add sequence tests to ensure display steps never trigger core reward mutations.
- Verify offline replay does not add duplicate reward IDs for the same session ID.

## Premium Strategy

Positioning:
- Premium sells depth, not basic usability.
- Core promise: VEX gets more personal as it learns real execution patterns.

Must remain free:
- Start session
- Complete session
- Basic XP/streak/progress
- Basic coach message
- Basic companion/boss presence
- Study/deep-work entry layer

Premium pillars:
- Deep Coach Memory
- Advanced Study / Deep Work OS
- Personal Progress Intelligence
- Companion/Boss visual customization
- Premium session modes

High-intent premium moments:
- After 5-7 completed sessions and clear value
- User asks for deeper coach memory
- Advanced study generation attempt
- Weekly intelligence report open
- Deep companion/boss identity customization

Copy:
- "Unlock deeper personalization."
- "Let VEX learn your patterns."
- "Turn your sessions into a full execution system."

Avoid:
- "Feature locked"
- "Upgrade now"
- "Limited access"
- Fake billing or fake entitlements

## Visual Layers

Free:
- Basic companion presence
- Basic boss/momentum visual
- Basic progress identity

Premium:
- Companion forms and skins
- Boss skins
- Visual worlds/themes
- Advanced animations
- Coach tone packs
- Premium session atmospheres

Unlock timing:
- Visual identity depth appears only after the user has enough sessions to have an identity worth deepening; free visuals must not feel empty, and premium visuals must not become random cosmetics.

## Behavior Adaptation

Signals:
- Completed session durations
- Abandoned session durations
- Most successful time of day
- Study vs focus usage
- Coach interactions
- Ignored cards/features
- Completion streaks
- Comeback behavior
- Preferred session mode
- Premium attempts
- Boss/challenge engagement

Rules:
- Do not overfit before three completed sessions.
- Use soft copy: "Want to repeat your best rhythm?"
- Keep user control and allow reset/change motivation style.
- Store only summaries, not raw sensitive work content.
- Privacy copy: "VEX uses session summaries to personalize suggestions. You can reset this at any time."

## Public v1 Scope

Included:
- Motivation-style onboarding
- Adaptive Home
- Start session
- Active session
- Completion sequence
- Coach/companion reflection
- Progress/streak
- Study/Deep Work layer
- Minimal visual boss/momentum element
- Basic settings
- Privacy policy/terms
- Crash reporting

Hidden or disabled:
- Shop
- Inventory
- Battle pass
- Wagers
- Rivals
- Squads/social
- Leaderboards
- Premium currency
- Advanced economy
- Unfinished premium flows

Teased only:
- Deep Coach Memory
- Weekly Intelligence
- Visual identity depth

Production proof:
- Real-device first-session QA
- Restart persistence QA
- Offline and slow-network QA
- Notification permission behavior QA
- AI unavailable fallback QA
- No disabled feature queries or broken routes
