# VEX Native Glass & Atmosphere Architecture

**Date:** June 23, 2026
**Status:** Final Deliverable (Phase 10 Polish & QA)

This document describes the unified architecture of the VEX native glass material system.

## 1. Primitives Layer

All glass elements in VEX are built from four core primitives under `src/components/glass/native/`:

1. **`glassAvailability.ts`**: Centralized capability detection.
   - `canUseNativeGlass()` returns `true` on iOS 26+ devices that support the `UIVisualEffectView` native glass layer, and `false` on Android, Web, and in Jest testing environments.
2. **`NativeGlassSurface.tsx`**: The main material wrapper.
   - Automatically chooses between the native `GlassView` (on iOS) and a high-fidelity `BlurView` + custom gradient overlay fallback on other platforms.
   - Supports variants: `regular`, `subtle`, `hero`, `nav`, `pill`, `selected`, `sheet`.
3. **`NativeGlassContainer.tsx`**: Container compositor.
   - Groups multiple native glass views together to allow optimal iOS compositional layers and prevent rendering flickering.
4. **`NativeGlassOverlay.tsx`**: High-performance highlight sheen layer.
   - Multiplies native reflection sheens on select hero elements without rendering nested child contents.
5. **`GlassSheetBackground.tsx`**: Reusable backdrop for `@gorhom/bottom-sheet`.
   - Passes standard layout styles through to `NativeGlassSurface variant="sheet"`.

## 2. Atmosphere & Gradients Layer

Atmosphere backgrounds are managed under `src/components/atmosphere/`:

1. **`atmosphereTokens.ts`**: Defines spatial points and color palettes (e.g. `home`, `focus`, `progress`, `profile`, `default`) for mesh gradients.
2. **`VexMeshAtmosphere.tsx`**: Screen-level background view.
   - Renders a native `MeshGradientView` on iOS (using `expo-mesh-gradient`), falling back to a structured stack of `LinearGradient`s elsewhere.
3. **`GlassScreen.tsx`**: Screen-level container.
   - Integrates the screen atmosphere layer with safety areas and overlays.

## 3. Haptics Layer

Semantic feedback mapping is centralized in `src/shared/feedback/GlassHaptics.ts`:

- Maps semantic interactions to named haptic calls (e.g., `tabPress`, `selectedPill`, `heroPress`, `sheetSnap`, `primaryAction`, `completion`, `disabled`).
- Integrates with the global `HapticEngine` which enforces a **50ms cooldown** filter.

## 4. UI Integrations Completed

| Screen / Component | Migration details |
|---|---|
| `VexTabBar` | Upgraded tab bar container shell to native glass. Added haptics to active tab switch. |
| `HomeHeroCard` & `HomeHeroOnboardPanel` | Wrapped onboarding and hero modules in native glass panels. |
| `ProfileGlassTabs` | Added spring-animated active tab indicator pill sliding over native glass container shell. |
| `GlassPillSurface` | Upgraded active pill indicator to native glass; inactive pills keep lightweight styling. |
| `LiquidGlassScreen` & `LiquidGlassCard` | Legacy fake-glass card/screen elements rewritten to delegate to `NativeGlassSurface` and `VexMeshAtmosphere`. |
| Bottom Sheets | Mastery Sheet and Session Reflection Sheet backgrounds upgraded to use `GlassSheetBackground`. |
