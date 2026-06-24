# VEX Native Glass + Atmosphere Migration Plan

**Date:** June 23, 2026  
**Project:** VEX Expo app  
**Primary execution target:** AI coding agent working inside the VEX codebase  
**Main goal:** Replace the app’s failed / fake / muddy liquid-glass attempt with a controlled, native, iOS-first, high-performance VEX glass system using the installed Expo SDK 56 packages.


---

## 0A. June 23, 2026 research snapshot used for this plan

This plan was created for the user’s **June 23, 2026** VEX app state and is intentionally based on current Expo SDK 56 / iOS-native UI direction, plus the uploaded VEX codebase. The agent should treat this section as background context, not as work to execute.

### Primary implementation sources

- Expo GlassEffect documentation: `expo-glass-effect` renders native iOS Liquid Glass through `UIVisualEffectView`, exposes `GlassView` / `GlassContainer`, is bundled around SDK 56, and falls back to normal `View` on unsupported platforms. It also has known caveats around parent opacity and glass disappearing/flickering in some navigation/theme-transition cases.
  - Source: https://docs.expo.dev/versions/latest/sdk/glass-effect/
  - Issue references discovered during research:
    - https://github.com/expo/expo/issues/41025
    - https://github.com/expo/expo/issues/43732
    - https://github.com/expo/expo/issues/43743

- Expo MeshGradient documentation: `expo-mesh-gradient` exposes SwiftUI MeshGradient to React Native and is bundled for SDK 56. It should be used as a calm atmospheric layer behind glass, not as noisy foreground decoration.
  - Source: https://docs.expo.dev/versions/latest/sdk/mesh-gradient/

- Expo Haptics documentation: `expo-haptics` provides iOS haptic engine access and should be centralized through semantic helpers rather than scattered direct calls.
  - Source: https://docs.expo.dev/versions/latest/sdk/haptics/

- Apple design guidance: Apple describes Liquid Glass as a distinct functional layer for navigation and controls, not as a universal background texture. This plan follows that principle but adapts it into a VEX-specific pearl/mint productivity material.
  - Source: https://developer.apple.com/design/human-interface-guidelines/materials
  - Source: https://www.apple.com/newsroom/2025/06/apple-introduces-a-delightful-and-elegant-new-software-design/

### Public discussion / trend signals checked

The research pass also checked public web-indexed discussion around Expo SDK 56, Liquid Glass, Expo UI, and React Native UI direction. X/Twitter search results were limited by public indexing and should not be treated as exhaustive live Twitter analysis. The useful signal was consistent: the React Native / Expo community is moving toward **native platform material primitives**, not web-style fake glass wrappers. Relevant indexed sources included Expo docs, GitHub issues, npm package metadata, Apple design sources, and public Expo/React Native discussion pages.

### Key research conclusions

1. **Native glass is valuable but fragile.** Use it for shells, navigation, hero surfaces, selected controls, and sheets. Do not apply it blindly to hundreds of cards.
2. **Opacity animation is dangerous for native glass.** Do not animate `opacity: 0` on `GlassView` or parent views. Prefer remount/key strategies, native glass animation props when available, or animate sibling overlays instead.
3. **Theme switching can expose glass update bugs.** If `colorScheme` does not update visually, remount the native glass surface with a key that includes the theme.
4. **Navigation transitions can flicker.** Keep native glass on stable shells and avoid mounting/unmounting large glass surfaces during aggressive screen transitions.
5. **Mesh gradient should be quiet.** It should make glass feel alive, not become a rainbow background.
6. **Haptics should be semantic.** VEX should have named haptic meanings like `tabPress`, `modeSwitch`, `heroPress`, `glassToggle`, and `completion`, instead of raw random haptic calls.
7. **The winning direction is not “more blur.”** It is native material + clear hierarchy + readable text + rare surreal detail.

---

## 0. Read this first

This file is the **source of truth** for the VEX native glass migration.

Do **not** treat this as a loose design brainstorm. Treat it as an engineering execution plan. The agent must read this file before every phase and must only execute the requested phase.

The app already attempted a liquid-glass visual language, but the result was poor. The fix is not to add more gradients, not to make every surface blurry, and not to wrap everything in native glass. The fix is to create a layered design system:

1. **Native material layer** from `expo-glass-effect`.
2. **Living atmospheric layer** from `expo-mesh-gradient`.
3. **Physical feedback layer** from `expo-haptics`.
4. Existing VEX glass assets retained only where they improve the result.
5. Fake old liquid-glass wrappers either integrated, softened, or bypassed intentionally.

The first three packages are the focus of this migration:

| Priority | Package | Role |
|---:|---|---|
| 1 | `expo-glass-effect` | Real native iOS glass surfaces. |
| 2 | `expo-mesh-gradient` | Premium living backgrounds and aura fields behind glass. |
| 3 | `expo-haptics` | Physical feel for the glass UI. |

The user installed more than these packages, but this plan focuses on the first three. Do not expand scope into widgets, native tabs, Expo UI controls, storage, or unrelated architecture unless a later explicit prompt asks for it.

---

## 1. Current project facts

The VEX app is an Expo / React Native app. Based on the uploaded codebase and user-provided package output, the relevant stack is:

| Area | Current project state |
|---|---|
| Expo SDK | SDK 56 / `expo ~56.0.11` |
| React Native | `0.85.3` |
| React | `19.2.3` |
| App target | iOS-first |
| Build type | Development build, not Expo Go |
| Existing visual direction | Light, pearl, mint, atmospheric, glass-heavy |
| Existing mode/theme | Light mode current; dark mode feature exists |
| Existing animation libs | Reanimated 4.3.1, Skia 2.6.4, Rive |
| Existing fallback blur | `expo-blur` |
| Existing gradient | `expo-linear-gradient` |
| Existing haptics | `expo-haptics`, haptic utility wrappers already exist |
| Existing repeated cards | Many `GlassCard` usages |
| Existing custom tab bar | `src/navigation/components/VexTabBar.tsx` |
| Existing glass tokens | `src/theme/tokens/vex-light-glass.ts` |

The codebase contains a mature custom UI system. This migration must **upgrade the design system**, not replace the entire app UI.

---

## 2. Official package notes the agent must respect

These notes are based on current Expo documentation as of June 23, 2026:

### `expo-glass-effect`

- `GlassView` renders the native iOS glass effect.
- The module supports different glass styles and tint customization.
- The module includes `GlassContainer` for grouping / composing glass surfaces.
- It is native glass, not web CSS glass.
- It requires a native build path. The user is already using a development build.
- Do not assume it works in Expo Go.
- Avoid opacity animation directly on glass views or parents if it causes disappearing / invalid rendering. Use wrapper layering carefully.
- On unsupported platforms or unsupported runtime conditions, the app must fall back gracefully to existing `expo-blur` / `LinearGradient` / `View` material.

### `expo-mesh-gradient`

- Exposes SwiftUI `MeshGradient` to React Native.
- Use it as background atmosphere, not as a foreground content card.
- It should be slow, subtle, and premium.
- Do not place complex mesh gradients inside every card.
- Do not animate aggressively.

### `expo-haptics`

- Provides access to iOS haptic feedback, Android vibration effects, and web vibration API.
- VEX already has haptic wrapper files. Do not scatter raw `Haptics.*` calls randomly throughout the app.
- Extend / route through existing haptic utilities where possible.
- Haptics should feel intentional, not spammy.

