# VEX Premium Visual Pass — Design Spec

**Date:** 2026-06-01
**Scope:** Visual, motion, and art direction only. Product logic, backend, navigation, and session state machine are unchanged.
**Goal:** Push VEX from ~6/10 to 11/10 — industry-shaking premium mobile focus OS.

---

## 1. Brand System

### Core Identity
Neutral obsidian-base OS with a single luminous primary accent. The app must always feel like **VEX first, lane second**.

**Base surfaces:**
- `background`: `#0A0A0F` (obsidian)
- `surfaceElevated`: `#12121A` with subtle `#1A1A24` borders
- `surfaceGlass`: `rgba(18,18,26,0.85)` with `rgba(0,229,255,0.06)` inner glow
- `textPrimary`: `#F0F0F5`
- `textSecondary`: `rgba(240,240,245,0.6)`
- `textMuted`: `rgba(240,240,245,0.35)`

**Primary accent (focus signal):** Soft cyan / electric cyan-blue
- Interactive glow: `#00E5FF`
- Subtle tint: `rgba(0,229,255,0.08)`
- Focus ring: `rgba(0,229,255,0.25)`

**Completion accent (used sparingly):** Warm gold
- Proof moments only: `#FFB300`
- Subtle glow: `rgba(255,179,0,0.15)`

### Lane Accents (Subordinate, Contextual)
Lane colors tint surfaces, motion, icons, and small accents. They do not dominate the brand identity.

| Lane | Accent | Usage |
|------|--------|-------|
| Study | `#3B82F6` (muted blue) | Icon tint, small badge |
| Game-like | `#6366F1` (indigo/violet) | Energy accents when active |
| Creative | `#14B8A6` (muted teal) | Subtle surface tint |
| Clean | `#10B981` (slate/emerald) | Minimal, quiet |

**Rule:** Lane accent opacity must stay ≤ 0.15 on surfaces, ≤ 0.4 on icons/text. The cyan primary must remain dominant.

---

## 2. Constraints (User-Mandated)

### Constraint 1: StartSessionButton Preservation
- **Do NOT delete or deprecate** `StartSessionButton.tsx` or its exports.
- Preserve all existing props, behavior, tracking events, analytics calls, and test coverage.
- `VexLaunchButton` is a new primitive component.
- If a screen currently uses `StartSessionButton`, it may be updated to use `VexLaunchButton` directly **OR** `StartSessionButton` may be refactored to render `VexLaunchButton` internally while preserving its public API.
- All existing tests for `StartSessionButton` must continue to pass without modification.

### Constraint 2: Emoji Removal Scope
- Remove emoji-based visuals **only** from high-visibility/core UI in the default calm path.
- **Do NOT** delete internal emoji strings used in:
  - Debug labels
  - Test assertions (unless the test is specifically testing visible UI)
  - Properly gated lane-specific content that is not part of the default/core user experience
  - Backend/template strings that are not user-visible in the default path
- Focus removal on: auth screens, home hero, active session HUD, completion hero, coach presence card, default companion states.

### Constraint 3: Haptics Safety
- All haptics must route through the existing `src/utils/haptics.ts` system.
- Must check `useReducedMotion()` before firing motion-linked haptics.
- Must respect platform haptics support (some Android devices lack strong haptics).
- Must respect any existing user haptics settings/preferences if available.
- **Never** fire haptics unconditionally.

---

## 3. Signature Moment 1: First Impression

### Goal
Entering VEX feels like entering a premium focus OS. Not a form. Not a white screen. App Store screenshot-worthy.

### Visual Components

#### `VexEntryBackground` (enhanced existing)
- Deep obsidian base (`#0A0A0F`)
- Single drifting **cyan aurora** — SVG-based, slow sinusoidal wave animation (8s cycle, `useAnimatedProps` or Reanimated `useSharedValue` driving SVG path)
- Soft grid overlay: very faint crosshatch at 10% opacity, static
- No particles. No noise textures. No heavy gradients.

