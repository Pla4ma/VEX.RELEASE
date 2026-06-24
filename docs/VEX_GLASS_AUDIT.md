# VEX Glass Audit — June 23, 2026

This audit was created as **Phase 0** of the VEX Native Glass Migration Plan.
It inventories the current glass-related code, identifies risks, and defines
the safest path forward without touching any UI.

---

## 1. Package Status

| Package | Installed | Planned Use |
|---------|-----------|-------------|
| `expo-glass-effect` | `~56.0.4` | Native iOS `GlassView` / `GlassContainer` |
| `expo-mesh-gradient` | `~56.0.3` | Atmospheric screen backgrounds |
| `expo-haptics` | `~56.0.3` | Semantic haptic feedback for glass surfaces |
| `expo-blur` | `~56.0.3` | Fallback blur on non-iOS / in tests |
| `expo-linear-gradient` | `~56.0.4` | Fallback gradient, existing atmosphere |

All packages are already present and match SDK 56. No installation needed.

---

## 2. Current Glass Primitives

### 2.1 `src/components/glass/` (16 exported components)

| File | Lines | Role | Risk for Native Migration |
|------|------:|------|--------------------------|
| `GlassCard.tsx` | ~90 | Main repeated card; 8 variants, 4 sizes | **HIGH** — used as repeated list rows; too many for native glass |
| `GlassCard.tokens.ts` | ~145 | Variant / size / style resolver | LOW — data file, no visual |
| `GlassCard.edges.tsx` | ~72 | 4 edge highlight sub-components | MEDIUM — composited inside `GlassCard` |
| `GlassCard.gradients.tsx` | ~171 | 6 gradient sub-components (top light, mint glow, shadow, etc.) | MEDIUM — composited inside `GlassCard` |
| `GlassScreen.tsx` | ~98 | Screen atmosphere wrapper with `LinearGradient` | LOW-MEDIUM — ideal integration point for `MeshGradient` |
| `GlassBlurLayer.tsx` | ~146 | Multi-layer blur + tint + gloss + shadow effect | **HIGH** — expensive, used by `VexTabBar`; replace with native |
| `GlassPill.tsx` | ~105 | Text pill with `GlassPillSurface` | MEDIUM — used for selected pills |
| `GlassPillSurface.tsx` | ~175 | `BlurView` + gradient pill surface | MEDIUM — active pills could use native glass |
| `LiquidButton.tsx` | ~165 | Animated pressable with gradient | MEDIUM-LATE — can be migrated after primitives |
| `GlassIconOrb.tsx` | — | Glass icon circles | LOW |
| `GlassProgressBar.tsx` | — | Progress indicator | LOW |
| `LiquidGlassSphere.tsx` | — | Decorative art sphere | LOW — keep as art |
| `WaterBubble.tsx` | — | Decorative bubble | LOW — keep as art |
| `LiquidLens.tsx` | — | Lens effect | LOW — keep as art |
| `GlassRibbon.tsx` | — | Ribbon decoration | LOW — keep as art |
| `FloatingDroplets.tsx` | — | Droplet decoration | LOW — keep as art |
| `CrystalAvatar.tsx` | — | Avatar component | LOW |
| `EmptyStateLens.tsx` | — | Empty state lens | LOW |
| `LiquidProgressBar.tsx` | — | Liquid progress bar | LOW |

### 2.2 `src/shared/ui/liquid-glass/` (Old failed attempt — 3 components)

| File | Lines | Role | Risk |
|------|------:|------|------|
| `LiquidGlassScreen.tsx` | ~77 | `LinearGradient` + `ImageBackground` + tinted blobs | **HIGH** — used by 8 Settings screens, Paywall, 2 Session screens. This is the failed liquid-glass wrapper. |
| `LiquidGlassCard.tsx` | ~58 | `BlurView` based card | MEDIUM — used in Session screens + Privacy. Duplicates `GlassPill` intent. |
| `LiquidGlassHeader.tsx` | ~65 | Header text + crystal asset | LOW — no glass material, just typography. Can stay. |
| `liquidGlassTokens.ts` | ~25 | Radii and spacing constants | LOW — data only |

