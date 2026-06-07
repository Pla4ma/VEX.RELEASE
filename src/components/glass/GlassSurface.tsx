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
        colors={[color, `${color}AA`, 'rgba(66, 207, 174, 0.0)']}
        end={{ x: 1, y: 0 }}
        locations={[0, 0.5, 1]}
        start={{ x: 0, y: 0 }}
        style={{
          borderTopLeftRadius: radius,
          borderTopRightRadius: radius,
          height: 6,
          left: 0,
          position: 'absolute',
          right: 0,
          top: 0,
        }}
      />
      <View
        pointerEvents="none"
        style={{
          backgroundColor: 'rgba(255, 255, 255, 0.7)',
          height: 1,
          left: 24,
          position: 'absolute',
          right: 24,
          top: 6,
        }}
      />
    </>
  );
}

function GlassBorder({ color, radius }: {
  color: string;
  radius: number;
}): JSX.Element {
  return (
    <View
      pointerEvents="none"
      style={{
        borderColor: color,
        borderRadius: radius,
        borderWidth: 1,
        bottom: 0,
        left: 0,
        position: 'absolute',
        right: 0,
        top: 0,
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
        height: 1,
        left: 14,
        position: 'absolute',
        right: 14,
        top: 1,
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
      <View
        style={{
          backgroundColor: v.fill,
          borderRadius: radius,
          overflow: 'hidden',
        }}
      >
        <GlassBlurLayer radius={radius} variant={variant} />
        <TopHighlight color={v.highlightTop} radius={radius} stop={v.highlightTopStop} />
        <GlassTextureOverlay
          intensity={variant === 'hero' || variant === 'premium' ? 'hero' : 'normal'}
          radius={radius}
        />
        {v.innerBottomTint && v.innerBottomStop !== undefined ? (
          <BottomTint color={v.innerBottomTint} stop={v.innerBottomStop} />
        ) : null}
        {bordered ? <GlassBorder color={v.border} radius={radius} /> : null}
        <TopEdgeHighlight intensity={v.topEdgeIntensity} radius={radius} />
        {accentTopBar ? <TopAccentBar color={topBarColor} radius={radius} /> : null}
        {children}
      </View>
    </View>
  );
}

export default GlassSurface;
