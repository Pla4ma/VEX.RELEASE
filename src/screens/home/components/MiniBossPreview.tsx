/**
 * MiniBossPreview
 *
 * Ambient boss preview on Home screen (shown when boss is active
 * but not the primary recommendation).
 *
 * @phase 1 - Foundation
 */

import React from 'react';
import { View, Pressable } from 'react-native';
import { useTheme } from '../../../theme';
import { Text } from '../../../components/primitives/Text';
import { Icon } from '../../../icons';
import { useActiveBoss } from '../../../features/boss/hooks';
import { useHaptics } from '../../../utils/haptics';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { ExtendedRootStackParams } from '../../../navigation/types';
import { launchColors } from '@theme/tokens/launch-colors';
import { getFeatureAvailability, isFeatureAvailableForNavigation } from '../../../features/liveops-config';
import { useFeatureAccess } from '../../../features/liveops-config';


interface MiniBossPreviewProps {
  userId: string;
}

export function MiniBossPreview({ userId }: MiniBossPreviewProps): JSX.Element | null {
  const { theme } = useTheme();
  const haptics = useHaptics();
  const navigation = useNavigation<NativeStackNavigationProp<ExtendedRootStackParams>>();
  const { features } = useFeatureAccess();
  const bossAvailability = getFeatureAvailability(features.boss_tab);
  const canQueryBoss = bossAvailability.canQuery && Boolean(userId);
  const { data: boss } = useActiveBoss(canQueryBoss ? userId : null);

  const containerStyle = {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    backgroundColor: theme.colors.background.secondary,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing[4],
    borderWidth: 1,
    borderColor: theme.colors.border.light,
  };

  const bossIconStyle = {
    width: 48,
    height: 48,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: launchColors.rgb_239_68_68_0_1,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    marginRight: theme.spacing[3],
  };

  const contentStyle = {
    flex: 1,
  };

  const bossNameStyle = {
    marginBottom: theme.spacing[1],
  };

  const healthBarStyle = {
    height: 6,
    backgroundColor: theme.colors.background.tertiary,
    borderRadius: theme.borderRadius.full,
    overflow: 'hidden' as const,
    marginBottom: theme.spacing[1],
  };

  const healthFillStyle = {
    height: '100%' as const,
    backgroundColor: theme.colors.error[500],
    borderRadius: theme.borderRadius.full,
  };

  const healthTextStyle = {
    opacity: 0.8,
  };

  const actionIconStyle = {
    marginLeft: theme.spacing[2],
  };

  if (!boss || boss.status !== 'ACTIVE') {
    return null;
  }

  const healthPercent = Math.round((boss.healthRemaining / boss.maxHealth) * 100);

  const handlePress = () => {
    if (!isFeatureAvailableForNavigation(bossAvailability)) {
      return;
    }
    haptics.medium();
    navigation.navigate('Boss');
  };

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [
        containerStyle,
        pressed && { opacity: 0.8 },
      ]}
      android_ripple={{ color: theme.colors.error.light }}
    >
      <View style={bossIconStyle}>
        <Icon name="zap" size={24} color={theme.colors.error[500]} />
      </View>

      <View style={contentStyle}>
        <Text variant="body" color={theme.colors.text.primary} style={bossNameStyle}>
          {boss.bossName}
        </Text>
        <View style={healthBarStyle}>
          <View style={[healthFillStyle, { width: `${healthPercent}%` }]} />
        </View>
        <Text variant="caption" color={theme.colors.text.secondary} style={healthTextStyle}>
          {healthPercent}% health remaining
        </Text>
      </View>

      <Icon
        name="chevron-right"
        size={20}
        color={theme.colors.text.tertiary}
        style={actionIconStyle}
      />
    </Pressable>
  );
}