---

## 3. Existing VEX design system inventory

The app already has a large glass system under:

```txt
src/components/glass/
```

Important existing files:

```txt
src/components/glass/GlassScreen.tsx
src/components/glass/GlassCard.tsx
src/components/glass/GlassCard.tokens.ts
src/components/glass/GlassCard.edges.tsx
src/components/glass/GlassCard.gradients.tsx
src/components/glass/GlassBlurLayer.tsx
src/components/glass/GlassPill.tsx
src/components/glass/GlassPillSurface.tsx
src/components/glass/LiquidButton.tsx
src/components/glass/LiquidButton.tokens.ts
src/components/glass/LiquidButton.effects.tsx
src/components/glass/LiquidGlassSphere.tsx
src/components/glass/LiquidGlassObject.tsx
src/components/glass/WaterBubble.tsx
src/components/glass/FloatingDroplets.tsx
src/components/glass/GlassRibbon.tsx
src/components/glass/LiquidLens.tsx
src/components/glass/GlassProgressBar.tsx
src/components/glass/LiquidProgressBar.tsx
src/components/glass/index.ts
```

Existing VEX light glass tokens live at:

```txt
src/theme/tokens/vex-light-glass.ts
```

The token file already defines:

- `vexLightGlass.background.pageTop`
- `vexLightGlass.background.pageMid`
- `vexLightGlass.background.pageBottom`
- mint atmosphere tokens
- pearl atmosphere tokens
- glass fill tokens
- glass border tokens
- glass shadows
- `glassMaterials`
- `glassMotion`
- `glassRadius`

These are valuable. Do **not** delete the VEX visual language. The goal is to make it native and premium.

---

## 4. Core visual direction

VEX should not simply copy Apple’s iOS liquid glass. VEX should feel like:

> **Pearl-mint native glass, focused, fluid, quiet, tactile, alive, and more intentional than Apple’s default material.**

The direction is:

```txt
70% native iOS material realism
20% VEX pearl/mint atmosphere
10% surreal liquid art objects
```

Avoid:

```txt
100% every component is glass
100% blur everywhere
100% gradients stacked on gradients
100% opacity animation on glass
100% wet plastic UI
```

The app must remain readable, fast, and calm.

---

## 5. Hard rules for the AI agent

### 5.1 Execution rules

1. Do not execute multiple phases unless explicitly told.
2. Do not rewrite unrelated screens.
3. Do not remove the existing design system wholesale.
4. Do not replace all `GlassCard` usage in one pass.
5. Do not add additional dependencies.
6. Do not convert the app to Expo Router Native Tabs during this plan.
7. Do not introduce web-only liquid-glass libraries.
8. Do not use DOM components / WebView for native glass.
9. Do not change app product logic.
10. Do not change business logic, auth logic, progression logic, streak logic, subscription logic, or database logic.
11. Do not break test IDs or accessibility labels.
12. Do not remove existing tests unless they are obsolete and replaced with better tests.
13. Do not add `// @ts-ignore` or `// @ts-nocheck`.
14. Do not bypass TypeScript errors by loosening types globally.
15. Do not silence lint by disabling entire files.

### 5.2 Visual rules

1. Native glass is for important surfaces, not every repeated list card.
2. Mesh gradient is for background atmosphere, not content surfaces.
3. Haptics are for meaningful interaction points, not every tap.
4. Existing decorative objects like spheres, droplets, lenses, and ribbons should be used rarely.
5. Every glass surface needs readable text contrast.
6. Dark mode must not become muddy.
7. Light mode must remain the primary premium direction.
8. Avoid nested glass inside glass unless intentional and tested.
9. Avoid stacking native glass over old `GlassBlurLayer` without deciding whether the fallback layer should remain.
10. Do not animate opacity directly on native glass surfaces unless verified stable.

### 5.3 Performance rules

1. Limit native glass surfaces per screen.
2. Do not use native glass for every row in a long list.
3. Do not place `MeshGradient` inside repeated cards.
4. Do not re-render mesh gradients on every state change.
5. Memoize glass primitives where sensible.
6. Keep animated glass wrappers stable.
7. Use `pointerEvents="none"` for decorative layers.
8. Prefer fixed overlays and hero surfaces over scroll-heavy repeated glass.
9. Avoid expensive shadows inside frequently scrolling lists.
10. Use fallback material on unsupported platforms and during tests.

---

## 6. Top-three migration architecture

The top-three package architecture is:

```txt
src/components/glass/native/
  glassAvailability.ts
  NativeGlassSurface.tsx
  NativeGlassContainer.tsx
  NativeGlassOverlay.tsx
  NativeGlassDebug.tsx

src/components/atmosphere/
  VexMeshAtmosphere.tsx
  VexScreenAtmosphere.tsx
  atmosphereTokens.ts

src/shared/feedback/
  GlassHaptics.ts
```

The exact file names may be adjusted to match existing conventions, but the architecture should remain:

1. **Native glass primitives** under `src/components/glass/native/`.
2. **Atmosphere primitives** under `src/components/atmosphere/` or integrated into `GlassScreen` only if simpler.
3. **Haptic mapping** through existing haptic utilities.

---

## 7. Native glass primitive design

### 7.1 `glassAvailability.ts`

Purpose:

- Centralize native glass capability checks.
- Prevent scattered platform checks.
- Provide one place for test mocks.
- Return `false` on unsupported platforms or test environments if needed.

Expected API:

```ts
export function canUseNativeGlass(): boolean;
export function getGlassRuntimeLabel(): string;
```

Implementation notes:

- Use `Platform.OS === 'ios'`.
- Use availability functions exported by `expo-glass-effect` if present in the installed version.
- If the installed version exposes different function names, inspect `node_modules/expo-glass-effect` and adapt safely.
- Do not crash if availability functions are missing. Prefer safe fallback.
- Tests should be able to mock this file.

Pseudo implementation:

```tsx
import { Platform } from 'react-native';
import * as GlassEffect from 'expo-glass-effect';

export function canUseNativeGlass(): boolean {
  if (Platform.OS !== 'ios') return false;

  const apiAvailable =
    typeof GlassEffect.isGlassEffectAPIAvailable === 'function'
      ? GlassEffect.isGlassEffectAPIAvailable()
      : true;

  const liquidAvailable =
    typeof GlassEffect.isLiquidGlassAvailable === 'function'
      ? GlassEffect.isLiquidGlassAvailable()
      : true;

  return Boolean(apiAvailable && liquidAvailable);
}

export function getGlassRuntimeLabel(): string {
  if (Platform.OS !== 'ios') return 'fallback-non-ios';
  return canUseNativeGlass() ? 'native-ios-glass' : 'fallback-ios';
}
```

Important: The final implementation must use the actual installed package types, not blind guessing.

---

### 7.2 `NativeGlassSurface.tsx`

Purpose:

- One VEX-native glass wrapper.
- Automatically uses `GlassView` when available.
- Automatically falls back to VEX’s current fake glass material when native glass is unavailable.
- Provides a consistent API for cards, nav, pills, sheets, hero surfaces.

Expected props:

```ts
type NativeGlassSurfaceVariant =
  | 'subtle'
  | 'regular'
  | 'hero'
  | 'nav'
  | 'pill'
  | 'sheet'
  | 'selected';

interface NativeGlassSurfaceProps {
  children?: React.ReactNode;
  variant?: NativeGlassSurfaceVariant;
  radius?: number;
  interactive?: boolean;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  testID?: string;
  accessibilityLabel?: string;
  pointerEvents?: ViewProps['pointerEvents'];
}
```