**Assessment**: `LiquidGlassScreen` and `LiquidGlassCard` are the "bad liquid glass" the migration plan explicitly warns about. They stack multiple overlapping layers (`LinearGradient` + `ImageBackground` + tinted blobs) which causes visual mud and overdraw. They should be replaced or bypassed by the new native glass system.

### 2.3 `src/navigation/components/` (Tab bar)

| File | Lines | Role | Risk |
|------|------:|------|------|
| `VexTabBar.tsx` | ~189 | Bottom tab bar: `GlassBlurLayer` + `View` shell + gradient gloss + top edge highlights | **HIGH** — highest ROI native glass target |
| `TabButton.tsx` | ~171 | Individual tab button with animated pill | MEDIUM — active pill is the target |

### 2.4 Other Glass Surfaces

| File | Role | Migration Priority |
|------|------|-------------------|
| `src/screens/home/components/HomeHeroCard.tsx` | Hero card in home | Phase 5 |
| `src/screens/home/components/VexFocusSurface.tsx` | Focus mode surface | Phase 5 |
| `src/screens/profile/components/ProfileGlassTabs.tsx` | Profile segmented tabs | Phase 6 |
| `src/screens/progress/components/ProgressHeader.tsx` | Progress header | Phase 5/6 |
| `@gorhom/bottom-sheet` usage in `ProfileScreen`, `SessionCompleteContent`, `SessionReflectionSheet` | Sheet / modal surfaces | Phase 7 |

---

## 3. Usage Hotspots

### 3.1 `GlassCard` — ~63+ files reference it

Main usage patterns:
- **Focus Score cards**: `FocusScoreCardContent.tsx`, `FocusScoreCardStates.tsx`, `ScoreHistoryChart.tsx`, `factor-map.tsx`, `focus-score-dashboard.tsx`, `focus-score-home-widget.tsx`, `score-card.tsx`, `what-changed.tsx` — feature-level focus identity cards
- **Coach presence**: `CoachPresenceCard.tsx` — single card
- **Memory panel**: `MemoryPanel.tsx` — repeated list-like card
- **Home teasers**: `BossTeaserCard.tsx`, `EvolutionTeaserCard.tsx` — hero card teasers
- **Premium surfaces**: `PremiumSurface.tsx`, ` Addl PremiumSurface.toneLocked.tsx`, `PremiumSurface.tones.tsx` — premium upsell cards
- **Settings privacy**: `PrivacySettingsScreen.tsx` — privacy card

**Risk**: Many of these are repeated list items (memory panel items, score history). Native glass should NOT be applied to repeated rows.

### 3.2 `GlassScreen` — 6 screens wrapped

- `AppScreen.tsx` — root screen wrapper
- `HomeScreenInner.tsx` — home
- `FocusScreen.tsx` — focus
- `PlanScreen.tsx` — plan
- `ProfileScreen.tsx` — profile
- `ProgressScreen.tsx` — progress

Also used via `LiquidGlassScreen` in:
- `SettingsScreen`, `AccountSettingsScreen`, `AppearanceSettingsScreen`, `CoachSettingsScreen`, `LaneModeSettingsScreen`, `NotificationSettingsScreen`, `PrivacySettingsScreen`
- `SessionSetupFirstSessionView.tsx`, `SessionSetupReturningUserView.tsx`
- `PaywallScreen.tsx`

### 3.3 `LiquidGlassScreen` — 11 screens, ALL settings + paywall + session setup

This is the failed liquid-glass attempt. It overlays `LinearGradient` + `ImageBackground` + colored blobs, which creates visual mud.

---

## 4. Repeated-Card Risks

