# VEX 11/10 Product Rebuild Plan

Date: 2026-05-25

Purpose: turn VEX from a 2022-style gamified focus app into a May/June 2026-grade personalized productivity system that users open every day. This plan is written for an AI IDE. It must be treated as a strict product and implementation directive, not inspiration.

Core premise: VEX is not a narrow deep-work app. VEX is a personalized progressive-unlock productivity app. Onboarding assigns the user to an initial experience lane, and behavior can refine that lane over time. Day 0 is minimal. Day by day, VEX reveals the right systems for that user.

The central product advantage is not "many features." The central product advantage is that VEX becomes a different app for different productivity brains while still using one canonical architecture and one session loop.

## Non-Negotiable Product Direction

VEX must become an adaptive everyday focus system with four major user lanes:

1. Student
2. Game-like
3. Deep Learning / Creative
4. Minimal / Organized / Normal

All lanes share one core loop:

1. Understand user intent.
2. Pick one next useful action.
3. Start a session with the right amount of friction.
4. Complete or recover honestly.
5. Reflect with one useful question.
6. Store behavior as typed memory.
7. Unlock the next layer only when it helps.

The app must never become generic dashboard clutter. It must never become a casino economy. It must never ship fake AI. It must never expose hidden systems through routes, queries, notifications, loading states, analytics, or copy.

## Current App Analysis Summary

VEX already has strong bones:

| Area | Local Evidence | Current Strength | Current Weakness | Required Direction |
|---|---|---|---|---|
| Personalization | `src/features/personalization/core-schemas.ts` defines goal, motivation style, gamification intensity, coach mode, study layer name, session mode, user stage. | App already has real adaptive structure. | User lane is scattered across profile fields instead of resolved into one canonical lane model. | Add canonical Lane Engine that outputs primary lane, secondary lane, confidence, allowed mechanics, blocked mechanics, tone, unlock cadence. |
| Onboarding | `src/features/onboarding/schemas.ts` captures goal, duration, persona, element, explicit motivation style, motivation profile. | Onboarding can classify users. | Current classification is too coarse for 2026 personalization. | Onboarding should produce `FocusProfile` and initial `LaneProfile`. Behavior updates it after Day 3 and Day 7. |
| First week | `src/features/personalization/first-week-service.ts` resolves Day 0, Day 1, Day 2, Day 3, Day 5, Day 7, Post-Day 7. | Progressive unlock already exists. | Stages are useful but not lane-rich enough. | Keep stages, make every stage render differently per lane. |
| Home surface decisions | `src/features/home-experience/home-surface-decision.ts` decides start, coach, progress, study, companion, boss, challenges, premium. | Good surface policy architecture. | Surface decisions do not yet fully encode four-lane product quality. | Keep surface map, feed it from Lane Engine and progressive unlock policy. |
| Behavior signals | `src/features/personalization/behavior-signal-schemas.ts` tracks seen, clicked, dismissed, premium, boss, study, coach, notification signals. | Foundation for adaptive UX exists. | Signal taxonomy does not capture enough 2026 behavioral intelligence. | Add signals for rescue, avoidance, friction, reflection, import usage, unlock regret, lane mismatch. |
| Game-like path | Boss display policy and motivation config already accelerate boss/challenges for game-like users. | Good instinct. | Economy/shop/wagers/currency are 2022 mechanics. | Replace economy-first game layer with mastery, roguelite runs, personal bosses, challenge modifiers, meaningful recovery. |
| Study path | Study labels and content-study exist. | Student lane has a real start. | Needs stronger deadline/syllabus/import/review depth. | Build Study OS around imported materials, deadlines, knowledge gaps, and focus sessions. |
| Deep/creative path | Creative and deep-work modes exist in session schemas and behavior resolver. | Good base. | Not enough project continuity or context preservation. | Build Project Focus Path with session memory, next-step recovery, creative warmup, flow protection. |
| Minimal path | Calm users get boss hidden/blocked and minimal gamification. | Good restraint. | Minimal/organized lane not explicit enough. | Create clean lane with low-copy UI, Today Strip, quiet progress, no combat by default. |
| Coach | `coach-state-machine.ts` has useful states: cold start, high confidence, streak risk, comeback, overload, muted. | State machine concept is strong. | Several actions are delegated placeholders; coach messages risk being generic. | Convert coach into evidence-based lane-aware intervention system. |
| Companion | Companion exists in onboarding and coach presence. | Strong emotional product asset. | Feeding, coins, abilities, and bonuses create 2022 pet/economy feel. | Companion becomes adaptive presence, not chore pet. |
| Session start | `src/features/session-start/service.ts` builds hero, mode cards, stake, boss/streak/challenge/wallet/wagers. | Session setup can show stakes. | Wagers, insurance cost, wallet, bounty cost are dangerous old mechanics. | Replace stake with lane-specific "why this session matters" and safe friction. |
| Session completion | `src/features/session-completion/service.ts` creates return plans and next action. | Strong loop-back direction. | Completion should update memory/lane/unlocks more explicitly. | Completion becomes primary training event for personalization. |
| Liveops gates | `feature-access-config.ts` deactivates shop, inventory, battle pass, wagers, rivals, squads, leaderboards, premium currency. | Product already knows what should be hidden. | Hidden systems may still leak through code, tests, imports, copy, and queries. | Hard-enforce hidden means no render, no route, no query, no subscribe, no notification, no loading tax. |

## 2026 Market / Developer Signal Summary

Research signals used for this plan:

| Signal | 2026 Meaning | VEX Implication |
|---|---|---|
| Agentic mobile UX | Google and Android direction points toward apps exposing actions to AI agents, not only screens to humans. | VEX services should become clean action boundaries: create focus pact, start session, complete reflection, rescue user, schedule focus window. |
| AI memory quality | Developer discussion around agents emphasizes context, memory, skills, tools, and safe capability boundaries. | VEX must have visible, editable memory with source, confidence, expiry, and user control. |
| AI apps monetize but churn | RevenueCat 2026 signal: AI can convert, but churn is high if value is shallow. | Premium must sell durable personalization, study/project imports, memory, and weekly intelligence, not "AI chat." |
| Student AI planners | Student apps are moving to syllabus import, deadline risk, grade awareness, avoidance detection, and AI plans. | VEX Student lane must be more than a timer. It must turn school chaos into focus blocks. |
| Focus blockers | Users complain blockers are too easy, too expensive, battery-heavy, or not behavior-changing. Brick/Opal/Freedom/ScreenZen set expectations around friction. | VEX needs adaptive friction, but friction must be lane-aware and ethical. |
| Modern gamification | 2026 gamification works when it changes real behavior and adapts to the user. Points alone do not matter. | Game-like lane must be mastery-first, not currency-first. |
| Mobile agent GitHub trend | Open-source mobile agents expose device/app actions, calendar, files, voice, tasks, and mobile automation. | VEX should prepare agent-readable action docs and clean service APIs. |
| X/Twitter developer trend | X docs now ship AI-agent resources, skill files, MCP docs, and agent integration paths. | VEX should eventually be agent-callable by external assistants, with strict scopes. |

## Core Product Table

