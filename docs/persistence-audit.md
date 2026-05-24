# VEX Persistence Truth Table — Phase 10 Backend Audit

Generated: 2026-05-24

## Legend

| Symbol | Meaning |
|--------|---------|
| ✅ | Fully persisted, survives restart/reinstall/device-switch |
| ⚠️ | Partially persisted, gaps documented |
| ❌ | Not persisted, lost on restart/reinstall |
| 🗂️ | Local MMKV only (lost on reinstall/device switch) |
| ☁️ | Supabase-backed (survives reinstall, requires login) |
| 💰 | RevenueCat-managed |
| 🔒 | Privacy-sensitive — encrypted or schema-enforced |

## Phase 0 — Full Data Inventory

| # | Data Domain | Local | Supabase | Offline Queue | Sync on Login | Survives Reinstall | Survives Device Switch | Used by AI Coach | Privacy-Sensitive |
|---|-------------|-------|----------|---------------|---------------|--------------------|------------------------|------------------|-------------------|
| 1 | **Sessions (active)** | ✅ MMKV | ❌ | — | — | ❌ | ❌ | ✅ (via state) | 🔒 (duration, mode) |
| 2 | **Sessions (completed)** | ⚠️ FallbackStorageManager | ✅ `sessions` + `session_completion_ledgers` | ✅ Yes | ✅ Yes | ✅ (after sync) | ✅ | ✅ | 🔒 (duration, mode, quality) |
| 3 | **XP / Progression** | ❌ Legacy returns DEFAULT_STATE | ✅ `progression` + `xp_history` | — | ✅ (live query) | ✅ | ✅ | ✅ | 🔒 (XP totals) |
| 4 | **Streaks** | ❌ Legacy returns EMPTY_STATE | ✅ `streaks` + `streak_shields` + `streak_repair_quests` | — | ✅ (live query) | ✅ | ✅ | ✅ | 🔒 (streak days) |
| 5 | **Focus Score** | ❌ | ✅ `focus_identity_scores` | — | ✅ (live query) | ✅ | ✅ | ✅ | 🔒 (score, trends) |
| 6 | **Coach Memories** | ❌ | ✅ `coach_memories` | — | ✅ (live query) | ✅ | ✅ | ✅ | 🔒 (session patterns) |
| 7 | **Companion Memories** | ❌ | ✅ `companion_memories` | — | ✅ (live query) | ✅ | ✅ | ✅ | 🔒 (milestone events) |
| 8 | **Companion Profile** | 🗂️ MMKV | ❌ | — | — | ❌ | ❌ | ✅ | 🔒 (persona) |
| 9 | **Onboarding Profile** | 🗂️ MMKV (Zustand + OnboardingRepository backup) | ❌ | — | — | ❌ | ❌ | ✅ | 🔒 (goals, persona) |
| 10 | **Study Goals** | 🗂️ DraftManager | ✅ `learning_execution` + `content_study` tables | ✅ | ✅ | ⚠️ Goals: ✅ / Drafts: ❌ | ⚠️ Goals: ✅ / Drafts: ❌ | ✅ | 🔒 (study content) |
| 11 | **Behavior Signals** | 🗂️ MMKV (14-day window, max 100) | ❌ | — | — | ❌ | ❌ | ✅ | 🔒 (schema-enforced, no raw content) |
| 12 | **Premium Entitlements** | 🗂️ Cache | 💰 RevenueCat | — | ✅ (RevenueCat) | ✅ (RevenueCat restores) | ✅ | ✅ (gates premium features) | 🔒 (purchase history) |
| 13 | **Notifications** | 🗂️ MMKV cache | ✅ `notifications` + `push_tokens` + `reminder_plans` | — | ✅ | ✅ | ✅ | ❌ | 🔒 (tokens, scheduling) |
| 14 | **Focus Contracts** | — | ✅ `focus_contracts` | — | ✅ | ✅ | ✅ | ❌ | 🔒 (task descriptions) |
| 15 | **Personal Bests** | — | ✅ `personal_bests` | — | ✅ | ✅ | ✅ | ✅ | 🔒 (session data) |

## Phase 1 — Final Release Core Persistence Requirements

