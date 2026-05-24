/**
 * MiniBossPreview
 *
 * Ambient boss preview on Home screen — gated by boss display policy.
 * subtle: tiny momentum indicator only.
 * standard/full: boss card with health bar.
 *
 * @phase 7 — adaptive motivation layer
 */

import React from 'react';
import { View, Pressable } from 'react-native';
import { useTheme } from '../../../theme';
import { Text } from '../../../components/primitives/Text';
import { Icon } from '../../../icons';
import { useHaptics } from '../../../utils/haptics';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { ExtendedRootStackParams } from '../../../navigation/types';
import { launchColors } from '@theme/tokens/launch-colors';
import { isFeatureAvailableForNavigation, getFeatureAvailability } from '../../../features/liveops-config';
import { useFeatureAccess } from '../../../features/liveops-config';
import { useBossDisplayPolicy, isCombatAllowed, isBossVisibleAtSurface } from '../../../features/boss/display-policy';

interface MiniBossPreviewProps {
  userId: string;
}

export function MiniBossPreview({ userId }: MiniBossPreviewProps): JSX.Element | null {
  const { theme } = useTheme();
  const haptics = useHaptics();
  const navigation = useNavigation<NativeStackNavigationProp<ExtendedRootStackParams>>();
  const policy = useBossDisplayPolicy('home_indicator');
  const { features } = useFeatureAccess();

  if (!isBossVisibleAtSurface(policy)) {
    return null;
  }

  const bossAvailable = getFeatureAvailability(features.boss_tab);
  const canNavigate = isFeatureAvailableForNavigation(bossAvailable);
  const showCombat = isCombatAllowed(policy) && canNavigate;

  const handlePress = () => {
    if (!canNavigate) return;
    haptics.medium();
    navigation.navigate('Boss');
  };

  if (!showCombat) {
    return (
      <Pressable
        onPress={handlePress}
        accessibilityLabel="Focus momentum indicator"
        accessibilityRole="button"
        accessibilityHint="View your focus momentum progress"
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: theme.colors.background.secondary,
          borderRadius: theme.borderRadius.xl,
          padding: theme.spacing[3],
          borderWidth: 1,
          borderColor: theme.colors.border.light,
          minHeight: 44,
        }}
      >
        <View
          style={{
            width: 32,
            height: 32,
            borderRadius: theme.borderRadius.lg,
            backgroundColor: `${theme.colors.primary[500]}20`,
            justifyContent: 'center',
            alignItems: 'center',
            marginRight: theme.spacing[2],
          }}
        >
          <Text fontSize={14}>{'\u{1F4CA}'}</Text>
        </View>
        <Text variant="caption" color={theme.colors.text.secondary}>
          Focus momentum building
        </Text>
        <Icon name="chevron-right" size={16} color={theme.colors.text.tertiary} style={{ marginLeft: theme.spacing[2] }} />
      </Pressable>
    );
  }

  return (
    <Pressable
      onPress={handlePress}
      accessibilityLabel="Boss preview"
      accessibilityRole="button"
      accessibilityHint="View current boss progress"
      style={({ pressed }) => [
        {
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: theme.colors.background.secondary,
          borderRadius: theme.borderRadius.xl,
          padding: theme.spacing[3],
          borderWidth: 1,
          borderColor: theme.colors.border.light,
          minHeight: 44,
        },
        pressed && { opacity: 0.8 },
      ]}
    >
      <View
        style={{
          width: 36,
          height: 36,
          borderRadius: theme.borderRadius.lg,
          backgroundColor: launchColors.rgb_239_68_68_0_1,
          justifyContent: 'center',
          alignItems: 'center',
          marginRight: theme.spacing[2],
        }}
      >
        <Text fontSize={16}>{'\u{1F409}'}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text variant="caption" color={theme.colors.text.primary} fontWeight="600">
          Boss active
        </Text>
        <Text variant="caption" color={theme.colors.text.secondary}>
          Tap to view
        </Text>
      </View>
      <Icon name="chevron-right" size={16} color={theme.colors.text.tertiary} />
    </Pressable>
  );
}
