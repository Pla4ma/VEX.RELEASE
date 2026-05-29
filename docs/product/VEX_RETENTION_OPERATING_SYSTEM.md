# VEX Retention Operating System

Date: 2026-05-28
Source of truth: `src/features/retention-loop/`, `src/features/notification-policy/`, `src/features/memory-candidate/`, `src/features/rescue-mode/`, `src/features/weekly-intelligence/`, `src/shared/analytics/retention-analytics.ts`

---

## 1. Retention Thesis

**VEX is the productivity app that changes based on how you work.**

VEX wins if users return because the app becomes more useful with each completed, rescued, or reflected session. AI novelty creates curiosity, but not retention. VEX must prove durable value through memory, next actions, weekly intelligence, and recovery from drift.

### Core Retention Loop

```
Start session → complete or rescue → reflect once → VEX learns → next action becomes sharper → user returns tomorrow
```

### The Big Risk

AI novelty creates curiosity, but not retention. VEX must prove durable value through:

**What creates durable value:**
- **Memory**: VEX remembers session patterns and reflects them back at Day 3
- **Next Actions**: Each completion produces a mode-specific return hook
- **Weekly Intelligence**: Day 7 shows a structured week summary with actionable adjustments
- **Recovery from Drift**: Rescue mode catches users before full abandonment

**What does NOT create durable value:**
- Streak pressure
- Generic daily missions
- Economy rewards
- Premium before value proof
- Fake AI insights
- Social pressure

---

## 2. Day 0–Day 7 Journey (The First-Week Product Magic Pass)

Implemented in: `src/features/retention-loop/service.ts` (`computeJourneyState()`), `src/features/personalization/first-week-service.ts`

| Day | Phase | Emotional Goal | Home Message Tone | Premium | Nudge |
|-----|-------|---------------|-------------------|---------|-------|
| 0 | onboarding | I am ready to start — VEX matches me | warm | None | None — Day 0 no unsolicited |
| 1 | return | VEX remembers me. I am not starting over | direct | None | gentle_return (afternoon check-in) |
| 2 | proof | I see evidence. This is working | direct | None | proof_nudge |
| 3 | insight | VEX actually learned something real | humble | None — too early | memory_nudge |
| 4 | rescue | Even a small session counts. VEX has my back | encouraging | None | rescue if friction detected |
| 5 | lane_forming | This mode is starting to feel personal | directing | Soft tease only | gentle_return |
| 6 | weekly_prep | Something big is coming. One more session | ready | Soft tease: "Deeper insight coming" | gentle_return |
| 7 | weekly_intelligence | VEX understood me. Tomorrow will be easier | proof | Weekly value moment | weekly_insight |

### Mode-Specific Day 0 Surface Map

Enforced in: `src/features/retention-loop/retention-guards.ts`

**Maximum 5 visible surfaces on Day 0:**
1. Greeting / adaptive promise (mode-aligned welcome)
2. Mode chip (Study/Run/Project/Clean)
3. Start first session CTA (single, no competing buttons)
4. Tiny mode preview (2-3 line visual)
5. Coach line (single humble message)

**Blocked Day 0:** premium, full boards, boss, economy, analytics, memory console, challenge board.

---

## 3. Retention Event Map

Implemented as 18 tracked retention events in: `src/features/retention-loop/analytics.ts`

### 3.1 — Onboarding Funnel Events

| # | Event Name | Trigger | Properties | Sensitive? | Product Question | VEX Action |
|---|-----------|---------|------------|------------|------------------|------------|
| 1 | `onboarding_started` | User begins onboarding flow | `userId` | No | How many users start onboarding? | Baseline cohort marker |
| 2 | `mode_recommended` | Lane engine produces recomme-ndation | `userId, lane, confidence` | No | What mode does VEX recommend most? | Measure recommendation confidence |
| 3 | `mode_accepted` | User confirms recommended mode | `userId, lane` | No | Do users accept VEX's recommendation? | If low → improve recommendation explanation |
| 4 | `mode_changed` | User manually changes mode after recommendation | `userId, fromLane, toLane` | No | Do users override mode recs? On what day? | If early → improve matching. If late → user needs may have changed |

### 3.2 — Session Lifecycle Events

| # | Event Name | Trigger | Properties | Sensitive? | Product Question | VEX Action |
|---|-----------|---------|------------|------------|------------------|------------|
| 5 | `first_session_started` | User starts their first session | `userId, lane` | No | What % of onboarded users start a session? | Critical activation gate |
| 6 | `first_session_completed` | User completes their first session | `userId, lane, durationSeconds` | No (duration only, not content) | Do users finish what they start? | If <45%, reduce first-session duration |
| 7 | `session_abandoned` | Session started but not completed within timeout | `userId, lane, elapsedSeconds` | No | Where do users drop mid-session? | Trigger rescue eligibility check |
| 8 | `completion_reflection_saved` | User saves post-session reflection | `userId, reflectionLength` | **YES** — do NOT track reflection text content | Do users reflect on completed sessions? | Build memory candidate pool; higher length = deeper reflection |

