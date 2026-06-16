import React from 'react';
import { Image, View, type ImageSourcePropType } from 'react-native';

import { vexLightGlass } from '../../theme/tokens/vex-light-glass';

type RealisticModeOrbMode = 'sprint' | 'light' | 'study' | 'recovery';

interface RealisticModeOrbProps {
  mode: RealisticModeOrbMode;
  size?: number;
}

      const elementStyle_61 = {
  backgroundColor: vexLightGlass.glass.innerHighlight,
  borderRadius: size * 0.08,
  height: size * 0.08,
  left: size * 0.24,
  position: 'absolute',
  top: size * 0.16,
  transform: [{ rotate: '-13deg' }],
  width: size * 0.34,
};
const ORB_ASSETS: Record<RealisticModeOrbMode, ImageSourcePropType> = {
  sprint: require('../../../assets/water/vex_orb_sprint_orange_v1.png'),
  light: require('../../../assets/water/vex_orb_light_focus_v1.png'),
  study: require('../../../assets/water/vex_orb_study_v1.png'),
  recovery: require('../../../assets/water/vex_orb_recovery_v1.png'),
};

export function RealisticModeOrb({
  mode,
  size = 64,
}: RealisticModeOrbProps): React.ReactNode {
  return (
    <View
      pointerEvents="none"
      style={{
        alignItems: 'center',
        backgroundColor: vexLightGlass.glass.fillStrong,
        borderColor: vexLightGlass.glass.innerHighlight,
        borderRadius: size / 2,
        borderWidth: 1,
        height: size,
        justifyContent: 'center',
        boxShadow: '0px 12px 18px vexLightGlass.mint[700] / 0.18',
        width: size,
      }}
    >
      <Image
        accessibilityIgnoresInvertColors
        resizeMode="cover"
        source={ORB_ASSETS[mode]}
        style={{
          borderRadius: size / 2,
          height: size,
          width: size,
        }}
      />
      <View
        style={{
          borderColor: vexLightGlass.glass.innerHighlight,
          borderRadius: size / 2,
          borderWidth: 1,
          bottom: 2,
          left: 2,
          position: 'absolute',
          right: 2,
          top: 2,
        }}
      />
      <View
        style={elementStyle_61}
      />
    </View>
  );
}

export default RealisticModeOrb;
