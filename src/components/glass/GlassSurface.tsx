import React, { type ReactNode } from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { GLASS_SURFACE_VARIANTS, type GlassSurfaceVariant } from './GlassSurface.tokens';
import { GlassBlurLayer } from './GlassBlurLayer';
import { GlassTextureOverlay } from './GlassTextureOverlay';

export type { GlassSurfaceVariant } from './GlassSurface.tokens';

interface GlassSurfaceProps {
  children?: ReactNode;
  variant?: GlassSurfaceVariant;
  radius: number;
  style?: StyleProp<ViewStyle>;
  bordered?: boolean;
  accentTopBar?: boolean;
  topBarColor?: string;
  testID?: string;
}

function TopHighlight({ color, stop, radius }: {
  color: string;
  stop: number;
  radius: number;
}): JSX.Element {
  return (
    <LinearGradient
      colors={[color, 'rgba(255, 255, 255, 0)']}
      end={{ x: 0, y: 1 }}
      locations={[0, stop]}
      start={{ x: 0, y: 0 }}
      style={{
        borderTopLeftRadius: radius,
        borderTopRightRadius: radius,
        bottom: 0,
        left: 0,
        position: 'absolute',
        right: 0,
        top: 0,
      }}
    />
  );
}

function BottomTint({ color, stop }: {
  color: string;
  stop: number;
}): JSX.Element {
  return (
    <LinearGradient
      colors={['rgba(255, 255, 255, 0)', color]}
      end={{ x: 0, y: 1 }}
      locations={[stop, 1]}
      start={{ x: 0, y: 0 }}
      style={{
        bottom: 0,
        left: 0,
        position: 'absolute',
        right: 0,
        top: 0,
      }}
    />
  );
}

function TopAccentBar({ color, radius }: {
  color: string;
  radius: number;
}): JSX.Element {
  return (
    <>
      <LinearGradient
        colors={[color, `${color}CC`, 'rgba(66, 207, 174, 0.0)']}
        end={{ x: 1, y: 0 }}
        locations={[0, 0.5, 1]}
        start={{ x: 0, y: 0 }}
        style={{
          borderTopLeftRadius: radius,
          borderTopRightRadius: radius,
          height: 7,
          left: 0,
          position: 'absolute',
          right: 0,
          top: 0,
        }}
      />
      <View
        pointerEvents="none"
        style={{
          backgroundColor: 'rgba(255, 255, 255, 0.92)',
          height: 1.5,
          left: 20,
          position: 'absolute',
          right: 20,
          top: 7,
        }}
      />
    </>
  );
}

function GlassBorder({ color, radius, width }: {
  color: string;
  radius: number;
  width: number;
}): JSX.Element {
  return (
    <View
      pointerEvents="none"
      style={{
        borderColor: color,
        borderRadius: radius,
        borderWidth: width,
        bottom: 0,
        left: 0,
        position: 'absolute',
        right: 0,
        top: 0,
      }}
    />
  );
}

function GlassOuterBorder({ color, radius }: {
  color: string;
  radius: number;
}): JSX.Element {
  return (
      <View
        pointerEvents="none"
        style={{
          borderColor: color,
          borderRadius: radius + 2,
          borderWidth: 1.5,
          bottom: -3,
          left: -3,
          position: 'absolute',
          right: -3,
          top: -3,
        }}
      />
  );
}

function TopEdgeHighlight({ intensity, radius }: {
  intensity: number;
  radius: number;
}): JSX.Element {
  return (
      <View
      pointerEvents="none"
      style={{
        backgroundColor: `rgba(255, 255, 255, ${intensity})`,
        borderTopLeftRadius: radius - 1,
        borderTopRightRadius: radius - 1,
        height: 2.2,
        left: 10,
        position: 'absolute',
        right: 10,
        top: 1.2,
      }}
    />
  );
}

function SecondEdgeHighlight({ radius }: {
  radius: number;
}): JSX.Element {
  return (
      <View
      pointerEvents="none"
      style={{
        backgroundColor: 'rgba(255, 255, 255, 0.72)',
        borderTopLeftRadius: radius - 2,
        borderTopRightRadius: radius - 2,
        height: 1.5,
        left: 14,
        position: 'absolute',
        right: 14,
        top: 3.2,
      }}
    />
  );
}

function BottomEdgeShadow({ radius }: {
  radius: number;
}): JSX.Element {
  return (
      <View
      pointerEvents="none"
      style={{
        backgroundColor: 'rgba(13, 76, 65, 0.18)',
        borderBottomLeftRadius: radius - 1,
        borderBottomRightRadius: radius - 1,
        bottom: 1.2,
        height: 2,
        left: 12,
        position: 'absolute',
        right: 12,
      }}
    />
  );
}

function GlassGlow({ color, opacity, radius }: {
  color: string;
  opacity: number;
  radius: number;
}): JSX.Element {
  return (
      <View
      pointerEvents="none"
      style={{
        backgroundColor: color,
        borderRadius: radius,
        bottom: -10,
        left: -10,
        opacity: opacity * 1.4,
        position: 'absolute',
        right: -10,
        top: -10,
      }}
    />
  );
}

export function GlassSurface({
  children,
  variant = 'default',
  radius,
  style,
  bordered = true,
  accentTopBar = false,
  topBarColor = '#42CFAE',
  testID,
}: GlassSurfaceProps): JSX.Element {
  const v = GLASS_SURFACE_VARIANTS[variant];
  return (
    <View
      testID={testID}
      style={[
        {
          borderRadius: radius,
          elevation: v.elevation,
          shadowColor: v.shadowColor,
          shadowOffset: v.shadowOffset,
          shadowOpacity: v.shadowOpacity,
          shadowRadius: v.shadowRadius,
        },
        style,
      ]}
    >
      {/* Outer glow for depth */}
      {v.glowColor ? (
        <GlassGlow
          color={v.glowColor}
          opacity={v.glowOpacity ?? 0.3}
          radius={radius + 8}
        />
      ) : null}
      
      {/* Outer border for physical thickness */}
      {bordered ? (
        <GlassOuterBorder color={v.border} radius={radius} />
      ) : null}
      
      <View
        style={{
          backgroundColor: v.fill,
          borderRadius: radius,
          overflow: 'hidden',
        }}
      >
        <GlassBlurLayer
          intensity={variant === 'hero' || variant === 'premium' ? 92 : 78}
          radius={radius}
        />
        <TopHighlight color={v.highlightTop} radius={radius} stop={v.highlightTopStop} />
        <GlassTextureOverlay
          intensity={variant === 'hero' || variant === 'premium' ? 'hero' : 'normal'}
          radius={radius}
        />
        {v.innerBottomTint && v.innerBottomStop !== undefined ? (
          <BottomTint color={v.innerBottomTint} stop={v.innerBottomStop} />
        ) : null}
        {bordered ? <GlassBorder color={v.border} radius={radius} width={v.borderWidth} /> : null}
        <TopEdgeHighlight intensity={v.topEdgeIntensity} radius={radius} />
        <SecondEdgeHighlight radius={radius} />
        <BottomEdgeShadow radius={radius} />
        {accentTopBar ? <TopAccentBar color={topBarColor} radius={radius} /> : null}
        {children}
      </View>
    </View>
  );
}

export default GlassSurface;
