/**
 * LightShaft — vertical volumetric light beam descending from top.
 * Static (motion stripped for performance).
 */
import React from 'react';
import { useWindowDimensions, View } from 'react-native';
import type { ViewStyle } from 'react-native';

import { etherealSkyAccents } from '@/theme/tokens/ethereal-sky';

export function LightShaft(): React.JSX.Element {
  const { width, height } = useWindowDimensions();

  const style: ViewStyle = {
    position: 'absolute',
    top: -height * 0.1,
    left: width * 0.5 - 80,
    width: 160,
    height: height * 0.7,
    opacity: 0.7,
    backgroundColor: etherealSkyAccents.lightBeam,
    borderRadius: 160,
    transform: [{ scaleX: 0.35 }, { rotate: '4deg' }],
    shadowColor: etherealSkyAccents.lightBeam,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 80,
  };

  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no"
      pointerEvents="none"
      style={style}
    />
  );
}
