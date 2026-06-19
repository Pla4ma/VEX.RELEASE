import React from 'react';
import { View, type ViewStyle } from 'react-native';

interface BorderProps {
  color: string;
  radius: number;
  width: number;
}

const borderStyle: ViewStyle = {
  borderColor: '',
  borderRadius: 0,
  borderWidth: 0,
  bottom: 0,
  left: 0,
  position: 'absolute',
  right: 0,
  top: 0,
};

export function GlassBorder({ color, radius, width }: BorderProps): React.ReactNode {
  const style: ViewStyle = {
    ...borderStyle,
    borderColor: color,
    borderRadius: radius,
    borderWidth: width,
  };
  return <View pointerEvents="none" style={style} />;
}

interface OuterBorderProps {
  color: string;
  radius: number;
}

export function GlassOuterBorder({ color, radius }: OuterBorderProps): React.ReactNode {
  return <View pointerEvents="none" style={{}} />;
}
