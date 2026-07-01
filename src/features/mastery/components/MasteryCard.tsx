import React from 'react';
import { View } from 'react-native';
import { Button } from '../../../components/primitives/Button';
import { Text } from '../../../components/primitives/Text';
import {
  getPremiumCardStyle,
  withAlpha,
} from '../../../components/premiumStyles';
import { useTheme } from '../../../theme/ThemeContext';
import { useMasteryActions } from '../hooks';
import type { MasteryState } from '../types';
import { MasteryRankBadge } from './MasteryRankBadge';
import { TechniqueBar } from './TechniqueBar';
import { TECHNIQUES, difficultyColors } from './mastery-card-constants';
import { Text as VexText } from '../../../components/primitives/Text';

type Props = {
  userId: string;
  state: MasteryState;
  onStateChange?: (state: MasteryState) => void;
};

export function MasteryCard({
  userId,
  state,
  onStateChange,
}: Props): React.ReactNode {
  const { theme } = useTheme();
  const { claimChallenge, getMasteryState } = useMasteryActions();

  // Use prop directly instead of mirroring into state via useEffect

  const handleClaim = (challengeId: string) => {
    const updatedState = claimChallenge(userId, challengeId);
    if (!updatedState) { return; }
    onStateChange?.(updatedState);
  };

  return (
    <View
      style={{
        borderWidth: 1,
        borderColor: theme.colors.border.light,
        backgroundColor: theme.colors.background.secondary,
        padding: theme.spacing[4],
        gap: theme.spacing[4],
        ...getPremiumCardStyle('medium'),
      }}
    >
      <View style={{ gap: theme.spacing[2] }}>
        <MasteryRankBadge
          rank={state.rank}
          totalPoints={state.totalMasteryPoints}
          size="md"
        />
        <Text variant="bodySmall" color={theme.colors.text.secondary}>
          {state.totalMasteryPoints} mastery points
        </Text>
      </View>

      <View style={{ gap: theme.spacing[3] }}>
        {TECHNIQUES.map((item) => (
          <TechniqueBar
            key={item.key}
            label={item.label}
            value={state.techniques[item.key]}
            color={
              item.key === 'durationMastery'
                ? theme.colors.primary[500]
                : item.color
            }
          />
        ))}
      </View>

      <View style={{ gap: theme.spacing[3] }}>
        <Text variant="h4" color={theme.colors.text.primary}>
          Active Challenges
        </Text>
        {state.activeChallenges.slice(0, 3).map((challenge) => {
          const badgeColor = difficultyColors[challenge.difficulty];
          const progress =
            challenge.target > 0
              ? Math.max(0, Math.min(1, challenge.current / challenge.target))
              : 0;
          return (
            <View
              key={challenge.id}
              style={{
                borderWidth: 1,
                borderColor: theme.colors.border.light,
                borderRadius: 16,
                padding: theme.spacing[3],
                gap: theme.spacing[2],
                backgroundColor: theme.colors.background.primary,
              }}
            >
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  gap: theme.spacing[2],
                }}
              >
                <View style={{ flex: 1, gap: theme.spacing[1] }}>
                  <Text
                    variant="body"
                    color={theme.colors.text.primary}
                    fontWeight="700"
                  >
                    {challenge.title}
                  </Text>
                  <Text variant="bodySmall" color={theme.colors.text.secondary}>
                    {challenge.description}
                  </Text>
                </View>
                <View
                  style={{
                    borderRadius: 999,
                    paddingHorizontal: theme.spacing[2],
                    paddingVertical: theme.spacing[1],
                    backgroundColor: withAlpha(badgeColor, 0.14),
                  }}
                >
                  <Text variant="caption" color={badgeColor}>
                    {challenge.difficulty}
                  </Text>
                </View>
              </View>
              <View style={{ gap: theme.spacing[1] }}>
                <View
                  style={{
                    height: 6,
                    borderRadius: 3,
                    overflow: 'hidden',
                    backgroundColor: theme.colors.background.tertiary,
                  }}
                >
                  <View
                    style={{
                      width: `${progress * 100}%`,
                      height: 6,
                      backgroundColor: badgeColor,
                    }}
                  />
                </View>
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <Text variant="caption" color={theme.colors.text.secondary}>
                    {challenge.current}/{challenge.target} {challenge.unit}
                  </Text>
                  <Text variant="caption" color={theme.colors.primary[400]}>
                    +{challenge.masteryPoints} mastery
                  </Text>
                </View>
              </View>
              {challenge.status === 'COMPLETED' ? (
                <Button
                  size="sm"
                  variant="outline"
                  onPress={() => handleClaim(challenge.id)}
                  accessibilityLabel="Claim reward"
                  accessibilityRole="button"
                  accessibilityHint="Double tap to activate"
                >
                  <VexText>Claim</VexText>
                </Button>
              ) : null}
            </View>
          );
        })}
      </View>
    </View>
  );
}
