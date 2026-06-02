import React from 'react';
import { View } from 'react-native';
import { useWindowDimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export function CRTOverlay(): JSX.Element {
  const { width, height } = useWindowDimensions();

  return (
    <View pointerEvents="none" style={{ position: 'absolute', width, height, top: 0, left: 0 }}>
      {/* Top fade for hero breathing room */}
      <LinearGradient
        colors={['rgba(8,8,12,0.45)', 'transparent']}
        locations={[0, 0.4]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, height: height * 0.35 }}
      />

      {/* Bottom fade for form legibility */}
      <LinearGradient
        colors={['transparent', 'rgba(8,8,12,0.65)']}
        locations={[0.4, 1]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: height * 0.45 }}
      />

      {/* Edge vignette — very subtle */}
      <LinearGradient
        colors={['rgba(0,0,0,0.35)', 'transparent', 'transparent', 'rgba(0,0,0,0.35)']}
        locations={[0, 0.18, 0.82, 1]}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={{ position: 'absolute', width, height }}
      />
    </View>
  );
}

export default CRTOverlay;
