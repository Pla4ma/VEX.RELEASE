import React from 'react';
import { Image, View, type ImageSourcePropType } from 'react-native';

import { vexLightGlass } from '../../theme/tokens/vex-light-glass';

type VexAssetName =
  | 'sculpture'
  | 'coachStar'
  | 'profileCrystal'
  | 'progressBars'
  | 'streakFlame'
  | 'orangePrism'
  | 'orangeCoach'
  | 'orangeHumanCoach'
  | 'orangeAnalytics'
  | 'orangeMastery';

interface VexAssetImageProps {
  name: VexAssetName;
  size: number;
  opacity?: number;
}

const ASSETS: Record<VexAssetName, ImageSourcePropType> = {
  sculpture: require('../../../assets/water/vex_liquid_sculpture_v1.png'),
  coachStar: require('../../../assets/water/vex_coach_star_v1.png'),
  profileCrystal: require('../../../assets/water/vex_profile_crystal_v1.png'),
  progressBars: require('../../../assets/water/vex_progress_bars_v1.png'),
  streakFlame: require('../../../assets/water/vex_streak_flame_v1.png'),
  orangePrism: require('../../../assets/water/vex_orange_prism_v1.png'),
  orangeCoach: require('../../../assets/water/vex_orange_ai_coach_v1.png'),
  orangeHumanCoach: require('../../../assets/water/vex_orange_human_coach_v1.png'),
  orangeAnalytics: require('../../../assets/water/vex_orange_analytics_v1.png'),
  orangeMastery: require('../../../assets/water/vex_orange_mastery_v1.png'),
};

export function VexAssetImage({
  name,
  size,
  opacity = 1,
}: VexAssetImageProps): JSX.Element {
  return (
    <View
      pointerEvents="none"
      style={{
        borderRadius: size / 2,
        height: size,
        opacity,
        overflow: 'hidden',
        shadowColor: vexLightGlass.glass.shadowStrong,
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.18,
        shadowRadius: 20,
        width: size,
      }}
    >
      <Image
        accessibilityIgnoresInvertColors
        resizeMode="cover"
        source={ASSETS[name]}
        style={{ height: size, width: size }}
      />
    </View>
  );
}

export default VexAssetImage;
