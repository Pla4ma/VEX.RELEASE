import React from 'react';
import { View } from 'react-native';

interface BorderProps {
  color: string;
  radius: number;
  width: number;
}

    
export function GlassBorder({ color, radius, width }: BorderProps): React.ReactNode {
  return (
    <View
      pointerEvents="none"
      style={{
        borderColor: color,
        borderRadius: radius,
        borderWidth: width,
        bottom: 0,
        left: 0,
        position: 'absolute',
        right: 0,
        top: 0,
      }}
    />
  );
}

interface OuterBorderProps {
  color: string;
  radius: number;
}

export function GlassOuterBorder({ color, radius }: OuterBorderProps): React.ReactNode {
  return (
    <View
      pointerEvents="none"
      style={{}}
    />
  );
}
