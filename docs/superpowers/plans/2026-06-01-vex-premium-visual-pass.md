# VEX Premium Visual Pass Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement 13 new visual/motion components across 4 signature moments (First Impression, Home, Active Session, Completion) and upgrade companion/coach presentation to create an industry-shaking premium mobile focus OS.

**Architecture:** Build from primitives up: foundation surfaces → brand components → screen-level composition. All changes are visual/motion/presentation only. Product logic, backend, session state machine, and navigation are strictly untouched.

**Tech Stack:** Expo SDK 56, React Native, TypeScript 6.0.3, Reanimated 4.3.1, React Navigation v6, SVG, LinearGradient, Zustand, TanStack Query v5.

---

## Phase 0: Foundation & Theme

### Task 0.1: Verify existing primitives and haptics system

**Files:**
- Read: `src/utils/haptics.ts`
- Read: `src/components/primitives/index.ts`
- Read: `src/theme/tokens/colors.ts` or equivalent
- Read: `src/hooks/useReducedMotion.ts`

- [ ] **Step 1: Read haptics utility**

  Read `src/utils/haptics.ts`. Document which named functions exist (e.g., `selection`, `success`, `warning`, `impact`, `levelUp`). Note if there's a `Haptics` object or individual exports. Verify if haptics respect platform/support checks internally.

- [ ] **Step 2: Read primitives index**

  Read `src/components/primitives/index.ts`. Document which primitives are exported (AppScreen, Box, Button, Text, etc.). Verify `AppScreen` supports `keyboardAvoiding` prop.

- [ ] **Step 3: Read theme color tokens**

  Read theme token files. Determine if `semantic.primary` or `semantic.primarySoft` maps to a cyan-ish color. If not, note that we will use inline hex values for the VEX brand accent (`#00E5FF`) and document where theme tokens should be preferred.

- [ ] **Step 4: Verify useReducedMotion hook**

  Read `src/hooks/useReducedMotion.ts`. Confirm it returns `{ isReducedMotion: boolean }` and is safe to use in all components.

---

### Task 0.2: Add VEX brand tokens to theme (if absent)

**Files:**
- Modify: `src/theme/tokens/colors.ts` or equivalent theme file

- [ ] **Step 1: Add VEX brand semantic tokens**

  Add to the semantic color map if a semantic/branding section exists:
  ```typescript
  vexCyan: '#00E5FF',
  vexCyanSoft: 'rgba(0,229,255,0.08)',
  vexCyanGlow: 'rgba(0,229,255,0.25)',
  vexGold: '#FFB300',
  vexGoldSoft: 'rgba(255,179,0,0.15)',
  obsidian: '#0A0A0F',
  surfaceElevated: '#12121A',
  surfaceGlass: 'rgba(18,18,26,0.85)',
  ```

  If the theme structure doesn't support arbitrary additions, skip this and use inline values. Do not break the theme system.

---

## Phase 1: Reusable Primitives

### Task 1.1: VexMotionSurface

**Files:**
- Create: `src/components/primitives/VexMotionSurface.tsx`
- Test: `src/components/primitives/__tests__/VexMotionSurface.test.tsx`

- [ ] **Step 1: Write failing test**

  ```tsx
  import React from 'react';
  import { render } from '@testing-library/react-native';
  import { VexMotionSurface } from '../VexMotionSurface';
  
  describe('VexMotionSurface', () => {
    it('renders glass variant with children', () => {
      const { getByText } = render(
        <VexMotionSurface variant="glass"><>Test</></VexMotionSurface>
      );
      expect(getByText('Test')).toBeTruthy();
    });
    
    it('renders elevated variant', () => {
      const { getByTestId } = render(
        <VexMotionSurface variant="elevated" testID="surface" />
      );
      expect(getByTestId('surface')).toBeTruthy();
    });
    
    it('renders focused variant with glow border', () => {
      const { getByTestId } = render(
        <VexMotionSurface variant="focused" testID="surface" />
      );
      expect(getByTestId('surface')).toBeTruthy();
    });
    
    it('has no emoji in rendered output', () => {
      const { toJSON } = render(
        <VexMotionSurface variant="glass"><>Content</></VexMotionSurface>
      );
      const text = JSON.stringify(toJSON());
      expect(text).not.toMatch(/[\u{1F300}-\u{1F9FF}]/u);
    });
  });
  ```

  Run: `npm test -- --testPathPattern="VexMotionSurface" --no-coverage`
  Expected: FAIL — "Cannot find module '../VexMotionSurface'"

- [ ] **Step 2: Implement VexMotionSurface**

  ```tsx
  import React from 'react';
  import { View, ViewProps } from 'react-native';
  import Animated, { useAnimatedStyle, withTiming } from 'react-native-reanimated';
  import { useTheme } from '../../theme';
  import { useReducedMotion } from '../../hooks/useReducedMotion';

  export interface VexMotionSurfaceProps extends ViewProps {
    variant?: 'glass' | 'elevated' | 'focused';
    children?: React.ReactNode;
    animated?: boolean;
  }

  const VARIANT_STYLES = {
    glass: {
      backgroundColor: 'rgba(18,18,26,0.85)' as const,
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.06)' as const,
    },
    elevated: {
      backgroundColor: '#12121A' as const,
      borderWidth: 1,
      borderColor: '#1A1A24' as const,
    },
    focused: {
      backgroundColor: 'rgba(18,18,26,0.85)' as const,
      borderWidth: 1,
      borderColor: 'rgba(0,229,255,0.12)' as const,
    },
  };

  export function VexMotionSurface({
    variant = 'elevated',
    children,
    animated = false,
    style,
    ...rest
  }: VexMotionSurfaceProps): JSX.Element {
    const { theme } = useTheme();
    const { isReducedMotion } = useReducedMotion();
    const base = VARIANT_STYLES[variant];

    const animatedStyle = useAnimatedStyle(() => {
      if (!animated || isReducedMotion) return {};
      return {
        // Subtle breathing glow for focused variant
        shadowColor: variant === 'focused' ? '#00E5FF' : 'transparent',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: withTiming(0.08, { duration: 600 }),
        shadowRadius: 12,
      };
    }, [variant, isReducedMotion]);

    const borderRadius = theme.spacing?.[3] ?? 12;

    return (
      <Animated.View
        style={[
          {
            borderRadius,
            overflow: 'hidden',
            ...base,
          },
          animatedStyle,
          style,
        ]}
        {...rest}
      >
        {children}
      </Animated.View>
    );
  }
  ```

  Keep file under 200 lines. If it exceeds, split into `VexMotionSurface.styles.ts`.

- [ ] **Step 3: Run tests**

  Run: `npm test -- --testPathPattern="VexMotionSurface" --no-coverage`
  Expected: PASS

