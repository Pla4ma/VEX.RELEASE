import React, { useEffect, useMemo } from 'react';
import { Image, View } from 'react-native';
import Animated, {
  FadeIn,
} from 'react-native-reanimated';

import type { AnimatedMascotProps } from './AnimatedMascot';
import { FALLBACK_MASCOT, MOOD_ASSET_MAP } from './VexMascotGuide.tokens';
import { resolveMoodAsset } from './PngMascotRenderer.helpers';
import { useMascotAnimations } from './usePngMascotAnimations';
import { useMascotAnimatedStyles } from './PngMascotStyles';

export const PngMascotRenderer = React.memo(function PngMascotRenderer({
  mood,
  size,
  reducedMotion,
  isCelebrating = false,
  reactionKey,
  onReady,
}: AnimatedMascotProps): React.JSX.Element {
  const asset = useMemo(() => resolveMoodAsset(mood), [mood]);

  useEffect(() => {
    onReady?.();
  }, [onReady]);

  const { float, breath, glow, nod, sparkle } = useMascotAnimations(
    reducedMotion,
    isCelebrating
  );

  const {
    mascotStyle,
    glowStyle,
    ringStyle,
    sparkleOneStyle,
    sparkleTwoStyle,
    ringBaseStyle,
    glowBaseStyle,
    sparkleOneBaseStyle,
    sparkleTwoBaseStyle,
  } = useMascotAnimatedStyles(
    float,
    breath,
    glow,
    nod,
    sparkle,
    reducedMotion,
    isCelebrating,
    size
  );

  return (
    <View style={{ width: size.width, height: size.height, alignItems: 'center' }}>
      <Animated.View
        style={[
          ringBaseStyle,
          ringStyle,
        ]}
      />
      <Animated.View
        style={[
          glowBaseStyle,
          glowStyle,
        ]}
      />
      <Animated.View
        style={[
          sparkleOneBaseStyle,
          sparkleOneStyle,
        ]}
      />
      <Animated.View
        style={[
          sparkleTwoBaseStyle,
          sparkleTwoStyle,
        ]}
      />
      <Animated.View key={mood} entering={reducedMotion ? undefined : FadeIn.duration(220)} style={mascotStyle}>
        <Image
          accessibilityIgnoresInvertColors
          accessibilityLabel={`VEX mascot ${mood}`}
          source={asset}
          style={{ width: size.width, height: size.height, resizeMode: 'contain' }}
        />
      </Animated.View>
    </View>
  );
});