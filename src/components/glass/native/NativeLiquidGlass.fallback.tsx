import React, { type ComponentType, type ReactNode } from 'react';
import { View, type StyleProp, type ViewProps, type ViewStyle } from 'react-native';

// Native module loaders return loosely-typed components.
// SAFETY: cast at the call site; props match BlurView/LinearGradient contracts.
type AnyNativeComponent = ComponentType<Record<string, unknown>>;

interface FallbackProps extends ViewProps {
  BlurViewC: AnyNativeComponent;
  LinearGradientC: AnyNativeComponent;
  children?: ReactNode;
  radius: number;
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
 * Bright frost liquid glass.
 * tint="light" is mandatory — "default" renders a grey system-material
 * veil that turns every surface into a muddy slab.
 * White frost carrier + crisp specular + subtle mint refraction.
 */
export function CraftedLiquidGlassFallback({
  BlurViewC,
  LinearGradientC,
  children,
  radius,
  style,
  ...viewProps
}: FallbackProps): React.ReactNode {
  return (
    <View
      {...viewProps}
      style={[
        {
          backgroundColor: 'rgba(255, 255, 255, 0.18)',
          borderRadius: radius,
          elevation: 10,
          overflow: 'hidden',
          shadowColor: '#0A5E4D',
          shadowOffset: { height: 12, width: 0 },
          shadowOpacity: 0.12,
          shadowRadius: 26,
        },
        style,
      ]}
    >
      {/* Frost — light material, never grey */}
      <BlurViewC intensity={60} style={absoluteFill} tint="light" />
      {/* Bright white carrier — overrides Android gray BlurView tint */}
      <LinearGradientC
        colors={[
          'rgba(255, 255, 255, 0.78)',
          'rgba(255, 255, 255, 0.38)',
          'rgba(255, 255, 255, 0.12)',
          'rgba(255, 255, 255, 0)',
        ]}
        end={{ x: 0.5, y: 1 }}
        locations={[0, 0.28, 0.6, 1]}
        pointerEvents="none"
        start={{ x: 0.3, y: 0 }}
        style={absoluteFill}
      />
      {/* Pearl carrier — bright frost, text stays legible */}
      <View
        pointerEvents="none"
        style={[absoluteFill, { backgroundColor: 'rgba(255, 255, 255, 0.18)' }]}
      />

      {/* Liquid specular — top light catch */}
      <LinearGradientC
        colors={[
          'rgba(255, 255, 255, 0.85)',
          'rgba(255, 255, 255, 0.3)',
          'rgba(255, 255, 255, 0)',
        ]}
        end={{ x: 0.5, y: 1 }}
        locations={[0, 0.42, 1]}
        pointerEvents="none"
        start={{ x: 0.35, y: 0 }}
        style={{
          height: '46%',
          left: 0,
          position: 'absolute',
          right: 0,
          top: 0,
        }}
      />

      {/* Mint refraction — whisper of brand color, never swamp */}
      <LinearGradientC
        colors={[
          'rgba(170, 245, 228, 0.14)',
          'rgba(255, 255, 255, 0)',
          'rgba(200, 240, 255, 0.08)',
        ]}
        end={{ x: 1, y: 1 }}
        locations={[0, 0.5, 1]}
        pointerEvents="none"
        start={{ x: 0, y: 0 }}
        style={absoluteFill}
      />

      {/* Soft floor depth */}
      <LinearGradientC
        colors={[
          'rgba(255, 255, 255, 0)',
          'rgba(10, 94, 77, 0.02)',
          'rgba(10, 94, 77, 0.05)',
        ]}
        end={{ x: 0.5, y: 1 }}
        locations={[0, 0.55, 1]}
        pointerEvents="none"
        start={{ x: 0.5, y: 0 }}
        style={{
          bottom: 0,
          height: '26%',
          left: 0,
          position: 'absolute',
          right: 0,
        }}
      />

      {/* Crystal top rim */}
      <View
        pointerEvents="none"
        style={{
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          borderTopLeftRadius: radius,
          borderTopRightRadius: radius,
          height: 1.4,
          left: 1,
          position: 'absolute',
          right: 1,
          top: 0,
        }}
      />

      {/* Left edge catch */}
      <View
        pointerEvents="none"
        style={{
          backgroundColor: 'rgba(255, 255, 255, 0.5)',
          borderBottomLeftRadius: radius,
          borderTopLeftRadius: radius,
          bottom: 8,
          left: 0,
          position: 'absolute',
          top: 8,
          width: 1,
        }}
      />

      {/* Bottom contact hairline */}
      <View
        pointerEvents="none"
        style={{
          backgroundColor: 'rgba(10, 94, 77, 0.08)',
          borderBottomLeftRadius: radius,
          borderBottomRightRadius: radius,
          bottom: 0,
          height: 1,
          left: 2,
          position: 'absolute',
          right: 2,
        }}
      />

      <View style={{ zIndex: 2 }}>{children}</View>
    </View>
  );
}
