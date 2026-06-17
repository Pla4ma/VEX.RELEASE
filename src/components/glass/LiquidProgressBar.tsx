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
      top, left, right, bottom,
      width, height,
      borderRadius: height / 2,
      backgroundColor: trackColor,
      overflow: 'hidden',
      boxShadow: '0px 1px 4px rgba(136, 213, 197, 0.2125)',
    }}
  >
    <View
      style={{
        width: `${Math.min(Math.max(progress * 100, 0), 100)}%`,
        height: '100%',
        borderRadius: height / 2,
        backgroundColor: fillColor,
        boxShadow: '0px 0px 6px fillColor / 0.85',
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