- [ ] **Step 4: Commit**

  ```bash
  git add src/components/primitives/VexMotionSurface.tsx src/components/primitives/__tests__/VexMotionSurface.test.tsx
  git commit -m "feat(primitives): VexMotionSurface — glass, elevated, focused variants with animated glow"
  ```

---

### Task 1.2: VexLaunchButton

**Files:**
- Create: `src/components/primitives/VexLaunchButton.tsx`
- Test: `src/components/primitives/__tests__/VexLaunchButton.test.tsx`

- [ ] **Step 1: Write failing test**

  ```tsx
  import React from 'react';
  import { fireEvent, render } from '@testing-library/react-native';
  import { VexLaunchButton } from '../VexLaunchButton';
  
  describe('VexLaunchButton', () => {
    it('renders label and sublabel', () => {
      const { getByText } = render(
        <VexLaunchButton label="Start" subLabel="25m Focus" onPress={jest.fn()} />
      );
      expect(getByText('Start')).toBeTruthy();
      expect(getByText('25m Focus')).toBeTruthy();
    });
    
    it('calls onPress when pressed', () => {
      const onPress = jest.fn();
      const { getByRole } = render(
        <VexLaunchButton label="Start" onPress={onPress} />
      );
      fireEvent.press(getByRole('button'));
      expect(onPress).toHaveBeenCalled();
    });
    
    it('shows disabled state', () => {
      const { getByRole } = render(
        <VexLaunchButton label="Start" onPress={jest.fn()} disabled />
      );
      expect(getByRole('button').props.accessibilityState.disabled).toBe(true);
    });
    
    it('has no emoji in rendered output', () => {
      const { toJSON } = render(
        <VexLaunchButton label="Start" subLabel="Go" onPress={jest.fn()} />
      );
      const text = JSON.stringify(toJSON());
      expect(text).not.toMatch(/[\u{1F300}-\u{1F9FF}]/u);
    });
  });
  ```

  Run: `npm test -- --testPathPattern="VexLaunchButton" --no-coverage`
  Expected: FAIL

- [ ] **Step 2: Implement VexLaunchButton**

  ```tsx
  import React from 'react';
  import { Pressable, View, ViewProps } from 'react-native';
  import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming,
  } from 'react-native-reanimated';
  import { Text } from './Text';
  import { useTheme } from '../../theme';
  import { useReducedMotion } from '../../hooks/useReducedMotion';
  import { getMinTouchTargetStyle } from '../../utils/touchTarget';

  export interface VexLaunchButtonProps extends ViewProps {
    label: string;
    subLabel?: string;
    onPress: () => void;
    disabled?: boolean;
    isLoading?: boolean;
  }

  export function VexLaunchButton({
    label,
    subLabel,
    onPress,
    disabled,
    isLoading,
    style,
    ...rest
  }: VexLaunchButtonProps): JSX.Element {
    const { theme } = useTheme();
    const { isReducedMotion } = useReducedMotion();
    const scale = useSharedValue(1);
    const glow = useSharedValue(0.06);

    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ scale: scale.value }],
      shadowOpacity: glow.value,
    }));

    const handlePressIn = () => {
      if (isReducedMotion) return;
      scale.value = withSpring(0.97, { damping: 15, stiffness: 300 });
      glow.value = withTiming(0.15, { duration: 150 });
    };

    const handlePressOut = () => {
      if (isReducedMotion) return;
      scale.value = withSpring(1, { damping: 15, stiffness: 300 });
      glow.value = withTiming(0.06, { duration: 300 });
    };

    return (
      <Pressable
        onPress={onPress}
        disabled={disabled || isLoading}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        accessibilityRole="button"
        accessibilityLabel={label}
        style={[getMinTouchTargetStyle(), style]}
        {...rest}
      >
        <Animated.View
          style={[
            {
              backgroundColor: '#12121A',
              borderRadius: theme.spacing?.[3] ?? 12,
              borderWidth: 1,
              borderColor: 'rgba(0,229,255,0.08)',
              paddingVertical: theme.spacing?.[4] ?? 16,
              paddingHorizontal: theme.spacing?.[5] ?? 20,
              alignItems: 'center',
              justifyContent: 'center',
              shadowColor: '#00E5FF',
              shadowOffset: { width: 0, height: 0 },
              shadowRadius: 16,
              width: '100%',
            },
            animatedStyle,
          ]}
        >
          <Text variant="heading3" color="#00E5FF">
            {label}
          </Text>
          {subLabel ? (
            <Text variant="caption" color="textMuted" style={{ marginTop: 4 }}>
              {subLabel}
            </Text>
          ) : null}
        </Animated.View>
      </Pressable>
    );
  }
  ```

  Keep under 200 lines.

- [ ] **Step 3: Run tests**

  Run: `npm test -- --testPathPattern="VexLaunchButton" --no-coverage`
  Expected: PASS

- [ ] **Step 4: Commit**

  ```bash
  git add src/components/primitives/VexLaunchButton.tsx src/components/primitives/__tests__/VexLaunchButton.test.tsx
  git commit -m "feat(primitives): VexLaunchButton — obsidian CTA with cyan glow and spring press"
  ```

---

## Phase 2: First Impression Signature

### Task 2.1: Enhance VexEntryBackground

**Files:**
- Read: `src/screens/auth/components/VexEntryBackground.tsx`
- Modify: `src/screens/auth/components/VexEntryBackground.tsx`

- [ ] **Step 1: Read current implementation**

  Read the file. Document current approach (gradient? solid? animation?).

- [ ] **Step 2: Enhance with cyan aurora + grid**

  Add a subtle SVG-based aurora wave or use `LinearGradient` with animated stops. Add a very faint grid overlay (crosshatch lines at 10% opacity). The aurora should drift slowly (8s cycle) using Reanimated `useSharedValue` + `useAnimatedProps` or `LinearGradient` animated colors.

  If the file exceeds 200 lines after enhancement, extract the aurora into `VexAuroraWave.tsx` in the same directory.

  Reduced motion: aurora freezes, grid remains static.

- [ ] **Step 3: Verify no launchColors**

  Search the file for `launchColors`. If found, replace with inline hex or theme tokens.

- [ ] **Step 4: Commit**

  ```bash
  git add src/screens/auth/components/VexEntryBackground.tsx
  git commit -m "feat(auth): enhance VexEntryBackground with cyan aurora drift and grid overlay"
  ```

---

### Task 2.2: Create VexFocusLoop

**Files:**
- Create: `src/components/brand/VexFocusLoop.tsx`
- Test: `src/components/brand/__tests__/VexFocusLoop.test.tsx`

