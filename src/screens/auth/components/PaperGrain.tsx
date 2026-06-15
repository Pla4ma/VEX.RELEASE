import React, { useMemo } from 'react';
import { View } from 'react-native';
import { lightColors } from '@/theme/tokens/colors';

const PALETTE_CREAM = lightColors.text.secondary;

/**
 * PaperGrain — a View-based noise veil. Cheaper than a Skia noise pass
 * and reads as "paper texture" at the opacity used in production. Each
 * dot is a tiny cream spec at a random position and alpha.
 */
export function PaperGrain({ width, height }: { width: number; height: number }): React.JSX.Element {
  const dots = useMemo(() => {
    const out: { left: number; top: number; size: number; alpha: number }[] = [];
    for (let i = 0; i < 420; i += 1) {
      out.push({
        left: Math.random() * 100,
        top: Math.random() * 100,
        size: Math.random() > 0.9 ? 1.8 : Math.random() > 0.6 ? 1.1 : 0.7,
        alpha: 0.06 + Math.random() * 0.10,
      });
    }
    return out;
  }, []);
  return (
    <View pointerEvents="none" style={{ position: 'absolute', width, height }}>
      {dots.map((d, i) => (
        <View
          key={d.id}
          style={{
            position: 'absolute',
            left: `${d.left}%`,
            top: `${d.top}%`,
            width: d.size,
            height: d.size,
            borderRadius: d.size / 2,
            backgroundColor: PALETTE_CREAM,
            opacity: d.alpha,
          }}
        />
      ))}
    </View>
  );
}
