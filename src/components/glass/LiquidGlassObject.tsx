import React from 'react';
import { View, type ViewStyle } from 'react-native';
import Svg, {
  Circle,
  Defs,
  LinearGradient,
  Path,
  RadialGradient,
  Stop,
  G,
  Ellipse,
} from 'react-native-svg';

interface LiquidGlassObjectProps {
  size?: number;
  style?: ViewStyle;
  variant?: 'swirl' | 'orb' | 'gem' | 'lens' | 'bubble' | 'ribbon';
  intensity?: number;
}

function buildGlassDefs(): JSX.Element {
  return (
    <Defs>
      {/* Core body - crystalline glass with mint tint */}
      <RadialGradient cx="42%" cy="38%" id="liquidCore" r="65%">
        <Stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.98" />
        <Stop offset="18%" stopColor="#F0FFF9" stopOpacity="0.94" />
        <Stop offset="38%" stopColor="#C4FCE8" stopOpacity="0.78" />
        <Stop offset="58%" stopColor="#7AE8C8" stopOpacity="0.52" />
        <Stop offset="78%" stopColor="#3DD4A8" stopOpacity="0.32" />
        <Stop offset="100%" stopColor="#0A9B8A" stopOpacity="0.18" />
      </RadialGradient>

      {/* Thick rim lighting - outer shell */}
      <LinearGradient id="rimLight" x1="0" x2="1" y1="0" y2="1">
        <Stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.95" />
        <Stop offset="25%" stopColor="#E8FFF6" stopOpacity="0.72" />
        <Stop offset="55%" stopColor="#5FEDC7" stopOpacity="0.45" />
        <Stop offset="85%" stopColor="#18B894" stopOpacity="0.68" />
        <Stop offset="100%" stopColor="#0A5E4D" stopOpacity="0.85" />
      </LinearGradient>

      {/* Inner refraction distortion */}
      <RadialGradient cx="48%" cy="45%" id="innerDistortion" r="50%">
        <Stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.55" />
        <Stop offset="35%" stopColor="#D4FFF0" stopOpacity="0.38" />
        <Stop offset="70%" stopColor="#8AEFD4" stopOpacity="0.22" />
        <Stop offset="100%" stopColor="#0A9B8A" stopOpacity="0.08" />
      </RadialGradient>

      {/* Specular highlight - bright white reflection */}
      <RadialGradient cx="32%" cy="28%" id="specularHot" r="28%">
        <Stop offset="0%" stopColor="#FFFFFF" stopOpacity="1" />
        <Stop offset="30%" stopColor="#FFFFFF" stopOpacity="0.78" />
        <Stop offset="65%" stopColor="#FFFFFF" stopOpacity="0.32" />
        <Stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
      </RadialGradient>

      {/* Secondary specular */}
      <RadialGradient cx="65%" cy="22%" id="specularSecondary" r="18%">
        <Stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.82" />
        <Stop offset="50%" stopColor="#FFFFFF" stopOpacity="0.38" />
        <Stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
      </RadialGradient>

      {/* Bottom shadow contact */}
      <RadialGradient cx="50%" cy="85%" id="contactShadow" r="35%">
        <Stop offset="0%" stopColor="#0A5E4D" stopOpacity="0.22" />
        <Stop offset="50%" stopColor="#0A5E4D" stopOpacity="0.08" />
        <Stop offset="100%" stopColor="#0A5E4D" stopOpacity="0" />
      </RadialGradient>

      {/* Edge bevel shine */}
      <LinearGradient id="edgeBevel" x1="0" x2="1" y1="0" y2="1">
        <Stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.92" />
        <Stop offset="40%" stopColor="#FFFFFF" stopOpacity="0.18" />
        <Stop offset="60%" stopColor="#0A9B8A" stopOpacity="0.12" />
        <Stop offset="100%" stopColor="#0A5E4D" stopOpacity="0.55" />
      </LinearGradient>

      {/* Mint glow aura */}
      <RadialGradient cx="50%" cy="50%" id="mintGlow" r="55%">
        <Stop offset="0%" stopColor="#5FEDC7" stopOpacity="0.28" />
        <Stop offset="50%" stopColor="#18B894" stopOpacity="0.12" />
        <Stop offset="100%" stopColor="#0A5E4D" stopOpacity="0" />
      </RadialGradient>

      {/* Glass ribbon gradient */}
      <LinearGradient id="ribbonBody" x1="0" x2="1" y1="0" y2="0.6">
        <Stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.88" />
        <Stop offset="30%" stopColor="#E8FFF6" stopOpacity="0.72" />
        <Stop offset="60%" stopColor="#A7F9EA" stopOpacity="0.48" />
        <Stop offset="100%" stopColor="#7AE8C8" stopOpacity="0.28" />
      </LinearGradient>

      {/* Focus lens gradient */}
      <RadialGradient cx="45%" cy="40%" id="lensBody" r="55%">
        <Stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.92" />
        <Stop offset="25%" stopColor="#F0FFF9" stopOpacity="0.78" />
        <Stop offset="55%" stopColor="#C4FCE8" stopOpacity="0.52" />
        <Stop offset="80%" stopColor="#5FEDC7" stopOpacity="0.28" />
        <Stop offset="100%" stopColor="#0A9B8A" stopOpacity="0.15" />
      </RadialGradient>
    </Defs>
  );
}

