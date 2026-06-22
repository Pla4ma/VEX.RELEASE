import React from 'react';
import Svg, { Circle, Defs, RadialGradient, Stop, Ellipse, G } from 'react-native-svg';

interface WaterBubbleProps {
  size?: number;
  top?: number;
  left?: number;
  right?: number;
  bottom?: number;
  opacity?: number;
  variant?: 'soft' | 'lens' | 'crystal';
}

export const WaterBubble: React.FC<WaterBubbleProps> = ({
  size = 44,
  top,
  left,
  right,
  bottom,
  opacity = 0.55,
}) => {
  const s = size;
  const cx = s / 2;
  const cy = s / 2;
  const r = s / 2 - 2;

  return (
    <Svg
      width={s}
      height={s}
      viewBox={`0 0 ${s} ${s}`}
      style={{
        position: 'absolute',
        top,
        left,
        right,
        bottom,
        opacity,
      }}
      pointerEvents="none"
    >
      <Defs>
        {/* Atmospheric glow behind bubble */}
        <RadialGradient id="glow" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
          <Stop offset="0%" stopColor="rgba(199, 245, 233, 0.45)" />
          <Stop offset="50%" stopColor="rgba(199, 245, 233, 0.18)" />
          <Stop offset="100%" stopColor="rgba(199, 245, 233, 0)" />
        </RadialGradient>
        {/* Glass shell gradient */}
        <RadialGradient id="glass" cx="50%" cy="50%" r="50%" fx="40%" fy="35%">
          <Stop offset="0%" stopColor="rgba(255, 255, 255, 0.92)" />
          <Stop offset="55%" stopColor="rgba(255, 255, 255, 0.58)" />
          <Stop offset="85%" stopColor="rgba(199, 245, 233, 0.32)" />
          <Stop offset="100%" stopColor="rgba(199, 245, 233, 0.18)" />
        </RadialGradient>
        {/* Inner caustic glow */}
        <RadialGradient id="caustic" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
          <Stop offset="0%" stopColor="rgba(255, 255, 255, 0.78)" />
          <Stop offset="40%" stopColor="rgba(199, 245, 233, 0.42)" />
          <Stop offset="100%" stopColor="rgba(199, 245, 233, 0)" />
        </RadialGradient>
        {/* Deep shadow / contact shadow */}
        <RadialGradient id="shadow" cx="50%" cy="50%" r="50%" fx="50%" fy="60%">
          <Stop offset="0%" stopColor="rgba(10, 94, 77, 0)" />
          <Stop offset="60%" stopColor="rgba(10, 94, 77, 0.08)" />
          <Stop offset="100%" stopColor="rgba(10, 94, 77, 0.22)" />
        </RadialGradient>
        {/* Specular highlight main */}
        <RadialGradient id="specular" cx="50%" cy="50%" r="50%" fx="35%" fy="30%">
          <Stop offset="0%" stopColor="rgba(255, 255, 255, 0.98)" />
          <Stop offset="35%" stopColor="rgba(255, 255, 255, 0.72)" />
          <Stop offset="100%" stopColor="rgba(255, 255, 255, 0)" />
        </RadialGradient>
        {/* Tiny secondary specular */}
        <RadialGradient id="specular2" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
          <Stop offset="0%" stopColor="rgba(255, 255, 255, 0.85)" />
          <Stop offset="100%" stopColor="rgba(255, 255, 255, 0)" />
        </RadialGradient>
      </Defs>

      {/* Layer 1: Atmospheric glow */}
      <Circle cx={cx} cy={cy} r={r + 8} fill="url(#glow)" />
      {/* Layer 2: Contact shadow */}
      <Circle cx={cx} cy={cy + 3} r={r + 4} fill="url(#shadow)" />
      {/* Layer 3: Glass shell */}
      <Circle cx={cx} cy={cy} r={r} fill="url(#glass)" />
      {/* Layer 4: Thick rim light top */}
      <Circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255, 255, 255, 0.78)" strokeWidth={2.2} opacity={0.85} />
      {/* Layer 5: Dark rim bottom */}
      <Circle cx={cx} cy={cy} r={r - 1.5} fill="none" stroke="rgba(10, 94, 77, 0.18)" strokeWidth={1.5} opacity={0.65} />
      {/* Layer 6: Inner caustic glow */}
      <Circle cx={cx} cy={cy} r={r * 0.72} fill="url(#caustic)" />
      {/* Layer 7: Deep inner shadow */}
      <Circle cx={cx} cy={cy} r={r * 0.72} fill="none" stroke="rgba(10, 94, 77, 0.12)" strokeWidth={2} opacity={0.55} />
      {/* Layer 8: Caustic ring */}
      <Circle cx={cx} cy={cy} r={r * 0.55} fill="none" stroke="rgba(255, 255, 255, 0.48)" strokeWidth={1.2} opacity={0.6} />
      {/* Layer 9: Main specular highlight */}
      <Ellipse cx={cx - r * 0.18} cy={cy - r * 0.28} rx={r * 0.22} ry={r * 0.14} fill="url(#specular)" transform={`rotate(-25, ${cx - r * 0.18}, ${cy - r * 0.28})`} />
      {/* Layer 10: Tiny pinprick */}
      <Ellipse cx={cx - r * 0.12} cy={cy - r * 0.32} rx={r * 0.06} ry={r * 0.04} fill="rgba(255, 255, 255, 0.95)" transform={`rotate(-20, ${cx - r * 0.12}, ${cy - r * 0.32})`} />
      {/* Layer 11: Dark arc caustic */}
      <Circle cx={cx} cy={cy} r={r * 0.45} fill="none" stroke="rgba(10, 94, 77, 0.08)" strokeWidth={1.8} opacity={0.65} />
      {/* Layer 12: Bright arc */}
      <Circle cx={cx} cy={cy} r={r * 0.38} fill="none" stroke="rgba(255, 255, 255, 0.38)" strokeWidth={1} opacity={0.55} />
      {/* Layer 13: Elliptical distortion */}
      <Ellipse cx={cx + r * 0.15} cy={cy + r * 0.22} rx={r * 0.12} ry={r * 0.08} fill="rgba(255, 255, 255, 0.42)" opacity={0.4} transform={`rotate(15, ${cx + r * 0.15}, ${cy + r * 0.22})`} />
      {/* Layer 14: Bottom refraction dark */}
      <Ellipse cx={cx + r * 0.08} cy={cy + r * 0.32} rx={r * 0.18} ry={r * 0.1} fill="rgba(10, 94, 77, 0.15)" opacity={0.65} />
    </Svg>
  );
};

export { WaterBubble }