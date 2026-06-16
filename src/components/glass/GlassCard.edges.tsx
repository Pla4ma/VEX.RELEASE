import React from 'react';
import { View } from 'react-native';

interface GlassCardHighlightProps { resolvedRadius: number }

  const viewStyle_35 = {
  backgroundColor: 'rgba(10, 94, 77, 0.08)', borderRadius: 999,
  bottom: 3.5, height: 1.2, left: 24, position: 'absolute', right: 24, zIndex: 11,
};
export function GlassCardTopEdge({ resolvedRadius }: GlassCardHighlightProps): React.ReactNode {
  return (
    <View pointerEvents="none" style={{
      backgroundColor: 'rgba(255, 255, 255, 0.95)', borderRadius: 999,
      height: 1.8, left: 16, position: 'absolute', right: 16, top: 1.2, zIndex: 15,
    }} />
  );
}

export function GlassCardSecondEdge({ showTopBar }: { showTopBar: boolean }): React.ReactNode {
  return (
    <View pointerEvents="none" style={{
      backgroundColor: 'rgba(255, 255, 255, 0.55)', borderRadius: 999,
      height: 1.2, left: 22, position: 'absolute', right: 22,
      top: showTopBar ? 5.5 : 2.8, zIndex: 14,
    }} />
  );
}

export function GlassCardBottomEdge(): React.ReactNode {
  return (
    <View pointerEvents="none" style={{
      backgroundColor: 'rgba(10, 94, 77, 0.14)', borderRadius: 999,
      bottom: 1.5, height: 1.8, left: 18, position: 'absolute', right: 18, zIndex: 12,
    }} />
  );
}

export function GlassCardBottomSecondaryEdge(): React.ReactNode {
  return (
    <View pointerEvents="none" style={viewStyle_35} />
  );
}