| Product Layer | Remove / Outdated | Simplify / Merge | Strengthen / Depth | New 2026 Direction |
|---|---|---|---|---|
| Product identity | Remove "gamified focus timer" and "RPG habit app" as main identity. | One identity: adaptive productivity app that evolves by user lane. | Make personalization the headline, not a hidden implementation detail. | "VEX becomes the productivity system your brain needs, one unlocked layer at a time." |
| Lane model | Remove one-size path where every user eventually sees same systems. | Resolve all onboarding/profile signals into four canonical lanes. | Let behavior update lane confidence after real use. | `LaneEngine`: Student, Game-like, Deep/Creative, Minimal/Normal, plus secondary traits. |
| Progressive unlocking | Remove unlocks that feel like mobile game content drip. | Keep staged unlocks, but make unlocks evidence-based. | Every unlock must say why it appeared and how to hide it. | Unlock copy: "Because you finished 3 study blocks, VEX opened Study OS." |
| Day 0 | Remove all nonessential surfaces. | Day 0 = one profile confirmation, one session CTA, one tiny preview. | Day 0 must show lane fit instantly. | Student sees first study block. Game-like sees first run. Creative sees first protected build block. Minimal sees first clean session. |
| Day 1 return | Remove generic streak return. | Merge return into "continue your lane." | Show the simplest reason to do one more session. | Student: "review before new material." Game-like: "continue the run." Creative: "resume thread." Minimal: "repeat clean block." |
| Day 2 proof | Remove vanity proof only. | Use progress proof as lane-specific evidence. | Show one metric that matters to lane. | Student: study plan progress. Game-like: encounter progress. Creative: project continuity. Minimal: completion calendar. |
| Day 3 companion | Remove pet chores. | Companion becomes memory/emotion interface. | Companion reacts differently by lane. | Companion can say "I noticed mornings work better" with evidence. |
| Day 5 path forming | Remove random feature tease. | Unlock the lane path. | Make lane feel like app transformed for user. | Student unlocks Study OS. Game-like unlocks Run Board. Creative unlocks Project Thread. Minimal unlocks Today Strip. |
| Day 7 deeper mode | Remove generic weekly report. | Unlock weekly intelligence. | Report should create next experiment. | "Next week VEX will test 15-minute starts before lunch because those worked." |
| Student lane | Remove Pomodoro-only study mode. | Merge content study, session setup, progress, review. | Support syllabus, deadlines, exam risk, weak topics, recall. | Study OS: import syllabus/assignment/notes, auto-create focus blocks and review sessions. |
| Game-like lane | Remove coins, gems, shop, wagers, trading, crafting, premium currency. | Keep bosses, quests, runs, achievements, companion, challenges. | Make mechanics skill-based and behavior-based. | Focus Roguelite: week = run, sessions = encounters, distractions = debuffs, reflections = upgrades. |
| Deep/Creative lane | Remove combat-first framing. | Merge deep work, creative, project focus, learning execution. | Preserve context across sessions. | Project Continuity Agent: remembers last stop, next move, blockers, creative warmup. |
| Minimal/Normal lane | Remove heavy cards, hype, combat, confetti, economy, pressure. | Clean plan, clean start, clean finish. | Make app feel fast and organized. | Today Strip: Now, Later, Done, Recovery. No noise. |
| Gamification | Remove generic XP as primary motivation. | XP becomes one optional presentation over real progress. | Reward identity shifts: mastery, recovery, consistency, insight. | Adaptive mechanics router picks game, study, creative, or clean representation. |
| Bosses | Remove generic monster damage for everyone. | Boss only appears where lane + behavior allow. | Boss represents real personal blocker. | Personal Bosses: Doomscroll Hydra, Deadline Fog, Perfectionism Wall, Context Switch Swarm. |
| Challenges | Remove generic daily/weekly checklist. | Challenges become next-best behavior experiments. | Challenge must have clear reason and expected outcome. | "Three 12-minute starts this week" because user abandons long sessions. |
| Achievements | Remove arbitrary count badges. | Achievements become proof of behavior change. | Reward recovery and honest reflection. | "Returned within 24h," "Named blocker," "Finished first exam review," "Protected creative morning." |
| Streaks | Remove paid streak saves and insurance. | Convert streaks into rhythm health per lane. | Track return speed and recovery quality. | Game-like gets combo/run. Student gets study rhythm. Creative gets project continuity. Minimal gets calendar consistency. |
| Companion | Remove feeding, coins, item bonuses, special-ability economy. | Companion = lane-specific emotional mirror. | Companion should encode memory, tone, and continuity. | Game-like companion as party member. Student as study partner. Creative as muse. Minimal as quiet marker. |
| Coach | Remove canned hype and generic "you got this." | Coach = evidence-based next-action system. | Coach messages must cite behavior and confidence. | Coach Card: Observation, Why it matters, Next action, Confidence, Hide/adjust. |
| Coach states | Remove empty delegated placeholders. | Keep state machine, wire actual effects. | States should drive lane-aware interventions. | Add `AVOIDANCE_RESCUE`, `LANE_MISMATCH`, `UNLOCK_REGRET`, `FLOW_PROTECTION`. |
| Memory | Remove black-box personalization. | Merge onboarding, behavior signals, reflections, session history into typed memory. | User can inspect and edit memory. | Memory Console with source, confidence, last confirmed, expiry, delete. |
| Session setup | Remove wagers, bounty costs, insurance costs, wallet stakes. | Stake becomes "why this session matters." | Make setup lane-specific but still fast. | Student: deadline risk. Game-like: encounter/modifier. Creative: project next move. Minimal: clean plan. |
| Active session | Remove overloaded HUD by default. | Active session adapts by lane. | Reduce distraction; show only motivational system user asked for. | Game-like HUD can show run/encounter. Student shows task/review target. Creative shows project note. Minimal shows timer only. |
| Completion | Remove generic reward dump. | Completion trains personalization. | Ask one smart reflection question. | Completion outputs: memory update, unlock decision, next action, recovery if partial. |
| Reflection | Remove long journaling as mandatory. | One-question reflection by default. | Question should be behavior-relevant. | "What almost pulled you away?" "What made this easier?" "Was task too big?" |
| Rescue mode | Remove shame comeback framing. | Merge comeback, coach, and session start. | Rescue is immediate, tiny, and specific. | "I'm avoiding" button creates 5-12 minute starter, with lane-specific copy and friction. |
| Friction | Remove timer-only focus. | Add adaptive friction ladder. | Friction must be consented, reversible according to policy, and lane-aware. | Soft pause, typed reason, delay, QR/NFC unlock, witness unlock, blocker integration. |
| Calendar | Remove optional side sync. | Calendar feeds planning and reminders. | Find realistic windows and explain them. | Focus Window Finder: "Best 22 min window is 2:10 because meetings end and evenings fail." |
| Notifications | Remove generic reminders and streak panic. | One notification policy service. | Learn from dismissals. | Nudge Budget: max per day, quiet hours, dismissal penalty, lane-specific message. |
| Study import | Remove manual-only study setup. | Content-study becomes Study OS input. | Import syllabus, notes, assignment, exam guide. | Auto-generate blocks, review questions, weak-topic plan, deadline risk. |
| Creative continuity | Remove blank repeated setup. | Project sessions remember context. | Each session saves "where I left off." | Project Thread with next move, open question, energy tag, blocker. |
| Premium | Remove premium currency, paid saves, hard FOMO. | Premium = deeper personalization and automation. | Premium must increase durable everyday value. | Long memory, imports, advanced reports, calendar intelligence, friction modes, private agent actions. |
| Paywall | Remove arbitrary early paywall. | Tie paywall to proven value. | Show after useful pattern detected or premium action attempted. | "VEX found your best focus window. Unlock ongoing Focus Intelligence." |
| Social | Remove feed, rankings, DMs, global leaderboards. | Keep private accountability only. | Lane-specific accountability. | Student study room, game-like party run, creative witness checkpoint, minimal optional accountability contact. |
| Squads | Remove squad wars as general feature. | Transform to small accountability pods. | Only for game-like/student users unless opted in. | Party Mode: 2-5 friends, synchronized sessions, no feed, no chat during focus. |
| Analytics | Remove generic charts. | Progress Intelligence per lane. | Use causal insights, not vanity metrics. | "You complete 2.1x more when task is named before timer starts." |
| UI | Remove universal emoji/card/hype style. | One data model, four skins. | Lane changes surface density, copy, animation, iconography, rhythm. | Tactical Study, Game Run, Studio Flow, Clean Today skins. |
| Agent readiness | Remove UI-only workflows. | Service APIs become clean actions. | Actions must be safe and typed. | Future App Intents/AppFunctions/MCP-like docs for create/start/reflect/rescue. |

## Four-Lane Experience Specification

### Student Lane

Student users want less chaos, fewer missed deadlines, and confidence that the next study block is the right one.

| Stage | Surface Priority | Copy Style | Mechanics | Unlocks |
|---|---|---|---|---|
| Day 0 | First study block | Clear, reassuring, school-aware | Simple study session | Tiny preview of Study OS |
| Day 1 | Return to material | Precise and encouraging | Review before new material | Progress proof |
| Day 2 | Proof of study rhythm | Evidence-based | Study streak, weak topic marker | Study layer secondary |
| Day 3 | Study companion | Tutor-like | Companion remembers subject/context | Reflection memory |
| Day 5 | Study OS | Structured | Active plan, deadline risk, review queue | Import prompt |
| Day 7 | Weekly study intelligence | Strategic | Risk report, next-week plan | Premium tease if billing healthy |

Student lane must include:

- Syllabus import.
- Assignment import.
- Notes/PDF/text import.
- Deadline extraction.
- Study block generation.
- Weak-topic tracking.
- Recall questions after sessions.
- "I am behind" rescue path.
- Exam mode.
- Grade-risk copy only if user provides grade/deadline context.

Student lane must avoid:

- Boss full CTA on Day 0.
- Shop/inventory/economy.
- Shame-heavy streak language.
- Overly playful companion copy during deadline stress.

### Game-Like Lane

Game-like users want energy, stakes, feedback, identity, and mastery. They do not need old mobile game economy.

| Stage | Surface Priority | Copy Style | Mechanics | Unlocks |
|---|---|---|---|---|
| Day 0 | First run tease | Playful, focused, not childish | First clean block = first run start | Tiny boss teaser only |
| Day 1 | Continue run | Momentum language | Combo, run continuity | Completion proof |
| Day 2 | Encounter progress | Strategic game master | Personal boss begins forming | Boss teaser |
| Day 3 | Companion party member | Active companion | Party member reaction | Companion thread |
| Day 5 | Run Board | Tactical | Weekly run, modifiers, challenges | Challenge board |
| Day 7 | Run recap | Strategic | Build summary, debuffs, upgrades | Advanced boss/challenge |

Game-like lane must include:

- Weekly Focus Run.
- Personal Bosses based on real blockers.
- Challenge modifiers, not currency purchases.
- Combo system based on clean starts, returns, and reflections.
- Companion as party member.
- Achievements as mastery proofs.
- Optional social Party Mode later.

Game-like lane must avoid:

- Coins as primary motivator.
- Gems.
- Shop.
- Trading.
- Wagers.
- Streak insurance.
- Battle pass as monetization pressure.
- Random loot that does not change real behavior.

Modern game mechanic replacements:

| Old 2022 Mechanic | 2026 Replacement |
|---|---|
| Coins | Mastery points tied to behavior categories |
| Gems | None; remove |
| Shop | Cosmetic identity unlocks or insight unlocks only |
| Inventory | Loadout of focus strategies, not items |
| Wagers | Voluntary challenge constraints with no currency |
| Battle pass | Weekly run or seasonal experiment |
| Generic boss | Personal blocker boss generated from behavior |
| Loot chest | Post-run insight/reward reveal |

### Deep Learning / Creative Lane

Deep/creative users want continuity, protected context, and a system that helps them resume hard work without reloading their brain.

| Stage | Surface Priority | Copy Style | Mechanics | Unlocks |
|---|---|---|---|---|
| Day 0 | First protected block | Calm, serious, creative | One project session | Project preview |
| Day 1 | Resume thread | Grounded | "Where you left off" | Progress proof |
| Day 2 | Project proof | Concrete | Next move generated | Project thread |
| Day 3 | Companion as muse/producer | Warm and focused | Context continuity | Creative reflection |
| Day 5 | Project Focus Path | Studio-like | Milestones, open loops, blockers | Project board |
| Day 7 | Flow report | Strategic | Deep work window analysis | Weekly intelligence |

Deep/creative lane must include:

- Project Thread.
- Session handoff note.
- Next move generator.
- Creative warmup.
- Open question tracking.
- Flow window detection.
- Context restore prompt.
- "I lost the thread" rescue mode.

Deep/creative lane must avoid:

- Loud boss unless opted in.
- Too many stats.
- Study/exam language unless user is learning.
- Generic productivity slogans.

### Minimal / Organized / Normal Lane

Minimal users want order, speed, trust, and low noise. They may churn if VEX feels like a game.

| Stage | Surface Priority | Copy Style | Mechanics | Unlocks |
|---|---|---|---|---|
| Day 0 | First clean session | Short, calm, direct | Timer, one task | Tiny preview only |
| Day 1 | Repeat clean block | Minimal | Calendar dot | Progress proof |
| Day 2 | Simple progress | Factual | Completion count, return cue | Progress detail |
| Day 3 | Quiet coach | Low intensity | Helpful observation | Memory preview |
| Day 5 | Today Strip | Organized | Now, Later, Done, Recovery | Structured plan |
| Day 7 | Weekly clean summary | Concise | Pattern + next week | Optional premium |

