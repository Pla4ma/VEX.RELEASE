import React from 'react';
import { G, Path, Circle } from 'react-native-svg';
import type { FocusModeConfig } from './FocusModeOrb.tokens';

interface EnergySymbolProps {
  mode: string;
  center: number;
  r: number;
  config: FocusModeConfig;
}

export function EnergySymbol({ mode, center, r, config }: EnergySymbolProps): JSX.Element | null {
  if (mode === 'sprint') {
    return (
      <G>
        <Path
          d={`M ${center - r * 0.4} ${center - r * 0.5} Q ${center} ${center - r * 0.7} ${center + r * 0.3} ${center - r * 0.4}`}
          fill="none"
          opacity={0.55}
          stroke={config.energyColor}
          strokeLinecap="round"
          strokeWidth={1.5}
        />
        <Path
          d={`M ${center - r * 0.2} ${center - r * 0.3} Q ${center + r * 0.2} ${center - r * 0.5} ${center + r * 0.5} ${center - r * 0.2}`}
          fill="none"
          opacity={0.65}
          stroke={config.energyColor}
          strokeLinecap="round"
          strokeWidth={1}
        />
      </G>
    );
  }
  if (mode === 'light') {
    return (
      <Path
        d={`M ${center - r * 0.3} ${center - r * 0.2} Q ${center + r * 0.1} ${center - r * 0.4} ${center + r * 0.3} ${center - r * 0.1}`}
        fill="none"
        opacity={0.65}
        stroke={config.energyColor}
        strokeLinecap="round"
        strokeWidth={2}
      />
    );
  }
  if (mode === 'study') {
    return (
      <G>
        <Path
          d={`M ${center - r * 0.3} ${center - r * 0.15} L ${center + r * 0.3} ${center - r * 0.15}`}
          fill="none"
          opacity={0.65}
          stroke={config.energyColor}
          strokeLinecap="round"
          strokeWidth={1}
        />
        <Path
          d={`M ${center - r * 0.25} ${center + r * 0.05} L ${center + r * 0.25} ${center + r * 0.05}`}
          fill="none"
          opacity={0.65}
          stroke={config.energyColor}
          strokeLinecap="round"
          strokeWidth={1}
        />
        <Path
          d={`M ${center - r * 0.2} ${center + r * 0.25} L ${center + r * 0.2} ${center + r * 0.25}`}
          fill="none"
          opacity={0.65}
          stroke={config.energyColor}
          strokeLinecap="round"
          strokeWidth={1}
        />
      </G>
    );
  }
  if (mode === 'recovery') {
    return (
      <G>
        <Path
          d={`M ${center - r * 0.25} ${center} Q ${center - r * 0.1} ${center - r * 0.15} ${center} ${center} Q ${center + r * 0.1} ${center + r * 0.15} ${center + r * 0.25} ${center}`}
          fill="none"
          opacity={0.65}
          stroke={config.energyColor}
          strokeLinecap="round"
          strokeWidth={2}
        />
        <Circle
          cx={center}
          cy={center - r * 0.1}
          fill={config.energyColor}
          opacity={0.65}
          r={r * 0.12}
        />
      </G>
    );
  }
  return null;
}