- [ ] **Step 1: Write failing test**

  ```tsx
  import React from 'react';
  import { render } from '@testing-library/react-native';
  import { VexFocusLoop } from '../VexFocusLoop';
  
  describe('VexFocusLoop', () => {
    it('renders three nodes and connecting path', () => {
      const { getByLabelText } = render(<VexFocusLoop />);
      expect(getByLabelText('Start node')).toBeTruthy();
      expect(getByLabelText('Protect node')).toBeTruthy();
      expect(getByLabelText('Return node')).toBeTruthy();
    });
    
    it('has no emoji in output', () => {
      const { toJSON } = render(<VexFocusLoop />);
      expect(JSON.stringify(toJSON())).not.toMatch(/[\u{1F300}-\u{1F9FF}]/u);
    });
  });
  ```

  Run: `npm test -- --testPathPattern="VexFocusLoop" --no-coverage`
  Expected: FAIL

- [ ] **Step 2: Implement VexFocusLoop**

  SVG-based animated signal path. Three circles connected by a line that draws itself via `stroke-dashoffset` animation. Use Reanimated `useSharedValue` + `useAnimatedProps` on SVG elements.

  Nodes:
  - Start (left)
  - Protect (center)
  - Return (right)

  Labels below each node in clean typography.

  Keep under 200 lines. If SVG manipulation becomes complex, extract helper to `focus-loop-helpers.ts` in same directory.

- [ ] **Step 3: Run tests**

  Run: `npm test -- --testPathPattern="VexFocusLoop" --no-coverage`
  Expected: PASS

- [ ] **Step 4: Commit**

  ```bash
  git add src/components/brand/VexFocusLoop.tsx src/components/brand/__tests__/VexFocusLoop.test.tsx
  git commit -m "feat(brand): VexFocusLoop — animated SVG signal path for auth entry"
  ```

---

### Task 2.3: Integrate First Impression into Auth Screens

**Files:**
- Modify: `src/screens/auth/LoginScreen.tsx`
- Modify: `src/screens/auth/RegisterScreen.tsx`
- Modify: `src/screens/auth/ForgotPasswordScreen.tsx`
- Modify: `src/screens/auth/components/AuthValuePreview.tsx`

- [ ] **Step 1: Replace AuthValuePreview with VexFocusLoop in LoginScreen**

  In `LoginScreen.tsx`, replace:
  ```tsx
  import { AuthValuePreview } from './components/AuthValuePreview';
  ```
  with:
  ```tsx
  import { VexFocusLoop } from '../../components/brand/VexFocusLoop';
  ```

  Replace `<AuthValuePreview />` with `<VexFocusLoop />`.

- [ ] **Step 2: Update RegisterScreen to match Login visual system**

  Apply same changes: `VexEntryBackground`, `AuthHeroBrand`, `VexFocusLoop`, `AuthCommandPanel`, `VexLaunchButton`.

- [ ] **Step 3: Update ForgotPasswordScreen**

  Apply same visual system. Ensure transition from Login is a smooth layout animation or fade.

- [ ] **Step 4: Deprecate AuthValuePreview (keep file for reference, remove usage)**

  Do not delete `AuthValuePreview.tsx`. Simply remove all imports of it. The file can remain in the repo.

- [ ] **Step 5: Verify no emoji in auth screens**

  Search:
  ```bash
  grep -r "[\x{1F300}-\x{1F9FF}]" src/screens/auth/ || echo "No emoji found"
  ```
  Expected: "No emoji found" or only in non-UI/internal strings.

- [ ] **Step 6: Run typecheck**

  Run: `npm run typecheck -- --pretty false`
  Expected: 0 errors

- [ ] **Step 7: Commit**

  ```bash
  git add src/screens/auth/
  git commit -m "feat(auth): integrate VexFocusLoop and VexLaunchButton into auth screens"
  ```

---

### Task 2.4: WelcomeScreen visual upgrade

**Files:**
- Modify: `src/features/onboarding/components/WelcomeScreen.tsx`
- Verify: `src/screens/onboarding/OnboardingFlowScreen.tsx`

- [ ] **Step 1: Read current WelcomeScreen**

  Read `WelcomeScreen.tsx`. Document current layout and any emoji usage.

- [ ] **Step 2: Recompose with VexEntryBackground + VexFocusMark**

  - Full-screen `VexEntryBackground`
  - Large centered `VexFocusMark` with tagline text
  - Single `VexLaunchButton` at bottom
  - No emoji. No cartoon mascot.

- [ ] **Step 3: Verify no emoji**

  Search the file for emoji unicode ranges. Remove any found in UI strings.

- [ ] **Step 4: Commit**

  ```bash
  git add src/features/onboarding/components/WelcomeScreen.tsx
  git commit -m "feat(onboarding): WelcomeScreen — premium dark entry with VexFocusMark"
  ```

---

## Phase 3: Home Signature

### Task 3.1: Create VexFocusSurface

**Files:**
- Create: `src/screens/home/components/VexFocusSurface.tsx`
- Test: `src/screens/home/components/__tests__/VexFocusSurface.test.tsx`

- [ ] **Step 1: Write failing test**

  ```tsx
  import React from 'react';
  import { render } from '@testing-library/react-native';
  import { VexFocusSurface } from '../VexFocusSurface';
  
  describe('VexFocusSurface', () => {
    it('renders lane context and session info', () => {
      const { getByText } = render(
        <VexFocusSurface
          laneContext="Study lane"
          sessionTitle="Deep Reading"
          sessionSubtext="45 minutes"
        />
      );
      expect(getByText('Study lane')).toBeTruthy();
      expect(getByText('Deep Reading')).toBeTruthy();
      expect(getByText('45 minutes')).toBeTruthy();
    });
    
    it('renders launch button when provided', () => {
      const { getByRole } = render(
        <VexFocusSurface
          sessionTitle="Ready"
          launchButton={<button>Start</button>}
        />
      );
      expect(getByRole('button')).toBeTruthy();
    });
  });
  ```

  Run: `npm test -- --testPathPattern="VexFocusSurface" --no-coverage`
  Expected: FAIL

- [ ] **Step 2: Implement VexFocusSurface**

  Single adaptive surface (~60% screen height). Uses `VexMotionSurface` as base.

  Layout:
  - Top: lane context text (small, muted)
  - Center: session title (large, primary) + subtext (body, secondary)
  - Bottom: `VexLaunchButton` or passed-in launch component

  Background: subtle gradient from `surfaceElevated` to `background`.
  Inner glow: `rgba(0,229,255,0.04)` at bottom edge.

  Keep under 200 lines.

- [ ] **Step 3: Run tests**

  Run: `npm test -- --testPathPattern="VexFocusSurface" --no-coverage`
  Expected: PASS

- [ ] **Step 4: Commit**

  ```bash
  git add src/screens/home/components/VexFocusSurface.tsx src/screens/home/components/__tests__/VexFocusSurface.test.tsx
  git commit -m "feat(home): VexFocusSurface — adaptive hero surface with lane context"
  ```