### 3.3 — Memory & Insight Events

| # | Event Name | Trigger | Properties | Sensitive? | Product Question | VEX Action |
|---|-----------|---------|------------|------------|------------------|------------|
| 9 | `memory_candidate_created` | System generates a memory from session data | `userId, confidence, sourceType` | **YES** — do NOT store observation content in analytics | How frequently is VEX generating learnings? | Frequency should scale with session volume |
| 10 | `memory_insight_viewed` | User views "What VEX Learned" card | `userId, itemCount` | No | Do users engage with VEX's learnings? | Low view rate → improve Day 3 surface visibility |
| 11 | `memory_hidden_or_deleted` | User hides or deletes an insight | `userId, itemId, action: "hidden" \| "deleted"` | No | Which insights do users reject? Reduce confidence on similar future insights | Do NOT regenerate from same evidence; reduce that observation type's confidence |

### 3.4 — Rescue Funnel Events

| # | Event Name | Trigger | Properties | Sensitive? | Product Question | VEX Action |
|---|-----------|---------|------------|------------|------------------|------------|
| 12 | `rescue_offered` | Rescue eligibility triggered | `userId, lane, trigger` | No | What signals (inactivity, abandonment, dismissal) trigger rescue most? | Measure trigger → start conversion per signal type |
| 13 | `rescue_started` | User accepts rescue | `userId, planId, reason` | No | What rescue reasons convert best? | Optimize rescue copy per reason |
| 14 | `rescue_completed` | User finishes rescue session | `userId, planId, outcome, durationSeconds` | No | Do rescues actually complete? | Completion rate <20% → rescue session is too long or copy fails |

### 3.5 — Notification & Nudge Events

| # | Event Name | Trigger | Properties | Sensitive? | Product Question | VEX Action |
|---|-----------|---------|------------|------------|------------------|------------|
| 15 | `nudge_sent` | System schedules/dispatches a nudge | `userId, nudgeType, lane, channel` | No | How many nudges are sent per user per day? | Should match policy limits |
| 16 | `nudge_opened` | User taps notification and opens app | `userId, nudgeType, lane` | No | Which nudge types drive app opens? | Boost high-conversion types; deprecate low |
| 17 | `nudge_dismissed` | User dismisses notification | `userId, nudgeType, lane` | No | Which nudge types annoy users? | ≥2 consecutive dismissals → pause that nudge category |

### 3.6 — Day Milestone Events

| # | Event Name | Trigger | Properties | Sensitive? | Product Question | VEX Action |
|---|-----------|---------|------------|------------|------------------|------------|
| 18 | `day1_returned` | User returns 24h+ after onboarding | `userId, lane` | No | What % return on Day 1? | If <25%, investigate Day 0 completion → Day 1 message gap |
| 19 | `day3_memory_seen` | User views Day 3 "What VEX Learned" | `userId, itemCount` | No | Do eligible users engage with memory moment? | If <40%, memory insight isn't landing; improve card design or copy |
| 20 | `day7_weekly_insight_seen` | User views first weekly intelligence | `userId, lane, itemCount` | No | Do users reach and engage with Day 7 intelligence? | This is the first major "wow" moment; if <12%, 7-day journey is too long or boring |

### 3.7 — Monetization-Adjacent Events

| # | Event Name | Trigger | Properties | Sensitive? | Product Question | VEX Action |
|---|-----------|---------|------------|------------|------------------|------------|
| 21 | `premium_action_tapped` | User taps a premium-gated feature | `userId, action, lane` | No | What premium features do users want most? | Prioritize feature development; use for paywall timing |
| 22 | `paywall_viewed` | Paywall screen is shown to user | `userId, context, lane` | No | At what point do users see paywall? | If before value → bad timing. After weekly intelligence → correct timing |
| 23 | `subscription_started` | User completes subscription purchase | `userId, productId, lane` | No | What % convert? Which lane converts highest? | Segment conversion by lane, daysSinceOnboarding, value seen |

### Event Coverage: Existing vs. Needed

**Already tracked** (in `src/features/retention-loop/analytics.ts`):
- `onboarding_started`, `mode_recommended`, `mode_accepted`, `mode_changed`
- `first_session_started`, `first_session_completed`
- `completion_reflection_saved`
- `memory_insight_viewed`, `memory_hidden_or_deleted`
- `rescue_offered`, `rescue_started`, `rescue_completed`
- `day1_returned`, `day3_memory_seen`, `day7_weekly_insight_seen`
- `premium_action_tapped`, `paywall_viewed`, `subscription_started`

