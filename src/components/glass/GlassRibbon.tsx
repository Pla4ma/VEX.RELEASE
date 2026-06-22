import React from 'react';
import Svg, { Defs, LinearGradient, Stop, Path, Rect, G } from 'react-native-svg';

interface GlassRibbonProps {
  width?: number;
  height?: number;
  top?: number;
  left?: number;
  right?: number;
  bottom?: number;
  opacity?: number;
  angle?: number;
  curve?: string;
}

export const GlassRibbon: React.FC<GlassRibbonProps> = ({
  width = 120,
  height = 20,
  top,
  left,
  right,
  bottom,
  opacity = 0.55,
  angle = 0,
}) => {
  const w = width;
  const h = height;

  return (
    <Svg
      width={w}
      height={h}
      viewBox={`0 0 ${w} ${h}`}
      style={{
        position: 'absolute',
        top,
        left,
        right,
        bottom,
        opacity,
        transform: [{ rotate: `${angle}deg` }],
      }}
      pointerEvents="none"
    >
      <Defs>
        <LinearGradient id="ribbonGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <Stop offset="0%" stopColor="rgba(255, 255, 255, 0.92)" />
          <Stop offset="50%" stopColor="rgba(199, 245, 233, 0.72)" />
          <Stop offset="100%" stopColor="rgba(255, 255, 255, 0.92)" />
        </LinearGradient>
        <LinearGradient id="ribbonShadow" x1="0%" y1="0%" x2="0%" y2="100%">
          <Stop offset="0%" stopColor="rgba(10, 94, 77, 0)" />
          <Stop offset="100%" stopColor="rgba(10, 94, 77, 0.12)" />
        </LinearGradient>
      </Defs>

      {/* Glass ribbon body */}
      <Rect x="0" y="0" width={w} height={h} rx={h / 2} fill="url(#ribbonGrad)" />
      {/* Top edge highlight */}
      <Rect x="1" y="1" width={w - 2} height={h * 0.3} rx={h / 2} fill="rgba(255, 255, 255, 0.72)" />
      {/* Secondary top edge */}
      <Rect x="2" y="2" width={w - 4} height={h * 0.15} rx={h / 2} fill="rgba(255, 255, 255, 0.52)" />
      {/* Bottom shadow */}
      <Rect x="1" y={h * 0.6} width={w - 2} height={h * 0.35} rx={h / 2} fill="url(#ribbonShadow)" opacity={0.55} />
      {/* Glass shine streak */}
      <Path
        d={`M ${w * 0.15} ${h * 0.25} Q ${w * 0.5} ${h * 0.15} ${w * 0.85} ${h * 0.25}`}
        fill="none"
        stroke="rgba(255, 255, 255, 0.68)"
        strokeWidth={1.5}
        opacity={0.72}
      />
      {/* Inner refraction line */}
      <Path
        d={`M ${w * 0.25} ${h * 0.55} Q ${w * 0.5} ${h * 0.45} ${w * 0.75} ${h * 0.55}`}
        fill="none"
        stroke="rgba(199, 245, 233, 0.52)"
        strokeWidth={1}
        opacity={0.55}
      />
      {/* Bottom edge highlight */}
      <Rect x="0" y={h - 2} width={w} height={2} rx={1} fill="rgba(255, 255, 255, 0.38)" opacity={0.65} />
      {/* Right edge refraction */}
      <Rect x={w - 2} y="0" width={2} height={h} rx={1} fill="rgba(255, 255, 255, 0.42)" opacity={0.65} />
      {/* Left edge refraction */}
      <Rect x="0" y="0" width={2} height={h} rx={1} fill="rgba(255, 255, 255, 0.42)" opacity={0.65} />
    </Svg>
  );
};

export { GlassRibbon }