#### `VexFocusMark` (enhanced existing)
- Custom SVG glyph: protected-block shape with focus slit
- Pulsing cyan glow on load (Reanimated `withRepeat` + `withTiming`)
- Glow filter: SVG `<filter>` with `feGaussianBlur` (stdDeviation="4")
- Reduced motion: static mark, no pulse

#### `VexFocusLoop` (NEW)
- Replaces `AuthValuePreview`
- Animated signal path: Start → Protect → Proof → Return
- Three nodes connected by a line that draws itself (SVG `stroke-dashoffset` animation)
- Nodes are small cyan circles with soft glow
- Typography hierarchy:
  - "Start" — caption, muted
  - "Protect" — body, secondary
  - "Return" — body, primary (the payoff)
- Animation: line draws over 1200ms on entry, nodes pulse sequentially

#### `AuthCommandPanel` (enhanced existing)
- Glass-morphism surface: `VexMotionSurface` with `surfaceGlass` preset
- Border: `1px solid rgba(0,229,255,0.08)`
- Input focus: cyan glow ring animates from center outward (Reanimated border-color + shadow)
- Password field: subtle shield outline icon (SVG, not emoji) as security indicator

#### `VexLaunchButton` (NEW)
- Primary CTA for auth and home
- Surface: obsidian with soft cyan inner glow (bottom-edge biased)
- Press: scale to 0.97 + glow intensity spike + haptic (via haptics.ts, reduced-motion checked)
- Contains protected-block icon (SVG) + primary label + optional secondary context label
- Full-width in auth, adaptive in home

### Screen Changes

#### LoginScreen.tsx
- Background: `VexEntryBackground`
- Hero: `AuthHeroBrand` with `VexFocusMark`
- Value loop: `VexFocusLoop` replacing `AuthValuePreview`
- Panel: `AuthCommandPanel` wrapping `FormField`s
- CTA: `VexLaunchButton` (or `StartSessionButton` if preserved and wrapped)
- Motion: staggered fade-up (mark → tagline → loop → panel → CTA, 120ms stagger)

#### RegisterScreen.tsx
- Same visual system as Login
- Additional fields integrated into `AuthCommandPanel`

#### ForgotPasswordScreen.tsx
- Same panel style
- Smooth slide-replace transition from login (Reanimated layout animation, 300ms)

#### WelcomeScreen.tsx
- Full-screen `VexEntryBackground`
- Large centered `VexFocusMark` with tagline
- Minimal CTA: single `VexLaunchButton`
- No emoji. No cartoon mascot.

### Motion Standard
- Entry: `FadeInUp` staggered, 120ms intervals
- Input focus: glow ring `withTiming(200ms)`
- CTA press: `withSpring({ damping: 15, stiffness: 300 })` scale + glow
- Transition to onboarding: brief cyan flash overlay (200ms) + fade
- Reduced motion: instant fades, no aurora drift, no pulse, no glow animation

---

## 4. Signature Moment 2: Home

### Goal
Home feels like the app has formed **one clear next focus move** around the user. Not a dashboard. Not a card stack. One dominant visual anchor. One obvious action.

### Visual Components

#### `VexFocusSurface` (NEW)
- Replaces `HomeHeroSection` + `HomeHeroCard`
- Single adaptive surface filling ~60% of screen vertically
- Not a card — no border radius stack, no shadow stack. A surface with depth.
- Background: subtle gradient from `surfaceElevated` to `background` (top to bottom)
- Inner glow: `rgba(0,229,255,0.04)` at bottom edge
- Lane accent: very subtle hue shift on bottom glow (opacity ≤ 0.06)

**Surface layout:**
- Top (10%): Lane context — quiet, small, muted. "Study lane" or "Focus mode"
- Center (50%): Next session context or "Protected block ready" state
  - Large text: session name or "Ready to protect"
  - Subtext: duration, context
- Bottom (40%): `VexLaunchButton` integrated into surface
  - Protected-block icon + "Start Session" + duration context

