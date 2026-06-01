import React from 'react';
import { Pressable, View } from 'react-native';
import { Box, Card, Text } from '../../../components/primitives';
import { Icon } from '../../../icons';
import { useTheme } from '../../../theme';
import { buttonTap } from '../../../utils/haptics';
import { getMasteryRankDisplay, type MasteryRank } from '../types';
import {
  FEATURE_INFO,
  FEATURE_REQUIREMENTS,
  getPointsToUnlock,
  type UnlockableFeature,
} from './mastery-unlock-gate-data';

interface LockedFeaturePreviewProps {
  feature: UnlockableFeature;
  userRank: MasteryRank;
  userPoints: number;
  onNavigateToMastery?: () => void;
}

export function LockedFeaturePreview({
  feature,
  userRank,
  userPoints,
  onNavigateToMastery,
}: LockedFeaturePreviewProps): JSX.Element {
  const { theme } = useTheme();
  const featureInfo = FEATURE_INFO[feature];
  const requiredRank = FEATURE_REQUIREMENTS[feature];
  const rankDisplay = getMasteryRankDisplay(requiredRank);
  const pointsNeeded = getPointsToUnlock(feature, userPoints);
  return (
    <Pressable
      onPress={() => {
        buttonTap();
        onNavigateToMastery?.();
      }}
      accessibilityLabel={`${featureInfo.name} is locked. Requires ${rankDisplay.title} rank.`}
      accessibilityRole="button"
      accessibilityHint="Tap to view mastery progression"
    >
      <Card
        size="sm"
        style={{
          backgroundColor: theme.colors.background.secondary,
          opacity: 0.8,
        }}
      >
        <Box flexDirection="row" alignItems="center" gap="md">
          <View
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: `${rankDisplay.color}20`,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icon name="lock" size={18} color={rankDisplay.color} />
          </View>

          <View style={{ flex: 1 }}>
            <Text variant="body" color="text.primary" fontWeight="600">
              {featureInfo.name}
            </Text>
            <Text variant="caption" color="text.tertiary">
              Locked • {pointsNeeded} MP to unlock
            </Text>
          </View>

          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 4,
              paddingHorizontal: theme.spacing[2],
              paddingVertical: theme.spacing[1],
              backgroundColor: `${rankDisplay.color}15`,
              borderRadius: 8,
            }}
          >
            <Text fontSize={12}>{rankDisplay.icon}</Text>
            <Text variant="caption" color={rankDisplay.color}>
              {rankDisplay.title}
            </Text>
          </View>
        </Box>
      </Card>
    </Pressable>
  );
}
