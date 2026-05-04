/**
 * Neuroplasticity Readiness Card
 *
 * Shows cognitive readiness indicator during session setup.
 */

import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { Text } from '@/components/primitives/Text';
import { useTheme } from '@/theme';
import { useNeuroplasticity } from '../hooks';

interface NeuroplasticityReadinessCardProps {
  userId: string | null;
}

export const NeuroplasticityReadinessCard: React.FC<NeuroplasticityReadinessCardProps> = ({
  userId,
}) => {
  const { theme } = useTheme();
  const npt = useNeuroplasticity(userId);

  if (!userId) return null;

  if (npt.loadingState === 'loading') {
    return (
      <View
        style={{
          backgroundColor: theme.colors.background.secondary,
          borderRadius: theme.borderRadius.lg,
          padding: theme.spacing[3],
          marginTop: theme.spacing[3],
        }}
      >
        <ActivityIndicator size="small" color={theme.colors.primary[500]} />
      </View>
    );
  }

  if (npt.loadingState === 'error' || !npt.profile) {
    return null;
  }

  const { profile, weakestDomain, strongestDomain } = npt;
  const recommendedDomain = weakestDomain || strongestDomain;

  return (
    <View
      style={{
        backgroundColor: theme.colors.background.secondary,
        borderRadius: theme.borderRadius.lg,
        padding: theme.spacing[3],
        marginTop: theme.spacing[3],
        gap: theme.spacing[2],
      }}
    >
      <Text
        variant="label"
        color={theme.colors.text.secondary}
      >
        Cognitive Readiness
      </Text>
      <Text
        variant="bodySmall"
        color={theme.colors.text.primary}
      >
        {recommendedDomain
          ? `Train ${recommendedDomain.replace(/_/g, ' ')} today`
          : 'Your brain is ready to focus'}
      </Text>
      <View style={{ flexDirection: 'row', gap: theme.spacing[2], marginTop: theme.spacing[1] }}>
        <View
          style={{
            backgroundColor: `${theme.colors.primary[500]}20`,
            paddingHorizontal: theme.spacing[2],
            paddingVertical: theme.spacing[1],
            borderRadius: theme.borderRadius.md,
          }}
        >
          <Text variant="caption" color={theme.colors.primary[500]}>
            Level {npt.overallLevel}
          </Text>
        </View>
        {npt.currentStreak > 0 && (
          <View
            style={{
              backgroundColor: `${theme.colors.success.DEFAULT}20`,
              paddingHorizontal: theme.spacing[2],
              paddingVertical: theme.spacing[1],
              borderRadius: theme.borderRadius.md,
            }}
          >
            <Text variant="caption" color={theme.colors.success.DEFAULT}>
              {npt.currentStreak} day streak
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

export default NeuroplasticityReadinessCard;
