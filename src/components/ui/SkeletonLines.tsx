import React from 'react';
import { Platform, View } from 'react-native';
import Animated from 'react-native-reanimated';

interface SkeletonLinesProps {
  lines: number;
  width: number | string;
  height: number;
  borderRadius: number;
  spacing: number;
  lineStyle: object;
  backgroundColor: string;
}

export const SkeletonLines: React.ComponentType<SkeletonLinesProps> = ({
  lines,
  width,
  height,
  borderRadius,
  spacing,
  lineStyle,
  backgroundColor,
}) => {
  const lineArray = Array.from({ length: lines }, (_, i) => ({
    key: `line-${lines}-${i}`,
  }));
  const LineWrapper = Platform.OS === 'web' ? View : Animated.View;
  return (
    <>
      {lineArray.map(({ key }) => (
        <LineWrapper
          key={key}
          style={[
            {
              width,
              height,
              borderRadius,
              backgroundColor,
              marginBottom: Number(key.split('-')[2]) < lines - 1 ? spacing : 0,
            },
            lineStyle,
          ]}
        />
      ))}
    </>
  );
};