Expected behavior:

- Preserve accessibility props.
- Preserve `testID`.
- Use `overflow: 'hidden'` cautiously.
- Allow content padding through `contentStyle`, not hardcoded inside every use.
- Keep fallback visually close to VEX tokens.
- Do not include heavy decorative effects by default.
- Do not include mesh gradient inside this component.

Native mode:

- Render `GlassView` from `expo-glass-effect`.
- Use the appropriate glass style based on variant.
- Use tint colors based on VEX tokens.
- Use `colorScheme` mapped from theme if easily accessible; otherwise start with `light` and later add theme mapping.

Fallback mode:

- Render `View`.
- Use `BlurView` if safe.
- Use `LinearGradient` for pearl highlight.
- Use VEX border and shadow tokens.
- Do not duplicate old `GlassCard` gradients exactly inside this primitive; keep it clean.

---

### 7.3 `NativeGlassContainer.tsx`

Purpose:

- Wrap multiple glass surfaces where the native API benefits from composition.
- Use `GlassContainer` when available.
- Fall back to a normal `View`.

Expected usage:

- Tab bar shell.
- Segmented controls.
- Clusters of pills.
- Modal action groups.

Do not use it around whole screens unless testing proves it looks and performs well.

---

### 7.4 `NativeGlassOverlay.tsx`

Purpose:

- Optional non-interactive glass sheen layer.
- Helps bridge native glass with VEX art direction.
- Can be used inside hero surfaces or selected nav pills.

Rules:

- Must be `pointerEvents="none"`.
- Must be subtle.
- Must not be required for readability.
- Must not be used inside every card.

---

## 8. Mesh atmosphere design

### 8.1 Why mesh gradient matters

The app currently uses stacked `LinearGradient` backgrounds in `GlassScreen`. That is not wrong, but it can look flat. Mesh gradient should create slow, organic light fields behind native glass.

The goal is not “rainbow background.” The goal is:

- pearl breathing field
- mint/cyan focus aura
- warm orange streak-risk aura
- subtle mode atmosphere
- better depth behind glass

### 8.2 `VexMeshAtmosphere.tsx`

Expected props:

```ts
type VexAtmosphereVariant =
  | 'home'
  | 'focus'
  | 'progress'
  | 'profile'
  | 'session'
  | 'default';

interface VexMeshAtmosphereProps {
  variant?: VexAtmosphereVariant;
  animated?: boolean;
  intensity?: 'quiet' | 'normal' | 'expressive';
  style?: StyleProp<ViewStyle>;
}
```

Implementation rules:

- Render full-screen behind content.
- Use `pointerEvents="none"`.
- Use mesh gradient only once per screen.
- Fall back to existing `LinearGradient` background if mesh gradient unavailable or unsupported.
- Do not animate every point unless performance is verified.
- If animation is used, it should be extremely slow and optional.

### 8.3 Recommended atmosphere mapping

| Variant | Visual intention |
|---|---|
| `home` | Pearl + mint + very light warm tone. |
| `focus` | Pearl + cyan + mint, calm and clean. |
| `progress` | Pearl + mint + subtle purple/achievement accent. |
| `profile` | Pearl + warm highlight + mint. |
| `session` | Deep focus, reduced noise, less decorative. |
| `default` | Pearl/mint neutral. |

### 8.4 Integration target

First integration should be `GlassScreen.tsx`, not every screen individually.

Current `GlassScreen` already has:

```txt
GlassScreenAtmosphere
LinearGradient background
variant prop
safe area content wrapper
```

The agent should either:

1. Replace `GlassScreenAtmosphere` internals with `VexMeshAtmosphere` plus fallback, or
2. Keep `GlassScreenAtmosphere` and have it call `VexMeshAtmosphere`.

Do not break the public `GlassScreen` API.

---

## 9. Haptic design

### 9.1 Current haptic system

The app already has:

```txt
src/shared/feedback/HapticEngine.ts
src/utils/haptics.ts
src/utils/haptics-actions.ts
src/utils/haptics-types.ts
src/constants/haptics.ts
```

This is good. Do not scatter raw haptic calls everywhere.

### 9.2 Create `GlassHaptics.ts`

Purpose:

- Map visual glass interactions to tactile feedback.
- Keep haptics consistent.
- Prevent overuse.

Expected API:

```ts
export const glassHaptics = {
  tabPress(): Promise<void>;
  selectedPill(): Promise<void>;
  heroPress(): Promise<void>;
  sheetSnap(): Promise<void>;
  primaryAction(): Promise<void>;
  completion(): Promise<void>;
  disabled(): Promise<void>;
};
```

Implementation should route through existing `haptics` or `triggerHaptic` wrappers.

Recommended mapping:

| Interaction | Haptic |
|---|---|
| Tab switch | selection |
| Selected pill change | selection/light impact |
| Hero CTA press | medium impact |
| Primary action success | success notification |
| Bottom sheet snap | light impact |
| Disabled / blocked action | warning or light impact, very sparingly |
| Session completion | success / celebration pattern |
| Long press | medium impact |

### 9.3 Haptic restraint rules

- One haptic per user intent, not per animation frame.
- No haptic on passive animations.
- No haptic on automatic state updates.
- No haptic on scroll.
- No haptic on every card press if the screen has many card presses; use only meaningful selections.
- Respect existing HapticEngine cooldown.

---

## 10. Surface priority map

This is the most important product/design prioritization section.

### 10.1 Native glass surfaces to do first

| Priority | Surface | File / area | Why |
|---:|---|---|---|
| 1 | Bottom tab shell | `src/navigation/components/VexTabBar.tsx` | Highest repeated visual presence. |
| 2 | Home hero / main identity surface | `src/screens/home/HomeHero.tsx`, `HomeHeroCard.tsx`, `VexFocusSurface.tsx` | First impression and core product emotion. |
| 3 | Mode / segmented selectors | profile tabs, mode pills, top controls | Small surfaces, high tactile payoff. |
| 4 | Bottom sheets / modals | `@gorhom/bottom-sheet` usage | Native glass sheet background is premium. |
| 5 | Profile header / progress header | Profile + Progress screens | High-value static surfaces. |

### 10.2 Native glass surfaces to avoid at first

| Surface | Reason |
|---|---|
| Every `GlassCard` instance | Too many repeated surfaces. Performance and visual mud risk. |
| Long list rows | Scrolling + backdrop sampling risk. |
| Every button | Haptic/visual fatigue. |
| Decorative droplets/spheres | They are art objects, not native material surfaces. |
| Deep nested glass | Risk of washed-out UI. |

### 10.3 Hybrid rule

Use native glass for the **shell and hero material**, keep custom VEX gradients as **art/detail**, not as the base.

```txt
Native glass = material truth
VEX gradients = taste/art direction
Mesh gradient = environment
Haptics = physicality
```

---

## 11. Phase overview

The AI agent must not run all phases at once.