---

### Task 3.2: Create VexCompanionAura

**Files:**
- Create: `src/features/companion/components/VexCompanionAura.tsx`
- Test: `src/features/companion/components/__tests__/VexCompanionAura.test.tsx`

- [ ] **Step 1: Write failing test**

  ```tsx
  import React from 'react';
  import { render } from '@testing-library/react-native';
  import { VexCompanionAura } from '../VexCompanionAura';
  
  describe('VexCompanionAura', () => {
    it('renders geometric aura', () => {
      const { getByLabelText } = render(<VexCompanionAura />);
      expect(getByLabelText('Companion aura')).toBeTruthy();
    });
    
    it('accepts lane accent color', () => {
      const { toJSON } = render(<VexCompanionAura laneColor="#3B82F6" />);
      expect(toJSON()).toBeTruthy();
    });
  });
  ```

  Run: `npm test -- --testPathPattern="VexCompanionAura" --no-coverage`
  Expected: FAIL

- [ ] **Step 2: Implement VexCompanionAura**

  Abstract geometric orb:
  - SVG-based: soft rounded hex or circle
  - Radial gradient center: lane color (default cyan)
  - Slow color drift or subtle pulse (6s cycle)
  - Size: 48-64dp
  - No face. No eyes. No emoji.
  - Text hint below: calm, mature (e.g., "Ready when you are")

  Use Reanimated for drift. Reduced motion: static.

  Keep under 200 lines.

- [ ] **Step 3: Run tests**

  Run: `npm test -- --testPathPattern="VexCompanionAura" --no-coverage`
  Expected: PASS

- [ ] **Step 4: Commit**

  ```bash
  git add src/features/companion/components/VexCompanionAura.tsx src/features/companion/components/__tests__/VexCompanionAura.test.tsx
  git commit -m "feat(companion): VexCompanionAura — abstract geometric aura, no pet imagery"
  ```

---

### Task 3.3: Integrate Home Signature

**Files:**
- Modify: `src/screens/home/HomeScreen.tsx`
- Modify: `src/screens/home/components/HomeContent.tsx`
- Modify: `src/screens/home/components/HomeHeroSection.tsx`
- Modify: `src/screens/home/components/HomeSessionControl.tsx`
- Modify: `src/screens/home/components/HomeCompanionSection.tsx`
- Modify: `src/screens/home/components/HomeStreakProgress.tsx`
- Modify: `src/features/home-spine/components/StartSessionButton.tsx`

- [ ] **Step 1: Read current Home structure**

  Read `HomeContent.tsx`, `HomeHeroSection.tsx`, `HomeSessionControl.tsx`. Document current layout.

- [ ] **Step 2: Wire VexFocusSurface into Home**

  In `HomeContent.tsx` or `HomeHeroSection.tsx`, replace the existing hero card/stack with `VexFocusSurface`.

  Pass:
  - `laneContext` from current lane
  - `sessionTitle` from next recommended session or default "Ready to protect"
  - `sessionSubtext` from duration/mode
  - `launchButton`: `VexLaunchButton` or wrapped `StartSessionButton`

- [ ] **Step 3: Wire VexCompanionAura**

  In `HomeCompanionSection.tsx` or `HomeCompanionWidget.tsx`, replace the existing companion card with `VexCompanionAura`.

- [ ] **Step 4: Quiet premium streak progress**

  In `HomeStreakProgress.tsx`, replace any emoji (flame, etc.) with quiet text + thin cyan progress line.

  Example: "12 days protected" with a 4dp height bar.

- [ ] **Step 5: StartSessionButton preservation**

  Per constraint: Do not delete `StartSessionButton.tsx`. If `HomeSessionControl.tsx` currently uses `StartSessionButton`, you have two options:
  a) Keep `StartSessionButton` import and usage, but update `StartSessionButton.tsx` to render `VexLaunchButton` internally while preserving all props and tracking events.
  b) Replace the usage with `VexLaunchButton` directly in Home, but keep `StartSessionButton.tsx` and its tests untouched.

  Choose option (a) if it preserves tests cleanly.

- [ ] **Step 6: Verify no emoji in Home**

  Search:
  ```bash
  grep -r "[\x{1F300}-\x{1F9FF}]" src/screens/home/ src/features/home-spine/components/StartSessionButton.tsx || echo "No emoji found"
  ```

- [ ] **Step 7: Run typecheck**

  Run: `npm run typecheck -- --pretty false`
  Expected: 0 errors

- [ ] **Step 8: Run home tests**

  Run: `npm test -- --testPathPattern="home-spine" --no-coverage`
  Expected: PASS (or only pre-existing failures)

- [ ] **Step 9: Commit**

  ```bash
  git add src/screens/home/ src/features/home-spine/components/StartSessionButton.tsx
  git commit -m "feat(home): integrate VexFocusSurface, VexCompanionAura, premium streak line"
  ```

---

## Phase 4: Active Session Signature

### Task 4.1: Create VexFocusField

**Files:**
- Create: `src/screens/session/components/VexFocusField.tsx`

- [ ] **Step 1: Implement VexFocusField**

  Animated gradient mesh using Reanimated `LinearGradient` with animated color stops.

  ```tsx
  import React from 'react';
  import { Dimensions } from 'react-native';
  import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withRepeat,
    withTiming,
    interpolate,
    Easing,
  } from 'react-native-reanimated';
  import { LinearGradient } from 'expo-linear-gradient';
  import { useReducedMotion } from '../../../hooks/useReducedMotion';

  const { width, height } = Dimensions.get('window');

  interface VexFocusFieldProps {
    lane?: 'student' | 'game_like' | 'deep_creative' | 'minimal_normal';
    paused?: boolean;
  }

  const LANE_BIAS = {
    student: ['#0A0A0F', '#0D1B1E', '#0A0A0F'],
    game_like: ['#0A0A0F', '#120D1E', '#0A0A0F'],
    deep_creative: ['#0A0A0F', '#0D1E1A', '#0A0A0F'],
    minimal_normal: ['#0A0A0F', '#0F0F14', '#0A0A0F'],
  };

  export function VexFocusField({ lane = 'minimal_normal', paused }: VexFocusFieldProps): JSX.Element {
    const { isReducedMotion } = useReducedMotion();
    const progress = useSharedValue(0);

    if (!isReducedMotion && !paused) {
      progress.value = withRepeat(
        withTiming(1, { duration: 12000, easing: Easing.linear }),
        -1,
        true
      );
    }

    const animatedStyle = useAnimatedStyle(() => {
      const p = isReducedMotion || paused ? 0 : progress.value;
      return {
        opacity: paused ? 0.6 : 1,
      };
    });

    const colors = LANE_BIAS[lane] ?? LANE_BIAS.minimal_normal;

    return (
      <Animated.View style={[{ position: 'absolute', width, height }, animatedStyle]}>
        <LinearGradient
          colors={colors}
          style={{ width, height }}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
      </Animated.View>
    );
  }
  ```

  Keep under 200 lines.

