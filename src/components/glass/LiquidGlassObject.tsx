import React from 'react';
import { View, type ViewStyle } from 'react-native';
import Svg from 'react-native-svg';
import { buildGlassDefs } from './LiquidGlassObject.defs';
import { OrbVariant } from './LiquidGlassObject.orb';
import { GemVariant } from './LiquidGlassObject.gem';
import { SwirlVariant } from './LiquidGlassObject.swirl';
import { LensVariant } from './LiquidGlassObject.lens';
import { BubbleVariant } from './LiquidGlassObject.bubble';
import { RibbonVariant } from './LiquidGlassObject.ribbon';

interface LiquidGlassObjectProps {
  size?: number;
  style?: ViewStyle;
  variant?: 'swirl' | 'orb' | 'gem' | 'lens' | 'bubble' | 'ribbon';
  intensity?: number;
}

export function LiquidGlassObject({
  size = 96,
  style,
  variant = 'orb',
}: LiquidGlassObjectProps): JSX.Element {
  return (
    <View
      pointerEvents="none"
      style={[
        {
          height: size,
          shadowColor: 'rgba(10, 94, 77, 0.22)',
          shadowOffset: { width: 0, height: size * 0.06 },
          shadowOpacity: 0.55,
          shadowRadius: size * 0.08,
          width: size,
        },
        style,
      ]}
    >
      <Svg height={size} viewBox={`0 0 ${size} ${size}`} width={size}>
        {buildGlassDefs()}
        {variant === 'orb' && <OrbVariant size={size} />}
        {variant === 'gem' && <GemVariant size={size} />}
        {variant === 'swirl' && <SwirlVariant size={size} />}
        {variant === 'lens' && <LensVariant size={size} />}
        {variant === 'bubble' && <BubbleVariant size={size} />}
        {variant === 'ribbon' && <RibbonVariant size={size} />}
      </Svg>
    </View>
  );
}

export default LiquidGlassObject;