| Phase | Name | Scope |
|---:|---|---|
| 0 | Audit and guardrails | Inspect existing glass; no major UI changes. |
| 1 | Native glass foundation | Add primitives only. |
| 2 | Mesh atmosphere foundation | Add screen atmosphere primitive and integrate into `GlassScreen`. |
| 3 | Haptic foundation | Add glass haptic mapping and wire lowest-risk interactions. |
| 4 | Tab bar migration | Upgrade `VexTabBar` using native glass + haptics. |
| 5 | Hero surface migration | Upgrade home hero / primary surfaces. |
| 6 | Mode/pill migration | Upgrade selected pills/segmented controls. |
| 7 | Bottom sheet migration | Upgrade modal/sheet backgrounds. |
| 8 | Cleanup bad old liquid glass | Remove or downgrade failed duplicate liquid-glass wrappers. |
| 9 | Performance pass | Reduce overdraw, verify scroll, memoize. |
| 10 | Final polish | Dark mode, accessibility, tests, visual consistency. |

The user said to focus on the first three packages. That means Phases 0-7 are valid because they use `expo-glass-effect`, `expo-mesh-gradient`, and `expo-haptics`. Do not bring in the other installed packages unless necessary for compatibility.

---

# PHASE 0 — Audit and guardrails

## Objective

Create a precise inventory of existing glass usage and identify the bad liquid-glass attempts that should not be blindly stacked with native glass.

## Agent prompt to execute Phase 0

```txt
Read VEX_NATIVE_GLASS_PHASES.md fully.
Execute PHASE 0 only.
Do not implement new UI yet.
Do not install packages.
Do not modify business logic.

Tasks:
1. Inspect all existing glass-related files under src/components/glass and src/shared/ui/liquid-glass.
2. Inspect VexTabBar, HomeHero, HomeHeroCard, VexFocusSurface, ProfileGlassTabs, ProgressHeader, and bottom sheet usage.
3. Create or update docs/VEX_GLASS_AUDIT.md with:
   - current glass primitives
   - usage hotspots
   - repeated-card risks
   - failed/duplicate liquid-glass wrappers
   - recommended migration targets
   - files safe to modify in Phase 1
   - files that should not be touched yet
4. Do not make visual component changes in Phase 0.
5. Run typecheck if available.

Report:
- files inspected
- files changed
- risks found
- exact recommended Phase 1 starting point
```

## Files to inspect

```txt
src/components/glass/GlassCard.tsx
src/components/glass/GlassCard.tokens.ts
src/components/glass/GlassCard.edges.tsx
src/components/glass/GlassCard.gradients.tsx
src/components/glass/GlassScreen.tsx
src/components/glass/GlassBlurLayer.tsx
src/components/glass/GlassPill.tsx
src/components/glass/GlassPillSurface.tsx
src/components/glass/LiquidButton.tsx
src/components/glass/index.ts
src/shared/ui/liquid-glass/LiquidGlassCard.tsx
src/shared/ui/liquid-glass/LiquidGlassHeader.tsx
src/shared/ui/liquid-glass/LiquidGlassScreen.tsx
src/shared/ui/liquid-glass/liquidGlassTokens.ts
src/navigation/components/VexTabBar.tsx
src/navigation/components/TabButton.tsx
src/screens/home/HomeHero.tsx
src/screens/home/components/HomeHeroCard.tsx
src/screens/home/components/VexFocusSurface.tsx
src/screens/profile/components/ProfileGlassTabs.tsx
src/screens/progress/components/ProgressHeader.tsx
src/shared/feedback/HapticEngine.ts
src/utils/haptics.ts
src/utils/haptics-actions.ts
src/utils/haptics-types.ts
```

## Phase 0 acceptance criteria

- `docs/VEX_GLASS_AUDIT.md` exists.
- It names concrete files and risks.
- No broad UI rewrite happened.
- No package install happened.
- Typecheck either passes or failures are documented as pre-existing.

---

# PHASE 1 — Native glass foundation

## Objective

Add the native glass primitive layer without changing major screens yet.

## Agent prompt to execute Phase 1

```txt
Read VEX_NATIVE_GLASS_PHASES.md fully.
Read docs/VEX_GLASS_AUDIT.md if it exists.
Execute PHASE 1 only.
Do not continue to tab bar or hero migration.
Do not rewrite GlassCard yet except for exports if needed.
Do not remove old glass components.

Tasks:
1. Create src/components/glass/native/glassAvailability.ts.
2. Create src/components/glass/native/NativeGlassSurface.tsx.
3. Create src/components/glass/native/NativeGlassContainer.tsx.
4. Create src/components/glass/native/NativeGlassOverlay.tsx only if needed.
5. Export the new native glass primitives from src/components/glass/index.ts.
6. Add lightweight tests or test mocks if the existing test setup requires them.
7. Add safe fallbacks using expo-blur + expo-linear-gradient + VEX tokens.
8. Preserve accessibilityLabel, testID, pointerEvents, style, and contentStyle.
9. Use TypeScript strictness. No ts-ignore.
10. Run typecheck and relevant tests.

Report:
- files changed
- exact API added
- fallback behavior
- test/typecheck result
- any uncertainty about expo-glass-effect prop names
```

## Implementation requirements

The primitive must be safe and boring. It is not the place for extreme visual creativity.

### `glassAvailability.ts`

Requirements:

- Must never throw just because `expo-glass-effect` is unavailable in Jest.
- Must support mockability.
- Must centralize all platform checks.
- Must return fallback on non-iOS.
- Must return fallback if native API says unavailable.

Recommended shape:

```tsx
import { Platform } from 'react-native';
import * as GlassEffect from 'expo-glass-effect';

export function canUseNativeGlass(): boolean {
  if (Platform.OS !== 'ios') return false;

  const apiAvailable =
    typeof GlassEffect.isGlassEffectAPIAvailable === 'function'
      ? GlassEffect.isGlassEffectAPIAvailable()
      : true;

  const liquidAvailable =
    typeof GlassEffect.isLiquidGlassAvailable === 'function'
      ? GlassEffect.isLiquidGlassAvailable()
      : true;

  return Boolean(apiAvailable && liquidAvailable);
}

export function getGlassRuntimeLabel(): string {
  if (Platform.OS !== 'ios') return 'fallback-non-ios';
  return canUseNativeGlass() ? 'native-ios-glass' : 'fallback-ios';
}
```

Adapt to actual installed exports if the package type definitions differ.

### `NativeGlassSurface.tsx`

Requirements:

- Use `GlassView` when `canUseNativeGlass()` returns true.
- Use fallback `View` / `BlurView` / `LinearGradient` when false.
- Must not hardcode a huge set of visual details.
- Must allow the existing VEX token system to drive fill, border, radius, shadow.
- Must not include mesh gradient.
- Must not include haptic calls.
- Must not import navigation.
- Must not import screen-specific code.

Variant mapping:

| Variant | Native intent | Fallback intent |
|---|---|---|
| `subtle` | faint glass | light blur, low border |
| `regular` | default card material | existing pane-like material |
| `hero` | stronger, more present material | `glassMaterials.hero` inspired |
| `nav` | floating nav shell | `glassMaterials.nav` inspired |
| `pill` | small selected surface | tabPill inspired |
| `sheet` | modal/sheet material | strong blur + large radius |
| `selected` | selected item emphasis | mint-tinted material |

### `NativeGlassContainer.tsx`

Requirements:

- Use `GlassContainer` when available.
- Fall back to `View`.
- Accept `children`, `style`, and a spacing prop if supported by the installed API.
- Keep API small.

### `NativeGlassOverlay.tsx`

Only create if useful. It may render subtle white/mint edge highlights for hero/nav surfaces.