#### `VexCompanionAura` (NEW)
- Replaces card-based companion presentation
- Position: lower portion of screen, below hero surface
- Form: small atmospheric orb — soft geometric shape (circle or rounded hex) with slow color drift
- Size: 48-64dp
- No face. No eyes. No emoji mood.
- Text hint: calm, mature. "Ready when you are." Not "Your buddy is waiting!"
- Animation: slow drift (SVG noise or Reanimated translateY oscillation, 6s cycle)

#### `HomeStreakProgress` (enhanced)
- Quiet proof line below companion
- Thin horizontal bar (4dp height), obsidian track, cyan fill
- Text: "12 days protected" — minimal, premium, no emoji
- No flame icon. No streak animation. Just quiet proof.

#### `VexLaunchButton` (at Home)
- Integrated into `VexFocusSurface`
- Full-width within surface padding
- Breathing glow (6s cycle, very subtle)
- Press: scale + haptic + brief glow spike

### Screen Changes

#### HomeScreen.tsx / HomeContent.tsx
- Recompose to center `VexFocusSurface` vertically
- Massive negative space above hero (status bar + 48dp)
- Content grouped tightly in center-lower portion
- No competing CTAs. No secondary action buttons near the primary.

#### HomeStageResolver.tsx
- Unchanged logic. Wraps the new visual surface.

### Motion Standard
- Hero surface "forms": `withSpring` scale from 0.96 → 1.0 + opacity 0 → 1
- Launch button glow: `withRepeat` + `withTiming` (6s, very subtle)
- Companion aura: slow vertical drift (Reanimated, 6s)
- Scroll: hero compresses slightly (`useAnimatedScrollHandler`, scale 1.0 → 0.98)
- Reduced motion: static, no breathing, no drift, no scroll compression

---

## 5. Signature Moment 3: Active Session

### Goal
The best screen. A premium focus chamber. Alive, calm, controlled. The user should feel like they entered a protected space.

### Visual Components

#### `VexSessionChamber` (NEW)
- Replaces `ActiveSessionBackground`
- Deep obsidian base with `VexFocusField` animated gradient mesh
- 2-3 colors, very low saturation, slow drift (12s cycle)
- **No particles. No noise spam. No cheap effects.**

**Lane tinting:**
- Study: slightly cooler drift (blue-cyan bias)
- Game-like: slightly warmer (indigo bias)
- Creative: subtle teal warmth
- Clean: neutral
- Bias is barely perceptible. Cyan remains dominant.

**State responses:**
- Active: slow breathing drift
- Paused: dims to 60% brightness over 400ms. Field freezes. "Suspended" feel.
- Resume: re-energizes over 300ms
- Final stretch (last 10%): chamber subtly brightens, cyan accent intensifies
- Completion threshold: clean 1px horizontal cyan line sweeps across screen (300ms) then fades

#### `VexFocusField` (NEW)
- SVG gradient mesh or Reanimated `LinearGradient` with animated stops
- 3 gradient stops drifting slowly via shared values
- Colors: obsidian base + very subtle cyan/blue shifts
- Performance: runs on UI thread via Reanimated

#### `VexProgressSignal` (NEW)
- Replaces `ActiveSessionProgressRing` + `Inner`
- Layered SVG ring system:
  - Outer track: `rgba(240,240,245,0.08)`, 12dp stroke
  - Middle lane ring: lane color at opacity 0.12, 8dp stroke
  - Inner fill: cyan `#00E5FF` with soft glow filter, 6dp stroke
  - Tip node: small cyan circle traveling the ring path
- Timer display: monospaced numerals, large (48-64dp), centered inside ring
- Label below timer: "Focus" or session mode name
- Purity indicator: secondary inner ring glows brighter when purity > 80. Integrated, not separate UI.

#### `VexFocusSignal` (NEW)
- Replaces `CompanionSessionLayer`
- Position: lower-center, below progress ring
- Form: abstract geometric signal — pulsing core with 2-3 orbiting small shapes
- Size: ~80dp total
- No face. No pet body. No cartoon.
- State shifts:
  - Focused: calm pulse, cyan
  - Distracted: contraction, slightly warmer
  - Struggling: faster pulse, subtle red tint (not alarm, just shift)

