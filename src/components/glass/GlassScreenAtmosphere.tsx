import React from 'react';
import {
  Dimensions,
  ImageBackground,
  View,
  type ImageSourcePropType,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { vexLightGlass } from '../../theme/tokens/vex-light-glass';
import { FloatingDroplets } from './FloatingDroplets';
import { LiquidGlassSphere } from './LiquidGlassSphere';
import { WaterBubble } from './WaterBubble';

export type GlassScreenAtmosphereVariant =
  | 'home'
  | 'focus'
  | 'progress'
  | 'profile'
  | 'default';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');
const LIQUID_GLASS_BACKDROP: ImageSourcePropType = require('../../../assets/water/vex_liquid_glass_backdrop_v1.png');

function EdgeBubble({
  bottom,
  left,
  opacity,
  right,
  size,
  top,
}: {
  bottom?: number;
  left?: number;
  opacity: number;
  right?: number;
  size: number;
  top?: number;
}): JSX.Element {
  return (
    <View
      pointerEvents="none"
      style={{
        bottom,
        left,
        opacity,
        position: 'absolute',
        right,
        top,
      }}
    >
      <WaterBubble opacity={0.5} size={size} variant="lens" />
    </View>
  );
}

function VariantOrnaments({
  variant,
}: {
  variant: GlassScreenAtmosphereVariant;
}): JSX.Element {
  if (variant === 'focus') {
    return (
      <>
        <EdgeBubble opacity={0.48} right={-SCREEN_W * 0.14} size={SCREEN_W * 0.28} top={SCREEN_H * 0.26} />
        <EdgeBubble bottom={-SCREEN_H * 0.08} left={-SCREEN_W * 0.16} opacity={0.34} size={SCREEN_W * 0.42} />
        <DropletMist left={SCREEN_W * 0.72} top={SCREEN_H * 0.1} />
      </>
    );
  }

  if (variant === 'progress') {
    return (
      <>
        <EdgeBubble left={-SCREEN_W * 0.2} opacity={0.4} size={SCREEN_W * 0.34} top={SCREEN_H * 0.06} />
        <Pearl left={SCREEN_W * 0.58} size={18} top={SCREEN_H * 0.38} />
        <DropletMist left={SCREEN_W * 0.66} top={SCREEN_H * 0.57} />
      </>
    );
  }

  if (variant === 'profile') {
    return (
      <>
        <EdgeBubble left={-SCREEN_W * 0.18} opacity={0.42} size={SCREEN_W * 0.36} top={SCREEN_H * 0.08} />
        <EdgeBubble opacity={0.38} right={-SCREEN_W * 0.1} size={SCREEN_W * 0.26} top={SCREEN_H * 0.36} />
        <Pearl left={SCREEN_W * 0.62} size={16} top={SCREEN_H * 0.1} />
      </>
    );
  }

  return (
    <>
      <EdgeBubble left={-SCREEN_W * 0.22} opacity={0.36} size={SCREEN_W * 0.38} top={-SCREEN_H * 0.03} />
      <EdgeBubble opacity={0.34} right={-SCREEN_W * 0.12} size={SCREEN_W * 0.3} top={SCREEN_H * 0.2} />
      <Pearl left={SCREEN_W * 0.68} size={15} top={SCREEN_H * 0.08} />
    </>
  );
}

function Pearl({
  left,
  size,
  top,
}: {
  left: number;
  size: number;
  top: number;
}): JSX.Element {
  return (
    <View pointerEvents="none" style={{ left, opacity: 0.52, position: 'absolute', top }}>
      <LiquidGlassSphere color="pearl" intensity={0.58} size={size} />
    </View>
  );
}

function DropletMist({
  left,
  top,
}: {
  left: number;
  top: number;
}): JSX.Element {
  return (
    <View pointerEvents="none" style={{ left, opacity: 0.42, position: 'absolute', top }}>
      <FloatingDroplets count={4} opacity={0.5} spread={SCREEN_W * 0.16} />
    </View>
  );
}

export function GlassScreenAtmosphere({
  variant,
}: {
  variant: GlassScreenAtmosphereVariant;
}): JSX.Element {
  return (
    <View pointerEvents="none" style={{ bottom: 0, left: 0, position: 'absolute', right: 0, top: 0 }}>
      <ImageBackground
        imageStyle={{ opacity: 0.56 }}
        resizeMode="cover"
        source={LIQUID_GLASS_BACKDROP}
        style={{ bottom: 0, left: 0, position: 'absolute', right: 0, top: 0 }}
      />
      <LinearGradient
        colors={[
          vexLightGlass.background.atmosphericPearl,
          vexLightGlass.glass.fillSubtle,
          vexLightGlass.background.pageMid,
        ]}
        locations={[0, 0.58, 1]}
        style={{ bottom: 0, left: 0, opacity: 0.28, position: 'absolute', right: 0, top: 0 }}
      />
      <VariantOrnaments variant={variant} />
    </View>
  );
}

export default GlassScreenAtmosphere;
