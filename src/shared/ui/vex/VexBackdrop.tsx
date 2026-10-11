import React from 'react';
import { Image, View, type ImageSourcePropType } from 'react-native';

import { useTheme } from '../../../theme/ThemeContext';
import { opacity } from '../../../theme/tokens/opacity';
import { vexFire } from '../../../theme/tokens/vex-fire';

interface VexBackdropProps {
  source: ImageSourcePropType;
  overlayOpacity?: number;
  overlayColor?: string;
}

export function VexBackdrop({ source, overlayColor = vexFire.background, overlayOpacity = opacity[5] }: VexBackdropProps): React.JSX.Element {
  const { theme } = useTheme();

  return (
    <View pointerEvents="none" style={{ bottom: 0, left: 0, position: 'absolute', right: 0, top: 0 }}>
      <Image
        accessibilityIgnoresInvertColors
        resizeMode="cover"
        source={source}
        style={{ height: '100%', opacity: theme.opacity[100], width: '100%' }}
      />
      <View
        style={{
          backgroundColor: overlayColor,
          bottom: 0,
          left: 0,
          opacity: overlayOpacity,
          position: 'absolute',
          right: 0,
          top: 0,
        }}
      />
    </View>
  );
}
