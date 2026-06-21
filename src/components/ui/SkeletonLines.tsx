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

export const SkeletonLines: React.FC<SkeletonLinesProps> = ({
  lines,
  width,
  height,
  borderRadius,
  spacing,
  lineStyle,
  backgroundColor,
}) => {
  const lineArray = Array.from({ length: lines }, (_, i) => i);
  const LineWrapper = Platform.OS === 'web' ? View : Animated.View;
  return (
    <>
      {lineArray.map((_, index) => (
        <LineWrapper
          key={`skl-${width}-${height}-${borderRadius}-${spacing}-${backgroundColor}-${index}`}
          style={[
            {
              width,
              height,
              borderRadius,
              backgroundColor,
              marginBottom: index < lines - 1 ? spacing : 0,
            },
            lineStyle,
          ]}
        />
      ))}
    </>
  );
};