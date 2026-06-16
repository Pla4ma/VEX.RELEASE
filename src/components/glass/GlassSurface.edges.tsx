import React from 'react';
import { View } from 'react-native';

interface TopEdgeHighlightProps {
  intensity: number;
  radius: number;
}

  const viewStyle_57 = {
  borderColor: color, borderRadius: radius + 2, borderWidth: 1.5,
  bottom: -3, left: -3, position: 'absolute', right: -3, top: -3,
};
export function TopEdgeHighlight({ intensity, radius }: TopEdgeHighlightProps): React.ReactNode {
  return (
    <View pointerEvents="none" style={{
      backgroundColor: `rgba(255, 255, 255, ${intensity})`,
      borderTopLeftRadius: radius - 1, borderTopRightRadius: radius - 1,
      height: 2.2, left: 10, position: 'absolute', right: 10, top: 1.2,
    }} />
  );
}

interface SecondEdgeHighlightProps { radius: number }

export function SecondEdgeHighlight({ radius }: SecondEdgeHighlightProps): React.ReactNode {
  return (
    <View pointerEvents="none" style={{
      backgroundColor: 'rgba(255, 255, 255, 0.72)',
      borderTopLeftRadius: radius - 2, borderTopRightRadius: radius - 2,
      height: 1.5, left: 14, position: 'absolute', right: 14, top: 3.2,
    }} />
  );
}

interface BottomEdgeShadowProps { radius: number }

export function BottomEdgeShadow({ radius }: BottomEdgeShadowProps): React.ReactNode {
  return (
    <View pointerEvents="none" style={{
      backgroundColor: 'rgba(13, 76, 65, 0.18)',
      borderBottomLeftRadius: radius - 1, borderBottomRightRadius: radius - 1,
      bottom: 1.2, height: 2, left: 12, position: 'absolute', right: 12,
    }} />
  );
}

interface GlassBorderProps { color: string; radius: number; width: number }

export function GlassBorder({ color, radius, width }: GlassBorderProps): React.ReactNode {
  return (
    <View pointerEvents="none" style={{
      borderColor: color, borderRadius: radius, borderWidth: width,
      bottom: 0, left: 0, position: 'absolute', right: 0, top: 0,
    }} />
  );
}

interface GlassOuterBorderProps { color: string; radius: number }

export function GlassOuterBorder({ color, radius }: GlassOuterBorderProps): React.ReactNode {
  return (
    <View pointerEvents="none" style={viewStyle_57} />
  );
}
