# Coach Presence Architecture

## Conceptual Model

`CoachPresence` is the single source of truth for the AI Coach and visual companion experience. The AI Coach owns the decision and language; the companion expresses the same decision visually.

`CoachPresence` owns tone/personality, visual companion state, next action recommendation, session reflection, progress reaction, memory summary, and motivation style adaptation.

## Naming Proposal

- Feature: `coach-presence`
- Surface component: `CoachPresenceCard`
- Main model: `CoachPresence`
- Action contract: `CoachActionIntent`
- Memory read model: `CoachPresenceMemorySummary`

## Files And Services To Unify

- `src/features/coach-presence/*`: unified model, copy, repository, hook, and component.
- `src/screens/home/components/HomeCompanionSection.tsx`: Home now renders one Coach Presence surface.
- `src/features/session-completion/hooks/useSessionCompleteController.ts`: completion hero uses one Coach Presence reflection.
- `src/features/ai-coach/services/coach-screen-service.ts`: chat responses use whitelisted intents and Coach Presence fallback copy.
- Existing memory sources stay intact but are summarized through `coach-presence/repository.ts`.

## Memory Model Plan

Short term: synchronize by reading both `coach_memories` and `companion_memories` into `CoachPresenceMemorySummary`.

Next migration: add a canonical `coach_presence_memories` view or table with source metadata, then make coach and companion memory writers emit to that model. Existing tables can remain as historical source tables.

## Home Integration

Home shows a single `CoachPresenceCard`: one short personal message, one visual companion reaction, and one safe action. The hook maps MotivationProfile to Coach Presence tone and uses FeatureAvailability before recommending study or progress actions.

## Session Completion Integration

Session completion uses `buildCompletionCoachPresence` for the reflection shown in the hero body. This prevents separate coach and companion modules from reacting differently to the same finish.

## Chat Integration

Chat remains optional and deep. `askCoachQuestion` returns Coach Presence-style copy and a whitelisted action intent only:

- `START_SESSION`
- `START_STUDY_SESSION`
- `REVIEW_PROGRESS`
- `TAKE_BREAK`
- `CONTINUE_PLAN`
- `REFLECT`

Routes stay outside AI output. The app maps intents to safe routes after checking FeatureAvailability.

## Copy Rules

Messages are short, context-aware, and end with or imply a next action. Banned phrases are tracked in `BANNED_COACH_PHRASES`: “Great job”, “Keep going”, “You can do it”, “Boost productivity”, and “Unlock your potential”.

Motivation variants:

- Calm: low pressure, steady rhythm.
- Study-focused: study thread and next pass.
- Game-like: run, lane, block, progress.
- Coach-led: direct next rep.
- Intense: controlled urgency only.

## Fallback And Completion Library

Fallback copy lives in `coach-presence/copy.ts`. Completion variants cover first session, comeback, study session, short session, long session, broken streak recovery, high-focus streak, and low-energy day.

## Risks

- Existing legacy coach files still contain older copy and route assumptions.
- Memory remains split until a canonical table/view is created.
- Home action currently opens setup for all Coach Presence action intents; route-level mapping should be expanded centrally.
- Completion first-session detection is heuristic until total session count is available in that controller.

## Test Plan

- Unit tests verify motivation style changes tone, message, visual reaction, and action intent.
- Locked-feature tests ensure study/progress suggestions fall back to safe focus actions.
- Completion tests verify short unified reflections.
- Typecheck must pass with `npm run typecheck`.
