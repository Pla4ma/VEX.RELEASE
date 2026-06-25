import React from 'react';
import { Platform, View } from 'react-native';

let _LinearGradient: React.ComponentType<Record<string, unknown>> | null = null;
function getLinearGradient(): React.ComponentType<Record<string, unknown>> {
  if (_LinearGradient) return _LinearGradient;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    _LinearGradient = (require('expo-linear-gradient') as { LinearGradient: React.ComponentType<Record<string, unknown>> }).LinearGradient;
  } catch {
    _LinearGradient = View as unknown as React.ComponentType<Record<string, unknown>>;
  }
  return _LinearGradient;
}

import { vexLightGlass } from '../../theme/tokens/vex-light-glass';
import { atmosphereMesh, type AtmosphereVariant } from './atmosphereTokens';

let _MeshGradientView: React.ComponentType<Record<string, unknown>> | null | undefined;

/** Lazy-load expo-mesh-gradient to avoid [runtime not ready] on startup */
function getMeshGradientView(): React.ComponentType<Record<string, unknown>> | null {
  if (_MeshGradientView !== undefined) return _MeshGradientView;
  if (Platform.OS !== 'ios') {
    _MeshGradientView = null;
    return null;
  }
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const mod = require('expo-mesh-gradient');
    // safe: MeshGradientView is the named export from expo-mesh-gradient module
    _MeshGradientView = (mod.MeshGradientView as React.ComponentType<Record<string, unknown>> | undefined) ?? null;
  } catch {
    _MeshGradientView = null;
  }
  return _MeshGradientView;
}

const FALLBACK_GRADIENT: Record<
  AtmosphereVariant,
  { colors: readonly [string, string, string]; locations: readonly [number, number, number]; warmColors: readonly [string, string, string] }
> = {
  home: {
    colors: [
      vexLightGlass.background.pageTop,
      vexLightGlass.background.atmosphericPearl,
      vexLightGlass.background.pageMid,
    ] as const,
    locations: [0, 0.42, 1] as const,
    warmColors: [
      vexLightGlass.background.atmosphericFire,
      vexLightGlass.background.transparent,
      vexLightGlass.background.atmosphericMint,
    ] as const,
  },
  focus: {
    colors: [
      vexLightGlass.background.pageTop,
      vexLightGlass.background.atmosphericPearl,
      vexLightGlass.background.pageMid,
    ] as const,
    locations: [0, 0.5, 1] as const,
    warmColors: [
      vexLightGlass.background.transparent,
      vexLightGlass.background.transparent,
      vexLightGlass.background.atmosphericMint,
    ] as const,
  },
  progress: {
    colors: [
      vexLightGlass.background.pageTop,
      vexLightGlass.background.atmosphericPearl,
      vexLightGlass.background.pageMid,
    ] as const,
    locations: [0, 0.42, 1] as const,
    warmColors: [
      vexLightGlass.background.atmosphericFire,
      vexLightGlass.background.transparent,
      vexLightGlass.background.atmosphericCyan,
    ] as const,
  },
  profile: {
    colors: [
      vexLightGlass.background.pageTop,
      vexLightGlass.background.atmosphericPearl,
      vexLightGlass.background.pageMid,
    ] as const,
    locations: [0, 0.35, 1] as const,
    warmColors: [
      vexLightGlass.background.atmosphericFire,
      vexLightGlass.background.transparent,
      vexLightGlass.background.atmosphericMint,
    ] as const,
  },
  default: {
    colors: [
      vexLightGlass.background.pageTop,
      vexLightGlass.background.atmosphericPearl,
      vexLightGlass.background.pageMid,
    ] as const,
    locations: [0, 0.5, 1] as const,
    warmColors: [
      vexLightGlass.background.transparent,
      vexLightGlass.background.transparent,
      vexLightGlass.background.atmosphericMint,
    ] as const,
  },
};

function LinearGradientFallback({ variant }: { variant: AtmosphereVariant }) {
  const cfg = FALLBACK_GRADIENT[variant];
  const LinearGradient = getLinearGradient();
  return (
    <>
      <LinearGradient
        colors={cfg.colors}
        locations={cfg.locations}
        style={{ bottom: 0, left: 0, position: 'absolute', right: 0, top: 0 }}
      />
      <LinearGradient
        colors={cfg.warmColors}
        end={{ x: 1, y: 1 }}
        start={{ x: 0, y: 0 }}
        style={{
          bottom: 0,
          left: 0,
          opacity: 0.5,
          position: 'absolute',
          right: 0,
          top: 0,
        }}
      />
    </>
  );
}

interface VexMeshAtmosphereProps {
  variant?: AtmosphereVariant;
}

/**
 * Screen-level atmosphere layer.
 * Renders a native mesh gradient on iOS (when available),
 * falling back to LinearGradient stacks on other platforms.
 *
 * Always rendered with pointerEvents="none" behind content.
 */
export function VexMeshAtmosphere({ variant = 'default' }: VexMeshAtmosphereProps) {
  const mesh = atmosphereMesh[variant];
  const MeshGradientView = getMeshGradientView();

  if (MeshGradientView) {
    return (
      <View
        pointerEvents="none"
        style={{
          bottom: 0,
          left: 0,
          position: 'absolute',
          right: 0,
          top: 0,
        }}
      >
        <MeshGradientView
          columns={mesh.columns}
          rows={mesh.rows}
          points={mesh.points}
          colors={mesh.colors}
          smoothsColors
          ignoresSafeArea
          style={{ flex: 1 }}
        />
      </View>
    );
  }

  return (
    <View
      pointerEvents="none"
      style={{
        backgroundColor: vexLightGlass.background.pageTop,
        bottom: 0,
        left: 0,
        position: 'absolute',
        right: 0,
        top: 0,
      }}
    >
      <LinearGradientFallback variant={variant} />
    </View>
  );
}
