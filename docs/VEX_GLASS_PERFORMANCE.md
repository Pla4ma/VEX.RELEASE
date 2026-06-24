# VEX Glass Performance Analysis & Guidance

**Date:** June 23, 2026
**Status:** Complete (Phase 9 Performance Pass)

## 1. Native Glass & Mesh Gradient Budgets

To prevent overdraw and frame drops on lower-end iOS devices (e.g., iPhone 11/12), we enforce strict screen-level budgets:

| Element | Budget per Screen | Purpose / Notes |
|---|---|---|
| Full-screen mesh atmosphere | **1** | Renders exactly one `VexMeshAtmosphere` behind the main scroll area. |
| Native nav shell | **1** | Renders the bottom tab bar `VexTabBar` shell. |
| Native hero surfaces | **1–2** | HomeHeroCard and HomeHeroOnboardPanel use native glass. |
| Native selected pills | **1 group** | Used only for active tabs/pills (e.g., ProfileGlassTabs). Inactive pills stay lightweight. |
| Native sheet background | **1** | Rendered only while a bottom sheet/modal is active. |
| Native glass list rows | **0** | **CRITICAL:** Long scrolling lists (e.g. FlashList) must never render native glass inside list items. |

## 2. Optimization Implementations

### 2.1 Memoization of Low-Level Primitives
All native glass primitive wrappers have been wrapped in `React.memo` to avoid redundant layout recalculations:
1. `NativeGlassSurface` (memoized)
2. `NativeGlassContainer` (memoized)
3. `NativeGlassOverlay` (memoized)
4. `GlassSheetBackground` (memoized)

This guarantees that when parent states update, the underlying `expo-glass-effect` view bindings do not re-instantiate or trigger redundant native iOS visual effect updates.

### 2.2 Lightweight Fallbacks for Inactive Elements
Instead of converting all pills/cards to native glass (which would multiply `UIVisualEffectView` instances and crush performance), inactive/unselected states use lightweight fallbacks:
- Unselected tabs use a single simple `View` with basic opacity.
- Inactive pills use the custom `GlassBlurLayer` fallback style without gradient stacking.

### 2.3 Haptic Spam Prevention
To prevent physical vibration fatigue and CPU strain:
- Haptic triggers (`glassHaptics`) are only called on actual state transitions (e.g., actual tab index change).
- Continuous drag or pan gestures (such as in `BottomSheet`) do not trigger haptics.
- The `HapticEngine` enforces an internal **50ms cooldown** filter.

## 3. Screen-by-Screen Audits

### 3.1 HomeScreen
- `VexMeshAtmosphere` (1)
- `HomeHeroCard` (1)
- `HomeHeroOnboardPanel` (1)
- `VexTabBar` (1)
- **Total active native surfaces:** 4 (safe)

### 3.2 ProfileScreen
- `VexMeshAtmosphere` (1)
- `ProfileGlassTabs` active tab indicator (1)
- `ProfileMasterySheet` background (1, when active)
- `VexTabBar` (1)
- **Total active native surfaces:** 3–4 (safe)