**Partially tracked** (exists in other modules):
- `memory_candidate_created` — needs explicit tracking in `src/features/memory-candidate/`
- `nudge_sent`, `nudge_opened`, `nudge_dismissed` — exists in `src/features/notification-policy/analytics.ts` via `trackNotificationPolicyEvent` / `trackNudgeSignal`

**Not yet tracked** (gap):
- `session_abandoned` — needs to be wired from session engine

---

## 4. Retention Health Metrics (Dashboard Spec)

### 4.1 — Activation Funnel

| Metric | Calculation | Source | Strong Target | What Low Means |
|--------|------------|--------|---------------|----------------|
| Onboarding completion rate | completed / started | `onboarding_started` → final step | >70% | Onboarding too long, confusing, or asking too much |
| Mode acceptance rate | `mode_accepted` / `mode_recommended` | Tracked | >60% | Recommendation engine mismatches; users don't trust VEX yet |
| First session start rate | `first_session_started` / onboarded users | Tracked | >60% | CTA unclear, mode preview unconvincing, or session feels too big |
| First session completion rate | `first_session_completed` / `first_session_started` | Tracked | >45% | Session too long, wrong mode, or task selection confusing |

### 4.2 — Early Retention (First 7 Days)

| Metric | Calculation | Source | Strong Target |
|--------|------------|--------|---------------|
| Day 1 return rate | Day 1 active / Day 0 completed | `day1_returned` | >25% |
| Day 2 session rate | Day 2 session / Day 0 cohort | Session tracking | >20% |
| Day 3 memory moment view rate | `day3_memory_seen` / eligible users | Tracked (eligible: ≥3 sessions) | >40% |
| Day 4 rescue offer → start rate | `rescue_started` / `rescue_offered` | Tracked | >20% |
| Day 7 weekly insight view rate | `day7_weekly_insight_seen` / eligible users | Tracked (eligible: ≥5 sessions) | >12% |

### 4.3 — Quality Signals

| Metric | Calculation | Source | Strong Target |
|--------|------------|--------|---------------|
| Reflection save rate | `completion_reflection_saved` / completed sessions | Tracked | >30% |
| Next action start rate | sessions from next-action CTA / next-action offers | To wire | >35% |
| Rescue completion rate | `rescue_completed` / `rescue_started` | Tracked | >40% |
| Memory hide/delete rate | `memory_hidden_or_deleted` / `memory_insight_viewed` | Tracked | <20% (higher = insights are wrong) |
| Nudge dismissal rate | `nudge_dismissed` / `nudge_sent` | notification-policy analytics | <30% |
| Session abandon rate | abandoned / started | Needs `session_abandoned` event | <25% |

### 4.4 — Monetization-Adjacent

| Metric | Calculation | Source | Strong Target |
|--------|------------|--------|---------------|
| Premium action taps / active user | `premium_action_tapped` / DAU | Tracked | Signal, no target — what features have demand? |
| Paywall view after value proof | Paywall shown after Day 7 insight / total paywall views | Tracked | >80% (want paywall after value, not before) |
| Trial start rate | `subscription_started` / `paywall_viewed` | Tracked | Early: 3-5% |
| Premium conversion by mode | `subscription_started` segmented by lane | Tracked | Measure, don't target — study whether some modes convert higher |

### 4.5 — Trust Signals (Watch for Erosion)

| Metric | Calculation | Source | Concerning |
|--------|------------|--------|------------|
| Memory deletion rate | Deleted / total memory candidates | memory-candidate service | If high early → insights are wrong or creepy |
| Skipped coach messages | Skipped / coach messages shown | ai-coach analytics | <15% is healthy; >30% means coach is annoying |
| Mode changed after recommendation | `mode_changed` / `mode_accepted` on Day 0 | Tracked | >30% means recommendation failed |
| Notification opt-out rate | Opt-outs / users who received ≥1 nudge | notification-policy | >10% indicates notification fatigue |

### 4.6 — Mode-Specific Retention

| Metric | Calculation | Source |
|--------|------------|--------|
| Study return rate | Day 1+ session rate for `student` lane | Tracked (lane parameter on events) |
| Run return rate | Day 1+ session rate for `game_like` lane | Tracked |
| Project return rate | Day 1+ session rate for `deep_creative` lane | Tracked |
| Clean return rate | Day 1+ session rate for `minimal_normal` lane | Tracked |

---

## 5. Churn Risk Model

### High-Risk Signals & Product Responses

#### Signal 1: User completes onboarding but does not start first session

- **Risk level**: CRITICAL
- **Likely emotion**: Hesitation, overwhelmed, unclear what session means
- **Product response**: Show "5 minutes is enough" message. Highlight mode-specific preview. Offer coach line: "Want a tiny start?"
- **What NOT to do**: Do NOT push premium. Do NOT show streak goals. Do NOT pressure.

#### Signal 2: User starts first session but abandons

