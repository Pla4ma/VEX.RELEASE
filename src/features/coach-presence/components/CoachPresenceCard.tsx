import React from 'react';
import { Pressable, View } from 'react-native';
import { Text } from '../../../components/primitives/Text';
import { useTheme } from '../../../theme';
import { getMinTouchTargetStyle } from '../../../utils/touchTarget';
import { buttonTap } from '../../../utils/haptics';
import type { CoachPresence } from '../schemas';
import { lightColors } from '@/theme/tokens/colors';

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
  const { theme } = useTheme();

  const reactionColor = getReactionColor(
    presence.visualCompanionState.reaction,
    theme.colors.semantic,
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
      <View
        style={{
          backgroundColor: theme.colors.background.elevated,
          borderColor: theme.colors.border.light,
          borderRadius: theme.spacing[3],
          borderWidth: 1,
          gap: theme.spacing[3],
          padding: theme.spacing[4],
        }}
      >
        <View
          style={{
            alignItems: 'center',
            flexDirection: 'row',
            gap: theme.spacing[3],
          }}
        >
          {/* Visual reaction indicator - small signal orb */}
          <View
            style={{
              alignItems: 'center',
              backgroundColor: `${reactionColor}18`,
              borderRadius: theme.spacing[6],
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
          <View style={{ flex: 1, gap: theme.spacing[1] }}>
            <Text variant="label" color="text.secondary">
              Coach Presence
            </Text>
            <Text
              variant="body"
              color="text.primary"
              style={{ fontWeight: '700' }}
            >
              {presence.message}
            </Text>
          </View>
        </View>

        <Text variant="caption" color="text.secondary">
          {presence.progressReaction}
        </Text>

        <Pressable
          onPress={() => {
            buttonTap();
            onAction();
          }}
          accessibilityLabel={presence.nextAction.label}
          accessibilityRole="button"
          accessibilityHint={presence.nextAction.reason}
        >
          <View
            style={{
              ...getMinTouchTargetStyle(),
              alignItems: 'center',
              backgroundColor: theme.colors.primary[500],
              borderRadius: theme.spacing[2],
              justifyContent: 'center',
              paddingHorizontal: theme.spacing[4],
            }}
          >
            <Text variant="label" color={theme.colors.text.inverse}>
              {presence.nextAction.label}
            </Text>
          </View>
        </Pressable>
      </View>
    </Pressable>
  );
}

function getReactionColor(
  reaction: CoachPresence['visualCompanionState']['reaction'],
  semantic: Record<string, string>,
): string {
  switch (reaction) {
    case 'celebrating':
      return semantic.success ?? lightColors.semantic.success;
    case 'focused':
      return semantic.accent ?? lightColors.accent.blue;
    case 'recovering':
      return semantic.warning ?? lightColors.semantic.warning;
    case 'ready':
      return semantic.primary ?? lightColors.accent.purple;
    default:
      return semantic.textMuted ?? lightColors.text.muted;
  }
}

export default CoachPresenceCard;
