# VEX 10x Transformation Architecture

**Status:** Phase 0-1 Implementation  
**Date:** May 2026  
**Goal:** 4/10 → 10/10 app transformation

---

## SYSTEMS DECISION MATRIX

| System | Status | Sunset Timeline | Replacement |
|--------|--------|-----------------|-------------|
| Linear Leveling | **DEPRECATED** | Month 3-4 | Focus Identity Engine (300-850 score) |
| Squad Synergy | **DEPRECATED** | Month 2-3 | Squad Energy System |
| Seasonal Currency | **DEPRECATED** | Month 1-2 | Coins/Gems only |
| Basic Challenges | **MERGING** | Month 2 | Weekly Quests expansion |
| 5 Session Modes | **CONSOLIDATING** | Month 1 | 3 Modes (FLOW/CHALLENGE/RECOVERY) |
| Decorative Chests | **SUNSET** | Month 1 | Removed (not replaced) |

---

## KEPT SYSTEMS (CORE FOUNDATION)

### 1. Focus Identity Engine ✅
**Location:** `src/features/focus-identity/FocusIdentityEngine.ts`
**Role:** Primary progression system (replaces linear leveling)
**Key Features:**
- Credit-score style Focus Score (300-850)
- 5 weighted factors (consistency, streak, quality, diversity, recency)
- Monthly reports with personalized insights
- Percentile ranking vs all users
- Recovery mechanics for lapse periods

**Integration Points:**
- Session completion → Score update
- Streak events → Streak stability factor
- Boss defeats → Session quality factor
- Daily login → Recency factor

**10x Enhancement:** Make it the PRIMARY metric shown on home screen

---

### 2. Real-Time Boss Combat ✅
**Location:** `src/features/boss-realtime/`
**Role:** Core gameplay loop during sessions
**Key Features:**
- Damage dealt every 3-5 seconds based on purity
- Visual health bar depletion in real-time
- Boss "attacks" during interruptions
- Combo system for consecutive pure moments
- Rage mode at 25% health
- Near-death tension at 10% health
- Immediate victory/defeat

**Integration Points:**
- SessionOrchestrator (tick every 3-5s)
- TimerEngine (purity calculation)
- ScoringEngine (combo tracking)
- Companion system (reactions to combat events)

**10x Enhancement:** Make it VISIBLE and TENSE

---

### 3. Session Story Engine ✅
**Location:** `src/features/session-story/`
**Role:** Post-session narrative generation
**Key Features:**
- Cinematic story beats after session
- "You fought through 3 interruptions..."
- Shareable story cards
- Emotional memory of productivity

**Integration Points:**
- Session completion triggers story generation
- Analytics feed story beats
- Social sharing of stories

**10x Enhancement:** More granular beats, better narratives

---

### 4. Mastery System ✅
**Location:** `src/features/mastery/`
**Role:** Skill-tree progression
**Key Features:**
- 4 branches: Endurance, Intensity, Social, Tactics
- Technique XP (skill-based, not time-based)
- Rank unlocks (Novice → Expert → Master)
- Challenge-based advancement

**Integration Points:**
- Session performance → Technique XP
- Unlocks → Feature gates
- Skills → Session modifiers

**10x Enhancement:** Make branches deeper, add more choices

---

### 5. Streak System ✅
**Location:** `src/streaks/StreakService.ts`
**Role:** Daily retention mechanic
**Key Features:**
- Current streak tracking
- Longest streak record
- Streak freeze (grace periods)
- Comeback bonuses
- Risk detection and notifications

**10x Enhancement:** Add visual "creature" that evolves

---

### 6. Seasons/Battle Pass ✅
**Location:** `src/features/seasons/`
**Role:** Long-term retention and monetization
**Key Features:**
- 40-tier progression
- Free + Premium tracks
- Exclusive cosmetics
- Seasonal meta-events

**10x Enhancement:** More desirable rewards, finale events

---

### 7. Squad System ✅
**Location:** `src/features/squads/`
**Role:** Social gameplay
**Key Features:**
- Group membership
- Shared boss battles
- MVP system
- Activity feed

**10x Enhancement:** Add energy interdependence, tournaments

---

### 8. AI Coach ✅
**Location:** `src/features/ai-coach/`
**Role:** Intelligent interventions
**Key Features:**
- Behavior profile analysis
- Intervention triggers
- Recovery plan generation
- Quest recommendations

**10x Enhancement:** Make PREDICTIVE not reactive

---

### 9. Economy System ✅
**Location:** `src/economy/`
**Role:** Virtual currency management
**Key Features:**
- Wallet management
- Transaction history
- Earning/spending tracking
- Level multipliers

**10x Enhancement:** Remove seasonal, add gem sinks

---

## NEW SYSTEMS (PHASED IMPLEMENTATION)

### Phase 1: Core Loop Revolution
- ✅ Feature Flags (transformation flags)
- ✅ Session Modes V2 (consolidated)
- ✅ Real-time Boss Combat (exists, needs integration)
- 🔄 Session Orchestrator Integration
- 🔄 Purity Feedback Overlay