#### `SmartCoachHint` (enhanced)
- Floating label above `VexFocusSignal`
- Glass pill shape: `rgba(18,18,26,0.8)` with subtle border
- Text: calm, direct. Not a chat bubble. No avatar icon.
- Appears: `FadeInUp` (200ms). Stays. Exits: `FadeOut` (150ms).

#### `VexControlDock` (NEW)
- Replaces `ActiveSessionControlDock` + `BottomControls`
- Minimal, centered bottom row. Three icons only:
  - Pause: subtle square icon (SVG)
  - End: muted danger outline (thin, not red fill)
  - Settings: gear (SVG)
- Size: 48dp touch targets
- Press: scale 0.92 + haptic + brief opacity dip
- No text labels. Icons must be recognizable.

#### Mode Overlays
- Integrated as HUD-style overlays, not modal cards
- Fade in over chamber (300ms)
- Glass surface with subtle border

### Screen Changes

#### ActiveSessionScreen.tsx
- Wire `VexSessionChamber` as background
- Pass lane to chamber for subtle tinting

#### ActiveSessionContent.tsx
- Recompose layout:
  - Top: minimal status bar (time, optional mode badge)
  - Center: `VexProgressSignal` (dominant)
  - Lower-center: `VexFocusSignal` + `SmartCoachHint`
  - Bottom: `VexControlDock`
- No clutter. No competing visual elements.

### Motion Standard
- Chamber: continuous breathing (12s gradient drift cycle)
- Ring progress: smooth SVG `strokeDashoffset` via Reanimated shared value
- Purity glow: intensity maps to purity score (Reanimated `interpolate`)
- Pause: chamber dims `withTiming(400ms, { duration: 400 })`
- Resume: re-energizes `withTiming(300ms)`
- Final stretch: subtle zoom `withSpring(1.02)` + glow intensify
- Completion threshold: 1px cyan line `withTiming(300ms)` translateX sweep
- Reduced motion: static background, instant state changes, no zoom, no glow animation

---

## 6. Signature Moment 4: Completion

### Goal
Emotional payoff. "I did it. I have proof. I know tomorrow's next move." Calm celebration, not casino chaos.

### Visual Components

#### `VexCompletionProof` (NEW)
- Replaces `SessionCompleteHeroSection`
- Background: warm obsidian-gold gradient (not bright, not casino)
  - Top: `#0A0A0F`
  - Bottom: `rgba(255,179,0,0.06)` — barely perceptible warmth
  - Think "dawn after focus."

#### `VexProofRing` (NEW)
- Replaces `SessionGradeCard`
- Large central ring (180-220dp diameter)
- Animation: ring stroke completes over 800ms (SVG stroke-dashoffset)
- Grade letter (S/A/B/C/D) scales in with spring after ring completes (400ms delay)
- Grade color:
  - S: gold `#FFB300` with soft glow
  - A: cyan `#00E5FF`
  - B/C: white `#F0F0F5`
  - D: muted `#8B8B9A`
- Not a badge. Not a medal. A **proof mark.**

#### Proof Lines (NEW)
- Replaces `SessionCompleteRewardsPhase`
- Three quiet horizontal items:
  1. Duration: clock icon (SVG) + value
  2. Purity: shield icon (SVG) + percentage
  3. Streak: thin line + "12 → 13" with subtle pulse on the new number
- No confetti. No spinning coins. No reward panels.
- Layout: thin divider lines between items. Minimal.

#### Next Move Surface (NEW)
- Replaces `SessionCompleteNextSteps`
- Single glass surface: `VexMotionSurface`
- Content: one recommended next session
  - "Tomorrow: 25m Focus"
  - Quiet context text
- One CTA: "Set Reminder" or "Done"
- Not a list. One thing.

#### `SmartCoachHint` (completion tone)
- Text: calm, proud. "Protected. See you tomorrow." Not hype.
- Position: above proof ring

### Screen Changes

#### SessionCompleteScreen.tsx
- Unchanged logic. Wires new components.

