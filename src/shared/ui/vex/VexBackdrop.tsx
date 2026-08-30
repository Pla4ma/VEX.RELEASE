import React from 'react';
import { Image, View, type ImageSourcePropType } from 'react-native';

import { useTheme } from '../../../theme/ThemeContext';
import { opacity } from '../../../theme/tokens/opacity';

interface VexBackdropProps {
  source: ImageSourcePropType;
  overlayOpacity?: number;
}

export function VexBackdrop({ source, overlayOpacity = opacity[5] }: VexBackdropProps): React.JSX.Element {
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
          backgroundColor: theme.colors.background.primary,
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
