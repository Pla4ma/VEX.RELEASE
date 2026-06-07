import React from 'react';
import { View, Pressable } from 'react-native';
import Animated from 'react-native-reanimated';
import { Text } from '../../../components/primitives/Text';
import { Box } from '../../../components/primitives/Box';
import { GlassCard } from '../../../components/glass/GlassCard';
import { GlassProgressBar } from '../../../components/glass/GlassProgressBar';
import { getNextBandLabel } from './FocusScoreCardStates';
import { FocusScoreHeader } from './FocusScoreHeader';
import { vexLightGlass } from '../../../theme/tokens/vex-light-glass';

interface FocusScoreCardContentProps {
  size: 'small' | 'medium' | 'large';
  handlePress: () => void;
  onPress: (() => void) | undefined;
  animatedStyles: object;
  scoreColor: string;
  currentScore: number;
  currentBand: { label: string; max: number } | null;
  scoreChange: number;
  showTrend: boolean;
  identityStatement: string;
  scoreProgress: number;
  percentileRank: number | null;
  isInRecovery: boolean;
  successColor: string;
  errorColor: string;
}

function RecoveryBanner(): JSX.Element {
  return (
    <View
      style={{
        backgroundColor: 'rgba(240, 138, 75, 0.18)',
        borderColor: 'rgba(240, 138, 75, 0.45)',
        borderRadius: 14,
        borderWidth: 1,
        marginTop: 12,
        padding: 10,
      }}
    >
      <Text
        style={{
          color: '#A04A12',
          fontSize: 11,
          fontWeight: '700',
        }}
      >
        Recovery Mode: +50% XP bonus active
      </Text>
    </View>
  );
}

export function FocusScoreCardContent({
  size,
  handlePress,
  onPress,
  animatedStyles,
  scoreColor,
  currentScore,
  currentBand,
  scoreChange,
  showTrend,
  identityStatement,
  scoreProgress,
  percentileRank,
  isInRecovery,
  successColor,
  errorColor,
}: FocusScoreCardContentProps) {
  const safeScore = Math.max(0, Math.min(100, scoreProgress * 100));
  return (
    <Pressable disabled={!onPress} onPress={handlePress}>
      <Animated.View style={[animatedStyles]}>
        <GlassCard
          padding={size === 'small' ? 14 : size === 'large' ? 22 : 18}
          radius={26}
          size={size === 'large' ? 'lg' : 'md'}
          variant="hero"
        >
          <View
            pointerEvents="none"
            style={{
              backgroundColor: 'rgba(95, 230, 197, 0.18)',
              borderRadius: 200,
              height: 200,
              position: 'absolute',
              right: -50,
              top: -50,
              width: 200,
            }}
          />
          <FocusScoreHeader
            currentBand={currentBand}
            currentScore={currentScore}
            errorColor={errorColor}
            scoreChange={scoreChange}
            scoreColor={scoreColor}
            showTrend={showTrend}
            size={size}
            successColor={successColor}
          />
          {isInRecovery ? <RecoveryBanner /> : null}
          <Text
            style={{
              color: vexLightGlass.text.primary,
              fontSize: 13,
              fontStyle: 'italic',
              marginTop: 12,
            }}
          >
            {identityStatement}
          </Text>
          {percentileRank ? (
            <Text
              style={{
                color: vexLightGlass.text.tertiary,
                fontSize: 11,
                fontWeight: '600',
                marginTop: 8,
              }}
            >
              Top {100 - percentileRank}% of users
            </Text>
          ) : null}
          <Box style={{ marginTop: 12 }}>
            <GlassProgressBar height={6} value={safeScore} variant="mint" />
          </Box>
          {currentBand && currentBand.max < 850 ? (
            <Text
              style={{
                color: vexLightGlass.text.tertiary,
                fontSize: 11,
                fontWeight: '600',
                marginTop: 4,
                textAlign: 'right',
              }}
            >
              {currentBand.max + 1 - currentScore} points to{' '}
              {getNextBandLabel(currentBand.label)}
            </Text>
          ) : null}
        </GlassCard>
      </Animated.View>
    </Pressable>
  );
}

export default FocusScoreCardContent;