Minimal lane must include:

- Today Strip.
- Clean session setup.
- Very low animation.
- Optional coach line.
- Progress proof without game language.
- Quiet mode setting.
- No boss full CTA by default.

Minimal lane must avoid:

- XP-first surfaces.
- Game HUD.
- Companion chore loops.
- Feature teaser overload.
- Loud celebrations.

## Required New Core Systems

### 1. Lane Engine

Create canonical lane resolution. Do not scatter lane logic across random components.

Recommended feature path:

`src/features/lane-engine/`

Required files:

- `schemas.ts`
- `types.ts`
- `repository.ts` if server persistence needed
- `service.ts`
- `hooks.ts`
- `events.ts`
- `analytics.ts`
- `__tests__/`

Required output:

```ts
LaneProfile = {
  primaryLane: 'student' | 'game_like' | 'deep_creative' | 'minimal_normal';
  secondaryLane: Lane | null;
  confidence: number;
  source: 'onboarding' | 'behavior' | 'manual_override';
  traits: {
    gamificationTolerance: 'none' | 'light' | 'strong';
    structureNeed: 'low' | 'medium' | 'high';
    accountabilityNeed: 'none' | 'private' | 'party';
    frictionTolerance: 'low' | 'medium' | 'high';
    coachTone: 'soft' | 'direct' | 'strategic' | 'playful';
  };
  blockedMechanics: string[];
  preferredMechanics: string[];
  updatedAt: number;
}
```

Lane Engine inputs:

- Onboarding goal.
- Explicit motivation style.
- Persona.
- Companion element.
- Default session duration.
- Completed session modes.
- Study usage ratio.
- Deep work usage ratio.
- Creative usage ratio.
- Boss engagement.
- Surface dismissals.
- Notification dismissals.
- Rescue usage.
- Reflection answers.

Lane Engine rules:

- Onboarding chooses initial lane.
- Behavior can adjust lane after enough evidence.
- User manual override always wins.
- Day 0 must not run heavy behavior inference.
- Missing data must fall back to Minimal/Normal with low confidence.
- Lane must not unlock hidden features by itself; it can only request mechanics from feature gate.

### 2. Focus Profile

Create a durable profile that is richer than onboarding state.

Recommended feature path:

`src/features/focus-profile/`

FocusProfile must include:

- User goal.
- Lane profile.
- preferred session length.
- best time windows.
- worst time windows.
- avoided task categories.
- common interruption category.
- strongest return trigger.
- preferred friction level.
- notification sensitivity.
- coach memory consent.
- premium eligibility moment.

FocusProfile must be:

- Zod-owned.
- Persisted safely.
- Editable by user.
- Exportable/deletable.
- Safe if partial.

### 3. Memory Ledger

Memory must be visible and typed. No black-box "AI knows you."

Recommended feature path:

`src/features/focus-memory/`

Memory record:

```ts
FocusMemory = {
  id: string;
  userId: string;
  type:
    | 'best_time_window'
    | 'avoidance_trigger'
    | 'successful_session_pattern'
    | 'failed_session_pattern'
    | 'preferred_tone'
    | 'study_deadline'
    | 'project_continuity'
    | 'friction_preference'
    | 'notification_preference'
    | 'lane_evidence';
  summary: string;
  evidence: Array<{
    source: 'onboarding' | 'session' | 'reflection' | 'behavior_signal' | 'import' | 'manual';
    sourceId: string | null;
    observedAt: number;
  }>;
  confidence: number;
  expiresAt: number | null;
  userEditable: boolean;
  userDeletedAt: number | null;
  createdAt: number;
  updatedAt: number;
}
```

Memory rules:

- Every AI recommendation must cite at least one memory or say cold start.
- Low-confidence memory cannot trigger aggressive notification or friction.
- User can delete memory.
- Deleted memory cannot be regenerated from same evidence without new user behavior.
- Sensitive content imported for study/project must not become broad marketing copy.

### 4. Unlock Explainer

Every unlock must be explainable.

Required output:

```ts
UnlockDecision = {
  featureKey: FeatureKey;
  decision: 'hidden' | 'teased' | 'unlocked' | 'blocked' | 'degraded';
  reasonCode: string;
  userFacingReason: string;
  evidence: string[];
  laneFit: 'strong' | 'medium' | 'weak' | 'blocked';
  canHide: boolean;
  canReconsiderAtSessionCount: number | null;
}
```

Unlock rules:

- Hidden means no render, no route, no query, no subscribe, no notification.
- Teased means no data query unless required by visible surface.
- Blocked means explain safe fallback.
- Degraded means surface can show fallback only if useful.
- Unlock must never expose shop/inventory/wagers/premium currency in final release.

### 5. Nudge Budget

Replace low-level notification behavior with product-level policy.

Recommended feature path:

`src/features/notification-policy/`

Nudge budget inputs:

- Lane.
- First-week stage.
- Quiet hours.
- notification dismissals.
- session completion history.
- rescue risk.
- calendar windows.
- user opt-out.

Nudge budget outputs:

- allowed notification types.
- max per day.
- next allowed time.
- message style.
- reason.
- fallback if notification disallowed.

Rules:

- Day 0: zero notifications unless user explicitly schedules one.
- Max 2 per day for normal users.
- Minimal lane starts at max 1 per day.
- Game-like lane can get higher-energy copy but not more spam.
- Notification dismissal reduces future priority.
- Opening notification must record signal.
- Dismissing notification must record signal.

### 6. Rescue Mode

Rescue mode must be one of VEX's most important features.

Entry points:

- Home "I'm avoiding" action.
- Session setup "task feels too big."
- Streak/comeback state.
- Notification deep link.

Rescue flow:

1. Ask one short reason: task too big, tired, distracted, anxious, unclear, no time.
2. Create a 5-12 minute session.
3. Pick lane-specific copy.
4. Apply optional friction if user consented.
5. Ask one reflection after.
6. Store memory.

Lane examples:

- Student: "Open notes and review one weak section for 8 minutes."
- Game-like: "Recovery encounter: survive 10 clean minutes."
- Deep/Creative: "Re-enter project for 7 minutes. Only identify next move."
- Minimal: "Do 5 minutes. Stop cleanly if needed."

### 7. Modern Game Layer

Game-like lane must feel advanced, not silly.

Replace:

- coins
- gems
- shop
- inventory
- crafting
- wagers
- streak insurance
- premium currency

With:

- weekly run
- personal bosses
- modifiers
- skill tree of behaviors
- mastery achievements
- companion party member
- run recap
- optional party mode

Core game model:

```ts
FocusRun = {
  id: string;
  userId: string;
  weekStart: number;
  status: 'active' | 'completed' | 'abandoned';
  bossId: string | null;
  modifiers: string[];
  completedEncounters: number;
  cleanStarts: number;
  recoveryWins: number;
  reflectionUpgrades: number;
  finalGrade: 'D' | 'C' | 'B' | 'A' | 'S' | null;
}
```

Personal boss model:

```ts
PersonalBoss = {
  id: string;
  userId: string;
  archetype:
    | 'doomscroll'
    | 'late_start'
    | 'perfectionism'
    | 'context_switching'
    | 'deadline_fog'
    | 'task_avoidance';
  name: string;
  evidenceMemoryIds: string[];
  active: boolean;
  visibleIntensity: 'tease' | 'compact' | 'full';
}
```

Game layer rules:

- Boss appears only for game-like or opted-in users.
- Boss must represent real behavioral evidence.
- No random boss unrelated to user behavior after Day 3.
- No currency purchases.
- No gambling-like wagers.
- No pay-to-save streak.
- Failure must produce recovery path, not shame.

### 8. Study OS

Student lane must compete with 2026 AI study planners.

Study OS must support:

- paste text
- upload PDF/text where existing content-study supports it
- import syllabus manually
- deadline field
- exam date field
- topic list
- weak topic tracking
- generated focus blocks
- generated recall questions
- post-session review
- weekly study risk

Study plan output:

```ts
StudyPlan = {
  id: string;
  userId: string;
  sourceType: 'manual' | 'paste' | 'file' | 'syllabus';
  title: string;
  deadlineAt: number | null;
  riskLevel: 'none' | 'low' | 'medium' | 'high';
  blocks: StudyBlock[];
  reviewQueue: ReviewItem[];
  confidence: number;
}
```

Student unlocks:

- Day 0: first study block only.
- Day 2: progress proof.
- Day 5: Study OS.
- Day 7: weekly study intelligence.
- Post-Day 7: import/deadline intelligence.

### 9. Project Focus Path

Deep/Creative lane must make VEX a daily creative operating system.

Project Thread:

```ts
ProjectThread = {
  id: string;
  userId: string;
  title: string;
  currentObjective: string;
  lastSessionSummary: string | null;
  nextMove: string | null;
  openQuestions: string[];
  blocker: string | null;
  lastTouchedAt: number;
}
```

Creative completion asks:

- "Where did you leave off?"
- "What is the next move?"
- "What blocked flow?"
- "What should VEX remind you of before next block?"

Creative home should show:

- active project
- next move
- best focus window
- start protected block
- optional weekly flow insight

### 10. Minimal Today System

Minimal/Normal lane should feel premium by being restrained.

Today Strip:

- Now
- Later
- Done
- Recovery

Minimal home rules:

- No boss unless opted in.
- No challenge teaser before strong evidence.
- No premium tease before value proof.
- No companion animation unless user wants it.
- No more than one secondary surface on Day 0-Day 2.
- Copy must be short.

Minimal completion:

- one sentence
- one progress marker
- one next action
- no reward burst unless user enabled it

## Implementation Phases

### Phase 0: Product Safety Rails

Goal: prevent AI IDE from creating slop, broad rewrites, or fake features.

Tasks:

1. Read `AGENTS.md`, this `PLAN.md`, and `GOAL.md`.
2. Preserve existing user changes.
3. Do not introduce new libraries.
4. Do not create `.part-N.ts` files.
5. Do not exceed 200 lines per source file.
6. Do not add `any`, `@ts-ignore`, `console.log`, `StyleSheet.create`, `FlatList`, `AsyncStorage`, raw `fetch`.
7. Do not add business logic in components.
8. Do not add Supabase calls outside `repository.ts`.
9. Do not add UI that only handles happy path.
10. Do not add fake AI outputs or unbacked claims.

