import React from 'react';
import { Image, View, type ImageSourcePropType, type ImageStyle, type ViewStyle } from 'react-native';

import { vexLightGlass } from '../../theme/tokens/vex-light-glass';

type RealisticModeOrbMode = 'sprint' | 'light' | 'study' | 'recovery';

interface RealisticModeOrbProps {
  mode: RealisticModeOrbMode;
  size?: number;
}

const ORB_ASSETS: Record<RealisticModeOrbMode, ImageSourcePropType> = {
  sprint: require('../../../assets/water/vex_orb_sprint_orange_v1.png'),
  light: require('../../../assets/water/vex_orb_light_focus_v1.png'),
  study: require('../../../assets/water/vex_orb_study_v1.png'),
  recovery: require('../../../assets/water/vex_orb_recovery_v1.png'),
};

const containerBaseStyle: ViewStyle = {
  alignItems: 'center',
  backgroundColor: '',
  borderColor: '',
  borderRadius: 0,
  borderWidth: 1,
  height: 0,
  justifyContent: 'center',
  width: 0,
};

const imageBaseStyle: ImageStyle = {
  borderRadius: 0,
  height: 0,
  width: 0,
};

const overlayBaseStyle: ViewStyle = {
  borderColor: '',
  borderRadius: 0,
  borderWidth: 1,
  bottom: 2,
  left: 2,
  position: 'absolute',
  right: 2,
  top: 2,
};

export function RealisticModeOrb({
  mode,
  size = 64,
}: RealisticModeOrbProps): React.ReactNode {
  const containerStyle: ViewStyle = {
    ...containerBaseStyle,
    backgroundColor: vexLightGlass.glass.fillStrong,
    borderColor: vexLightGlass.glass.innerHighlight,
    borderRadius: size / 2,
    height: size,
    width: size,
  };

  const imageStyle: ImageStyle = {
    ...imageBaseStyle,
    borderRadius: size / 2,
    height: size,
    width: size,
  };

  const overlayStyle: ViewStyle = {
    ...overlayBaseStyle,
    borderColor: vexLightGlass.glass.innerHighlight,
    borderRadius: size / 2,
  };

  return (
    <View pointerEvents="none" style={containerStyle}>
      <Image
        accessibilityIgnoresInvertColors
        resizeMode="cover"
        source={ORB_ASSETS[mode]}
        style={imageStyle}
      />
      <View style={overlayStyle} />
      <View style={{}} />
    </View>
  );
}
