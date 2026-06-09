import React from 'react';
import { View, type ViewStyle } from 'react-native';
import Svg, {
  Circle,
  Defs,
  LinearGradient,
  RadialGradient,
  Stop,
  Ellipse,
  G,
  Mask,
} from 'react-native-svg';
import { MODE_CONFIGS } from './FocusModeOrb.tokens';
import { EnergySymbol } from './FocusModeOrb.symbols';

interface FocusModeOrbProps {
  size?: number;
  mode: 'sprint' | 'light' | 'study' | 'recovery';
  style?: ViewStyle;
  intensity?: number;
}

export function FocusModeOrbRaw({
  size = 72,
  mode,
  style,
  intensity = 1,
}: FocusModeOrbProps): JSX.Element {
  const c = MODE_CONFIGS[mode];
  const r = size * 0.46;
  const center = size / 2;
  const i = intensity;

  return (
    <View
      pointerEvents="none"
      style={[
        {
          height: size,
          width: size,
          shadowColor: 'rgba(10, 94, 77, 0.25)',
          shadowOffset: { width: 0, height: size * 0.06 },
          shadowOpacity: 0.85 * i,
          shadowRadius: size * 0.12,
        },
        style,
      ]}
    >
      <Svg height={size} viewBox={`0 0 ${size} ${size}`} width={size}>
        <Defs>
          <RadialGradient cx="50%" cy="50%" id={`glow-${mode}`} r="55%">
            <Stop offset="0%" stopColor={c.glow} stopOpacity={0.6 * i} />
            <Stop offset="50%" stopColor={c.glow} stopOpacity={0.25 * i} />
            <Stop offset="100%" stopColor={c.glow} stopOpacity={0} />
          </RadialGradient>
          <RadialGradient cx="50%" cy="85%" id={`shadow-${mode}`} r="40%">
            <Stop offset="0%" stopColor="#0A5E4D" stopOpacity={0.22 * i} />
            <Stop offset="50%" stopColor="#0A5E4D" stopOpacity={0.08 * i} />
            <Stop offset="100%" stopColor="#0A5E4D" stopOpacity={0} />
          </RadialGradient>
          <RadialGradient cx="45%" cy="40%" id={`shell-${mode}`} r="55%">
            <Stop offset="0%" stopColor="#FFFFFF" stopOpacity={0.85} />
            <Stop offset="30%" stopColor="#E8FFF6" stopOpacity={0.55} />
            <Stop offset="60%" stopColor="#C4FCE8" stopOpacity={0.65} />
            <Stop offset="85%" stopColor="#5FEDC7" stopOpacity={0.65} />
            <Stop offset="100%" stopColor={c.rim} stopOpacity={0.65} />
          </RadialGradient>
          <RadialGradient cx="48%" cy="45%" id={`liquid-${mode}`} r="50%">
            <Stop offset="0%" stopColor={c.liquidStart} stopOpacity={0.92} />
            <Stop offset="35%" stopColor={c.liquidMid} stopOpacity={0.78} />
            <Stop offset="70%" stopColor={c.liquidEnd} stopOpacity={0.55} />
            <Stop offset="100%" stopColor={c.rim} stopOpacity={0.65} />
          </RadialGradient>
          <RadialGradient cx="52%" cy="55%" id={`liquid-deep-${mode}`} r="45%">
            <Stop offset="0%" stopColor={c.liquidStart} stopOpacity={0.65} />
            <Stop offset="50%" stopColor={c.liquidMid} stopOpacity={0.65} />
            <Stop offset="100%" stopColor={c.rim} stopOpacity={0.65} />
          </RadialGradient>
          <RadialGradient cx="32%" cy="28%" id={`specular-${mode}`} r="30%">
            <Stop offset="0%" stopColor="#FFFFFF" stopOpacity={0.98} />
            <Stop offset="25%" stopColor="#FFFFFF" stopOpacity={0.82} />
            <Stop offset="55%" stopColor="#FFFFFF" stopOpacity={0.65} />
            <Stop offset="100%" stopColor="#FFFFFF" stopOpacity={0} />
          </RadialGradient>
          <RadialGradient cx="65%" cy="22%" id={`specular2-${mode}`} r="20%">
            <Stop offset="0%" stopColor="#FFFFFF" stopOpacity={0.72} />
            <Stop offset="40%" stopColor="#FFFFFF" stopOpacity={0.65} />
            <Stop offset="100%" stopColor="#FFFFFF" stopOpacity={0} />
          </RadialGradient>
          <LinearGradient id={`rim-light-${mode}`} x1="0" x2="0.5" y1="0" y2="0.5">
            <Stop offset="0%" stopColor="#FFFFFF" stopOpacity={0.92} />
            <Stop offset="40%" stopColor="#FFFFFF" stopOpacity={0.65} />
            <Stop offset="100%" stopColor="#FFFFFF" stopOpacity={0} />
          </LinearGradient>
          <LinearGradient id={`rim-dark-${mode}`} x1="0" x2="0" y1="0.7" y2="1">
            <Stop offset="0%" stopColor={c.rim} stopOpacity={0} />
            <Stop offset="50%" stopColor={c.rim} stopOpacity={0.65} />
            <Stop offset="100%" stopColor={c.rim} stopOpacity={0.52} />
          </LinearGradient>
          <RadialGradient cx="50%" cy="50%" id={`refract-${mode}`} r="48%">
            <Stop offset="85%" stopColor="#FFFFFF" stopOpacity={0} />
            <Stop offset="92%" stopColor="#FFFFFF" stopOpacity={0.65} />
            <Stop offset="96%" stopColor="#FFFFFF" stopOpacity={0.65} />
            <Stop offset="100%" stopColor={c.rim} stopOpacity={0.65} />
          </RadialGradient>
          <Mask id={`mask-${mode}`}>
            <Circle cx={center} cy={center} fill="#FFFFFF" r={r * 0.88} />
          </Mask>
        </Defs>
        <G>
          <Circle cx={center} cy={center} fill={`url(#glow-${mode})`} r={r * 1.2} />
          <Ellipse cx={center} cy={center + r * 0.72} fill={`url(#shadow-${mode})`} rx={r * 0.72} ry={r * 0.22} />
          <Circle cx={center} cy={center} fill={`url(#shell-${mode})`} r={r} />
          <Circle cx={center} cy={center} fill="none" r={r} stroke={`url(#rim-light-${mode})`} strokeWidth={size * 0.025} />
          <Circle cx={center} cy={center} fill={`url(#refract-${mode})`} r={r} />
          <Circle cx={center} cy={center} fill={`url(#liquid-${mode})`} r={r * 0.88} />
          <Circle cx={center} cy={center} fill={`url(#liquid-deep-${mode})`} r={r * 0.88} />
          <Path
            d={`M ${center - r * 0.78} ${center + r * 0.42} Q ${center} ${center + r * 0.88} ${center + r * 0.78} ${center + r * 0.42}`}
            fill="none" opacity={0.65} stroke={c.rim} strokeLinecap="round" strokeWidth={size * 0.02}
          />
          <EnergySymbol mode={mode} center={center} r={r} config={c} />
          <Ellipse
            cx={center - r * 0.28} cy={center - r * 0.32}
            fill={`url(#specular-${mode})`} rx={r * 0.32} ry={r * 0.22}
            transform={`rotate(-25, ${center - r * 0.28}, ${center - r * 0.32})`}
          />
          <Circle cx={center + r * 0.22} cy={center - r * 0.28} fill={`url(#specular2-${mode})`} r={r * 0.15} />
          <Circle cx={center - r * 0.32} cy={center - r * 0.38} fill="#FFFFFF" opacity={0.95} r={r * 0.06} />
          <Path
            d={`M ${center - r * 0.55} ${center - r * 0.68} Q ${center} ${center - r * 0.88} ${center + r * 0.45} ${center - r * 0.72}`}
            fill="none" opacity={0.78} stroke="#FFFFFF" strokeLinecap="round" strokeWidth={size * 0.015}
          />
          <Ellipse
            cx={center - r * 0.08} cy={center - r * 0.12}
            fill="none" opacity={0.65} rx={r * 0.55} ry={r * 0.42}
            stroke="#FFFFFF" strokeWidth={size * 0.008}
            transform={`rotate(-20, ${center - r * 0.08}, ${center - r * 0.12})`}
          />
        </G>
      </Svg>
    </View>
  );
}

export const FocusModeOrb = React.memo(FocusModeOrbRaw);
FocusModeOrb.displayName = 'FocusModeOrb';

export default FocusModeOrb;
