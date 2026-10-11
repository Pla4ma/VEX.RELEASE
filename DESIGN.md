# VEX Design Contract

## Source of truth
- Status: Active reset direction
- Last refreshed: 2026-08-26
- Primary product surfaces: Home, Focus, Progress, Profile, onboarding, auth, session loop, AI coach, Study, Settings, paywall, notifications, achievements, companion, challenges, boss, comeback, streak recovery.
- Evidence reviewed: `src/screens/**`, `src/features/**/components/**`, `src/components/**`, `src/navigation/**`, `src/theme/**`, `assets/**`, local Expo web screenshots at 390px, and the supplied mobile screenshots.

## Brand
- Personality: focused, warm, intelligent, quietly dramatic, human, slightly gameful without becoming childish.
- Trust signals: readable copy, honest progress, predictable navigation, calm states, visible recovery paths, opaque surfaces when needed.
- Avoid: low-contrast glass, mint-first identity, giant floating capsules, nested cards, empty decorative circles, dashboard clutter, generic purple-blue gradients, fake gamification, development labels in user-facing UI.
- Core brand colors: ember orange and violet purple. Orange means action, energy, and momentum. Purple means depth, reflection, and progression.

## Product goals
- Goals: help a user choose and complete the next useful focus block; turn completed work into a legible personal rhythm; progressively reveal deeper tools without overwhelming day one.
- Non-goals: expose every internal metric on the home screen; make the app resemble a desktop dashboard; use visual effects as a substitute for hierarchy.
- Success signals: primary action is obvious within three seconds; every screen has one dominant job; no content is obscured by navigation; light and dark themes remain readable; first-session users understand what to do next without learning the whole system.

## Personas and jobs
- Primary personas: overwhelmed knowledge worker, student building a study rhythm, returning user recovering momentum.
- User jobs: start a manageable block, understand what changed, resume without shame, choose the right mode for current energy, inspect progress without being buried in metrics.
- Key contexts of use: one-handed phone use, low-energy moments, bright daylight and dim rooms, intermittent connectivity, short check-ins between tasks.

## Information architecture
- Primary navigation: Home, Focus, Progress, Profile. Maximum four top-level tabs.
- Core routes/screens: Home -> Focus/session setup -> Active session -> Completion; Home -> Study/Coach/Quest/Plan; Progress -> Plan/Analytics/Achievements; Profile -> Mastery/Activity/Settings.
- Content hierarchy: one next action first, current state second, supporting evidence third, deeper tools behind explicit navigation.

## Design principles
- **One confident next move:** every screen has one visually dominant action or insight.
- **Readability before atmosphere:** opaque contrast wins; gradients and texture are optional enhancements.
- **Warm precision:** orange supplies energy; purple supplies depth; neutrals carry the reading load.
- **Progressive disclosure:** reveal complexity as behavior earns it; do not show every system on day one.
- **Mobile-native composition:** design for thumb reach, safe areas, vertical rhythm, and short readable measures.
- Tradeoffs: visual drama is allowed in hero moments, but dense data and destructive actions stay restrained; gameful signals are supportive, never louder than the focus action.

## Visual language
- Color: Light base `#FFF9F5` with ink plum `#241A2E`; dark base `#17121F` with warm cream `#FFF7F0`; ember orange `#F06435` for primary actions; violet `#7654D6` for progression and selected states; lavender and apricot are supporting tones only. Use semantic tokens, never raw values in screens.
- Typography: Urbanist remains the shipped family for compatibility, with a disciplined scale: display 34/40, screen title 28/34, section title 20/26, body 16/24, label 13/18, metadata 12/16. Use weight and spacing for hierarchy, not uppercase tracking everywhere.
- Spacing/layout rhythm: 4pt base with 8pt rhythm; horizontal gutter 20pt phone, 24pt tablet; section gaps 28-36pt; bottom content inset must include tab bar and safe area.
- Shape/radius/elevation: cards 20pt, controls 14pt, compact chips 10pt, avatars fully round. Prefer one surface per grouping. Shadows are soft, warm, and sparse; borders are visible but quiet.
- Motion: Reanimated only; 150-260ms micro-interactions, spring for selection/press where it communicates physicality, no decorative motion in repeated workflows, reduced-motion aware.
- Imagery/iconography: use existing water/mascot imagery only when it communicates mode or state; new custom marks should be vector-based, orange/purple, and consistent in stroke/filled logic. Avoid blank circles and generic icon packs.

