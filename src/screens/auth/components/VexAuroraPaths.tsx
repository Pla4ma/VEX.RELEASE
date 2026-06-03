import React from 'react';
import {
  BlurMask,
  Canvas,
  Circle,
  LinearGradient,
  Paint,
  Path,
  Rect,
  vec,
} from '@shopify/react-native-skia';

export function DiagonalAurora({ width, height }: { width: number; height: number }): React.JSX.Element {
  const w = width;
  const h = height;

  // Massive bright violet sweep
  const violetSweep = `
    M ${w * -0.20},${h * 0.00}
    C ${w * 0.20},${h * -0.12} ${w * 0.60},${h * 0.30} ${w * 1.20},${h * 0.12}
    L ${w * 1.20},${h * 0.55}
    C ${w * 0.60},${h * 0.70} ${w * 0.20},${h * 0.22} ${w * -0.20},${h * 0.42}
    Z
  `;

  // Bright warm amber sweep
  const warmSweep = `
    M ${w * -0.15},${h * 0.58}
    C ${w * 0.30},${h * 0.98} ${w * 0.70},${h * 0.48} ${w * 1.20},${h * 0.62}
    L ${w * 1.20},${h * 1.05}
    C ${w * 0.70},${h * 0.88} ${w * 0.30},${h * 1.12} ${w * -0.15},${h * 0.82}
    Z
  `;

  // Deep atmospheric fill
  const deepFill = `
    M ${w * -0.15},${h * 0.22}
    C ${w * 0.25},${h * 0.08} ${w * 0.55},${h * 0.40} ${w * 1.15},${h * 0.28}
    L ${w * 1.15},${h * 0.62}
    C ${w * 0.55},${h * 0.74} ${w * 0.25},${h * 0.42} ${w * -0.15},${h * 0.55}
    Z
  `;

  return (
    <>
      {/* Deep atmospheric base */}
      <Path path={deepFill} opacity={0.80}>
        <Paint style="fill">
          <LinearGradient
            start={vec(w * 0.10, h * 0.22)}
            end={vec(w * 0.90, h * 0.55)}
            colors={['#3D2080', '#1E1060', '#0A0520']}
            positions={[0, 0.5, 1]}
          />
          <BlurMask blur={50} style="normal" />
        </Paint>
      </Path>

      {/* Primary violet sweep */}
      <Path path={violetSweep} opacity={0.85}>
        <Paint style="fill">
          <LinearGradient
            start={vec(w * 0, h * 0.10)}
            end={vec(w * 0.9, h * 0.35)}
            colors={['rgba(139,92,246,0)', 'rgba(130,50,250,0.95)', 'rgba(185,140,255,0.80)', 'rgba(139,92,246,0)']}
            positions={[0, 0.30, 0.65, 1]}
          />
          <BlurMask blur={45} style="normal" />
        </Paint>
      </Path>

      {/* Warm amber sweep */}
      <Path path={warmSweep} opacity={0.75}>
        <Paint style="fill">
          <LinearGradient
            start={vec(w * 0.1, h * 0.68)}
            end={vec(w * 0.85, h * 0.72)}
            colors={['rgba(255,138,61,0)', 'rgba(255,100,40,0.90)', 'rgba(255,159,28,0.75)', 'rgba(255,208,138,0)']}
            positions={[0, 0.35, 0.70, 1]}
          />
          <BlurMask blur={50} style="normal" />
        </Paint>
      </Path>
    </>
  );
}

export function FocusCoreGlow({ width, height }: { width: number; height: number }): React.JSX.Element {
  const w = width;
  const h = height;
  const cx = w * 0.5;
  const cy = h * 0.46;

  return (
    <>
      {/* Central violet glow */}
      <Circle cx={cx} cy={cy} r={w * 0.50} opacity={0.50}>
        <Paint style="fill">
          <LinearGradient
            start={vec(cx - w * 0.3, cy - h * 0.12)}
            end={vec(cx + w * 0.3, cy + h * 0.12)}
            colors={['rgba(139,92,246,0.55)', 'rgba(100,50,220,0.25)', 'rgba(139,92,246,0)']}
            positions={[0, 0.5, 1]}
          />
          <BlurMask blur={80} style="normal" />
        </Paint>
      </Circle>

      {/* Warm energy core */}
      <Circle cx={cx} cy={h * 0.78} r={w * 0.35} opacity={0.60}>
        <Paint style="fill">
          <LinearGradient
            start={vec(cx - w * 0.2, h * 0.72)}
            end={vec(cx + w * 0.2, h * 0.84)}
            colors={['rgba(255,138,61,0.60)', 'rgba(255,80,30,0.30)', 'rgba(255,138,61,0)']}
            positions={[0, 0.5, 1]}
          />
          <BlurMask blur={65} style="normal" />
        </Paint>
      </Circle>
    </>
  );
}

export function OrbitalSystem({ width, height }: { width: number; height: number }): React.JSX.Element {
  const w = width;
  const h = height;
  const cx = w * 0.5;
  const cy = h * 0.46;

  return (
    <>
      <Path
        path={`M ${cx - w * 0.38} ${cy} A ${w * 0.38} ${w * 0.38} 0 1 1 ${cx + w * 0.38} ${cy} A ${w * 0.38} ${w * 0.38} 0 1 1 ${cx - w * 0.38} ${cy}`}
        style="stroke"
        strokeWidth={0.8}
        opacity={0.15}
        color="rgba(226,244,255,0.60)"
      />
      <Path
        path={`M ${cx - w * 0.24} ${cy + 4} A ${w * 0.24} ${w * 0.24} 0 1 1 ${cx + w * 0.24} ${cy + 4} A ${w * 0.24} ${w * 0.24} 0 1 1 ${cx - w * 0.24} ${cy + 4}`}
        style="stroke"
        strokeWidth={0.6}
        opacity={0.10}
        color="rgba(185,140,255,0.80)"
      />
      <Path
        path={`M ${cx} ${h * 0.20} L ${cx} ${h * 0.88}`}
        style="stroke"
        strokeWidth={0.5}
        opacity={0.08}
        color="rgba(255,255,255,0.50)"
      />
    </>
  );
}

export function BaseGradient({ width, height }: { width: number; height: number }): React.JSX.Element {
  return (
    <Canvas style={{ position: 'absolute', width, height }}>
      <Rect x={0} y={0} width={width} height={height}>
        <Paint style="fill">
          <LinearGradient
            start={vec(0, 0)}
            end={vec(0, height)}
            colors={['#0A0530', '#0A0528', '#050218']}
            positions={[0, 0.5, 1]}
          />
        </Paint>
      </Rect>
    </Canvas>
  );
}

export function BottomVignette({ width, height }: { width: number; height: number }): React.JSX.Element {
  return (
    <Canvas style={{ position: 'absolute', width, height }}>
      <Rect x={0} y={height * 0.55} width={width} height={height * 0.45}>
        <Paint style="fill">
          <LinearGradient
            start={vec(0, height * 0.55)}
            end={vec(0, height)}
            colors={['rgba(5,2,20,0)', 'rgba(5,2,20,0.75)', 'rgba(5,2,20,0.98)']}
            positions={[0, 0.45, 1]}
          />
        </Paint>
      </Rect>
    </Canvas>
  );
}

export function GrainOverlay({ width, height }: { width: number; height: number }): React.JSX.Element {
  return (
    <Canvas style={{ position: 'absolute', width, height, opacity: 0.04 }} pointerEvents="none">
      <Rect x={0} y={0} width={width} height={height} color="#FFFFFF" />
    </Canvas>
  );
}