- **Risk level**: HIGH
- **Likely emotion**: Session felt too long, wrong mode, or task was unclear
- **Product response**: After abandonment, offer a shorter session (5-8 min) in same or simplified mode. Show: "Need a tiny start?"
- **What NOT to do**: Do NOT shame. Do NOT ask "why did you stop?" accusatorily.

#### Signal 3: User completes first session but does not return Day 1

- **Risk level**: HIGH
- **Likely emotion**: No reason to return, no anticipation built
- **Product response**: Gentle return notification with mode-specific copy (see notification policy). VEX should have set a "return tomorrow" hook at completion.
- **What NOT to do**: Do NOT send a generic "come back" message. Must reference lane and be mode-specific.

#### Signal 4: User opens app 2+ times without starting a session

- **Risk level**: HIGH
- **Likely emotion**: Avoidance, unclear next action, session feels too big
- **Product response**: Offer rescue: "Need a tiny start?" with reduced session duration. Surface the simplest possible CTA.
- **What NOT to do**: Do NOT send streak pressure or premium offers. User is struggling, not lazy.

#### Signal 5: User dismisses nudges 2+ times consecutively

- **Risk level**: MEDIUM
- **Likely emotion**: Annoyance, notification fatigue
- **Product response**: Pause that nudge category. Ask timing preference later. Switch to quiet mode.
- **What NOT to do**: Do NOT increase nudge frequency. Do NOT switch channels unless user prefers it.

#### Signal 6: User hides memory insight

- **Risk level**: MEDIUM
- **Likely emotion**: Insight felt wrong, invasive, or useless
- **Product response**: Reduce confidence threshold for that observation type. Ask: "What kind of help would be more useful?" Do NOT regenerate from same evidence.
- **What NOT to do**: Do NOT show the same insight again. Do NOT dismiss the action without learning.

#### Signal 7: User changes mode immediately after recommendation

- **Risk level**: LOW-MEDIUM
- **Likely emotion**: VEX's recommendation didn't match self-perception
- **Product response**: Offer mode switch without shame. Phrase: "Not Study? Try Clean." Track to improve recommendation accuracy.
- **What NOT to do**: Do NOT lock them into the recommended mode. Do NOT ask "are you sure?" multiple times.

#### Signal 8: User sees paywall before completing Day 7 weekly insight

- **Risk level**: MEDIUM
- **Likely emotion**: Rushed into monetization before value proof
- **Product response**: Ensure `shouldShowPremiumAfterValue()` guard runs. Only show paywall after `hasSeenWeeklyInsight === true`.
- **What NOT to do**: Do NOT show premium before Day 7 value moment. Do NOT guilt users into subscribing.

#### Signal 9: User misses Day 3 memory moment

- **Risk level**: MEDIUM
- **Likely emotion**: Didn't return; no trust built yet
- **Product response**: When user returns, still show memory moment if ≥3 sessions completed. Don't skip it.
- **What NOT to do**: Do NOT skip to Day 7. Memory moment IS the trust-building step.

#### Signal 10: User misses Day 7 weekly insight

- **Risk level**: HIGH
- **Likely emotion**: Lost engagement; weekly intelligence is the first "wow" moment
- **Product response**: When user returns on Day 8+, still surface the weekly intelligence as "Your first weekly intelligence is ready."
- **What NOT to do**: Do NOT skip the intelligence and start Week 2. The intelligence IS the retention hook.

---

## 6. Retention Recovery Playbooks

### Playbook 1: Onboarding completed, no first session

**Trigger**: `onboarding_started` → no `first_session_started` within 2 hours
**Response copy**: "Start with 5 clean minutes."
**Action**: Show home screen with minimal CTA, session suggestion reduced to 5-8 min, coach line: "No pressure. A tiny start counts."
**Mode**: Match recommended mode, but offer Clean as fallback.

### Playbook 2: First session abandoned

**Trigger**: `first_session_started` without `first_session_completed`
**Response copy**: "Need a tiny start?"
**Action**: Offer rescue with half the original duration. Surface the next time user opens app.
**Mode**: Same mode, shorter duration.

### Playbook 3: No Day 1 return

**Trigger**: No session 24h+ after Day 0 completion
**Response copy** (mode-specific):
- Study: "Your next study block is small: one review target."
- Run: "Recovery encounter ready: 10 clean minutes."
- Project: "Your project thread is waiting at the next move."
- Clean: "One clean block is enough today."
**Action**: Send gentle_return notification (max 1/day for this trigger). Do not reference "streak."

### Playbook 4: Memory insight hidden

**Trigger**: `memory_hidden_or_deleted`
**Response**: Reduce confidence for that observation type by 50%. Add breadcrumb to user's preference model. Do NOT regenerate from same evidence. Ask: "Want VEX to learn differently?" only once, max.
**What NOT to do**: Do NOT re-show the insight. Do NOT explain why it was "actually correct."