Exit criteria:

- No code changed yet.
- Current files relevant to lane/unlock/home/session read.
- Implementation plan split into small safe PR-sized steps.

### Phase 1: Canonical Lane Engine

Goal: unify scattered motivation/profile logic into one lane resolver.

Tasks:

1. Create `src/features/lane-engine/`.
2. Add Zod schemas for lane, lane traits, lane confidence, blocked/preferred mechanics.
3. Implement service to map onboarding profile to initial lane.
4. Implement service to refine lane from behavior signals and session history.
5. Add hook to expose lane to UI.
6. Add analytics events for lane resolved, lane changed, lane overridden.
7. Add tests for all four lanes and mixed-lane cases.

Required test cases:

- STUDY goal + student profile -> Student.
- CREATIVE goal + creative sessions -> Deep/Creative.
- game_like/intense + boss engagement -> Game-like.
- calm + dismissed boss surfaces -> Minimal/Normal.
- missing onboarding -> Minimal/Normal low confidence.
- manual override -> selected lane with confidence 1.
- Day 0 -> no heavy behavior inference.

Exit criteria:

- `npx tsc --noEmit` passes.
- lane tests pass.
- no existing route/surface behavior changes unless intentionally wired.

### Phase 2: Focus Profile + Memory Ledger

Goal: make personalization durable, inspectable, and safe.

Tasks:

1. Create `src/features/focus-profile/`.
2. Create `src/features/focus-memory/`.
3. Define Zod schemas for profile and memory.
4. Write repositories if persistence uses Supabase.
5. Write local fallback if offline/local profile needed.
6. Wire session completion to generate memory candidates.
7. Wire onboarding completion to create initial profile.
8. Add memory confidence and expiry.
9. Add deletion/editing service.
10. Add tests for parse, create, update, delete, expire, evidence merge.

No-slop requirements:

- Every memory has source evidence.
- No recommendation can cite memory without evidence.
- Deleted memory must not reappear from same evidence.
- Missing profile must not crash home/session setup.
- Profile partial state must produce safe fallback.

Exit criteria:

- Memory/profile unit tests pass.
- Typecheck passes.
- No UI yet unless separately planned.

### Phase 3: Lane-Aware First Week

Goal: make Day 0-Day 7 feel personalized without clutter.

Tasks:

1. Update `first-week-service.ts` or adjacent helpers to consume LaneProfile.
2. Add lane-specific primary message.
3. Add lane-specific primary CTA labels.
4. Add lane-specific spotlight surfaces.
5. Add lane-specific unlock tease.
6. Keep `FINAL_RELEASE_HIDDEN` strict.
7. Add first-week tests for all lanes and comeback states.

Required day examples:

- Student Day 0: start first study block.
- Game-like Day 0: start first run, tiny boss teaser only if boss available.
- Deep/Creative Day 0: start first protected project block.
- Minimal Day 0: start first clean session, no boss, no hype.
- Game-like Day 5: Run Board path forming.
- Student Day 5: Study OS path forming.
- Deep/Creative Day 5: Project Focus Path forming.
- Minimal Day 5: Today Strip path forming.

Exit criteria:

- Day 0 allowed surfaces stay minimal.
- Hidden systems remain hidden.
- All lane first-week tests pass.

### Phase 4: Home Surface Upgrade

Goal: home becomes adaptive command center, not generic dashboard.

Tasks:

1. Feed LaneProfile into home resolved experience.
2. Update surface decision input schema if needed.
3. Add lane-specific surface priority.
4. Add lane-specific copy mapping.
5. Ensure stage containers still isolate data queries.
6. Prevent hidden/deactivated lane systems from querying.
7. Add tests for home surface maps per lane.

Home examples:

- Student engaged: primary study plan, progress proof, coach, review queue.
- Game-like engaged: start run, compact boss, challenge modifier, companion party reaction.
- Deep/Creative engaged: project thread, next move, protected block, flow insight.
- Minimal engaged: Today Strip, clean start, concise progress, optional coach.

Exit criteria:

- Home never imports inactive lane-heavy data in new/activating stages.
- Hidden features do not query.
- Home tests pass.

### Phase 5: Session Setup Rebuild

Goal: session setup becomes lane-specific and removes old economy stakes.

Tasks:

1. Remove or gate wallet/wager/insurance/bounty stake display from final release paths.
2. Replace stake with Lane Session Brief.
3. Build lane-specific hero copy.
4. Build lane-specific session cards.
5. Add rescue session option.
6. Keep offline safe messaging.
7. Add tests for session setup per lane.

Lane Session Brief:

```ts
LaneSessionBrief = {
  lane: Lane;
  title: string;
  body: string;
  successCondition: string;
  risk: string | null;
  suggestedFriction: string | null;
  nextActionAfterCompletion: string;
}
```

Exit criteria:

- No final release UI references wallet/wagers/insurance costs.
- Session start works offline.
- Tests pass.

### Phase 6: Completion as Personalization Training Event

Goal: every completion improves VEX.

Tasks:

1. Add lane-aware completion summary.
2. Add one-question reflection prompt.
3. Generate memory candidates from completion.
4. Update LaneProfile evidence.
5. Update unlock decisions.
6. Generate next action.
7. Add partial/abandoned/recovery paths.

Completion output:

- progress saved
- lane-specific reaction
- one reflection
- memory update candidate
- unlock decision
- next action

Exit criteria:

- First session completion creates useful return plan.
- Partial completion does not shame user.
- Memory update is optional and safe.
- Completion tests pass.

### Phase 7: Modern Game-Like Experience

Goal: make game-like lane 2026-grade.

Tasks:

1. Create or refactor game-specific services into behavior-based run model.
2. Add FocusRun schema.
3. Add PersonalBoss schema.
4. Replace economy/wager mechanics in game-like final release path.
5. Keep boss display policy but feed personal boss evidence.
6. Add Run Board surface.
7. Add run recap completion surface.
8. Add tests.

No-slop requirements:

- Boss must cite real behavior evidence after Day 3.
- No currency spend.
- No gambling/wager language.
- No shop/inventory dependency.
- Minimal lane must never see game systems unless opted in.

Exit criteria:

- Game-like lane feels fun but not childish.
- Existing hidden economy remains hidden.
- Tests pass.

### Phase 8: Study OS Upgrade

Goal: make Student lane competitive with 2026 AI study planners.

Tasks:

1. Extend content-study to support StudyPlan outputs.
2. Add deadline and risk fields.
3. Add review queue.
4. Add recall questions after study session.
5. Add Study OS home surface.
6. Add study rescue.
7. Add tests for import -> plan -> session -> completion -> review.

Exit criteria:

- Student can go from material/deadline to session.
- Study session completion updates review queue.
- Fallback works when AI generation times out.
- Tests pass.

### Phase 9: Project Focus Path

Goal: make Deep/Creative lane an everyday project continuity tool.

Tasks:

1. Add ProjectThread schemas/services.
2. Add project session setup.
3. Add project completion handoff.
4. Add next move generator.
5. Add project home surface.
6. Add "lost the thread" rescue.
7. Add tests.

Exit criteria:

- Creative user can resume context fast.
- Completion stores next move.
- Missing project thread falls back safely.
- Tests pass.

### Phase 10: Minimal Today System

Goal: make Minimal/Normal lane premium through restraint.

Tasks:

1. Add Today Strip model.
2. Add quiet home surface mapping.
3. Add low-animation completion.
4. Add concise coach copy.
5. Add settings/toggle if needed.
6. Add tests.

Exit criteria:

- Minimal user sees no boss/economy/challenge clutter by default.
- Minimal completion has no loud reward burst.
- Tests pass.

### Phase 11: Notification Policy + Rescue

Goal: avoid spam and turn avoidance into action.

Tasks:

1. Create notification-policy feature.
2. Define NudgeBudget schema.
3. Wire behavior signals for open/dismiss.
4. Add lane-specific notification copy.
5. Add rescue mode service.
6. Add rescue route/surface only where allowed.
7. Add tests.

Exit criteria:

- Day 0 sends no unsolicited notifications.
- Max per day enforced.
- Dismissal lowers future priority.
- Rescue creates real session config.
- Tests pass.

### Phase 12: Premium Strategy

Goal: premium sells durable personalized value, not old game pressure.

Premium features:

- long memory
- advanced focus reports
- study import depth
- project continuity depth
- calendar intelligence
- advanced friction modes
- weekly experiments
- private memory console advanced controls

Remove from premium:

- streak insurance
- gems
- coins
- paid saves
- pay-to-win boosts
- artificial feature lock before value proof

Paywall rules:

- No Day 0 hard sell.
- No paywall until value proof.
- Can show soft tease after session 5 if billing healthy.
- Stronger paywall after weekly insight or premium action attempt.
- Must hide if RevenueCat unhealthy.

Exit criteria:

- Premium tests assert no economy/streak-insurance monetization.
- Paywall timing tests pass.
- RevenueCat health gates preserved.

## AI IDE Quality Rules

These rules are mandatory for every implementation pass.

1. Work in small vertical slices.
2. Read existing schemas, services, hooks, and tests before editing.
3. Use existing feature-layer pattern.
4. Add Zod schema first.
5. Infer types from Zod.
6. Write service test before or with service.
7. Keep files under 200 lines.
8. Split by domain name, not `.part-N`.
9. Do not create placeholders that look complete.
10. Do not return fake data from services.
11. Do not leave TODO comments.
12. Do not add new library.
13. Do not move unrelated code.
14. Do not change product strategy in code without updating this plan.
15. Do not expose hidden features through UI, route, query, notification, analytics, or loading.

## Verification Matrix

Run this matrix before calling any phase complete.