| Component | Repeated? | In a ScrollView/List? | Safe for Native Glass? |
|-----------|-----------|----------------------|----------------------|
| `GlassCard` (default list items) | YES | YES | **NO** — Phase 1-6 |
| `GlassCard` (hero/premium single cards) | NO | NO | Phase 5-6 |
| `GlassPill` / `GlassPillSurface` | YES (tab bar) | NO | Phase 6 (active only) |
| `VexTabBar` shell | Single per screen | NO | **YES** — Phase 4 |
| `LiquidGlassCard` | SINGLE | NO | Replacement candidate |

---

## 5. Failed / Duplicate Liquid-Glass Wrappers

### 5.1 `LiquidGlassScreen` — **FAIL**
- Stacks `LinearGradient` + `ImageBackground` + 2 tinted blobs
- No native glass at all, despite the name
- Creates muddy visuals, especially on settings screens
- Used in 11 files
- **Action**: Deprecate / replace with `GlassScreen` + `NativeGlassSurface` or bypass entirely

### 5.2 `LiquidGlassCard` — **FAIL**
- `BlurView` + border + top hairline highlight
- Uses `boxShadow` with CSS variable string (risky for RN)
- Serves same purpose as `GlassCard` and `GlassPillSurface`
- Used in 3 files
- **Action**: Deprecate / route through `NativeGlassSurface`

### 5.3 `GlassBlurLayer` — **FAIL**
- 8+ overlapping layers: gradient frost, mint tint, top gloss, bottom shadow, 3-4 edge highlights
- Used by `VexTabBar`
- Extremely expensive for a tab bar background
- **Action**: Replace shell with `NativeGlassSurface` in Phase 4

---

## 6. Recommended Migration Targets (by Phase)

### Phase 1: Foundation (create primitives)
- `src/components/glass/native/glassAvailability.ts`
- `src/components/glass/native/NativeGlassSurface.tsx`
- `src/components/glass/native/NativeGlassContainer.tsx`
- `src/components/glass/native/NativeGlassOverlay.tsx`
- Export updates in `src/components/glass/index.ts`

### Phase 2: Atmosphere
- `src/components/atmosphere/VexMeshAtmosphere.tsxcron --exclude=src/main.rs`
- Integrate into `GlassScreen.tsx` (safe entry point)
- Fallback to existing `LinearGradient` atmosphere

### Phase 3: Haptics
- `src/shared/feedback/GlassHaptics.ts`
- Route through existing `HapticEngine`
- No UI changes

### Phase 4: Tab Bar (Highest ROI)
- `src/navigation/components/VexTabBar.tsx`
- Replace `GlassBlurLayer` + manual shell with `NativeGlassSurface` variant="nav"
- Wire `glassHaptics.tabPress()`
- Preserve streak pulse

### Phase 5: Hero Surfaces
- `src/screens/home/components/HomeHeroCard.tsx` — inner hero panel
- `VexFocusSurface.tsx` — focus surface
- Do NOT convert whole `GlassCard` system

### Phase 6: Mode / Pill
- `ProfileGlassTabs.tsx` — selected state only
- `GlassPillSurface.tsx` — active state only

### Phase 7: Sheets
- Bottom sheet backgrounds in `ProfileScreen`, `SessionReflectionSheet`, `SessionCompleteContent`

### Phase 8: Cleanup
- Deprecate `LiquidGlassScreen` and `LiquidGlassCard`
- Keep `LiquidGlassHeader` (no glass material)
- Route `LiquidGlassScreen` users to `GlassScreen` + `NativeGlassSurface`

---

## 7. Files Safe to Modify in Phase 1 (No UI Changes)

| File | Action | Why Safe |
|------|--------|----------|
| `src/components/glass/native/glassAvailability.ts` | Create | New file, no existing consumers |
| `src/components/glass/native/NativeGlassSurface.tsx` | Create | New file, no existing consumers |
| `src/components/glass/native/NativeGlassContainer.tsx` | Create | New file, no existing consumers |
| `src/components/glass/index.ts` | Add exports | Safe if exports are backwards-compatible |
| `src/shared/feedback/GlassHaptics.ts` | Create | New file, optional import |
| `src/components/atmosphere/atmosphereTokens.ts` | Create | New file, no existing consumers |
| TypeScript types / schemas | Create | No runtime impact |