#### SessionCompleteContent.tsx
- Three-phase staged reveal:
  1. Background shift (300ms)
  2. Proof ring animation (800ms)
  3. Grade spring reveal (400ms delay)
  4. Proof lines stagger (150ms each)
  5. Next move surface fade-up (300ms)

### Motion Standard
- Staged reveal sequence using Reanimated `withDelay` + `withSequence`
- Haptics: light on grade reveal, medium on streak increment (only if not reduced motion)
- Reduced motion: instant reveals, no ring animation, no haptics

---

## 7. Companion / Coach Signature

### Goal
Mature, premium, calm intelligence. Not a pet. Not a toy. A focus signal.

### Visual Components

#### `AnimatedCoachAvatar` (REBUILT)
- Abstract geometric face: 3-4 soft polygons forming expression
- No cartoon features. No emoji.
- Cyan accent: glow in "eyes" (small geometric shapes)
- Animation:
  - Blink: slow opacity cycle on eye shapes (4s)
  - Head tilt: slight rotate on state change (`withSpring`, ±3deg)
- Size: 48-64dp in cards, 32dp in hints

#### `VexCompanionAura` (NEW)
- Default/core companion presentation
- Form: soft geometric orb with slow color drift
- Aura: SVG radial gradient with lane-colored center
- Size: 48-80dp depending on context
- No body. No phases. No egg/hatch language.

#### `VexFocusSignal` (session companion)
- Active session form: pulsing core + 2-3 orbiting shapes
- Size: ~80dp
- Responds to session state: calm pulse, contraction, expansion

#### `VexSignalState` (NEW)
- Replaces `MoodIndicator`
- Small dot/pulse next to companion
- Color temperature:
  - Cool cyan: calm, focused
  - Warm amber: active, working
  - Muted red: struggling (subtle, not alarming)
- No emoji. No "happy/sad" labels.

#### `CoachPresenceCard` (enhanced)
- Glass surface: `VexMotionSurface`
- Subtle border: `rgba(0,229,255,0.06)`
- Layout: text-first. No avatar on left.
- Coach text in clean hierarchy: title + body
- Reduced padding. More negative space.

#### `SmartCoachHint` (enhanced)
- Floating label, not chat bubble
- Glass pill: `rgba(18,18,26,0.8)` + border
- Appears near companion signal
- No avatar icon next to text

### Screen Changes
- All companion cards updated to use `VexCompanionAura` or `VexFocusSignal`
- All mood indicators replaced with `VexSignalState`
- Game-like mode (gated): can show more personality, but still geometric/abstract

---

## 8. Reusable Primitives

### `VexMotionSurface` (NEW)
- Props: `variant: 'glass' | 'elevated' | 'focused'`
- `glass`: `rgba(18,18,26,0.85)` + subtle border + optional inner glow
- `elevated`: `#12121A` + subtle border + no glow
- `focused`: `glass` + cyan border glow
- Animation support: Reanimated `Animated.View` wrapper
- Press support: scale + glow spike

---

## 9. New Component Inventory

| Component | File | Purpose | Replaces |
|-----------|------|---------|----------|
| `VexFocusLoop` | `src/components/brand/VexFocusLoop.tsx` | Auth value animation | `AuthValuePreview` |
| `VexLaunchButton` | `src/components/primitives/VexLaunchButton.tsx` | Primary CTA | New primitive |
| `VexMotionSurface` | `src/components/primitives/VexMotionSurface.tsx` | Reusable glass/elevated surface | Various card stacks |
| `VexSessionChamber` | `src/screens/session/components/VexSessionChamber.tsx` | Active session background | `ActiveSessionBackground` |
| `VexFocusField` | `src/screens/session/components/VexFocusField.tsx` | Animated gradient mesh | New |
| `VexProgressSignal` | `src/screens/session/components/VexProgressSignal.tsx` | Premium progress ring | `ActiveSessionProgressRing` + `Inner` |
| `VexProofRing` | `src/screens/session/components/VexProofRing.tsx` | Completion grade ring | `SessionGradeCard` |
| `VexCompletionProof` | `src/screens/session/components/VexCompletionProof.tsx` | Completion hero surface | `SessionCompleteHeroSection` |
| `VexCompanionAura` | `src/features/companion/components/VexCompanionAura.tsx` | Abstract companion aura | Card-based companion |
| `VexFocusSignal` | `src/features/companion/components/VexFocusSignal.tsx` | Session companion form | `CompanionSessionLayer` |
| `VexSignalState` | `src/features/companion/components/VexSignalState.tsx` | Companion state indicator | `MoodIndicator` |
| `VexControlDock` | `src/screens/session/components/VexControlDock.tsx` | Minimal session controls | `ActiveSessionControlDock` + `BottomControls` |
| `VexFocusSurface` | `src/screens/home/components/VexFocusSurface.tsx` | Home hero surface | `HomeHeroSection` + `HomeHeroCard` |

