import React, { useMemo } from 'react';
import Svg, { Path, Defs, LinearGradient, Stop } from 'react-native-svg';
import { View } from 'react-native';

interface FocusScoreSparklineProps {
  data: number[];
  height?: number;
  color: string;
  max: number;
}

export function FocusScoreSparkline({
  data,
  height = 60,
  color,
  max,
}: FocusScoreSparklineProps): JSX.Element {
  const { pathD, areaD, numericWidth } = useMemo(() => {
    if (data.length < 2) {
      return { pathD: '', areaD: '', numericWidth: 0 };
    }
    const w = 320;
    const h = height;
    const padX = 4;
    const padY = 8;
    const innerW = w - padX * 2;
    const innerH = h - padY * 2;
    const min = Math.min(...data, 0);
    const safeMax = Math.max(max, ...data);
    const range = safeMax - min || 1;
    const step = innerW / (data.length - 1);
    const points = data.map((v, i) => {
      const x = padX + step * i;
      const y = padY + innerH * (1 - (v - min) / range);
      return { x, y };
    });
    const d = points
      .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(2)} ${p.y.toFixed(2)}`)
      .join(' ');
    const area = `${d} L ${(padX + innerW).toFixed(2)} ${(padY + innerH).toFixed(2)} L ${padX.toFixed(2)} ${(padY + innerH).toFixed(2)} Z`;
    return { pathD: d, areaD: area, numericWidth: w };
  }, [data, height, max]);

  return (
    <View style={{ height, width: '100%' }}>
      <Svg
        height={height}
        preserveAspectRatio="none"
        viewBox={`0 0 ${numericWidth} ${height}`}
        width="100%"
      >
        <Defs>
          <LinearGradient id="sparkFill" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={color} stopOpacity="0.30" />
            <Stop offset="1" stopColor={color} stopOpacity="0" />
          </LinearGradient>
        </Defs>
        <Path d={areaD} fill="url(#sparkFill)" />
        <Path
          d={pathD}
          fill="none"
          stroke={color}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2.4}
        />
      </Svg>
    </View>
  );
}

export default FocusScoreSparkline;