### Phase 2: Progression Redesign
- 🔄 Focus Score Dashboard (home screen)
- 🔄 Mastery Skill Trees expansion
- 🔄 Prestige System

### Phase 3: Social Depth
- 🔄 Squad Energy System
- 🔄 Help Request System
- 🔄 Tournament Engine
- 🔄 Mentorship Program

### Phase 4: Economy
- ✅ Currency V2 (consolidated)
- 🔄 Emergency Gem Sinks
- 🔄 Trading System

### Phase 5: Retention
- 🔄 Prime Time Events
- 🔄 Streak Creatures
- 🔄 Weekly Boss Raids
- 🔄 Season Finales

### Phase 6: AI Evolution
- 🔄 Predictive Engine
- 🔄 Adaptive Difficulty
- 🔄 Session Narrator

---

## DEPRECATED SYSTEMS

### Squad Synergy (DEPRECATED)
**File:** `src/features/squads/service/synergy-DEPRECATED.ts`
**Sunset Timeline:**
- Month 1-2: Feature flag `legacy_squad_synergy` = true
- Month 3: Gradual rollout to 50%
- Month 4: Sunset to 0%
- Month 5: Delete file

**Migration Path:**
```typescript
// OLD
import { addSynergyPoints } from './synergy';
await addSynergyPoints(squadId, userId, 10, 'SESSION_COMPLETE');

// NEW
import { addSquadEnergy } from './energy';
await addSquadEnergy(squadId, userId, 100, 'SESSION_COMPLETE');
```

---

### Linear Leveling (DEPRECATED)
**Sunset Timeline:**
- Month 1-3: Maintain alongside Focus Score
- Month 4: Hide from UI, keep backend
- Month 5: Migration to Focus Score complete

---

### Seasonal Currency (DEPRECATED)
**Sunset Timeline:**
- Month 1: Auto-convert seasonal → coins (10:1 ratio)
- Month 2: Remove from UI
- Month 3: Remove from backend

---

## INTEGRATION ARCHITECTURE

```
┌─────────────────────────────────────────────────────────────┐
│                        SESSION SCREEN                        │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Real-time Boss Combat Overlay                       │   │
│  │  - Health bar (depleting live)                     │   │
│  │  - Damage numbers                                  │   │
│  │  - Combo counter                                   │   │
│  │  - Boss reactions                                  │   │
│  └─────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Timer Display                                      │   │
│  │  - Countdown                                        │   │
│  │  - Purity score (real-time)                        │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                       HOME SCREEN                            │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                   │
│  │  Focus   │  │  Streak  │  │   Squad  │                   │
│  │  Score   │  │ Creature │  │  Energy  │                   │
│  │  (big)   │  │          │  │          │                   │
│  └──────────┘  └──────────┘  └──────────┘                   │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Prime Time Event (if active)                       │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## FEATURE FLAG STRATEGY

All transformation features are behind feature flags for gradual rollout:

```typescript
// Phase 1
'real_time_boss_combat' - Enable overlay during sessions
'consolidated_session_modes' - Use FLOW/CHALLENGE/RECOVERY
'real_time_purity_feedback' - Show live purity score

// Phase 2
'focus_score_primary' - Show Focus Score on home screen
'mastery_skill_trees' - Enable skill tree UI
'prestige_system' - Enable ascension

// Phase 3
'squad_energy_system' - Replace synergy with energy
'help_request_system' - Enable "Send Help" button
'squad_tournaments' - Enable weekly tournaments

// System Sunsets (deprecated flags)
'legacy_squad_synergy' - false = sunset complete
'legacy_linear_leveling' - false = migration complete
'legacy_seasonal_currency' - false = removal complete
```

---

## SUCCESS METRICS

### Target Retention
- D1: 50% → 70%
- D7: 25% → 45%
- D30: 12% → 25%

### Target Engagement
- Sessions/week: 3 → 5
- Avg duration: 22min → 35min
- Boss defeat rate: 60% → 80%

### Target Monetization
- ARPU: $0.50 → $3.00
- Premium conversion: 2% → 8%

---

## RISK MITIGATION

1. **User Resistance to Change**
   - Feature flags for gradual rollout
   - A/B test major changes
   - Maintain legacy paths during transition

2. **Performance Degradation**
   - Continuous profiling
   - Lazy loading for new features
   - Optimization sprints

3. **Monetization Backlash**
   - Cosmetic-only initially
   - Optional emergency saves
   - Clear value communication

---

## NEXT STEPS

1. ✅ Complete Phase 0 (System Audit)
2. ✅ Set up feature flags
3. ✅ Sunset Squad Synergy
4. 🔄 Integrate Boss Combat with Session Orchestrator
5. 🔄 Create Focus Score Dashboard
6. 🔄 Implement Session Modes V2
7. 🔄 Build Squad Energy System
8. 🔄 Create Emergency Gem Sinks

---

**Document Version:** 1.0  
**Last Updated:** May 2026  
**Owner:** VEX Transformation Team