| Verification Area | Required Checks |
|---|---|
| TypeScript | Run `npx tsc --noEmit`. Fix all TypeScript errors. No `any`, no `@ts-ignore`, no `@ts-nocheck`. |
| Lint | Run lint. Clean dead code, unused imports, broken imports, stale copy. |
| Line limit | Run line-limit audit. Touched files must stay under 200 lines. No `.part-N.ts` files. |
| Banned patterns | Run banned-pattern check. No console.log, StyleSheet.create, FlatList, AsyncStorage, raw fetch, direct expo-haptics. |
| Feature gating | Hidden/locked/degraded features must not render, route, query, subscribe, notify, or affect loading. |
| Lane Engine | Test Student, Game-like, Deep/Creative, Minimal/Normal, mixed lane, missing profile, manual override, Day 0 cold start. |
| FocusProfile | Test create, update, partial fallback, missing onboarding fallback, delete/export if implemented. |
| Memory Ledger | Test evidence, confidence, expiry, deletion, recommendation citation, deleted memory non-recreation. |
| First week | Test Day 0, Day 1, Day 2, Day 3, Day 5, Day 7, Post-Day 7 for all lanes. |
| Home | Test onboarding -> home surface map for all lanes. Ensure stage containers do not query disabled lane systems. |
| Session setup | Test lane-specific setup, offline setup, invalid params fallback, rescue setup, hidden economy removal. |
| Active session | Test lane-specific HUD policy and reduced motion. No business logic in components. |
| Completion | Test full, partial, abandoned, comeback, study follow-up, project follow-up, memory update, next action. |
| Notifications | Test budget, quiet hours, dismiss/open signals, Day 0 no unsolicited notification, lane copy. |
| Premium | Test RevenueCat unhealthy fallback, no early hard paywall, lane-specific premium moment, no pay-to-save. |
| End-to-end core flow | Test onboarding -> home -> session setup -> active session -> completion -> progress/home return. |
| Student flow | Test onboarding Student -> Study OS tease -> import/plan -> study session -> review queue. |
| Game-like flow | Test onboarding Game-like -> run tease -> boss/personal blocker -> session -> run recap. |
| Deep/Creative flow | Test onboarding Creative -> project thread -> session -> handoff -> resume. |
| Minimal flow | Test onboarding Minimal -> clean home -> clean session -> quiet completion -> no boss/economy. |
| Offline | Test start session offline, complete offline, sync fallback, no lost completion. |
| Accessibility | All interactive elements need label, role, hint. Minimum touch target. Reduced motion honored. |
| Runtime | Run app smoke path on local simulator/device when possible. Check no blank screens or navigation dead ends. |
| Production build | Run production build command available in repo or documented pipeline. Fix build/import/runtime errors. |

## Definition of Done For 11/10 Direction

This plan is complete only when VEX can prove all of the following:

1. New user sees a minimal Day 0 app.
2. Onboarding selects one of four lanes.
3. User can override lane.
4. App changes by lane without forking architecture.
5. Progressive unlocks reveal only useful systems.
6. Hidden systems are truly inert.
7. Game-like lane feels modern, strategic, and behavior-based.
8. Student lane can turn study material/deadlines into sessions.
9. Deep/Creative lane preserves project context between sessions.
10. Minimal lane feels calm, fast, organized, and non-gamey.
11. Coach recommendations cite real evidence or admit cold start.
12. Memory is visible, editable, and deletable.
13. Rescue mode turns avoidance into a tiny real session.
14. Notifications are budgeted and learned from dismissals.
15. Completion updates personalization.
16. Premium sells durable personalized value.
17. Typecheck passes.
18. Lint passes or has documented non-launch exception.
19. Focused tests pass.
20. Full critical user journey passes.

## First Recommended Implementation Slice

Start with Lane Engine. Do not start with visuals. Do not start with premium. Do not start with boss rebuild.

Reason: Lane Engine is the missing product spine. Without it, every later AI IDE task will scatter lane logic across home, coach, session, companion, and unlock files.

First slice scope:

1. Add `src/features/lane-engine/schemas.ts`.
2. Add `src/features/lane-engine/service.ts`.
3. Add `src/features/lane-engine/types.ts`.
4. Add `src/features/lane-engine/__tests__/lane-engine.test.ts`.
5. Integrate read-only into `useHomeResolvedExperience` behind existing behavior, without changing UI yet.
6. Run typecheck and tests.

First slice must not:

- redesign UI
- change route structure
- add new library
- touch payment
- rewrite onboarding screens
- enable hidden features
- create boss/game systems yet

After first slice passes, second slice should wire LaneProfile into first-week experience and home surface decisions.

## Expanded Phase Playbook

This section is the detailed execution manual. If another AI agent implements this plan, it must follow this section before writing code. Do not treat the short phase list above as sufficient.

### Expanded Phase 0: Product Safety Rails And Repo Grounding

Objective: force implementation discipline before any feature work starts.

Why this phase exists: VEX already has many systems in flight and many user edits. A low-quality AI pass could easily duplicate architecture, expose disabled features, add fake AI, or break the first-week journey. Phase 0 prevents that.

Required repo reads:

| File / Area | Why Read It | What To Extract |
|---|---|---|
| `AGENTS.md` | Local coding rules are strict and override normal shortcuts. | Architecture rules, file size limit, banned patterns, test requirements. |
| `GOAL.md` | Shows current modernization backlog and known blockers. | Current line-limit debt, active objective, verification status, risks. |
| `src/features/onboarding/schemas.ts` | Onboarding is source of initial user shape. | Goal, persona, element, explicit motivation style, profile fields. |
| `src/features/onboarding/store.ts` and helpers | Current persisted onboarding state. | Where lane inputs come from and how partial onboarding behaves. |
| `src/features/personalization/core-schemas.ts` | Existing personalization primitives. | Goal, motivation style, gamification intensity, user stage, mode. |
| `src/features/personalization/first-week-service.ts` | Existing progressive unlock stage logic. | Day 0-Day 7 stages, hidden surfaces, first-week copy. |
| `src/features/personalization/behavior-signal-schemas.ts` | Current behavior telemetry model. | Signals available for lane refinement. |
| `src/features/personalization/behavior-resolver.ts` | Existing behavior inference. | Dismissal thresholds, boss/study/premium signal handling. |
| `src/features/home-experience/home-surface-decision.ts` | Home surface policy. | Existing gates and where LaneProfile must feed in. |
| `src/features/liveops-config/feature-access-config.ts` | Progressive unlock and disabled feature source. | Hidden/deactivated final release systems. |
| `src/features/liveops-config/feature-motivation-config.ts` | Motivation-based unlock offsets. | Existing acceleration/restriction behavior. |
| `src/features/session-start/service.ts` | Current session setup copy/stake logic. | Where old economy/wagers must be removed or gated. |
| `src/features/session-completion/service.ts` | Completion return plan. | Where memory and lane updates should hook. |
| `src/features/coach-presence/service.ts` | Existing lane-ish coach presence. | Tone mapping and companion visual state. |
| `src/features/ai-coach/service/coach-state-machine.ts` | Coach state machine. | Intervention states, placeholders, missing wiring. |
| `src/features/content-study/service.ts` | Study import/generation service. | Current Study OS foundation. |
| `src/features/boss/display-policy.ts` | Boss visibility policy. | Existing game-like/calm behavior. |

Phase 0 deliverables:

1. List exact files to touch for the first implementation slice.
2. Confirm no unrelated dirty files will be edited.
3. Confirm no new dependency is needed.
4. Confirm first slice can be verified with focused tests and typecheck.
5. Confirm hidden feature behavior will not change.

Phase 0 stop conditions:

- If current typecheck is failing, record the failure before making changes.
- If a target file has unrelated user edits, read carefully and preserve them.
- If a requested change requires new library, stop and ask user.
- If implementation would exceed 200 lines in a file, split first.

Phase 0 verification:

- `git status --short`
- targeted file reads complete
- no code edits yet

### Expanded Phase 1: Canonical Lane Engine

Objective: create one canonical source of truth for user lane. This must happen before UI changes.

Product problem: current app uses motivation style, goal, study ratio, boss engagement, user stage, explicit onboarding style, and surface dismissal in different places. That is flexible, but it creates drift. A canonical Lane Engine prevents inconsistent behavior where home thinks user is game-like, coach thinks user is calm, and session setup thinks user is study-focused.

Target feature:

`src/features/lane-engine/`

Required files:

| File | Purpose | Notes |
|---|---|---|
| `schemas.ts` | Zod schemas for Lane, LaneProfile, LaneEvidence, LaneTraits, LaneMechanic. | Types must be inferred only. |
| `types.ts` | Domain-only exported inferred types and constants if needed. | No logic. |
| `service.ts` | Pure lane resolution functions. | No Supabase. No React. |
| `hooks.ts` | Hook wrapper for UI consumption. | No business logic beyond wiring. |
| `events.ts` | Lane resolved/changed/overridden events. | Event definitions only. |
| `analytics.ts` | Breadcrumbs/PostHog lane events. | No business logic. |
| `__tests__/lane-engine.test.ts` | Core lane resolver tests. | Must include all lane cases. |

Core schemas:

```ts
LaneSchema = z.enum(['student', 'game_like', 'deep_creative', 'minimal_normal']);

LaneSourceSchema = z.enum([
  'onboarding',
  'behavior',
  'manual_override',
  'fallback',
]);

LaneEvidenceSchema = z.object({
  source: z.enum([
    'onboarding_goal',
    'motivation_style',
    'session_mode',
    'surface_signal',
    'boss_engagement',
    'study_usage',
    'creative_usage',
    'manual_override',
  ]),
  value: z.string(),
  weight: z.number().min(0).max(1),
  observedAt: z.number().int().min(0),
}).strict();
```

Lane scoring rules:

| Input Signal | Student Score | Game-like Score | Deep/Creative Score | Minimal/Normal Score |
|---|---:|---:|---:|---:|
| onboarding goal STUDY | +0.55 | 0 | +0.10 | 0 |
| onboarding goal CREATIVE | 0 | 0 | +0.55 | +0.05 |
| onboarding goal WORK | +0.10 | 0 | +0.25 | +0.25 |
| onboarding goal PERSONAL | 0 | +0.05 | +0.10 | +0.35 |
| explicit style student/study_focused | +0.60 | 0 | +0.15 | 0 |
| explicit style game_like/intense/competitive | 0 | +0.60 | 0 | 0 |
| explicit style calm | 0 | -0.20 | +0.05 | +0.50 |
| explicit style coach_led | +0.15 | +0.05 | +0.15 | +0.20 |
| study usage ratio >= 0.35 | +0.35 | 0 | +0.10 | 0 |
| deep/creative usage ratio >= 0.35 | 0 | 0 | +0.40 | 0 |
| boss engagement high | 0 | +0.35 | 0 | -0.20 |
| boss dismissed 3+ times | 0 | -0.35 | 0 | +0.25 |
| challenge clicked 2+ times | +0.05 | +0.25 | +0.05 | 0 |
| notification dismissed 3+ times | 0 | 0 | 0 | +0.20 |
| manual override | selected lane = 1.0 confidence | selected lane = 1.0 confidence | selected lane = 1.0 confidence | selected lane = 1.0 confidence |

