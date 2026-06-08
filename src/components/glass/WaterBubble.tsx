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
} from 'react-native-svg';

interface WaterBubbleProps {
  size?: number;
  style?: ViewStyle;
  opacity?: number;
}

export function WaterBubble({
  size = 200,
  style,
  opacity = 0.85,
}: WaterBubbleProps): JSX.Element {
  const r = size * 0.45;
  const center = size / 2;

  return (
    <View
      pointerEvents="none"
      style={[
        {
          height: size,
          opacity,
          width: size,
          shadowColor: 'rgba(10, 155, 138, 0.22)',
          shadowOffset: { width: 0, height: size * 0.04 },
          shadowOpacity: 0.38,
          shadowRadius: size * 0.08,
        },
        style,
      ]}
    >
      <Svg height={size} viewBox={`0 0 ${size} ${size}`} width={size}>
        <Defs>
          {/* Outer water glow */}
          <RadialGradient cx="50%" cy="50%" id="waterGlow" r="55%">
            <Stop offset="0%" stopColor="rgba(95, 237, 199, 0.28)" />
            <Stop offset="50%" stopColor="rgba(132, 228, 229, 0.12)" />
            <Stop offset="100%" stopColor="rgba(132, 228, 229, 0)" />
          </RadialGradient>

          {/* Water bubble body - glass shell */}
          <RadialGradient cx="48%" cy="42%" id="waterShell" r="52%">
            <Stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.92" />
            <Stop offset="20%" stopColor="#F0FFF9" stopOpacity="0.78" />
            <Stop offset="45%" stopColor="#C8FCE8" stopOpacity="0.52" />
            <Stop offset="70%" stopColor="#8AEFD4" stopOpacity="0.32" />
            <Stop offset="88%" stopColor="#5FEDC7" stopOpacity="0.18" />
            <Stop offset="100%" stopColor="#0A9B8A" stopOpacity="0.42" />
          </RadialGradient>

          {/* Water interior - liquid fill */}
          <RadialGradient cx="50%" cy="48%" id="waterInterior" r="48%">
            <Stop offset="0%" stopColor="#E8FFF6" stopOpacity="0.68" />
            <Stop offset="30%" stopColor="#B8FCE0" stopOpacity="0.52" />
            <Stop offset="60%" stopColor="#8AEFD4" stopOpacity="0.38" />
            <Stop offset="85%" stopColor="#5FEDC7" stopOpacity="0.22" />
            <Stop offset="100%" stopColor="#0A9B8A" stopOpacity="0.12" />
          </RadialGradient>

          {/* Deep water shadow at bottom */}
          <RadialGradient cx="50%" cy="55%" id="waterDeep" r="45%">
            <Stop offset="0%" stopColor="rgba(10, 155, 138, 0)" />
            <Stop offset="50%" stopColor="rgba(10, 155, 138, 0.08)" />
            <Stop offset="100%" stopColor="rgba(10, 155, 138, 0.22)" />
          </RadialGradient>

          {/* Primary highlight - sharp white specular */}
          <RadialGradient cx="30%" cy="25%" id="waterSpecular" r="28%">
            <Stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.98" />
            <Stop offset="30%" stopColor="#FFFFFF" stopOpacity="0.82" />
            <Stop offset="60%" stopColor="#FFFFFF" stopOpacity="0.38" />
            <Stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
          </RadialGradient>

          {/* Secondary soft highlight */}
          <RadialGradient cx="68%" cy="20%" id="waterSpecular2" r="18%">
            <Stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.72" />
            <Stop offset="45%" stopColor="#FFFFFF" stopOpacity={0.28} />
            <Stop offset="100%" stopColor="#FFFFFF" stopOpacity={0} />
          </RadialGradient>

          {/* Rim light gradient */}
          <LinearGradient id="waterRim" x1="0" x2="0.5" y1="0" y2="0.5">
            <Stop offset="0%" stopColor="#FFFFFF" stopOpacity={0.88} />
            <Stop offset="50%" stopColor="#E8FFF6" stopOpacity={0.42} />
            <Stop offset="100%" stopColor="#5FEDC7" stopOpacity={0} />
          </LinearGradient>

          {/* Bottom shadow */}
          <RadialGradient cx="50%" cy="88%" id="waterShadow" r="35%">
            <Stop offset="0%" stopColor="#0A5E4D" stopOpacity={0.22} />
            <Stop offset="50%" stopColor="#0A5E4D" stopOpacity={0.08} />
            <Stop offset="100%" stopColor="#0A5E4D" stopOpacity={0} />
          </RadialGradient>
        </Defs>

        <G>
          {/* Outer glow */}
          <Circle cx={center} cy={center} fill="url(#waterGlow)" r={r * 1.15} />

          {/* Contact shadow */}
          <Ellipse cx={center} cy={center + r * 0.75} fill="url(#waterShadow)" rx={r * 0.68} ry={r * 0.2} />

          {/* Main bubble shell */}
          <Circle cx={center} cy={center} fill="url(#waterShell)" r={r} />

          {/* Rim light */}
          <Circle cx={center} cy={center} fill="none" r={r} stroke="url(#waterRim)" strokeWidth={size * 0.022} />

          {/* Interior liquid */}
          <Circle cx={center} cy={center} fill="url(#waterInterior)" r={r * 0.9} />

          {/* Deep shadow at bottom */}
          <Circle cx={center} cy={center} fill="url(#waterDeep)" r={r * 0.9} />

          {/* Bottom dark rim */}
          <Path
            d={`M ${center - r * 0.72} ${center + r * 0.48} Q ${center} ${center + r * 0.92} ${center + r * 0.72} ${center + r * 0.48}`}
            fill="none"
            opacity={0.35}
            stroke="#0A8A72"
            strokeLinecap="round"
            strokeWidth={size * 0.018}
          />

          {/* Primary specular highlight */}
          <Ellipse
            cx={center - r * 0.25}
            cy={center - r * 0.28}
            fill="url(#waterSpecular)"
            rx={r * 0.28}
            ry={r * 0.2}
            transform={`rotate(-22, ${center - r * 0.25}, ${center - r * 0.28})`}
          />

          {/* Secondary specular */}
          <Circle cx={center + r * 0.18} cy={center - r * 0.22} fill="url(#waterSpecular2)" r={r * 0.12} />

          {/* Tiny bright dot */}
          <Circle cx={center - r * 0.28} cy={center - r * 0.32} fill="#FFFFFF" opacity={0.95} r={r * 0.05} />

          {/* Caustic ring inside */}
          <Ellipse
            cx={center - r * 0.06}
            cy={center - r * 0.1}
            fill="none"
            opacity={0.28}
            rx={r * 0.48}
            ry={r * 0.38}
            stroke="#FFFFFF"
            strokeWidth={size * 0.008}
            transform={`rotate(-18, ${center - r * 0.06}, ${center - r * 0.1})`}
          />

          {/* Top thin edge line */}
          <Path
            d={`M ${center - r * 0.52} ${center - r * 0.62} Q ${center} ${center - r * 0.85} ${center + r * 0.42} ${center - r * 0.68}`}
            fill="none"
            opacity={0.72}
            stroke="#FFFFFF"
            strokeLinecap="round"
            strokeWidth={size * 0.012}
          />
        </G>
      </Svg>
    </View>
  );
}

export default WaterBubble;




