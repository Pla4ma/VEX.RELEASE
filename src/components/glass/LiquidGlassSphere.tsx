import React from 'react';
import { View, type ViewStyle } from 'react-native';
import Svg, {
  Circle,
  Ellipse,
  G,
  Path,
} from 'react-native-svg';

import { COLOR_CONFIGS, type GlassSphereColorConfig } from './LiquidGlassSphere.tokens';
import { SphereDefs } from './LiquidGlassSphere.defs';

interface LiquidGlassSphereProps {
  size?: number;
  color?: 'mint' | 'cyan' | 'teal' | 'coral' | 'amber' | 'pearl';
  icon?: React.ReactNode;
  style?: ViewStyle;
  intensity?: number;
}

export function LiquidGlassSphereRaw({
  size = 64,
  color = 'mint',
  icon,
  style,
  intensity = 1,
}: LiquidGlassSphereProps): React.ReactNode {
  const raw = COLOR_CONFIGS[color] ?? COLOR_CONFIGS.mint;
  const c: GlassSphereColorConfig = raw as GlassSphereColorConfig;
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
          boxShadow: `0px size * 0.06px size * 0.12px rgba(10, 94, 77, NaN)`,
        },
        style,
      ]}
    >
      <Svg height={size} viewBox={`0 0 ${size} ${size}`} width={size}>
        <SphereDefs color={color} config={c} center={center} intensity={i} />
        <G>
          <Circle cx={center} cy={center} fill={`url(#glow-${color})`} r={r * 1.2} />
          <Ellipse
            cx={center}
            cy={center + r * 0.72}
            fill={`url(#shadow-${color})`}
            rx={r * 0.72}
            ry={r * 0.22}
          />
          <Circle
            cx={center}
            cy={center}
            fill={`url(#shell-outer-${color})`}
            r={r}
          />
          <Circle
            cx={center}
            cy={center}
            fill="none"
            r={r}
            stroke={`url(#rim-light-${color})`}
            strokeWidth={size * 0.025}
          />
          <Circle
            cx={center}
            cy={center}
            fill={`url(#refract-${color})`}
            r={r}
          />
          <Circle
            cx={center}
            cy={center}
            fill={`url(#liquid-${color})`}
            r={r * 0.88}
          />
          <Circle
            cx={center}
            cy={center}
            fill={`url(#liquid-deep-${color})`}
            r={r * 0.88}
          />
          <Path
            d={`M ${center - r * 0.78} ${center + r * 0.42} Q ${center} ${center + r * 0.88} ${center + r * 0.78} ${center + r * 0.42}`}
            fill="none"
            opacity={0.65}
            stroke={c.rim}
            strokeLinecap="round"
            strokeWidth={size * 0.02}
          />
          {icon ? (
            <G transform={`translate(${center - r * 0.35}, ${center - r * 0.35})`}>
              {icon}
            </G>
          ) : null}
          <Ellipse
            cx={center - r * 0.28}
            cy={center - r * 0.32}
            fill={`url(#specular-${color})`}
            rx={r * 0.32}
            ry={r * 0.22}
            transform={`rotate(-25, ${center - r * 0.28}, ${center - r * 0.32})`}
          />
          <Circle
            cx={center + r * 0.22}
            cy={center - r * 0.28}
            fill={`url(#specular2-${color})`}
            r={r * 0.15}
          />
          <Circle
            cx={center - r * 0.32}
            cy={center - r * 0.38}
            fill="theme.glassColors.vexWhite"
            opacity={0.95}
            r={r * 0.06}
          />
          <Path
            d={`M ${center - r * 0.55} ${center - r * 0.68} Q ${center} ${center - r * 0.88} ${center + r * 0.45} ${center - r * 0.72}`}
            fill="none"
            opacity={0.78}
            stroke="theme.glassColors.vexWhite"
            strokeLinecap="round"
            strokeWidth={size * 0.015}
          />
          <Ellipse
            cx={center - r * 0.08}
            cy={center - r * 0.12}
            fill="none"
            opacity={0.65}
            rx={r * 0.55}
            ry={r * 0.42}
            stroke="theme.glassColors.vexWhite"
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
