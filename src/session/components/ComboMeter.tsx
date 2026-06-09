import React from 'react';
import { View } from 'react-native';
import Animated from 'react-native-reanimated';

import { useTheme } from '../../theme/ThemeContext';
import { Text } from '../../components';
import type { ComboMeterProps } from './combo-meter-types';
import {
  COMBO_TIERS,
  getCurrentTier,
  getTierProgress,
  formatCombo,
} from './combo-meter-helpers';
import { useComboAnimations } from './useComboAnimations';
import {
  containerStyle,
  glowStyle,
  fireContainerStyle,
  fireEmojiStyle,
  mainContainerStyle,
  headerRowStyle,
  tierBadgeStyle,
  tierEmojiStyle,
  comboInfoStyle,
  comboTextStyle,
  multiplierBadgeStyle,
  multiplierTextStyle,
  progressContainerStyle,
  progressBarStyle,
  nextTierTextStyle,
  maxTierTextStyle,
} from './ComboMeter.styles';
import { ComboMeterOverlays } from './ComboMeterOverlays';

export type { ComboMeterProps } from './combo-meter-types';
export function ComboMeter({
  comboMinutes,
  isPaused,
  isIdle,
  onMilestoneReached,
  onComboBroken,
}: ComboMeterProps): JSX.Element {
  const { theme } = useTheme();
  const tier = getCurrentTier(comboMinutes);
  const tierProgress = getTierProgress(comboMinutes);
  const nextTier = COMBO_TIERS.find((t) => t.minCombo > comboMinutes);

  const {
    progressStyle,
    glowAnimStyle,
    animatedContainerStyle,
    fireStyle,
    showMilestone,
    milestoneMessage,
    showComboBroken,
    previousComboRef,
  } = useComboAnimations({
    comboMinutes,
    isPaused,
    isIdle,
    tier,
    tierProgress,
    onMilestoneReached,
    onComboBroken,
  });

  return (
    <Animated.View style={[containerStyle, animatedContainerStyle]}>
      <Animated.View
        style={[glowStyle, glowAnimStyle, { backgroundColor: tier.color }]}
      />

      {comboMinutes >= 10 && (
        <Animated.View style={[fireContainerStyle, fireStyle]}>
          <Text style={fireEmojiStyle} />
          {comboMinutes >= 20 && <Text style={fireEmojiStyle} />}
          {comboMinutes >= 30 && <Text style={fireEmojiStyle} />}
        </Animated.View>
      )}

      <View
        style={[
          mainContainerStyle,
          { backgroundColor: theme.colors.background.elevated },
        ]}
      >
        <View style={headerRowStyle}>
          <View style={tierBadgeStyle}>
            <Text style={[tierEmojiStyle, { color: tier.color }]}>
              {tier.emoji}
            </Text>
          </View>

          <View style={comboInfoStyle}>
            <Text variant="h4" style={comboTextStyle}>
              {formatCombo(comboMinutes)} Combo
            </Text>
            <Text variant="caption" color="secondary">
              {tier.multiplier}x XP • {tier.name} Tier
            </Text>
          </View>

          <View style={[multiplierBadgeStyle, { backgroundColor: tier.color }]}>
            <Text style={multiplierTextStyle}>{tier.multiplier}x</Text>
          </View>
        </View>

        <View
          style={[
            progressContainerStyle,
            { backgroundColor: theme.colors.background.secondary },
          ]}
        >
          <Animated.View style={[progressBarStyle, progressStyle]} />
        </View>

        {nextTier && (
          <Text variant="caption" color="secondary" style={nextTierTextStyle}>
            {nextTier.minCombo - comboMinutes} min to {nextTier.emoji}{' '}
            {nextTier.name} ({nextTier.multiplier}x)
          </Text>
        )}

        {!nextTier && comboMinutes >= 30 && (
          <Text
            variant="caption"
            style={[maxTierTextStyle, { color: tier.color }]}
          >
            Diamond tier maxed. Keep going.
          </Text>
        )}
      </View>

      <ComboMeterOverlays
        showMilestone={showMilestone}
        milestoneMessage={milestoneMessage}
        multiplier={tier.multiplier}
        tierColor={tier.color}
        elevatedBg={theme.colors.background.elevated}
        showComboBroken={showComboBroken}
        previousCombo={previousComboRef.current}
        errorBg={theme.colors.error.DEFAULT}
        isPaused={isPaused}
        isIdle={isIdle}
        comboMinutes={comboMinutes}
        warningBg={theme.colors.warning.DEFAULT + '20'}
      />
    </Animated.View>
  );
}