### Playbook 5: Repeated nudge dismissal

**Trigger**: `nudge_dismissed` ≥2 consecutive
**Response**: Pause the dismissed nudge category for 7 days. Surface timing preference question in-app (not via notification). Switch to quiet mode: notificationPolicy.maxPerDay reduced by 1.
**What NOT to do**: Do NOT switch to email/push as "alternative." User said stop.

### Playbook 6: Mode mismatch

**Trigger**: `mode_changed` within 24h of `mode_accepted`
**Response**: Offer mode switch without shame. Copy: "Not Study? Try Clean." Update lane recommendation model with new preference. Do not revisit recommendation unless user explicitly asks.
**What NOT to do**: Do NOT make the user "justify" their switch. Do NOT lock features behind a specific mode.

### Playbook 7: Premium closed (paywall dismissed)

**Trigger**: `paywall_viewed` without `subscription_started`
**Response**: Do NOT re-show paywall for 7 days. After 7 days, re-evaluate: has user seen weekly intelligence? Has user triggered another premium action? If yes to both → eligible for paywall again. If not → wait another 7 days.
**What NOT to do**: Do NOT show paywall on next app open. Do NOT use discount urgency unless legitimate.

### Playbook 8: Project stale (no project session for 5+ days)

**Trigger**: `lane = deep_creative` + inactivityDays ≥5
**Response**: Lost-thread rescue. "Your project thread is waiting at the next move." Offer 5-min re-entry session. Save the thread — no data loss.
**What NOT to do**: Do NOT start a new project. Do NOT mark the project as "complete."

### Playbook 9: Study user behind (no study session for 4+ days)

**Trigger**: `lane = student` + inactivityDays ≥4
**Response**: Small review rescue. "One review target is enough." Session: 8-min review of last topic. No grade panic unless user explicitly supplied grade/deadline context.
**What NOT to do**: Do NOT reference deadlines unless user set them. Do NOT use "falling behind" language.

### Playbook 10: Run user loses momentum (no run session for 3+ days)

**Trigger**: `lane = game_like` + inactivityDays ≥3
**Response**: Recovery encounter. "Recovery encounter ready: 10 clean minutes." No economy rewards. Movement, not progress.
**What NOT to do**: Do NOT reset progress. Do NOT offer combat encounters. Keep it clean.

---

## 7. Notification Retention Policy

Implemented in: `src/features/notification-policy/`

### Core Rules (Non-Negotiable)

| # | Rule | Rationale |
|---|------|-----------|
| 0 | Day 0: no unsolicited notifications | First session must be self-initiated |
| 1 | Clean mode: max 1 notification/day initially | Clean users value quiet |
| 2 | Normal users: max 2 notifications/day | Measured presence, not spam |
| 3 | Dismissal reduces priority for that nudge type | Respect user preference |
| 4 | Repeated dismissal (≥2 same category) pauses that category | User signaled "stop this" |
| 5 | Quiet hours respected (user-configured) | No notification during set quiet window |
| 6 | Opt-out wins over all other rules | User control is absolute |
| 7 | No streak panic language | No "You'll lose your streak!" |
| 8 | No fake urgency | No "Only today!" or "Don't miss out!" |
| 9 | No premium-first notification | Premium only mentioned after value proof |

### Notification Types & Triggers

| Type | Trigger | Max Frequency | Mode-Specific Copy |
|------|---------|---------------|-------------------|
| **gentle_return** | No session 24h after completion | 1/day | Study: "Your next study block is small: one review target." / Run: "Recovery encounter ready: 10 clean minutes." / Project: "Your project thread is waiting at the next move." / Clean: "One clean block is enough today." |
| **next_action_reminder** | Next action set but not started within 4h | 1/day | Based on previously set next action |
| **rescue_offer** | Friction signal detected (abandonment, opens without start, ≥1 inactivity day) | 1/day | "Need a tiny start?" with reduced session duration |
| **memory_insight_available** | Day 3+ AND ≥3 completed sessions AND insight not yet seen | 1 total | "VEX learned something about your [study/run/project] rhythm." |
| **weekly_intelligence_ready** | Day 7+ AND ≥5 completed sessions AND intelligence not yet seen | 1 total | "Your first weekly intelligence is here." |
| **premium_deeper_insight** | After weekly intelligence seen AND user tapped premium action | 1/week | "Go deeper with [Study Intelligence/Run Board/Project Focus Path/Weekly Intelligence]." |

### Mode-Specific Notification Copy

**Study:**
- Gentle return: "Your next study block is small: one review target."
- Memory: "VEX noticed something about how you study."

**Run:**
- Gentle return: "Recovery encounter ready: 10 clean minutes."
- Memory: "VEX noticed something about your run pattern."

**Project:**
- Gentle return: "Your project thread is waiting at the next move."
- Memory: "VEX noticed something about your deep work flow."

