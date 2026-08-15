import React from 'react';
import { Image, View, type ImageSourcePropType, type ImageStyle, type ViewStyle } from 'react-native';

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
  | 'orangeMastery'
  | 'orbFocus'
  | 'orbStudy'
  | 'orbSprint'
  | 'orbRecovery';

interface VexAssetImageProps {
  name: VexAssetName;
  size: number;
  opacity?: number;
  resizeMode?: 'contain' | 'cover' | 'stretch' | 'center' | 'repeat';
}

// SAFETY: require() needed for Metro asset bundling. Assets are resolved at build time.
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
  orbFocus: require('../../../assets/water/vex_orb_light_focus_v1.png'),
  orbStudy: require('../../../assets/water/vex_orb_study_v1.png'),
  orbSprint: require('../../../assets/water/vex_orb_sprint_orange_v1.png'),
  orbRecovery: require('../../../assets/water/vex_orb_recovery_v1.png'),
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
  resizeMode = 'cover',
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
        resizeMode={resizeMode}
        source={ASSETS[name]}
        style={imageStyle}
      />
    </View>
  );
}
