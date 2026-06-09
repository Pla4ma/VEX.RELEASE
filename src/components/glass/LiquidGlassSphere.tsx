import React from 'react';
import { View, type ViewStyle } from 'react-native';
import Svg, {
  Circle,
  Defs,
  LinearGradient,
  Path,
  RadialGradient,
  Stop,
  Ellipse,
  G,
  Mask,
} from 'react-native-svg';

interface LiquidGlassSphereProps {
  size?: number;
  color?: 'mint' | 'cyan' | 'teal' | 'coral' | 'amber' | 'pearl';
  icon?: React.ReactNode;
  style?: ViewStyle;
  intensity?: number;
}

const colorConfigs = {
  mint: {
    liquidStart: '#5FEDC7',
    liquidMid: '#42CFAE',
    liquidEnd: '#18B894',
    glow: 'rgba(95, 237, 199, 0.35)',
    rim: '#0A9B8A',
    highlight: '#FFFFFF',
  },
  cyan: {
    liquidStart: '#84E4E5',
    liquidMid: '#5ED4D5',
    liquidEnd: '#0E9B9C',
    glow: 'rgba(132, 228, 229, 0.35)',
    rim: '#0A8A8B',
    highlight: '#FFFFFF',
  },
  teal: {
    liquidStart: '#4DD4B3',
    liquidMid: '#2CB89A',
    liquidEnd: '#0A8A72',
    glow: 'rgba(45, 184, 154, 0.35)',
    rim: '#086E5C',
    highlight: '#FFFFFF',
  },
  coral: {
    liquidStart: '#F0A88A',
    liquidMid: '#E08A6A',
    liquidEnd: '#C25E3A',
    glow: 'rgba(240, 138, 75, 0.35)',
    rim: '#A04A2A',
    highlight: '#FFFFFF',
  },
  amber: {
    liquidStart: '#F5C88A',
    liquidMid: '#E0A85A',
    liquidEnd: '#C28A2A',
    glow: 'rgba(223, 164, 74, 0.35)',
    rim: '#A0781A',
    highlight: '#FFFFFF',
  },
  pearl: {
    liquidStart: '#FFFFFF',
    liquidMid: '#F0F8F5',
    liquidEnd: '#D0E8E0',
    glow: 'rgba(255, 255, 255, 0.45)',
    rim: '#A0C8B8',
    highlight: '#FFFFFF',
  },
};

