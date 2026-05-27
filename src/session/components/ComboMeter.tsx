import React from "react";
import { View } from "react-native";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import { useTheme } from "../../theme/ThemeContext";
import { Text } from "../../components";
import type { ComboMeterProps } from "./combo-meter-types";
import { COMBO_TIERS, getCurrentTier, getTierProgress, formatCombo } from "./combo-meter-helpers";
import { useComboAnimations } from "./useComboAnimations";
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
  milestoneOverlayStyle,
  milestoneCardStyle,
  milestoneEmojiStyle,
  milestoneTextStyle,
  comboBrokenOverlayStyle,
  comboBrokenCardStyle,
  comboBrokenEmojiStyle,
  comboBrokenTextStyle,
  comboBrokenSubtextStyle,
  warningOverlayStyle,
  warningTextStyle,
} from "./ComboMeter.styles";

export type { ComboMeterProps } from "./combo-meter-types";
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
          <Text style={fireEmojiStyle}>🔥</Text>
          {comboMinutes >= 20 && <Text style={fireEmojiStyle}>🔥</Text>}
          {comboMinutes >= 30 && <Text style={fireEmojiStyle}>🔥</Text>}
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
            {nextTier.minCombo - comboMinutes} min to {nextTier.emoji}{" "}
            {nextTier.name} ({nextTier.multiplier}x)
          </Text>
        )}

        {!nextTier && comboMinutes >= 30 && (
          <Text
            variant="caption"
            style={[maxTierTextStyle, { color: tier.color }]}
          >
            💎 DIAMOND TIER MAXED! Keep going! 💎
          </Text>
        )}
      </View>

      {showMilestone && (
        <Animated.View
          entering={FadeIn.duration(300)}
          exiting={FadeOut.duration(300)}
          style={milestoneOverlayStyle}
        >
          <View
            style={[
              milestoneCardStyle,
              { backgroundColor: theme.colors.background.elevated },
            ]}
          >
            <Text style={milestoneEmojiStyle}>🎉</Text>
            <Text variant="h3" style={milestoneTextStyle}>
              {milestoneMessage}
            </Text>
            <Text variant="caption" color="secondary">
              {tier.multiplier}x XP Multiplier Active!
            </Text>
          </View>
        </Animated.View>
      )}

      {showComboBroken && (
        <Animated.View
          entering={FadeIn.duration(200)}
          exiting={FadeOut.duration(200)}
          style={comboBrokenOverlayStyle}
        >
          <View
            style={[
              comboBrokenCardStyle,
              { backgroundColor: theme.colors.error.DEFAULT },
            ]}
          >
            <Text style={comboBrokenEmojiStyle}>💔</Text>
            <Text variant="h4" style={comboBrokenTextStyle}>
              Combo Broken!
            </Text>
            <Text variant="caption" style={comboBrokenSubtextStyle}>
              You had a {previousComboRef.current} minute streak
            </Text>
          </View>
        </Animated.View>
      )}
      {(isPaused || isIdle) && comboMinutes > 0 && (
        <View
          style={[
            warningOverlayStyle,
            { backgroundColor: theme.colors.warning.DEFAULT + "20" },
          ]}
        >
          <Text variant="caption" color="warning" style={warningTextStyle}>
            {isPaused
              ? "⏸️ PAUSED - Combo at risk!"
              : "⚠️ IDLE - Move to keep combo!"}
          </Text>
        </View>
      )}
    </Animated.View>
  );
}