Rules:

- `pointerEvents="none"`.
- No content.
- No haptics.
- No business logic.

## Phase 1 acceptance criteria

- Native glass primitives compile.
- Existing screens still render.
- No visible app-wide changes are required yet.
- The new primitives can be imported from `src/components/glass`.
- Fallback path works in Jest and non-iOS.

---

# PHASE 2 — Mesh atmosphere foundation

## Objective

Add a VEX atmosphere primitive using `expo-mesh-gradient` and integrate it safely into screen backgrounds.

## Agent prompt to execute Phase 2

```txt
Read VEX_NATIVE_GLASS_PHASES.md fully.
Read docs/VEX_GLASS_AUDIT.md if it exists.
Execute PHASE 2 only.
Do not migrate tab bar yet.
Do not migrate hero cards yet.
Do not touch haptics yet.

Tasks:
1. Create src/components/atmosphere/VexMeshAtmosphere.tsx or a similarly named file that matches project conventions.
2. Create src/components/atmosphere/atmosphereTokens.ts if needed.
3. Integrate the atmosphere into GlassScreen without breaking the existing GlassScreen API.
4. Preserve current GlassScreen variants: home, focus, progress, profile, default.
5. Provide fallback to the existing LinearGradient-based background.
6. Ensure mesh atmosphere is rendered once per screen, behind content, pointerEvents none.
7. Avoid aggressive animation.
8. Run typecheck and relevant tests.

Report:
- files changed
- how fallback works
- variants supported
- visual risk areas
- test/typecheck result
```

## Implementation guidance

Current `GlassScreen.tsx` is already a good integration point. It currently renders:

```txt
View root
  GlassScreenAtmosphere
    LinearGradient base
    LinearGradient warm/mint overlay
  Content wrapper with safe area
```

Replace or augment `GlassScreenAtmosphere` carefully.

### Recommended behavior

- Keep `GlassScreen` props unchanged.
- The root should still have a stable background color from `vexLightGlass.background.pageMid`.
- `VexMeshAtmosphere` should be optional internally, but default on for supported runtime.
- Fallback should look close to today’s existing background.
- Use `pointerEvents="none"`.
- Keep content `zIndex` above atmosphere.

### Intensity mapping

| Variant | Intensity | Notes |
|---|---|---|
| `home` | normal | first impression, allow warm aura |
| `focus` | quiet | reduce distraction |
| `progress` | normal | achievement energy, subtle |
| `profile` | normal | warm + identity |
| `default` | quiet | safe fallback |

### Do not

- Do not animate a dozen mesh points continuously.
- Do not add timers that rerender the whole screen every frame.
- Do not add stateful animation before visual verification.
- Do not stack mesh gradient on top of content.
- Do not use colors that destroy the pearl/mint VEX identity.

## Phase 2 acceptance criteria

- `GlassScreen` still works with existing props.
- Existing screens retain spacing and safe-area behavior.
- Atmosphere is behind content.
- Fallback works.
- Typecheck passes or failures are documented.

---

# PHASE 3 — Glass haptic foundation

## Objective

Create a semantic haptic layer for glass interactions using existing VEX haptic utilities.

## Agent prompt to execute Phase 3

```txt
Read VEX_NATIVE_GLASS_PHASES.md fully.
Execute PHASE 3 only.
Do not migrate the tab bar yet unless explicitly requested.
Do not add raw Haptics calls directly to screens.

Tasks:
1. Inspect src/shared/feedback/HapticEngine.ts, src/utils/haptics.ts, src/utils/haptics-actions.ts, and src/utils/haptics-types.ts.
2. Create src/shared/feedback/GlassHaptics.ts or add a clearly separated glass haptic mapping to the existing feedback system.
3. Export semantic glass haptic helpers:
   - tabPress
   - selectedPill
   - heroPress
   - sheetSnap
   - primaryAction
   - completion
   - disabled
4. Route through existing VEX haptic wrappers, not raw scattered expo-haptics calls.
5. Add tests if current test patterns make this easy.
6. Run typecheck and relevant haptic tests.

Report:
- files changed
- haptic mapping table
- how cooldown / no-spam behavior is preserved
- test/typecheck result
```

## Recommended implementation

```ts
import { haptics } from './HapticEngine';

export const glassHaptics = {
  tabPress: () => haptics.selection(),
  selectedPill: () => haptics.selection(),
  heroPress: () => haptics.impact('medium'),
  sheetSnap: () => haptics.impact('light'),
  primaryAction: () => haptics.impact('medium'),
  completion: () => haptics.success('medium'),
  disabled: () => haptics.warning('light'),
};
```

Adapt to actual `HapticEngine` types. The current engine supports:

```txt
success(intensity?)
error(intensity?)
warning(intensity?)
selection()
impact(intensity?)
doubleTap(intensity?)
heartbeat()
celebration()
```

## Phase 3 acceptance criteria

- No raw haptic calls scattered through UI.
- Glass haptics are semantic and centralized.
- Existing cooldown behavior is preserved.
- Tests/typecheck pass or failures are documented.

---

# PHASE 4 — Tab bar migration

## Objective

Upgrade `VexTabBar` to use the native glass foundation and glass haptics.

This is the highest-ROI visual change. The bottom tab bar is always visible and strongly affects perceived app quality.

## Agent prompt to execute Phase 4

```txt
Read VEX_NATIVE_GLASS_PHASES.md fully.
Execute PHASE 4 only.
Use the Phase 1 native glass primitives and Phase 3 haptic helpers.
Do not migrate hero cards yet.
Do not switch to Expo Router Native Tabs.
Do not rewrite navigation architecture.

Tasks:
1. Open src/navigation/components/VexTabBar.tsx.
2. Replace the tab bar shell material with NativeGlassSurface variant="nav".
3. Use NativeGlassContainer if appropriate.
4. Preserve all existing navigation behavior.
5. Preserve pulse behavior for the Start tab.
6. Preserve route labels, focused state, colors, safe-area spacing, and layout.
7. Add glassHaptics.tabPress() to actual tab changes only.
8. Do not trigger haptic if pressing the already-focused tab unless the existing UX expects it.
9. Keep existing edge highlights only if they improve native glass; remove duplicate blur/fill if it causes mud.
10. Run typecheck and relevant navigation tests.

Report:
- files changed
- before/after material behavior
- haptic behavior
- any visual fallback notes
- test/typecheck result
```

## Current file notes

`VexTabBar.tsx` currently:

- Imports `GlassBlurLayer`.
- Uses a `View` shell with `borderRadius: 36`.
- Uses `GlassBlurLayer intensity={82}`.
- Adds a semi-transparent white overlay.
- Adds `LinearGradient` top gloss.
- Adds manual top edge highlights.
- Maps routes to `TabButton`.
- Maintains streak pulse on the Start tab.

Do not break the pulse logic.

## Desired visual result

- Floating tab bar feels like a physical glass object.
- Top edge highlight remains subtle.
- Native glass handles the material; old fake blur should not fight it.
- Active tabs remain readable.
- Haptic selection feels clean.
- Bottom safe area stays correct.

## Specific migration recommendation

Replace the inner shell:

```tsx
<View style={{ borderRadius: 36, height: tabBarHeight, ... }}>
  <GlassBlurLayer ... />
  <View background white overlay />
  <LinearGradient top gloss />
  ...
  <View row>{tabs}</View>
</View>
```

