import React from 'react';
import Svg, { Circle, Defs, RadialGradient, Stop, Ellipse, Path } from 'react-native-svg';

interface LiquidLensProps {
  size?: number;
  intensity?: number;
  top?: number;
  left?: number;
  right?: number;
  bottom?: number;
  opacity?: number;
}

export const LiquidLens: React.FC<LiquidLensProps> = ({
  size = 180,
  intensity = 1,
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
        opacity: opacity * intensity,
      }}
      pointerEvents="none"
    >
      <Defs>
        <RadialGradient id="lensGlow" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
          <Stop offset="0%" stopColor="rgba(199, 245, 233, 0.55)" />
          <Stop offset="50%" stopColor="rgba(199, 245, 233, 0.22)" />
          <Stop offset="100%" stopColor="rgba(199, 245, 233, 0)" />
        </RadialGradient>
        <RadialGradient id="lensGlass" cx="50%" cy="50%" r="50%" fx="40%" fy="35%">
          <Stop offset="0%" stopColor="rgba(255, 255, 255, 0.82)" />
          <Stop offset="55%" stopColor="rgba(255, 255, 255, 0.42)" />
          <Stop offset="85%" stopColor="rgba(199, 245, 233, 0.28)" />
          <Stop offset="100%" stopColor="rgba(199, 245, 233, 0.12)" />
        </RadialGradient>
        <RadialGradient id="lensCaustic" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
          <Stop offset="0%" stopColor="rgba(255, 255, 255, 0.72)" />
          <Stop offset="40%" stopColor="rgba(199, 245, 233, 0.45)" />
          <Stop offset="100%" stopColor="rgba(199, 245, 233, 0)" />
        </RadialGradient>
        <RadialGradient id="lensSpecular" cx="50%" cy="50%" r="50%" fx="35%" fy="30%">
          <Stop offset="0%" stopColor="rgba(255, 255, 255, 0.95)" />
          <Stop offset="40%" stopColor="rgba(255, 255, 255, 0.62)" />
          <Stop offset="100%" stopColor="rgba(255, 255, 255, 0)" />
        </RadialGradient>
      </Defs>

      {/* Outer glow */}
      <Circle cx={cx} cy={cy} r={r + 12} fill="url(#lensGlow)" />
      {/* Shadow */}
      <Circle cx={cx} cy={cy + 4} r={r + 6} fill="rgba(10, 94, 77, 0.08)" />
      {/* Glass shell */}
      <Circle cx={cx} cy={cy} r={r} fill="url(#lensGlass)" />
      {/* Top rim light */}
      <Circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255, 255, 255, 0.72)" strokeWidth={2.5} opacity={0.8} />
      {/* Bottom rim shadow */}
      <Circle cx={cx} cy={cy} r={r - 2} fill="none" stroke="rgba(10, 94, 77, 0.15)" strokeWidth={1.8} opacity={0.6} />
      {/* Inner caustic */}
      <Circle cx={cx} cy={cy} r={r * 0.65} fill="url(#lensCaustic)" />
      {/* Inner shadow ring */}
      <Circle cx={cx} cy={cy} r={r * 0.65} fill="none" stroke="rgba(10, 94, 77, 0.1)" strokeWidth={2} opacity={0.5} />
      {/* Middle caustic ring */}
      <Circle cx={cx} cy={cy} r={r * 0.48} fill="none" stroke="rgba(255, 255, 255, 0.52)" strokeWidth={1.5} opacity={0.6} />
      {/* Main specular */}
      <Ellipse cx={cx - r * 0.15} cy={cy - r * 0.25} rx={r * 0.22} ry={r * 0.14} fill="url(#lensSpecular)" transform={`rotate(-22, ${cx - r * 0.15}, ${cy - r * 0.25})`} />
      {/* Tiny pinprick */}
      <Ellipse cx={cx - r * 0.08} cy={cy - r * 0.3} rx={r * 0.06} ry={r * 0.04} fill="rgba(255, 255, 255, 0.92)" />
      {/* Bottom refraction arc */}
      <Path
        d={`M ${cx - r * 0.35} ${cy + r * 0.25} Q ${cx} ${cy + r * 0.45} ${cx + r * 0.35} ${cy + r * 0.25}`}
        fill="none"
        stroke="rgba(10, 94, 77, 0.12)"
        strokeWidth={2.2}
        opacity={0.65}
      />
      {/* Bright bottom arc */}
      <Path
        d={`M ${cx - r * 0.28} ${cy + r * 0.22} Q ${cx} ${cy + r * 0.38} ${cx + r * 0.28} ${cy + r * 0.22}`}
        fill="none"
        stroke="rgba(255, 255, 255, 0.38)"
        strokeWidth={1.5}
        opacity={0.55}
      />
      {/* Elliptical distortion bottom-right */}
      <Ellipse cx={cx + r * 0.18} cy={cy + r * 0.18} rx={r * 0.14} ry={r * 0.1} fill="rgba(255, 255, 255, 0.38)" opacity={0.65} transform={`rotate(12, ${cx + r * 0.18}, ${cy + r * 0.18})`} />
    </Svg>
  );
};

export default LiquidLens;
