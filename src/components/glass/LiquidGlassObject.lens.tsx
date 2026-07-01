import React from 'react';
import { G, Circle, Ellipse, Path } from 'react-native-svg';

interface VariantProps {
  size: number;
}

export function LensVariant({ size }: VariantProps): React.ReactNode {
  const cx = size / 2;
  const cy = size / 2;
  const r = size * 0.4;
  return (
    <G>
      <Circle cx={cx} cy={cy} fill="url(#mintGlow)" r={r * 1.2} opacity={0.45} />
      <Ellipse cx={cx} cy={cy + r * 0.6} fill="url(#contactShadow)" rx={r * 0.75} ry={r * 0.22} />
      <Circle cx={cx} cy={cy} fill="none" r={r} stroke="url(#rimLight)" strokeWidth={size * 0.035} />
      <Circle cx={cx} cy={cy} fill="url(#lensBody)" r={r * 0.88} />
      <Circle cx={cx} cy={cy} fill="none" r={r * 0.72} stroke="url(#innerDistortion)" strokeWidth={size * 0.015} opacity={0.65} />
      <Circle cx={cx - r * 0.12} cy={cy - r * 0.18} fill="url(#specularHot)" r={r * 0.3} />
      <Circle cx={cx + r * 0.22} cy={cy - r * 0.12} fill="url(#specularSecondary)" r={r * 0.12} />
      <Circle cx={cx} cy={cy} fill="none" r={r * 0.92} stroke="url(#edgeBevel)" strokeWidth={size * 0.01} opacity={0.75} />
      <Path
        d={`M ${cx - r * 0.78} ${cy + r * 0.42} Q ${cx} ${cy + r * 0.92} ${cx + r * 0.78} ${cy + r * 0.42}`}
        fill="none"
        opacity={0.38}
        stroke="theme.glassColors.vexDeepTeal"
        strokeLinecap="round"
        strokeWidth={size * 0.015}
      />
    </G>
  );
}
