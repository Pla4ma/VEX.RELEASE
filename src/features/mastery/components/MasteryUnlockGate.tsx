import React from 'react';
import { View } from 'react-native';
import { Card, Text } from '../../../components/primitives';
import { Button } from '../../../components/primitives/Button';
import { Icon } from '../../../icons';
import { useTheme } from '../../../theme';
import { getMasteryRankDisplay, type MasteryRank } from '../types';
import {
  FEATURE_INFO,
  FEATURE_REQUIREMENTS,
  getPointsToUnlock,
  isFeatureUnlocked,
  type UnlockableFeature,
} from './mastery-unlock-gate-data';
import { Text as VexText } from '../../../components/primitives/Text';

interface MasteryUnlockGateProps {
  userRank: MasteryRank;
  userPoints: number;
  feature: UnlockableFeature;
  children: React.ReactNode;
  onNavigateToMastery?: () => void;
}

export function MasteryUnlockGate({
  userRank,
  userPoints,
  feature,
  children,
  onNavigateToMastery,
}: MasteryUnlockGateProps): React.ReactNode {
  const { theme } = useTheme();
  const isUnlocked = isFeatureUnlocked(userRank, feature);
  const featureInfo = FEATURE_INFO[feature];
  const requiredRank = FEATURE_REQUIREMENTS[feature];
  const rankDisplay = getMasteryRankDisplay(requiredRank);
  const pointsNeeded = getPointsToUnlock(feature, userPoints);
  if (isUnlocked) {
    return <>{children}</>;
  }
  return (
    <Card
      size="md"
      style={{
        backgroundColor: theme.colors.background.secondary,
        borderWidth: 1,
        borderColor: `${rankDisplay.color}40`,
        borderStyle: 'dashed',
      }}
    >
      <View style={{ gap: theme.spacing[3], alignItems: 'center' }}>
        <View
          style={{
            width: 48,
            height: 48,
            borderRadius: 24,
            backgroundColor: `${rankDisplay.color}20`,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Icon name="lock" size={24} color={rankDisplay.color} />
        </View>

        <View style={{ alignItems: 'center' }}>
          <Text variant="h4" color="text.primary" textAlign="center">
            {featureInfo.name} Locked
          </Text>
          <Text
            variant="bodySmall"
            color="text.secondary"
            textAlign="center"
            style={{ marginTop: theme.spacing[1] }}
          >
            {featureInfo.description}
          </Text>
        </View>

        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: theme.spacing[2],
            paddingHorizontal: theme.spacing[3],
            paddingVertical: theme.spacing[2],
            backgroundColor: `${rankDisplay.color}15`,
            borderRadius: 12,
          }}
        >
          <Text fontSize={20}>{rankDisplay.icon}</Text>
          <View>
            <Text variant="caption" color="text.secondary">
              Required Rank
            </Text>
            <Text
              variant="bodySmall"
              color={rankDisplay.color}
              fontWeight="600"
            >
              {rankDisplay.title}
            </Text>
          </View>
        </View>

        {pointsNeeded > 0 && (
          <Text variant="caption" color="text.tertiary">
            {pointsNeeded} more mastery points needed
          </Text>
        )}

        {onNavigateToMastery && (
          <Button
            size="sm"
            variant="outline"
            onPress={onNavigateToMastery}
            accessibilityLabel="View mastery progression"
            accessibilityRole="button"
            accessibilityHint="Opens the mastery screen to track your progress"
          >
            <VexText>View Mastery Progress</VexText>
          </Button>
        )}

        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: theme.spacing[1],
            padding: theme.spacing[2],
            backgroundColor: theme.colors.background.tertiary,
            borderRadius: 8,
          }}
        >
          <Icon
            name="sparkles"
            size={14}
            color={theme.colors.success.DEFAULT}
          />
          <Text variant="caption" color="success.DEFAULT">
            Unlock benefit: {featureInfo.benefit}
          </Text>
        </View>
      </View>
    </Card>
  );
}