Confidence rules:

- 0.00-0.39: low confidence.
- 0.40-0.69: medium confidence.
- 0.70-1.00: high confidence.
- If top two lanes are within 0.10, set `secondaryLane`.
- If no reliable input, return Minimal/Normal with fallback source and low confidence.
- Do not change primary lane from onboarding until at least 3 completed sessions unless user manually overrides.
- Do not infer game-like from a single boss click.
- Do not infer minimal from one dismissal.

Mechanic rules by lane:

| Lane | Preferred Mechanics | Blocked Mechanics |
|---|---|---|
| Student | Study OS, deadline risk, review queue, recall prompts, study streak, tutor coach. | shop, gems, wagers, broad social, boss full CTA before opt-in. |
| Game-like | Focus run, personal boss, modifiers, mastery achievements, companion party member, optional party mode. | gems, shop, trading, wagers, paid saves, generic leaderboards. |
| Deep/Creative | Project thread, next move, flow window, creative warmup, continuity memory. | loud combat default, study exam copy, economy, generic streak panic. |
| Minimal/Normal | Today Strip, clean session, quiet progress, short coach, low notifications. | boss full CTA, challenge spam, XP-first UI, companion chores, economy. |

Service functions:

```ts
resolveInitialLane(input: ResolveInitialLaneInput): LaneProfile
resolveBehaviorLane(input: ResolveBehaviorLaneInput): LaneProfile
mergeLaneProfiles(input: MergeLaneProfilesInput): LaneProfile
getLaneMechanicPolicy(profile: LaneProfile): LaneMechanicPolicy
shouldReconsiderLane(input: LaneReconsiderationInput): boolean
```

Integration boundaries:

- Phase 1 integration is read-only.
- Add output to `useHomeResolvedExperience` only as diagnostic/non-UI field if needed.
- Do not change surface behavior until Phase 3/4.
- Do not modify onboarding screens yet.

Tests:

| Test | Expected |
|---|---|
| STUDY goal + student style | Student high confidence. |
| STUDY goal + game_like style | Student primary, Game-like secondary or Game-like primary depending weights; no crash. |
| CREATIVE goal + creative sessions | Deep/Creative high confidence. |
| calm style + boss dismissed repeatedly | Minimal/Normal high confidence. |
| game_like style + boss high engagement | Game-like high confidence. |
| missing onboarding and no sessions | Minimal/Normal low confidence fallback. |
| manual override | selected lane confidence 1.0. |
| Day 0 behavior ignored | no heavy behavioral reclassification. |
| conflicting signals | primary + secondary set, confidence not overstated. |

Phase 1 exit gate:

- Lane Engine tests pass.
- Typecheck passes.
- No visible UI behavior changed.
- No file over 200 lines.

### Expanded Phase 2: Focus Profile And Memory Ledger

Objective: turn personalization from inferred UI decisions into durable, inspectable user memory.

Product problem: 2026 users expect AI to remember, but also expect control. Black-box personalization creates distrust. VEX must remember only useful things, cite evidence, and allow deletion.

Target features:

- `src/features/focus-profile/`
- `src/features/focus-memory/`

FocusProfile required fields:

| Field | Purpose | Fallback |
|---|---|---|
| `userId` | User owner. | required after auth, local anonymous id if needed. |
| `laneProfile` | Canonical lane output. | Minimal/Normal low confidence. |
| `primaryGoal` | User goal. | focus/work generic. |
| `preferredSessionDurationMinutes` | Default duration. | onboarding duration or 25. |
| `preferredSessionMode` | Default mode. | from behavior or `FOCUS`. |
| `bestFocusWindows` | Time windows that worked. | empty array. |
| `riskWindows` | Times user often fails. | empty array. |
| `avoidanceTriggers` | Common failure reasons. | empty array. |
| `frictionPreference` | Soft/medium/hard. | soft. |
| `notificationPreference` | max/day, quiet hours, tone. | conservative defaults. |
| `memoryConsent` | What VEX may remember. | safest mode. |
| `updatedAt` | Freshness. | now. |

Memory types:

| Memory Type | Example | Can Trigger UI? | Expiry |
|---|---|---|---|
| `best_time_window` | "User completes lunch sessions more often." | yes, low-risk. | refresh every 30 days. |
| `avoidance_trigger` | "Long writing tasks cause avoidance." | yes, with confidence threshold. | refresh every 30 days. |
| `successful_session_pattern` | "12-minute starts work after missed days." | yes. | refresh every 45 days. |
| `failed_session_pattern` | "Evening study blocks often abandon." | yes, gentle only. | refresh every 30 days. |
| `preferred_tone` | "User dismisses intense coach copy." | yes. | no expiry unless user changes. |
| `study_deadline` | "Biology exam due June 7." | yes. | deadline + 7 days. |
| `project_continuity` | "Draft stopped at outline section 3." | yes. | until project completed/deleted. |
| `friction_preference` | "User accepts delay but not hard lock." | yes. | no expiry unless user changes. |
| `notification_preference` | "Evening nudges dismissed repeatedly." | yes. | 30 days. |
| `lane_evidence` | "Boss clicks reinforce Game-like lane." | yes, internal. | 60 days. |

Memory candidate flow:

1. Session completes or aborts.
2. Completion service emits structured outcome.
3. Reflection answer adds reason.
4. Memory service creates candidate.
5. Candidate is accepted automatically only if low sensitivity and sufficient evidence.
6. Sensitive/ambiguous candidate stays as low-confidence or asks user.
7. Coach and home can cite accepted memory.

Memory safety rules:

- No private imported content in generic coach copy.
- No medical/mental health diagnosis.
- No shame labels like "lazy."
- No irreversible inference from one bad session.
- No use of deleted memory.
- No premium marketing from sensitive memory.

Repository contract:

If persisted to Supabase, all reads/writes belong in `repository.ts`. If local-only first, use existing MMKV wrapper and make migration path explicit.

Service contracts:

```ts
createFocusProfile(input): Promise<FocusProfile>
getFocusProfile(userId): Promise<FocusProfile | null>
upsertFocusProfile(input): Promise<FocusProfile>
createMemoryCandidate(input): Promise<FocusMemory>
acceptMemory(memoryId, userId): Promise<FocusMemory>
deleteMemory(memoryId, userId): Promise<void>
listActiveMemories(userId): Promise<FocusMemory[]>
findMemoriesForRecommendation(input): Promise<FocusMemory[]>
```

Tests:

- create profile from onboarding.
- profile fallback with missing onboarding.
- memory candidate from completed session.
- memory candidate from abandoned session.
- memory evidence merge.
- memory expiry.
- user deletion.
- deleted memory not returned.
- recommendation lookup excludes low confidence when threshold required.
- imported content memory does not leak into generic copy.

Phase 2 exit gate:

- Profile and memory tests pass.
- Typecheck passes.
- No UI claims memory exists unless service returns it.
- No hidden feature behavior changed.

### Expanded Phase 3: Lane-Aware First Week

Objective: upgrade progressive unlocking into the app's core magic.

Product problem: VEX already unlocks by stage, but users should feel "the app is learning me," not "features are appearing." Each first-week stage must produce a lane-specific reason to return.

Target files:

- `src/features/personalization/first-week-service.ts`
- `src/features/personalization/first-week-schemas.ts`
- optional helper: `src/features/personalization/first-week-lane-copy.ts`
- tests under `src/features/personalization/__tests__/`

Required schema additions:

- `lane`
- `laneConfidence`
- `laneStageTheme`
- `unlockExplanation`
- `blockedSurfaceReasons`
- `firstWeekExperiment`

Stage-by-lane matrix:

| Stage | Student | Game-like | Deep/Creative | Minimal/Normal |
|---|---|---|---|---|
| Day 0 | "Start first study block." Tiny Study OS preview. | "Start first run." Tiny boss teaser only. | "Protect first project block." Project preview. | "Start first clean session." No game tease. |
| Day 1 | "Return to same material." | "Continue the run." | "Resume thread." | "Repeat clean block." |
| Day 2 | Study progress proof. | Run/encounter proof. | Project continuity proof. | Simple progress proof. |
| Day 3 | Study companion/tutor memory. | Companion party member. | Companion as creative producer. | Quiet coach memory preview. |
| Day 5 | Study OS path. | Run Board path. | Project Focus Path. | Today Strip. |
| Day 7 | Weekly study plan. | Run recap/build. | Flow report. | Weekly clean summary. |
| Post-Day 7 | Import/deadline intelligence. | Personal bosses/modifiers. | Project continuity intelligence. | Calendar/plan refinement. |

Allowed surfaces by lane:

| Lane | Day 0 Allowed | Day 0 Forbidden |
|---|---|---|
| Student | motivation confirmation, coach line, start session, tiny Study OS preview | boss full CTA, shop, inventory, premium hard sell, challenge board |
| Game-like | motivation confirmation, coach line, start session, tiny boss/run preview | shop, inventory, wagers, full boss screen, premium hard sell |
| Deep/Creative | motivation confirmation, coach line, start session, tiny project preview | boss full CTA, study deadline UI unless goal study, economy |
| Minimal/Normal | motivation confirmation, coach line, start session, tiny unlock preview | boss, challenge board, companion animation, premium, economy |

Copy requirements:

- No generic "you got this" unless backed by context.
- No "legendary/crushed/top performer" copy.
- No "protect streak" on Day 0.
- Game-like copy can be playful but must stay focused on real session behavior.
- Student copy must be precise, not childish.
- Minimal copy must be short.
- Creative copy must preserve project energy, not productivity hustle.

Tests:

- all four lanes Day 0 surfaces.
- all four lanes Day 5 spotlight.
- all four lanes Day 7 weekly intelligence.
- comeback state overrides normal lane path but keeps lane tone.
- premium moment hidden before allowed sessions.
- hidden final release surfaces stay hidden.
- degraded features produce blocked fallback, not crash.