With:

```tsx
<NativeGlassContainer>
  <NativeGlassSurface
    variant="nav"
    radius={36}
    interactive
    style={{ height: tabBarHeight, marginBottom, marginHorizontal }}
    contentStyle={{ flex: 1 }}
  >
    <NativeGlassOverlay variant="nav" />
    <View row>{tabs}</View>
  </NativeGlassSurface>
</NativeGlassContainer>
```

Adapt to actual API.

## Phase 4 acceptance criteria

- Tab navigation still works.
- Safe area still correct.
- Start-tab pulse still works.
- Haptic happens on tab switch.
- Native glass appears on supported iOS.
- Fallback still looks like VEX on unsupported runtime.

---

# PHASE 5 — Hero surface migration

## Objective

Upgrade the most visible home hero / identity surfaces to native glass + mesh atmosphere.

## Agent prompt to execute Phase 5

```txt
Read VEX_NATIVE_GLASS_PHASES.md fully.
Execute PHASE 5 only.
Do not migrate every GlassCard.
Do not touch unrelated home business logic.

Tasks:
1. Inspect HomeHero.tsx, HomeHeroCard.tsx, VexFocusSurface.tsx, and HomeScreenVisuals.tsx.
2. Choose the smallest set of hero surfaces to upgrade first.
3. Use NativeGlassSurface variant="hero" for the primary hero surface or inner hero panels.
4. Keep text contrast strong.
5. Use VexMeshAtmosphere only behind the surface, not inside repeated cards.
6. Add glassHaptics.heroPress or primaryAction only to meaningful pressable hero actions.
7. Preserve loading, first-run, streak-risk, and progress states.
8. Run typecheck and home-related tests.

Report:
- files changed
- surfaces upgraded
- states verified
- visual risks
- test/typecheck result
```

## Current `HomeHero.tsx` notes

`HomeHero` currently:

- Uses a dark/obsidian `LinearGradient` hero background.
- Uses streak-dependent gradient colors.
- Displays VEX label, welcome copy, today focus minutes, narrative, and streak badge.
- Has a right-side block: loading state, onboarding panel, or focus block.
- Uses safe-area top padding.

Be careful: this file may intentionally contrast with the light glass system. Do not destroy readability by making white text sit on bright glass unless text colors are adjusted.

## Design options

### Option A — Native glass card inside existing hero gradient

Lowest risk.

- Keep outer `LinearGradient` hero.
- Wrap right-side `HeroFocusBlock` or inner panels in `NativeGlassSurface`.
- Add subtle haptics to hero CTA.

### Option B — Native glass hero over mesh atmosphere

More ambitious.

- Replace dark hero background with mesh atmosphere + native hero glass.
- Requires careful text contrast.
- Must verify all states.

### Recommended first pass

Start with **Option A**. Do not fully redesign the hero in one pass.

## Phase 5 acceptance criteria

- Home hero still handles loading / first-run / normal states.
- Text remains readable.
- No layout jump on compact widths.
- Native glass appears only where it improves the hero.
- Tests/typecheck pass or failures are documented.

---

# PHASE 6 — Mode/pill migration

## Objective

Upgrade selected pills and segmented controls to feel physically native.

## Agent prompt to execute Phase 6

```txt
Read VEX_NATIVE_GLASS_PHASES.md fully.
Execute PHASE 6 only.
Do not migrate every pill in the app.

Tasks:
1. Inspect GlassPill.tsx, GlassPillSurface.tsx, ProfileGlassTabs.tsx, and any mode selector components.
2. Add NativeGlassSurface variant="pill" or "selected" only for active/selected states.
3. Keep inactive pills lightweight.
4. Add glassHaptics.selectedPill() on actual selection changes.
5. Preserve accessibility roles/states if present.
6. Run typecheck and relevant tests.

Report:
- files changed
- selected state behavior
- haptic behavior
- fallback behavior
- test/typecheck result
```

## Rules

- Active/selected pill can be glass.
- Inactive pills should not all become heavy glass.
- Avoid nested glass in tab bar pills if the tab bar shell is already glass.
- Text contrast must remain strong.

---

# PHASE 7 — Bottom sheet and modal migration

## Objective

Make major bottom sheets / modal surfaces feel native and premium.

## Agent prompt to execute Phase 7

```txt
Read VEX_NATIVE_GLASS_PHASES.md fully.
Execute PHASE 7 only.
Do not migrate every modal.

Tasks:
1. Find @gorhom/bottom-sheet usage and shared sheet wrappers.
2. Identify the primary reusable sheet background component if one exists.
3. Add NativeGlassSurface variant="sheet" as the background layer where safe.
4. Add glassHaptics.sheetSnap() to snap events only if there is already a reliable snap callback.
5. Preserve gestures, keyboard behavior, safe areas, and accessibility.
6. Run typecheck and relevant tests.

Report:
- files changed
- sheets affected
- gesture safety notes
- haptic behavior
- test/typecheck result
```

## Rules

- Do not wrap sheet content in nested glass if the sheet background is glass.
- Do not break gesture handler behavior.
- Do not add haptics on every pan update.
- Haptic only on snap/settle, not continuous drag.

---

# PHASE 8 — Cleanup bad old liquid glass

## Objective

Remove visual mud by cleaning duplicate old fake liquid-glass layers.

## Agent prompt to execute Phase 8

```txt
Read VEX_NATIVE_GLASS_PHASES.md fully.
Execute PHASE 8 only.
Do not delete components just because they are old.

Tasks:
1. Review src/shared/ui/liquid-glass and src/components/glass after native glass phases.
2. Identify components that duplicate NativeGlassSurface behavior badly.
3. Keep decorative art objects if they still serve the VEX identity.
4. Replace or deprecate failed wrapper components where safe.
5. Add comments only where helpful.
6. Update exports if needed.
7. Run typecheck and relevant tests.

Report:
- components kept
- components deprecated
- components replaced
- reason for each decision
- test/typecheck result
```

## Keep vs replace rules

Keep:

- `LiquidGlassSphere` if used as rare art.
- `WaterBubble` if used as rare art.
- `FloatingDroplets` if subtle and non-interactive.
- `GlassRibbon` if it supports premium moments.

Replace / deprecate:

- Any component that claims to be “liquid glass” but is just heavy blur + random gradients.
- Any wrapper that makes text less readable.
- Any wrapper that stacks over `NativeGlassSurface` by default.
- Any repeated card material that causes overdraw.

---

# PHASE 9 — Performance pass

## Objective

Ensure the native glass system improves VEX without hurting scroll performance.

## Agent prompt to execute Phase 9

```txt
Read VEX_NATIVE_GLASS_PHASES.md fully.
Execute PHASE 9 only.
Do not make new visual features.

Tasks:
1. Audit native glass count per major screen.
2. Audit mesh gradient count per major screen.
3. Audit haptic triggers for spam.
4. Memoize primitives where appropriate.
5. Remove duplicate shadows/gradients where native glass now handles material.
6. Verify long lists do not render native glass per row.
7. Run typecheck and performance-related tests/scripts if available.
8. Document performance notes in docs/VEX_GLASS_PERFORMANCE.md.

Report:
- high-risk screens
- changes made
- glass count guidance
- haptic spam prevention
- test/typecheck result
```

## Performance budgets

Recommended maximums per screen:

