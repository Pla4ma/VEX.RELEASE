import React from 'react';
import { View, type ViewStyle } from 'react-native';

interface TinyBubbleClusterProps {
  count?: number;
  top?: number;
  left?: number;
  right?: number;
  bottom?: number;
  opacity?: number;
  spread?: number;
}

const containerBaseStyle: ViewStyle = {
  position: 'absolute',
  alignItems: 'center',
  justifyContent: 'center',
};

const bubbleBaseStyle: ViewStyle = {
  position: 'absolute',
  borderRadius: 0,
  backgroundColor: '',
};

export const TinyBubbleCluster: React.FC<TinyBubbleClusterProps> = ({
  count = 4,
  top,
  left,
  right,
  bottom,
  opacity = 0.35,
  spread = 30,
}) => {
  const bubbles = Array.from({ length: count }).map((_, i) => {
    const size = 3 + (i % 3) * 2 + Math.random() * 1.5;
    const angle = i * 2.4;
    const radius = (i / count) * spread * 0.7 + 4;
    const xOffset = Math.cos(angle) * radius;
    const yOffset = Math.sin(angle) * radius * 0.7;
    return { size, xOffset, yOffset, key: i };
  });

  const containerStyle: ViewStyle = {
    ...containerBaseStyle,
    top,
    left,
    right,
    bottom,
    width: spread * 2,
    height: spread * 1.4,
  };

  return (
    <View pointerEvents="none" style={containerStyle}>
      {bubbles.map((b) => {
        const bubbleStyle: ViewStyle = {
          ...bubbleBaseStyle,
          width: b.size,
          height: b.size,
          borderRadius: b.size / 2,
          backgroundColor: `rgba(199, 245, 233, ${opacity * 0.72})`,
          left: spread + b.xOffset - b.size / 2,
          top: spread * 0.5 + b.yOffset - b.size / 2,
        };
        return <View key={b.key} style={bubbleStyle} />;
      })}
    </View>
  );
};

export { TinyBubbleCluster }