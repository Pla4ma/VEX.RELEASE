import React from 'react';
import Svg, { Circle, Defs, RadialGradient, Stop, Ellipse, Path, Rect, Polygon } from 'react-native-svg';

interface CrystalAvatarProps {
  size?: number;
  imageUrl?: string;
  top?: number;
  left?: number;
  right?: number;
  bottom?: number;
  isOnline?: boolean;
  active?: boolean;
}

export const CrystalAvatar: React.FC<CrystalAvatarProps> = ({
  size = 72,
  top,
  left,
  right,
  bottom,
  isOnline = true,
  active,
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
      }}
      pointerEvents="none"
    >
      <Defs>
        <RadialGradient id="crystalGlow" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
          <Stop offset="0%" stopColor="rgba(199, 245, 233, 0.48)" />
          <Stop offset="50%" stopColor="rgba(199, 245, 233, 0.22)" />
          <Stop offset="100%" stopColor="rgba(199, 245, 233, 0)" />
        </RadialGradient>
        <RadialGradient id="crystalShell" cx="50%" cy="50%" r="50%" fx="40%" fy="35%">
          <Stop offset="0%" stopColor="rgba(255, 255, 255, 0.88)" />
          <Stop offset="55%" stopColor="rgba(255, 255, 255, 0.52)" />
          <Stop offset="85%" stopColor="rgba(199, 245, 233, 0.38)" />
          <Stop offset="100%" stopColor="rgba(199, 245, 233, 0.18)" />
        </RadialGradient>
        <RadialGradient id="crystalInner" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
          <Stop offset="0%" stopColor="rgba(255, 255, 255, 0.78)" />
          <Stop offset="40%" stopColor="rgba(199, 245, 233, 0.42)" />
          <Stop offset="100%" stopColor="rgba(199, 245, 233, 0.08)" />
        </RadialGradient>
        <RadialGradient id="crystalSpecular" cx="50%" cy="50%" r="50%" fx="35%" fy="30%">
          <Stop offset="0%" stopColor="rgba(255, 255, 255, 0.95)" />
          <Stop offset="40%" stopColor="rgba(255, 255, 255, 0.68)" />
          <Stop offset="100%" stopColor="rgba(255, 255, 255, 0)" />
        </RadialGradient>
      </Defs>

      {/* Outer glow */}
      <Circle cx={cx} cy={cy} r={r + 8} fill="url(#crystalGlow)" />
      {/* Contact shadow */}
      <Circle cx={cx} cy={cy + 3} r={r + 4} fill="rgba(10, 94, 77, 0.08)" />
      {/* Crystal shell */}
      <Circle cx={cx} cy={cy} r={r} fill="url(#crystalShell)" />
      {/* Top rim light */}
      <Circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255, 255, 255, 0.82)" strokeWidth={2.5} opacity={0.85} />
      {/* Bottom rim shadow */}
      <Circle cx={cx} cy={cy} r={r - 1.5} fill="none" stroke="rgba(10, 94, 77, 0.15)" strokeWidth={1.5} opacity={0.65} />
      {/* Inner crystal glow */}
      <Circle cx={cx} cy={cy} r={r * 0.68} fill="url(#crystalInner)" />
      {/* Inner person silhouette (abstract) */}
      <Circle cx={cx} cy={cy - r * 0.08} r={r * 0.18} fill="rgba(10, 118, 95, 0.15)" />
      <Path
        d={`M ${cx - r * 0.18} ${cy + r * 0.22} 
            Q ${cx} ${cy + r * 0.08} ${cx + r * 0.18} ${cy + r * 0.22}
            L ${cx + r * 0.18} ${cy + r * 0.28}
            Q ${cx} ${cy + r * 0.14} ${cx - r * 0.18} ${cy + r * 0.28} Z`}
        fill="rgba(10, 118, 95, 0.12)"
      />
      {/* Crystal facet lines */}
      <Path
        d={`M ${cx - r * 0.42} ${cy - r * 0.12} L ${cx} ${cy - r * 0.32} L ${cx + r * 0.42} ${cy - r * 0.12}`}
        fill="none"
        stroke="rgba(255, 255, 255, 0.45)"
        strokeWidth={1.2}
        opacity={0.6}
      />
      <Path
        d={`M ${cx - r * 0.32} ${cy + r * 0.18} L ${cx} ${cy + r * 0.32} L ${cx + r * 0.32} ${cy + r * 0.18}`}
        fill="none"
        stroke="rgba(255, 255, 255, 0.32)"
        strokeWidth={1}
        opacity={0.5}
      />
      {/* Main specular highlight */}
      <Ellipse cx={cx - r * 0.15} cy={cy - r * 0.25} rx={r * 0.22} ry={r * 0.14} fill="url(#crystalSpecular)" transform={`rotate(-22, ${cx - r * 0.15}, ${cy - r * 0.25})`} />
      {/* Tiny pinprick */}
      <Ellipse cx={cx - r * 0.08} cy={cy - r * 0.3} rx={r * 0.06} ry={r * 0.04} fill="rgba(255, 255, 255, 0.92)" />
      {/* Bottom refraction dark */}
      <Ellipse cx={cx + r * 0.12} cy={cy + r * 0.22} rx={r * 0.14} ry={r * 0.1} fill="rgba(10, 94, 77, 0.12)" opacity={0.65} transform={`rotate(8, ${cx + r * 0.12}, ${cy + r * 0.22})`} />
      {/* Status bead */}
      {(isOnline ?? active) && (
        <>
          <Circle cx={cx + r * 0.65} cy={cy + r * 0.65} r={r * 0.14} fill="rgba(34, 197, 94, 0.92)" />
          <Circle cx={cx + r * 0.65} cy={cy + r * 0.65} r={r * 0.14} fill="none" stroke="rgba(255, 255, 255, 0.92)" strokeWidth={2} />
          <Circle cx={cx + r * 0.65} cy={cy + r * 0.65} r={r * 0.14 + 2} fill="rgba(34, 197, 94, 0.35)" />
        </>
      )}
    </Svg>
  );
};

export default CrystalAvatar;
