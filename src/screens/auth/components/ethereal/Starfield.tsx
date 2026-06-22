/**
 * Starfield — static stars in the upper portion of the sky.
 * Motion stripped for performance.
 */
import React, { useMemo } from 'react';
import { useWindowDimensions, View } from 'react-native';

type Star = {
  x: number;
  y: number;
  r: number;
  color: string;
};

          
const STAR_COUNT = 38;
const STAR_PALETTE = ['#FFFFFF', '#E7F1FB', '#FFE9C2', '#FFD9E0'];

function buildStars(count: number): Star[] {
  const arr: Star[] = [];
  for (let i = 0; i < count; i += 1) {
    arr.push({
      x: (i * 41 + 7) % 100,
      y: (i * 17 + 3) % 45,
      r: 0.6 + ((i * 13) % 8) * 0.15,
      color: STAR_PALETTE[i % STAR_PALETTE.length] ?? '#FFFFFF',
    });
  }
  return arr;
}

export function Starfield(): React.JSX.Element {
  const { width, height } = useWindowDimensions();
  const stars = useMemo(() => buildStars(STAR_COUNT), []);

  return (
    <View
      pointerEvents="none"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: height * 0.55,
      }}
    >
      {stars.map((s, i) => {
        const left = (s.x / 100) * width - s.r * 4;
        const top = (s.y / 100) * 540;
        const size = s.r * 8;

        return (
          <View
            key={`star-${s.x}-${s.y}`}
            pointerEvents="none"
            style={{}}
          />
        );
      })}
    </View>
  );
}