export function LiquidGlassSphereRaw({
  size = 64,
  color = 'mint',
  icon,
  style,
  intensity = 1,
}: LiquidGlassSphereProps): JSX.Element {
  const c = colorConfigs[color];
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
          {/* Outer glow */}
          <RadialGradient cx="50%" cy="50%" id={`glow-${color}`} r="55%">
            <Stop offset="0%" stopColor={c.glow} stopOpacity={0.6 * i} />
            <Stop offset="50%" stopColor={c.glow} stopOpacity={0.25 * i} />
            <Stop offset="100%" stopColor={c.glow} stopOpacity={0} />
          </RadialGradient>

          {/* Contact shadow */}
          <RadialGradient cx="50%" cy="85%" id={`shadow-${color}`} r="40%">
            <Stop offset="0%" stopColor="#0A5E4D" stopOpacity={0.22 * i} />
            <Stop offset="50%" stopColor="#0A5E4D" stopOpacity={0.08 * i} />
            <Stop offset="100%" stopColor="#0A5E4D" stopOpacity={0} />
          </RadialGradient>

          {/* Thick glass shell - outer */}
          <RadialGradient cx="45%" cy="40%" id={`shell-outer-${color}`} r="55%">
            <Stop offset="0%" stopColor="#FFFFFF" stopOpacity={0.85} />
            <Stop offset="30%" stopColor="#E8FFF6" stopOpacity={0.55} />
            <Stop offset="60%" stopColor="#C4FCE8" stopOpacity={0.65} />
            <Stop offset="85%" stopColor="#5FEDC7" stopOpacity={0.65} />
            <Stop offset="100%" stopColor={c.rim} stopOpacity={0.65} />
          </RadialGradient>

          {/* Liquid interior body */}
          <RadialGradient cx="48%" cy="45%" id={`liquid-${color}`} r="50%">
            <Stop offset="0%" stopColor={c.liquidStart} stopOpacity={0.92} />
            <Stop offset="35%" stopColor={c.liquidMid} stopOpacity={0.78} />
            <Stop offset="70%" stopColor={c.liquidEnd} stopOpacity={0.55} />
            <Stop offset="100%" stopColor={c.rim} stopOpacity={0.65} />
          </RadialGradient>

          {/* Inner liquid depth */}
          <RadialGradient cx="52%" cy="55%" id={`liquid-deep-${color}`} r="45%">
            <Stop offset="0%" stopColor={c.liquidStart} stopOpacity={0.65} />
            <Stop offset="50%" stopColor={c.liquidMid} stopOpacity={0.65} />
            <Stop offset="100%" stopColor={c.rim} stopOpacity={0.65} />
          </RadialGradient>

          {/* Primary specular highlight - sharp white */}
          <RadialGradient cx="32%" cy="28%" id={`specular-${color}`} r="30%">
            <Stop offset="0%" stopColor="#FFFFFF" stopOpacity={0.98} />
            <Stop offset="25%" stopColor="#FFFFFF" stopOpacity={0.82} />
            <Stop offset="55%" stopColor="#FFFFFF" stopOpacity={0.65} />
            <Stop offset="100%" stopColor="#FFFFFF" stopOpacity={0} />
          </RadialGradient>

          {/* Secondary specular - softer */}
          <RadialGradient cx="65%" cy="22%" id={`specular2-${color}`} r="20%">
            <Stop offset="0%" stopColor="#FFFFFF" stopOpacity={0.72} />
            <Stop offset="40%" stopColor="#FFFFFF" stopOpacity={0.65} />
            <Stop offset="100%" stopColor="#FFFFFF" stopOpacity={0} />
          </RadialGradient>

          {/* Rim light - top edge */}
          <LinearGradient id={`rim-light-${color}`} x1="0" x2="0.5" y1="0" y2="0.5">
            <Stop offset="0%" stopColor="#FFFFFF" stopOpacity={0.92} />
            <Stop offset="40%" stopColor="#FFFFFF" stopOpacity={0.65} />
            <Stop offset="100%" stopColor="#FFFFFF" stopOpacity={0} />
          </LinearGradient>

          {/* Bottom rim darkening */}
          <LinearGradient id={`rim-dark-${color}`} x1="0" x2="0" y1="0.7" y2="1">
            <Stop offset="0%" stopColor={c.rim} stopOpacity={0} />
            <Stop offset="50%" stopColor={c.rim} stopOpacity={0.65} />
            <Stop offset="100%" stopColor={c.rim} stopOpacity={0.52} />
          </LinearGradient>

          {/* Glass refraction inner ring */}
          <RadialGradient cx="50%" cy="50%" id={`refract-${color}`} r="48%">
            <Stop offset="85%" stopColor="#FFFFFF" stopOpacity={0} />
            <Stop offset="92%" stopColor="#FFFFFF" stopOpacity={0.65} />
            <Stop offset="96%" stopColor="#FFFFFF" stopOpacity={0.65} />
            <Stop offset="100%" stopColor={c.rim} stopOpacity={0.65} />
          </RadialGradient>

          {/* Mask for inner liquid */}
          <Mask id={`mask-${color}`}>
            <Circle cx={center} cy={center} fill="#FFFFFF" r={r * 0.88} />
          </Mask>
        </Defs>

        <G>
          {/* Outer glow aura */}
          <Circle cx={center} cy={center} fill={`url(#glow-${color})`} r={r * 1.2} />

          {/* Contact shadow beneath sphere */}
          <Ellipse
            cx={center}
            cy={center + r * 0.72}
            fill={`url(#shadow-${color})`}
            rx={r * 0.72}
            ry={r * 0.22}
          />

          {/* Main glass sphere outer shell */}
          <Circle
            cx={center}
            cy={center}
            fill={`url(#shell-outer-${color})`}
            r={r}
          />

          {/* Thick glass rim */}
          <Circle
            cx={center}
            cy={center}
            fill="none"
            r={r}
            stroke={`url(#rim-light-${color})`}
            strokeWidth={size * 0.025}
          />

          {/* Inner glass refraction ring */}
          <Circle
            cx={center}
            cy={center}
            fill={`url(#refract-${color})`}
            r={r}
          />

          {/* Liquid interior */}
          <Circle
            cx={center}
            cy={center}
            fill={`url(#liquid-${color})`}
            r={r * 0.88}
          />

          {/* Deep liquid shadow at bottom */}
          <Circle
            cx={center}
            cy={center}
            fill={`url(#liquid-deep-${color})`}
            r={r * 0.88}
          />

          {/* Bottom rim darkening */}
          <Path
            d={`M ${center - r * 0.78} ${center + r * 0.42} Q ${center} ${center + r * 0.88} ${center + r * 0.78} ${center + r * 0.42}`}
            fill="none"
            opacity={0.65}
            stroke={c.rim}
            strokeLinecap="round"
            strokeWidth={size * 0.02}
          />

          {/* Icon inside liquid */}
          {icon ? (
            <G transform={`translate(${center - r * 0.35}, ${center - r * 0.35})`}>
              {icon}
            </G>
          ) : null}

          {/* Primary specular highlight - top left sharp reflection */}
          <Ellipse
            cx={center - r * 0.28}
            cy={center - r * 0.32}
            fill={`url(#specular-${color})`}
            rx={r * 0.32}
            ry={r * 0.22}
            transform={`rotate(-25, ${center - r * 0.28}, ${center - r * 0.32})`}
          />

          {/* Secondary specular - smaller soft spot */}
          <Circle
            cx={center + r * 0.22}
            cy={center - r * 0.28}
            fill={`url(#specular2-${color})`}
            r={r * 0.15}
          />

          {/* Tiny bright dot */}
          <Circle
            cx={center - r * 0.32}
            cy={center - r * 0.38}
            fill="#FFFFFF"
            opacity={0.95}
            r={r * 0.06}
          />

          {/* Thin glass edge line at top */}
          <Path
            d={`M ${center - r * 0.55} ${center - r * 0.68} Q ${center} ${center - r * 0.88} ${center + r * 0.45} ${center - r * 0.72}`}
            fill="none"
            opacity={0.78}
            stroke="#FFFFFF"
            strokeLinecap="round"
            strokeWidth={size * 0.015}
          />

          {/* Inner caustic highlight ring */}
          <Ellipse
            cx={center - r * 0.08}
            cy={center - r * 0.12}
            fill="none"
            opacity={0.65}
            rx={r * 0.55}
            ry={r * 0.42}
            stroke="#FFFFFF"
            strokeWidth={size * 0.008}
            transform={`rotate(-20, ${center - r * 0.08}, ${center - r * 0.12})`}
          />
        </G>
      </Svg>
    </View>
  );
}

export const LiquidGlassSphere = React.memo(LiquidGlassSphereRaw);
LiquidGlassSphere.displayName = 'LiquidGlassSphere';

export default LiquidGlassSphere;
