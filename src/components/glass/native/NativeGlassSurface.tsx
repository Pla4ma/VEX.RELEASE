import React from 'react';
import { View, type StyleProp, type ViewProps, type ViewStyle } from 'react-native';
import { glassMaterials, vexLightGlass } from '@/theme/tokens/vex-light-glass';
import { canUseNativeGlass } from './glassAvailability';
import { getBlurView, getGlassView, getLinearGradient } from './nativeModuleLoaders';
import { getGlassContainer } from './nativeModuleLoaders';

// ─── Types ───────────────────────────────────────────────────────────

export type NativeGlassSurfaceVariant =
  | 'subtle'
  | 'regular'
  | 'hero'
  | 'nav'
  | 'pill'
  | 'sheet'
  | 'selected';

export interface NativeGlassSurfaceProps {
  children?: React.ReactNode;
  variant?: NativeGlassSurfaceVariant;
  radius?: number;
  interactive?: boolean;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  testID?: string;
  accessibilityLabel?: string;
  accessibilityRole?: ViewProps['accessibilityRole'];
  pointerEvents?: ViewProps['pointerEvents'];
  accessible?: boolean;
  accessibilityHint?: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────

function getTintColor(variant: NativeGlassSurfaceVariant): string {
  switch (variant) {
    case 'hero':
      return 'rgba(255, 255, 255, 0.22)';
    case 'nav':
      return 'rgba(255, 255, 255, 0.18)';
    case 'pill':
      return 'rgba(255, 255, 255, 0.14)';
    case 'selected':
      return 'rgba(95, 230, 197, 0.18)';
    case 'sheet':
      return 'rgba(255, 255, 255, 0.20)';
    case 'subtle':
      return 'rgba(255, 255, 255, 0.08)';
    default:
      return 'rgba(255, 255, 255, 0.16)';
  }
}

function getFallbackMaterial(variant: NativeGlassSurfaceVariant): ViewStyle {
  switch (variant) {
    case 'hero':
      return glassMaterials.hero as ViewStyle;
    case 'nav':
      return glassMaterials.nav as ViewStyle;
    case 'pill':
    case 'selected':
      return glassMaterials.tabPill as ViewStyle;
    case 'sheet':
      return glassMaterials.paneStrong as ViewStyle;
    default:
      return glassMaterials.pane as ViewStyle;
  }
}

function getGlassEffectStyle(variant: NativeGlassSurfaceVariant): 'clear' | 'regular' {
  switch (variant) {
    case 'subtle':
    case 'pill':
      return 'clear';
    default:
      return 'regular';
  }
}

const absoluteFill: ViewStyle = {
  bottom: 0,
  left: 0,
  position: 'absolute',
  right: 0,
  top: 0,
};

// ─── Component ───────────────────────────────────────────────────────

/**
 * NativeGlassSurface
 *
 * A VEX-native glass wrapper that routes to the real iOS `GlassView` when
 * available and fallback material when it is not.
 *
 * Rules:
 * - No mesh gradient inside this component.
 * - No haptic calls inside this component.
 * - No navigation or screen-specific imports.
 */
export const NativeGlassSurface = React.memo(function NativeGlassSurface({
  children,
  variant = 'regular',
  radius = 24,
  interactive = false,
  style,
  contentStyle,
  testID,
  accessibilityLabel,
  accessibilityRole,
  accessibilityHint,
  pointerEvents,
  accessible,
}: NativeGlassSurfaceProps): React.ReactNode {
  // ── Native glass path (iOS 26+ with Liquid Glass API) ──────────
  if (canUseNativeGlass()) {
    const GlassViewC = getGlassView();
    return (
      <GlassViewC
        testID={testID}
        accessibilityLabel={accessibilityLabel}
        accessibilityRole={accessibilityRole}
        accessibilityHint={accessibilityHint}
        accessible={accessible ?? Boolean(accessibilityLabel)}
        pointerEvents={pointerEvents}
        colorScheme="light"
        isInteractive={interactive}
        tintColor={getTintColor(variant)}
        glassEffectStyle={getGlassEffectStyle(variant)}
        style={[
          {
            borderRadius: radius,
            overflow: 'hidden',
          },
          style,
        ]}
      >
        <View style={contentStyle}>{children}</View>
      </GlassViewC>
    );
  }

  // ── Fallback path: non-iOS, Jest, or native glass unavailable ────
  const BlurViewC = getBlurView();
  const LinearGradientC = getLinearGradient();
  const isSubtle = variant === 'subtle';

  return (
    <View
      testID={testID}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole={accessibilityRole}
      accessibilityHint={accessibilityHint}
      accessible={accessible ?? Boolean(accessibilityLabel)}
      pointerEvents={pointerEvents}
      style={[
        {
          borderRadius: radius,
          overflow: 'hidden',
        },
        getFallbackMaterial(variant),
        style,
      ]}
    >
      <BlurViewC
        intensity={isSubtle ? 24 : 42}
        tint="light"
        style={absoluteFill}
      />
      <LinearGradientC
        colors={[
          'rgba(255, 255, 255, 0.82)',
          'rgba(255, 255, 255, 0.24)',
          'rgba(255, 255, 255, 0.08)',
        ]}
        locations={[0, 0.46, 1]}
        pointerEvents="none"
        style={absoluteFill}
      />
      <View
        style={[
          {
            backgroundColor: isSubtle
              ? vexLightGlass.background.transparent
              : vexLightGlass.background.atmosphericPearl,
          },
          absoluteFill,
        ]}
        pointerEvents="none"
      />
      <View style={contentStyle}>{children}</View>
    </View>
  );
});