---

## 10. Product Logic Protection

### UNCHANGED (strictly preserved)
- All auth logic (login, register, forgot password flows, validation, error handling)
- Session state machine (pause, resume, abandon, complete, recovery)
- Completion ledger, XP calculation, grade calculation, reward distribution
- Streak logic, streak repair, grace periods
- Progression logic, level-ups, mastery
- Feature gates, locked/unlocked behavior, availability checks
- Navigation architecture, screen order, route params
- Onboarding decisions, flow logic, step progression
- Backend API contracts, Supabase schema, repository queries
- Business rules in all hooks, services, stores
- Analytics events, tracking calls, Sentry integration
- RevenueCat/purchase logic, paywall behavior

### CHANGED (visual/motion/presentation only)
- Component rendering output (JSX structure, styling)
- Animation behavior (Reanimated shared values, transitions)
- Color application (theme tokens, inline styles)
- Layout composition (flex, positioning, spacing)
- Typography hierarchy (font sizes, weights, colors)
- Surface styling (borders, backgrounds, shadows, glows)
- Icon/illustration replacement (SVG components, not emoji)
- Motion timing, easing, sequencing

---

## 11. Verification Checklist

After implementation:
1. `npm run typecheck -- --pretty false` — must pass with 0 errors
2. `npm test -- --passWithNoTests --testPathPattern="home-spine|session|coach|companion|auth"` — existing tests pass (or only pre-existing failures)
3. `npm run check:banned-patterns` — no violations
4. `npm run check:no-ts-nocheck` — 0 `@ts-nocheck` comments
5. `npm run check:line-limit` — all files ≤ 200 lines
6. Manual review:
   - No user-facing emojis in auth/home/session/completion screens
   - No `launchColors` in new/modified component files
   - All new motion has `useReducedMotion` fallback
   - All haptics via `src/utils/haptics.ts` with platform/accessibility checks
   - `StartSessionButton` still exported, tests pass
   - Companion default state is abstract/geometric, not cartoon

---

## 12. Motion Standard Summary

| Moment | Motion | Reduced Motion Fallback |
|--------|--------|------------------------|
| First impression entry | Staggered fade-up (120ms) | Instant fade |
| Input focus | Glow ring from center | Instant border color |
| CTA press | Scale 0.97 + glow spike | Instant opacity dip |
| Home hero formation | Scale 0.96 → 1.0 + fade | Instant |
| Home launch glow | Breathing 6s cycle | Static glow |
| Companion drift | Slow vertical oscillation | Static position |
| Session chamber | Gradient drift 12s | Static gradient |
| Ring progress | Smooth stroke-dashoffset | Instant fill |
| Pause | Dim 60% over 400ms | Instant dim |
| Resume | Brighten over 300ms | Instant |
| Final stretch | Zoom 1.02 + glow | No zoom, static |
| Completion threshold | Cyan line sweep 300ms | Instant line |
| Proof ring | Stroke complete 800ms | Instant ring |
| Grade reveal | Spring scale 400ms delay | Instant |
| Proof lines | Stagger fade 150ms | Instant |

---

**Spec Status:** Approved by user with 3 constraints incorporated.
**Next Step:** Implementation plan via `writing-plans` skill.
