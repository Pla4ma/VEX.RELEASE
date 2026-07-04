import React from 'react';
import { G, Circle, Ellipse, Path } from 'react-native-svg';

interface VariantProps {
  size: number;
}

export function GemVariant({ size }: VariantProps): React.ReactNode {
  const cx = size / 2;
  const cy = size / 2;
  const r = size * 0.38;
  return (
    <G>
      <Circle cx={cx} cy={cy} fill="url(#mintGlow)" r={r * 1.3} />
      <Ellipse cx={cx} cy={cy + r * 0.6} fill="url(#contactShadow)" rx={r * 0.8} ry={r * 0.25} />
      <Path
        d={`M ${cx} ${cy - r} L ${cx + r * 0.87} ${cy - r * 0.5} L ${cx + r * 0.87} ${cy + r * 0.5} L ${cx} ${cy + r} L ${cx - r * 0.87} ${cy + r * 0.5} L ${cx - r * 0.87} ${cy - r * 0.5} Z`}
        fill="url(#liquidCore)"
        stroke="url(#rimLight)"
        strokeLinejoin="round"
        strokeWidth={size * 0.025}
      />
      <Path
        d={`M ${cx} ${cy - r * 0.55} L ${cx + r * 0.48} ${cy - r * 0.28} L ${cx + r * 0.48} ${cy + r * 0.28} L ${cx} ${cy + r * 0.55} L ${cx - r * 0.48} ${cy + r * 0.28} L ${cx - r * 0.48} ${cy - r * 0.28} Z`}
        fill="url(#innerDistortion)"
        opacity={0.72}
      />
      <Path
        d={`M ${cx} ${cy - r} L ${cx + r * 0.35} ${cy - r * 0.55} L ${cx} ${cy - r * 0.15} L ${cx - r * 0.35} ${cy - r * 0.55} Z`}
        fill="url(#specularHot)"
        opacity={0.65}
      />
      <Path
        d={`M ${cx - r * 0.5} ${cy - r * 0.72} Q ${cx} ${cy - r * 0.95} ${cx + r * 0.5} ${cy - r * 0.72}`}
        fill="none"
        opacity={0.88}
        stroke="theme.glassColors.vexWhite"
        strokeLinecap="round"
        strokeWidth={size * 0.018}
      />
      <Path
        d={`M ${cx - r * 0.72} ${cy + r * 0.42} Q ${cx} ${cy + r * 0.88} ${cx + r * 0.72} ${cy + r * 0.42}`}
        fill="none"
        opacity={0.42}
        stroke="theme.glassColors.vexDeepTeal"
        strokeLinecap="round"
        strokeWidth={size * 0.012}
      />
    </G>
  );
}
