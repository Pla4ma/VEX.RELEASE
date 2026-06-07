import React from 'react';
import { Pressable, View } from 'react-native';
import { Text } from '../../../components/primitives/Text';
import { GlassCard } from '../../../components/glass/GlassCard';
import { LiquidButton } from '../../../components/glass/LiquidButton';
import { getMinTouchTargetStyle } from '../../../utils/touchTarget';
import { buttonTap } from '../../../utils/haptics';
import type { CoachPresence } from '../schemas';
import { vexLightGlass } from '../../../theme/tokens/vex-light-glass';

interface CoachPresenceCardProps {
  presence: CoachPresence;
  onAction: () => void;
  onPress?: () => void;
}

export function CoachPresenceCard({
  presence,
  onAction,
  onPress,
}: CoachPresenceCardProps): JSX.Element {
  const reactionColor = getReactionColor(
    presence.visualCompanionState.reaction,
  );

  return (
    <Pressable
      onPress={() => {
        buttonTap();
        (onPress ?? onAction)();
      }}
      accessibilityLabel="Coach presence"
      accessibilityRole="button"
      accessibilityHint="Opens the coach presence action"
    >
      <GlassCard variant="subtle">
        <View style={{ gap: 12 }}>
          <View
            style={{
              alignItems: 'center',
              flexDirection: 'row',
              gap: 12,
            }}
          >
            {/* Visual reaction indicator - small signal orb */}
            <View
              style={{
                alignItems: 'center',
                backgroundColor: `${reactionColor}18`,
                borderRadius: 24,
                height: 48,
                justifyContent: 'center',
                width: 48,
              }}
            >
              <View
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: 6,
                  backgroundColor: reactionColor,
                }}
              />
            </View>
            <View style={{ flex: 1, gap: 4 }}>
              <Text
                style={{
                  color: vexLightGlass.text.secondary,
                  fontSize: 13,
                  fontWeight: '600',
                  letterSpacing: 0.5,
                  textTransform: 'uppercase',
                }}
              >
                Coach Presence
              </Text>
              <Text
                style={{
                  color: vexLightGlass.text.primary,
                  fontSize: 15,
                  fontWeight: '700',
                  letterSpacing: -0.2,
                  lineHeight: 22,
                }}
              >
                {presence.message}
              </Text>
            </View>
          </View>

          <Text
            style={{
              color: vexLightGlass.text.secondary,
              fontSize: 13,
              lineHeight: 18,
            }}
          >
            {presence.progressReaction}
          </Text>

          <LiquidButton
            label={presence.nextAction.label}
            onPress={() => {
              buttonTap();
              onAction();
            }}
            accessibilityLabel={presence.nextAction.label}
            accessibilityHint={presence.nextAction.reason}
            size="sm"
          />
        </View>
      </GlassCard>
    </Pressable>
  );
}

function getReactionColor(
  reaction: CoachPresence['visualCompanionState']['reaction'],
): string {
  switch (reaction) {
    case 'celebrating':
      return vexLightGlass.semantic.success;
    case 'focused':
      return '#54AEEA';
    case 'recovering':
      return vexLightGlass.semantic.warning;
    case 'ready':
      return '#8B5CF6';
    default:
      return vexLightGlass.text.disabled;
  }
}

export default CoachPresenceCard;