function OrbVariant({ size }: { size: number }): JSX.Element {
  const r = size * 0.42;
  const center = size / 2;
  return (
    <G>
      {/* Outer glow aura */}
      <Circle cx={center} cy={center} fill="url(#mintGlow)" r={r * 1.25} />

      {/* Contact shadow */}
      <Ellipse cx={center} cy={center + r * 0.55} fill="url(#contactShadow)" rx={r * 0.85} ry={r * 0.28} />

      {/* Main body */}
      <Circle cx={center} cy={center} fill="url(#liquidCore)" r={r} stroke="url(#rimLight)" strokeWidth={size * 0.028} />

      {/* Inner refraction */}
      <Circle cx={center} cy={center} fill="url(#innerDistortion)" r={r * 0.82} />

      {/* Specular highlight */}
      <Circle cx={center - r * 0.15} cy={center - r * 0.22} fill="url(#specularHot)" r={r * 0.35} />

      {/* Secondary highlight */}
      <Circle cx={center + r * 0.25} cy={center - r * 0.18} fill="url(#specularSecondary)" r={r * 0.15} />

      {/* Edge bevel ring */}
      <Circle cx={center} cy={center} fill="none" r={r * 0.95} stroke="url(#edgeBevel)" strokeWidth={size * 0.012} opacity={0.85} />

      {/* Bottom rim darkening */}
      <Path
        d={`M ${center - r * 0.85} ${center + r * 0.35} Q ${center} ${center + r * 0.95} ${center + r * 0.85} ${center + r * 0.35}`}
        fill="none"
        opacity={0.35}
        stroke="#0A5E4D"
        strokeLinecap="round"
        strokeWidth={size * 0.015}
      />
    </G>
  );
}

function GemVariant({ size }: { size: number }): JSX.Element {
  const cx = size / 2;
  const cy = size / 2;
  const r = size * 0.38;
  return (
    <G>
      {/* Aura */}
      <Circle cx={cx} cy={cy} fill="url(#mintGlow)" r={r * 1.3} />

      {/* Shadow */}
      <Ellipse cx={cx} cy={cy + r * 0.6} fill="url(#contactShadow)" rx={r * 0.8} ry={r * 0.25} />

      {/* Hexagon body */}
      <Path
        d={`M ${cx} ${cy - r} L ${cx + r * 0.87} ${cy - r * 0.5} L ${cx + r * 0.87} ${cy + r * 0.5} L ${cx} ${cy + r} L ${cx - r * 0.87} ${cy + r * 0.5} L ${cx - r * 0.87} ${cy - r * 0.5} Z`}
        fill="url(#liquidCore)"
        stroke="url(#rimLight)"
        strokeLinejoin="round"
        strokeWidth={size * 0.025}
      />

      {/* Inner facets */}
      <Path
        d={`M ${cx} ${cy - r * 0.55} L ${cx + r * 0.48} ${cy - r * 0.28} L ${cx + r * 0.48} ${cy + r * 0.28} L ${cx} ${cy + r * 0.55} L ${cx - r * 0.48} ${cy + r * 0.28} L ${cx - r * 0.48} ${cy - r * 0.28} Z`}
        fill="url(#innerDistortion)"
        opacity={0.72}
      />

      {/* Top facet highlight */}
      <Path
        d={`M ${cx} ${cy - r} L ${cx + r * 0.35} ${cy - r * 0.55} L ${cx} ${cy - r * 0.15} L ${cx - r * 0.35} ${cy - r * 0.55} Z`}
        fill="url(#specularHot)"
        opacity={0.65}
      />

      {/* Specular on top edge */}
      <Path
        d={`M ${cx - r * 0.5} ${cy - r * 0.72} Q ${cx} ${cy - r * 0.95} ${cx + r * 0.5} ${cy - r * 0.72}`}
        fill="none"
        opacity={0.88}
        stroke="#FFFFFF"
        strokeLinecap="round"
        strokeWidth={size * 0.018}
      />

      {/* Bottom rim */}
      <Path
        d={`M ${cx - r * 0.72} ${cy + r * 0.42} Q ${cx} ${cy + r * 0.88} ${cx + r * 0.72} ${cy + r * 0.42}`}
        fill="none"
        opacity={0.42}
        stroke="#0A5E4D"
        strokeLinecap="round"
        strokeWidth={size * 0.012}
      />
    </G>
  );
}