**Clean:**
- Gentle return: "One clean block is enough today."
- Memory: "VEX noticed something about your rhythm."

---

## 8. Retention Experiment Backlog

### Experiment Design Rules

- No dark patterns
- No fake urgency
- No premium pressure experiments before value proof
- No testing shame/guilt copy
- No sensitive content in analytics
- All experiments must be killable with zero user impact
- Success metric = retention improvement, not conversion short-term

### Active Experiments

#### Experiment 1: Day 0 Completion CTA
- **Test**: Post-first-session completion message
  - **A (control)**: "Set tomorrow's next action"
  - **B (variant)**: "Return tomorrow with this" (no action setting required)
- **Metric**: Day 1 return rate
- **Why**: Does asking users to set a next action create friction, or does it build anticipation?
- **Safety**: Neither variant pressures. Both are positive.

#### Experiment 2: Day 3 Memory Framing
- **Test**: "What VEX Learned" card headline
  - **A (control)**: "What VEX learned"
  - **B (variant)**: "What helped you start"
- **Metric**: `memory_insight_viewed` rate, `memory_hidden_or_deleted` rate
- **Why**: Is "what VEX learned" perceived as invasive? Does "what helped you" feel more empowering?
- **Safety**: If hide rate increases on B, A is safe baseline.

#### Experiment 3: Rescue CTA
- **Test**: Rescue offer button text
  - **A (control)**: "Need a tiny start?"
  - **B (variant)**: "Make it smaller"
- **Metric**: `rescue_started` / `rescue_offered`
- **Why**: Does "tiny start" feel patronizing? Does "make it smaller" give user more agency?
- **Safety**: Both are low-pressure. Neither shames.

#### Experiment 4: Day 7 Weekly Intelligence Headline
- **Test**: Weekly intelligence title
  - **A (control)**: "Your first weekly intelligence"
  - **B (variant)**: "Your rhythm this week"
- **Metric**: `day7_weekly_insight_seen` rate, time on screen
- **Why**: "Intelligence" might sound corporate/clinical. "Rhythm" may feel more personal.
- **Safety**: Both are positive framing.

#### Experiment 5: Mode Recommendation Copy
- **Test**: Mode recommendation language
  - **A (control)**: "VEX thinks Study Mode fits you best"
  - **B (variant)**: "Based on your answers, start with Study Mode"
- **Metric**: `mode_accepted` rate
- **Why**: Is "VEX thinks" perceived as AI overreach vs. "Based on your answers" which feels transparent?
- **Safety**: Both give user final choice.

#### Experiment 6: Clean Mode Nudge Timing
- **Test**: Clean mode gentle_return notification timing
  - **A (control)**: Morning (8am user local)
  - **B (variant)**: User's last successful session time window
- **Metric**: Session start rate after Clean gentle_return
- **Why**: Clean users are minimal. Does matching their rhythm time work better than a fixed schedule?
- **Safety**: Only 1 nudge/day for Clean mode. No override if user opted out.

### Backlog (Prioritized)

1. **Day 1 return copy** — Test "VEX remembers" vs. "Continue where you left off"
2. **Session suggestion length** — Test 15-min vs. 10-min first session suggestion
3. **Rescue timing** — Test rescue offer after 1 day inactivity vs. 2 days
4. **Weekly insight detail level** — Test 3-section vs. 6-section intelligence
5. **Memory confidence display** — Test showing confidence level vs. hiding it

---

## 9. Soft-Launch Retention Review Ritual

### Daily Review (Every Morning During Soft Launch)

| Check | Metric Source | Action if Concern |
|-------|--------------|-------------------|
| First session starts today | `first_session_started` count | If low → check: is onboarding completing? Is home screen showing CTA? |
| First session completions today | `first_session_completed` count | If low vs. starts → sessions too long or wrong mode |
| Crashes/blockers | Sentry error rate | If spike → pause launch, fix critical path |
| Onboarding dropoff | Onboarding step completion funnel | Identify exact step where users drop |
| No-session users (24h post-onboarding) | Users with `onboarding_started` but no `first_session_started` | Trigger Playbook 1 |
| Notification opt-outs | Notification settings toggle rate | If >5% → notifications are too frequent or mis-timed |
| Top mode selected | Mode distribution from `mode_accepted` | Does distribution match expectation? |
| User feedback | Support tickets, app store reviews, feedback forms | Categorize: blocker, confusion, feature request |

### Every 3 Days

| Check | Metric Source | Action if Concern |
|-------|--------------|-------------------|
| Day 1 return rate | `day1_returned` / Day 0 completions | If <25% → Day 0→1 transition is broken |
| Day 3 memory engagement | `day3_memory_seen` / Day 3+ users | If <40% → surface visibility or copy is wrong |
| Rescue usage | `rescue_offered`, `rescue_started`, `rescue_completed` funnel | If offered but not started → rescue copy fails. If started but not completed → rescue too long |
| Memory hide/delete | `memory_hidden_or_deleted` count | If >20% of viewers → insights are wrong/creepy |
| Mode switch rate | `mode_changed` / `mode_accepted` | If >30% → recommendation engine failing |

