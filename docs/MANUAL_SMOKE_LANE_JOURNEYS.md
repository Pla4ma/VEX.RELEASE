# VEX Manual Smoke — Lane Journeys

Guide for manual QA of each of the 4 lane product journeys.

---

## Study Journey (student lane)

### Day 0 — First Launch
1. Complete onboarding → select Study as primary goal
2. Home screen shows: `start_session` (primary), `coach_presence` (secondary), `unlock_strip` (secondary), `study_layer` (tiny_tease)
3. No upload CTA visible (`study_layer` is tiny_tease, not primary/secondary)
4. Study OS (`study_os` key) is hidden/blocked
5. No boss, challenge, or premium clutter
6. Confirm ≤ 6 visible surfaces

### First Session
1. Tap Start Session → Study brief shows: "Study block ready"
2. CTA label: "Start study block"
3. Session mode: STUDY
4. Subject/task field available
5. Brief contains no economy terms (wager, coin, gem, shop, wallet)

### Active Session
1. Study timer running with study-focused UI
2. No run/project/clean signals leak into Study mode
3. Focus strategies loadout includes basic phone-away prompt

### Completion
1. Session ends → reflection screen
2. Progress saved to ledger
3. Memory candidate created if applicable
4. Next action recommendation appears
5. Home returns with progress_proof visible

### Day 3+
1. After ≥ 3 completed sessions + ≥ 2 coach interactions → memory_insight appears as tiny_tease
2. No fake memory before real data exists

---

## Run Journey (game_like lane)

### Day 0 — First Launch
1. Complete onboarding → select gamified/competitive motivation
2. Home shows: `start_session` (primary), `coach_presence`, `unlock_strip`
3. `run_board` is hidden/blocked on Day 0
4. `boss_full_cta` is blocked
5. No shop, economy, wager references in any surface keys
6. Confirm ≤ 6 visible surfaces

### First Session
1. Tap Start Session → encounter brief: "Start encounter"
2. Session mode: SPRINT
3. No currency references in brief (no wager, coin, gem, shop, wallet, insurance, bounty)
4. CTA label: "Start encounter"

### Active Session
1. Sprint timer running — minimal UI, tiny signal only
2. No economy/shop panel accessible
3. No boss combat during run session

### Completion
1. Reflection: positive, progress-focused
2. Progress saved with lane-appropriate next recommendation
3. No shop reward or gem reward surfaced

### Day 3+
1. After ≥ 3 completed sessions → boss_compact/tiny boss tease may appear
2. Run board unblocks progressively

---

## Project Journey (deep_creative lane)

### Day 0 — First Launch
1. Complete onboarding → select Creative as primary goal
2. Home shows: `start_session` (primary), `coach_presence`, `unlock_strip`
3. `project_thread` is hidden/blocked on Day 0
4. `focus_window` is hidden/blocked on Day 0
5. Confirm ≤ 6 visible surfaces

### First Session
1. Tap Start Session → project brief: "Resume project block"
2. Session mode: CREATIVE
3. CTA label: "Resume project block"
4. Can set task description (project next move)

### Active Session
1. Creative mode timer running
2. No study, run, or clean signals leaked
3. Next move visible as task context

### Completion
1. Reflection references creative flow
2. Memory candidate created
3. Next recommendation: "Return when the next move is clear"

### Day 3+
1. After ≥ 3 completed sessions → project_thread and focus_window become visible
2. Memory insight appears as tiny_tease (≥ 3 sessions + coach interactions)

---

## Clean Journey (minimal_normal lane)

### Day 0 — First Launch
1. Complete onboarding → select calm/gentle preference
2. Home shows minimal surfaces: `start_session` (primary), `coach_presence`, `unlock_strip`, `today_strip`
3. No boss teaser, no challenge teaser, no weekly quest
4. No premium tease
5. At least 3 visible surfaces, at most 6

### First Session
1. Tap Start Session → clean brief: "Start clean session"
2. Session mode: LIGHT_FOCUS
3. No gamification, economy, boss, or challenge references in brief
4. CTA label: "Start clean session"

### Active Session
1. Minimal timer display
2. No complexity — just timer + focus
3. Focus strategies: minimal, gentle prompts

### Completion
1. Reflection: gentle, no pressure
2. Progress saved with clean next recommendation
3. Memory candidate at appropriate confidence

### Day 3+
1. today_strip and coach_presence remain core
2. No boss/challenge clutter ever for clean lane
3. Memory insight appears after 3 sessions (tiny_tease initially)
4. Premium tease remains hidden until timing gates allow

---

## Cross-Lane Checks

### Notification Budget
1. Day 0: zero unsolicited notifications across all lanes
2. Minimal lane: max 1 nudge/day
3. Other lanes: max 2 nudges/day
4. Recent dismissals → priority lowered
5. Rescue context overrides dismissal block

### Premium Timing
1. 0-4 completed sessions → premium completely hidden (hidden_early)
2. RevenueCat unhealthy → premium blocked (blocked_unhealthy) regardless of session count
3. Premium copy uses durable value only (memory, focus intelligence, import depth, project continuity)

### Rescue Mode
1. Hidden on cold Day 0
2. Appears after: abandoned session, missed planned session, streak risk, repeated dismissals
3. Creates 5-12 minute session
4. Stores completion memory
5. Copy differs by lane (notes for student, encounter for run, project for creative, 5-min for clean)

### Hidden Systems
1. No shop, inventory, wallet, battle_pass, wagers, social, rankings in surface keys
2. No economy references in session briefs
3. All hidden feature map entries confirmed excluded from Day 0 routing

---

**Last updated**: Phase 17
**Based on**: `src/__tests__/phase-17-product-shift-journeys.test.ts` (141 tests)
