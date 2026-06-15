import React from 'react';
import { View } from 'react-native';
import { Text } from '../../../components/primitives/Text';
import { GlassPill } from '../../../components/glass/GlassPill';
import { vexLightGlass } from '../../../theme/tokens/vex-light-glass';

interface FocusScoreHeaderProps {
  size: 'small' | 'medium' | 'large';
  currentScore: number;
  currentBand: { label: string; max: number } | null;
  scoreColor: string;
  scoreChange: number;
  showTrend: boolean;
  successColor: string;
  errorColor: string;
}

export function FocusScoreHeader({
  size,
  currentScore,
  currentBand,
  scoreColor,
  scoreChange,
  showTrend,
  successColor,
  errorColor,
}: FocusScoreHeaderProps): React.ReactNode {
  const isPositiveChange = scoreChange > 0;
  const isNegativeChange = scoreChange < 0;
  return (
    <View
      style={{
        alignItems: 'flex-start',
        flexDirection: 'row',
        justifyContent: 'space-between',
      }}
    >
      <View>
        <Text
          style={{
            color: scoreColor,
            fontSize: size === 'large' ? 56 : 38,
            fontWeight: '800',
            letterSpacing: -1.6,
            lineHeight: size === 'large' ? 64 : 44,
          }}
        >
          {currentScore || '---'}
        </Text>
        <Text
          style={{
            color: vexLightGlass.text.tertiary,
            fontSize: 12,
            fontWeight: '600',
            marginTop: 4,
          }}
        >
          Focus Score
        </Text>
      </View>
      {currentBand ? (
        <GlassPill label={currentBand.label} size="sm" variant="success" />
      ) : null}
      {showTrend && scoreChange !== 0 ? (
        <Text
          style={{
            color: isPositiveChange
              ? successColor
              : isNegativeChange
                ? errorColor
                : vexLightGlass.text.secondary,
            fontSize: 12,
            fontWeight: '600',
            marginTop: 4,
          }}
        >
          {isPositiveChange ? '↑' : '↓'} {Math.abs(scoreChange)} from last check
        </Text>
      ) : null}
    </View>
  );
}

export default FocusScoreHeader;