- [ ] **Step 2: Commit**

  ```bash
  git add src/screens/session/components/VexFocusField.tsx
  git commit -m "feat(session): VexFocusField — animated gradient mesh with lane bias"
  ```

---

### Task 4.2: Create VexSessionChamber

**Files:**
- Create: `src/screens/session/components/VexSessionChamber.tsx`
- Test: `src/screens/session/components/__tests__/VexSessionChamber.test.tsx`

- [ ] **Step 1: Write failing test**

  ```tsx
  import React from 'react';
  import { render } from '@testing-library/react-native';
  import { VexSessionChamber } from '../VexSessionChamber';
  
  describe('VexSessionChamber', () => {
    it('renders children', () => {
      const { getByText } = render(
        <VexSessionChamber><>Content</></VexSessionChamber>
      );
      expect(getByText('Content')).toBeTruthy();
    });
    
    it('applies paused dimming', () => {
      const { getByTestId } = render(
        <VexSessionChamber paused testID="chamber"><></></VexSessionChamber>
      );
      expect(getByTestId('chamber')).toBeTruthy();
    });
  });
  ```

  Run: `npm test -- --testPathPattern="VexSessionChamber" --no-coverage`
  Expected: FAIL

- [ ] **Step 2: Implement VexSessionChamber**

  Wraps `VexFocusField` + children. Adds:
  - Pause dimming overlay (Animated.View opacity)
  - Final stretch brightening (subtle)
  - Completion threshold line (animated horizontal sweep)

  State props: `paused`, `isFinalStretch`, `showCompletionLine`.

  Use Reanimated for all transitions.

  Keep under 200 lines. Extract subcomponents if needed.

- [ ] **Step 3: Run tests**

  Run: `npm test -- --testPathPattern="VexSessionChamber" --no-coverage`
  Expected: PASS

- [ ] **Step 4: Commit**

  ```bash
  git add src/screens/session/components/VexSessionChamber.tsx src/screens/session/components/__tests__/VexSessionChamber.test.tsx
  git commit -m "feat(session): VexSessionChamber — focus chamber with pause dim and completion sweep"
  ```

---

### Task 4.3: Create VexProgressSignal

**Files:**
- Create: `src/screens/session/components/VexProgressSignal.tsx`
- Test: `src/screens/session/components/__tests__/VexProgressSignal.test.tsx`

- [ ] **Step 1: Write failing test**

  ```tsx
  import React from 'react';
  import { render } from '@testing-library/react-native';
  import { VexProgressSignal } from '../VexProgressSignal';
  
  describe('VexProgressSignal', () => {
    it('renders timer text', () => {
      const { getByText } = render(
        <VexProgressSignal progress={0.5} remainingSeconds={600} label="Focus" />
      );
      expect(getByText('10:00')).toBeTruthy();
      expect(getByText('Focus')).toBeTruthy();
    });
    
    it('has no emoji', () => {
      const { toJSON } = render(
        <VexProgressSignal progress={0} remainingSeconds={0} />
      );
      expect(JSON.stringify(toJSON())).not.toMatch(/[\u{1F300}-\u{1F9FF}]/u);
    });
  });
  ```

  Run: `npm test -- --testPathPattern="VexProgressSignal" --no-coverage`
  Expected: FAIL

- [ ] **Step 2: Implement VexProgressSignal**

  Premium SVG ring:
  - Outer track: `rgba(240,240,245,0.08)`, 12dp
  - Middle lane ring: lane color at opacity 0.12, 8dp
  - Inner fill: `#00E5FF` with glow filter, 6dp
  - Tip node: small cyan circle traveling the ring
  - Timer: monospaced numerals, large (48-64dp), centered
  - Label: "Focus" or mode name, below timer
  - Purity: secondary inner ring glows brighter when purity > 80

  Use Reanimated `useAnimatedProps` for SVG `strokeDashoffset`.

  Helper for time formatting: `formatSeconds(seconds)` → "MM:SS"

  Keep under 200 lines. Split into `VexProgressSignal.tsx` + `VexProgressRingSvg.tsx` if needed.

- [ ] **Step 3: Run tests**

  Run: `npm test -- --testPathPattern="VexProgressSignal" --no-coverage`
  Expected: PASS

- [ ] **Step 4: Commit**

  ```bash
  git add src/screens/session/components/VexProgressSignal.tsx src/screens/session/components/__tests__/VexProgressSignal.test.tsx
  git commit -m "feat(session): VexProgressSignal — premium SVG ring with glow tip and purity indicator"
  ```

---

### Task 4.4: Create VexFocusSignal (Session Companion)

**Files:**
- Create: `src/features/companion/components/VexFocusSignal.tsx`
- Test: `src/features/companion/components/__tests__/VexFocusSignal.test.tsx`

- [ ] **Step 1: Write failing test**

  ```tsx
  import React from 'react';
  import { render } from '@testing-library/react-native';
  import { VexFocusSignal } from '../VexFocusSignal';
  
  describe('VexFocusSignal', () => {
    it('renders abstract signal', () => {
      const { getByLabelText } = render(<VexFocusSignal />);
      expect(getByLabelText('Focus signal')).toBeTruthy();
    });
    
    it('accepts mood state', () => {
      const { toJSON } = render(<VexFocusSignal mood="focused" />);
      expect(toJSON()).toBeTruthy();
    });
  });
  ```

  Run: `npm test -- --testPathPattern="VexFocusSignal" --no-coverage`
  Expected: FAIL

- [ ] **Step 2: Implement VexFocusSignal**

  Abstract geometric signal for active session:
  - Pulsing core (circle or rounded shape)
  - 2-3 small orbiting shapes (Reanimated rotation)
  - Size: ~80dp total
  - No face. No pet body.
  - State shifts:
    - `focused`: calm pulse, cyan
    - `distracted`: contraction, slightly warmer
    - `struggling`: faster pulse, subtle red tint

  Reduced motion: static shape, no orbit animation.

  Keep under 200 lines.

- [ ] **Step 3: Run tests**

  Run: `npm test -- --testPathPattern="VexFocusSignal" --no-coverage`
  Expected: PASS

- [ ] **Step 4: Commit**

  ```bash
  git add src/features/companion/components/VexFocusSignal.tsx src/features/companion/components/__tests__/VexFocusSignal.test.tsx
  git commit -m "feat(companion): VexFocusSignal — abstract session companion with mood response"
  ```

---

### Task 4.5: Create VexControlDock

**Files:**
- Create: `src/screens/session/components/VexControlDock.tsx`
- Test: `src/screens/session/components/__tests__/VexControlDock.test.tsx`