## Components
- Existing components to reuse: `Text`, `Icon`, `LiquidButton` (restyled), `GlassCard` (opaque/frosted variants only), `AppScreen`, `FeatureScreen`, `VexTabBar`, `TabButton`, error/empty/loading states.
- New/changed components: `VexSurface`, `VexHeader`, `VexPrimaryButton`, `VexMetric`, `VexSectionHeader`, `VexModeCard`, `VexTabBar` reset, and screen-specific compositions built from these primitives.
- Variants and states: default, pressed, selected, disabled, loading, empty, error, offline, optimistic success. Every interactive element has a 44pt minimum target and native accessibility semantics.
- Token/component ownership: colors, type, spacing, radii, elevation, motion, and z-index belong in `src/theme/tokens/`; screen files compose; business logic remains in hooks/services/repositories.

## Accessibility
- Target standard: WCAG-inspired AA contrast plus iOS/Android native accessibility expectations.
- Keyboard/focus behavior: web tab order follows visual order; native focus order follows the content hierarchy.
- Contrast/readability: normal text >=4.5:1; large text >=3:1; never rely on orange/purple alone to communicate state.
- Screen-reader semantics: every icon-only action has label, role, and hint; selected tabs announce selected state; charts expose text summaries.
- Reduced motion and sensory considerations: honor `useReducedMotion`; no flashing or continuous decorative animation; keep texture subtle.

## Responsive behavior
- Supported breakpoints/devices: 320-430pt phones first; tablets widen gutters and use two-column opportunities only where content benefits.
- Layout adaptations: all primary actions stack or become full-width on narrow phones; no horizontal overflow; bottom navigation reserves its actual measured height.
- Touch/hover differences: press feedback for touch; hover only on web pointers; never depend on hover.

## Interaction states
- Loading: skeleton matches final geometry; no spinner-only screen.
- Empty: explain what becomes possible and provide one action.
- Error: VEX-voiced explanation with retry and degraded fallback.
- Success: show the new state and next useful step.
- Disabled: explain why and preserve readable contrast.
- Offline/slow network: persistent but compact offline banner; cached content remains usable; writes show queued state.

## Content voice
- Tone: direct, warm, observant, never performatively motivational.
- Terminology: focus block, rhythm, progress, next move, plan, companion; avoid developer labels and unexplained game jargon.
- Microcopy rules: short sentences, one idea per line, action labels start with verbs, never use placeholder copy in production states.

## Implementation constraints
- Framework/styling system: Expo SDK 57 React Native, TypeScript strict, React Navigation 6, Reanimated 4.5.1, existing token/theme architecture.
- Design-token constraints: no hardcoded colors, spacing, font sizes, or radii in screen/component code; no `StyleSheet.create`.
- Performance constraints: avoid full-screen blur and expensive layered effects by default; reserve imagery and animation for meaningful moments; keep lists virtualized.
- Compatibility constraints: iOS, Android, web preview; native glass must never be required for readability.
- Test/screenshot expectations: verify 320/390/430pt portrait, light/dark, reduced motion, scroll-to-bottom, authenticated and signed-out boundaries, and every primary route.

## Open questions
- [ ] Final orange/purple logo mark and app icon direction / owner: product / impact: brand recognition.
- [ ] Whether the default appearance should follow system or ship light-first / owner: product / impact: first-run visual impression.
- [ ] Whether the gameful XP layer remains prominent or moves behind Progress / owner: product / impact: profile information architecture.
- [ ] Provisioning path for generated illustration assets; current fal.ai MCP is not connected in this environment / owner: engineering / impact: asset pipeline.
