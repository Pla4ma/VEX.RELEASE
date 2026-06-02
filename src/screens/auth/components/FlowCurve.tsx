import React, { useEffect, useMemo } from 'react';
import { BlurMask, Group, Path, Skia, type Transforms3d } from '@shopify/react-native-skia';
import {
  Easing,
  useDerivedValue,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

const EASE_AMBIENT = Easing.bezier(0.37, 0, 0.63, 1);

export interface CurveSpec {
  color: string;
  strokeWidth: number;
  blur: number;
  opacity: number;
  duration: number;
  delay: number;
  driftY: number;
  driftX: number;
}

/**
 * A single organic flow-field curve. Path geometry is fixed; only a 2D
 * translation is recomputed per frame. The Reanimated → Skia transform
 * bridge uses the worklet-returned array of named transform steps.
 */
export function FlowCurve({
  d,
  spec,
  isReducedMotion,
}: {
  d: string;
  spec: CurveSpec;
  isReducedMotion: boolean;
}): React.JSX.Element {
  const t = useSharedValue(0);
  const basePath = useMemo(() => Skia.Path.MakeFromSVGString(d), [d]);

  useEffect(() => {
    if (isReducedMotion) return;
    t.value = withDelay(
      spec.delay,
      withRepeat(
        withTiming(1, { duration: spec.duration, easing: EASE_AMBIENT }),
        -1,
        true,
      ),
    );
  }, [t, spec.delay, spec.duration, isReducedMotion]);

  const transform = useDerivedValue<Transforms3d>(() => {
    const phase = t.value * Math.PI * 2;
    const tx = Math.sin(phase) * spec.driftX;
    const ty = Math.cos(phase * 0.7) * spec.driftY;
    return [{ translateX: tx }, { translateY: ty }];
  }, [t, spec.driftX, spec.driftY]);

  if (!basePath) return <Group />;

  return (
    <Group opacity={spec.opacity} transform={transform}>
      <Path path={basePath} style="stroke" strokeWidth={spec.strokeWidth} color={spec.color}>
        <BlurMask blur={spec.blur} style="normal" />
      </Path>
    </Group>
  );
}