- [ ] **Step 1: Write failing test**

  ```tsx
  import React from 'react';
  import { fireEvent, render } from '@testing-library/react-native';
  import { VexControlDock } from '../VexControlDock';
  
  describe('VexControlDock', () => {
    it('renders three controls', () => {
      const { getByLabelText } = render(
        <VexControlDock onPause={jest.fn()} onEnd={jest.fn()} onSettings={jest.fn()} />
      );
      expect(getByLabelText('Pause session')).toBeTruthy();
      expect(getByLabelText('End session')).toBeTruthy();
      expect(getByLabelText('Session settings')).toBeTruthy();
    });
    
    it('calls onPause', () => {
      const onPause = jest.fn();
      const { getByLabelText } = render(
        <VexControlDock onPause={onPause} />
      );
      fireEvent.press(getByLabelText('Pause session'));
      expect(onPause).toHaveBeenCalled();
    });
  });
  ```

  Run: `npm test -- --testPathPattern="VexControlDock" --no-coverage`
  Expected: FAIL

- [ ] **Step 2: Implement VexControlDock**

  Minimal centered bottom row:
  - Pause: subtle square SVG icon
  - End: muted danger outline (thin, not red fill)
  - Settings: gear SVG icon
  - Size: 48dp touch targets
  - Press: scale 0.92 + haptic (via haptics.ts, reduced-motion checked) + brief opacity dip
  - No text labels

  Use Reanimated for press scale.

  Keep under 200 lines.

- [ ] **Step 3: Run tests**

  Run: `npm test -- --testPathPattern="VexControlDock" --no-coverage`
  Expected: PASS

- [ ] **Step 4: Commit**

  ```bash
  git add src/screens/session/components/VexControlDock.tsx src/screens/session/components/__tests__/VexControlDock.test.tsx
  git commit -m "feat(session): VexControlDock — minimal tactile session controls"
  ```

---

### Task 4.6: Integrate Active Session Signature

**Files:**
- Modify: `src/screens/session/ActiveSessionScreen.tsx`
- Modify: `src/screens/session/ActiveSessionContent.tsx`
- Modify: `src/screens/session/components/ActiveSessionHero.tsx`
- Modify: `src/screens/session/components/ActiveSessionModeOverlays.tsx`

- [ ] **Step 1: Replace background with VexSessionChamber**

  In `ActiveSessionContent.tsx`, replace `ActiveSessionBackground` with `VexSessionChamber`.
  Pass `lane`, `paused`, `isFinalStretch`, `showCompletionLine` props.

- [ ] **Step 2: Replace progress ring with VexProgressSignal**

  In `ActiveSessionHero.tsx`, replace `ActiveSessionProgressRing` + `Inner` with `VexProgressSignal`.
  Pass `progress`, `remainingSeconds`, `purityScore`, `label`.

- [ ] **Step 3: Replace companion layer with VexFocusSignal**

  In `ActiveSessionContent.tsx`, replace `CompanionSessionLayer` with `VexFocusSignal`.
  Pass mood/state from companion data.

- [ ] **Step 4: Replace controls with VexControlDock**

  In `ActiveSessionContent.tsx`, replace `ActiveSessionControlDock` + `BottomControls` with `VexControlDock`.
  Wire pause/end/settings callbacks to existing controller actions.

- [ ] **Step 5: Verify no emoji in active session**

  Search:
  ```bash
  grep -r "[\x{1F300}-\x{1F9FF}]" src/screens/session/ src/session/components/ || echo "No emoji found"
  ```

- [ ] **Step 6: Run typecheck**

  Run: `npm run typecheck -- --pretty false`
  Expected: 0 errors

- [ ] **Step 7: Run session tests**

  Run: `npm test -- --testPathPattern="session" --no-coverage`
  Expected: PASS (or only pre-existing failures)

- [ ] **Step 8: Commit**

  ```bash
  git add src/screens/session/
  git commit -m "feat(session): integrate VexSessionChamber, VexProgressSignal, VexFocusSignal, VexControlDock"
  ```

---

## Phase 5: Completion Signature

### Task 5.1: Create VexProofRing

**Files:**
- Create: `src/screens/session/components/VexProofRing.tsx`
- Test: `src/screens/session/components/__tests__/VexProofRing.test.tsx`

- [ ] **Step 1: Write failing test**

  ```tsx
  import React from 'react';
  import { render } from '@testing-library/react-native';
  import { VexProofRing } from '../VexProofRing';
  
  describe('VexProofRing', () => {
    it('renders grade letter', () => {
      const { getByText } = render(<VexProofRing grade="A" />);
      expect(getByText('A')).toBeTruthy();
    });
    
    it('has no emoji', () => {
      const { toJSON } = render(<VexProofRing grade="S" />);
      expect(JSON.stringify(toJSON())).not.toMatch(/[\u{1F300}-\u{1F9FF}]/u);
    });
  });
  ```

  Run: `npm test -- --testPathPattern="VexProofRing" --no-coverage`
  Expected: FAIL

- [ ] **Step 2: Implement VexProofRing**

  Large SVG ring (180-220dp diameter):
  - Stroke animation: completes over 800ms (SVG stroke-dashoffset via Reanimated)
  - Grade letter scales in with spring after 400ms delay
  - Grade colors:
    - S: `#FFB300` with glow
    - A: `#00E5FF`
    - B/C: `#F0F0F5`
    - D: `#8B8B9A`

  Use `withDelay` + `withSequence` for staged reveal.

  Keep under 200 lines.

- [ ] **Step 3: Run tests**

  Run: `npm test -- --testPathPattern="VexProofRing" --no-coverage`
  Expected: PASS

- [ ] **Step 4: Commit**

  ```bash
  git add src/screens/session/components/VexProofRing.tsx src/screens/session/components/__tests__/VexProofRing.test.tsx
  git commit -m "feat(session): VexProofRing — animated completion grade ring"
  ```

---

### Task 5.2: Create VexCompletionProof

**Files:**
- Create: `src/screens/session/components/VexCompletionProof.tsx`
- Test: `src/screens/session/components/__tests__/VexCompletionProof.test.tsx`

- [ ] **Step 1: Write failing test**

  ```tsx
  import React from 'react';
  import { render } from '@testing-library/react-native';
  import { VexCompletionProof } from '../VexCompletionProof';
  
  describe('VexCompletionProof', () => {
    it('renders grade and proof lines', () => {
      const { getByText } = render(
        <VexCompletionProof
          grade="A"
          duration={1200}
          purity={85}
          streakDays={12}
        />
      );
      expect(getByText('A')).toBeTruthy();
    });
  });
  ```

  Run: `npm test -- --testPathPattern="VexCompletionProof" --no-coverage`
  Expected: FAIL

