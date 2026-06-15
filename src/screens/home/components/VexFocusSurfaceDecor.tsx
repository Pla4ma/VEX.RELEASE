import React from 'react';
import { View } from 'react-native';

import { FloatingDroplets } from '../../../components/glass/FloatingDroplets';
import { GlassRibbon } from '../../../components/glass/GlassRibbon';
import { LiquidGlassSphere } from '../../../components/glass/LiquidGlassSphere';
import { LiquidLens } from '../../../components/glass/LiquidLens';
import { WaterBubble } from '../../../components/glass/WaterBubble';

export function VexFocusSurfaceDecor(): React.ReactNode {
  return (
    <>
      <View
        pointerEvents="none"
        style={{
          opacity: 0.74,
          position: 'absolute',
          right: -34,
          top: -28,
          zIndex: 1,
        }}
      >
        <LiquidLens opacity={0.68} size={160} />
      </View>
      <View
        pointerEvents="none"
        style={{
          opacity: 0.82,
          position: 'absolute',
          right: 22,
          top: 12,
          zIndex: 1,
        }}
      >
        <GlassRibbon curve="s" height={38} opacity={0.6} width={150} />
      </View>
      <View
        pointerEvents="none"
        style={{
          opacity: 0.78,
          position: 'absolute',
          right: -10,
          top: 36,
          zIndex: 1,
        }}
      >
        <LiquidGlassSphere color="mint" intensity={0.78} size={54} />
      </View>
      <View
        pointerEvents="none"
        style={{
          bottom: 46,
          opacity: 0.58,
          position: 'absolute',
          right: 46,
          zIndex: 1,
        }}
      >
        <WaterBubble opacity={0.48} size={48} variant="lens" />
      </View>
      <View
        pointerEvents="none"
        style={{
          opacity: 0.46,
          position: 'absolute',
          right: 76,
          top: 10,
          zIndex: 1,
        }}
      >
        <FloatingDroplets count={4} opacity={0.54} size={40} />
      </View>
    </>
  );
}

export default VexFocusSurfaceDecor;