| Element | Budget |
|---|---:|
| Full-screen mesh atmosphere | 1 |
| Native nav shell | 1 |
| Native hero surfaces | 1-2 |
| Native selected pills | 1 group |
| Native sheet background | 1 while sheet visible |
| Native glass list rows | 0 in first migration |

---

# PHASE 10 — Final polish and QA

## Objective

Bring the system to production quality.

## Agent prompt to execute Phase 10

```txt
Read VEX_NATIVE_GLASS_PHASES.md fully.
Execute PHASE 10 only.

Tasks:
1. Verify light mode.
2. Verify dark mode if app supports it.
3. Verify reduced motion behavior if app has reduced motion hooks.
4. Verify accessibility labels and contrast.
5. Verify fallback behavior in Jest/non-iOS.
6. Verify iOS dev build behavior.
7. Verify no visual mud from old fake glass + new native glass stacking.
8. Update docs with final architecture.
9. Run typecheck, lint, and tests where practical.

Report:
- final changed files
- final architecture
- known limitations
- manual QA checklist
- follow-up recommendations
```

---

## 12. Component-specific guidance

### 12.1 `GlassCard.tsx`

Current state:

- Main repeated glass card component.
- Uses fake glass background, border, boxShadow, and several highlight components.
- Likely used hundreds of times.

Guidance:

- Do not convert all `GlassCard` instances to native glass immediately.
- Later, allow `GlassCard` to opt into native glass for `variant="hero"`, `variant="premium"`, or `variant="selected"` only.
- Keep repeated default cards lightweight.
- Preserve `testID` and `accessibilityLabel`.

Possible later API:

```ts
interface GlassCardProps {
  nativeMaterial?: 'auto' | 'off' | 'force';
}
```

Default should probably be `auto`, where only high-value variants use native glass.

### 12.2 `GlassScreen.tsx`

Current state:

- Good integration point for mesh atmosphere.
- Already has variant support.
- Already handles safe area.

Guidance:

- Upgrade atmosphere here.
- Do not change `GlassScreen` public API unless necessary.
- Avoid making `GlassScreen` itself a native glass surface. Screens are environments, not glass objects.

### 12.3 `VexTabBar.tsx`

Current state:

- Custom shell with fake blur and gradients.
- High-value migration target.

Guidance:

- Replace shell material with native glass.
- Keep custom route mapping and `TabButton`.
- Add haptic on actual tab changes.
- Preserve streak pulse.

### 12.4 `TabButton.tsx`

Guidance:

- Do not heavily rewrite unless needed.
- If active pill styling is muddy after shell migration, use `NativeGlassSurface variant="pill"` only for active state.
- Avoid nested glass if it looks too heavy.

### 12.5 `HomeHero.tsx`

Guidance:

- Start with inner panels, not full hero replacement.
- Preserve streak states.
- Preserve compact layout.
- Consider a later larger redesign only after the primitives are stable.

### 12.6 `src/shared/ui/liquid-glass/*`

Guidance:

- Treat these as suspicious until audited.
- Some may be useful, but they likely represent the old failed attempt.
- Do not delete immediately.
- Deprecate or route through `NativeGlassSurface` if they duplicate material logic.

---

## 13. Testing and commands

Use available scripts from `package.json`.

Recommended commands:

```bash
npm run typecheck
npm run lint
npm test -- --runInBand
npm run check:no-ts-nocheck
npm run check:banned-patterns
npm run check:line-limit
```

If the full test suite is too slow, run targeted tests first, then document that full tests were not run.

For dev build validation:

```bash
npx expo start --dev-client
```

If native modules changed after this file was created, rebuild:

```bash
npx eas build --profile development --platform ios
```

But the user already said the dev build was rebuilt after installing packages.

---

## 14. Manual QA checklist

### Glass foundation

- [ ] Native glass renders on iPhone dev build.
- [ ] Fallback renders in Jest/non-iOS.
- [ ] No crash if glass API unavailable.
- [ ] No text contrast regressions.
- [ ] No opacity-related disappearing glass.

### Mesh atmosphere

- [ ] Atmosphere appears behind content.
- [ ] Content remains readable.
- [ ] Only one mesh background per screen.
- [ ] Light mode remains pearl/mint.
- [ ] Focus/session screens are not too distracting.

### Haptics

- [ ] Tab switch haptic happens once.
- [ ] Selected pill haptic happens once per selection.
- [ ] No haptics on scroll.
- [ ] No haptics on passive animation.
- [ ] Haptics respect existing cooldown.

### Tab bar

- [ ] Safe area spacing correct.
- [ ] Pulse logic preserved.
- [ ] Active/inactive states readable.
- [ ] Tab changes work.
- [ ] Long press still emits event.

### Hero

- [ ] Loading state works.
- [ ] First-run state works.
- [ ] Normal state works.
- [ ] Compact width works.
- [ ] Streak badge still readable.

### Performance

- [ ] Scrolling remains smooth.
- [ ] No repeated native glass in long lists.
- [ ] No heavy mesh inside cards.
- [ ] No obvious overdraw/muddy layering.

---

## 15. Rollback plan

Every phase should be easy to rollback.

### Phase 1 rollback

- Remove `src/components/glass/native/*`.
- Remove exports from `src/components/glass/index.ts`.

### Phase 2 rollback

- Restore previous `GlassScreenAtmosphere` implementation.
- Remove `src/components/atmosphere/*` if created.

### Phase 3 rollback

- Remove `GlassHaptics.ts`.
- Remove exports.
- Remove any haptic calls wired during later phases.

### Phase 4 rollback

- Revert `VexTabBar.tsx` to previous shell.
- Keep native primitives if they are not causing issues.

### Phase 5 rollback

- Revert hero files only.

### General rollback

Use git commits per phase:

```bash
git add .
git commit -m "phase 1 native glass primitives"
git commit -m "phase 2 mesh atmosphere foundation"
git commit -m "phase 3 glass haptics foundation"
```

Do not batch five phases into one commit.

---

## 16. Agent reporting format after every phase

The AI agent must report in this exact structure:

```md
## Phase X Complete

### Files changed
- path: reason

### What changed
- concise technical summary

### What did not change
- boundaries respected

### Tests / checks run
- command: result

### Risks / notes
- any issues or assumptions

### Manual QA steps
- what the user should check on the iPhone dev build

### Next recommended phase
- one next phase only
```

If the agent cannot complete the phase, it must report partial progress and exact blockers.

---

## 17. Recommended first execution prompts

Use these prompts one at a time.

### Prompt 1 — Phase 0

```txt
Read VEX_NATIVE_GLASS_PHASES.md fully.
Execute PHASE 0 only.
Do not implement new UI yet.
Do not install packages.
Do not modify business logic.
Create docs/VEX_GLASS_AUDIT.md with the audit described in the phase.
After finishing, report using the required phase report format.
```

### Prompt 2 — Phase 1

```txt
Read VEX_NATIVE_GLASS_PHASES.md fully.
Read docs/VEX_GLASS_AUDIT.md fully.
Execute PHASE 1 only.
Create the native glass primitive layer.
Do not migrate tab bar, hero cards, or pills yet.
After finishing, report using the required phase report format.
```

### Prompt 3 — Phase 2

```txt
Read VEX_NATIVE_GLASS_PHASES.md fully.
Read docs/VEX_GLASS_AUDIT.md fully.
Execute PHASE 2 only.
Create the mesh atmosphere foundation and integrate it into GlassScreen safely.
Do not migrate tab bar, hero cards, or haptics yet.
After finishing, report using the required phase report format.
```