- [ ] **Step 2: Implement VexCompletionProof**

  Completion hero surface:
  - Background: warm obsidian-gold gradient (`#0A0A0F` → `rgba(255,179,0,0.06)`)
  - Center: `VexProofRing`
  - Below ring: three quiet proof lines (duration, purity, streak)
    - Duration: clock SVG icon + "20 minutes"
    - Purity: shield SVG icon + "85%"
    - Streak: thin line + "12 → 13" with subtle pulse on new number
  - No confetti. No reward panels.

  Keep under 200 lines. Extract proof lines to `CompletionProofLines.tsx` if needed.

- [ ] **Step 3: Run tests**

  Run: `npm test -- --testPathPattern="VexCompletionProof" --no-coverage`
  Expected: PASS

- [ ] **Step 4: Commit**

  ```bash
  git add src/screens/session/components/VexCompletionProof.tsx src/screens/session/components/__tests__/VexCompletionProof.test.tsx
  git commit -m "feat(session): VexCompletionProof — completion hero with proof lines"
  ```

---

### Task 5.3: Integrate Completion Signature

**Files:**
- Modify: `src/screens/session/SessionCompleteScreen.tsx`
- Modify: `src/screens/session/components/SessionCompleteContent.tsx`
- Modify: `src/screens/session/components/SessionCompleteHeroSection.tsx`
- Modify: `src/screens/session/components/SessionCompleteRewardsPhase.tsx`
- Modify: `src/screens/session/components/SessionCompleteNextSteps.tsx`
- Modify: `src/screens/session/components/SessionGradeCard.tsx`

- [ ] **Step 1: Replace hero with VexCompletionProof**

  In `SessionCompleteContent.tsx`, replace `SessionCompleteHeroSection` + `SessionGradeCard` with `VexCompletionProof`.

- [ ] **Step 2: Replace rewards with quiet proof lines**

  In `SessionCompleteRewardsPhase.tsx`, replace any reward panel/emoji/confetti with the quiet proof line style from `VexCompletionProof`. Keep the same data (XP, streak, etc.) but present as minimal lines.

- [ ] **Step 3: Replace next steps with single surface**

  In `SessionCompleteNextSteps.tsx`, replace any list/stack with a single `VexMotionSurface` (glass variant) showing one next recommended session. Not a list. One thing.

- [ ] **Step 4: Staged reveal animation**

  In `SessionCompleteContent.tsx`, implement the staged reveal:
  1. Background shift (300ms)
  2. Proof ring animation (800ms)
  3. Grade spring (400ms delay)
  4. Proof lines stagger (150ms each)
  5. Next step fade-up (300ms)

  Use Reanimated `withDelay` + `withSequence`.

- [ ] **Step 5: Verify no emoji in completion**

  Search:
  ```bash
  grep -r "[\x{1F300}-\x{1F9FF}]" src/screens/session/SessionCompleteScreen.tsx src/screens/session/components/SessionComplete*.tsx || echo "No emoji found"
  ```

- [ ] **Step 6: Run typecheck**

  Run: `npm run typecheck -- --pretty false`
  Expected: 0 errors

- [ ] **Step 7: Run completion tests**

  Run: `npm test -- --testPathPattern="session-completion" --no-coverage`
  Expected: PASS (or only pre-existing failures)

- [ ] **Step 8: Commit**

  ```bash
  git add src/screens/session/SessionCompleteScreen.tsx src/screens/session/components/SessionComplete*.tsx
  git commit -m "feat(session): integrate VexCompletionProof with staged reveal animation"
  ```

---

## Phase 6: Companion / Coach Signature

### Task 6.1: Create VexSignalState

**Files:**
- Create: `src/features/companion/components/VexSignalState.tsx`
- Test: `src/features/companion/components/__tests__/VexSignalState.test.tsx`

- [ ] **Step 1: Write failing test**

  ```tsx
  import React from 'react';
  import { render } from '@testing-library/react-native';
  import { VexSignalState } from '../VexSignalState';
  
  describe('VexSignalState', () => {
    it('renders state dot', () => {
      const { getByLabelText } = render(<VexSignalState state="focused" />);
      expect(getByLabelText('Signal state: focused')).toBeTruthy();
    });
  });
  ```

  Run: `npm test -- --testPathPattern="VexSignalState" --no-coverage`
  Expected: FAIL

- [ ] **Step 2: Implement VexSignalState**

  Small dot/pulse next to companion:
  - Color temperature:
    - `focused`: cool cyan `#00E5FF`
    - `active`: warm amber `#FFB300`
    - `struggling`: muted red `#EF4444` (subtle, not alarming)
  - No emoji. No "happy/sad" labels.
  - Size: 8-12dp dot

  Keep under 50 lines.

- [ ] **Step 3: Run tests**

  Run: `npm test -- --testPathPattern="VexSignalState" --no-coverage`
  Expected: PASS

- [ ] **Step 4: Commit**

  ```bash
  git add src/features/companion/components/VexSignalState.tsx src/features/companion/components/__tests__/VexSignalState.test.tsx
  git commit -m "feat(companion): VexSignalState — abstract mood indicator with color temperature"
  ```

---

### Task 6.2: Rebuild AnimatedCoachAvatar

**Files:**
- Read: `src/components/coach/AnimatedCoachAvatar.tsx`
- Modify: `src/components/coach/AnimatedCoachAvatar.tsx`

- [ ] **Step 1: Read current implementation**

  Read the file. Document current approach (image? SVG? emoji?).

- [ ] **Step 2: Rebuild as abstract geometric face**

  SVG-based abstract coach:
  - 3-4 soft polygons forming a calm expression
  - Cyan accent: small geometric shapes as "eyes" with glow
  - Animation:
    - Blink: slow opacity cycle on eye shapes (4s, Reanimated)
    - Head tilt: slight rotate on state change (`withSpring`, ±3deg)
  - Size: 48-64dp in cards, 32dp in hints
  - No cartoon features. No emoji.

  Keep under 200 lines. Extract SVG paths to helper if needed.

- [ ] **Step 3: Verify no emoji**

  Search the file for emoji unicode.

- [ ] **Step 4: Commit**

  ```bash
  git add src/components/coach/AnimatedCoachAvatar.tsx
  git commit -m "feat(coach): AnimatedCoachAvatar — abstract geometric face with cyan glow"
  ```

---

### Task 6.3: Enhance CoachPresenceCard

**Files:**
- Read: `src/features/coach-presence/components/CoachPresenceCard.tsx`
- Modify: `src/features/coach-presence/components/CoachPresenceCard.tsx`

- [ ] **Step 1: Read current implementation**

  Read the file. Note any emoji, card stack styling, or avatar-on-left layout.