Phase 3 exit gate:

- First-week tests pass.
- Snapshot or explicit assertions prove Day 0 minimalism.
- No hidden features query/render.

### Expanded Phase 4: Home Surface Upgrade

Objective: make home feel like four different apps while keeping one architecture.

Product problem: if home shows same modules in same order with only different words, users will not feel personalization. If implementation forks everything, code becomes unmaintainable. Need one surface decision model with lane-specific rendering.

Target files:

- `src/features/home-experience/surface-decision-schemas.ts`
- `src/features/home-experience/home-surface-decision.ts`
- `src/screens/home/hooks/useHomeResolvedExperience.ts`
- `src/screens/home/hooks/useHomeSurfaceMap.ts`
- `src/screens/home/components/HomeContent.tsx`
- `src/screens/home/components/HomeContentLower.tsx`
- stage containers only if needed

New surface keys to consider:

- `study_os`
- `run_board`
- `project_thread`
- `today_strip`
- `rescue_cta`
- `memory_insight`
- `weekly_intelligence`
- `focus_window`

Do not add all surfaces at once. Add only surfaces needed by current phase.

Home architecture rules:

- Stage containers still isolate data hooks.
- New user home must not import engaged/power data hooks.
- Minimal lane must not fetch boss/challenge/study heavy data unless visible.
- Game-like lane can fetch boss/run data only when boss/run surface is visible or needed.
- Student lane can fetch study plan only when Study OS surface is visible or user has active plan.
- Hidden means no query.

Home UI contracts:

| Surface | Required States |
|---|---|
| Study OS | loading skeleton, error with retry, empty import CTA, offline banner, success. |
| Run Board | loading skeleton, empty first run CTA, hidden fallback, success. |
| Project Thread | empty create project CTA, success with next move, recovery if stale. |
| Today Strip | always local fallback, no network dependency for basic view. |
| Memory Insight | hidden if no accepted memory, explain source if shown. |
| Rescue CTA | always available after onboarding unless hidden by setting. |

Lane home examples:

Student engaged:

1. Primary CTA: Continue Study OS or Start Study Block.
2. Spotlight: active deadline or review queue.
3. Secondary: progress proof.
4. Coach: precise next study recommendation.
5. Hidden: boss full, shop, inventory, social feed.

Game-like engaged:

1. Primary CTA: Continue Run.
2. Spotlight: personal boss or run board.
3. Secondary: challenge modifier.
4. Companion: party reaction.
5. Hidden: shop, wagers, gems, broad leaderboard.

Deep/Creative engaged:

1. Primary CTA: Resume Project Thread.
2. Spotlight: next move.
3. Secondary: best focus window.
4. Coach: continuity reminder.
5. Hidden: boss unless opted in.

Minimal engaged:

1. Primary CTA: Start clean session.
2. Spotlight: Today Strip.
3. Secondary: simple progress proof.
4. Coach: one short line.
5. Hidden: boss, challenges, companion animation, economy.

Tests:

- `decideHomeSurfaces` returns correct primary and spotlight for each lane.
- New user stage does not request heavy data.
- Hidden feature gates prevent route/query.
- Dismissed surfaces are suppressed.
- Active study plan overrides generic start for Student.
- Boss ignored suppresses boss for non-high engagement users.
- Minimal lane never gets boss full CTA.

Phase 4 exit gate:

- Home tests pass.
- Typecheck passes.
- Manual smoke of home after onboarding for all lanes if possible.

### Expanded Phase 5: Session Setup Rebuild

Objective: make session setup the moment where lane personalization becomes concrete.

Product problem: current `session-start/service.ts` has good structure but includes wallet, wagers, insurance, bounty costs, and old game-economy stake language. That conflicts with final product direction.

Target files:

- `src/features/session-start/schemas.ts`
- `src/features/session-start/service.ts`
- `src/screens/session` setup components/hooks
- related tests

New model:

```ts
LaneSessionBrief = {
  lane: Lane;
  title: string;
  body: string;
  successCondition: string;
  sessionMode: SessionMode;
  suggestedDurationSeconds: number;
  risk: {
    type: 'deadline' | 'avoidance' | 'streak' | 'project_stale' | 'none';
    label: string;
  } | null;
  friction: {
    level: 'none' | 'soft' | 'medium' | 'hard';
    reason: string;
  } | null;
  afterCompletion: string;
}
```

Session setup lane behavior:

| Lane | Default Setup | Risk Display | CTA | Avoid |
|---|---|---|---|---|
| Student | study task or review block | deadline/weak topic | Start study block | boss copy, economy |
| Game-like | run encounter | blocker boss/run risk | Start encounter | coins/gems/wagers |
| Deep/Creative | project next move | stale project/context loss | Resume project block | hype, combat default |
| Minimal/Normal | one clean task | time/overload only | Start clean session | reward language |

Required removals/gates:

- `wallet` display must not be user-facing in final release.
- `wagers` must not appear.
- `insuranceCost` must not appear.
- `bountyCost` must not appear.
- `selectedLoadout` must not imply inventory unless transformed into focus strategy loadout.

Focus strategy loadout alternative:

- "Phone away"
- "One tab"
- "Notes open"
- "Do not pause"
- "5-minute rescue allowed"

These are not items. They are behavioral constraints.

Tests:

- Student setup with study context.
- Game-like setup with run/boss context.
- Deep/Creative setup with project context.
- Minimal setup with no heavy systems.
- Offline setup.
- Invalid params fallback.
- Hidden economy fields not present in parsed display model.
- Rescue setup creates 5-12 minute session.

Phase 5 exit gate:

- No final release session setup copy references wagers, insurance cost, gem, shop, inventory.
- Focused tests pass.
- Typecheck passes.

### Expanded Phase 6: Completion As Personalization Training Event

Objective: make completion the highest-value event in the product.

Product problem: completion currently gives a return plan, which is good. But 2026 VEX needs completion to update memory, lane confidence, unlock decisions, and next action.

Target files:

- `src/features/session-completion/service.ts`
- `src/features/session-completion/ledger-service.ts`
- `src/features/session-completion/post-session-next-action.ts`
- new helper: `completion-personalization.ts`
- relevant screen completion components

New completion pipeline:

1. Validate completion params.
2. Build completion ledger.
3. Resolve LaneProfile.
4. Build lane-specific completion display.
5. Ask one reflection question.
6. Generate memory candidates.
7. Recalculate unlock decisions.
8. Create next action.
9. Invalidate queries.
10. Navigate safely home/session next.

Reflection prompt matrix:

| Situation | Student Prompt | Game-like Prompt | Deep/Creative Prompt | Minimal Prompt |
|---|---|---|---|---|
| clean complete | "What made this study block work?" | "What kept the run clean?" | "What should VEX remember for next block?" | "Keep same setup next time?" |
| partial | "Was the task too big or unclear?" | "What debuff hit this run?" | "Where did flow break?" | "What made this hard?" |
| abandoned | "What pulled you away first?" | "What interrupted the encounter?" | "What broke the thread?" | "What got in the way?" |
| comeback | "What is the smallest next review?" | "How do we stabilize the run?" | "What is the re-entry point?" | "What is the next clean step?" |

Memory candidate examples:

- "User completes better with 15-minute study blocks."
- "User avoids creative sessions when no next move exists."
- "Game-like user engages with boss after 3 sessions."
- "Minimal user dismisses coach surfaces after completion."

Completion display rules:

- Student: show study progress, review queue, next block.
- Game-like: show run recap, boss impact, modifier earned, no currency.
- Deep/Creative: show project handoff and next move.
- Minimal: show clean result and next step.

Tests:

- first session completion per lane.
- partial completion per lane.
- abandoned session recovery.
- memory candidate generated.
- memory deletion respected.
- unlock decision produced but hidden systems stay hidden.
- next action safe if feature degraded.

Phase 6 exit gate:

- Completion never crashes with missing summary.
- Completion trains personalization.
- Tests pass.

### Expanded Phase 7: Modern Game-Like Experience

Objective: keep app fun for game-like users while deleting 2022 game economy.

Product problem: game-like users are real. Removing gamification entirely would weaken VEX. But coins/gems/shop/wagers/battle-pass mechanics make app feel dated and can damage trust.

Target feature:

`src/features/focus-run/` or under existing game/boss features if cleaner.

Core systems:

| System | Purpose | Must Not Do |
|---|---|---|
| Focus Run | Weekly identity loop for game-like users. | Must not require currency. |
| Personal Boss | Represents real blocker from memory. | Must not be random after enough evidence. |
| Modifiers | Behavioral constraints for sessions. | Must not be purchasable boosts. |
| Mastery | Long-term proof of focus skill. | Must not be grind-only XP. |
| Run Recap | Weekly story and next strategy. | Must not shame failure. |

Focus Run events:

- run started
- encounter completed
- rescue win
- clean start
- abandoned encounter
- reflection upgrade
- boss revealed
- run completed

Personal Boss creation rules:

| Evidence | Boss Archetype |
|---|---|
| frequent app exits / distraction reflection | Doomscroll Hydra |
| repeated late starts | Late Start Shade |
| many partials due unclear task | Fog of Unclear Work |
| project sessions abandoned at start | Perfectionism Wall |
| high context switching | Switch Swarm |
| deadline avoidance | Deadline Wraith |

Game-like UI rules:

- Fun but not childish.
- Use real focus language under game metaphor.
- No fake combat if session did not happen.
- No random rewards unrelated to behavior.
- No social pressure before opt-in.
- No global leaderboard in final release.

Tests:

- game-like lane starts run after allowed stage.
- personal boss requires evidence or cold-start generic tease.
- minimal lane never sees run board.
- student lane does not see boss unless opted in.
- run recap handles zero sessions.
- abandon produces recovery path.
- no currency fields in final display model.

Phase 7 exit gate:

- Game-like path feels complete without economy.
- Hidden old economy remains inert.
- Tests pass.

### Expanded Phase 8: Study OS Upgrade

Objective: make Student lane a serious 2026 study planner/focus app.

Product problem: student productivity competitors now advertise AI planning, deadline awareness, syllabus import, avoidance detection, smart reminders, weekly digest, and adaptive study blocks. VEX must compete through session execution + progressive unlock, not only planning.