### Prompt 4 — Phase 3

```txt
Read VEX_NATIVE_GLASS_PHASES.md fully.
Execute PHASE 3 only.
Create centralized glass haptics using the existing VEX haptic system.
Do not scatter raw expo-haptics calls.
Do not migrate tab bar yet.
After finishing, report using the required phase report format.
```

### Prompt 5 — Phase 4

```txt
Read VEX_NATIVE_GLASS_PHASES.md fully.
Execute PHASE 4 only.
Upgrade VexTabBar using NativeGlassSurface / NativeGlassContainer and glassHaptics.
Preserve all navigation behavior, safe areas, labels, pulse logic, and long press events.
After finishing, report using the required phase report format.
```

---

## 18. Final definition of success

This migration succeeds when VEX feels like this:

- The app has real native iOS glass where it matters.
- The background atmosphere feels alive but not distracting.
- Presses feel physical through haptics.
- The old fake liquid-glass attempt no longer dominates the visuals.
- Repeated content remains performant and readable.
- The design feels like VEX, not a generic Apple clone.
- The codebase has clean primitives instead of one-off glass hacks.

The best final result is not “more glass.”

The best final result is:

```txt
A native, pearl-mint, focused, tactile VEX material system.
```

---

## 19. Extra implementation snippets for the agent

These snippets are not mandatory exact code. They are reference shapes. The agent must adapt to actual installed types and project conventions.

### 19.1 Reference `NativeGlassSurface`

```tsx
import React from 'react';
import {
  View,
  StyleSheet,
  type StyleProp,
  type ViewStyle,
  type ViewProps,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { GlassView } from 'expo-glass-effect';
import { vexLightGlass, glassMaterials } from '@/theme/tokens/vex-light-glass';
import { canUseNativeGlass } from './glassAvailability';

type NativeGlassSurfaceVariant =
  | 'subtle'
  | 'regular'
  | 'hero'
  | 'nav'
  | 'pill'
  | 'sheet'
  | 'selected';

interface NativeGlassSurfaceProps {
  children?: React.ReactNode;
  variant?: NativeGlassSurfaceVariant;
  radius?: number;
  interactive?: boolean;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  testID?: string;
  accessibilityLabel?: string;
  pointerEvents?: ViewProps['pointerEvents'];
}

function getTintColor(variant: NativeGlassSurfaceVariant): string {
  switch (variant) {
    case 'hero':
      return 'rgba(255,255,255,0.22)';
    case 'nav':
      return 'rgba(255,255,255,0.18)';
    case 'pill':
      return 'rgba(255,255,255,0.14)';
    case 'selected':
      return 'rgba(95,230,197,0.18)';
    case 'sheet':
      return 'rgba(255,255,255,0.20)';
    case 'subtle':
      return 'rgba(255,255,255,0.08)';
    default:
      return 'rgba(255,255,255,0.16)';
  }
}

function getFallbackMaterial(variant: NativeGlassSurfaceVariant): ViewStyle {
  if (variant === 'hero') return glassMaterials.hero as ViewStyle;
  if (variant === 'nav') return glassMaterials.nav as ViewStyle;
  if (variant === 'pill' || variant === 'selected') return glassMaterials.tabPill as ViewStyle;
  if (variant === 'sheet') return glassMaterials.paneStrong as ViewStyle;
  return glassMaterials.pane as ViewStyle;
}

export function NativeGlassSurface({
  children,
  variant = 'regular',
  radius = 24,
  interactive = false,
  style,
  contentStyle,
  testID,
  accessibilityLabel,
  pointerEvents,
}: NativeGlassSurfaceProps): React.ReactNode {
  if (canUseNativeGlass()) {
    return (
      <GlassView
        testID={testID}
        accessibilityLabel={accessibilityLabel}
        pointerEvents={pointerEvents}
        colorScheme="light"
        isInteractive={interactive}
        tintColor={getTintColor(variant)}
        style={[styles.base, { borderRadius: radius }, style]}
      >
        <View style={contentStyle}>{children}</View>
      </GlassView>
    );
  }

  return (
    <View
      testID={testID}
      accessibilityLabel={accessibilityLabel}
      pointerEvents={pointerEvents}
      style={[styles.base, getFallbackMaterial(variant), { borderRadius: radius }, style]}
    >
      <BlurView intensity={variant === 'subtle' ? 24 : 42} tint="light" style={StyleSheet.absoluteFill} />
      <LinearGradient
        pointerEvents="none"
        colors={[
          'rgba(255,255,255,0.82)',
          'rgba(255,255,255,0.24)',
          'rgba(255,255,255,0.08)',
        ]}
        locations={[0, 0.46, 1]}
        style={StyleSheet.absoluteFill}
      />
      <View style={contentStyle}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    overflow: 'hidden',
  },
});
```

Again: adapt to actual `expo-glass-effect` props from the installed version.

### 19.2 Reference `VexMeshAtmosphere`

```tsx
import React, { memo } from 'react';
import { View, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MeshGradient } from 'expo-mesh-gradient';
import { vexLightGlass } from '@/theme/tokens/vex-light-glass';

type VexAtmosphereVariant = 'home' | 'focus' | 'progress' | 'profile' | 'session' | 'default';

interface VexMeshAtmosphereProps {
  variant?: VexAtmosphereVariant;
  intensity?: 'quiet' | 'normal' | 'expressive';
  style?: StyleProp<ViewStyle>;
}

export const VexMeshAtmosphere = memo(function VexMeshAtmosphere({
  variant = 'default',
  intensity = 'normal',
  style,
}: VexMeshAtmosphereProps): React.ReactNode {
  // Agent must adapt MeshGradient props to installed package types.
  // If MeshGradient is unavailable in tests, render fallback.
  return (
    <View pointerEvents="none" style={[StyleSheet.absoluteFill, style]}>
      <LinearGradient
        colors={[
          vexLightGlass.background.pageTop,
          vexLightGlass.background.atmosphericPearl,
          vexLightGlass.background.pageMid,
        ]}
        locations={[0, 0.45, 1]}
        style={StyleSheet.absoluteFill}
      />
      {/* Replace/augment with MeshGradient after checking package props. */}
    </View>
  );
});
```

### 19.3 Reference `GlassHaptics`

```ts
import { haptics } from './HapticEngine';

export const glassHaptics = {
  tabPress: () => haptics.selection(),
  selectedPill: () => haptics.selection(),
  heroPress: () => haptics.impact('medium'),
  sheetSnap: () => haptics.impact('light'),
  primaryAction: () => haptics.impact('medium'),
  completion: () => haptics.success('medium'),
  disabled: () => haptics.warning('light'),
};
```

---

## 20. Strong warning about agent behavior

If an agent reads this file and immediately tries to:

- rewrite all screens,
- replace all cards,
- remove the design system,
- switch navigation libraries,
- add new dependencies,
- or make every card glass,

stop it.

That agent is not following the plan.

The correct behavior is incremental:

```txt
Audit → primitives → atmosphere → haptics → tab bar → hero → pills → sheets → cleanup → performance → polish
```

---

## 21. One-sentence mission

Build VEX’s native June 2026 material system by combining `expo-glass-effect`, `expo-mesh-gradient`, and `expo-haptics` into clean primitives, then migrate only the surfaces where native glass creates real product value.
