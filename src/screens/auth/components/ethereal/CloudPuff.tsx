/**
 * CloudPuff — single soft radial cloud.
 * Static (motion stripped for performance).
 */
import React, { useMemo } from 'react';
import { View } from 'react-native';
import type { ViewStyle } from 'react-native';

import { etherealCloud, etherealSkyAccents } from '@/theme/tokens/ethereal-sky';

type CloudLayer = 'back' | 'mid' | 'front';

type CloudPuffProps = {
  layer: CloudLayer;
  topPercent: number;
  size: number;
  drift?: number;
  tint?: 'cool' | 'warm';
  delay?: number;
  parallaxFactor?: number;
};

const OPACITY_BY_LAYER: Record<CloudLayer, number> = {
  back: etherealCloud.layerBack,
  mid: etherealCloud.layerMid,
  front: etherealCloud.layerFront,
};

export function CloudPuff({
  layer,
  topPercent,
  size,
  drift: _drift = 80,
  tint = 'cool',
  delay: _delay = 0,
  parallaxFactor: _parallaxFactor = 8,
}: CloudPuffProps): React.JSX.Element {
  const baseStyle = useMemo<ViewStyle>(
    () => ({
      position: 'absolute',
      top: `${topPercent}%` as unknown as number,
      left: -size * 0.3,
      width: size,
      height: size * 0.55,
      borderRadius: size,
      opacity: OPACITY_BY_LAYER[layer],
      backgroundColor:
        tint === 'warm' ? etherealSkyAccents.warmCloud : etherealSkyAccents.coolCloud,
      shadowColor: tint === 'warm' ? etherealSkyAccents.warmCloud : etherealSkyAccents.coolCloud,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.6,
      shadowRadius: size * 0.4,
    }),
    [size, topPercent, tint, layer],
  );

  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no"
      pointerEvents="none"
      style={baseStyle}
    />
  );
}
