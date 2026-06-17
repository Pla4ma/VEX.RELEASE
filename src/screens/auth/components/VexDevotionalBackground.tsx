import React, { memo, useMemo } from 'react';
import { useWindowDimensions, View } from 'react-native';
import { Canvas, Group, RadialGradient, Rect, vec } from '@shopify/react-native-skia';
import { useReducedMotion } from '../../../hooks/useReducedMotion';
import { FlowCurve, type CurveSpec } from './FlowCurve';
import { PaperGrain } from './PaperGrain';
import { lightColors } from '@/theme/tokens/colors';
import { rgbaColors } from '@/theme/tokens/rgba-colors';

/**
 * VexDevotionalBackground — generative organic backdrop for the Editorial
 * Devotional login. Composes a deep warm radial base, a warm horizon
 * wash, a hero halo, a six-curve flow field, and a paper grain veil.
 */

const PALETTE = {
  base: lightColors.semantic.devotionalBase,
  baseWarm: lightColors.semantic.editorialDeepBackground,
  baseCool: lightColors.semantic.devotionalBaseCool,
  warm: lightColors.semantic.devotionalWarm,
  warmSoft: lightColors.semantic.devotionalWarmSoft,
  ember: lightColors.semantic.vexGold,
  ash: lightColors.semantic.devotionalAsh,
  cream: lightColors.text.secondary,
} as const;

const CURVE_STROKES: CurveSpec[] = [
  { color: PALETTE.warm,     strokeWidth: 1.4, blur: 6,  opacity: 0.85, duration: 18000, delay: 0,    driftY: 6,  driftX: 14 },
  { color: PALETTE.ember,    strokeWidth: 0.8, blur: 4,  opacity: 0.85, duration: 22000, delay: 1500, driftY: 8,  driftX: 18 },
  { color: PALETTE.warmSoft, strokeWidth: 1.8, blur: 12, opacity: 0.85, duration: 26000, delay: 800,  driftY: 10, driftX: 12 },
  { color: PALETTE.cream,    strokeWidth: 0.5, blur: 2,  opacity: 0.85, duration: 20000, delay: 2200, driftY: 5,  driftX: 22 },
  { color: PALETTE.ash,      strokeWidth: 2.0, blur: 18, opacity: 0.85, duration: 30000, delay: 600,  driftY: 12, driftX: 10 },
  { color: PALETTE.warm,     strokeWidth: 0.7, blur: 3,  opacity: 0.85, duration: 24000, delay: 3000, driftY: 7,  driftX: 16 },
];

function buildFlowField(width: number, height: number): string[] {
  return [
    `M ${-width * 0.1} ${height * 0.08} C ${width * 0.3} ${height * -0.05}, ${width * 0.6} ${height * 0.2}, ${width * 0.9} ${height * 0.06} S ${width * 1.15} ${height * 0.2}, ${width * 1.15} ${height * 0.16}`,
    `M ${-width * 0.1} ${height * 0.22} C ${width * 0.2} ${height * 0.08}, ${width * 0.5} ${height * 0.36}, ${width * 0.7} ${height * 0.22} S ${width * 1.15} ${height * 0.36}, ${width * 1.15} ${height * 0.32}`,
    `M ${-width * 0.1} ${height * 0.38} C ${width * 0.18} ${height * 0.22}, ${width * 0.5} ${height * 0.5}, ${width * 0.78} ${height * 0.36} S ${width * 1.15} ${height * 0.5}, ${width * 1.15} ${height * 0.46}`,
    `M ${-width * 0.1} ${height * 0.54} C ${width * 0.25} ${height * 0.4}, ${width * 0.55} ${height * 0.62}, ${width * 0.8} ${height * 0.48} S ${width * 1.15} ${height * 0.62}, ${width * 1.15} ${height * 0.58}`,
    `M ${-width * 0.1} ${height * 0.7} C ${width * 0.18} ${height * 0.54}, ${width * 0.5} ${height * 0.78}, ${width * 0.75} ${height * 0.64} S ${width * 1.15} ${height * 0.78}, ${width * 1.15} ${height * 0.74}`,
    `M ${-width * 0.1} ${height * 0.86} C ${width * 0.22} ${height * 0.7}, ${width * 0.55} ${height * 0.94}, ${width * 0.78} ${height * 0.8} S ${width * 1.15} ${height * 0.94}, ${width * 1.15} ${height * 0.9}`,
  ];
}

export const VexDevotionalBackground = memo(function VexDevotionalBackground(): React.JSX.Element {
  const { isReducedMotion } = useReducedMotion();
  const { width, height } = useWindowDimensions();
  const curves = useMemo(() => buildFlowField(width, height), [width, height]);

  return (
    <View
      pointerEvents="none"
      style={{ position: 'absolute', top: 0, left: 0, width, height }}
    >
      <Canvas style={{ position: 'absolute', width, height }}>
        <Rect x={0} y={0} width={width} height={height}>
          <RadialGradient
            c={vec(width * 0.5, height * 0.18)}
            r={Math.max(width, height) * 0.95}
            colors={[PALETTE.baseWarm, PALETTE.base, PALETTE.baseCool]}
            positions={[0, 0.55, 1]}
          />
        </Rect>

        <Rect x={0} y={height * 0.55} width={width} height={height * 0.45}>
          <RadialGradient
            c={vec(width * 0.5, height * 0.95)}
            r={width * 0.95}
            colors={[rgbaColors.rgb_200_160_98_0_32, rgbaColors.rgb_139_110_58_0_10, 'transparent']}
            positions={[0, 0.5, 1]}
          />
        </Rect>

        <Rect x={0} y={0} width={width} height={height * 0.55}>
          <RadialGradient
            c={vec(width * 0.5, height * 0.22)}
            r={width * 0.85}
            colors={[rgbaColors.rgb_224_184_112_0_22, rgbaColors.rgb_224_184_112_0_06, 'transparent']}
            positions={[0, 0.45, 1]}
          />
        </Rect>

        <Group>
          {curves.map((d, i) => (
            <FlowCurve key={`curve-${i}`} d={d} spec={CURVE_STROKES[i]!} isReducedMotion={isReducedMotion} />
          ))}
        </Group>
      </Canvas>

      <PaperGrain width={width} height={height} />
    </View>
  );
});

export default VexDevotionalBackground;