### Every 7 Days

| Check | Metric Source | Action if Concern |
|-------|--------------|-------------------|
| Day 7 retention | `day7_weekly_insight_seen` / Day 7+ users | If <12% → 7-day journey has friction or feels too long |
| Weekly intelligence engagement | Time on screen, sections viewed | If low engagement → intelligence structure needs redesign |
| Premium action taps | `premium_action_tapped` distribution | What do users want? Prioritize those features |
| Paywall conversion | `subscription_started` / `paywall_viewed` | If <3% → paywall at wrong time or not enough value shown |
| Most common churn point | Day-by-day retention drop analysis | Which specific day has the biggest drop? Focus resources there |
| Top confusion point | Support tickets + coach dismissal pattern | Is there a feature users consistently don't understand? |

### Soft-Launch Decision Rules

| Metric State | Meaning | Action |
|-------------|---------|--------|
| First session start >60%, completion >45%, Day 1 >25% | **Keep going** — activation pipeline is healthy | Proceed with launch. Monitor for erosion. |
| First session start >60% but completion <30% | **Fix completion** — users start but don't finish | Reduce session duration. Improve in-session UX. Check mode fit. |
| Onboarding dropoff >30% | **Fix onboarding** — losing users before they see value | Simplify onboarding steps. Reduce questions. Show preview of value earlier. |
| Day 1 <15% | **Pause marketing** — don't acquire users into a leaky funnel | Fix Day 0→1 transition before acquiring more users. Day 0 completion payoff must hook return. |
| Paywall before Day 7 for >20% of paywall views | **Fix premium timing** — showing paywall before value proof | Enforce `shouldShowPremiumAfterValue()` guard. Audit all paywall surfaces. |

---

## 10. Banned Retention Anti-Patterns

### Banned (Never Use)

| Anti-Pattern | Why It's Banned | Replacement |
|-------------|-----------------|-------------|
| **Streak guilt** ("You'll lose your 3-day streak!") | Creates anxiety, not habit. Users return from shame, not value. | Next action: "Your next study block is ready." |
| **Fake urgency** ("Only today!" / "Don't miss out!") | Manipulative. Erodes trust when urgency is fabricated. | Real value timing: "Your weekly intelligence is ready." |
| **Generic daily missions** ("Complete 3 tasks today!") | Doesn't adapt to user. No personalization. No mode awareness. | Personalized next action based on mode and session history. |
| **Spam notifications** | Fastest path to opt-out. Destroys notification channel for all users. | Respect notification policy. Max 2/day normal. Max 1/day Clean. |
| **Push premium before value** | Converts some but loses most. Users who haven't seen value won't pay — they'll uninstall. | Only after weekly intelligence (Day 7+) and user has seen value proof. |
| **Fake AI insight** (generic observation posed as personalized) | Users detect generic praise. "You're making great progress!" without data = broken trust. | Low-confidence fallback: "VEX is still learning." Honest. |
| **Overcomplicated Day 0** | First session should be dead simple. 5 surfaces max. | Day 0 surface enforcement in retention-guards.ts. |
| **Social pressure** ("Your friends are studying more!") | VEX has no social features. This would be fabricated. | Intrinsic motivation: mode-specific return hooks. |
| **Old economy rewards** ("Come back to claim your coins!") | Economy system disabled. Rewards are not VEX's retention mechanism. | Value-driven return: memory, next action, weekly intelligence. |
| **"Come back to claim reward"** | Makes app about rewards, not about doing better work. | "VEX remembered this." Not reward, but continuity. |
| **Hiding mode switch** | Users must feel free to switch modes. Locking creates resentment. | "Not Study? Try Clean." — low-friction, no shame switch offer. |
| **Making rescue feel like failure** | Rescue must feel like a smart choice, not a bailout. | "Need a tiny start?" — resizing, not failing. |
| **Making memory feel creepy** ("VEX knows you study poorly on Tuesdays") | Too specific. Feels like surveillance. | Humble: "VEX noticed your best sessions started under 20 minutes." |

---

## 11. Retention Readiness Scorecard

### Pre-Launch Scorecard

