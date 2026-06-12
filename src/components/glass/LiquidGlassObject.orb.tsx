import React from 'react';
import { G, Circle, Ellipse, Path } from 'react-native-svg';

interface VariantProps {
  size: number;
}

export function OrbVariant({ size }: VariantProps): JSX.Element {
  const r = size * 0.42;
  const center = size / 2;
  return (
    <G>
      <Circle cx={center} cy={center} fill="url(#mintGlow)" r={r * 1.25} />
      <Ellipse cx={center} cy={center + r * 0.55} fill="url(#contactShadow)" rx={r * 0.85} ry={r * 0.28} />
      <Circle cx={center} cy={center} fill="url(#liquidCore)" r={r} stroke="url(#rimLight)" strokeWidth={size * 0.028} />
      <Circle cx={center} cy={center} fill="url(#innerDistortion)" r={r * 0.82} />
      <Circle cx={center - r * 0.15} cy={center - r * 0.22} fill="url(#specularHot)" r={r * 0.35} />
      <Circle cx={center + r * 0.25} cy={center - r * 0.18} fill="url(#specularSecondary)" r={r * 0.15} />
      <Circle cx={center} cy={center} fill="none" r={r * 0.95} stroke="url(#edgeBevel)" strokeWidth={size * 0.012} opacity={0.85} />
      <Path
        d={`M ${center - r * 0.85} ${center + r * 0.35} Q ${center} ${center + r * 0.95} ${center + r * 0.85} ${center + r * 0.35}`}
        fill="none"
        opacity={0.35}
        stroke={vexLightGlass.mint[800]}
        strokeLinecap="round"
        strokeWidth={size * 0.015}
      />
    </G>
  );
}