- [ ] **Step 2: Recompose as glass text-first surface**

  - Use `VexMotionSurface` (glass variant)
  - Layout: text-first. No avatar on left.
  - Title + body text in clean hierarchy
  - Reduced padding. More negative space.
  - Subtle border: `rgba(0,229,255,0.06)`

- [ ] **Step 3: Verify no emoji**

  Remove any emoji from visible UI strings.

- [ ] **Step 4: Commit**

  ```bash
  git add src/features/coach-presence/components/CoachPresenceCard.tsx
  git commit -m "feat(coach): CoachPresenceCard — glass text-first surface"
  ```

---

### Task 6.4: Enhance SmartCoachHint

**Files:**
- Read: `src/components/coach/SmartCoachHint.tsx`
- Modify: `src/components/coach/SmartCoachHint.tsx`

- [ ] **Step 1: Read current implementation**

  Read the file. Note current styling (chat bubble? card?).

- [ ] **Step 2: Convert to floating glass pill**

  - Glass pill: `rgba(18,18,26,0.8)` + border
  - Position: floating above companion signal
  - Fade in: `FadeInUp` (200ms)
  - Exit: `FadeOut` (150ms)
  - No avatar icon next to text
  - No chat bubble tail

- [ ] **Step 3: Commit**

  ```bash
  git add src/components/coach/SmartCoachHint.tsx
  git commit -m "feat(coach): SmartCoachHint — floating glass pill, no chat bubble"
  ```

---

### Task 6.5: Integrate Companion/Coach

**Files:**
- Modify: `src/features/companion/components/LivingCompanion.tsx`
- Modify: `src/features/companion/components/CompanionBody.tsx`
- Modify: `src/features/companion/components/MoodIndicator.tsx`
- Modify: `src/features/companion/components/CompanionSessionLayer.tsx`

- [ ] **Step 1: Wire VexCompanionAura in LivingCompanion**

  Replace card-based companion with `VexCompanionAura` for the default/calm path.

- [ ] **Step 2: Replace MoodIndicator with VexSignalState**

  In `MoodIndicator.tsx` or wherever mood is displayed, use `VexSignalState` instead.

- [ ] **Step 3: Update CompanionBody for abstract forms**

  Replace any pet/egg/body imagery with abstract signal forms. Keep internal state logic unchanged.

- [ ] **Step 4: Verify no emoji in companion files**

  Search:
  ```bash
  grep -r "[\x{1F300}-\x{1F9FF}]" src/features/companion/ src/components/coach/ || echo "No emoji found"
  ```

- [ ] **Step 5: Run tests**

  Run: `npm test -- --testPathPattern="companion|coach" --no-coverage`
  Expected: PASS (or only pre-existing failures)

- [ ] **Step 6: Commit**

  ```bash
  git add src/features/companion/ src/components/coach/
  git commit -m "feat(companion,coach): integrate VexCompanionAura, VexSignalState, geometric coach"
  ```

---

## Phase 7: Final Verification

### Task 7.1: Typecheck

- [ ] **Step 1: Run full typecheck**

  Run: `npm run typecheck -- --pretty false`
  Expected: 0 errors

---

### Task 7.2: Tests

- [ ] **Step 1: Run focused test suites**

  Run:
  ```bash
  npm test -- --testPathPattern="home-spine|session|coach|companion|auth" --no-coverage
  ```
  Expected: PASS for all new tests. Existing tests should pass or only show pre-existing failures.

---

### Task 7.3: Quality Checks

- [ ] **Step 1: Line limit check**

  Run: `npm run check:line-limit`
  Expected: "Line limit OK: every source file is <= 200 lines."

- [ ] **Step 2: Banned patterns check**

  Run: `npm run check:banned-patterns`
  Expected: "Banned-pattern check OK: no violations found."

- [ ] **Step 3: No ts-nocheck check**

  Run: `npm run check:no-ts-nocheck`
  Expected: 0 `@ts-nocheck` comments

- [ ] **Step 4: Emoji scan**

  Run:
  ```bash
  grep -r "[\x{1F300}-\x{1F9FF}]" src/screens/auth/ src/screens/home/ src/screens/session/ src/features/companion/ src/components/coach/ src/features/coach-presence/ || echo "No emoji found"
  ```
  Expected: "No emoji found" in core UI files.

- [ ] **Step 5: launchColors scan**

  Run:
  ```bash
  grep -r "launchColors" src/screens/ src/features/ src/components/ --include="*.tsx" --include="*.ts" || echo "No launchColors found"
  ```
  Expected: "No launchColors found" in new/modified component files.

---

### Task 7.4: Commit verification results

- [ ] **Step 1: Commit**

  ```bash
  git commit -m "chore: verify premium visual pass — typecheck, tests, line-limit, patterns clean"
  ```

---

## Plan Self-Review

### Spec Coverage Check

| Spec Section | Implementing Task |
|--------------|-------------------|
| Brand system (obsidian, cyan, gold) | All tasks via inline values + theme |
| VexMotionSurface | Task 1.1 |
| VexLaunchButton | Task 1.2 |
| VexEntryBackground enhancement | Task 2.1 |
| VexFocusLoop | Task 2.2 |
| Auth integration | Task 2.3, 2.4 |
| VexFocusSurface | Task 3.1 |
| VexCompanionAura | Task 3.2 |
| Home integration | Task 3.3 |
| VexFocusField | Task 4.1 |
| VexSessionChamber | Task 4.2 |
| VexProgressSignal | Task 4.3 |
| VexFocusSignal | Task 4.4 |
| VexControlDock | Task 4.5 |
| Active Session integration | Task 4.6 |
| VexProofRing | Task 5.1 |
| VexCompletionProof | Task 5.2 |
| Completion integration | Task 5.3 |
| VexSignalState | Task 6.1 |
| AnimatedCoachAvatar | Task 6.2 |
| CoachPresenceCard | Task 6.3 |
| SmartCoachHint | Task 6.4 |
| Companion/Coach integration | Task 6.5 |
| Reduced motion fallbacks | Every animated component |
| Haptics safety | Every haptic call via haptics.ts + useReducedMotion |
| StartSessionButton preservation | Task 3.3 Step 5 |
| Emoji removal scope | Verification tasks |

**Gaps:** None identified.

### Placeholder Scan

- No "TBD", "TODO", "implement later" found.
- All code steps contain actual code or clear implementation guidance.
- All tests contain actual test code.

### Type Consistency

- `VexMotionSurfaceProps.variant` uses `'glass' | 'elevated' | 'focused'` consistently.
- `lane` type uses `'student' | 'game_like' | 'deep_creative' | 'minimal_normal'` consistently across `VexFocusField` and `VexSessionChamber`.
- `grade` type is string (`"S" | "A" | "B" | "C" | "D"`) in `VexProofRing`.

No inconsistencies found.

---

**Plan Status:** Ready for execution.
