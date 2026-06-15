import React from 'react';
import {
  Defs, RadialGradient, LinearGradient, Stop, Mask, Circle,
} from 'react-native-svg';
import type { GlassSphereColorConfig } from './LiquidGlassSphere.tokens';

interface DefsProps {
  color: string;
  config: GlassSphereColorConfig;
  center: number;
  intensity: number;
}

export function SphereDefs({ color, config: c, center: s, intensity: i }: DefsProps): React.ReactNode {
  return (
    <Defs>
      <RadialGradient cx="50%" cy="50%" id={`glow-${color}`} r="55%">
        <Stop offset="0%" stopColor={c.glow} stopOpacity={0.6 * i} />
        <Stop offset="50%" stopColor={c.glow} stopOpacity={0.25 * i} />
        <Stop offset="100%" stopColor={c.glow} stopOpacity={0} />
      </RadialGradient>
      <RadialGradient cx="50%" cy="85%" id={`shadow-${color}`} r="40%">
        <Stop offset="0%" stopColor="#0A5E4D" stopOpacity={0.22 * i} />
        <Stop offset="50%" stopColor="#0A5E4D" stopOpacity={0.08 * i} />
        <Stop offset="100%" stopColor="#0A5E4D" stopOpacity={0} />
      </RadialGradient>
      <RadialGradient cx="45%" cy="40%" id={`shell-outer-${color}`} r="55%">
        <Stop offset="0%" stopColor="#FFFFFF" stopOpacity={0.85} />
        <Stop offset="30%" stopColor="#E8FFF6" stopOpacity={0.55} />
        <Stop offset="60%" stopColor="#C4FCE8" stopOpacity={0.35} />
        <Stop offset="85%" stopColor="#5FEDC7" stopOpacity={0.18} />
        <Stop offset="100%" stopColor={c.rim} stopOpacity={0.42} />
      </RadialGradient>
      <RadialGradient cx="48%" cy="45%" id={`liquid-${color}`} r="50%">
        <Stop offset="0%" stopColor={c.liquidStart} stopOpacity={0.92} />
        <Stop offset="35%" stopColor={c.liquidMid} stopOpacity={0.78} />
        <Stop offset="70%" stopColor={c.liquidEnd} stopOpacity={0.55} />
        <Stop offset="100%" stopColor={c.rim} stopOpacity={0.32} />
      </RadialGradient>
      <RadialGradient cx="52%" cy="55%" id={`liquid-deep-${color}`} r="45%">
        <Stop offset="0%" stopColor={c.liquidStart} stopOpacity={0.45} />
        <Stop offset="50%" stopColor={c.liquidMid} stopOpacity={0.28} />
        <Stop offset="100%" stopColor={c.rim} stopOpacity={0.15} />
      </RadialGradient>
      <RadialGradient cx="32%" cy="28%" id={`specular-${color}`} r="30%">
        <Stop offset="0%" stopColor="#FFFFFF" stopOpacity={0.98} />
        <Stop offset="25%" stopColor="#FFFFFF" stopOpacity={0.82} />
        <Stop offset="55%" stopColor="#FFFFFF" stopOpacity={0.38} />
        <Stop offset="100%" stopColor="#FFFFFF" stopOpacity={0} />
      </RadialGradient>
      <RadialGradient cx="65%" cy="22%" id={`specular2-${color}`} r="20%">
        <Stop offset="0%" stopColor="#FFFFFF" stopOpacity={0.72} />
        <Stop offset="40%" stopColor="#FFFFFF" stopOpacity={0.32} />
        <Stop offset="100%" stopColor="#FFFFFF" stopOpacity={0} />
      </RadialGradient>
      <LinearGradient id={`rim-light-${color}`} x1="0" x2="0.5" y1="0" y2="0.5">
        <Stop offset="0%" stopColor="#FFFFFF" stopOpacity={0.92} />
        <Stop offset="40%" stopColor="#FFFFFF" stopOpacity={0.45} />
        <Stop offset="100%" stopColor="#FFFFFF" stopOpacity={0} />
      </LinearGradient>
      <LinearGradient id={`rim-dark-${color}`} x1="0" x2="0" y1="0.7" y2="1">
        <Stop offset="0%" stopColor={c.rim} stopOpacity={0} />
        <Stop offset="50%" stopColor={c.rim} stopOpacity={0.28} />
        <Stop offset="100%" stopColor={c.rim} stopOpacity={0.52} />
      </LinearGradient>
      <RadialGradient cx="50%" cy="50%" id={`refract-${color}`} r="48%">
        <Stop offset="85%" stopColor="#FFFFFF" stopOpacity={0} />
        <Stop offset="92%" stopColor="#FFFFFF" stopOpacity={0.22} />
        <Stop offset="96%" stopColor="#FFFFFF" stopOpacity={0.12} />
        <Stop offset="100%" stopColor={c.rim} stopOpacity={0.32} />
      </RadialGradient>
      <Mask id={`mask-${color}`}>
        <Circle cx={s} cy={s} fill="#FFFFFF" r={s * 0.46 * 0.88} />
      </Mask>
    </Defs>
  );
}
