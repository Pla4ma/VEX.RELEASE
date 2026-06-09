import React from 'react';
import { G, Circle, Ellipse, Path } from 'react-native-svg';

interface VariantProps {
  size: number;
}

export function SwirlVariant({ size }: VariantProps): JSX.Element {
  const cx = size / 2;
  const cy = size / 2;
  return (
    <G>
      <Circle cx={cx} cy={cy} fill="url(#mintGlow)" r={size * 0.48} opacity={0.55} />
      <Ellipse cx={cx} cy={cy + size * 0.22} fill="url(#contactShadow)" rx={size * 0.38} ry={size * 0.12} />
      <Path
        d={`M ${cx + size * 0.08} ${cy - size * 0.38}
            C ${cx + size * 0.32} ${cy - size * 0.38} ${cx + size * 0.42} ${cy - size * 0.22} ${cx + size * 0.38} ${cy - size * 0.02}
            C ${cx + size * 0.34} ${cy + size * 0.18} ${cx + size * 0.18} ${cy + size * 0.28} ${cx - size * 0.02} ${cy + size * 0.32}
            C ${cx - size * 0.18} ${cy + size * 0.35} ${cx - size * 0.28} ${cy + size * 0.28} ${cx - size * 0.32} ${cy + size * 0.15}
            C ${cx - size * 0.35} ${cy + size * 0.02} ${cx - size * 0.28} ${cy - size * 0.12} ${cx - size * 0.15} ${cy - size * 0.18}
            C ${cx - size * 0.05} ${cy - size * 0.22} ${cx + size * 0.05} ${cy - size * 0.18} ${cx + size * 0.08} ${cy - size * 0.08}
            C ${cx + size * 0.1} ${cy - size * 0.02} ${cx + size * 0.05} ${cy + size * 0.05} ${cx - size * 0.02} ${cy + size * 0.08}
            C ${cx - size * 0.08} ${cy + size * 0.1} ${cx - size * 0.12} ${cy + size * 0.06} ${cx - size * 0.1} ${cy - size * 0.02}`}
        fill="url(#liquidCore)"
        stroke="url(#rimLight)"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={size * 0.025}
      />
      <Path
        d={`M ${cx + size * 0.06} ${cy - size * 0.28}
            C ${cx + size * 0.22} ${cy - size * 0.28} ${cx + size * 0.3} ${cy - size * 0.16} ${cx + size * 0.26} ${cy - size * 0.02}
            C ${cx + size * 0.22} ${cy + size * 0.12} ${cx + size * 0.12} ${cy + size * 0.2} ${cx - size * 0.02} ${cy + size * 0.22}
            C ${cx - size * 0.12} ${cy + size * 0.24} ${cx - size * 0.2} ${cy + size * 0.18} ${cx - size * 0.22} ${cy + size * 0.08}
            C ${cx - size * 0.24} ${cy - size * 0.02} ${cx - size * 0.18} ${cy - size * 0.1} ${cx - size * 0.08} ${cy - size * 0.14}`}
        fill="url(#innerDistortion)"
        opacity={0.65}
      />
      <Path
        d={`M ${cx + size * 0.02} ${cy - size * 0.32} C ${cx + size * 0.15} ${cy - size * 0.32} ${cx + size * 0.22} ${cy - size * 0.22} ${cx + size * 0.2} ${cy - size * 0.1}`}
        fill="none"
        opacity={0.82}
        stroke="#FFFFFF"
        strokeLinecap="round"
        strokeWidth={size * 0.02}
      />
      <Path
        d={`M ${cx - size * 0.18} ${cy + size * 0.08} C ${cx - size * 0.22} ${cy + size * 0.02} ${cx - size * 0.18} ${cy - size * 0.06} ${cx - size * 0.1} ${cy - size * 0.1}`}
        fill="none"
        opacity={0.55}
        stroke="#FFFFFF"
        strokeLinecap="round"
        strokeWidth={size * 0.012}
      />
    </G>
  );
}