---

## 8. Files That Should NOT Be Touched in Phase 1

| File | Reason |
|------|--------|
| `GlassCard.tsx`, `GlassCard.edges.tsx`, `GlassCard.gradients.tsx`, `GlassCard.tokens.ts` | Too many consumers (63+). Do not refactor yet. |
| `VexTabBar.tsx` | Wait until Phase 4, after primitives are stable. |
| `HomeHero.tsx`, `HomeHeroCard.tsx`, `VexFocusSurface.tsx` | Wait until Phase 5. |
| `ProfileGlassTabs.tsx`, `ProgressHeader.tsx` | Wait until Phase 6. |
| Any screen with `@gorhom/bottom-sheet` | Wait until Phase 7. |
| `LiquidGlassScreen.tsx`, `LiquidGlassCard.tsx` | Wait until Phase 8 cleanup. Roughen them out later. |
| All settings screens using `LiquidGlassScreen` | Wait until Phase 8. These screens work today; changing them for Phase 1 is risk without benefit. |
| Business logic / store / service files | Never touch during glass migration. |

---

## 9. Haptic System Inventory

Existing files (all robust and should be extended, not replaced):

| File | Role |
|------|------|
| `src/shared/feedback/HapticEngine.ts` | Central engine with cooldown, battery check, selection, impact, success, error, warning, celebration |
| `src/utils/haptics.ts` | `triggerHaptic()`, `buttonTap()` wrappers |
| `src/utils/haptics-actions.ts` | Additional haptic helpers |
| `src/utils/haptics-types.ts` | Type definitions |
| `src/constants/haptics.ts` | Constants |

Phase 3 will extend this with `GlassHaptics.ts` that routes through `HapticEngine`.

---

## 10. Key Risks

| Risk | Severity | Mitigation |
|------|----------|------------|
| `expo-glass-effect` may not have matching prop names on the installed version | MEDIUM | Inspect `node_modules/expo-glass-effect` actual API before writing code |
| Native glass might not appear in Jest tests | LOW | Provide fallback to `BlurView` + `LinearGradient` |
| `VexTabBar` streak pulse may break if shell changes | MEDIUM | Preserve pulse logic exactly; only change the shell material |
| Dark mode support may be incomplete | LOW | Start with light mode; add dark in Phase 10 |
| Bottom sheets with `@gorhom/bottom-sheet` may not play well with native glass | MEDIUM | Test thoroughly in Phase 7 |
| Too many `GlassCard` instances converted to native glass | **HIGH** | Enforce "no repeated native glass" rule; ONLY migrate hero/selected surfaces |
| `LiquidGlassScreen` cleanup may break settings screens | MEDIUM | Keep fallback; deprecate after Phase 8 validation |

---

## 11. Pre-Existing Typecheck / Test State

### Typecheck command
```bash
npm run typecheck
```

### Expected pre-existing issues (verify on first run)
The codebase is mature. There may be pre-existing type warnings. The audit should document them but not attempt fixes.

---

## 12. Audit Summary

- **Total glass-related files examined**: 26+ component files, 11 screen files consuming liquid-glass
- **Main primitives**: `GlassCard` (heavy, repeated), `GlassScreen` (good integration point), `GlassBlurLayer` (expensive), `GlassPill/GlassPillSurface` (pill surfaces)
- **Failed wrappers**: `LiquidGlassScreen`, `LiquidGlassCard` — represent the old failed attempt
- **Highest ROI migration**: `VexTabBar` (Phase 4), `GlassScreen` atmosphere (Phase 2)
- **Lowest ROI / highest risk**: Converting all `GlassCard` instances to native glass
- **Recommended Phase 1 start**: Create primitive layer (`glassAvailability`, `NativeGlassSurface`, `NativeGlassContainer`) with zero UI impact

---

*Audit completed: June 23, 2026*
*Next step: Phase 1 — Native Glass Foundation*
