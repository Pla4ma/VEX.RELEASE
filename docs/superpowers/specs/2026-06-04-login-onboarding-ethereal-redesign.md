# VEX Login & Onboarding — June 2026 Ethereal Redesign

**Date:** 2026-06-04
**Status:** Draft, awaiting approval
**Scope:** `src/screens/auth/LoginScreen.tsx` + auth visual layer, `src/screens/onboarding/**` + onboarding visual layer

## Direction (locked)

**Ethereal Sky** — full pivot to soft dawn-sky gradients, drifting volumetric clouds, luminous glass, elegant serif title. Closest to the Mobbin "Text to App" reference while preserving VEX brand voice in copy and motion vocabulary.

## Visual System

### Sky background (shared by Login + Onboarding)
- 3-stop vertical gradient: `#9BC4F0` (zenith) → `#C9DFF5` (mid) → `#F0E5DA` (horizon haze)
- 4–6 large cloud puffs at varying depths (3 parallax layers)
- Each puff: 280–480px, 12–20% opacity, soft radial falloff
- Continuous drift: x-translate ±120 over 18–28s, ease `breath` preset
- Subtle film grain (1.5% opacity) for texture
- One volumetric light shaft descending from top center (slow pulse, 6s loop)

### Hero medallion (Login)
- 160px concentric rings: 3 rings of decreasing radius, soft white/cyan glow
- Continuous slow rotation (0.05 rad/s)
- Center holds the VEX wing glyph in white at 80% opacity
- Replaces the static text mark as the brand anchor

### Typography
- Display: serif (use system `serif` fontFamily — Playfair/SF-Serif-equivalent)
  - Login title: 44pt, weight 500, tracking -0.5
  - Onboarding titles: 32pt, weight 500
- Body: Inter (existing token)
  - Body 16pt / 22pt line-height
  - Caption 12pt / 16pt

### Glass surface (auth inputs, cards)
- Background: `rgba(255,255,255,0.55)` with `BlurView` intensity 30
- Border: 1px `rgba(255,255,255,0.6)`
- Shadow: 0 12 40 rgba(20, 60, 100, 0.10)
- Radius: 24

### Buttons
- Apple: black pill (`#0A0A0A` text `#FFFFFF`, 56h, radius 28, full-width)
- Google: white pill with subtle border
- Email: ghost text-link with thin underline
- All: 320ms press scale to 0.97, `tactile` spring on release

## Motion Choreography

### Login entrance (1200ms total)
| t (ms) | Element | Effect |
|--------|---------|--------|
| 0 | Sky gradient | Fade in, 600ms `enter` |
| 100 | Cloud layer 3 (back) | Fade + translateY 40, 700ms `cinematicReveal` |
| 200 | Cloud layer 2 | Fade + translateY 32, 700ms `cinematicReveal` |
| 300 | Cloud layer 1 (front) | Fade + translateY 24, 700ms `cinematicReveal` |
| 500 | Light shaft | Fade in, 900ms `dramatic` |
| 600 | Medallion | Scale 0.8→1 + opacity, 700ms `lively` spring |
| 800 | Title "VEX" | Per-letter stagger 30ms, each `enter` 320ms |
| 1000 | Buttons | Stagger 80ms, `settle` spring |
| 1100 | Email link | Fade, `microFade` |

### Onboarding step transition
- 380ms shared-axis slide: outgoing translateX -40 + opacity 0; incoming translateX 40 → 0 + opacity 0 → 1
- Cloud puffs do NOT reset (continuous background, never re-animates per step)
- Hero orb persists and translates between steps with a 1.2x overshoot via `lively` spring

### Ambient (always running)
- Sky `breath`: saturation 0.96→1.04 over 5200ms
- Cloud puffs: x-drift loops, 18–28s
- Medallion: continuous slow rotation
- Light shaft: pulse opacity 0.5→0.9 over 6s

### Reduced motion
- All `useReducedMotion()` checks at component root
- On reduced: skip cloud drift, medallion rotation, light shaft pulse; keep entrance fades only

## Architecture

### New components
- `src/screens/auth/components/ethereal/EtherealSkyBackground.tsx` — gradient + grain + light shaft
- `src/screens/auth/components/ethereal/CloudPuff.tsx` — single puff with drift loop
- `src/screens/auth/components/ethereal/LightShaft.tsx` — top beam
- `src/screens/auth/components/ethereal/EtherealMedallion.tsx` — concentric rings
- `src/screens/auth/components/ethereal/SerifTitle.tsx` — per-letter stagger
- `src/screens/auth/components/ethereal/GlassSurface.tsx` — BlurView wrapper
- `src/screens/auth/components/ethereal/EtherealAuthButtons.tsx` — Apple/Google/Email
- `src/screens/auth/components/ethereal/index.ts`

### New onboarding pieces
- `src/screens/onboarding/components/ethereal/EtherealOnboardingShell.tsx` — shared layout with sky bg + orb + step transition
- `src/screens/onboarding/components/ethereal/HeroOrb.tsx` — persistent orb element
- `src/screens/onboarding/components/ethereal/FloatingChoiceCard.tsx` — choice card with float
- `src/screens/onboarding/components/ethereal/StepTransition.tsx` — shared-axis wrapper

### Files kept (logic untouched)
- All `features/auth/**` — no changes (service, repository, hooks, schemas)
- All `features/onboarding/**` — no changes
- `useLoginScreen`, `useOnboardingFlow` — no changes
- Navigation types — no changes

### Files modified
- `src/screens/auth/LoginScreen.tsx` — swap visual layer to EtherealSky* components
- `src/screens/auth/RegisterScreen.tsx` — same swap
- `src/screens/auth/ForgotPasswordScreen.tsx` — same swap
- `src/screens/onboarding/OnboardingFlowScreen.tsx` — wrap in EtherealOnboardingShell
- `src/screens/onboarding/components/OnboardingFlowLayout.tsx` — adopt new shell visuals

## Token additions (theme/tokens)
- `theme/tokens/ethereal-sky.ts` — gradient stops, cloud opacity, glass surface rgba, button fills
- `theme/tokens/launch-colors.ts` — keep as-is (used elsewhere)
- `theme/tokens/motion.ts` — keep as-is (already has breath/cinematicReveal/settle/lively)

## Accessibility
- All buttons: `accessibilityLabel`, `accessibilityRole="button"`, `accessibilityHint`
- Min touch target 44x44 (existing `getMinTouchTargetStyle`)
- Cloud puffs: `pointerEvents="none"`, `accessibilityElementsHidden`
- Reduced motion path implemented

## Error/Edge states
- Loading: keep existing `OnboardingLoadingState`; wrap in shell
- Error: keep existing `OnboardingErrorState`; wrap in shell
- Signed-out: keep existing `SignedOutOnboardingState`; wrap in shell
- Offline: degraded banner unchanged

## Out of scope (this PR)
- `WelcomeScreen` (feature/onboarding) — left for follow-up
- `CompanionRevealScreen` — left for follow-up
- Other auth screens (VerifyEmail, ResetPassword) — kept visually consistent only if simple
- Tests for new components (added after impl)

## Verification
- `npx tsc --noEmit` — no errors
- Visual: take a screenshot of Login + each Onboarding step in dev build
- All existing auth + onboarding tests still pass