| Requirement | Status | Detail |
|-------------|--------|--------|
| Completed sessions persist | ✅ | Supabase `sessions` + `session_completion_ledgers`, offline queue with FallbackStorageManager |
| Streak/progress persists | ✅ | Supabase `streaks` table, full CRUD |
| XP/level persists | ✅ | Supabase `progression` + `xp_history` |
| Onboarding profile persists | ❌ **MISSING** | Local-only MMKV → **lost on reinstall** |
| Basic Coach memory summary | ✅ | Supabase `coach_memories` |
| Study/focus targets | ⚠️ | Focus contracts: ✅ / Onboarding goals: ❌ (local only) |
| Premium entitlement | ✅ | RevenueCat restores purchases |

## Phase 2 — Coach Memory Truth

### What Coach Can Use

| Data | Available | Confidence |
|------|-----------|------------|
| Coach memories (Supabase) | ✅ | High |
| Companion memories (Supabase) | ✅ | High |
| Latest local session (not yet synced) | ✅ via FallbackStorageManager | Medium |
| Behavior signals (14-day local window) | ⚠️ | Low |
| Onboarding profile (local only) | ⚠️ | Low (lost on reinstall) |

### Coach Constraints

- Coach MUST NOT claim long-term memory of data that is stored local-only (onboarding profile, behavior signals past 14 days, companion profile).
- If Supabase is unreachable: fall back to basic CoachPresence (no memory references).
- All memory references carry confidence labels.

## Phase 3 — Behavior Signal Persistence

Current: local-only MMKV, 14-day window, 100 signal cap.
Schema: `BehaviorSignalSchema` enforces structure, no raw content.

**Privacy**: ✅ Signals store type/surface/source/timestamp. No raw study content, no PII.
**Long-term personalization gap**: Signals older than 14 days or on new device are gone. Plan Supabase sync for Phase 11.

## Phase 4 — Critical Gaps Found

### CRITICAL: Onboarding Profile (v1 blocker)
- **Local only**: Zustand store persisted to MMKV via `OnboardingRepository`.
- **Backup exists**: primary + backup keys in MMKV.
- **No Supabase sync**: lost on app reinstall and device switch.
- **What's lost**: goal, focus duration, display name, persona, element, motivation profile.
- **Impact**: Coach can't recall user preferences after reinstall. Personalization resets.
- **Fix**: Add `onboarding_profiles` table, sync on completion and login.

### MEDIUM: Behavior Signal Long-Term Storage
- **Local only**: 14-day rotating window.
- **No Supabase sync**: long-term trend analysis impossible after 2 weeks.
- **Fix (Phase 11)**: Add `behavior_signals` table, batch-sync daily with dedup.

### MEDIUM: Companion Profile
- **Local only**: companion persona/preferences lost on reinstall.
- **Fix**: Mirror to `companion_profiles` table.

### LOW: Content Study Drafts
- **Local only**: acceptable for v1 (drafts are transient).
- No action needed now.

### LOW: Legacy StreakService / ProgressionService
- Return hardcoded EMPTY_STATE / DEFAULT_STATE.
- These appear unused (features versions use real Supabase repos).
- Safe to remove in cleanup phase.

## Phase 5 — Privacy Risk Assessment

| Risk | Severity | Detail |
|------|----------|--------|
| Onboarding profile local-only | Low | Goal/preferences only, no PII. But lost on reinstall = bad UX. |
| Behavior signals 14-day history | None | Schema-enforced, no raw content, no PII. Intentional window. |
| Content study drafts local-only | Low | Study material cached locally. Acceptable for v1. |
| Session completion ledgers | None | Supabase-backed, RLS enforced, idempotency keys prevent duplicates. |
| Coach memories | None | Supabase-backed, RLS enforced per-user. |

## Phase 6 — Required Fixes for v1 Public Launch

1. **Add `onboarding_profiles` table** with Supabase sync — blocks "VEX remembers you" claim.
2. **Verify legacy StreakService/ProgressionService are dead code** — remove if unused.
3. **Document Coach memory fallback contract** — what happens when Supabase is unavailable.
4. **Verify offline sync queue works end-to-end** — FallbackStorageManager → Supabase on reconnect.
