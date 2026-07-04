import React from 'react';
import { G, Circle, Ellipse, Path } from 'react-native-svg';

interface VariantProps {
  size: number;
}

export function BubbleVariant({ size }: VariantProps): React.ReactNode {
  const cx = size / 2;
  const cy = size / 2;
  const r = size * 0.38;
  return (
    <G>
      <Circle cx={cx} cy={cy} fill="url(#mintGlow)" r={r * 1.15} opacity={0.35} />
      <Ellipse cx={cx} cy={cy + r * 0.55} fill="url(#contactShadow)" rx={r * 0.7} ry={r * 0.2} opacity={0.55} />
      <Circle cx={cx} cy={cy} fill="url(#liquidCore)" opacity={0.75} r={r} stroke="url(#rimLight)" strokeWidth={size * 0.018} />
      <Circle cx={cx} cy={cy} fill="url(#innerDistortion)" opacity={0.45} r={r * 0.82} />
      <Ellipse cx={cx - r * 0.18} cy={cy - r * 0.25} fill="url(#specularHot)" rx={r * 0.28} ry={r * 0.2} />
      <Circle cx={cx - r * 0.22} cy={cy - r * 0.3} fill="theme.glassColors.vexWhite" opacity={0.95} r={r * 0.08} />
      <Circle cx={cx + r * 0.28} cy={cy - r * 0.12} fill="url(#specularSecondary)" r={r * 0.1} />
      <Path
        d={`M ${cx - r * 0.72} ${cy + r * 0.38} Q ${cx} ${cy + r * 0.85} ${cx + r * 0.72} ${cy + r * 0.38}`}
        fill="none"
        opacity={0.28}
        stroke="theme.glassColors.vexDeepTeal"
        strokeLinecap="round"
        strokeWidth={size * 0.012}
      />
    </G>
  );
}
