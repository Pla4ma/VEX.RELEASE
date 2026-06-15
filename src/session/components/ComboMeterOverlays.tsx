import React from 'react';
import { View } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { Text } from '../../components/primitives/Text';
import {
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
} from './ComboMeter.styles';

interface ComboOverlayProps {
  showMilestone: boolean;
  milestoneMessage: string;
  multiplier: number;
  tierColor: string;
  elevatedBg: string;
  showComboBroken: boolean;
  previousCombo: number;
  errorBg: string;
  isPaused: boolean;
  isIdle: boolean;
  comboMinutes: number;
  warningBg: string;
}

export function ComboMeterOverlays({
  showMilestone,
  milestoneMessage,
  multiplier,
  tierColor: _tierColor,
  elevatedBg,
  showComboBroken,
  previousCombo,
  errorBg,
  isPaused,
  isIdle,
  comboMinutes,
  warningBg,
}: ComboOverlayProps): React.ReactNode {
  return (
    <>
      {showMilestone && (
        <Animated.View
          entering={FadeIn.duration(300)}
          exiting={FadeOut.duration(300)}
          style={milestoneOverlayStyle}
        >
          <View
            style={[
              milestoneCardStyle,
              { backgroundColor: elevatedBg },
            ]}
          >
            <Text style={milestoneEmojiStyle}>🎉</Text>
            <Text variant="h3" style={milestoneTextStyle}>
              {milestoneMessage}
            </Text>
            <Text variant="caption" color="secondary">
              {multiplier}x XP Multiplier Active!
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
              { backgroundColor: errorBg },
            ]}
          >
            <Text style={comboBrokenEmojiStyle}>💔</Text>
            <Text variant="h4" style={comboBrokenTextStyle}>
              Combo Broken!
            </Text>
            <Text variant="caption" style={comboBrokenSubtextStyle}>
              You had a {previousCombo} minute streak
            </Text>
          </View>
        </Animated.View>
      )}
      {(isPaused || isIdle) && comboMinutes > 0 && (
        <View
          style={[
            warningOverlayStyle,
            { backgroundColor: warningBg },
          ]}
        >
          <Text variant="caption" color="warning" style={warningTextStyle}>
            {isPaused
              ? '⏸️ PAUSED - Combo at risk!'
              : '⚠️ IDLE - Move to keep combo!'}
          </Text>
        </View>
      )}
    </>
  );
}