| Area | Status | Score | Notes |
|------|--------|-------|-------|
| **Retention event tracking** | 17/18 events implemented | 9/10 | `session_abandoned` not yet directly tracked |
| **Day 0-7 journey** | All 8 days implemented with lane-specific copy | 10/10 | `computeJourneyState()` returns full state per day |
| **Churn risk signals** | 10/10 defined with responses | 8/10 | Responses defined but need product-level trigger wiring |
| **Recovery playbooks** | 10/10 defined | 8/10 | Defined but notification integration needs wiring |
| **Notification policy** | Core rules + nudge types implemented | 9/10 | `notification-policy/` feature complete; quiet hours configurable |
| **Memory/insight engine** | Day 3 "What VEX Learned" with confidence levels | 9/10 | Observation engine exists; needs UI card component |
| **Weekly intelligence** | Day 7 6-section intelligence per mode | 8/10 | Service exists; screen/view needs UI pass |
| **Rescue mode** | Full rescue funnel (offer → start → complete) | 9/10 | Implemented; guard conditions in `retention-guards.ts` |
| **Premium gating** | `shouldShowPremiumAfterValue()` guard | 10/10 | Strictly after Day 7 + weekly insight seen |
| **Day 0 surface enforcement** | 5-surface max policy | 10/10 | Defined in product docs; needs enforcement in home render |
| **A/B experiment framework** | Defined but not implemented | 4/10 | 6 experiments designed; no experiment infrastructure yet |
| **Soft-launch ritual** | Defined (daily/3-day/7-day) | 7/10 | Defined; needs dashboard or manual review process |
| **Benchmark targets** | Defined with "strong if" ranges | 8/10 | Realistic ranges set; need cohort tracking to measure |
| **Anti-pattern enforcement** | Banned list documented | 7/10 | Documented; needs code review checklist integration |

### Overall Retention Readiness: **7.8/10**

### Critical Pre-Launch Gaps (Must Fix)

1. **`session_abandoned` event** — Wire from session engine to complete the analytics event map. Without this, churn risk signals 1-2 are partially blind.

2. **Churn signal detection service** — The 10 risk signals are defined but need a product-level service that monitors these signals and triggers playbooks. Currently, triggers are implicit in the codebase but not centralized.

3. **A/B experiment plumbing** — No experiment framework exists. Must minimally support: variant assignment, metric tracking, safe kill switch. This is pre-launch critical for the copy experiments (Phase 6).

### Pre-Launch Nice-to-Have (Second Priority)

4. **Retention dashboard** — Health metrics spec exists but no dashboard to display them during soft launch. A simple admin view or analytics query library is needed.

5. **Day 0 surface enforcement** — The 5-surface max is documented but not programmatically enforced in the home screen render. Add a guard.

### Post-Launch Evolution

6. **Day 3 "What VEX Learned" UI card** — Service exists, observation engine works, but the visual card component needs a design pass.
7. **Day 7 weekly intelligence screen** — Service exists, 6-section intelligence structured, but needs full UI/UX pass.
8. **Memory confidence adaptive learning** — Currently confidence is static. Should learn from hide/delete rates over time.

---

## Appendix A: File Reference Map

| Concern | File Path |
|---------|-----------|
| Retention event tracking | `src/features/retention-loop/analytics.ts` |
| Journey state computation | `src/features/retention-loop/service.ts` |
| Retention guards (premium, rescue, memory) | `src/features/retention-loop/retention-guards.ts` |
| Journey copy (all 8 days) | `src/features/retention-loop/copy/day{0-7}.ts` |
| Journey schemas | `src/features/retention-loop/journey-element-schemas.ts`, `journey-composite-schemas.ts` |
| Notification policy service | `src/features/notification-policy/service.ts` |
| Notification analytics | `src/features/notification-policy/analytics.ts` |
| Memory candidate service | `src/features/memory-candidate/service.ts` |
| What VEX Learned service | `src/features/memory-candidate/what-vex-learned-service.ts` |
| Rescue mode analytics | `src/features/rescue-mode/analytics.ts` |
| Weekly intelligence service | `src/features/weekly-intelligence/service.ts` |
| First week product spec | `docs/product/first-week-product-magic-pass-v2.md` |
| Retention analytics helpers | `src/shared/analytics/retention-analytics.ts` |
| Analytics service | `src/analytics/AnalyticsService.ts` |
| Success metrics definitions | `src/analytics/VEXAnalyticsInfrastructure.types.ts` |
| Personalization / first week service | `src/features/personalization/first-week-service.ts` |

## Appendix B: Notification Copy Quick Reference

| Mode | Gentle Return | Memory Available | Rescue Offer |
|------|--------------|-----------------|--------------|
| Study | "Your next study block is small: one review target." | "VEX learned something about how you study." | "Need a tiny start?" |
| Run | "Recovery encounter ready: 10 clean minutes." | "VEX learned something about how you run." | "Need a tiny start?" |
| Project | "Your project thread is waiting at the next move." | "VEX learned something about your project flow." | "Need a tiny start?" |
| Clean | "One clean block is enough today." | "VEX learned something about your rhythm." | "Need a tiny start?" |

---

*This document is the single source of truth for VEX retention strategy. All retention-related decisions, experiments, copy, and metrics must reference or derive from this document. Updates require review against the banned anti-patterns list and must not introduce dark patterns.*
