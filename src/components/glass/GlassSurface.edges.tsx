import React from 'react';
import { View, type ViewStyle } from 'react-native';

interface TopEdgeHighlightProps {
  intensity: number;
  radius: number;
}

const topEdgeBaseStyle: ViewStyle = {
  position: 'absolute',
  height: 2.2,
  left: 10,
  right: 10,
  top: 1.2,
};

export function TopEdgeHighlight({ intensity, radius }: TopEdgeHighlightProps): React.ReactNode {
  const style: ViewStyle = {
    ...topEdgeBaseStyle,
    backgroundColor: `rgba(255, 255, 255, ${intensity})`,
    borderTopLeftRadius: radius - 1,
    borderTopRightRadius: radius - 1,
  };
  return <View pointerEvents="none" style={style} />;
}

interface SecondEdgeHighlightProps { radius: number }

const secondEdgeBaseStyle: ViewStyle = {
  backgroundColor: 'rgba(255, 255, 255, 0.72)',
  height: 1.5,
  left: 14,
  position: 'absolute',
  right: 14,
  top: 3.2,
};

export function SecondEdgeHighlight({ radius }: SecondEdgeHighlightProps): React.ReactNode {
  const style: ViewStyle = {
    ...secondEdgeBaseStyle,
    borderTopLeftRadius: radius - 2,
    borderTopRightRadius: radius - 2,
  };
  return <View pointerEvents="none" style={style} />;
}

interface BottomEdgeShadowProps { radius: number }

const bottomEdgeBaseStyle: ViewStyle = {
  backgroundColor: 'rgba(13, 76, 65, 0.18)',
  bottom: 1.2,
  height: 2,
  left: 12,
  position: 'absolute',
  right: 12,
};

export function BottomEdgeShadow({ radius }: BottomEdgeShadowProps): React.ReactNode {
  const style: ViewStyle = {
    ...bottomEdgeBaseStyle,
    borderBottomLeftRadius: radius - 1,
    borderBottomRightRadius: radius - 1,
  };
  return <View pointerEvents="none" style={style} />;
}

interface GlassBorderProps { color: string; radius: number; width: number }

const glassBorderStyle: ViewStyle = {
  borderColor: '',
  borderRadius: 0,
  borderWidth: 0,
  bottom: 0,
  left: 0,
  position: 'absolute',
  right: 0,
  top: 0,
};

export function GlassBorder({ color, radius, width }: GlassBorderProps): React.ReactNode {
  const style: ViewStyle = {
    ...glassBorderStyle,
    borderColor: color,
    borderRadius: radius,
    borderWidth: width,
  };
  return <View pointerEvents="none" style={style} />;
}

interface GlassOuterBorderProps { color: string; radius: number }

const glassOuterBorderStyle: ViewStyle = {
  borderColor: '',
  borderRadius: 0,
  borderWidth: 1.5,
  bottom: -3,
  left: -3,
  position: 'absolute',
  right: -3,
  top: -3,
};

export function GlassOuterBorder({ color, radius }: GlassOuterBorderProps): React.ReactNode {
  const style: ViewStyle = {
    ...glassOuterBorderStyle,
    borderColor: color,
    borderRadius: radius + 2,
  };
  return <View pointerEvents="none" style={style} />;
}