Target areas:

- `src/features/content-study/`
- possible new `src/features/study-os/`
- session-start integration
- completion integration
- home Study OS surface

Study OS data model:

```ts
StudySource = {
  id: string;
  userId: string;
  type: 'paste' | 'file' | 'manual' | 'syllabus';
  title: string;
  extractedTextStatus: 'none' | 'pending' | 'ready' | 'failed';
  createdAt: number;
}

StudyBlock = {
  id: string;
  studyPlanId: string;
  title: string;
  objective: string;
  estimatedMinutes: number;
  priority: 'low' | 'medium' | 'high';
  status: 'not_started' | 'scheduled' | 'completed' | 'skipped';
}

ReviewItem = {
  id: string;
  studyPlanId: string;
  prompt: string;
  answerHint: string | null;
  confidence: 'unknown' | 'weak' | 'medium' | 'strong';
  dueAt: number | null;
}
```

Student flows:

1. Manual quick study block.
2. Paste notes -> extract concepts -> create blocks.
3. Add deadline -> compute risk.
4. Start study session from block.
5. Complete session -> generate review question.
6. Weekly report -> next study plan.

Failure states:

- extraction timeout -> offer manual study session.
- AI generation failed -> save source and retry later.
- offline -> local study block still startable.
- no deadline -> plan still valid.
- too much imported text -> ask user to choose section.

Tests:

- paste source creates study plan.
- failed generation returns fallback.
- study block starts session with context.
- completion updates review queue.
- deadline risk updates home surface.
- Student lane sees Study OS after unlock.
- non-student lane does not get Study OS primary unless behavior supports it.

Phase 8 exit gate:

- Student lane has full path from import to session to review.
- No raw fetch.
- Tests pass.

### Expanded Phase 9: Project Focus Path

Objective: make Deep/Creative lane sticky by preserving context.

Product problem: creative/deep work fails when user returns and cannot remember what to do next. VEX must become the place where project state survives between sessions.

Target feature:

`src/features/project-focus/`

Project Thread model:

- project title
- current objective
- last session summary
- next move
- open questions
- blocker
- best session mode
- last touched
- stale risk

Project states:

- new
- active
- stale
- blocked
- completed

Home behavior:

- active project shows next move.
- stale project shows re-entry session.
- blocked project shows rescue prompt.
- no project shows create project CTA.

Session setup behavior:

- title: resume current objective.
- success condition: one concrete project move.
- optional warmup: review last note.
- duration based on prior creative completion.

Completion behavior:

- ask "where did you leave off?"
- ask "next move?"
- update ProjectThread.
- create project continuity memory.

Tests:

- create project thread.
- start session from thread.
- complete session updates next move.
- stale project triggers re-entry.
- missing thread safe fallback.
- Minimal lane does not see project surface unless goal/behavior supports it.

Phase 9 exit gate:

- Creative user can close and reopen app without losing next move.
- Tests pass.

### Expanded Phase 10: Minimal Today System

Objective: make restraint feel like premium quality.

Product problem: some users churn when apps feel needy, cute, loud, or gamey. Minimal/Normal lane must not be a reduced version of the game lane. It must be a complete premium experience.

Target feature:

`src/features/today-system/` or inside home-experience if small.

Today Strip sections:

| Section | Meaning | Empty State |
|---|---|---|
| Now | one best current action | "Start one clean session." |
| Later | optional scheduled/recommended action | hidden if no useful action |
| Done | today's completed proof | "Nothing banked yet." |
| Recovery | small fallback if day is messy | "Do 5 minutes." |

Minimal copy rules:

- Maximum one sentence per card.
- No emoji unless design system already uses subtle icon.
- No "crush", "legendary", "boss", "run", "XP" by default.
- No full-width celebratory animation.
- No more than one CTA per surface.

Minimal notification rules:

- max 1/day by default.
- no streak risk push unless user opts in.
- no evening nudge after repeated dismissals.
- copy must be utility-first.

Tests:

- Minimal Day 0 shows start only.
- Minimal engaged shows Today Strip.
- Minimal completion quiet mode.
- Boss/challenge surfaces blocked.
- Reduced motion respected.
- Notification budget max 1.

Phase 10 exit gate:

- Minimal lane feels complete, not empty.
- Tests pass.

### Expanded Phase 11: Notification Policy And Rescue Mode

Objective: make interventions trustworthy and useful.

Product problem: notifications are one of the fastest ways to destroy trust. Rescue mode is one of the fastest ways to create daily value.

Target features:

- `src/features/notification-policy/`
- `src/features/rescue-mode/`

Nudge decision model:

```ts
NudgeDecision = {
  allowed: boolean;
  type: 'none' | 'gentle_return' | 'rescue' | 'study_deadline' | 'project_resume' | 'run_continue' | 'weekly_insight';
  title: string | null;
  body: string | null;
  scheduledFor: number | null;
  reason: string;
  lane: Lane;
  priority: 'low' | 'medium' | 'high';
  budgetRemaining: number;
}
```

Budget rules:

- Day 0: no unsolicited notification.
- Minimal: max 1/day.
- Student: max 2/day, deadline-aware.
- Game-like: max 2/day, run-aware, not spammy.
- Deep/Creative: max 2/day, project-window-aware.
- User mute always wins.
- Quiet hours always win unless user manually scheduled.

Rescue mode model:

```ts
RescuePlan = {
  id: string;
  userId: string;
  lane: Lane;
  reason: 'too_big' | 'tired' | 'distracted' | 'anxious' | 'unclear' | 'no_time';
  durationSeconds: number;
  sessionMode: SessionMode;
  taskDescription: string;
  frictionLevel: 'none' | 'soft' | 'medium';
  createdAt: number;
}
```

Rescue UI requirements:

- One screen or modal max.
- One question.
- 5-12 minute default.
- Start button immediately visible.
- Offline works.
- Completion asks one reflection.

Tests:

- Day 0 no notification.
- max/day enforced.
- dismissal lowers priority.
- quiet hours block.
- rescue creates valid session.
- rescue works for all lanes.
- rescue completion writes memory candidate.

Phase 11 exit gate:

- Notification policy tests pass.
- Rescue flow tests pass.
- No spam paths.

### Expanded Phase 12: Premium Strategy And Monetization Integrity

Objective: monetize the future version without corrupting product trust.

Product problem: AI subscriptions can convert, but users churn when AI feels shallow or paywalls feel exploitative. VEX must monetize durable intelligence, not artificial pressure.

Premium value by lane:

| Lane | Premium Value |
|---|---|
| Student | deeper imports, deadline intelligence, weekly study plan, advanced review queue. |
| Game-like | deeper run history, personal boss arcs, advanced modifiers, run recap archive. |
| Deep/Creative | more project threads, deeper continuity memory, flow reports, project recovery. |
| Minimal/Normal | calendar intelligence, memory console, weekly clean planning, advanced quiet automation. |

Free must include:

- first session
- basic lane personalization
- basic progressive unlock
- basic memory
- rescue mode
- basic progress

Premium must not include:

- pay-to-save streak
- streak insurance
- gems
- coins
- shop power
- paid boss damage
- paid recovery from failure
- manipulative deadline panic

Paywall trigger rules:

- Never hard paywall Day 0.
- Never show if RevenueCat unavailable/unhealthy.
- Prefer after user sees a useful pattern.
- Prefer after user attempts premium-depth action.
- Always show dismiss.
- Track dismissals and suppress repeated attempts.

Tests:

- premium hidden Day 0.
- premium hidden when billing unhealthy.
- premium soft tease after eligible stage.
- premium attempt recorded.
- repeated dismissal suppresses.
- no forbidden monetization copy.

Phase 12 exit gate:

- Premium tests pass.
- Monetization copy aligns with lane value.
- No old economy monetization leaks.

### Expanded Phase 13: Cross-Lane Polish And Design System Integration

Objective: make lane personalization feel designed, not bolted on.

Target:

- lane copy maps
- lane icon strategy
- lane animation policy
- lane surface density policy
- lane empty/error/loading states

Lane presentation rules:

| Lane | Density | Animation | Copy | Visual Feeling |
|---|---|---|---|---|
| Student | medium | low-medium | precise, supportive | organized academic command center |
| Game-like | medium-high | medium-high if reduced motion false | strategic, energetic | focused roguelite overlay |
| Deep/Creative | medium | low-medium | reflective, continuity-focused | studio/workbench |
| Minimal/Normal | low | minimal | concise, factual | quiet planner |

Required UI states for every new data surface:

- loading skeleton matching layout.
- error state with retry.
- empty state with one CTA.
- offline banner/fallback.
- success.
- degraded state if feature unhealthy.

Tests:

- reduced motion disables heavy animations.
- accessibility labels/hints/roles.
- text fits on small screens.
- hidden states do not flash loading skeletons for hidden features.

Phase 13 exit gate:

- UI tests/snapshots where practical.
- Manual visual smoke for all lanes.

### Expanded Phase 14: Full Journey Hardening

Objective: prove VEX works as an everyday app, not a pile of features.

Full journey tests:

| Journey | Required Path |
|---|---|
| Student first week | onboarding -> first study session -> completion -> progress proof -> Study OS unlock -> import -> study session -> review. |
| Game-like first week | onboarding -> first run -> completion -> boss tease -> run board -> personal boss -> run recap. |
| Deep/Creative first week | onboarding -> project block -> completion handoff -> project thread -> resume -> weekly flow insight. |
| Minimal first week | onboarding -> clean session -> quiet completion -> Today Strip -> weekly clean summary. |
| Comeback | miss day -> comeback message -> rescue/short session -> completion -> return plan. |
| Offline | offline start -> offline complete -> local state -> reconnect sync -> no duplicate rewards. |
| Hidden features | hidden shop/inventory/wagers/social never render/query/route/notify. |

Hardening tasks:

1. Fix all TypeScript errors.
2. Fix lint errors in touched files.
3. Remove dead copy and stale tests that assert old product framing.
4. Add missing route guards.
5. Add query `enabled` guards.
6. Add safe fallbacks.
7. Run focused tests.
8. Run full typecheck.
9. Run full test suite if feasible.
10. Run app smoke path if feasible.

Phase 14 exit gate:

- Critical journeys pass.
- No known hidden feature leaks.
- No broken navigation path.
- No fake/stubbed launch path.
