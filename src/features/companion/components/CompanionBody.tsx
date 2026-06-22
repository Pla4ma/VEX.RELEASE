import React from 'react';
import { Circle, RadialGradient, Stop} from 'react-native-svg';
import type {} from 'react-native-reanimated';

import { CompanionPhase} from '../types';

interface CompanionBodyProps {
  phase: CompanionPhase;
  theme: {
    primary: string;
    secondary: string;
    glow: string;
  };
  size: number;
}

export const CompanionBody: React.FC<CompanionBodyProps> = ({
  phase,
  theme,
  size,
}) => {
  const radius = size * 0.4;
  const center = size / 2;

  switch (phase) {
    case 'EGG':
      return (
        <>
          <RadialGradient
            id="eggGradient"
            cx={center}
            cy={center}
            rx={radius}
            ry={radius * 1.2}
          >
            <Stop offset="0%" stopColor={theme.primary} stopOpacity="0.8" />
            <Stop offset="100%" stopColor={theme.secondary} stopOpacity="0.3" />
          </RadialGradient>
          <Circle cx={center} cy={center} r={radius} fill="url(#eggGradient)" />
          {/* Abstract core seed instead of literal egg */}
          <Circle
            cx={center}
            cy={center}
            r={radius * 0.35}
            fill={theme.glow}
            opacity="0.5"
          />
        </>
      );

    case 'HATCHING':
      return (
        <>
          <RadialGradient
            id="hatchGradient"
            cx={center}
            cy={center}
            rx={radius}
            ry={radius}
          >
            <Stop offset="0%" stopColor={theme.glow} stopOpacity="0.9" />
            <Stop offset="60%" stopColor={theme.primary} stopOpacity="0.6" />
            <Stop offset="100%" stopColor={theme.secondary} stopOpacity="0.2" />
          </RadialGradient>
          <Circle
            cx={center}
            cy={center}
            r={radius}
            fill="url(#hatchGradient)"
          />
          {/* Energy points instead of literal crack dots */}
          <Circle
            cx={center - radius * 0.3}
            cy={center - radius * 0.2}
            r={2}
            fill={theme.primary}
          />
          <Circle
            cx={center + radius * 0.2}
            cy={center + radius * 0.3}
            r={1.5}
            fill={theme.primary}
          />
        </>
      );

    case 'YOUNG':
      return (
        <>
          <RadialGradient
            id="youngGradient"
            cx={center}
            cy={center}
            rx={radius * 0.8}
            ry={radius * 0.8}
          >
            <Stop offset="0%" stopColor={theme.glow} stopOpacity="1" />
            <Stop offset="100%" stopColor={theme.primary} stopOpacity="0.4" />
          </RadialGradient>
          <Circle
            cx={center}
            cy={center}
            r={radius * 0.8}
            fill="url(#youngGradient)"
          />
          {/* Light nodes instead of literal eyes */}
          <Circle
            cx={center - 8}
            cy={center - 5}
            r={3}
            fill={theme.glow}
            opacity={0.9}
          />
          <Circle
            cx={center + 8}
            cy={center - 5}
            r={3}
            fill={theme.glow}
            opacity={0.9}
          />
        </>
      );

    case 'MATURE':
    case 'AWAKENED':
    case 'TRANSCENDENT':
      return (
        <>
          <RadialGradient
            id="matureGradient"
            cx={center}
            cy={center}
            rx={radius}
            ry={radius}
          >
            <Stop offset="0%" stopColor={theme.glow} stopOpacity="1" />
            <Stop offset="30%" stopColor={theme.primary} stopOpacity="0.8" />
            <Stop offset="70%" stopColor={theme.secondary} stopOpacity="0.4" />
            <Stop offset="100%" stopColor={theme.primary} stopOpacity="0.1" />
          </RadialGradient>
          <Circle
            cx={center}
            cy={center}
            r={radius}
            fill="url(#matureGradient)"
          />
          {phase !== 'MATURE' && (
            <>
              {/* Signal flares instead of literal eyes */}
              <Circle
                cx={center - radius * 0.5}
                cy={center - radius * 0.3}
                r={4}
                fill={theme.glow}
              />
              <Circle
                cx={center + radius * 0.5}
                cy={center - radius * 0.3}
                r={4}
                fill={theme.glow}
              />
            </>
          )}
        </>
      );
  }
};
