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
import { Text } from '../../../components/primitives/Text';
import { GlassCard } from '../../../components/glass/GlassCard';
import { Icon } from '../../../icons/components/Icon';
import { useHaptics } from '../../../utils/haptics';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { ExtendedRootStackParams } from '../../../navigation/types';
import { navigateToMainStackScreen } from '../../../navigation/navigation-helpers';
import { vexLightGlass } from '../../../theme/tokens/vex-light-glass';

import {
  isFeatureAvailableForNavigation,
  getFeatureAvailability,
} from '../../../features/liveops-config';
import { useFeatureAccess } from '../../../features/liveops-config';
import {
  useBossDisplayPolicy,
  isCombatAllowed,
  isBossVisibleAtSurface,
} from '../../../features/boss/display-policy';

interface MiniBossPreviewProps {
  userId: string;
}

export function MiniBossPreview({
  userId,
}: MiniBossPreviewProps): JSX.Element | null {
  const haptics = useHaptics();
  const navigation =
    useNavigation<NativeStackNavigationProp<ExtendedRootStackParams>>();
  const policy = useBossDisplayPolicy('home_indicator');
  const { features } = useFeatureAccess();

  void userId;
  if (!isBossVisibleAtSurface(policy)) {
    return null;
  }

  const bossAvailable = getFeatureAvailability(features.boss_tab);
  const canNavigate = isFeatureAvailableForNavigation(bossAvailable);
  const showCombat = isCombatAllowed(policy) && canNavigate;

  const handlePress = () => {
    if (!canNavigate) {return;}
    haptics.medium();
    navigateToMainStackScreen(navigation, 'Boss');
  };

  if (!showCombat) {
    return (
      <Pressable
        onPress={handlePress}
        accessibilityLabel="Focus momentum indicator"
        accessibilityRole="button"
        accessibilityHint="View your focus momentum progress"
      >
        <GlassCard variant="subtle" padding={12} radius={18}>
          <View style={{ flexDirection: 'row', alignItems: 'center', minHeight: 44 }}>
            <View
              style={{
                width: 36,
                height: 36,
                borderRadius: 12,
                backgroundColor: 'rgba(66, 207, 174, 0.15)',
                justifyContent: 'center',
                alignItems: 'center',
                marginRight: 12,
              }}
            >
              <Text style={{ fontSize: 14 }}>{'\u{1F4CA}'}</Text>
            </View>
            <Text
              style={{
                color: vexLightGlass.text.secondary,
                fontSize: 13,
                flex: 1,
              }}
            >
              Focus momentum building
            </Text>
            <Icon
              name="chevron-right"
              size={16}
              color={vexLightGlass.text.tertiary}
            />
          </View>
        </GlassCard>
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
        pressed && { opacity: 0.85 },
      ]}
    >
      <GlassCard variant="subtle" padding={12} radius={18}>
        <View style={{ flexDirection: 'row', alignItems: 'center', minHeight: 44 }}>
          <View
            style={{
              width: 36,
              height: 36,
              borderRadius: 12,
              backgroundColor: 'rgba(239,68,68,0.12)',
              justifyContent: 'center',
              alignItems: 'center',
              marginRight: 12,
            }}
          >
            <Text style={{ fontSize: 16 }}>{'\u{1F409}'}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text
              style={{
                color: vexLightGlass.text.primary,
                fontSize: 13,
                fontWeight: '700',
              }}
            >
              Boss active
            </Text>
            <Text
              style={{
                color: vexLightGlass.text.secondary,
                fontSize: 12,
              }}
            >
              Tap to view
            </Text>
          </View>
          <Icon name="chevron-right" size={16} color={vexLightGlass.text.tertiary} />
        </View>
      </GlassCard>
    </Pressable>
  );
}
