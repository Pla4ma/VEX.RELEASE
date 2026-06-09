import React from 'react';
import { G, Path } from 'react-native-svg';

interface VariantProps {
  size: number;
}

export function RibbonVariant({ size }: VariantProps): JSX.Element {
  const cx = size / 2;
  const cy = size / 2;
  return (
    <G>
      <Path
        d={`M ${cx - size * 0.35} ${cy - size * 0.25}
            Q ${cx - size * 0.15} ${cy - size * 0.42} ${cx + size * 0.05} ${cy - size * 0.28}
            Q ${cx + size * 0.25} ${cy - size * 0.12} ${cx + size * 0.32} ${cy + size * 0.08}
            Q ${cx + size * 0.38} ${cy + size * 0.28} ${cx + size * 0.18} ${cy + size * 0.35}
            Q ${cx - size * 0.02} ${cy + size * 0.42} ${cx - size * 0.22} ${cy + size * 0.28}
            Q ${cx - size * 0.38} ${cy + size * 0.12} ${cx - size * 0.42} ${cy - size * 0.08}
            Q ${cx - size * 0.45} ${cy - size * 0.18} ${cx - size * 0.35} ${cy - size * 0.25} Z`}
        fill="url(#mintGlow)"
        opacity={0.35}
      />
      <Path
        d={`M ${cx - size * 0.28} ${cy + size * 0.32}
            Q ${cx - size * 0.08} ${cy + size * 0.42} ${cx + size * 0.12} ${cy + size * 0.32}
            Q ${cx + size * 0.28} ${cy + size * 0.22} ${cx + size * 0.22} ${cy + size * 0.18}`}
        fill="none"
        opacity={0.22}
        stroke="#0A5E4D"
        strokeLinecap="round"
        strokeWidth={size * 0.02}
      />
      <Path
        d={`M ${cx - size * 0.3} ${cy - size * 0.2}
            Q ${cx - size * 0.12} ${cy - size * 0.35} ${cx + size * 0.05} ${cy - size * 0.22}
            Q ${cx + size * 0.22} ${cy - size * 0.08} ${cx + size * 0.28} ${cy + size * 0.08}
            Q ${cx + size * 0.32} ${cy + size * 0.22} ${cx + size * 0.15} ${cy + size * 0.28}
            Q ${cx - size * 0.02} ${cy + size * 0.35} ${cx - size * 0.18} ${cy + size * 0.22}
            Q ${cx - size * 0.32} ${cy + size * 0.08} ${cx - size * 0.35} ${cy - size * 0.05}
            Q ${cx - size * 0.38} ${cy - size * 0.12} ${cx - size * 0.3} ${cy - size * 0.2} Z`}
        fill="url(#ribbonBody)"
        stroke="url(#rimLight)"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={size * 0.02}
      />
      <Path
        d={`M ${cx - size * 0.22} ${cy - size * 0.18}
            Q ${cx - size * 0.08} ${cy - size * 0.28} ${cx + size * 0.08} ${cy - size * 0.15}`}
        fill="none"
        opacity={0.78}
        stroke="#FFFFFF"
        strokeLinecap="round"
        strokeWidth={size * 0.015}
      />
      <Path
        d={`M ${cx + size * 0.12} ${cy + size * 0.15}
            Q ${cx + size * 0.22} ${cy + size * 0.22} ${cx + size * 0.18} ${cy + size * 0.08}`}
        fill="none"
        opacity={0.45}
        stroke="#FFFFFF"
        strokeLinecap="round"
        strokeWidth={size * 0.01}
      />
    </G>
  );
}
