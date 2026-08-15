/**
 * AuroraBackdrop — bright water-glass atmosphere.
 * Soft pastel blobs + light caustics. Never muddy grey-green.
 */
import React from 'react';
import { Image, View, type DimensionValue, type ViewStyle } from 'react-native';

import type { AtmosphereVariant } from './atmosphereTokens';

// SAFETY: require() needed for Metro asset bundling.
const CAUSTICS = require('../../../assets/water/water_caustics_bg.png');
const BUBBLE = require('../../../assets/water/water_bubble_soft.png');

interface BlobSpec {
  color: string;
  size: number;
  top?: DimensionValue;
  left?: DimensionValue;
  right?: DimensionValue;
  bottom?: DimensionValue;
  opacity: number;
}

const BLOBS: Record<AtmosphereVariant, readonly BlobSpec[]> = {
  home: [
    { color: '#A8F5E0', size: 420, top: -160, right: -140, opacity: 0.5 },
    { color: '#C8F8EE', size: 360, top: 80, left: -160, opacity: 0.42 },
    { color: '#8EE8D4', size: 300, bottom: 40, right: -80, opacity: 0.36 },
    { color: '#FFC090', size: 220, bottom: 180, left: -70, opacity: 0.16 },
  ],
  focus: [
    { color: '#A8F5E0', size: 400, top: -140, left: -120, opacity: 0.46 },
    { color: '#A8ECF0', size: 320, bottom: 60, right: -110, opacity: 0.4 },
  ],
  progress: [
    { color: '#A8ECF0', size: 380, top: -120, right: -100, opacity: 0.46 },
    { color: '#A8F5E0', size: 340, bottom: -20, left: -110, opacity: 0.4 },
    { color: '#FFC090', size: 240, top: 200, left: -80, opacity: 0.14 },
  ],
  profile: [
    { color: '#C8F8EE', size: 400, top: -140, right: -90, opacity: 0.48 },
    { color: '#A8ECF0', size: 320, bottom: 20, left: -120, opacity: 0.4 },
    { color: '#FFC090', size: 220, top: 160, left: -60, opacity: 0.14 },
  ],
  default: [
    { color: '#A8F5E0', size: 400, top: -140, right: -110, opacity: 0.44 },
    { color: '#A8ECF0', size: 320, bottom: 40, left: -120, opacity: 0.38 },
  ],
};

const fill: ViewStyle = {
  bottom: 0,
  left: 0,
  position: 'absolute',
  right: 0,
  top: 0,
};

function Blob({ spec }: { spec: BlobSpec }): React.ReactNode {
  return (
    <View
      style={{
        backgroundColor: spec.color,
        borderRadius: spec.size / 2,
        bottom: spec.bottom,
        height: spec.size,
        left: spec.left,
        opacity: spec.opacity,
        position: 'absolute',
        right: spec.right,
        top: spec.top,
        width: spec.size,
      }}
    />
  );
}

export function AuroraBackdrop({
  variant = 'default',
}: {
  variant?: AtmosphereVariant;
}): React.ReactNode {
  const blobs = BLOBS[variant];
  return (
    <View pointerEvents="none" style={fill}>
      {/* Bright base — never dark mint mud */}
      <View style={{ backgroundColor: '#F4FFFB', flex: 1 }} />
      <View style={{ backgroundColor: '#ECFBF5', flex: 1.2 }} />
      <View style={{ backgroundColor: '#E4F7F0', flex: 1 }} />

      <Image
        accessibilityIgnoresInvertColors
        resizeMode="cover"
        source={CAUSTICS}
        style={{
          bottom: 0,
          left: 0,
          opacity: 0.16,
          position: 'absolute',
          right: 0,
          top: 0,
        }}
      />

      <View style={fill}>
        {blobs.map((spec, index) => (
          <Blob key={`blob-${index}`} spec={spec} />
        ))}
      </View>

      <Image
        accessibilityIgnoresInvertColors
        source={BUBBLE}
        style={{
          height: 120,
          opacity: 0.28,
          position: 'absolute',
          right: -16,
          top: 130,
          width: 120,
        }}
      />
      <Image
        accessibilityIgnoresInvertColors
        source={BUBBLE}
        style={{
          bottom: 240,
          height: 78,
          left: -8,
          opacity: 0.22,
          position: 'absolute',
          width: 78,
        }}
      />

      {/* Soft top pearl veil */}
      <View
        style={{
          backgroundColor: 'rgba(255,255,255,0.42)',
          height: 140,
          left: 0,
          opacity: 0.5,
          position: 'absolute',
          right: 0,
          top: 0,
        }}
      />
    </View>
  );
}
