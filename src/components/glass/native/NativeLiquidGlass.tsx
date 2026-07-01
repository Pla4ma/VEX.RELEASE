import React, { type ReactNode } from 'react';
import { View, type ColorValue, type StyleProp, type ViewProps, type ViewStyle } from 'react-native';

import { vexLightGlass } from '@/theme/tokens/vex-light-glass';
import { canUseCallstackGlass, canUseNativeGlass } from './glassAvailability';
import { getBlurView, getCallstackGlassView, getGlassView, getLinearGradient } from './nativeModuleLoaders';

interface NativeLiquidGlassProps extends ViewProps {
  children?: ReactNode;
  tintColor?: ColorValue;
  interactive?: boolean;
  radius?: number;
  style?: StyleProp<ViewStyle>;
}

const absoluteFill: ViewStyle = {
  bottom: 0,
  left: 0,
  position: 'absolute',
  right: 0,
  top: 0,
};

/**
 * Primary glass primitive for cards, buttons, and interactive surfaces.
 *
 * Uses @callstack/liquid-glass on iOS 26+ (real-time refraction, shimmer on
 * touch, system-adaptive color scheme). Falls back to expo-glass-effect's
 * GlassView with 'clear' style, then to BlurView + gradient on other platforms.
 */
export const NativeLiquidGlass = React.memo(function NativeLiquidGlass({
  children,
  tintColor = 'transparent',
  interactive = false,
  radius = 28,
  style,
  ...viewProps
}: NativeLiquidGlassProps): React.ReactNode {
  // ── @callstack/liquid-glass path (preferred, iOS 26+) ──
  if (canUseCallstackGlass()) {
    const LiquidGlassC = getCallstackGlassView();
    return (
      <LiquidGlassC
        colorScheme="system"
        effect="clear"
        animated
        animationDuration={220}
        interactive={interactive}
        tintColor={tintColor}
        {...viewProps}
        style={[{ borderRadius: radius, overflow: 'hidden' }, style]}
      >
        {children}
      </LiquidGlassC>
    );
  }

  // ── expo-glass-effect fallback (iOS 26+ without callstack) ──
  if (canUseNativeGlass()) {
    const GlassViewC = getGlassView();
    return (
      <GlassViewC
        colorScheme="system"
        glassEffectStyle={{
          style: 'clear',
          animate: true,
          animationDuration: 0.22,
        }}
        isInteractive={interactive}
        tintColor={tintColor}
        {...viewProps}
        style={[{ borderRadius: radius, overflow: 'hidden' }, style]}
      >
        {children}
      </GlassViewC>
    );
  }

  // ── CSS fallback: BlurView + LinearGradient + semi-transparent background ──
  const BlurViewC = getBlurView();
  const LinearGradientC = getLinearGradient();

  return (
    <View
      {...viewProps}
      style={[
        {
          borderRadius: radius,
          overflow: 'hidden',
          backgroundColor: vexLightGlass.background.atmosphericPearl,
        },
        style,
      ]}
    >
      <BlurViewC
        intensity={42}
        tint="light"
        style={absoluteFill}
      />
      <LinearGradientC
        colors={[
          'rgba(255, 255, 255, 0.42)',
          'rgba(255, 255, 255, 0.14)',
          'rgba(255, 255, 255, 0.04)',
        ]}
        locations={[0, 0.46, 1]}
        pointerEvents="none"
        style={absoluteFill}
      />
      <View style={absoluteFill} pointerEvents="none" />
      <View>{children}</View>
    </View>
  );
});
