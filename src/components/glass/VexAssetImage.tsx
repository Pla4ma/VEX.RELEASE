import React from 'react';
import { Image, View, type ImageSourcePropType, type ImageStyle, type ViewStyle } from 'react-native';

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

const containerBaseStyle: ViewStyle = {
  borderRadius: 0,
  height: 0,
  overflow: 'hidden',
  width: 0,
};

const imageBaseStyle: ImageStyle = {
  height: 0,
  width: 0,
};

export function VexAssetImage({
  name,
  size,
  opacity = 1,
}: VexAssetImageProps): React.ReactNode {
  const containerStyle: ViewStyle = {
    ...containerBaseStyle,
    borderRadius: size / 2,
    height: size,
    opacity,
    width: size,
  };

  const imageStyle: ImageStyle = {
    ...imageBaseStyle,
    height: size,
    width: size,
  };

  return (
    <View pointerEvents="none" style={containerStyle}>
      <Image
        accessibilityIgnoresInvertColors
        resizeMode="cover"
        source={ASSETS[name]}
        style={imageStyle}
      />
    </View>
  );
}
