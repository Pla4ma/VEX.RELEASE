import React from 'react';
import { Pressable, View } from 'react-native';
import { Text } from '../../../components/primitives/Text';
import { GlassCard } from '../../../components/glass/GlassCard';
import { GlassIconOrb } from '../../../components/glass/GlassIconOrb';
import { LiquidButton } from '../../../components/glass/LiquidButton';
import { buttonTap } from '../../../utils/haptics';
import type { CoachPresence } from '../schemas';
import { lightColors } from '../../../theme/tokens/primary-palette';
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
}: CoachPresenceCardProps): React.ReactNode {
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
      <GlassCard padding={14} radius={22} variant="subtle">
        <View style={{ gap: 10 }}>
          <View
            style={{
              alignItems: 'center',
              flexDirection: 'row',
              gap: 12,
            }}
          >
            <GlassIconOrb size={46} variant="mint">
              <View
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: 6,
                  backgroundColor: reactionColor,
                }}
              />
            </GlassIconOrb>
            <View style={{ flex: 1, gap: 4 }}>
              <Text
                style={{
                  color: vexLightGlass.text.secondary,
                  fontSize: 12,
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
                  fontSize: 14,
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
              fontSize: 12,
              lineHeight: 17,
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
      return vexLightGlass.semantic.info;
    case 'recovering':
      return vexLightGlass.semantic.warning;
    case 'ready':
      return lightColors.semantic.brandViolet;
    default:
      return vexLightGlass.text.disabled;
  }
}

export default CoachPresenceCard;
