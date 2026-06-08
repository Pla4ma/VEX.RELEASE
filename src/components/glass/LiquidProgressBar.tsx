import React from 'react';
import { View } from 'react-native';

interface LiquidProgressBarProps {
  progress: number; // 0-1
  width?: number;
  height?: number;
  top?: number;
  left?: number;
  right?: number;
  bottom?: number;
  trackColor?: string;
  fillColor?: string;
}

export const LiquidProgressBar: React.FC<LiquidProgressBarProps> = ({
  progress,
  width = 200,
  height = 8,
  top,
  left,
  right,
  bottom,
  trackColor = 'rgba(199, 245, 233, 0.45)',
  fillColor = 'rgba(12, 118, 95, 0.72)',
}) => (
  <View
    pointerEvents="none"
    style={{
      position: 'absolute',
      top,
      left,
      right,
      bottom,
      width,
      height,
      borderRadius: height / 2,
      backgroundColor: trackColor,
      overflow: 'hidden',
      shadowColor: 'rgba(136, 213, 197, 0.25)',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.85,
      shadowRadius: 4,
    }}
  >
    <View
      style={{
        width: `${Math.min(Math.max(progress * 100, 0), 100)}%`,
        height: '100%',
        borderRadius: height / 2,
        backgroundColor: fillColor,
        shadowColor: fillColor,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.85,
        shadowRadius: 6,
      }}
    >
      <View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 1.5,
          backgroundColor: 'rgba(255, 255, 255, 0.65)',
          borderRadius: height / 2,
        }}
      />
    </View>
    {/* Glass rim */}
    <View
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 1.2,
        backgroundColor: 'rgba(255, 255, 255, 0.55)',
        borderRadius: height / 2,
      }}
    />
  </View>
);

export default LiquidProgressBar;
