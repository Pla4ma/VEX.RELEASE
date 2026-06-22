import React from 'react';
import Svg, { Circle, Defs, RadialGradient, Stop, Ellipse, Path } from 'react-native-svg';

interface EmptyStateLensProps {
  size?: number;
  top?: number;
  left?: number;
  right?: number;
  bottom?: number;
  opacity?: number;
  dotCount?: number;
  sessionsNeeded?: number;
}

export const EmptyStateLens: React.FC<EmptyStateLensProps> = ({
  size = 100,
  top,
  left,
  right,
  bottom,
  opacity = 0.55,
  dotCount = 5,
  sessionsNeeded,
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
        <RadialGradient id="emptyGlow" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
          <Stop offset="0%" stopColor="rgba(255, 255, 255, 0.48)" />
          <Stop offset="50%" stopColor="rgba(255, 255, 255, 0.22)" />
          <Stop offset="100%" stopColor="rgba(255, 255, 255, 0)" />
        </RadialGradient>
        <RadialGradient id="emptyShell" cx="50%" cy="50%" r="50%" fx="40%" fy="35%">
          <Stop offset="0%" stopColor="rgba(255, 255, 255, 0.62)" />
          <Stop offset="55%" stopColor="rgba(255, 255, 255, 0.32)" />
          <Stop offset="85%" stopColor="rgba(199, 245, 233, 0.18)" />
          <Stop offset="100%" stopColor="rgba(199, 245, 233, 0.08)" />
        </RadialGradient>
      </Defs>

      {/* Outer glow */}
      <Circle cx={cx} cy={cy} r={r + 8} fill="url(#emptyGlow)" />
      {/* Glass shell */}
      <Circle cx={cx} cy={cy} r={r} fill="url(#emptyShell)" />
      {/* Top rim light */}
      <Circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255, 255, 255, 0.68)" strokeWidth={1.8} opacity={0.75} />
      {/* Bottom rim shadow */}
      <Circle cx={cx} cy={cy} r={r - 1.5} fill="none" stroke="rgba(10, 94, 77, 0.12)" strokeWidth={1.2} opacity={0.55} />
      {/* Inner shadow ring */}
      <Circle cx={cx} cy={cy} r={r * 0.68} fill="none" stroke="rgba(10, 94, 77, 0.08)" strokeWidth={1.5} opacity={0.65} />
      {/* Middle ring */}
      <Circle cx={cx} cy={cy} r={r * 0.52} fill="none" stroke="rgba(255, 255, 255, 0.38)" strokeWidth={1} opacity={0.5} />
      {/* Dots in a row */}
      <>
        {Array.from({ length: dotCount }).map((_, i) => {
          const totalWidth = dotCount * (r * 0.14) + (dotCount - 1) * (r * 0.08);
          const startX = cx - totalWidth / 2 + (r * 0.14) / 2;
          const x = startX + i * ((r * 0.14) + (r * 0.08));
          return (
            <Circle key={i} cx={x} cy={cy} r={r * 0.07} fill="rgba(12, 118, 95, 0.42)" />
          );
        })}
      </>
      {/* Ghost rim top */}
      <Path
        d={`M ${cx - r * 0.35} ${cy - r * 0.25} Q ${cx} ${cy - r * 0.35} ${cx + r * 0.35} ${cy - r * 0.25}`}
        fill="none"
        stroke="rgba(255, 255, 255, 0.58)"
        strokeWidth={1.2}
        opacity={0.65}
      />
      {/* Ghost rim bottom */}
      <Path
        d={`M ${cx - r * 0.28} ${cy + r * 0.22} Q ${cx} ${cy + r * 0.32} ${cx + r * 0.28} ${cy + r * 0.22}`}
        fill="none"
        stroke="rgba(10, 94, 77, 0.08)"
        strokeWidth={1.2}
        opacity={0.65}
      />
    </Svg>
  );
};

export { EmptyStateLens }