function SwirlVariant({ size }: { size: number }): JSX.Element {
  const cx = size / 2;
  const cy = size / 2;
  return (
    <G>
      {/* Aura */}
      <Circle cx={cx} cy={cy} fill="url(#mintGlow)" r={size * 0.48} opacity={0.55} />

      {/* Shadow */}
      <Ellipse cx={cx} cy={cy + size * 0.22} fill="url(#contactShadow)" rx={size * 0.38} ry={size * 0.12} />

      {/* Swirl body */}
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

      {/* Inner swirl refraction */}
      <Path
        d={`M ${cx + size * 0.06} ${cy - size * 0.28} 
            C ${cx + size * 0.22} ${cy - size * 0.28} ${cx + size * 0.3} ${cy - size * 0.16} ${cx + size * 0.26} ${cy - size * 0.02}
            C ${cx + size * 0.22} ${cy + size * 0.12} ${cx + size * 0.12} ${cy + size * 0.2} ${cx - size * 0.02} ${cy + size * 0.22}
            C ${cx - size * 0.12} ${cy + size * 0.24} ${cx - size * 0.2} ${cy + size * 0.18} ${cx - size * 0.22} ${cy + size * 0.08}
            C ${cx - size * 0.24} ${cy - size * 0.02} ${cx - size * 0.18} ${cy - size * 0.1} ${cx - size * 0.08} ${cy - size * 0.14}`}
        fill="url(#innerDistortion)"
        opacity={0.65}
      />

      {/* Top specular */}
      <Path
        d={`M ${cx + size * 0.02} ${cy - size * 0.32} C ${cx + size * 0.15} ${cy - size * 0.32} ${cx + size * 0.22} ${cy - size * 0.22} ${cx + size * 0.2} ${cy - size * 0.1}`}
        fill="none"
        opacity={0.82}
        stroke="#FFFFFF"
        strokeLinecap="round"
        strokeWidth={size * 0.02}
      />

      {/* Secondary specular */}
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

function LensVariant({ size }: { size: number }): JSX.Element {
  const cx = size / 2;
  const cy = size / 2;
  const r = size * 0.4;
  return (
    <G>
      {/* Outer glow */}
      <Circle cx={cx} cy={cy} fill="url(#mintGlow)" r={r * 1.2} opacity={0.45} />

      {/* Contact shadow */}
      <Ellipse cx={cx} cy={cy + r * 0.6} fill="url(#contactShadow)" rx={r * 0.75} ry={r * 0.22} />

      {/* Outer ring */}
      <Circle cx={cx} cy={cy} fill="none" r={r} stroke="url(#rimLight)" strokeWidth={size * 0.035} />

      {/* Inner body */}
      <Circle cx={cx} cy={cy} fill="url(#lensBody)" r={r * 0.88} />

      {/* Inner refraction ring */}
      <Circle cx={cx} cy={cy} fill="none" r={r * 0.72} stroke="url(#innerDistortion)" strokeWidth={size * 0.015} opacity={0.65} />

      {/* Center specular */}
      <Circle cx={cx - r * 0.12} cy={cy - r * 0.18} fill="url(#specularHot)" r={r * 0.3} />

      {/* Secondary specular */}
      <Circle cx={cx + r * 0.22} cy={cy - r * 0.12} fill="url(#specularSecondary)" r={r * 0.12} />

      {/* Edge bevel */}
      <Circle cx={cx} cy={cy} fill="none" r={r * 0.92} stroke="url(#edgeBevel)" strokeWidth={size * 0.01} opacity={0.75} />

      {/* Bottom rim */}
      <Path
        d={`M ${cx - r * 0.78} ${cy + r * 0.42} Q ${cx} ${cy + r * 0.92} ${cx + r * 0.78} ${cy + r * 0.42}`}
        fill="none"
        opacity={0.38}
        stroke="#0A5E4D"
        strokeLinecap="round"
        strokeWidth={size * 0.015}
      />
    </G>
  );
}

function BubbleVariant({ size }: { size: number }): JSX.Element {
  const cx = size / 2;
  const cy = size / 2;
  const r = size * 0.38;
  return (
    <G>
      {/* Soft aura */}
      <Circle cx={cx} cy={cy} fill="url(#mintGlow)" r={r * 1.15} opacity={0.35} />

      {/* Contact shadow */}
      <Ellipse cx={cx} cy={cy + r * 0.55} fill="url(#contactShadow)" rx={r * 0.7} ry={r * 0.2} opacity={0.55} />

      {/* Thin shell body */}
      <Circle cx={cx} cy={cy} fill="url(#liquidCore)" opacity={0.75} r={r} stroke="url(#rimLight)" strokeWidth={size * 0.018} />

      {/* Inner hollow refraction */}
      <Circle cx={cx} cy={cy} fill="url(#innerDistortion)" opacity={0.45} r={r * 0.82} />

      {/* Sharp specular highlight */}
      <Ellipse cx={cx - r * 0.18} cy={cy - r * 0.25} fill="url(#specularHot)" rx={r * 0.28} ry={r * 0.2} />

      {/* Tiny bright spot */}
      <Circle cx={cx - r * 0.22} cy={cy - r * 0.3} fill="#FFFFFF" opacity={0.95} r={r * 0.08} />

      {/* Secondary soft highlight */}
      <Circle cx={cx + r * 0.28} cy={cy - r * 0.12} fill="url(#specularSecondary)" r={r * 0.1} />

      {/* Bottom edge darkening */}
      <Path
        d={`M ${cx - r * 0.72} ${cy + r * 0.38} Q ${cx} ${cy + r * 0.85} ${cx + r * 0.72} ${cy + r * 0.38}`}
        fill="none"
        opacity={0.28}
        stroke="#0A5E4D"
        strokeLinecap="round"
        strokeWidth={size * 0.012}
      />
    </G>
  );
}

function RibbonVariant({ size }: { size: number }): JSX.Element {
  const cx = size / 2;
  const cy = size / 2;
  return (
    <G>
      {/* Glow */}
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

      {/* Shadow */}
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

      {/* Ribbon body */}
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

      {/* Specular streak */}
      <Path
        d={`M ${cx - size * 0.22} ${cy - size * 0.18} 
            Q ${cx - size * 0.08} ${cy - size * 0.28} ${cx + size * 0.08} ${cy - size * 0.15}`}
        fill="none"
        opacity={0.78}
        stroke="#FFFFFF"
        strokeLinecap="round"
        strokeWidth={size * 0.015}
      />

      {/* Secondary streak */}
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

export function LiquidGlassObject({
  size = 96,
  style,
  variant = 'orb',
}: LiquidGlassObjectProps): JSX.Element {
  return (
    <View
      pointerEvents="none"
      style={[
        {
          height: size,
          shadowColor: 'rgba(10, 94, 77, 0.22)',
          shadowOffset: { width: 0, height: size * 0.06 },
          shadowOpacity: 0.55,
          shadowRadius: size * 0.08,
          width: size,
        },
        style,
      ]}
    >
      <Svg height={size} viewBox={`0 0 ${size} ${size}`} width={size}>
        {buildGlassDefs()}
        {variant === 'orb' && <OrbVariant size={size} />}
        {variant === 'gem' && <GemVariant size={size} />}
        {variant === 'swirl' && <SwirlVariant size={size} />}
        {variant === 'lens' && <LensVariant size={size} />}
        {variant === 'bubble' && <BubbleVariant size={size} />}
        {variant === 'ribbon' && <RibbonVariant size={size} />}
      </Svg>
    </View>
  );
}

export default LiquidGlassObject;

